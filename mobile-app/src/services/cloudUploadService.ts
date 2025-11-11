/**
 * Cloud Upload Service
 * Handles media upload to cloud storage
 */

import { MediaItem, UploadProgress } from '../types/media';
import { RootState } from '../store/store';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { config } from '../config/environments';

export interface UploadOptions {
  orderId?: string;
  onProgress?: (progress: UploadProgress) => void;
  retryCount?: number;
}

class CloudUploadService {
  private uploadQueue: Map<string, Promise<string>> = new Map();

  /**
   * Upload media to cloud storage
   */
  async uploadMedia(
    mediaItem: MediaItem,
    options: UploadOptions = {}
  ): Promise<string> {
    const { orderId, onProgress, retryCount = 3 } = options;

    // Check if already uploading
    const existingUpload = this.uploadQueue.get(mediaItem.id);
    if (existingUpload) {
      return existingUpload;
    }

    const uploadPromise = this.performUpload(mediaItem, orderId, onProgress, retryCount);
    this.uploadQueue.set(mediaItem.id, uploadPromise);

    try {
      const cloudUrl = await uploadPromise;
      return cloudUrl;
    } finally {
      this.uploadQueue.delete(mediaItem.id);
    }
  }

  /**
   * Perform actual upload
   */
  private async performUpload(
    mediaItem: MediaItem,
    orderId: string | undefined,
    onProgress: ((progress: UploadProgress) => void) | undefined,
    retryCount: number
  ): Promise<string> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retryCount; attempt++) {
      try {
        // Get auth token (from Redux store or AsyncStorage)
        const token = await this.getAuthToken();
        
        // Create FormData
        const formData = new FormData();
        
        // Get file info
        const fileInfo = await FileSystem.getInfoAsync(mediaItem.uri);
        if (!fileInfo.exists) {
          throw new Error('File does not exist');
        }

        // Append file
        const fileExtension = mediaItem.name.split('.').pop() || 'jpg';
        const fileName = `${mediaItem.id}.${fileExtension}`;

        formData.append('file', {
          uri: mediaItem.uri,
          type: mediaItem.mimeType,
          name: fileName,
        } as any);

        // Append metadata
        formData.append('mediaId', mediaItem.id);
        formData.append('type', mediaItem.type);
        if (orderId) {
          formData.append('orderId', orderId);
        }
        if (mediaItem.width) {
          formData.append('width', mediaItem.width.toString());
        }
        if (mediaItem.height) {
          formData.append('height', mediaItem.height.toString());
        }

        // Upload with progress tracking
        // TODO: Replace with your actual API URL
        const API_BASE_URL = config.apiUrl;
        const uploadUrl = `${API_BASE_URL}/media/upload`;
        
        const response = await FileSystem.uploadAsync(uploadUrl, mediaItem.uri, {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          fieldName: 'file',
          parameters: {
            mediaId: mediaItem.id,
            type: mediaItem.type,
            ...(orderId && { orderId }),
          },
        });

        if (response.status !== 200) {
          throw new Error(`Upload failed with status ${response.status}`);
        }

        const result = JSON.parse(response.body);
        return result.url || result.cloudUrl;

      } catch (error: any) {
        lastError = error;
        console.error(`Upload attempt ${attempt + 1} failed:`, error);
        
        if (attempt < retryCount - 1) {
          // Wait before retry (exponential backoff)
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Upload failed after all retries');
  }

  /**
   * Upload multiple media items
   */
  async uploadMultiple(
    mediaItems: MediaItem[],
    options: UploadOptions = {}
  ): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    
    for (const item of mediaItems) {
      try {
        const cloudUrl = await this.uploadMedia(item, options);
        results.set(item.id, cloudUrl);
      } catch (error) {
        console.error(`Failed to upload ${item.id}:`, error);
      }
    }

    return results;
  }

  /**
   * Get auth token
   */
  private async getAuthToken(): Promise<string> {
    // Get from AsyncStorage or Redux
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    const token = await AsyncStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No authentication token available');
    }
    return token;
  }

  /**
   * Cancel upload
   */
  cancelUpload(mediaId: string): void {
    // Note: FileSystem.uploadAsync doesn't support cancellation
    // This would need to be implemented at a lower level
    this.uploadQueue.delete(mediaId);
  }
}

export const cloudUploadService = new CloudUploadService();

