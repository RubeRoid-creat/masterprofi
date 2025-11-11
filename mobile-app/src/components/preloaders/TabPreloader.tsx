/**
 * Tab Preloader Component
 * Preloads screens when tab is focused
 */

import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { priorityPreloader } from '../../utils/lazyLoading';
import {
  LazyKnowledgeBaseScreen,
  LazyMLMDashboardScreen,
  LazyEarningsScreen,
  LazyChatScreen,
  LazyNetworkTree,
  LazyIncomeBreakdown,
  LazyEarningsProjection,
  LazyOrderMapView,
} from '../lazy';

interface TabPreloaderProps {
  tabName: string;
}

export const TabPreloader: React.FC<TabPreloaderProps> = ({ tabName }) => {
  useFocusEffect(
    useCallback(() => {
      // Preload based on tab with priority
      switch (tabName) {
        case 'OrdersTab':
          priorityPreloader.add(LazyChatScreen, 'high');
          priorityPreloader.add(LazyOrderMapView, 'medium');
          break;
        case 'NetworkTab':
          priorityPreloader.add(LazyNetworkTree, 'high');
          priorityPreloader.add(LazyMLMDashboardScreen, 'high');
          break;
        case 'EarningsTab':
          priorityPreloader.add(LazyIncomeBreakdown, 'high');
          priorityPreloader.add(LazyEarningsProjection, 'medium');
          priorityPreloader.add(LazyEarningsScreen, 'high');
          break;
        case 'ProfileTab':
          priorityPreloader.add(LazyKnowledgeBaseScreen, 'medium');
          break;
      }
    }, [tabName])
  );

  return null;
};

