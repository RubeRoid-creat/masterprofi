import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Device } from "../entities/device.entity";
import { RegisterDeviceDto } from "../dto/register-device.dto";

@Injectable()
export class DeviceService {
  constructor(
    @InjectRepository(Device)
    private deviceRepository: Repository<Device>
  ) {}

  /**
   * Зарегистрировать или обновить устройство
   */
  async registerDevice(userId: string, dto: RegisterDeviceDto): Promise<Device> {
    let device = await this.deviceRepository.findOne({
      where: { deviceId: dto.deviceId, userId },
    });

    if (device) {
      // Обновляем существующее устройство
      device.deviceName = dto.deviceName || device.deviceName;
      device.platform = dto.platform || device.platform;
      device.appVersion = dto.appVersion || device.appVersion;
      device.osVersion = dto.osVersion || device.osVersion;
      device.fcmToken = dto.fcmToken || device.fcmToken;
      device.metadata = dto.metadata || device.metadata;
      device.lastActiveAt = new Date();
      device.isActive = true;
    } else {
      // Создаем новое устройство
      device = this.deviceRepository.create({
        userId,
        deviceId: dto.deviceId,
        deviceName: dto.deviceName,
        platform: dto.platform,
        appVersion: dto.appVersion,
        osVersion: dto.osVersion,
        fcmToken: dto.fcmToken,
        metadata: dto.metadata,
        lastActiveAt: new Date(),
        isActive: true,
      });
    }

    return await this.deviceRepository.save(device);
  }

  /**
   * Получить устройство по ID
   */
  async getDevice(deviceId: string, userId: string): Promise<Device> {
    const device = await this.deviceRepository.findOne({
      where: { deviceId, userId },
    });

    if (!device) {
      throw new NotFoundException(`Device ${deviceId} not found for user ${userId}`);
    }

    return device;
  }

  /**
   * Получить все устройства пользователя
   */
  async getUserDevices(userId: string): Promise<Device[]> {
    return this.deviceRepository.find({
      where: { userId, isActive: true },
      order: { lastActiveAt: "DESC" },
    });
  }

  /**
   * Деактивировать устройство
   */
  async deactivateDevice(deviceId: string, userId: string): Promise<void> {
    const device = await this.getDevice(deviceId, userId);
    device.isActive = false;
    await this.deviceRepository.save(device);
  }

  /**
   * Обновить время последней активности
   */
  async updateLastActive(deviceId: string, userId: string): Promise<void> {
    const device = await this.getDevice(deviceId, userId);
    device.lastActiveAt = new Date();
    await this.deviceRepository.save(device);
  }
}

