import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MasterProfile } from "../mlm/entities/master-profile.entity";
import { User } from "../users/entities/user.entity";

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface NearestMasterResult {
  master: User;
  distance: number; // в километрах
  masterProfile: MasterProfile;
}

@Injectable()
export class GeolocationService {
  constructor(
    @InjectRepository(MasterProfile)
    private masterProfileRepository: Repository<MasterProfile>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  /**
   * Вычисляет расстояние между двумя точками по формуле Haversine (в километрах)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // радиус Земли в километрах
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Преобразует градусы в радианы
   */
  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Находит ближайших мастеров к указанным координатам
   */
  async findNearestMasters(
    latitude: number,
    longitude: number,
    radiusKm: number = 50,
    limit: number = 10,
    specialization?: string
  ): Promise<NearestMasterResult[]> {
    // Получаем всех доступных мастеров с координатами
    const queryBuilder = this.masterProfileRepository
      .createQueryBuilder("profile")
      .leftJoinAndSelect("profile.user", "user")
      .where("profile.latitude IS NOT NULL")
      .andWhere("profile.longitude IS NOT NULL")
      .andWhere("profile.isAvailable = :isAvailable", { isAvailable: true })
      .andWhere("user.isActive = :isActive", { isActive: true });

    if (specialization) {
      queryBuilder.andWhere("profile.specialization = :specialization", {
        specialization,
      });
    }

    const masters = await queryBuilder.getMany();

    // Вычисляем расстояние для каждого мастера
    const mastersWithDistance = masters
      .map((profile) => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          parseFloat(String(profile.latitude)),
          parseFloat(String(profile.longitude))
        );

        return {
          master: profile.user,
          distance,
          masterProfile: profile,
        };
      })
      .filter(
        (item) =>
          item.distance <= radiusKm &&
          (!item.masterProfile.serviceRadius ||
            item.distance <= item.masterProfile.serviceRadius)
      )
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return mastersWithDistance;
  }

  /**
   * Находит ближайших мастеров к заказу
   */
  async findNearestMastersForOrder(
    orderLatitude: number,
    orderLongitude: number,
    radiusKm: number = 50,
    limit: number = 10
  ): Promise<NearestMasterResult[]> {
    return this.findNearestMasters(
      orderLatitude,
      orderLongitude,
      radiusKm,
      limit
    );
  }

  /**
   * Создает оптимальный маршрут для мастера через несколько точек
   */
  createOptimalRoute(
    startPoint: Coordinate,
    points: Coordinate[]
  ): Coordinate[] {
    if (points.length === 0) return [];

    // Простой алгоритм ближайшего соседа для построения маршрута
    const route: Coordinate[] = [startPoint];
    let remainingPoints = [...points];
    let currentPoint = startPoint;

    while (remainingPoints.length > 0) {
      let nearestIndex = 0;
      let nearestDistance = this.calculateDistance(
        currentPoint.latitude,
        currentPoint.longitude,
        remainingPoints[0].latitude,
        remainingPoints[0].longitude
      );

      for (let i = 1; i < remainingPoints.length; i++) {
        const distance = this.calculateDistance(
          currentPoint.latitude,
          currentPoint.longitude,
          remainingPoints[i].latitude,
          remainingPoints[i].longitude
        );

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }

      currentPoint = remainingPoints[nearestIndex];
      route.push(currentPoint);
      remainingPoints.splice(nearestIndex, 1);
    }

    return route;
  }
}

