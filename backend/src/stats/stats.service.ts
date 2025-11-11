import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User, UserRole } from "../users/entities/user.entity";
import { Order, OrderStatus } from "../orders/entities/order.entity";
import { Payment } from "../payments/entities/payment.entity";
import { MasterProfile } from "../mlm/entities/master-profile.entity";
import { Review } from "../reviews/entities/review.entity";
import { CacheService, CacheKeyPrefix, CacheTTL } from "../cache/cache.service";

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(MasterProfile)
    private masterProfileRepository: Repository<MasterProfile>,
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    private cacheService: CacheService
  ) {}

  async getDashboardStats() {
    const cacheKey = `${CacheKeyPrefix.DASHBOARD_STATS}:all`;

    try {
      return await this.cacheService.getOrSet(
        cacheKey,
        async () => {
        try {
          const [
            totalUsers,
            totalMasters,
            totalClients,
            totalOrders,
            totalPayments,
            totalRevenue,
            pendingOrders,
            completedOrders,
            totalReviews,
            averageRating,
          ] = await Promise.all([
            this.usersRepository.count().catch(() => 0),
            this.usersRepository.count({ where: { role: UserRole.MASTER } }).catch(() => 0),
            this.usersRepository.count({ where: { role: UserRole.CLIENT } }).catch(() => 0),
            this.ordersRepository.count().catch(() => 0),
            this.paymentsRepository.count().catch(() => 0),
            this.paymentsRepository
              .createQueryBuilder("payment")
              .select("SUM(payment.amount)", "sum")
              .where("payment.status = :status", { status: "completed" })
              .getRawOne()
              .catch(() => ({ sum: "0" })),
            this.ordersRepository.count({
              where: { status: OrderStatus.CREATED },
            }).catch(() => 0),
            this.ordersRepository.count({
              where: { status: OrderStatus.COMPLETED },
            }).catch(() => 0),
            this.reviewsRepository.count().catch(() => 0),
            this.reviewsRepository
              .createQueryBuilder("review")
              .select("AVG(review.rating)", "avg")
              .getRawOne()
              .catch(() => ({ avg: "0" })),
          ]);

        const revenue = parseFloat(totalRevenue?.sum || "0") || 0;
        const avgRating = parseFloat(averageRating?.avg || "0") || 0;

        return {
          users: {
            total: totalUsers,
            masters: totalMasters,
            clients: totalClients,
          },
          orders: {
            total: totalOrders,
            pending: pendingOrders,
            completed: completedOrders,
          },
          payments: {
            total: totalPayments,
            revenue: revenue,
          },
          reviews: {
            total: totalReviews,
            averageRating: parseFloat(avgRating.toFixed(2)),
          },
          timestamp: new Date().toISOString(),
        };
        } catch (error: any) {
          console.error("Error in getDashboardStats factory:", error);
          // Возвращаем пустую статистику при ошибке
          return {
            users: { total: 0, masters: 0, clients: 0 },
            orders: { total: 0, pending: 0, completed: 0 },
            payments: { total: 0, revenue: 0 },
            reviews: { total: 0, averageRating: 0 },
            timestamp: new Date().toISOString(),
          };
        }
        },
        CacheTTL.SHORT // Кэшируем на 1 минуту
      );
    } catch (error: any) {
      console.error("Error in getDashboardStats, executing without cache:", error);
      // Если кэш не работает, выполняем запросы напрямую
      try {
        const [
          totalUsers,
          totalMasters,
          totalClients,
          totalOrders,
          totalPayments,
          totalRevenue,
          pendingOrders,
          completedOrders,
          totalReviews,
          averageRating,
        ] = await Promise.all([
          this.usersRepository.count().catch(() => 0),
          this.usersRepository.count({ where: { role: UserRole.MASTER } }).catch(() => 0),
          this.usersRepository.count({ where: { role: UserRole.CLIENT } }).catch(() => 0),
          this.ordersRepository.count().catch(() => 0),
          this.paymentsRepository.count().catch(() => 0),
          this.paymentsRepository
            .createQueryBuilder("payment")
            .select("SUM(payment.amount)", "sum")
            .where("payment.status = :status", { status: "completed" })
            .getRawOne()
            .catch(() => ({ sum: "0" })),
          this.ordersRepository.count({
            where: { status: OrderStatus.CREATED },
          }).catch(() => 0),
          this.ordersRepository.count({
            where: { status: OrderStatus.COMPLETED },
          }).catch(() => 0),
          this.reviewsRepository.count().catch(() => 0),
          this.reviewsRepository
            .createQueryBuilder("review")
            .select("AVG(review.rating)", "avg")
            .getRawOne()
            .catch(() => ({ avg: "0" })),
        ]);

        const revenue = parseFloat(totalRevenue?.sum || "0") || 0;
        const avgRating = parseFloat(averageRating?.avg || "0") || 0;

        return {
          users: {
            total: totalUsers,
            masters: totalMasters,
            clients: totalClients,
          },
          orders: {
            total: totalOrders,
            pending: pendingOrders,
            completed: completedOrders,
          },
          payments: {
            total: totalPayments,
            revenue: revenue,
          },
          reviews: {
            total: totalReviews,
            averageRating: parseFloat(avgRating.toFixed(2)),
          },
          timestamp: new Date().toISOString(),
        };
      } catch (fallbackError: any) {
        console.error("Error in getDashboardStats fallback:", fallbackError);
        // Возвращаем пустую статистику при ошибке
        return {
          users: { total: 0, masters: 0, clients: 0 },
          orders: { total: 0, pending: 0, completed: 0 },
          payments: { total: 0, revenue: 0 },
          reviews: { total: 0, averageRating: 0 },
          timestamp: new Date().toISOString(),
        };
      }
    }
  }

  /**
   * Инвалидировать кэш статистики (вызывать при изменениях)
   */
  async invalidateStatsCache() {
    await this.cacheService.invalidateStats();
  }
}

