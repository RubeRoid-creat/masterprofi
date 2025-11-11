// Action Queue Types

export type ActionType = 
  | 'update_order_status'
  | 'send_message'
  | 'upload_photo'
  | 'update_location'
  | 'accept_order'
  | 'decline_order'
  | 'update_profile'
  | 'create_order_note'
  | 'update_service_area';

export type ActionStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'conflict';

export interface ActionPayload {
  [key: string]: any;
}

export interface QueuedAction {
  id: string;
  type: ActionType;
  status: ActionStatus;
  payload: ActionPayload;
  retryCount: number;
  maxRetries: number;
  createdAt: number;
  updatedAt: number;
  processedAt?: number;
  completedAt?: number;
  error?: string;
  conflictData?: {
    local: any;
    server: any;
    resolved: boolean;
  };
  progress?: number; // 0-100
  metadata?: {
    orderId?: string;
    messageId?: string;
    userId?: string;
    [key: string]: any;
  };
}

export interface ActionQueueOptions {
  maxRetries?: number;
  retryDelay?: number; // milliseconds
  retryBackoff?: 'linear' | 'exponential';
  conflictResolution?: 'local_wins' | 'server_wins' | 'merge' | 'manual';
}

export interface ActionQueueStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  conflict: number;
}








