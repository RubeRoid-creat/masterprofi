/**
 * Order Photo Model
 */

import { Model } from '@nozbe/watermelondb';
import { field, relation, writer } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';
import Order from './Order';

export default class OrderPhoto extends Model {
  static table = 'order_photos';

  static associations: Associations = {
    order: { type: 'belongs_to', key: 'order_id' },
  };

  @field('server_id') serverId?: string;
  @relation('orders', 'order_id') order!: Order;
  @field('photo_url') photoUrl!: string;
  @field('thumbnail_url') thumbnailUrl?: string;
  @field('description') description?: string;
  @field('is_synced') isSynced!: boolean;
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;

  @writer async markAsSynced(serverId?: string) {
    await this.update((photo) => {
      if (serverId) photo.serverId = serverId;
      photo.isSynced = true;
      photo.updatedAt = Date.now();
    });
  }
}








