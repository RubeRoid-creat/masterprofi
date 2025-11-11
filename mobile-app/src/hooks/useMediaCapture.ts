/**
 * Hook for media capture
 */

import { useState, useCallback } from 'react';
import { mediaCaptureService } from '../services/mediaCaptureService';
import { galleryService } from '../services/galleryService';
import { offlineMediaQueue } from '../services/offlineMediaQueue';
import { cloudUploadService } from '../services/cloudUploadService';
import { MediaItem, PhotoCaptureOptions, VideoCaptureOptions, DocumentScanOptions } from '../types/media';
import * as NetInfo from '@react-native-community/netinfo';

export interface UseMediaCaptureOptions {
  orderId?: string;
  autoUpload?: boolean;
  autoAddToGallery?: boolean;
  onUploadComplete?: (mediaId: string, cloudUrl: string) => void;
  onUploadError?: (mediaId: string, error: Error) => void;
}

export interface UseMediaCaptureReturn {
  capturePhoto: (options?: PhotoCaptureOptions) => Promise<MediaItem | null>;
  selectPhoto: (options?: PhotoCaptureOptions) => Promise<MediaItem | null>;
  selectMultiplePhotos: (options?: PhotoCaptureOptions) => Promise<MediaItem[]>;
  recordVideo: (options?: VideoCaptureOptions) => Promise<MediaItem | null>;
  selectVideo: (options?: VideoCaptureOptions) => Promise<MediaItem | null>;
  scanDocument: (options?: DocumentScanOptions) => Promise<MediaItem | null>;
  pickDocument: () => Promise<MediaItem | null>;
  isCapturing: boolean;
  error: string | null;
}

export function useMediaCapture(
  options: UseMediaCaptureOptions = {}
): UseMediaCaptureReturn {
  const {
    orderId,
    autoUpload = true,
    autoAddToGallery = true,
    onUploadComplete,
    onUploadError,
  } = options;

  const [isCapturing, setIsCapturing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMediaItem = useCallback(
    async (mediaItem: MediaItem | null): Promise<MediaItem | null> => {
      if (!mediaItem) {
        return null;
      }

      // Add order ID if provided
      if (orderId) {
        mediaItem.orderId = orderId;
      }

      // Add to gallery
      if (autoAddToGallery) {
        await galleryService.addMedia(mediaItem);
      }

      // Upload or queue for upload
      if (autoUpload) {
        const netInfo = await NetInfo.fetch();
        if (netInfo.isConnected) {
          // Upload immediately
          try {
            const cloudUrl = await cloudUploadService.uploadMedia(mediaItem, {
              orderId,
              onProgress: (progress) => {
                // Update progress if needed
              },
            });
            mediaItem.cloudUrl = cloudUrl;
            mediaItem.uploaded = true;
            onUploadComplete?.(mediaItem.id, cloudUrl);
          } catch (err: any) {
            console.error('Upload error:', err);
            // Add to offline queue
            await offlineMediaQueue.addToQueue(mediaItem, orderId);
            onUploadError?.(mediaItem.id, err);
          }
        } else {
          // Add to offline queue
          await offlineMediaQueue.addToQueue(mediaItem, orderId);
        }
      }

      return mediaItem;
    },
    [orderId, autoUpload, autoAddToGallery, onUploadComplete, onUploadError]
  );

  const capturePhoto = useCallback(
    async (photoOptions?: PhotoCaptureOptions) => {
      setIsCapturing(true);
      setError(null);
      try {
        const mediaItem = await mediaCaptureService.capturePhoto(photoOptions);
        return await handleMediaItem(mediaItem);
      } catch (err: any) {
        setError(err.message || 'Failed to capture photo');
        return null;
      } finally {
        setIsCapturing(false);
      }
    },
    [handleMediaItem]
  );

  const selectPhoto = useCallback(
    async (photoOptions?: PhotoCaptureOptions) => {
      setIsCapturing(true);
      setError(null);
      try {
        const mediaItem = await mediaCaptureService.selectPhoto(photoOptions);
        return await handleMediaItem(mediaItem);
      } catch (err: any) {
        setError(err.message || 'Failed to select photo');
        return null;
      } finally {
        setIsCapturing(false);
      }
    },
    [handleMediaItem]
  );

  const selectMultiplePhotos = useCallback(
    async (photoOptions?: PhotoCaptureOptions) => {
      setIsCapturing(true);
      setError(null);
      try {
        const mediaItems = await mediaCaptureService.selectMultiplePhotos(photoOptions);
        const processedItems: MediaItem[] = [];
        for (const item of mediaItems) {
          const processed = await handleMediaItem(item);
          if (processed) {
            processedItems.push(processed);
          }
        }
        return processedItems;
      } catch (err: any) {
        setError(err.message || 'Failed to select photos');
        return [];
      } finally {
        setIsCapturing(false);
      }
    },
    [handleMediaItem]
  );

  const recordVideo = useCallback(
    async (videoOptions?: VideoCaptureOptions) => {
      setIsCapturing(true);
      setError(null);
      try {
        const mediaItem = await mediaCaptureService.recordVideo(videoOptions);
        return await handleMediaItem(mediaItem);
      } catch (err: any) {
        setError(err.message || 'Failed to record video');
        return null;
      } finally {
        setIsCapturing(false);
      }
    },
    [handleMediaItem]
  );

  const selectVideo = useCallback(
    async (videoOptions?: VideoCaptureOptions) => {
      setIsCapturing(true);
      setError(null);
      try {
        const mediaItem = await mediaCaptureService.selectVideo(videoOptions);
        return await handleMediaItem(mediaItem);
      } catch (err: any) {
        setError(err.message || 'Failed to select video');
        return null;
      } finally {
        setIsCapturing(false);
      }
    },
    [handleMediaItem]
  );

  const scanDocument = useCallback(
    async (scanOptions?: DocumentScanOptions) => {
      setIsCapturing(true);
      setError(null);
      try {
        const mediaItem = await mediaCaptureService.scanDocument(scanOptions);
        return await handleMediaItem(mediaItem);
      } catch (err: any) {
        setError(err.message || 'Failed to scan document');
        return null;
      } finally {
        setIsCapturing(false);
      }
    },
    [handleMediaItem]
  );

  const pickDocument = useCallback(async () => {
    setIsCapturing(true);
    setError(null);
    try {
      const mediaItem = await mediaCaptureService.pickDocument();
      return await handleMediaItem(mediaItem);
    } catch (err: any) {
      setError(err.message || 'Failed to pick document');
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [handleMediaItem]);

  return {
    capturePhoto,
    selectPhoto,
    selectMultiplePhotos,
    recordVideo,
    selectVideo,
    scanDocument,
    pickDocument,
    isCapturing,
    error,
  };
}








