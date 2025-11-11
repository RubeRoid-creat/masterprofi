/**
 * useOptimizedList Hook
 * Provides optimized FlatList configuration for better performance
 */

import { useMemo, useCallback, useRef } from 'react';
import { FlatListProps, ListRenderItem, ViewToken } from 'react-native';

export interface OptimizedListConfig {
  windowSize?: number;
  initialNumToRender?: number;
  maxToRenderPerBatch?: number;
  updateCellsBatchingPeriod?: number;
  removeClippedSubviews?: boolean;
  getItemLayout?: (data: any, index: number) => { length: number; offset: number; index: number };
}

const DEFAULT_CONFIG: Required<OptimizedListConfig> = {
  windowSize: 10,
  initialNumToRender: 10,
  maxToRenderPerBatch: 10,
  updateCellsBatchingPeriod: 50,
  removeClippedSubviews: true,
  getItemLayout: () => ({ length: 0, offset: 0, index: 0 }),
};

/**
 * Hook for optimizing FlatList performance
 */
export function useOptimizedList<T>(
  data: T[],
  itemHeight?: number,
  config?: OptimizedListConfig
) {
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    minimumViewTime: 100,
  });

  const onViewableItemsChanged = useRef<
    ((info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => void) | null
  >(null);

  const getItemLayout = useMemo(() => {
    if (!itemHeight) return undefined;

    return (data: any, index: number) => ({
      length: itemHeight,
      offset: itemHeight * index,
      index,
    });
  }, [itemHeight]);

  const optimizedProps = useMemo<Partial<FlatListProps<T>>>(() => {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };

    return {
      windowSize: mergedConfig.windowSize,
      initialNumToRender: mergedConfig.initialNumToRender,
      maxToRenderPerBatch: mergedConfig.maxToRenderPerBatch,
      updateCellsBatchingPeriod: mergedConfig.updateCellsBatchingPeriod,
      removeClippedSubviews: mergedConfig.removeClippedSubviews,
      getItemLayout: getItemLayout || mergedConfig.getItemLayout,
      viewabilityConfig: viewabilityConfig.current,
      onViewableItemsChanged: onViewableItemsChanged.current
        ? ({ viewableItems, changed }) => {
            onViewableItemsChanged.current?.({ viewableItems, changed });
          }
        : undefined,
    };
  }, [getItemLayout, config]);

  const setOnViewableItemsChanged = useCallback(
    (callback: (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => void) => {
      onViewableItemsChanged.current = callback;
    },
    []
  );

  return {
    optimizedProps,
    setOnViewableItemsChanged,
  };
}

