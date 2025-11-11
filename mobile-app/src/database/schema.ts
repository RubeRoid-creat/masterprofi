/**
 * WatermelonDB Schema
 * Defines all tables and relationships for offline support
 */

import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 2,
  tables: [
    // Sync Status Table
    tableSchema({
      name: 'sync_status',
      columns: [
        { name: 'table_name', type: 'string', isIndexed: true },
        { name: 'last_synced_at', type: 'number' },
        { name: 'last_sync_token', type: 'string', isOptional: true },
        { name: 'pending_changes', type: 'number', isOptional: true },
        { name: 'sync_error', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Clients Table
    tableSchema({
      name: 'clients',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'name', type: 'string' },
        { name: 'phone', type: 'string', isOptional: true },
        { name: 'email', type: 'string', isOptional: true },
        { name: 'address', type: 'string', isOptional: true },
        { name: 'avatar_url', type: 'string', isOptional: true },
        { name: 'rating', type: 'number', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'is_synced', type: 'boolean' },
        { name: 'sync_status', type: 'string', isOptional: true }, // 'pending', 'syncing', 'synced', 'error'
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Orders Table
    tableSchema({
      name: 'orders',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'client_id', type: 'string', isIndexed: true },
        { name: 'order_number', type: 'string', isIndexed: true },
        { name: 'status', type: 'string', isIndexed: true }, // 'new', 'assigned', 'in_progress', 'completed', 'cancelled'
        { name: 'priority', type: 'string', isOptional: true }, // 'low', 'normal', 'high', 'urgent'
        { name: 'appliance_type', type: 'string' },
        { name: 'appliance_brand', type: 'string', isOptional: true },
        { name: 'appliance_model', type: 'string', isOptional: true },
        { name: 'problem_description', type: 'string', isOptional: true },
        { name: 'address', type: 'string' },
        { name: 'latitude', type: 'number', isOptional: true },
        { name: 'longitude', type: 'number', isOptional: true },
        { name: 'distance', type: 'number', isOptional: true },
        { name: 'price_amount', type: 'number', isOptional: true },
        { name: 'price_currency', type: 'string', isOptional: true },
        { name: 'scheduled_at', type: 'number', isOptional: true },
        { name: 'started_at', type: 'number', isOptional: true },
        { name: 'completed_at', type: 'number', isOptional: true },
        { name: 'is_new', type: 'boolean' },
        { name: 'is_synced', type: 'boolean' },
        { name: 'sync_status', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Messages Table
    tableSchema({
      name: 'messages',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'order_id', type: 'string', isIndexed: true },
        { name: 'sender_id', type: 'string', isIndexed: true },
        { name: 'sender_name', type: 'string' },
        { name: 'sender_type', type: 'string' }, // 'client' or 'master'
        { name: 'message', type: 'string' },
        { name: 'message_type', type: 'string' }, // 'text', 'image', 'video', 'audio', 'file', 'location'
        { name: 'attachments', type: 'string', isOptional: true }, // JSON array
        { name: 'status', type: 'string' }, // 'sending', 'sent', 'delivered', 'read', 'failed'
        { name: 'timestamp', type: 'number', isIndexed: true },
        { name: 'is_synced', type: 'boolean' },
        { name: 'sync_status', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Parts Catalog Table
    tableSchema({
      name: 'parts',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'name', type: 'string' },
        { name: 'part_number', type: 'string', isIndexed: true, isOptional: true },
        { name: 'category', type: 'string', isIndexed: true },
        { name: 'brand', type: 'string', isIndexed: true, isOptional: true },
        { name: 'price', type: 'number' },
        { name: 'currency', type: 'string', isOptional: true },
        { name: 'stock_quantity', type: 'number', isOptional: true },
        { name: 'is_available', type: 'boolean' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'image_url', type: 'string', isOptional: true },
        { name: 'compatibility', type: 'string', isOptional: true }, // JSON array of appliance types
        { name: 'warranty', type: 'string', isOptional: true },
        { name: 'delivery_time', type: 'string', isOptional: true },
        { name: 'is_synced', type: 'boolean' },
        { name: 'sync_status', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Knowledge Base Articles Table
    tableSchema({
      name: 'knowledge_base_articles',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'title', type: 'string' },
        { name: 'slug', type: 'string', isIndexed: true },
        { name: 'category', type: 'string', isIndexed: true },
        { name: 'tags', type: 'string', isOptional: true }, // JSON array
        { name: 'content', type: 'string' },
        { name: 'summary', type: 'string', isOptional: true },
        { name: 'author', type: 'string', isOptional: true },
        { name: 'thumbnail_url', type: 'string', isOptional: true },
        { name: 'video_url', type: 'string', isOptional: true },
        { name: 'attachments', type: 'string', isOptional: true }, // JSON array
        { name: 'views_count', type: 'number', isOptional: true },
        { name: 'rating', type: 'number', isOptional: true },
        { name: 'is_favorite', type: 'boolean' },
        { name: 'is_offline_downloaded', type: 'boolean' },
        { name: 'offline_downloaded_at', type: 'number', isOptional: true },
        { name: 'is_synced', type: 'boolean' },
        { name: 'sync_status', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Order Parts Junction Table (Many-to-Many)
    tableSchema({
      name: 'order_parts',
      columns: [
        { name: 'order_id', type: 'string', isIndexed: true },
        { name: 'part_id', type: 'string', isIndexed: true },
        { name: 'quantity', type: 'number' },
        { name: 'unit_price', type: 'number' },
        { name: 'total_price', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // Order Photos Table
    tableSchema({
      name: 'order_photos',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'order_id', type: 'string', isIndexed: true },
        { name: 'photo_url', type: 'string' },
        { name: 'thumbnail_url', type: 'string', isOptional: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'is_synced', type: 'boolean' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // CRM Contacts Table (соответствует структуре из SQL)
    tableSchema({
      name: 'crm_contacts',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'crm_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'crm_type', type: 'string', isIndexed: true, isOptional: true },
        { name: 'name', type: 'string' },
        { name: 'phone', type: 'string', isOptional: true },
        { name: 'email', type: 'string', isOptional: true },
        { name: 'company', type: 'string', isOptional: true },
        { name: 'position', type: 'string', isOptional: true },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'version', type: 'number', isIndexed: true }, // Версия для синхронизации
        { name: 'last_modified', type: 'number', isIndexed: true }, // Последнее изменение (timestamp)
        { name: 'sync_version', type: 'number' }, // Для обратной совместимости
        { name: 'last_synced_at', type: 'number', isOptional: true },
        { name: 'is_synced', type: 'boolean' },
        { name: 'sync_status', type: 'string', isOptional: true }, // 'synced' | 'pending' | 'error'
        { name: 'dirty', type: 'boolean', default: false }, // Есть ли локальные изменения
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // CRM Deals Table (соответствует структуре из SQL)
    tableSchema({
      name: 'crm_deals',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'crm_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'crm_type', type: 'string', isIndexed: true, isOptional: true },
        { name: 'title', type: 'string' },
        { name: 'contact_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'amount', type: 'number' },
        { name: 'currency', type: 'string', isOptional: true },
        { name: 'stage', type: 'string', isOptional: true },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'version', type: 'number', isIndexed: true }, // Версия для синхронизации
        { name: 'last_modified', type: 'number', isIndexed: true }, // Последнее изменение (timestamp)
        { name: 'sync_version', type: 'number' }, // Для обратной совместимости
        { name: 'last_synced_at', type: 'number', isOptional: true },
        { name: 'is_synced', type: 'boolean' },
        { name: 'sync_status', type: 'string', isOptional: true }, // 'synced' | 'pending' | 'error'
        { name: 'dirty', type: 'boolean', default: false }, // Есть ли локальные изменения
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // CRM Tasks Table (соответствует структуре из SQL)
    tableSchema({
      name: 'crm_tasks',
      columns: [
        { name: 'server_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'crm_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'crm_type', type: 'string', isIndexed: true, isOptional: true },
        { name: 'title', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'related_entity_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'related_entity_type', type: 'string', isOptional: true },
        { name: 'contact_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'deal_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'due_date', type: 'number', isOptional: true },
        { name: 'status', type: 'string' },
        { name: 'assigned_to_user_id', type: 'string', isOptional: true },
        { name: 'version', type: 'number', isIndexed: true }, // Версия для синхронизации
        { name: 'last_modified', type: 'number', isIndexed: true }, // Последнее изменение (timestamp)
        { name: 'sync_version', type: 'number' }, // Для обратной совместимости
        { name: 'last_synced_at', type: 'number', isOptional: true },
        { name: 'is_synced', type: 'boolean' },
        { name: 'sync_status', type: 'string', isOptional: true }, // 'synced' | 'pending' | 'error'
        { name: 'dirty', type: 'boolean', default: false }, // Есть ли локальные изменения
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ],
    }),

    // CRM Sync Queue Table
    tableSchema({
      name: 'crm_sync_queue',
      columns: [
        { name: 'entity_type', type: 'string', isIndexed: true },
        { name: 'entity_id', type: 'string', isIndexed: true, isOptional: true },
        { name: 'operation', type: 'string', isIndexed: true }, // 'CREATE', 'UPDATE', 'DELETE'
        { name: 'payload', type: 'string' }, // JSON
        { name: 'status', type: 'string', isIndexed: true }, // 'PENDING', 'SENT', 'ERROR'
        { name: 'retry_count', type: 'number' },
        { name: 'error_message', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'processed_at', type: 'number', isOptional: true },
      ],
    }),
  ],
});




