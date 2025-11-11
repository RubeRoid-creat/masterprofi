/**
 * Hook for secure storage operations
 * Uses encryption service for sensitive data
 */

import { useState, useCallback } from 'react';
import { encryptionService } from '../services/encryptionService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useSecureStorage<T>(userId: string | null) {
  const [isReady, setIsReady] = useState(false);

  const initialize = useCallback(async () => {
    if (!userId) {
      setIsReady(false);
      return;
    }

    try {
      await encryptionService.initialize(userId);
      setIsReady(true);
    } catch (error) {
      console.error('Failed to initialize encryption:', error);
      setIsReady(false);
    }
  }, [userId]);

  const setSecureItem = useCallback(
    async (key: string, value: any): Promise<void> => {
      if (!isReady || !encryptionService.isAvailable()) {
        // Fallback to regular storage if encryption not available
        await AsyncStorage.setItem(key, JSON.stringify(value));
        return;
      }

      await encryptionService.encryptAndStore(key, value);
    },
    [isReady]
  );

  const getSecureItem = useCallback(
    async (key: string): Promise<T | null> => {
      if (!isReady || !encryptionService.isAvailable()) {
        // Fallback to regular storage
        const value = await AsyncStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      }

      return await encryptionService.retrieveAndDecrypt<T>(key);
    },
    [isReady]
  );

  const removeSecureItem = useCallback(async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(key);
  }, []);

  const clearSecureStorage = useCallback(async (): Promise<void> => {
    if (userId) {
      await encryptionService.clearKey(userId);
    }
    setIsReady(false);
  }, [userId]);

  return {
    isReady,
    initialize,
    setSecureItem,
    getSecureItem,
    removeSecureItem,
    clearSecureStorage,
  };
}








