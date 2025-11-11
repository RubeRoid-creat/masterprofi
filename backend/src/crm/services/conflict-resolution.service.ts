import { Injectable } from "@nestjs/common";
import { LoggerService } from "../../logger/logger.service";

export enum ConflictResolutionStrategy {
  LOCAL_WINS = "local_wins",
  SERVER_WINS = "server_wins",
  MERGE = "merge",
  MANUAL = "manual",
}

export interface ConflictData {
  entityType: string;
  entityId: string;
  localVersion: number;
  serverVersion: number;
  localData: any;
  serverData: any;
  conflictField?: string;
}

@Injectable()
export class ConflictResolutionService {
  constructor(private readonly logger: LoggerService) {}

  /**
   * Разрешить конфликт данных
   */
  resolveConflict(
    conflict: ConflictData,
    strategy: ConflictResolutionStrategy = ConflictResolutionStrategy.SERVER_WINS
  ): any {
    this.logger.log(
      `Resolving conflict for ${conflict.entityType} ${conflict.entityId} using strategy ${strategy}`
    );

    switch (strategy) {
      case ConflictResolutionStrategy.LOCAL_WINS:
        return {
          ...conflict.serverData,
          ...conflict.localData,
          syncVersion: conflict.localVersion,
        };

      case ConflictResolutionStrategy.SERVER_WINS:
        return {
          ...conflict.serverData,
          syncVersion: conflict.serverVersion,
        };

      case ConflictResolutionStrategy.MERGE:
        return this.mergeData(conflict.localData, conflict.serverData);

      case ConflictResolutionStrategy.MANUAL:
        // Помечаем для ручного разрешения
        this.logger.warn(
          `Manual conflict resolution required for ${conflict.entityType} ${conflict.entityId}`
        );
        return {
          ...conflict.serverData,
          syncVersion: Math.max(conflict.localVersion, conflict.serverVersion),
          _conflict: true,
          _conflictData: {
            local: conflict.localData,
            server: conflict.serverData,
          },
        };

      default:
        // По умолчанию - последнее изменение побеждает
        return conflict.serverVersion > conflict.localVersion
          ? { ...conflict.serverData, syncVersion: conflict.serverVersion }
          : { ...conflict.localData, syncVersion: conflict.localVersion };
    }
  }

  /**
   * Объединить данные локальной и серверной версий
   */
  private mergeData(localData: any, serverData: any): any {
    const merged = { ...serverData };

    // Объединяем поля, приоритет у более новых данных
    for (const key in localData) {
      if (localData[key] !== undefined && localData[key] !== null) {
        // Если серверные данные отсутствуют или пустые, используем локальные
        if (
          !serverData[key] ||
          serverData[key] === "" ||
          (Array.isArray(serverData[key]) && serverData[key].length === 0)
        ) {
          merged[key] = localData[key];
        }
      }
    }

    return merged;
  }

  /**
   * Обнаружить конфликт между версиями
   */
  detectConflict(
    localVersion: number,
    serverVersion: number,
    localUpdatedAt: Date,
    serverUpdatedAt: Date
  ): boolean {
    // Конфликт если обе версии изменились независимо
    return (
      localVersion !== serverVersion &&
      localUpdatedAt.getTime() !== serverUpdatedAt.getTime()
    );
  }
}





