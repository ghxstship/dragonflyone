/**
 * Gap 8 Remediation: Offline Sync Manager
 * Handles synchronization of offline queue with server
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  getPendingQueueItems,
  updateQueueItemStatus,
  clearCompletedItems,
  isOnline,
  registerConnectivityListeners,
  OfflineQueueItem,
  OfflineSyncConfig,
  DEFAULT_SYNC_CONFIG,
} from './service-worker';

export interface SyncResult {
  success: boolean;
  processed: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

export interface SyncManagerConfig extends OfflineSyncConfig {
  supabaseUrl: string;
  supabaseKey: string;
  onSyncStart?: () => void;
  onSyncComplete?: (result: SyncResult) => void;
  onSyncError?: (error: Error) => void;
  onConnectivityChange?: (online: boolean) => void;
}

/**
 * Offline Sync Manager
 * Manages synchronization of offline data with the server
 */
export class OfflineSyncManager {
  private config: SyncManagerConfig;
  private supabase: SupabaseClient;
  private syncInterval: ReturnType<typeof setInterval> | null = null;
  private isSyncing = false;
  private unsubscribeConnectivity: (() => void) | null = null;

  constructor(config: SyncManagerConfig) {
    this.config = { ...DEFAULT_SYNC_CONFIG, ...config };
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }

  /**
   * Start the sync manager
   */
  start(): void {
    // Register connectivity listeners
    this.unsubscribeConnectivity = registerConnectivityListeners(
      () => {
        this.config.onConnectivityChange?.(true);
        // Trigger sync when coming online
        this.sync();
      },
      () => {
        this.config.onConnectivityChange?.(false);
      }
    );

    // Start periodic sync
    this.syncInterval = setInterval(() => {
      if (isOnline()) {
        this.sync();
      }
    }, this.config.syncIntervalMs);

    // Initial sync if online
    if (isOnline()) {
      this.sync();
    }
  }

  /**
   * Stop the sync manager
   */
  stop(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }

    if (this.unsubscribeConnectivity) {
      this.unsubscribeConnectivity();
      this.unsubscribeConnectivity = null;
    }
  }

  /**
   * Perform sync operation
   */
  async sync(): Promise<SyncResult> {
    if (this.isSyncing || !isOnline()) {
      return { success: false, processed: 0, failed: 0, errors: [] };
    }

    this.isSyncing = true;
    this.config.onSyncStart?.();

    const result: SyncResult = {
      success: true,
      processed: 0,
      failed: 0,
      errors: [],
    };

    try {
      // Get pending items
      const items = await getPendingQueueItems(this.config.batchSize);

      for (const item of items) {
        try {
          await this.processItem(item);
          await updateQueueItemStatus(item.id, 'completed');
          result.processed++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          if (item.retryCount >= item.maxRetries) {
            await updateQueueItemStatus(item.id, 'failed', errorMessage);
            result.failed++;
            result.errors.push({ id: item.id, error: errorMessage });
          } else {
            await updateQueueItemStatus(item.id, 'pending', errorMessage);
          }
        }
      }

      // Clear completed items periodically
      await clearCompletedItems();

      this.config.onSyncComplete?.(result);
    } catch (error) {
      result.success = false;
      this.config.onSyncError?.(error instanceof Error ? error : new Error('Sync failed'));
    } finally {
      this.isSyncing = false;
    }

    return result;
  }

  /**
   * Process a single queue item
   */
  private async processItem(item: OfflineQueueItem): Promise<void> {
    await updateQueueItemStatus(item.id, 'processing');

    switch (item.action) {
      case 'create':
        await this.processCreate(item);
        break;
      case 'update':
        await this.processUpdate(item);
        break;
      case 'delete':
        await this.processDelete(item);
        break;
      default:
        throw new Error(`Unknown action: ${item.action}`);
    }
  }

  /**
   * Process create action
   */
  private async processCreate(item: OfflineQueueItem): Promise<void> {
    const { error } = await this.supabase
      .from(item.table)
      .insert(item.data);

    if (error) {
      throw new Error(`Create failed: ${error.message}`);
    }
  }

  /**
   * Process update action
   */
  private async processUpdate(item: OfflineQueueItem): Promise<void> {
    const { id, ...updateData } = item.data;

    if (!id) {
      throw new Error('Update requires an id field');
    }

    const { error } = await this.supabase
      .from(item.table)
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw new Error(`Update failed: ${error.message}`);
    }
  }

  /**
   * Process delete action
   */
  private async processDelete(item: OfflineQueueItem): Promise<void> {
    const { id } = item.data;

    if (!id) {
      throw new Error('Delete requires an id field');
    }

    const { error } = await this.supabase
      .from(item.table)
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  /**
   * Force immediate sync
   */
  async forceSync(): Promise<SyncResult> {
    return this.sync();
  }

  /**
   * Check if currently syncing
   */
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }
}

/**
 * Create and configure sync manager
 */
export function createSyncManager(
  supabaseUrl: string,
  supabaseKey: string,
  options: Partial<Omit<SyncManagerConfig, 'supabaseUrl' | 'supabaseKey'>> = {}
): OfflineSyncManager {
  return new OfflineSyncManager({
    ...DEFAULT_SYNC_CONFIG,
    supabaseUrl,
    supabaseKey,
    ...options,
  });
}
