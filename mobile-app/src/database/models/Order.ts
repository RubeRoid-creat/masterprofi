/**
 * Order Model
 */

import { Model } from '@nozbe/watermelondb';
import { field, relation, children, writer } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';
import Client from './Client';
import Message from './Message';
import OrderPhoto from './OrderPhoto';
import OrderPart from './OrderPart';

export type OrderStatus = 'new' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export default class Order extends Model {
  static table = 'orders';

  static associations: Associations = {
    client: { type: 'belongs_to', key: 'client_id' },
    messages: { type: 'has_many', foreignKey: 'order_id' },
    photos: { type: 'has_many', foreignKey: 'order_id' },
    order_parts: { type: 'has_many', foreignKey: 'order_id' },
  };

  @field('server_id') serverId?: string;
  @relation('clients', 'client_id') client!: Client;
  @field('order_number') orderNumber!: string;
  @field('status') status!: OrderStatus;
  @field('priority') priority?: string;
  @field('appliance_type') applianceType!: string;
  @field('appliance_brand') applianceBrand?: string;
  @field('appliance_model') applianceModel?: string;
  @field('problem_description') problemDescription?: string;
  @field('address') address!: string;
  @field('latitude') latitude?: number;
  @field('longitude') longitude?: number;
  @field('distance') distance?: number;
  @field('price_amount') priceAmount?: number;
  @field('price_currency') priceCurrency?: string;
  @field('scheduled_at') scheduledAt?: number;
  @field('started_at') startedAt?: number;
  @field('completed_at') completedAt?: number;
  @field('is_new') isNew!: boolean;
  @field('is_synced') isSynced!: boolean;
  @field('sync_status') syncStatus?: string;
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;

  @children('messages') messages!: Message[];
  @children('photos') photos!: OrderPhoto[];
  @children('order_parts') orderParts!: OrderPart[];

  @writer async updateStatus(newStatus: OrderStatus) {
    await this.update((order) => {
      order.status = newStatus;
      order.isSynced = false;
      order.syncStatus = 'pending';
      order.updatedAt = Date.now();
    });
  }

  @writer async markAsSynced(serverId?: string) {
    await this.update((order) => {
      if (serverId) order.serverId = serverId;
      order.isSynced = true;
      order.syncStatus = 'synced';
      order.updatedAt = Date.now();
    });
  }
}








