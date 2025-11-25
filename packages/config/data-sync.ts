/**
 * Data Synchronization Utilities
 * Handles offline/online sync, conflict resolution, and data consistency
 */

import { QueryClient } from '@tanstack/react-query';

export interface SyncQueueItem {
  id: string;
  operation: 'create' | 'update' | 'delete';
  table: string;
  data: unknown;
  timestamp: number;
  retries: number;
}

export class DataSyncManager {
  private syncQueue: SyncQueueItem[] = [];
  private isOnline: boolean = true;
  private maxRetries: number = 3;
  private syncInProgress: boolean = false;

  constructor(private queryClient: QueryClient) {
    this.initNetworkListener();
    this.loadQueueFromStorage();
  }

  /**
   * Initialize network status listener
   */
  private initNetworkListener() {
    if (typeof window === 'undefined') return;

    this.isOnline = navigator.onLine;

    window.addEventListener('online', () => {
      console.log('Network: Online');
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      console.log('Network: Offline');
      this.isOnline = false;
    });
  }

  /**
   * Load pending operations from localStorage
   */
  private loadQueueFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem('ghxstship-sync-queue');
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
    }
  }

  /**
   * Save sync queue to localStorage
   */
  private saveQueueToStorage() {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('ghxstship-sync-queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  /**
   * Add operation to sync queue
   */
  public queueOperation(
    operation: SyncQueueItem['operation'],
    table: string,
    data: unknown
  ): string {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const item: SyncQueueItem = {
      id,
      operation,
      table,
      data,
      timestamp: Date.now(),
      retries: 0,
    };

    this.syncQueue.push(item);
    this.saveQueueToStorage();

    if (this.isOnline) {
      this.processSyncQueue();
    }

    return id;
  }

  /**
   * Process pending operations in the sync queue
   */
  public async processSyncQueue(): Promise<void> {
    if (this.syncInProgress || !this.isOnline || this.syncQueue.length === 0) {
      return;
    }

    this.syncInProgress = true;

    try {
      const failedItems: SyncQueueItem[] = [];

      for (const item of this.syncQueue) {
        try {
          await this.executeOperation(item);
          console.log('Synced:', item);
        } catch (error) {
          console.error('Sync failed:', item, error);
          
          if (item.retries < this.maxRetries) {
            failedItems.push({
              ...item,
              retries: item.retries + 1,
            });
          } else {
            console.error('Max retries reached, dropping:', item);
          }
        }
      }

      this.syncQueue = failedItems;
      this.saveQueueToStorage();
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Execute a single sync operation
   */
  private async executeOperation(item: SyncQueueItem): Promise<void> {
    // This would integrate with your actual API
    // For now, we'll invalidate queries to trigger refetch
    await this.queryClient.invalidateQueries({
      queryKey: [item.table],
    });
  }

  /**
   * Clear sync queue
   */
  public clearQueue(): void {
    this.syncQueue = [];
    this.saveQueueToStorage();
  }

  /**
   * Get queue status
   */
  public getQueueStatus() {
    return {
      pending: this.syncQueue.length,
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
    };
  }

  /**
   * Check if network is online
   */
  public checkOnlineStatus(): boolean {
    return this.isOnline;
  }
}

/**
 * Conflict resolution strategies
 */
export enum ConflictStrategy {
  CLIENT_WINS = 'client-wins',
  SERVER_WINS = 'server-wins',
  LAST_WRITE_WINS = 'last-write-wins',
  MERGE = 'merge',
}

/**
 * Resolve data conflict
 */
export function resolveConflict<T extends { updated_at?: string }>(
  clientData: T,
  serverData: T,
  strategy: ConflictStrategy = ConflictStrategy.SERVER_WINS
): T {
  switch (strategy) {
    case ConflictStrategy.CLIENT_WINS:
      return clientData;

    case ConflictStrategy.SERVER_WINS:
      return serverData;

    case ConflictStrategy.LAST_WRITE_WINS:
      if (!clientData.updated_at || !serverData.updated_at) {
        return serverData;
      }
      return new Date(clientData.updated_at) > new Date(serverData.updated_at)
        ? clientData
        : serverData;

    case ConflictStrategy.MERGE:
      return { ...serverData, ...clientData };

    default:
      return serverData;
  }
}

/**
 * Create optimistic mutation with offline queue support
 */
export function createOfflineAwareMutation<TData, TVariables>(
  syncManager: DataSyncManager,
  table: string,
  operation: SyncQueueItem['operation']
) {
  return {
    mutationFn: async (variables: TVariables) => {
      if (!syncManager.checkOnlineStatus()) {
        // Queue for later sync
        const id = syncManager.queueOperation(operation, table, variables);
        return { id, queued: true } as unknown as TData;
      }

      // Execute immediately if online
      return variables as unknown as TData;
    },
    onError: (error: Error, variables: TVariables) => {
      // Queue on error
      console.error('Mutation failed, queuing:', error);
      syncManager.queueOperation(operation, table, variables);
    },
  };
}
