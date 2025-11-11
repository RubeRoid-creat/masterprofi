// Chat types

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'location';

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
  type: MessageType;
  timestamp: string;
  status: MessageStatus;
  attachments?: Attachment[];
  replyTo?: string; // Message ID this is replying to
  isEdited?: boolean;
  editedAt?: string;
}

export interface Attachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'file';
  uri: string;
  name?: string;
  size?: number;
  mimeType?: string;
  thumbnail?: string; // For videos
  duration?: number; // For audio/video in seconds
}

export interface Chat {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  lastMessage?: Message;
  unreadCount: number;
  isOnline: boolean;
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuickReply {
  id: string;
  text: string;
  category?: string;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  typingUsers: TypingIndicator[];
  quickReplies: QuickReply[];
  unreadCount: number;
}









