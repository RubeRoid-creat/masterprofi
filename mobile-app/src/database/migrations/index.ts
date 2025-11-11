/**
 * Database Migrations
 */

import { schemaMigrations, addColumns, createTable } from '@nozbe/watermelondb/Schema/migrations';

// Migration 1: Initial schema (version 1)
// This is already defined in schema.ts, so we start from version 2

export const migrations = schemaMigrations({
  migrations: [
    // Migration 2: Add CRM tables
    {
      toVersion: 2,
      steps: [
        createTable({
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
            { name: 'sync_version', type: 'number' },
            { name: 'last_synced_at', type: 'number', isOptional: true },
            { name: 'is_synced', type: 'boolean' },
            { name: 'sync_status', type: 'string', isOptional: true },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        createTable({
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
            { name: 'sync_version', type: 'number' },
            { name: 'last_synced_at', type: 'number', isOptional: true },
            { name: 'is_synced', type: 'boolean' },
            { name: 'sync_status', type: 'string', isOptional: true },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        createTable({
          name: 'crm_tasks',
          columns: [
            { name: 'server_id', type: 'string', isIndexed: true, isOptional: true },
            { name: 'crm_id', type: 'string', isIndexed: true, isOptional: true },
            { name: 'crm_type', type: 'string', isIndexed: true, isOptional: true },
            { name: 'title', type: 'string' },
            { name: 'description', type: 'string', isOptional: true },
            { name: 'related_entity_id', type: 'string', isIndexed: true, isOptional: true },
            { name: 'related_entity_type', type: 'string', isOptional: true },
            { name: 'due_date', type: 'number', isOptional: true },
            { name: 'status', type: 'string' },
            { name: 'assigned_to_user_id', type: 'string', isOptional: true },
            { name: 'sync_version', type: 'number' },
            { name: 'last_synced_at', type: 'number', isOptional: true },
            { name: 'is_synced', type: 'boolean' },
            { name: 'sync_status', type: 'string', isOptional: true },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
          ],
        }),
        createTable({
          name: 'crm_sync_queue',
          columns: [
            { name: 'entity_type', type: 'string', isIndexed: true },
            { name: 'entity_id', type: 'string', isIndexed: true, isOptional: true },
            { name: 'operation', type: 'string', isIndexed: true },
            { name: 'payload', type: 'string' },
            { name: 'status', type: 'string', isIndexed: true },
            { name: 'retry_count', type: 'number' },
            { name: 'error_message', type: 'string', isOptional: true },
            { name: 'created_at', type: 'number' },
            { name: 'updated_at', type: 'number' },
            { name: 'processed_at', type: 'number', isOptional: true },
          ],
        }),
      ],
    },
  ],
});




