/**
 * API Sync Utilities
 * Утилиты для синхронизации данных между мобильным приложением и админ-панелью
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Получить последнее время синхронизации для типа данных
 */
export async function getLastSyncTime(dataType: string): Promise<number | null> {
  try {
    const timestamp = await AsyncStorage.getItem(`sync_${dataType}_timestamp`);
    return timestamp ? parseInt(timestamp, 10) : null;
  } catch (error) {
    console.error(`Error getting sync timestamp for ${dataType}:`, error);
    return null;
  }
}

/**
 * Сохранить время последней синхронизации
 */
export async function setLastSyncTime(dataType: string, timestamp: number = Date.now()): Promise<void> {
  try {
    await AsyncStorage.setItem(`sync_${dataType}_timestamp`, timestamp.toString());
  } catch (error) {
    console.error(`Error setting sync timestamp for ${dataType}:`, error);
  }
}

/**
 * Проверить, нужна ли синхронизация
 */
export async function needsSync(
  dataType: string,
  maxAge: number = 5 * 60 * 1000 // 5 минут по умолчанию
): Promise<boolean> {
  const lastSync = await getLastSyncTime(dataType);
  if (!lastSync) {
    return true; // Никогда не синхронизировалось
  }
  const age = Date.now() - lastSync;
  return age > maxAge;
}

/**
 * Пометить данные как синхронизированные
 */
export async function markAsSynced(dataType: string): Promise<void> {
  await setLastSyncTime(dataType);
}

/**
 * Получить статус синхронизации для всех типов данных
 */
export async function getSyncStatus(): Promise<Record<string, { lastSync: number | null; needsSync: boolean }>> {
  const dataTypes = ['orders', 'users', 'mlm', 'earnings', 'messages'];
  const status: Record<string, { lastSync: number | null; needsSync: boolean }> = {};

  for (const type of dataTypes) {
    const lastSync = await getLastSyncTime(type);
    const needs = await needsSync(type);
    status[type] = { lastSync, needsSync: needs };
  }

  return status;
}

/**
 * Сбросить все синхронизации (для тестирования)
 */
export async function resetAllSyncs(): Promise<void> {
  const dataTypes = ['orders', 'users', 'mlm', 'earnings', 'messages'];
  for (const type of dataTypes) {
    try {
      await AsyncStorage.removeItem(`sync_${type}_timestamp`);
    } catch (error) {
      console.error(`Error resetting sync for ${type}:`, error);
    }
  }
}

/**
 * Логирование синхронизации (для отладки)
 */
export function logSync(dataType: string, action: 'start' | 'success' | 'error', details?: any): void {
  if (__DEV__) {
    const timestamp = new Date().toISOString();
    console.log(`[Sync] ${timestamp} [${dataType}] ${action}`, details || '');
  }
}








