/**
 * Knowledge Base Article Model
 */

import { Model } from '@nozbe/watermelondb';
import { field, writer } from '@nozbe/watermelondb/decorators';

export default class KnowledgeBaseArticle extends Model {
  static table = 'knowledge_base_articles';

  @field('server_id') serverId?: string;
  @field('title') title!: string;
  @field('slug') slug!: string;
  @field('category') category!: string;
  @field('tags') tags?: string; // JSON array
  @field('content') content!: string;
  @field('summary') summary?: string;
  @field('author') author?: string;
  @field('thumbnail_url') thumbnailUrl?: string;
  @field('video_url') videoUrl?: string;
  @field('attachments') attachments?: string; // JSON array
  @field('views_count') viewsCount?: number;
  @field('rating') rating?: number;
  @field('is_favorite') isFavorite!: boolean;
  @field('is_offline_downloaded') isOfflineDownloaded!: boolean;
  @field('offline_downloaded_at') offlineDownloadedAt?: number;
  @field('is_synced') isSynced!: boolean;
  @field('sync_status') syncStatus?: string;
  @field('created_at') createdAt!: number;
  @field('updated_at') updatedAt!: number;

  @writer async toggleFavorite() {
    await this.update((article) => {
      article.isFavorite = !article.isFavorite;
      article.updatedAt = Date.now();
    });
  }

  @writer async markAsOfflineDownloaded() {
    await this.update((article) => {
      article.isOfflineDownloaded = true;
      article.offlineDownloadedAt = Date.now();
      article.updatedAt = Date.now();
    });
  }

  @writer async markAsSynced(serverId?: string) {
    await this.update((article) => {
      if (serverId) article.serverId = serverId;
      article.isSynced = true;
      article.syncStatus = 'synced';
      article.updatedAt = Date.now();
    });
  }

  getTags(): string[] {
    try {
      return this.tags ? JSON.parse(this.tags) : [];
    } catch {
      return [];
    }
  }

  setTags(tags: string[]) {
    this.tags = JSON.stringify(tags);
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








