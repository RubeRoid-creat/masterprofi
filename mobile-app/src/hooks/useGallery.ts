/**
 * Hook for media gallery management
 */

import { useState, useEffect, useCallback } from 'react';
import { galleryService } from '../services/galleryService';
import { MediaItem } from '../types/media';

export interface UseGalleryOptions {
  orderId?: string;
  type?: MediaItem['type'];
  autoLoad?: boolean;
}

export interface UseGalleryReturn {
  media: MediaItem[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addMedia: (item: MediaItem) => Promise<void>;
  removeMedia: (mediaId: string) => Promise<void>;
  updateMedia: (mediaId: string, updates: Partial<MediaItem>) => Promise<void>;
  search: (query: string) => MediaItem[];
  getByDateRange: (startDate: Date, endDate: Date) => MediaItem[];
  getTotalSize: () => Promise<number>;
  getCount: () => number;
}

export function useGallery(options: UseGalleryOptions = {}): UseGalleryReturn {
  const { orderId, type, autoLoad = true } = options;

  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await galleryService.initialize();
      
      let allMedia = galleryService.getAllMedia();

      // Filter by order if specified
      if (orderId) {
        allMedia = galleryService.getMediaByOrder(orderId);
      }

      // Filter by type if specified
      if (type) {
        allMedia = allMedia.filter((item) => item.type === type);
      }

      setMedia(allMedia);
    } catch (err: any) {
      setError(err.message || 'Failed to load gallery');
    } finally {
      setIsLoading(false);
    }
  }, [orderId, type]);

  const addMedia = useCallback(async (item: MediaItem) => {
    try {
      await galleryService.addMedia(item);
      await refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to add media');
    }
  }, [refresh]);

  const removeMedia = useCallback(async (mediaId: string) => {
    try {
      await galleryService.removeMedia(mediaId);
      await refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to remove media');
    }
  }, [refresh]);

  const updateMedia = useCallback(
    async (mediaId: string, updates: Partial<MediaItem>) => {
      try {
        await galleryService.updateMedia(mediaId, updates);
        await refresh();
      } catch (err: any) {
        setError(err.message || 'Failed to update media');
      }
    },
    [refresh]
  );

  const search = useCallback(
    (query: string): MediaItem[] => {
      let results = galleryService.searchMedia(query);
      
      if (orderId) {
        results = results.filter((item) => item.orderId === orderId);
      }
      
      if (type) {
        results = results.filter((item) => item.type === type);
      }
      
      return results;
    },
    [orderId, type]
  );

  const getByDateRange = useCallback(
    (startDate: Date, endDate: Date): MediaItem[] => {
      let results = galleryService.getMediaByDateRange(startDate, endDate);
      
      if (orderId) {
        results = results.filter((item) => item.orderId === orderId);
      }
      
      if (type) {
        results = results.filter((item) => item.type === type);
      }
      
      return results;
    },
    [orderId, type]
  );

  const getTotalSize = useCallback(async (): Promise<number> => {
    return await galleryService.getTotalSize();
  }, []);

  const getCount = useCallback((): number => {
    return galleryService.getMediaCount();
  }, []);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      refresh();
    }
  }, [autoLoad, refresh]);

  return {
    media,
    isLoading,
    error,
    refresh,
    addMedia,
    removeMedia,
    updateMedia,
    search,
    getByDateRange,
    getTotalSize,
    getCount,
  };
}








