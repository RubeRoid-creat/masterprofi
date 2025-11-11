import { createNavigationContainerRef } from '@react-navigation/native';
import { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Use this function to navigate when you're outside a component
 */
export function navigate(name: any, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as never, params as never);
  }
}

/**
 * Use this function to go back
 */
export function goBack() {
  if (navigationRef.isReady()) {
    navigationRef.goBack();
  }
}








