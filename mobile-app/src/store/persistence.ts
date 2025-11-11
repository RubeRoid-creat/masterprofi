/**
 * Redux Persistence Configuration
 * Handles saving and loading Redux state to/from AsyncStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from './store';

const PERSISTENCE_KEYS = {
  AUTH: 'redux_auth_state',
  ORDERS: 'redux_orders_state',
};

/**
 * Save auth state to AsyncStorage
 */
export const persistAuthState = async (state: RootState['auth']): Promise<void> => {
  try {
    const authData = {
      user: state.user,
      token: state.token,
      refreshToken: state.refreshToken,
      tokenExpiry: state.tokenExpiry,
      biometric: state.biometric,
      rememberMe: state.rememberMe,
    };
    await AsyncStorage.setItem(PERSISTENCE_KEYS.AUTH, JSON.stringify(authData));
  } catch (error) {
    console.warn('Failed to persist auth state:', error);
  }
};

/**
 * Load auth state from AsyncStorage
 */
export const loadAuthState = async (): Promise<Partial<RootState['auth']> | null> => {
  try {
    const data = await AsyncStorage.getItem(PERSISTENCE_KEYS.AUTH);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('Failed to load auth state:', error);
  }
  return null;
};

/**
 * Clear persisted auth state
 */
export const clearAuthState = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PERSISTENCE_KEYS.AUTH);
  } catch (error) {
    console.warn('Failed to clear auth state:', error);
  }
};

/**
 * Save orders state to AsyncStorage (partial - only essential data)
 */
export const persistOrdersState = async (state: RootState['orders']): Promise<void> => {
  try {
    const ordersData = {
      orders: state.orders,
      activeOrder: state.activeOrder,
      activeTab: state.activeTab,
      lastSyncTime: state.lastSyncTime,
      offlineQueue: state.offlineQueue,
      chatMessages: state.chatMessages,
      pagination: state.pagination,
    };
    await AsyncStorage.setItem(PERSISTENCE_KEYS.ORDERS, JSON.stringify(ordersData));
  } catch (error) {
    console.warn('Failed to persist orders state:', error);
  }
};

/**
 * Load orders state from AsyncStorage
 */
export const loadOrdersState = async (): Promise<Partial<RootState['orders']> | null> => {
  try {
    const data = await AsyncStorage.getItem(PERSISTENCE_KEYS.ORDERS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn('Failed to load orders state:', error);
  }
  return null;
};

/**
 * Clear persisted orders state
 */
export const clearOrdersState = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PERSISTENCE_KEYS.ORDERS);
  } catch (error) {
    console.warn('Failed to clear orders state:', error);
  }
};

/**
 * Middleware to persist state on changes
 */
export const persistenceMiddleware = (store: any) => (next: any) => (action: any) => {
  const result = next(action);
  const state = store.getState();

  // Persist auth state on specific actions
  if (
    action.type.startsWith('auth/') ||
    action.type === 'auth/setCredentials' ||
    action.type === 'auth/logout' ||
    action.type === 'auth/updateUser' ||
    action.type === 'auth/setBiometricEnabled'
  ) {
    persistAuthState(state.auth);
  }

  // Persist orders state on specific actions
  if (
    action.type.startsWith('orders/') &&
    (action.type.includes('setOrders') ||
      action.type.includes('updateOrder') ||
      action.type.includes('setActiveOrder') ||
      action.type.includes('addChatMessage') ||
      action.type.includes('addToOfflineQueue'))
  ) {
    persistOrdersState(state.orders);
  }

  return result;
};








