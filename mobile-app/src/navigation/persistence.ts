import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationState } from '@react-navigation/native';

const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';

/**
 * Save navigation state to AsyncStorage
 */
export const saveNavigationState = async (state: NavigationState | undefined) => {
  try {
    if (state) {
      const jsonState = JSON.stringify(state);
      await AsyncStorage.setItem(NAVIGATION_PERSISTENCE_KEY, jsonState);
    }
  } catch (error) {
    console.warn('Failed to save navigation state:', error);
  }
};

/**
 * Load navigation state from AsyncStorage
 */
export const loadNavigationState = async (): Promise<NavigationState | undefined> => {
  try {
    const jsonState = await AsyncStorage.getItem(NAVIGATION_PERSISTENCE_KEY);
    return jsonState ? JSON.parse(jsonState) : undefined;
  } catch (error) {
    console.warn('Failed to load navigation state:', error);
    return undefined;
  }
};

/**
 * Clear persisted navigation state
 */
export const clearNavigationState = async () => {
  try {
    await AsyncStorage.removeItem(NAVIGATION_PERSISTENCE_KEY);
  } catch (error) {
    console.warn('Failed to clear navigation state:', error);
  }
};








