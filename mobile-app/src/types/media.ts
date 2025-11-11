// Media types

export interface MediaItem {
  id: string;
  uri: string;
  type: 'photo' | 'video' | 'document' | 'scan';
  thumbnailUri?: string;
  name: string;
  size: number; // in bytes
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number; // for videos, in seconds
  createdAt: string;
  orderId?: string;
  compressed?: boolean;
  uploaded?: boolean;
  uploadProgress?: number;
  cloudUrl?: string;
  error?: string;
}

export interface PhotoCaptureOptions {
  quality?: number; // 0-1
  allowsEditing?: boolean;
  aspect?: [number, number];
  compress?: boolean;
  maxWidth?: number;
  maxHeight?: number;
}

export interface VideoCaptureOptions {
  quality?: 'low' | 'medium' | 'high';
  maxDuration?: number; // in seconds
  allowsEditing?: boolean;
  compress?: boolean;
}

export interface DocumentScanOptions {
  quality?: 'low' | 'medium' | 'high';
  maxNumDocuments?: number;
}

export interface CompressionOptions {
  quality?: number; // 0-1
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface UploadProgress {
  mediaId: string;
  progress: number; // 0-100
  uploaded: number; // bytes uploaded
  total: number; // total bytes
}








