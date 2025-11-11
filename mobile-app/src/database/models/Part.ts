/**
 * Part Model (Parts Catalog)
 */

import { Model } from '@nozbe/watermelondb';
import { field, writer } from '@nozbe/watermelondb/decorators';

export default class Part extends Model {
  static table = 'parts';

  @field('server_id') serverId?: string;
  @field('name') name!: string;
  @field('part_number') partNumber?: string;
  @field('category') category!: string;
  @field('brand') brand?: string;
  @field('price') price!: number;
  @field('currency') currency?: string;
  @field('stock_quantity') stockQuantity?: number;
  @field('is_available') isAvailable!: boolean;
  @field('description') description?: string;
  @field('image_url') imageUrl?: string;
  @field('compatibility') compatibility?: string; // JSON array
  @field('warranty') warranty?: string;
  @field('delivery_time') deliveryTime?: string;
  @field('is_synced') isSynced!: boolean;
  @field('sync_status') syncStatus?: string;
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;

  @writer async markAsSynced(serverId?: string) {
    await this.update((part) => {
      if (serverId) part.serverId = serverId;
      part.isSynced = true;
      part.syncStatus = 'synced';
      part.updatedAt = Date.now();
    });
  }

  getCompatibility(): string[] {
    try {
      return this.compatibility ? JSON.parse(this.compatibility) : [];
    } catch {
      return [];
    }
  }

  setCompatibility(compatibility: string[]) {
    this.compatibility = JSON.stringify(compatibility);
  }
}








