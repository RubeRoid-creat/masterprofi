/**
 * Order Part Junction Model
 * Links orders with parts (Many-to-Many)
 */

import { Model } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';
import { Associations } from '@nozbe/watermelondb/Model';
import Order from './Order';

export default class OrderPart extends Model {
  static table = 'order_parts';

  static associations: Associations = {
    order: { type: 'belongs_to', key: 'order_id' },
    part: { type: 'belongs_to', key: 'part_id' },
  };

  @relation('orders', 'order_id') order!: Order;
  @field('part_id') partId!: string;
  @field('quantity') quantity!: number;
  @field('unit_price') unitPrice!: number;
  @field('total_price') totalPrice!: number;
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;
}








