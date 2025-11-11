/**
 * Lazy Image List Component
 * Optimized FlatList with lazy loading images
 */

import React, { useCallback, useMemo } from 'react';
import { FlatList, FlatListProps, ViewToken } from 'react-native';
import { OptimizedImage, OptimizedImageProps } from './OptimizedImage';
import { imageService } from '../../services/imageService';

export interface LazyImageItem {
  id: string;
  imageUri: string;
  width?: number;
  height?: number;
  [key: string]: any;
}

export interface LazyImageListProps<T extends LazyImageItem> extends Omit<FlatListProps<T>, 'renderItem'> {
  data: T[];
  imageKey: keyof T;
  imageProps?: Omit<OptimizedImageProps, 'source'>;
  onViewableItemsChanged?: (viewableItems: ViewToken[], changed: ViewToken[]) => void;
  preloadCount?: number;
}

export function LazyImageList<T extends LazyImageItem>({
  data,
  imageKey,
  imageProps = {},
  onViewableItemsChanged,
  preloadCount = 5,
  ...flatListProps
}: LazyImageListProps<T>) {
  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 50,
      minimumViewTime: 100,
    }),
    []
  );

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems, changed }: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
      // Preload images for visible items
      const visibleUris = viewableItems
        .slice(0, preloadCount)
        .map((item) => {
          const imageItem = item.item as T;
          return imageItem[imageKey] as string;
        })
        .filter(Boolean);

      if (visibleUris.length > 0) {
        imageService.preloadImages(visibleUris, { priority: 'high' });
      }

      // Preload next items
      const nextItems = data
        .slice(
          viewableItems[viewableItems.length - 1]?.index || 0,
          (viewableItems[viewableItems.length - 1]?.index || 0) + preloadCount
        )
        .map((item) => item[imageKey] as string)
        .filter(Boolean);

      if (nextItems.length > 0) {
        imageService.preloadImages(nextItems, { priority: 'normal' });
      }

      onViewableItemsChanged?.(viewableItems, changed);
    },
    [data, imageKey, preloadCount, onViewableItemsChanged]
  );

  const renderItem = useCallback(
    ({ item }: { item: T }) => {
      const imageUri = item[imageKey] as string;
      return (
        <OptimizedImage
          source={imageUri}
          width={item.width || imageProps.width}
          height={item.height || imageProps.height}
          priority="low"
          progressive
          {...imageProps}
        />
      );
    },
    [imageKey, imageProps]
  );

  return (
    <FlatList
      {...flatListProps}
      data={data}
      renderItem={renderItem}
      viewabilityConfig={viewabilityConfig}
      onViewableItemsChanged={handleViewableItemsChanged}
      removeClippedSubviews
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={10}
    />
  );
}








