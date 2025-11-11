import { Module, Global } from "@nestjs/common";
import { CacheModule as NestCacheModule } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CacheService } from "./cache.service";

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>("REDIS_URL");
        const redisHost = configService.get<string>("REDIS_HOST") || "localhost";
        const redisPort = configService.get<number>("REDIS_PORT") || 6379;
        const redisPassword = configService.get<string>("REDIS_PASSWORD");

        // Если Redis не настроен, используем память (для разработки)
        const useRedis = configService.get<string>("USE_REDIS") === "true";

        if (useRedis) {
          try {
            // Динамический импорт redisStore, чтобы не падать если пакет не установлен
            const redisStore = require("cache-manager-redis-store");
            
            // Если есть Redis URL, используем его
            if (redisUrl) {
              return {
                store: redisStore.redisStore,
                url: redisUrl,
                ttl: 300, // Default TTL 5 minutes
              };
            }

            // Иначе используем отдельные параметры
            return {
              store: redisStore.redisStore,
              host: redisHost,
              port: redisPort,
              password: redisPassword,
              ttl: 300, // Default TTL 5 minutes
            };
          } catch (error) {
            console.warn("Redis not available, using in-memory cache:", error.message);
          }
        }

        // Fallback на память если Redis недоступен или не включен
        // Просто возвращаем базовую конфигурацию для in-memory cache
        return {
          ttl: 300,
          max: 100, // Максимум 100 элементов в памяти
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {}

