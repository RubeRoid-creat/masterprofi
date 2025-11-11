import { Injectable } from "@nestjs/common";

/**
 * Сервис для разрешения конфликтов синхронизации
 * Использует версионирование и время последнего изменения
 */
@Injectable()
export class ConflictResolverService {
  /**
   * Разрешает конфликт между серверными и локальными данными
   * 
   * @param serverData - данные с сервера
   * @param localData - локальные данные
   * @returns разрешенные данные
   */
  resolveConflict<T extends { version: number; lastModified: Date | string }>(
    serverData: T,
    localData: T
  ): T {
    // Преобразуем lastModified в Date, если это строка
    const serverLastModified = serverData.lastModified instanceof Date
      ? serverData.lastModified
      : new Date(serverData.lastModified);

    const localLastModified = localData.lastModified instanceof Date
      ? localData.lastModified
      : new Date(localData.lastModified);

    // Если версия сервера больше - используем серверные данные
    if (serverData.version > localData.version) {
      return serverData;
    }

    // Если версия клиента больше - используем локальные данные
    if (serverData.version < localData.version) {
      return localData;
    }

    // Версии равны - используем последнее изменение
    if (serverLastModified.getTime() > localLastModified.getTime()) {
      return serverData;
    } else {
      return localData;
    }
  }

  /**
   * Проверяет, есть ли конфликт между версиями
   */
  hasConflict(
    serverVersion: number,
    localVersion: number,
    serverLastModified: Date | string,
    localLastModified: Date | string
  ): boolean {
    // Если версии различаются - есть конфликт
    if (serverVersion !== localVersion) {
      return true;
    }

    // Если версии равны, но время последнего изменения различается - есть конфликт
    const serverTime = serverLastModified instanceof Date
      ? serverLastModified.getTime()
      : new Date(serverLastModified).getTime();

    const localTime = localLastModified instanceof Date
      ? localLastModified.getTime()
      : new Date(localLastModified).getTime();

    return serverTime !== localTime;
  }

  /**
   * Объединяет данные сервера и клиента (merge strategy)
   * Приоритет: более новая версия, но сохраняем все поля
   */
  mergeData<T extends { version: number; lastModified: Date | string }>(
    serverData: T,
    localData: T
  ): T {
    const resolved = this.resolveConflict(serverData, localData);
    
    // Объединяем все поля, но используем версию из разрешенных данных
    return {
      ...resolved,
      ...localData,
      ...serverData,
      version: resolved.version,
      lastModified: resolved.lastModified,
    };
  }
}

