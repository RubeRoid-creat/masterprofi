/**
 * TypeScript definitions for Orders API
 */

import { Order, OrderStatus, OrderFilters } from '../../types/order';
import { ChatMessage, OrderDetails } from '../../types/orderDetails';

// Request Types
export interface GetOrdersRequest {
  status?: OrderStatus;
  filters?: OrderFilters;
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface AcceptOrderRequest {
  orderId: string;
  notes?: string;
  scheduledAt?: string;
}

export interface UpdateOrderStatusRequest {
  orderId: string;
  status: OrderStatus;
  notes?: string;
}

export interface AddOrderMessageRequest {
  orderId: string;
  message: string;
  attachments?: string[];
}

export interface UploadOrderPhotosRequest {
  orderId: string;
  photos: Array<{
    uri: string;
    type: string;
    name: string;
  }>;
}

export interface DeclineOrderRequest {
  orderId: string;
  reason?: string;
}

// Response Types
export interface GetOrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export interface AcceptOrderResponse {
  order: Order;
  message: string;
}

export interface UpdateOrderStatusResponse {
  order: Order;
  message: string;
}

export interface AddOrderMessageResponse {
  message: ChatMessage;
  order: Order;
}

export interface UploadOrderPhotosResponse {
  photos: string[]; // URLs of uploaded photos
  order: Order;
}

export interface DeclineOrderResponse {
  message: string;
}

// Error Types
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

export interface NetworkError {
  status: 'FETCH_ERROR' | 'PARSING_ERROR' | 'TIMEOUT_ERROR' | 'OFFLINE';
  error: string;
  data?: unknown;
}

// Cache Tags
export type OrderCacheTag = 
  | { type: 'Order'; id: string }
  | { type: 'OrderList' }
  | { type: 'OrderMessages'; id: string };








