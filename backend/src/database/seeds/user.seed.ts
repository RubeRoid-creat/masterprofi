import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import { User, UserRole } from "../../users/entities/user.entity";

export async function seedUsers(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);

  // Проверяем, есть ли уже админ
  const existingAdmin = await userRepository.findOne({
    where: { email: "admin@masterprofi.ru" },
  });

  if (existingAdmin) {
    console.log("Admin user already exists, skipping seed");
    return;
  }

  // Создаем администратора
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = userRepository.create({
    email: "admin@masterprofi.ru",
    passwordHash: adminPassword,
    role: UserRole.ADMIN,
    firstName: "Администратор",
    lastName: "Системы",
    isActive: true,
    emailVerified: true,
    referralCode: "ADMIN001",
  });
  await userRepository.save(admin);
  console.log("✅ Admin user created: admin@masterprofi.ru / admin123");

  // Создаем тестового мастера
  const masterPassword = await bcrypt.hash("master123", 10);
  const master = userRepository.create({
    email: "master@masterprofi.ru",
    passwordHash: masterPassword,
    role: UserRole.MASTER,
    firstName: "Иван",
    lastName: "Мастеров",
    phone: "+79991234567",
    isActive: true,
    emailVerified: true,
    referralCode: "MASTER001",
    referrer: admin, // Админ как реферер
  });
  await userRepository.save(master);
  console.log("✅ Master user created: master@masterprofi.ru / master123");

  // Создаем тестового клиента
  const clientPassword = await bcrypt.hash("client123", 10);
  const client = userRepository.create({
    email: "client@masterprofi.ru",
    passwordHash: clientPassword,
    role: UserRole.CLIENT,
    firstName: "Петр",
    lastName: "Клиентов",
    phone: "+79991234568",
    isActive: true,
    emailVerified: true,
    referralCode: "CLIENT001",
    referrer: master, // Мастер как реферер
  });
  await userRepository.save(client);
  console.log("✅ Client user created: client@masterprofi.ru / client123");
}

