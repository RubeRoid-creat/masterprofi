/**
 * Gallery Service
 * Manages media gallery and organization
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MediaItem } from '../types/media';
import * as FileSystem from 'expo-file-system';

const GALLERY_STORAGE_KEY = 'media_gallery';

class GalleryService {
  private gallery: MediaItem[] = [];

  /**
   * Initialize gallery from storage
   */
  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(GALLERY_STORAGE_KEY);
      if (stored) {
        this.gallery = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error initializing gallery:', error);
    }
  }

  /**
   * Add media to gallery
   */
  async addMedia(mediaItem: MediaItem): Promise<void> {
    // Check if already exists
    const existingIndex = this.gallery.findIndex((item) => item.id === mediaItem.id);
    if (existingIndex !== -1) {
      this.gallery[existingIndex] = mediaItem;
    } else {
      this.gallery.push(mediaItem);
    }

    // Sort by creation date (newest first)
    this.gallery.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    await this.saveGallery();
  }

  /**
   * Remove media from gallery
   */
  async removeMedia(mediaId: string): Promise<void> {
    const item = this.gallery.find((item) => item.id === mediaId);
    if (item) {
      // Delete file from storage
      try {
        await FileSystem.deleteAsync(item.uri, { idempotent: true });
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    this.gallery = this.gallery.filter((item) => item.id !== mediaId);
    await this.saveGallery();
  }

  /**
   * Get all media
   */
  getAllMedia(): MediaItem[] {
    return [...this.gallery];
  }

  /**
   * Get media by order
   */
  getMediaByOrder(orderId: string): MediaItem[] {
    return this.gallery.filter((item) => item.orderId === orderId);
  }

  /**
   * Get media by type
   */
  getMediaByType(type: MediaItem['type']): MediaItem[] {
    return this.gallery.filter((item) => item.type === type);
  }

  /**
   * Get media count
   */
  getMediaCount(): number {
    return this.gallery.length;
  }

  /**
   * Get media count by type
   */
  getMediaCountByType(type: MediaItem['type']): number {
    return this.gallery.filter((item) => item.type === type).length;
  }

  /**
   * Search media by name
   */
  searchMedia(query: string): MediaItem[] {
    const lowerQuery = query.toLowerCase();
    return this.gallery.filter((item) =>
      item.name.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get media by date range
   */
  getMediaByDateRange(startDate: Date, endDate: Date): MediaItem[] {
    return this.gallery.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  /**
   * Update media item
   */
  async updateMedia(mediaId: string, updates: Partial<MediaItem>): Promise<void> {
    const index = this.gallery.findIndex((item) => item.id === mediaId);
    if (index !== -1) {
      this.gallery[index] = { ...this.gallery[index], ...updates };
      await this.saveGallery();
    }
  }

  /**
   * Clear gallery
   */
  async clearGallery(): Promise<void> {
    // Delete all files
    for (const item of this.gallery) {
      try {
        await FileSystem.deleteAsync(item.uri, { idempotent: true });
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    this.gallery = [];
    await this.saveGallery();
  }

  /**
   * Save gallery to storage
   */
  private async saveGallery(): Promise<void> {
    try {
      await AsyncStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(this.gallery));
    } catch (error) {
      console.error('Error saving gallery:', error);
    }
  }

  /**
   * Get total storage size
   */
  async getTotalSize(): Promise<number> {
    let total = 0;
    for (const item of this.gallery) {
      try {
        const info = await FileSystem.getInfoAsync(item.uri);
        if (info.exists && info.size) {
          total += info.size;
        } else {
          total += item.size;
        }
      } catch (error) {
        total += item.size;
      }
    }
    return total;
  }
}

export const galleryService = new GalleryService();








