/**
 * Message Model
 */

import { Model } from '@nozbe/watermelondb';
import { field, relation, writer } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';
import Order from './Order';

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'location';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export default class Message extends Model {
  static table = 'messages';

  static associations: Associations = {
    order: { type: 'belongs_to', key: 'order_id' },
  };

  @field('server_id') serverId?: string;
  @relation('orders', 'order_id') order!: Order;
  @field('sender_id') senderId!: string;
  @field('sender_name') senderName!: string;
  @field('sender_type') senderType!: 'client' | 'master';
  @field('message') message!: string;
  @field('message_type') messageType!: MessageType;
  @field('attachments') attachments?: string; // JSON array
  @field('status') status!: MessageStatus;
  @field('timestamp') timestamp!: number;
  @field('is_synced') isSynced!: boolean;
  @field('sync_status') syncStatus?: string;
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;

  @writer async updateStatus(newStatus: MessageStatus) {
    await this.update((message) => {
      message.status = newStatus;
      message.isSynced = newStatus !== 'sending' && newStatus !== 'failed';
      message.updatedAt = Date.now();
    });
  }

  @writer async markAsSynced(serverId?: string) {
    await this.update((message) => {
      if (serverId) message.serverId = serverId;
      message.isSynced = true;
      message.syncStatus = 'synced';
      message.updatedAt = Date.now();
    });
  }

  getAttachments(): string[] {
    try {
      return this.attachments ? JSON.parse(this.attachments) : [];
    } catch {
      return [];
    }
  }

  setAttachments(attachments: string[]) {
    this.attachments = JSON.stringify(attachments);
  }
}








