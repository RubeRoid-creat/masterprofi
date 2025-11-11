import { useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order } from '../types/order';
import NetInfo from '@react-native-community/netinfo';

const CACHE_KEY = '@orders_cache';
const CACHE_TIMESTAMP_KEY = '@orders_cache_timestamp';

export const useOfflineCache = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [cachedOrders, setCachedOrders] = useState<Order[]>([]);
  const isSavingRef = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });

    loadCachedOrders();

    return () => {
      unsubscribe();
    };
  }, []);

  const loadCachedOrders = async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const orders: Order[] = JSON.parse(cached);
        setCachedOrders(orders);
      }
    } catch (error) {
      console.error('Error loading cached orders:', error);
    }
  };

  const saveOrders = useCallback(async (orders: Order[]) => {
    // Prevent infinite loops by checking if we're already saving
    if (isSavingRef.current) {
      return;
    }

    isSavingRef.current = true;
    try {
      const ordersString = JSON.stringify(orders);
      // Check current cache before updating
      const currentCached = await AsyncStorage.getItem(CACHE_KEY);
      if (currentCached === ordersString) {
        // Already cached, no need to update
        isSavingRef.current = false;
        return;
      }

      await AsyncStorage.setItem(CACHE_KEY, ordersString);
      await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, new Date().toISOString());
      // Only update state if orders actually changed
      setCachedOrders((prev) => {
        const prevString = JSON.stringify(prev);
        return prevString === ordersString ? prev : orders;
      });
    } catch (error) {
      console.error('Error saving cached orders:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, []); // Remove cachedOrders from dependencies to prevent infinite loops

  const getCacheTimestamp = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
    } catch (error) {
      return null;
    }
  };

  const clearCache = async () => {
    try {
      await AsyncStorage.removeItem(CACHE_KEY);
      await AsyncStorage.removeItem(CACHE_TIMESTAMP_KEY);
      setCachedOrders([]);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  return {
    isOffline,
    cachedOrders,
    saveOrders,
    getCacheTimestamp,
    clearCache,
  };
};




