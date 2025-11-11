// Order details types

export interface OrderStatusEvent {
  status: string;
  timestamp: string;
  description?: string;
  userId?: string;
}

export interface OrderDetails extends Order {
  statusTimeline: OrderStatusEvent[];
  photos: string[];
  symptoms: string[];
  parts: Part[];
  estimatedCost?: number;
  finalCost?: number;
  notes?: string;
  workStartTime?: string;
  workEndTime?: string;
  totalWorkTime?: number; // in minutes
  signature?: {
    clientSignature: string;
    masterSignature?: string;
  };
  chatMessages: ChatMessage[];
}

export interface Part {
  id: string;
  name: string;
  partNumber: string;
  price: number;
  quantity: number;
  category: string;
  brand?: string;
  inStock: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'client' | 'master';
  message: string;
  timestamp: string;
  attachments?: string[];
}

export interface WorkTimer {
  isRunning: boolean;
  startTime?: string;
  elapsedTime: number; // in seconds
  breaks: Break[];
}

export interface Break {
  startTime: string;
  endTime?: string;
  duration?: number; // in seconds
}

export interface CostBreakdown {
  labor: number;
  parts: number;
  serviceFee: number;
  discount?: number;
  total: number;
}









