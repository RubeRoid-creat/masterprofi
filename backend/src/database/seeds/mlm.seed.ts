import { DataSource } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { MasterProfile } from "../../mlm/entities/master-profile.entity";
import { Referral } from "../../mlm/entities/referral.entity";

export async function seedMlm(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);
  const masterProfileRepository = dataSource.getRepository(MasterProfile);
  const referralRepository = dataSource.getRepository(Referral);

  // Находим пользователей
  const admin = await userRepository.findOne({
    where: { email: "admin@masterprofi.ru" },
  });
  const master = await userRepository.findOne({
    where: { email: "master@masterprofi.ru" },
  });
  const client = await userRepository.findOne({
    where: { email: "client@masterprofi.ru" },
  });

  if (!admin || !master || !client) {
    console.log("Users not found, run user seed first");
    return;
  }

  // Создаем профиль мастера для мастера
  const existingMasterProfile = await masterProfileRepository.findOne({
    where: { userId: master.id },
  });

  if (!existingMasterProfile) {
    const masterProfile = masterProfileRepository.create({
      userId: master.id,
      referralsCount: 1, // У него есть реферал (клиент)
      totalEarnings: 0,
      totalCommissions: 0,
      availableBalance: 0,
      withdrawnAmount: 0,
      reviewsCount: 0,
      rating: 0,
    });
    await masterProfileRepository.save(masterProfile);
    console.log("✅ Master profile created for master user");
  }

  // Создаем реферальную связь (клиент реферется мастером)
  const existingReferral = await referralRepository.findOne({
    where: { referrerId: master.id, referredId: client.id },
  });

  if (!existingReferral) {
    const referral = referralRepository.create({
      referrerId: master.id,
      referredId: client.id,
    });
    await referralRepository.save(referral);
    console.log("✅ Referral relationship created: master -> client");
  }
}

