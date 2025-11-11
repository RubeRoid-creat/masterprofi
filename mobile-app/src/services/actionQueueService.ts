/**
 * Action Queue Service
 * Manages queue of offline actions with retry logic and conflict detection
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NetInfo from '@react-native-community/netinfo';
import {
  QueuedAction,
  ActionType,
  ActionStatus,
  ActionPayload,
  ActionQueueOptions,
  ActionQueueStats,
} from '../types/actionQueue';
import { ordersApi } from '../store/api/ordersApi';
import { cloudUploadService } from './cloudUploadService';
import { locationService } from './locationService';
import { MediaItem } from '../types/media';
import { config } from '../config/environments';

const QUEUE_STORAGE_KEY = 'action_queue';
const QUEUE_LOCK_KEY = 'action_queue_lock';

const DEFAULT_OPTIONS: Required<ActionQueueOptions> = {
  maxRetries: 3,
  retryDelay: 1000,
  retryBackoff: 'exponential',
  conflictResolution: 'server_wins',
};

class ActionQueueService {
  private queue: QueuedAction[] = [];
  private isProcessing: boolean = false;
  private processingInterval: NodeJS.Timeout | null = null;
  private listeners: Set<(stats: ActionQueueStats) => void> = new Set();
  private options: Required<ActionQueueOptions> = DEFAULT_OPTIONS;

  /**
   * Initialize queue service
   */
  async initialize(options?: ActionQueueOptions): Promise<void> {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    await this.loadQueue();

    // Start processing queue if online
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      this.startProcessing();
    }

    // Listen for network changes
    NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        this.startProcessing();
      } else {
        this.stopProcessing();
      }
    });
  }

  /**
   * Add action to queue
   */
  async enqueue(
    type: ActionType,
    payload: ActionPayload,
    metadata?: QueuedAction['metadata']
  ): Promise<string> {
    const action: QueuedAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      status: 'pending',
      payload,
      retryCount: 0,
      maxRetries: this.options.maxRetries,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      metadata,
    };

    this.queue.push(action);
    await this.saveQueue();
    this.notifyListeners();

    // Try to process immediately if online
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      this.processQueue();
    }

    return action.id;
  }

  /**
   * Remove action from queue
   */
  async dequeue(actionId: string): Promise<void> {
    this.queue = this.queue.filter((action) => action.id !== actionId);
    await this.saveQueue();
    this.notifyListeners();
  }

  /**
   * Get action by ID
   */
  getAction(actionId: string): QueuedAction | undefined {
    return this.queue.find((action) => action.id === actionId);
  }

  /**
   * Get all actions
   */
  getAllActions(): QueuedAction[] {
    return [...this.queue];
  }

  /**
   * Get actions by status
   */
  getActionsByStatus(status: ActionStatus): QueuedAction[] {
    return this.queue.filter((action) => action.status === status);
  }

  /**
   * Get actions by type
   */
  getActionsByType(type: ActionType): QueuedAction[] {
    return this.queue.filter((action) => action.type === type);
  }

  /**
   * Get queue statistics
   */
  getStats(): ActionQueueStats {
    return {
      total: this.queue.length,
      pending: this.queue.filter((a) => a.status === 'pending').length,
      processing: this.queue.filter((a) => a.status === 'processing').length,
      completed: this.queue.filter((a) => a.status === 'completed').length,
      failed: this.queue.filter((a) => a.status === 'failed').length,
      conflict: this.queue.filter((a) => a.status === 'conflict').length,
    };
  }

  /**
   * Start processing queue
   */
  startProcessing(): void {
    if (this.processingInterval) {
      return;
    }

    // Process immediately
    this.processQueue();

    // Then process every 5 seconds
    this.processingInterval = setInterval(() => {
      this.processQueue();
    }, 5000);
  }

  /**
   * Stop processing queue
   */
  stopProcessing(): void {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  /**
   * Process queue (public method for manual triggering)
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      return;
    }

    // Check lock
    const lock = await AsyncStorage.getItem(QUEUE_LOCK_KEY);
    if (lock && Date.now() - parseInt(lock) < 30000) {
      // Another instance is processing
      return;
    }

    this.isProcessing = true;
    await AsyncStorage.setItem(QUEUE_LOCK_KEY, Date.now().toString());

    try {
      const pendingActions = this.queue.filter(
        (action) => action.status === 'pending' || action.status === 'failed'
      );

      for (const action of pendingActions) {
        try {
          await this.processAction(action);
        } catch (error: any) {
          console.error(`Error processing action ${action.id}:`, error);
          await this.handleActionError(action, error);
        }
      }
    } finally {
      this.isProcessing = false;
      await AsyncStorage.removeItem(QUEUE_LOCK_KEY);
      await this.saveQueue();
      this.notifyListeners();
    }
  }

  /**
   * Process single action
   */
  private async processAction(action: QueuedAction): Promise<void> {
    // Update status to processing
    await this.updateActionStatus(action.id, 'processing');

    let result: any;

    switch (action.type) {
      case 'update_order_status':
        result = await this.processOrderStatusUpdate(action);
        break;
      case 'send_message':
        result = await this.processSendMessage(action);
        break;
      case 'upload_photo':
        result = await this.processUploadPhoto(action);
        break;
      case 'update_location':
        result = await this.processUpdateLocation(action);
        break;
      case 'accept_order':
        result = await this.processAcceptOrder(action);
        break;
      case 'decline_order':
        result = await this.processDeclineOrder(action);
        break;
      case 'update_profile':
        result = await this.processUpdateProfile(action);
        break;
      case 'create_order_note':
        result = await this.processCreateOrderNote(action);
        break;
      case 'update_service_area':
        result = await this.processUpdateServiceArea(action);
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }

    // Check for conflicts
    if (result?.conflict) {
      await this.handleConflict(action, result.conflict);
      return;
    }

    // Mark as completed
    await this.updateActionStatus(action.id, 'completed', {
      completedAt: Date.now(),
      progress: 100,
    });

    // Remove completed action after delay
    setTimeout(() => {
      this.dequeue(action.id);
    }, 5000);
  }

  /**
   * Process order status update
   */
  private async processOrderStatusUpdate(action: QueuedAction): Promise<any> {
    const { orderId, status, notes } = action.payload;

    // Update progress
    await this.updateActionProgress(action.id, 50);

    const result = await ordersApi.endpoints.updateOrderStatus.initiate({
      orderId,
      status,
      notes,
    }).unwrap();

    await this.updateActionProgress(action.id, 100);

    return result;
  }

  /**
   * Process send message
   */
  private async processSendMessage(action: QueuedAction): Promise<any> {
    const { orderId, message, senderId, senderName, senderType, attachments } = action.payload;

    await this.updateActionProgress(action.id, 30);

    const result = await ordersApi.endpoints.addOrderMessage.initiate({
      orderId,
      message,
      senderId,
      senderName,
      senderType,
      attachments,
    }).unwrap();

    await this.updateActionProgress(action.id, 100);

    return result;
  }

  /**
   * Process upload photo
   */
  private async processUploadPhoto(action: QueuedAction): Promise<any> {
    const { orderId, photos } = action.payload;

    await this.updateActionProgress(action.id, 10);

    // Upload photos
    const result = await cloudUploadService.uploadMultiple(photos, {
      orderId,
      onProgress: (progress) => {
        this.updateActionProgress(action.id, 10 + progress * 0.9);
      },
    });

    await this.updateActionProgress(action.id, 100);

    return result;
  }

  /**
   * Process update location
   */
  private async processUpdateLocation(action: QueuedAction): Promise<any> {
    const { orderId, location } = action.payload;

    await this.updateActionProgress(action.id, 50);

    // Send location update to server
    const authToken = await AsyncStorage.getItem('auth_token');
    const API_BASE_URL = config.apiUrl;
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/location`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(location),
    });

    if (!response.ok) {
      throw new Error(`Failed to update location: ${response.statusText}`);
    }

    await this.updateActionProgress(action.id, 100);

    return await response.json();
  }

  /**
   * Process accept order
   */
  private async processAcceptOrder(action: QueuedAction): Promise<any> {
    const { orderId, notes, scheduledAt } = action.payload;

    await this.updateActionProgress(action.id, 50);

    const result = await ordersApi.endpoints.acceptOrder.initiate({
      orderId,
      notes,
      scheduledAt,
    }).unwrap();

    await this.updateActionProgress(action.id, 100);

    return result;
  }

  /**
   * Process decline order
   */
  private async processDeclineOrder(action: QueuedAction): Promise<any> {
    const { orderId, reason } = action.payload;

    await this.updateActionProgress(action.id, 50);

    // API call to decline order
    const authToken = await AsyncStorage.getItem('auth_token');
    const API_BASE_URL = config.apiUrl;
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/decline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      throw new Error(`Failed to decline order: ${response.statusText}`);
    }

    await this.updateActionProgress(action.id, 100);

    return await response.json();
  }

  /**
   * Process update profile
   */
  private async processUpdateProfile(action: QueuedAction): Promise<any> {
    const profileData = action.payload;

    await this.updateActionProgress(action.id, 50);

    // API call to update profile
    const authToken = await AsyncStorage.getItem('auth_token');
    const API_BASE_URL = config.apiUrl;
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update profile: ${response.statusText}`);
    }

    await this.updateActionProgress(action.id, 100);

    return await response.json();
  }

  /**
   * Process create order note
   */
  private async processCreateOrderNote(action: QueuedAction): Promise<any> {
    const { orderId, note } = action.payload;

    await this.updateActionProgress(action.id, 50);

    // API call to create note
    const authToken = await AsyncStorage.getItem('auth_token');
    const API_BASE_URL = config.apiUrl;
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ note }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create note: ${response.statusText}`);
    }

    await this.updateActionProgress(action.id, 100);

    return await response.json();
  }

  /**
   * Process update service area
   */
  private async processUpdateServiceArea(action: QueuedAction): Promise<any> {
    const serviceArea = action.payload;

    await this.updateActionProgress(action.id, 50);

    // API call to update service area
    const authToken = await AsyncStorage.getItem('auth_token');
    const API_BASE_URL = config.apiUrl;
    const response = await fetch(`${API_BASE_URL}/profile/service-area`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify(serviceArea),
    });

    if (!response.ok) {
      throw new Error(`Failed to update service area: ${response.statusText}`);
    }

    await this.updateActionProgress(action.id, 100);

    return await response.json();
  }

  /**
   * Handle action error
   */
  private async handleActionError(action: QueuedAction, error: Error): Promise<void> {
    const newRetryCount = action.retryCount + 1;

    if (newRetryCount >= action.maxRetries) {
      // Max retries exceeded
      await this.updateActionStatus(action.id, 'failed', {
        error: error.message,
        retryCount: newRetryCount,
      });
    } else {
      // Retry with backoff
      const delay = this.calculateRetryDelay(newRetryCount);
      await this.updateActionStatus(action.id, 'failed', {
        error: error.message,
        retryCount: newRetryCount,
      });

      // Schedule retry
      setTimeout(() => {
        this.updateActionStatus(action.id, 'pending');
      }, delay);
    }
  }

  /**
   * Calculate retry delay
   */
  private calculateRetryDelay(retryCount: number): number {
    if (this.options.retryBackoff === 'exponential') {
      return this.options.retryDelay * Math.pow(2, retryCount - 1);
    } else {
      return this.options.retryDelay * retryCount;
    }
  }

  /**
   * Handle conflict
   */
  private async handleConflict(action: QueuedAction, conflictData: any): Promise<void> {
    await this.updateActionStatus(action.id, 'conflict', {
      conflictData: {
        local: action.payload,
        server: conflictData.server,
        resolved: false,
      },
    });
  }

  /**
   * Resolve conflict
   */
  async resolveConflict(
    actionId: string,
    resolution: 'local_wins' | 'server_wins' | 'merge',
    mergedData?: any
  ): Promise<void> {
    const action = this.getAction(actionId);
    if (!action || action.status !== 'conflict') {
      return;
    }

    let resolvedPayload: ActionPayload;

    switch (resolution) {
      case 'local_wins':
        resolvedPayload = action.payload;
        break;
      case 'server_wins':
        resolvedPayload = action.conflictData!.server;
        break;
      case 'merge':
        resolvedPayload = mergedData || { ...action.conflictData!.server, ...action.payload };
        break;
    }

    // Update action with resolved payload
    const index = this.queue.findIndex((a) => a.id === actionId);
    if (index !== -1) {
      this.queue[index] = {
        ...this.queue[index],
        status: 'pending',
        payload: resolvedPayload,
        conflictData: {
          ...this.queue[index].conflictData!,
          resolved: true,
        },
        updatedAt: Date.now(),
      };
      await this.saveQueue();
      this.notifyListeners();
    }

    // Try to process again
    this.processQueue();
  }

  /**
   * Update action status
   */
  private async updateActionStatus(
    actionId: string,
    status: ActionStatus,
    updates: Partial<QueuedAction> = {}
  ): Promise<void> {
    const index = this.queue.findIndex((action) => action.id === actionId);
    if (index === -1) {
      return;
    }

    this.queue[index] = {
      ...this.queue[index],
      status,
      updatedAt: Date.now(),
      ...updates,
    };

    await this.saveQueue();
    this.notifyListeners();
  }

  /**
   * Update action progress
   */
  private async updateActionProgress(actionId: string, progress: number): Promise<void> {
    const index = this.queue.findIndex((action) => action.id === actionId);
    if (index === -1) {
      return;
    }

    this.queue[index] = {
      ...this.queue[index],
      progress: Math.max(0, Math.min(100, progress)),
      updatedAt: Date.now(),
    };

    await this.saveQueue();
    this.notifyListeners();
  }

  /**
   * Update action
   */
  async updateAction(actionId: string, updates: Partial<QueuedAction>): Promise<void> {
    const index = this.queue.findIndex((action) => action.id === actionId);
    if (index === -1) {
      return;
    }

    this.queue[index] = {
      ...this.queue[index],
      ...updates,
      updatedAt: Date.now(),
    };

    await this.saveQueue();
    this.notifyListeners();
  }

  /**
   * Load queue from storage
   */
  private async loadQueue(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading action queue:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Error saving action queue:', error);
    }
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
   * Clear completed actions
   */
  async clearCompleted(): Promise<void> {
    this.queue = this.queue.filter((action) => action.status !== 'completed');
    await this.saveQueue();
    this.notifyListeners();
  }

  /**
   * Add listener
   */
  addListener(callback: (stats: ActionQueueStats) => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Notify listeners
   */
  private notifyListeners(): void {
    const stats = this.getStats();
    this.listeners.forEach((callback) => {
      try {
        callback(stats);
      } catch (error) {
        console.error('Error in action queue listener:', error);
      }
    });
  }
}

export const actionQueueService = new ActionQueueService();

