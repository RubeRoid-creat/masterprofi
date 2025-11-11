/**
 * Image Service
 * Handles image loading, caching, optimization, and memory management
 */

import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Cache directory (only used on native platforms)
const CACHE_DIR = Platform.OS === 'web' 
  ? '' // Not used on web
  : `${FileSystem.cacheDirectory || ''}images/`;
const CACHE_METADATA_KEY = 'image_cache_metadata';
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface ImageCacheMetadata {
  [url: string]: {
    path: string;
    size: number;
    timestamp: number;
    format: string;
  };
}

export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  progressive?: boolean;
  priority?: 'low' | 'normal' | 'high';
}

export interface PreloadOptions {
  priority?: 'low' | 'normal' | 'high';
  format?: 'webp' | 'jpeg' | 'png';
}

class ImageService {
  private cacheMetadata: ImageCacheMetadata = {};
  private preloadQueue: Map<string, Promise<void>> = new Map();
  private memoryCache: Map<string, string> = new Map();
  private maxMemoryCacheSize: number = 50 * 1024 * 1024; // 50MB
  private currentMemoryCacheSize: number = 0;

  /**
   * Initialize image service
   */
  async initialize(): Promise<void> {
    // FileSystem is not available on web platform
    if (Platform.OS === 'web') {
      console.warn('ImageService: FileSystem caching not available on web. Using memory cache only.');
      // Load cache metadata (from AsyncStorage, which works on web)
      await this.loadCacheMetadata();
      return;
    }

    try {
      // Create cache directory
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
      }

      // Load cache metadata
      await this.loadCacheMetadata();

      // Clean up old cache
      await this.cleanupCache();
    } catch (error) {
      console.warn('ImageService: Failed to initialize file cache:', error);
      // Continue without file cache
    }
  }

  /**
   * Get optimized image URI
   */
  getOptimizedUri(
    uri: string,
    options: ImageOptions = {}
  ): string {
    const {
      width,
      height,
      quality = 80,
      format = 'webp',
    } = options;

    // If already optimized or local file, return as-is
    if (uri.startsWith('file://') || uri.startsWith('http://localhost')) {
      return uri;
    }

    // For remote images, add optimization parameters
    // Note: This assumes your backend supports image optimization
    // Replace with your image CDN or optimization service
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    if (quality) params.append('q', quality.toString());
    if (format !== 'jpeg') params.append('format', format);

    const separator = uri.includes('?') ? '&' : '?';
    return `${uri}${separator}${params.toString()}`;
  }

  /**
   * Check if WebP is supported
   */
  supportsWebP(): boolean {
    // React Native generally supports WebP
    // Check platform-specific support
    return Platform.OS !== 'web' || typeof Image !== 'undefined';
  }

  /**
   * Load image with caching
   */
  async loadImage(
    uri: string,
    options: ImageOptions = {}
  ): Promise<string> {
    // Check memory cache first
    const memoryCached = this.memoryCache.get(uri);
    if (memoryCached) {
      return memoryCached;
    }

    // Check disk cache
    const cachedPath = await this.getCachedPath(uri);
    if (cachedPath) {
      // Update last accessed
      await this.updateCacheMetadata(uri, cachedPath);
      // Add to memory cache
      this.addToMemoryCache(uri, cachedPath);
      return cachedPath;
    }

    // Load and cache image
    return this.downloadAndCache(uri, options);
  }

  /**
   * Get cached image path
   */
  private async getCachedPath(uri: string): Promise<string | null> {
    // On web, use memory cache only
    if (Platform.OS === 'web') {
      return this.memoryCache.get(uri) || null;
    }

    const metadata = this.cacheMetadata[uri];
    if (!metadata) {
      return null;
    }

    try {
      // Check if file exists and is not expired
      const fileInfo = await FileSystem.getInfoAsync(metadata.path);
      if (!fileInfo.exists) {
        delete this.cacheMetadata[uri];
        await this.saveCacheMetadata();
        return null;
      }

      const age = Date.now() - metadata.timestamp;
      if (age > MAX_CACHE_AGE) {
        // File expired, delete it
        await FileSystem.deleteAsync(metadata.path, { idempotent: true });
        delete this.cacheMetadata[uri];
        await this.saveCacheMetadata();
        return null;
      }

      return metadata.path;
    } catch (error) {
      console.warn('ImageService: Error checking cache path:', error);
      return null;
    }
  }

  /**
   * Download and cache image
   */
  private async downloadAndCache(
    uri: string,
    options: ImageOptions
  ): Promise<string> {
    // On web, just return the optimized URI (no file caching)
    if (Platform.OS === 'web') {
      const optimizedUri = this.getOptimizedUri(uri, options);
      // Add to memory cache for quick access
      this.addToMemoryCache(uri, optimizedUri);
      return optimizedUri;
    }

    try {
      const optimizedUri = this.getOptimizedUri(uri, options);
      const filename = this.getCacheFilename(uri, options.format || 'webp');
      const cachePath = `${CACHE_DIR}${filename}`;

      // Download image
      const downloadResult = await FileSystem.downloadAsync(optimizedUri, cachePath);

      // Get file size
      const fileInfo = await FileSystem.getInfoAsync(downloadResult.uri);
      const size = (fileInfo as any).size || 0;

      // Save metadata
      await this.updateCacheMetadata(uri, downloadResult.uri, size, options.format || 'webp');

      // Add to memory cache
      this.addToMemoryCache(uri, downloadResult.uri);

      return downloadResult.uri;
    } catch (error) {
      console.error(`Failed to download and cache image: ${uri}`, error);
      // Fallback to original URI
      return uri;
    }
  }

  /**
   * Get cache filename
   */
  private getCacheFilename(uri: string, format: string): string {
    const hash = this.hashString(uri);
    return `${hash}.${format}`;
  }

  /**
   * Simple string hash
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Update cache metadata
   */
  private async updateCacheMetadata(
    uri: string,
    path: string,
    size?: number,
    format?: string
  ): Promise<void> {
    // On web, skip file system metadata
    if (Platform.OS === 'web') {
      return;
    }

    try {
      const fileInfo = await FileSystem.getInfoAsync(path);
      const actualSize = size || ((fileInfo as any).size || 0);

      this.cacheMetadata[uri] = {
        path,
        size: actualSize,
        timestamp: Date.now(),
        format: format || 'webp',
      };

      await this.saveCacheMetadata();
    } catch (error) {
      console.warn('ImageService: Error updating cache metadata:', error);
    }
  }

  /**
   * Add to memory cache
   */
  private addToMemoryCache(uri: string, path: string): void {
    // Check if we need to free memory
    if (this.currentMemoryCacheSize >= this.maxMemoryCacheSize) {
      this.evictMemoryCache();
    }

    this.memoryCache.set(uri, path);
    // Estimate memory usage (rough approximation)
    this.currentMemoryCacheSize += 1024 * 1024; // 1MB per image estimate
  }

  /**
   * Evict memory cache (LRU strategy)
   */
  private evictMemoryCache(): void {
    // Remove oldest 25% of cache
    const entries = Array.from(this.memoryCache.entries());
    const toRemove = Math.ceil(entries.length * 0.25);

    for (let i = 0; i < toRemove; i++) {
      const [uri] = entries[i];
      this.memoryCache.delete(uri);
      this.currentMemoryCacheSize -= 1024 * 1024;
    }
  }

  /**
   * Preload images
   */
  async preloadImages(
    uris: string[],
    options: PreloadOptions = {}
  ): Promise<void> {
    const { priority = 'normal', format = 'webp' } = options;

    // Sort by priority
    const highPriority: string[] = [];
    const normalPriority: string[] = [];
    const lowPriority: string[] = [];

    uris.forEach((uri) => {
      if (priority === 'high') {
        highPriority.push(uri);
      } else if (priority === 'normal') {
        normalPriority.push(uri);
      } else {
        lowPriority.push(uri);
      }
    });

    // Preload in priority order
    await Promise.all([
      ...highPriority.map((uri) => this.preloadImage(uri, { ...options, priority: 'high', format })),
      ...normalPriority.map((uri) => this.preloadImage(uri, { ...options, priority: 'normal', format })),
      ...lowPriority.map((uri) => this.preloadImage(uri, { ...options, priority: 'low', format })),
    ]);
  }

  /**
   * Preload single image
   */
  async preloadImage(uri: string, options: PreloadOptions = {}): Promise<void> {
    // Check if already preloading
    if (this.preloadQueue.has(uri)) {
      return this.preloadQueue.get(uri)!;
    }

    const preloadPromise = this.loadImage(uri, {
      format: options.format || 'webp',
      quality: 75, // Lower quality for preload
      priority: options.priority || 'low',
    });

    this.preloadQueue.set(uri, preloadPromise);

    try {
      await preloadPromise;
    } finally {
      this.preloadQueue.delete(uri);
    }
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();
    this.currentMemoryCacheSize = 0;

    // Clear disk cache (only on native platforms)
    if (Platform.OS !== 'web') {
      try {
        const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
        await Promise.all(
          files.map((file) => FileSystem.deleteAsync(`${CACHE_DIR}${file}`, { idempotent: true }))
        );
      } catch (error) {
        console.warn('ImageService: Error clearing disk cache:', error);
      }
    }

    // Clear metadata
    this.cacheMetadata = {};
    await this.saveCacheMetadata();
  }

  /**
   * Get cache size
   */
  async getCacheSize(): Promise<number> {
    let totalSize = 0;
    for (const metadata of Object.values(this.cacheMetadata)) {
      totalSize += metadata.size;
    }
    return totalSize;
  }

  /**
   * Cleanup old cache
   */
  private async cleanupCache(): Promise<void> {
    // Skip file system cleanup on web
    if (Platform.OS === 'web') {
      // Just clear old metadata
      const now = Date.now();
      for (const [uri, metadata] of Object.entries(this.cacheMetadata)) {
        const age = now - metadata.timestamp;
        if (age > MAX_CACHE_AGE) {
          delete this.cacheMetadata[uri];
        }
      }
      await this.saveCacheMetadata();
      return;
    }

    const now = Date.now();
    const toDelete: string[] = [];

    for (const [uri, metadata] of Object.entries(this.cacheMetadata)) {
      const age = now - metadata.timestamp;
      if (age > MAX_CACHE_AGE) {
        toDelete.push(uri);
      }
    }

    // Delete expired files
    try {
      await Promise.all(
        toDelete.map(async (uri) => {
          const metadata = this.cacheMetadata[uri];
          if (metadata) {
            await FileSystem.deleteAsync(metadata.path, { idempotent: true });
            delete this.cacheMetadata[uri];
          }
        })
      );
    } catch (error) {
      console.warn('ImageService: Error cleaning up cache:', error);
    }

    // Check total cache size
    const cacheSize = await this.getCacheSize();
    if (cacheSize > MAX_CACHE_SIZE) {
      await this.evictOldCache();
    }

    await this.saveCacheMetadata();
  }

  /**
   * Evict oldest cache entries
   */
  private async evictOldCache(): Promise<void> {
    // Skip file system operations on web
    if (Platform.OS === 'web') {
      // Just remove from memory cache
      const entries = Object.entries(this.cacheMetadata)
        .sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const targetSize = MAX_CACHE_SIZE * 0.8;
      let currentSize = await this.getCacheSize();
      
      for (const [uri] of entries) {
        if (currentSize <= targetSize) {
          break;
        }
        const metadata = this.cacheMetadata[uri];
        if (metadata) {
          this.memoryCache.delete(uri);
          delete this.cacheMetadata[uri];
          currentSize -= metadata.size;
        }
      }
      await this.saveCacheMetadata();
      return;
    }

    try {
      const entries = Object.entries(this.cacheMetadata)
        .sort((a, b) => a[1].timestamp - b[1].timestamp); // Sort by timestamp

      const targetSize = MAX_CACHE_SIZE * 0.8; // Reduce to 80%
      let currentSize = await this.getCacheSize();

      for (const [uri, metadata] of entries) {
        if (currentSize <= targetSize) {
          break;
        }

        await FileSystem.deleteAsync(metadata.path, { idempotent: true });
        delete this.cacheMetadata[uri];
        currentSize -= metadata.size;
      }
    } catch (error) {
      console.warn('ImageService: Error evicting old cache:', error);
    }
  }

  /**
   * Load cache metadata
   */
  private async loadCacheMetadata(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(CACHE_METADATA_KEY);
      if (stored) {
        this.cacheMetadata = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading cache metadata:', error);
      this.cacheMetadata = {};
    }
  }

  /**
   * Save cache metadata
   */
  private async saveCacheMetadata(): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(this.cacheMetadata));
    } catch (error) {
      console.error('Error saving cache metadata:', error);
    }
  }
}

export const imageService = new ImageService();

