/**
 * Gap 8 Remediation: Service Worker and Offline Queue
 * Implements offline support with data synchronization
 */

import { logger } from '../logger';

// Types for offline queue
export interface OfflineQueueItem {
  id: string;
  timestamp: number;
  action: 'create' | 'update' | 'delete';
  table: string;
  data: Record<string, unknown>;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'failed' | 'completed';
  error?: string;
}

export interface OfflineSyncConfig {
  maxRetries: number;
  retryDelayMs: number;
  batchSize: number;
  syncIntervalMs: number;
}

export const DEFAULT_SYNC_CONFIG: OfflineSyncConfig = {
  maxRetries: 3,
  retryDelayMs: 5000,
  batchSize: 10,
  syncIntervalMs: 30000,
};

// IndexedDB database name and stores
const DB_NAME = 'ghxstship_offline';
const DB_VERSION = 1;
const QUEUE_STORE = 'offline_queue';
const CACHE_STORE = 'data_cache';

/**
 * Initialize IndexedDB for offline storage
 */
export function initOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create offline queue store
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        const queueStore = db.createObjectStore(QUEUE_STORE, { keyPath: 'id' });
        queueStore.createIndex('status', 'status', { unique: false });
        queueStore.createIndex('timestamp', 'timestamp', { unique: false });
        queueStore.createIndex('table', 'table', { unique: false });
      }

      // Create data cache store
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        const cacheStore = db.createObjectStore(CACHE_STORE, { keyPath: 'key' });
        cacheStore.createIndex('table', 'table', { unique: false });
        cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
      }
    };
  });
}

/**
 * Add item to offline queue
 */
export async function addToOfflineQueue(
  action: OfflineQueueItem['action'],
  table: string,
  data: Record<string, unknown>,
  config: Partial<OfflineSyncConfig> = {}
): Promise<string> {
  const db = await initOfflineDB();
  const mergedConfig = { ...DEFAULT_SYNC_CONFIG, ...config };

  const item: OfflineQueueItem = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    action,
    table,
    data,
    retryCount: 0,
    maxRetries: mergedConfig.maxRetries,
    status: 'pending',
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(QUEUE_STORE);
    const request = store.add(item);

    request.onsuccess = () => resolve(item.id);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get pending items from offline queue
 */
export async function getPendingQueueItems(
  limit: number = 10
): Promise<OfflineQueueItem[]> {
  const db = await initOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([QUEUE_STORE], 'readonly');
    const store = transaction.objectStore(QUEUE_STORE);
    const index = store.index('status');
    const request = index.getAll(IDBKeyRange.only('pending'), limit);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Update queue item status
 */
export async function updateQueueItemStatus(
  id: string,
  status: OfflineQueueItem['status'],
  error?: string
): Promise<void> {
  const db = await initOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(QUEUE_STORE);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const item = getRequest.result as OfflineQueueItem;
      if (!item) {
        reject(new Error('Item not found'));
        return;
      }

      item.status = status;
      if (error) item.error = error;
      if (status === 'failed') item.retryCount++;

      const updateRequest = store.put(item);
      updateRequest.onsuccess = () => resolve();
      updateRequest.onerror = () => reject(updateRequest.error);
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

/**
 * Remove completed items from queue
 */
export async function clearCompletedItems(): Promise<number> {
  const db = await initOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([QUEUE_STORE], 'readwrite');
    const store = transaction.objectStore(QUEUE_STORE);
    const index = store.index('status');
    const request = index.openCursor(IDBKeyRange.only('completed'));

    let count = 0;

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        count++;
        cursor.continue();
      } else {
        resolve(count);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Cache data for offline access
 */
export async function cacheData(
  key: string,
  table: string,
  data: unknown,
  ttlMs: number = 3600000 // 1 hour default
): Promise<void> {
  const db = await initOfflineDB();

  const cacheItem = {
    key,
    table,
    data,
    cachedAt: Date.now(),
    expiresAt: Date.now() + ttlMs,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CACHE_STORE], 'readwrite');
    const store = transaction.objectStore(CACHE_STORE);
    const request = store.put(cacheItem);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get cached data
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  const db = await initOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CACHE_STORE], 'readonly');
    const store = transaction.objectStore(CACHE_STORE);
    const request = store.get(key);

    request.onsuccess = () => {
      const result = request.result;
      if (!result) {
        resolve(null);
        return;
      }

      // Check if expired
      if (result.expiresAt < Date.now()) {
        // Delete expired item
        const deleteTransaction = db.transaction([CACHE_STORE], 'readwrite');
        const deleteStore = deleteTransaction.objectStore(CACHE_STORE);
        deleteStore.delete(key);
        resolve(null);
        return;
      }

      resolve(result.data as T);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Clear expired cache items
 */
export async function clearExpiredCache(): Promise<number> {
  const db = await initOfflineDB();
  const now = Date.now();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([CACHE_STORE], 'readwrite');
    const store = transaction.objectStore(CACHE_STORE);
    const index = store.index('expiresAt');
    const request = index.openCursor(IDBKeyRange.upperBound(now));

    let count = 0;

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        cursor.delete();
        count++;
        cursor.continue();
      } else {
        resolve(count);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<{
  pending: number;
  processing: number;
  failed: number;
  completed: number;
  total: number;
}> {
  const db = await initOfflineDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([QUEUE_STORE], 'readonly');
    const store = transaction.objectStore(QUEUE_STORE);
    const index = store.index('status');

    const stats = {
      pending: 0,
      processing: 0,
      failed: 0,
      completed: 0,
      total: 0,
    };

    const statuses: Array<keyof typeof stats> = ['pending', 'processing', 'failed', 'completed'];
    let completed = 0;

    statuses.forEach((status) => {
      const countRequest = index.count(IDBKeyRange.only(status));
      countRequest.onsuccess = () => {
        stats[status] = countRequest.result;
        stats.total += countRequest.result;
        completed++;
        if (completed === statuses.length) {
          resolve(stats);
        }
      };
      countRequest.onerror = () => reject(countRequest.error);
    });
  });
}

/**
 * Check if online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Register online/offline event listeners
 */
export function registerConnectivityListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

/**
 * Service Worker registration helper
 */
export async function registerServiceWorker(
  swPath: string = '/sw.js'
): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(swPath);
    // eslint-disable-next-line no-console
    console.log('Service Worker registered:', registration.scope);
    return registration;
  } catch (error) {
    logger.error('Service Worker registration failed', error instanceof Error ? error : undefined);
    return null;
  }
}

/**
 * Unregister all service workers
 */
export async function unregisterServiceWorkers(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((r) => r.unregister()));
    return true;
  } catch (error) {
    logger.error('Failed to unregister service workers', error instanceof Error ? error : undefined);
    return false;
  }
}
