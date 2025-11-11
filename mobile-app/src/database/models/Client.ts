/**
 * Client Model
 */

import { Model } from '@nozbe/watermelondb';
import { field, relation, children } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';
import Order from './Order';

export default class Client extends Model {
  static table = 'clients';

  static associations: Associations = {
    orders: { type: 'has_many', foreignKey: 'client_id' },
  };

  @field('server_id') serverId?: string;
  @field('name') name!: string;
  @field('phone') phone?: string;
  @field('email') email?: string;
  @field('address') address?: string;
  @field('avatar_url') avatarUrl?: string;
  @field('rating') rating?: number;
  @field('notes') notes?: string;
  @field('is_synced') isSynced!: boolean;
  @field('sync_status') syncStatus?: string;
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;

  @children('orders') orders!: Order[];
}








