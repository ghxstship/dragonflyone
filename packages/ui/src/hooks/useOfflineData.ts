'use client';

import { useState, useEffect, useCallback } from 'react';

interface OfflineDataOptions<T> {
  key: string;
  fetchFn: () => Promise<T>;
  ttl?: number; // Time to live in milliseconds
  onError?: (error: Error) => void;
}

interface CachedData<T> {
  data: T;
  timestamp: number;
  version: number;
}

const CACHE_VERSION = 1;
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Hook for managing offline data with IndexedDB caching
 * Provides automatic caching, background sync, and offline fallback
 */
export function useOfflineData<T>({
  key,
  fetchFn,
  ttl = DEFAULT_TTL,
  onError,
}: OfflineDataOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [isCached, setIsCached] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Check online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Open IndexedDB
  const openDB = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ghxstship-offline-cache', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'key' });
        }
      };
    });
  }, []);

  // Get cached data
  const getCachedData = useCallback(async (): Promise<CachedData<T> | null> => {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('cache', 'readonly');
        const store = transaction.objectStore('cache');
        const request = store.get(key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const result = request.result;
          if (result && result.version === CACHE_VERSION) {
            resolve(result as CachedData<T>);
          } else {
            resolve(null);
          }
        };
      });
    } catch {
      return null;
    }
  }, [key, openDB]);

  // Set cached data
  const setCachedData = useCallback(async (newData: T): Promise<void> => {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('cache', 'readwrite');
        const store = transaction.objectStore('cache');
        const cacheEntry: CachedData<T> & { key: string } = {
          key,
          data: newData,
          timestamp: Date.now(),
          version: CACHE_VERSION,
        };
        const request = store.put(cacheEntry);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch {
      // Silently fail cache writes
    }
  }, [key, openDB]);

  // Clear cached data
  const clearCache = useCallback(async (): Promise<void> => {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('cache', 'readwrite');
        const store = transaction.objectStore('cache');
        const request = store.delete(key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    } catch {
      // Silently fail cache clears
    }
  }, [key, openDB]);

  // Fetch fresh data
  const fetchData = useCallback(async (forceRefresh = false): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cached = await getCachedData();
        if (cached) {
          const isExpired = Date.now() - cached.timestamp > ttl;
          setData(cached.data);
          setIsCached(true);
          setLastUpdated(new Date(cached.timestamp));

          // If cache is fresh, don't fetch
          if (!isExpired) {
            setIsLoading(false);
            return;
          }
        }
      }

      // Fetch fresh data if online
      if (navigator.onLine) {
        const freshData = await fetchFn();
        setData(freshData);
        setIsCached(false);
        setLastUpdated(new Date());
        await setCachedData(freshData);
      } else if (!data) {
        // Offline and no cached data
        throw new Error('No cached data available while offline');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch data');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [data, fetchFn, getCachedData, onError, setCachedData, ttl]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch when coming back online
  useEffect(() => {
    if (!isOffline && isCached) {
      fetchData(true);
    }
  }, [isOffline, isCached, fetchData]);

  return {
    data,
    isLoading,
    isOffline,
    isCached,
    error,
    lastUpdated,
    refetch: () => fetchData(true),
    clearCache,
  };
}

/**
 * Hook for storing pending operations to sync when online
 */
export function usePendingSync<T>(storeName: string) {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  const openDB = useCallback((): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('ghxstship-pending-sync', 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }, [storeName]);

  // Add pending operation
  const addPending = useCallback(async (operation: T): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add({
        data: operation,
        timestamp: Date.now(),
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        setPendingCount(prev => prev + 1);
        resolve();
      };
    });
  }, [openDB, storeName]);

  // Get all pending operations
  const getPending = useCallback(async (): Promise<Array<{ id: number; data: T; timestamp: number }>> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }, [openDB, storeName]);

  // Remove pending operation
  const removePending = useCallback(async (id: number): Promise<void> => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        setPendingCount(prev => Math.max(0, prev - 1));
        resolve();
      };
    });
  }, [openDB, storeName]);

  // Sync all pending operations
  const syncAll = useCallback(async (
    syncFn: (data: T) => Promise<void>
  ): Promise<{ success: number; failed: number }> => {
    setIsSyncing(true);
    let success = 0;
    let failed = 0;

    try {
      const pending = await getPending();
      
      for (const item of pending) {
        try {
          await syncFn(item.data);
          await removePending(item.id);
          success++;
        } catch {
          failed++;
        }
      }
    } finally {
      setIsSyncing(false);
    }

    return { success, failed };
  }, [getPending, removePending]);

  // Update pending count on mount
  useEffect(() => {
    getPending().then(items => setPendingCount(items.length));
  }, [getPending]);

  return {
    pendingCount,
    isSyncing,
    addPending,
    getPending,
    removePending,
    syncAll,
  };
}
