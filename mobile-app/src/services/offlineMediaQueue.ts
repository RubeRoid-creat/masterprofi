/**
 * Offline Media Queue Service
 * Manages queue of media items to upload when online
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { MediaItem } from '../types/media';
import { cloudUploadService } from './cloudUploadService';
import * as NetInfo from '@react-native-community/netinfo';

const QUEUE_STORAGE_KEY = 'offline_media_queue';

export interface QueuedMediaItem extends MediaItem {
  queuedAt: string;
  retryCount: number;
  orderId?: string;
}

class OfflineMediaQueue {
  private queue: QueuedMediaItem[] = [];
  private isProcessing: boolean = false;
  private listeners: Set<() => void> = new Set();

  /**
   * Initialize queue from storage
   */
  async initialize(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }

      // Start processing if online
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        this.processQueue();
      }

      // Listen for network changes
      NetInfo.addEventListener((state) => {
        if (state.isConnected && this.queue.length > 0) {
          this.processQueue();
        }
      });
    } catch (error) {
      console.error('Error initializing offline media queue:', error);
    }
  }

  /**
   * Add media item to queue
   */
  async addToQueue(mediaItem: MediaItem, orderId?: string): Promise<void> {
    const queuedItem: QueuedMediaItem = {
      ...mediaItem,
      queuedAt: new Date().toISOString(),
      retryCount: 0,
      orderId,
    };

    this.queue.push(queuedItem);
    await this.saveQueue();

    // Notify listeners
    this.notifyListeners();

    // Try to process if online
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      this.processQueue();
    }
  }

  /**
   * Remove item from queue
   */
  async removeFromQueue(mediaId: string): Promise<void> {
    this.queue = this.queue.filter((item) => item.id !== mediaId);
    await this.saveQueue();
    this.notifyListeners();
  }

  /**
   * Get queue items
   */
  getQueue(): QueuedMediaItem[] {
    return [...this.queue];
  }

  /**
   * Get queue count
   */
  getQueueCount(): number {
    return this.queue.length;
  }

  /**
   * Process queue (upload items)
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return;
    }

    this.isProcessing = true;

    const itemsToProcess = [...this.queue];
    const successful: string[] = [];
    const failed: QueuedMediaItem[] = [];

    for (const item of itemsToProcess) {
      try {
        await cloudUploadService.uploadMedia(item, {
          orderId: item.orderId,
          onProgress: (progress) => {
            // Update progress if needed
          },
        });

        successful.push(item.id);
      } catch (error) {
        console.error(`Failed to upload ${item.id}:`, error);
        
        item.retryCount += 1;
        
        // Remove from queue if max retries exceeded
        if (item.retryCount >= 3) {
          // Keep in queue but mark as failed
          item.error = 'Max retries exceeded';
        } else {
          failed.push(item);
        }
      }
    }

    // Remove successful items
    this.queue = this.queue.filter((item) => !successful.includes(item.id));
    
    // Update failed items with incremented retry count
    for (const failedItem of failed) {
      const index = this.queue.findIndex((item) => item.id === failedItem.id);
      if (index !== -1) {
        this.queue[index] = failedItem;
      }
    }

    await this.saveQueue();
    this.isProcessing = false;
    this.notifyListeners();
  }

  /**
   * Clear queue
   */
  async clearQueue(): Promise<void> {
    this.queue = [];
    await this.saveQueue();
    this.notifyListeners();
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Error saving queue:', error);
    }
  }

  /**
   * Add listener for queue changes
   */
  addListener(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (error) {
        console.error('Error in queue listener:', error);
      }
    });
  }
}

export const offlineMediaQueue = new OfflineMediaQueue();








