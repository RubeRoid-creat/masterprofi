/**
 * Optimized Image Component
 * Supports progressive loading, caching, WebP, and memory management
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { Image } from 'expo-image';
import { imageService, ImageOptions } from '../../services/imageService';

export interface OptimizedImageProps {
  source: string | { uri: string };
  width?: number;
  height?: number;
  style?: ViewStyle | ImageStyle;
  placeholder?: string;
  placeholderStyle?: ViewStyle;
  progressive?: boolean;
  priority?: 'low' | 'normal' | 'high';
  format?: 'webp' | 'jpeg' | 'png';
  quality?: number;
  onLoad?: () => void;
  onError?: (error: any) => void;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center' | 'repeat';
  transition?: number;
  contentFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scaleDown';
  cachePolicy?: 'none' | 'disk' | 'memory' | 'memory-disk';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  width,
  height,
  style,
  placeholder,
  placeholderStyle,
  progressive = true,
  priority = 'normal',
  format = 'webp',
  quality = 80,
  onLoad,
  onError,
  resizeMode = 'cover',
  transition = 200,
  contentFit = 'cover',
  cachePolicy = 'memory-disk',
}) => {
  const [imageUri, setImageUri] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [blurhash, setBlurhash] = useState<string | undefined>(undefined);

  const uri = typeof source === 'string' ? source : source.uri;

  useEffect(() => {
    let cancelled = false;

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        // Get optimized URI with caching
        const optimizedUri = await imageService.loadImage(uri, {
          width,
          height,
          quality,
          format: imageService.supportsWebP() ? format : 'jpeg',
          progressive,
          priority,
        });

        if (!cancelled) {
          setImageUri(optimizedUri);
          setIsLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Error loading image:', error);
          setHasError(true);
          setIsLoading(false);
          onError?.(error);
        }
      }
    };

    loadImage();

    return () => {
      cancelled = true;
    };
  }, [uri, width, height, quality, format, progressive, priority]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback((error: any) => {
    setHasError(true);
    setIsLoading(false);
    onError?.(error);
  }, [onError]);

  // Show placeholder while loading
  if (isLoading && placeholder) {
    return (
      <View style={[styles.container, { width, height }, style]}>
        <Image
          source={{ uri: placeholder }}
          style={[StyleSheet.absoluteFill, placeholderStyle]}
          contentFit={contentFit}
          cachePolicy={cachePolicy}
        />
        {progressive && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color="#3B82F6" />
          </View>
        )}
      </View>
    );
  }

  // Show error placeholder
  if (hasError && placeholder) {
    return (
      <View style={[styles.container, { width, height }, style]}>
        <Image
          source={{ uri: placeholder }}
          style={[StyleSheet.absoluteFill, placeholderStyle]}
          contentFit={contentFit}
          cachePolicy={cachePolicy}
        />
      </View>
    );
  }

  // Show main image
  return (
    <View style={[styles.container, { width, height }, style]}>
      {imageUri ? (
        <Image
          source={{ uri: imageUri }}
          style={StyleSheet.absoluteFill}
          contentFit={contentFit}
          cachePolicy={cachePolicy}
          transition={transition}
          onLoad={handleLoad}
          onError={handleError}
          placeholder={blurhash}
          placeholderContentFit="cover"
        />
      ) : (
        <View style={styles.placeholder}>
          {progressive && <ActivityIndicator size="small" color="#3B82F6" />}
        </View>
      )}
      {isLoading && progressive && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#3B82F6" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
});








