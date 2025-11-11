/**
 * Lazy-loaded components
 * These components are loaded on-demand to reduce initial bundle size
 */

import { lazy } from 'react';
import { withSuspense, DefaultLoadingComponent } from '../../utils/lazyLoading';

// Knowledge Base Screens
export const LazyKnowledgeBaseScreen = lazy(
  () => import('../../screens/KnowledgeBaseScreen').then((module) => ({ default: module.KnowledgeBaseScreen }))
);

// MLM Network Visualization
export const LazyNetworkTree = lazy(
  () => import('../mlm/NetworkTree').then((module) => ({ default: module.NetworkTree }))
);
export const LazyMLMDashboardScreen = lazy(
  () => import('../../screens/MLMDashboardScreen').then((module) => ({ default: module.MLMDashboardScreen }))
);

// Earnings Charts
export const LazyIncomeBreakdown = lazy(
  () => import('../earnings/IncomeBreakdown').then((module) => ({ default: module.IncomeBreakdown }))
);
export const LazyEarningsProjection = lazy(
  () => import('../earnings/EarningsProjection').then((module) => ({ default: module.EarningsProjection }))
);
export const LazyEarningsScreen = lazy(
  () => import('../../screens/EarningsScreen').then((module) => ({ default: module.EarningsScreen }))
);

// Map Components
export const LazyOrderMapView = lazy(
  () => import('../orders/OrderMapView').then((module) => ({ default: module.OrderMapView }))
);
export const LazyNavigationButton = lazy(
  () => import('../location/NavigationButton').then((module) => ({ default: module.NavigationButton }))
);

// Chat Media Viewer
export const LazyMediaAttachment = lazy(
  () => import('../chat/MediaAttachment').then((module) => ({ default: module.MediaAttachment }))
);
export const LazyChatScreen = lazy(
  () => import('../../screens/ChatScreen').then((module) => ({ default: module.ChatScreen }))
);

// Wrapped components with Suspense
export const KnowledgeBaseScreen = withSuspense(LazyKnowledgeBaseScreen, DefaultLoadingComponent, 'Loading Knowledge Base...');
export const NetworkTree = withSuspense(LazyNetworkTree, DefaultLoadingComponent, 'Loading Network...');
export const MLMDashboardScreen = withSuspense(LazyMLMDashboardScreen, DefaultLoadingComponent, 'Loading Network Dashboard...');
export const IncomeBreakdown = withSuspense(LazyIncomeBreakdown, DefaultLoadingComponent, 'Loading Earnings...');
export const EarningsProjection = withSuspense(LazyEarningsProjection, DefaultLoadingComponent, 'Loading Projections...');
export const EarningsScreen = withSuspense(LazyEarningsScreen, DefaultLoadingComponent, 'Loading Earnings...');
export const OrderMapView = withSuspense(LazyOrderMapView, DefaultLoadingComponent, 'Loading Map...');
export const NavigationButton = withSuspense(LazyNavigationButton, DefaultLoadingComponent);
export const MediaAttachment = withSuspense(LazyMediaAttachment, DefaultLoadingComponent, 'Loading Media...');
export const ChatScreen = withSuspense(LazyChatScreen, DefaultLoadingComponent, 'Loading Chat...');

