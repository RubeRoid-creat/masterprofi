/**
 * Navigation Preloading
 * Preloads screens and components based on navigation patterns
 */

import { NavigationContainerRef } from '@react-navigation/native';
import {
  LazyKnowledgeBaseScreen,
  LazyMLMDashboardScreen,
  LazyEarningsScreen,
  LazyChatScreen,
  LazyNetworkTree,
  LazyIncomeBreakdown,
  LazyEarningsProjection,
  LazyOrderMapView,
  LazyMediaAttachment,
} from '../components/lazy';
import { preloadComponent, priorityPreloader } from '../utils/lazyLoading';

class NavigationPreloader {
  private navigationRef: NavigationContainerRef<any> | null = null;
  private preloadedRoutes: Set<string> = new Set();

  /**
   * Set navigation ref
   */
  setNavigationRef(ref: NavigationContainerRef<any>): void {
    this.navigationRef = ref;
  }

  /**
   * Preload based on current route
   */
  preloadForRoute(routeName: string): void {
    if (this.preloadedRoutes.has(routeName)) {
      return;
    }

    this.preloadedRoutes.add(routeName);

    switch (routeName) {
      case 'OrdersTab':
      case 'OrderFeed':
        // Preload order details and chat
        priorityPreloader.add(LazyChatScreen, 'high');
        priorityPreloader.add(LazyOrderMapView, 'medium');
        break;

      case 'NetworkTab':
      case 'MLMDashboard':
        // Preload network tree
        priorityPreloader.add(LazyNetworkTree, 'high');
        break;

      case 'EarningsTab':
      case 'EarningsHome':
        // Preload earnings charts
        priorityPreloader.add(LazyIncomeBreakdown, 'high');
        priorityPreloader.add(LazyEarningsProjection, 'medium');
        break;

      case 'ProfileTab':
      case 'ProfileHome':
        // Preload knowledge base
        priorityPreloader.add(LazyKnowledgeBaseScreen, 'medium');
        break;

      case 'ChatModal':
      case 'OrderChat':
        // Preload chat media viewer
        priorityPreloader.add(LazyMediaAttachment, 'high');
        break;
    }
  }

  /**
   * Preload adjacent screens
   */
  preloadAdjacentScreens(currentRoute: string): void {
    const preloadMap: { [key: string]: string[] } = {
      OrdersTab: ['OrderDetails', 'Chat'],
      NetworkTab: ['MLMDashboard'],
      EarningsTab: ['EarningsHome'],
      ProfileTab: ['KnowledgeBase'],
    };

    const adjacent = preloadMap[currentRoute] || [];
    adjacent.forEach((screen) => {
      // Preload logic would go here
      console.log(`Preloading adjacent screen: ${screen}`);
    });
  }

  /**
   * Preload on navigation focus
   */
  setupNavigationListeners(): void {
    if (!this.navigationRef) {
      return;
    }

    // Get current route and preload adjacent screens
    const state = this.navigationRef.getRootState();
    if (state) {
      const route = this.getCurrentRoute(state);
      if (route) {
        this.preloadForRoute(route.name);
      }
    }
  }

  /**
   * Get current route from navigation state
   */
  private getCurrentRoute(state: any): any {
    const route = state.routes[state.index];

    if (route.state) {
      return this.getCurrentRoute(route.state);
    }

    return route;
  }

  /**
   * Preload all screens (for development/testing)
   */
  async preloadAll(): Promise<void> {
    await Promise.all([
      preloadComponent(LazyKnowledgeBaseScreen),
      preloadComponent(LazyMLMDashboardScreen),
      preloadComponent(LazyEarningsScreen),
      preloadComponent(LazyChatScreen),
      preloadComponent(LazyNetworkTree),
      preloadComponent(LazyIncomeBreakdown),
      preloadComponent(LazyEarningsProjection),
      preloadComponent(LazyOrderMapView),
      preloadComponent(LazyMediaAttachment),
    ]);
  }
}

export const navigationPreloader = new NavigationPreloader();








