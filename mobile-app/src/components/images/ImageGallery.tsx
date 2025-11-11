/**
 * Image Gallery Component
 * Gallery with progressive loading and preloading
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { OptimizedImage } from './OptimizedImage';
import { imageService } from '../../services/imageService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface ImageGalleryProps {
  images: string[];
  initialIndex?: number;
  thumbnailSize?: number;
  showThumbnails?: boolean;
  onImagePress?: (index: number, uri: string) => void;
  imageProps?: Omit<React.ComponentProps<typeof OptimizedImage>, 'source'>;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  initialIndex = 0,
  thumbnailSize = 80,
  showThumbnails = true,
  onImagePress,
  imageProps = {},
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scrollViewRef = React.useRef<ScrollView>(null);

  // Preload adjacent images
  useEffect(() => {
    const preloadImages = [
      images[currentIndex - 1],
      images[currentIndex],
      images[currentIndex + 1],
    ].filter(Boolean) as string[];

    if (preloadImages.length > 0) {
      imageService.preloadImages(preloadImages, { priority: 'high' });
    }

    // Preload next few images with lower priority
    const nextImages = images.slice(currentIndex + 1, currentIndex + 4).filter(Boolean);
    if (nextImages.length > 0) {
      imageService.preloadImages(nextImages, { priority: 'normal' });
    }
  }, [currentIndex, images]);

  // Preload thumbnails
  useEffect(() => {
    if (showThumbnails && images.length > 0) {
      const thumbnailUris = images.map((uri) => imageService.getOptimizedUri(uri, { width: thumbnailSize, height: thumbnailSize }));
      imageService.preloadImages(thumbnailUris, { priority: 'low', format: 'jpeg' });
    }
  }, [images, showThumbnails, thumbnailSize]);

  const handleScroll = useCallback(
    (event: any) => {
      const contentOffsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffsetX / SCREEN_WIDTH);
      if (index !== currentIndex && index >= 0 && index < images.length) {
        setCurrentIndex(index);
      }
    },
    [currentIndex, images.length]
  );

  const handleThumbnailPress = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      scrollViewRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    },
    []
  );

  const handleImagePress = useCallback(
    () => {
      onImagePress?.(currentIndex, images[currentIndex]);
    },
    [currentIndex, images, onImagePress]
  );

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        initialScrollIndex={initialIndex}
        getItemLayout={(data, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
      >
        {images.map((uri, index) => (
          <TouchableOpacity
            key={`${uri}-${index}`}
            activeOpacity={0.9}
            onPress={handleImagePress}
            style={styles.imageContainer}
          >
            <OptimizedImage
              source={uri}
              width={SCREEN_WIDTH}
              height={SCREEN_WIDTH}
              progressive
              priority={index === currentIndex ? 'high' : 'normal'}
              contentFit="contain"
              {...imageProps}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {showThumbnails && images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailsContainer}
          contentContainerStyle={styles.thumbnailsContent}
        >
          {images.map((uri, index) => (
            <TouchableOpacity
              key={`thumb-${uri}-${index}`}
              onPress={() => handleThumbnailPress(index)}
              style={[
                styles.thumbnail,
                {
                  width: thumbnailSize,
                  height: thumbnailSize,
                  borderWidth: index === currentIndex ? 3 : 1,
                  borderColor: index === currentIndex ? '#3B82F6' : '#E5E7EB',
                },
              ]}
            >
              <OptimizedImage
                source={uri}
                width={thumbnailSize}
                height={thumbnailSize}
                priority="low"
                contentFit="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailsContainer: {
    maxHeight: 100,
    paddingVertical: 10,
  },
  thumbnailsContent: {
    paddingHorizontal: 10,
  },
  thumbnail: {
    marginHorizontal: 5,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
});








