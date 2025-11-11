/**
 * Analytics Hooks
 * Convenient hooks for analytics tracking
 */

import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { userEngagementService } from '../services/userEngagementService';
import { featureUsageService } from '../services/featureUsageService';
import { performanceMonitoringService } from '../services/performanceMonitoringService';
import { userFlowService } from '../services/userFlowService';

// Performance polyfill for React Native
const getPerformanceNow = (): number => {
  if (typeof performance !== 'undefined' && performance.now) {
    return performance.now();
  }
  return Date.now();
};

/**
 * Hook to track screen views and engagement
 */
export function useScreenTracking(screenName: string) {
  const navigation = useNavigation();
  const renderStartTime = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = getPerformanceNow();
    
    // Track screen view
    userEngagementService.trackScreenView(screenName);

    // Track screen render time
    const renderTime = getPerformanceNow() - renderStartTime.current;
    performanceMonitoringService.trackScreenRender(screenName, renderTime);

    return () => {
      // Track time spent on screen
      const timeSpent = getPerformanceNow() - renderStartTime.current;
      userEngagementService.trackScreenView(screenName);
    };
  }, [screenName]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      renderStartTime.current = getPerformanceNow();
    });

    return unsubscribe;
  }, [navigation]);
}

/**
 * Hook to track feature usage
 */
export function useFeatureTracking(featureName: string, category?: string) {
  const startTime = useRef<number>(0);

  useEffect(() => {
    startTime.current = Date.now();
    featureUsageService.trackFeatureStart(featureName, category);

    return () => {
      featureUsageService.trackFeatureEnd(featureName);
    };
  }, [featureName, category]);
}

/**
 * Hook to track user flow
 */
export function useFlowTracking(flowId: string, startScreen: string) {
  const navigation = useNavigation();
  const hasStarted = useRef<boolean>(false);

  useEffect(() => {
    if (!hasStarted.current) {
      userFlowService.startFlow(flowId, startScreen);
      hasStarted.current = true;
    }

    const unsubscribe = navigation.addListener('state', (e) => {
      const routeName = e.data.state?.routes[e.data.state.index]?.name;
      if (routeName) {
        userFlowService.trackFlowStep(routeName);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [flowId, startScreen, navigation]);
}

/**
 * Hook to track performance
 */
export function usePerformanceTracking(componentName: string) {
  const renderStartTime = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = getPerformanceNow();

    return () => {
      const renderTime = getPerformanceNow() - renderStartTime.current;
      performanceMonitoringService.trackComponentRender(componentName, renderTime);
    };
  }, [componentName]);
}

