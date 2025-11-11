/**
 * Media Capture Service
 * Handles photo, video, and document capture
 */

import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Platform, Alert } from 'react-native';
import { MediaItem, PhotoCaptureOptions, VideoCaptureOptions, DocumentScanOptions } from '../types/media';
import { imageCompressionService } from './imageCompressionService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MEDIA_STORAGE_KEY = 'cached_media_items';

class MediaCaptureService {
  /**
   * Request camera permissions
   */
  async requestCameraPermissions(): Promise<boolean> {
    try {
      // Use ImagePicker for camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Camera access is required to capture photos and videos.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting camera permission:', error);
      return false;
    }
  }

  /**
   * Request media library permissions
   */
  async requestMediaLibraryPermissions(): Promise<boolean> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Photo library access is required to select media.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting media library permission:', error);
      return false;
    }
  }

  /**
   * Capture photo from camera
   */
  async capturePhoto(options: PhotoCaptureOptions = {}): Promise<MediaItem | null> {
    try {
      const hasPermission = await this.requestCameraPermissions();
      if (!hasPermission) {
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect,
        quality: options.quality ?? 0.8,
        exif: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      let processedUri = asset.uri;

      // Compress if requested
      if (options.compress) {
        processedUri = await imageCompressionService.compressImage(asset.uri, {
          quality: options.quality ?? 0.8,
          maxWidth: options.maxWidth ?? 1920,
          maxHeight: options.maxHeight ?? 1080,
        });
      }

      const mediaItem: MediaItem = {
        id: `photo_${Date.now()}_${Math.random()}`,
        uri: processedUri,
        type: 'photo',
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        size: asset.fileSize || 0,
        mimeType: asset.type || 'image/jpeg',
        width: asset.width,
        height: asset.height,
        createdAt: new Date().toISOString(),
        compressed: options.compress || false,
      };

      // Cache media item
      await this.cacheMediaItem(mediaItem);

      return mediaItem;
    } catch (error: any) {
      console.error('Error capturing photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
      return null;
    }
  }

  /**
   * Select photo from gallery
   */
  async selectPhoto(options: PhotoCaptureOptions = {}): Promise<MediaItem | null> {
    try {
      const hasPermission = await this.requestMediaLibraryPermissions();
      if (!hasPermission) {
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing ?? true,
        aspect: options.aspect,
        quality: options.quality ?? 0.8,
        allowsMultipleSelection: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      let processedUri = asset.uri;

      if (options.compress) {
        processedUri = await imageCompressionService.compressImage(asset.uri, {
          quality: options.quality ?? 0.8,
          maxWidth: options.maxWidth ?? 1920,
          maxHeight: options.maxHeight ?? 1080,
        });
      }

      const mediaItem: MediaItem = {
        id: `photo_${Date.now()}_${Math.random()}`,
        uri: processedUri,
        type: 'photo',
        thumbnailUri: asset.uri, // Use original as thumbnail
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        size: asset.fileSize || 0,
        mimeType: asset.type || 'image/jpeg',
        width: asset.width,
        height: asset.height,
        createdAt: new Date().toISOString(),
        compressed: options.compress || false,
      };

      await this.cacheMediaItem(mediaItem);

      return mediaItem;
    } catch (error: any) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
      return null;
    }
  }

  /**
   * Select multiple photos
   */
  async selectMultiplePhotos(options: PhotoCaptureOptions = {}): Promise<MediaItem[]> {
    try {
      const hasPermission = await this.requestMediaLibraryPermissions();
      if (!hasPermission) {
        return [];
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: options.quality ?? 0.8,
        allowsMultipleSelection: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return [];
      }

      const mediaItems: MediaItem[] = [];

      for (const asset of result.assets) {
        let processedUri = asset.uri;

        if (options.compress) {
          processedUri = await imageCompressionService.compressImage(asset.uri, {
            quality: options.quality ?? 0.8,
            maxWidth: options.maxWidth ?? 1920,
            maxHeight: options.maxHeight ?? 1080,
          });
        }

        const mediaItem: MediaItem = {
          id: `photo_${Date.now()}_${Math.random()}`,
          uri: processedUri,
          type: 'photo',
          thumbnailUri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          size: asset.fileSize || 0,
          mimeType: asset.type || 'image/jpeg',
          width: asset.width,
          height: asset.height,
          createdAt: new Date().toISOString(),
          compressed: options.compress || false,
        };

        await this.cacheMediaItem(mediaItem);
        mediaItems.push(mediaItem);
      }

      return mediaItems;
    } catch (error: any) {
      console.error('Error selecting photos:', error);
      Alert.alert('Error', 'Failed to select photos. Please try again.');
      return [];
    }
  }

  /**
   * Record video
   */
  async recordVideo(options: VideoCaptureOptions = {}): Promise<MediaItem | null> {
    try {
      const hasPermission = await this.requestCameraPermissions();
      if (!hasPermission) {
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: options.allowsEditing ?? true,
        quality: options.quality === 'high' ? 1 : options.quality === 'low' ? 0.5 : 0.75,
        videoMaxDuration: options.maxDuration,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      const thumbnailUri = await this.generateVideoThumbnail(asset.uri);

      const mediaItem: MediaItem = {
        id: `video_${Date.now()}_${Math.random()}`,
        uri: asset.uri,
        type: 'video',
        thumbnailUri,
        name: asset.fileName || `video_${Date.now()}.mp4`,
        size: asset.fileSize || 0,
        mimeType: asset.type || 'video/mp4',
        width: asset.width,
        height: asset.height,
        duration: asset.duration ? Math.round(asset.duration) : undefined,
        createdAt: new Date().toISOString(),
        compressed: false,
      };

      await this.cacheMediaItem(mediaItem);

      return mediaItem;
    } catch (error: any) {
      console.error('Error recording video:', error);
      Alert.alert('Error', 'Failed to record video. Please try again.');
      return null;
    }
  }

  /**
   * Select video from gallery
   */
  async selectVideo(options: VideoCaptureOptions = {}): Promise<MediaItem | null> {
    try {
      const hasPermission = await this.requestMediaLibraryPermissions();
      if (!hasPermission) {
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: options.allowsEditing ?? true,
        quality: options.quality === 'high' ? 1 : options.quality === 'low' ? 0.5 : 0.75,
        videoMaxDuration: options.maxDuration,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      const thumbnailUri = await this.generateVideoThumbnail(asset.uri);

      const mediaItem: MediaItem = {
        id: `video_${Date.now()}_${Math.random()}`,
        uri: asset.uri,
        type: 'video',
        thumbnailUri,
        name: asset.fileName || `video_${Date.now()}.mp4`,
        size: asset.fileSize || 0,
        mimeType: asset.type || 'video/mp4',
        width: asset.width,
        height: asset.height,
        duration: asset.duration ? Math.round(asset.duration) : undefined,
        createdAt: new Date().toISOString(),
        compressed: false,
      };

      await this.cacheMediaItem(mediaItem);

      return mediaItem;
    } catch (error: any) {
      console.error('Error selecting video:', error);
      Alert.alert('Error', 'Failed to select video. Please try again.');
      return null;
    }
  }

  /**
   * Scan document
   */
  async scanDocument(options: DocumentScanOptions = {}): Promise<MediaItem | null> {
    try {
      const hasPermission = await this.requestCameraPermissions();
      if (!hasPermission) {
        return null;
      }

      // Note: For document scanning, we use camera to capture
      // In production, consider using a document scanner library like react-native-document-scanner
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3], // Document-like aspect ratio
        quality: options.quality === 'high' ? 1 : options.quality === 'low' ? 0.6 : 0.8,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];
      
      // Process document (enhance, crop, etc.)
      const processedUri = await imageCompressionService.processDocument(asset.uri, {
        quality: options.quality === 'high' ? 1 : options.quality === 'low' ? 0.6 : 0.8,
      });

      const mediaItem: MediaItem = {
        id: `scan_${Date.now()}_${Math.random()}`,
        uri: processedUri,
        type: 'scan',
        thumbnailUri: asset.uri,
        name: asset.fileName || `scan_${Date.now()}.jpg`,
        size: asset.fileSize || 0,
        mimeType: 'image/jpeg',
        width: asset.width,
        height: asset.height,
        createdAt: new Date().toISOString(),
        compressed: true,
      };

      await this.cacheMediaItem(mediaItem);

      return mediaItem;
    } catch (error: any) {
      console.error('Error scanning document:', error);
      Alert.alert('Error', 'Failed to scan document. Please try again.');
      return null;
    }
  }

  /**
   * Pick document from files
   */
  async pickDocument(): Promise<MediaItem | null> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      const asset = result.assets[0];

      const mediaItem: MediaItem = {
        id: `doc_${Date.now()}_${Math.random()}`,
        uri: asset.uri,
        type: 'document',
        name: asset.name,
        size: asset.size || 0,
        mimeType: asset.mimeType || 'application/octet-stream',
        createdAt: new Date().toISOString(),
        compressed: false,
      };

      await this.cacheMediaItem(mediaItem);

      return mediaItem;
    } catch (error: any) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
      return null;
    }
  }

  /**
   * Generate video thumbnail
   */
  private async generateVideoThumbnail(videoUri: string): Promise<string> {
    try {
      // Use expo-av to generate thumbnail
      // This is a simplified version - in production use proper video thumbnail generation
      // For now, return a placeholder
      return videoUri; // Placeholder
    } catch (error) {
      console.error('Error generating video thumbnail:', error);
      return '';
    }
  }

  /**
   * Cache media item locally
   */
  private async cacheMediaItem(mediaItem: MediaItem): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(MEDIA_STORAGE_KEY);
      const items: MediaItem[] = cached ? JSON.parse(cached) : [];
      items.push(mediaItem);
      await AsyncStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error caching media item:', error);
    }
  }

  /**
   * Get cached media items
   */
  async getCachedMediaItems(orderId?: string): Promise<MediaItem[]> {
    try {
      const cached = await AsyncStorage.getItem(MEDIA_STORAGE_KEY);
      if (!cached) return [];
      
      const items: MediaItem[] = JSON.parse(cached);
      if (orderId) {
        return items.filter((item) => item.orderId === orderId);
      }
      return items;
    } catch (error) {
      console.error('Error getting cached media items:', error);
      return [];
    }
  }

  /**
   * Delete cached media item
   */
  async deleteCachedMediaItem(mediaId: string): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(MEDIA_STORAGE_KEY);
      if (!cached) return;
      
      const items: MediaItem[] = JSON.parse(cached);
      const filtered = items.filter((item) => item.id !== mediaId);
      await AsyncStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting cached media item:', error);
    }
  }
}

export const mediaCaptureService = new MediaCaptureService();

