import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MasterProfile } from "./entities/master-profile.entity";
import { Referral } from "./entities/referral.entity";
import { Bonus, BonusType, BonusStatus } from "./entities/bonus.entity";
import { User } from "../users/entities/user.entity";
import { CacheService, CacheKeyPrefix, CacheTTL } from "../cache/cache.service";
import { NotificationGateway } from "../notification/notification.gateway";
import { v4 as uuidv4 } from "uuid";

// MLM уровни и проценты комиссий
const MLM_LEVELS = [
  { level: 1, commissionRate: 0.1 }, // 10% за 1 уровень
  { level: 2, commissionRate: 0.05 }, // 5% за 2 уровень
  { level: 3, commissionRate: 0.03 }, // 3% за 3 уровень
];

@Injectable()
export class MlmService {
  constructor(
    @InjectRepository(MasterProfile)
    private masterProfileRepository: Repository<MasterProfile>,
    @InjectRepository(Referral)
    private referralRepository: Repository<Referral>,
    @InjectRepository(Bonus)
    private bonusRepository: Repository<Bonus>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private cacheService: CacheService,
    private notificationGateway: NotificationGateway
  ) {}

  // Генерация реферального кода
  generateReferralCode(): string {
    return uuidv4().substring(0, 8).toUpperCase();
  }

