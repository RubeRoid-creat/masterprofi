/**
 * Lazy Loading Utilities
 * Provides preloading strategies and loading wrappers
 */

import React, { ComponentType, LazyExoticComponent, Suspense } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme';

export interface PreloadOptions {
  priority?: 'high' | 'medium' | 'low';
  preloadOn?: 'hover' | 'focus' | 'mount' | 'idle';
}

/**
 * Default loading component
 */
export const DefaultLoadingComponent: React.FC<{ message?: string }> = ({ message }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={colors.primary[600]} />
    {message && (
      <Text style={styles.loadingText}>{message}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.secondary,
  },
  loadingText: {
    marginTop: spacing.md,
    ...typography.body.small,
    color: colors.text.secondary,
  },
});

/**
 * Suspense wrapper with loading fallback
 */
export function withSuspense<P extends object>(
  Component: LazyExoticComponent<ComponentType<P>>,
  LoadingComponent: React.FC = DefaultLoadingComponent,
  message?: string
): React.FC<P> {
  return (props: P) => (
    <Suspense fallback={<LoadingComponent message={message} />}>
      <Component {...props} />
    </Suspense>
  );
}

/**
 * Preload component
 */
export async function preloadComponent(
  lazyComponent: LazyExoticComponent<ComponentType<any>>
): Promise<void> {
  try {
    await lazyComponent._payload._result;
  } catch (error) {
    console.error('Error preloading component:', error);
  }
}

/**
 * Preload strategy: Preload on idle
 */
export function createIdlePreloader(
  lazyComponent: LazyExoticComponent<ComponentType<any>>,
  delay: number = 2000
): () => void {
  let timeoutId: NodeJS.Timeout;
  let rafId: number;

  const preload = () => {
    if (typeof requestIdleCallback !== 'undefined') {
      requestIdleCallback(() => {
        preloadComponent(lazyComponent);
      });
    } else {
      timeoutId = setTimeout(() => {
        preloadComponent(lazyComponent);
      }, delay);
    }
  };

  const start = () => {
    if (typeof requestAnimationFrame !== 'undefined') {
      rafId = requestAnimationFrame(preload);
    } else {
      preload();
    }
  };

  const cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    if (rafId) cancelAnimationFrame(rafId);
  };

  start();
  return cancel;
}

/**
 * Preload strategy: Preload on navigation
 */
export function createNavigationPreloader(
  lazyComponent: LazyExoticComponent<ComponentType<any>>,
  navigator: any
): () => void {
  const unsubscribe = navigator.addListener('focus', () => {
    preloadComponent(lazyComponent);
  });

  return unsubscribe;
}

/**
 * Batch preload multiple components
 */
export async function preloadComponents(
  components: LazyExoticComponent<ComponentType<any>>[]
): Promise<void> {
  await Promise.all(components.map((component) => preloadComponent(component)));
}

/**
 * Priority-based preloader
 */
export class PriorityPreloader {
  private highPriority: Set<LazyExoticComponent<ComponentType<any>>> = new Set();
  private mediumPriority: Set<LazyExoticComponent<ComponentType<any>>> = new Set();
  private lowPriority: Set<LazyExoticComponent<ComponentType<any>>> = new Set();
  private isProcessing: boolean = false;

  add(
    component: LazyExoticComponent<ComponentType<any>>,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): void {
    switch (priority) {
      case 'high':
        this.highPriority.add(component);
        break;
      case 'medium':
        this.mediumPriority.add(component);
        break;
      case 'low':
        this.lowPriority.add(component);
        break;
    }

    if (priority === 'high' && !this.isProcessing) {
      this.process();
    }
  }

  private async process(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;

    try {
      // Preload high priority first
      await preloadComponents(Array.from(this.highPriority));
      this.highPriority.clear();

      // Then medium priority
      await new Promise((resolve) => setTimeout(resolve, 100));
      await preloadComponents(Array.from(this.mediumPriority));
      this.mediumPriority.clear();

      // Finally low priority
      await new Promise((resolve) => setTimeout(resolve, 500));
      await preloadComponents(Array.from(this.lowPriority));
      this.lowPriority.clear();
    } finally {
      this.isProcessing = false;
    }
  }

  async preloadAll(): Promise<void> {
    await this.process();
  }
}

export const priorityPreloader = new PriorityPreloader();

