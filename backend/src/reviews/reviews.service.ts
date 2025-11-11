import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Review } from "./entities/review.entity";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { MasterProfile } from "../mlm/entities/master-profile.entity";
import { Order, OrderStatus } from "../orders/entities/order.entity";
import { CacheService, CacheKeyPrefix, CacheTTL } from "../cache/cache.service";
import { NotificationGateway } from "../notification/notification.gateway";

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(MasterProfile)
    private masterProfileRepository: Repository<MasterProfile>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private cacheService: CacheService,
    private notificationGateway: NotificationGateway
  ) {}

  async create(createReviewDto: CreateReviewDto, clientId: string): Promise<Review> {
    // Проверяем, что заказ существует и завершен
    const order = await this.ordersRepository.findOne({
      where: { id: createReviewDto.orderId },
      relations: ["client", "master"],
    });

    if (!order) {
      throw new NotFoundException("Заказ не найден");
    }

    if (order.status !== OrderStatus.COMPLETED) {
      throw new BadRequestException(
        "Отзыв можно оставить только для завершенных заказов"
      );
    }

    if (order.clientId !== clientId) {
      throw new BadRequestException("Вы можете оставить отзыв только на свои заказы");
    }

    if (order.masterId !== createReviewDto.masterId) {
      throw new BadRequestException("Мастер не соответствует заказу");
    }

    // Проверяем, нет ли уже отзыва на этот заказ
    const existingReview = await this.reviewsRepository.findOne({
      where: {
        orderId: createReviewDto.orderId,
        masterId: createReviewDto.masterId,
      },
    });

    if (existingReview) {
      throw new ConflictException("Отзыв на этот заказ уже существует");
    }

    // Создаем отзыв
    const review = this.reviewsRepository.create({
      ...createReviewDto,
      clientId,
    });

    const savedReview = await this.reviewsRepository.save(review);

    // Пересчитываем рейтинг мастера
    await this.updateMasterRating(createReviewDto.masterId);

    // Отправляем WebSocket событие
    this.notificationGateway.emitReviewCreated({
      id: savedReview.id,
      orderId: savedReview.orderId,
      masterId: savedReview.masterId,
      clientId: savedReview.clientId,
      rating: savedReview.rating,
      comment: savedReview.comment,
      createdAt: savedReview.createdAt,
    });

    return savedReview;
  }

  async findAll(masterId?: string, orderId?: string): Promise<Review[]> {
    const where: any = {};
    if (masterId) where.masterId = masterId;
    if (orderId) where.orderId = orderId;

    return this.reviewsRepository.find({
      where,
      relations: ["master", "client", "order"],
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ["master", "client", "order"],
    });

    if (!review) {
      throw new NotFoundException("Отзыв не найден");
    }

    return review;
  }

  async findByOrder(orderId: string): Promise<Review | null> {
    return this.reviewsRepository.findOne({
      where: { orderId },
      relations: ["master", "client", "order"],
    });
  }

  async update(id: string, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);

    Object.assign(review, updateReviewDto);
    const updatedReview = await this.reviewsRepository.save(review);

    // Пересчитываем рейтинг, если изменился rating
    if (updateReviewDto.rating !== undefined) {
      await this.updateMasterRating(review.masterId);
    }

    // Отправляем WebSocket событие
    this.notificationGateway.emitReviewUpdated({
      id: updatedReview.id,
      orderId: updatedReview.orderId,
      masterId: updatedReview.masterId,
      clientId: updatedReview.clientId,
      rating: updatedReview.rating,
      comment: updatedReview.comment,
      updatedAt: updatedReview.updatedAt,
    });

    return updatedReview;
  }

  async remove(id: string): Promise<void> {
    const review = await this.findOne(id);
    const masterId = review.masterId;

    await this.reviewsRepository.remove(review);

    // Пересчитываем рейтинг мастера
    await this.updateMasterRating(masterId);
  }

  /**
   * Пересчитывает средний рейтинг мастера на основе всех отзывов
   */
  private async updateMasterRating(masterId: string): Promise<void> {
    const reviews = await this.reviewsRepository.find({
      where: { masterId, isPublished: true },
    });

    if (reviews.length === 0) {
      // Если нет отзывов, сбрасываем рейтинг
      await this.masterProfileRepository.update(
        { userId: masterId },
        {
          rating: 0,
          reviewsCount: 0,
        }
      );
      return;
    }

    // Вычисляем средний рейтинг
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    const roundedRating = Math.round(averageRating * 100) / 100; // Округление до 2 знаков

    // Обновляем профиль мастера
    await this.masterProfileRepository.update(
      { userId: masterId },
      {
        rating: roundedRating,
        reviewsCount: reviews.length,
      }
    );

    // Инвалидируем кэш статистики отзывов
    await this.cacheService.del(`${CacheKeyPrefix.REVIEWS_STATS}:master:${masterId}`);
    await this.cacheService.del(`${CacheKeyPrefix.REVIEWS_STATS}:overall`);
    await this.cacheService.invalidateStats(); // Инвалидируем общую статистику dashboard
  }

  /**
   * Получает статистику по отзывам для мастера
   */
  async getMasterStats(masterId: string) {
    const cacheKey = `${CacheKeyPrefix.REVIEWS_STATS}:master:${masterId}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const reviews = await this.reviewsRepository.find({
          where: { masterId, isPublished: true },
        });

        const stats = {
          total: reviews.length,
          average: reviews.length > 0
            ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 100) / 100
            : 0,
          distribution: {
            5: reviews.filter((r) => r.rating === 5).length,
            4: reviews.filter((r) => r.rating === 4).length,
            3: reviews.filter((r) => r.rating === 3).length,
            2: reviews.filter((r) => r.rating === 2).length,
            1: reviews.filter((r) => r.rating === 1).length,
          },
        };

        return stats;
      },
      CacheTTL.MEDIUM // Кэшируем на 5 минут
    );
  }

  /**
   * Получает агрегированную статистику по всем мастерам
   */
  async getOverallStats() {
    const cacheKey = `${CacheKeyPrefix.REVIEWS_STATS}:overall`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const allReviews = await this.reviewsRepository.find({
          where: { isPublished: true },
          relations: ["master"],
        });

        const totalReviews = allReviews.length;
        const averageRating =
          totalReviews > 0
            ? Math.round(
                (allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) *
                  100
              ) / 100
            : 0;

        const distribution = {
          5: allReviews.filter((r) => r.rating === 5).length,
          4: allReviews.filter((r) => r.rating === 4).length,
          3: allReviews.filter((r) => r.rating === 3).length,
          2: allReviews.filter((r) => r.rating === 2).length,
          1: allReviews.filter((r) => r.rating === 1).length,
        };

        // Статистика по мастерам с отзывами
        const mastersWithReviews = new Set(
          allReviews.map((r) => r.masterId)
        ).size;

        return {
          totalReviews,
          averageRating,
          distribution,
          mastersWithReviews,
          mastersWithoutReviews: 0, // Можно вычислить отдельно, если нужно
        };
      },
      CacheTTL.MEDIUM // Кэшируем на 5 минут
    );
  }
}