  // Получить статистику пользователя
  async getUserStats(userId: string) {
    const cacheKey = `${CacheKeyPrefix.MLM_STRUCTURE}:${userId}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const masterProfile = await this.masterProfileRepository.findOne({
          where: { userId },
          relations: ["user"],
        });

        // Получить рефералов
        const referrals = await this.referralRepository.find({
          where: { referrerId: userId },
          relations: ["referred"],
        });

        // Получить бонусы
        const bonuses = await this.bonusRepository.find({
          where: { userId },
          order: { createdAt: "DESC" },
          take: 10,
        });

        // Получить структуру (все рефералы)
        const structure = await this.getUserStructure(userId);

        return {
          profile: masterProfile || {
            referralsCount: 0,
            totalEarnings: 0,
            totalCommissions: 0,
            availableBalance: 0,
            withdrawnAmount: 0,
          },
          referrals: referrals.length,
          structure: structure,
          bonuses: bonuses,
          statistics: {
            totalReferrals: referrals.length,
            totalEarnings: parseFloat(masterProfile?.totalEarnings as any) || 0,
            totalCommissions:
              parseFloat(masterProfile?.totalCommissions as any) || 0,
            availableBalance:
              parseFloat(masterProfile?.availableBalance as any) || 0,
            withdrawnAmount: parseFloat(masterProfile?.withdrawnAmount as any) || 0,
          },
        };
      },
      CacheTTL.MEDIUM // Кэшируем на 5 минут
    );
  }

  // Получить структуру (дерево рефералов)
  async getUserStructure(userId: string, level: number = 1): Promise<any> {
    const referrals = await this.referralRepository.find({
      where: { referrerId: userId },
      relations: ["referred"],
    });

    const structure = [];
    for (const referral of referrals) {
      // Если referred не загружен через relation, загружаем отдельно
      let referred = referral.referred;
      if (!referred && referral.referredId) {
        referred = await this.usersRepository.findOne({
          where: { id: referral.referredId },
        });
      }

      // Проверяем что referred существует
      if (!referred || !referred.id) {
        // Пропускаем эту запись
        continue;
      }

      const referralStructure = {
        id: referred.id,
        email: referred.email,
        firstName: referred.firstName,
        lastName: referred.lastName,
        level,
        totalEarned: parseFloat(referral.totalEarned as any) || 0,
        ordersCount: referral.ordersCount,
        createdAt: referral.createdAt,
        children:
          level < 3 ? await this.getUserStructure(referred.id, level + 1) : [],
      };
      structure.push(referralStructure);
    }

    return structure;
  }

  // Получить общую статистику MLM
  async getOverallStats() {
    const cacheKey = `${CacheKeyPrefix.MLM_COMMISSIONS}:overall`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const totalReferrals = await this.referralRepository.count();
        const totalBonuses = await this.bonusRepository.count();
        const totalPaid = await this.bonusRepository
          .createQueryBuilder("bonus")
          .select("SUM(bonus.amount)", "total")
          .where("bonus.status = :status", { status: BonusStatus.PAID })
          .getRawOne();

        const statsByLevel = await this.bonusRepository
          .createQueryBuilder("bonus")
          .select("bonus.level", "level")
          .addSelect("COUNT(*)", "count")
          .groupBy("bonus.level")
          .getRawMany();

        return {
          totalReferrals,
          totalBonuses,
          totalPaidAmount: parseFloat(totalPaid?.total as any) || 0,
          statsByLevel: statsByLevel || [],
          commissionRates: MLM_LEVELS,
        };
      },
      CacheTTL.MEDIUM // Кэшируем на 5 минут
    );
  }

  // Создать реферальную связь
  async createReferral(
    referrerId: string,
    referredId: string
  ): Promise<Referral> {
    const existingReferral = await this.referralRepository.findOne({
      where: { referrerId, referredId },
    });

    if (existingReferral) {
      return existingReferral;
    }

    const referral = this.referralRepository.create({
      referrerId,
      referredId,
    });

    const saved = await this.referralRepository.save(referral);
    
    // Отправляем WebSocket событие об обновлении MLM сети
    const networkData = await this.getUserStructure(referrerId);
    this.notificationGateway.emitMLMNetworkUpdated(referrerId, networkData);
    
    return saved;
  }

  // Рассчитать бонус за заказ
  async calculateOrderBonus(
    orderId: string,
    orderAmount: number,
    clientId: string
  ): Promise<Bonus[]> {
    const bonuses: Bonus[] = [];

    // Получаем информацию о клиенте
    const client = await this.usersRepository.findOne({
      where: { id: clientId },
      relations: ["referrer"],
    });

    if (!client || !client.referrerId) {
      // У клиента нет реферера
      return bonuses;
    }

    // Находим цепочку рефереров (до 3 уровней)
    let currentReferrerId = client.referrerId;
    let level = 1;

    while (currentReferrerId && level <= 3) {
      const mlmLevel = MLM_LEVELS.find((l) => l.level === level);
      if (!mlmLevel) {
        break;
      }

      // Проверяем, что реферер является мастером
      const referrer = await this.usersRepository.findOne({
        where: { id: currentReferrerId },
      });

      if (!referrer || referrer.role !== "master") {
        // Если реферер не мастер, пропускаем его
        if (referrer?.referrerId) {
          currentReferrerId = referrer.referrerId;
          level++;
          continue;
        } else {
          break;
        }
      }

      // Рассчитываем комиссию
      const commissionAmount = orderAmount * mlmLevel.commissionRate;

      // Создаем бонус
      const bonus = await this.createBonus(
        currentReferrerId,
        BonusType.ORDER_COMMISSION,
        commissionAmount,
        `Комиссия ${level} уровня за заказ ${orderId}`
      );

      // Добавляем информацию об уровне и комиссии
      bonus.level = level;
      bonus.commissionRate = mlmLevel.commissionRate;
      bonus.orderId = orderId;
      await this.bonusRepository.save(bonus);

      // Обновляем профиль мастера
      let masterProfile = await this.masterProfileRepository.findOne({
        where: { userId: currentReferrerId },
      });

      if (!masterProfile) {
        masterProfile = this.masterProfileRepository.create({
          userId: currentReferrerId,
          totalCommissions: 0,
          totalEarnings: 0,
          availableBalance: 0,
          withdrawnAmount: 0,
        });
      }

      masterProfile.totalCommissions += commissionAmount;
      masterProfile.availableBalance += commissionAmount;
      await this.masterProfileRepository.save(masterProfile);

      // Отправляем WebSocket событие о комиссии
      this.notificationGateway.emitCommissionUpdated(currentReferrerId, {
        bonusId: bonus.id,
        amount: commissionAmount,
        level,
        orderId,
        status: bonus.status,
      });

      bonuses.push(bonus);

      // Переходим к следующему уровню
      currentReferrerId = referrer.referrerId || null;
      level++;
    }

    // Отправляем WebSocket событие об обновлении MLM сети
    if (bonuses.length > 0 && client.referrerId) {
      const networkData = await this.getUserStructure(client.referrerId);
      this.notificationGateway.emitMLMNetworkUpdated(client.referrerId, networkData);
    }

    return bonuses;
  }

  // Создать бонус
  async createBonus(
    userId: string,
    type: BonusType,
    amount: number,
    description?: string
  ): Promise<Bonus> {
    const bonus = this.bonusRepository.create({
      userId,
      type,
      amount,
      description,
      status: BonusStatus.PENDING,
    });

    return this.bonusRepository.save(bonus);
  }

  // Одобрить и выплатить бонус
  async approveAndPayBonus(bonusId: string): Promise<Bonus> {
    const bonus = await this.bonusRepository.findOne({
      where: { id: bonusId },
    });

    if (!bonus) {
      throw new NotFoundException("Bonus not found");
    }

    bonus.status = BonusStatus.PAID;
    await this.bonusRepository.save(bonus);

    // Обновить профиль мастера
    const masterProfile = await this.masterProfileRepository.findOne({
      where: { userId: bonus.userId },
    });

    if (masterProfile) {
      masterProfile.totalCommissions += bonus.amount;
      masterProfile.totalEarnings += bonus.amount;
      await this.masterProfileRepository.save(masterProfile);
    }

    return bonus;
  }

  // Расчет комиссий в реальном времени (без сохранения)
  async calculateRealTimeCommissions(
    orderAmount: number,
    clientId: string
  ): Promise<{
    commissions: Array<{
      userId: string;
      level: number;
      commissionRate: number;
      amount: number;
      user: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
      };
    }>;
    totalCommissions: number;
  }> {
    const commissions = [];
    const client = await this.usersRepository.findOne({
      where: { id: clientId },
    });

    if (!client || !client.referrerId) {
      return { commissions: [], totalCommissions: 0 };
    }

    let currentReferrerId = client.referrerId;
    let level = 1;

    while (currentReferrerId && level <= 3) {
      const mlmLevel = MLM_LEVELS.find((l) => l.level === level);
      if (!mlmLevel) {
        break;
      }

      const referrer = await this.usersRepository.findOne({
        where: { id: currentReferrerId },
      });

      if (!referrer || referrer.role !== "master") {
        if (referrer?.referrerId) {
          currentReferrerId = referrer.referrerId;
          level++;
          continue;
        } else {
          break;
        }
      }

      const commissionAmount = orderAmount * mlmLevel.commissionRate;

      commissions.push({
        userId: referrer.id,
        level,
        commissionRate: mlmLevel.commissionRate,
        amount: commissionAmount,
        user: {
          id: referrer.id,
          email: referrer.email,
          firstName: referrer.firstName,
          lastName: referrer.lastName,
        },
      });

      currentReferrerId = referrer.referrerId || null;
      level++;
    }

    const totalCommissions = commissions.reduce(
      (sum, comm) => sum + comm.amount,
      0
    );

    return { commissions, totalCommissions };
  }

  // Автоматическая выплата доступного баланса
  async processAutomaticPayout(
    userId: string,
    amount?: number
  ): Promise<{
    success: boolean;
    payoutAmount: number;
    newBalance: number;
    message: string;
  }> {
    const masterProfile = await this.masterProfileRepository.findOne({
      where: { userId },
      relations: ["user"],
    });

    if (!masterProfile) {
      throw new NotFoundException("Master profile not found");
    }

    const availableBalance = parseFloat(
      masterProfile.availableBalance as any
    ) || 0;

    const payoutAmount =
      amount && amount <= availableBalance
        ? amount
        : availableBalance;

    if (payoutAmount <= 0) {
      return {
        success: false,
        payoutAmount: 0,
        newBalance: availableBalance,
        message: "Недостаточно средств для выплаты",
      };
    }

    // Создаем запись о выплате
    const bonus = await this.createBonus(
      userId,
      BonusType.WITHDRAWAL,
      payoutAmount,
      `Автоматическая выплата ${new Date().toLocaleDateString("ru-RU")}`
    );

    bonus.status = BonusStatus.PAID;
    await this.bonusRepository.save(bonus);

    // Обновляем баланс
    masterProfile.availableBalance =
      availableBalance - payoutAmount;
    masterProfile.withdrawnAmount =
      (parseFloat(masterProfile.withdrawnAmount as any) || 0) +
      payoutAmount;
    await this.masterProfileRepository.save(masterProfile);

    // Отправляем WebSocket событие об обновлении комиссии
    this.notificationGateway.emitCommissionUpdated(userId, {
      bonusId: bonus.id,
      amount: payoutAmount,
      status: bonus.status,
      type: 'withdrawal',
    });

    // Отправляем WebSocket событие об обновлении MLM сети
    const networkData = await this.getUserStructure(userId);
    this.notificationGateway.emitMLMNetworkUpdated(userId, networkData);

    return {
      success: true,
      payoutAmount,
      newBalance: availableBalance - payoutAmount,
      message: `Успешно выплачено ${payoutAmount.toFixed(2)} ₽`,
    };
  }

  // Получить комиссии в реальном времени для пользователя
  async getRealTimeCommissions(userId: string): Promise<{
    pendingCommissions: number;
    recentCommissions: Array<{
      id: string;
      amount: number;
      level: number;
      orderId?: string;
      createdAt: Date;
      status: BonusStatus;
    }>;
    estimatedNextPayout: number;
  }> {
    const pendingBonuses = await this.bonusRepository.find({
      where: {
        userId,
        status: BonusStatus.PENDING,
      },
      order: { createdAt: "DESC" },
      take: 10,
    });

    const recentBonuses = await this.bonusRepository.find({
      where: { userId },
      order: { createdAt: "DESC" },
      take: 10,
    });

    const pendingCommissions = pendingBonuses.reduce(
      (sum, bonus) => sum + parseFloat(bonus.amount as any),
      0
    );

    const masterProfile = await this.masterProfileRepository.findOne({
      where: { userId },
    });

    const availableBalance =
      parseFloat(masterProfile?.availableBalance as any) || 0;

    return {
      pendingCommissions,
      recentCommissions: recentBonuses.map((b) => ({
        id: b.id,
        amount: parseFloat(b.amount as any),
        level: b.level || 0,
        orderId: b.orderId,
        createdAt: b.createdAt,
        status: b.status,
      })),
      estimatedNextPayout: availableBalance,
    };
  }
}
