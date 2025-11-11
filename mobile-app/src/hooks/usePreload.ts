/**
 * Hook for component preloading
 */

import { useEffect, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  preloadComponent,
  createIdlePreloader,
  PriorityPreloader,
  priorityPreloader,
} from '../utils/lazyLoading';
import { LazyExoticComponent, ComponentType } from 'react';

export interface UsePreloadOptions {
  priority?: 'high' | 'medium' | 'low';
  trigger?: 'mount' | 'focus' | 'idle' | 'hover';
  delay?: number;
}

/**
 * Hook to preload a component
 */
export function usePreload(
  component: LazyExoticComponent<ComponentType<any>>,
  options: UsePreloadOptions = {}
): void {
  const { priority = 'medium', trigger = 'mount', delay = 2000 } = options;
  const navigation = useNavigation();

  useEffect(() => {
    let cancelPreload: (() => void) | undefined;

    switch (trigger) {
      case 'mount':
        // Preload immediately
        preloadComponent(component);
        break;
      case 'idle':
        // Preload on idle
        cancelPreload = createIdlePreloader(component, delay);
        break;
      case 'focus':
        // Preload when screen focused
        const unsubscribe = navigation.addListener('focus', () => {
          preloadComponent(component);
        });
        return unsubscribe;
      default:
        // Add to priority preloader
        priorityPreloader.add(component, priority);
    }

    return () => {
      if (cancelPreload) {
        cancelPreload();
      }
    };
  }, [component, priority, trigger, delay, navigation]);
}

/**
 * Hook to preload multiple components
 */
export function usePreloadMultiple(
  components: LazyExoticComponent<ComponentType<any>>[],
  options: UsePreloadOptions = {}
): void {
  const { priority = 'medium' } = options;

  useEffect(() => {
    components.forEach((component) => {
      priorityPreloader.add(component, priority);
    });
  }, [components, priority]);
}

/**
 * Hook to preload on screen focus
 */
export function usePreloadOnFocus(
  component: LazyExoticComponent<ComponentType<any>>
): void {
  useFocusEffect(
    useCallback(() => {
      preloadComponent(component);
    }, [component])
  );
}

/**
 * Hook for preloading adjacent screens
 */
export function usePreloadAdjacentScreens(currentScreen: string): void {
  const navigation = useNavigation();

  useEffect(() => {
    // Preload screens that are likely to be visited next
    // This is a placeholder - implement based on your navigation structure
    const screenPreloadMap: { [key: string]: string[] } = {
      OrdersTab: ['OrderDetails', 'Chat'],
      NetworkTab: ['MLMDashboard'],
      EarningsTab: ['EarningsScreen'],
      ProfileTab: ['KnowledgeBase'],
    };

    const adjacentScreens = screenPreloadMap[currentScreen] || [];
    
    // Import and preload adjacent screens
    adjacentScreens.forEach((screen) => {
      // Dynamic import based on screen name
      // This would need to match your actual lazy component exports
    });
  }, [currentScreen, navigation]);
}








