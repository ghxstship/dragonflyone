'use client';

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@ghxstship/config';

interface OfflineState {
  isOnline: boolean;
  isServiceWorkerReady: boolean;
  pendingSyncCount: number;
}

interface CachedData<T> {
  data: T;
  timestamp: number;
  key: string;
}

const DB_NAME = 'gvteway-offline';
const DB_VERSION = 1;

// Open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('cart-updates')) {
        db.createObjectStore('cart-updates', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('wishlist-updates')) {
        db.createObjectStore('wishlist-updates', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('cached-data')) {
        db.createObjectStore('cached-data', { keyPath: 'key' });
      }
    };
  });
}

// Hook for offline state management
export function useOffline(): OfflineState & {
  registerServiceWorker: () => Promise<void>;
  requestSync: (tag: string) => Promise<void>;
} {
  const [state, setState] = useState<OfflineState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isServiceWorkerReady: false,
    pendingSyncCount: 0,
  });

  useEffect(() => {
    const handleOnline = () => setState(s => ({ ...s, isOnline: true }));
    const handleOffline = () => setState(s => ({ ...s, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check service worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setState(s => ({ ...s, isServiceWorkerReady: true }));
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        logger.info(`Service Worker registered: ${registration.scope}`);
        setState(s => ({ ...s, isServiceWorkerReady: true }));
      } catch (error) {
        logger.error('Service Worker registration failed', error instanceof Error ? error : undefined);
      }
    }
  }, []);

  const requestSync = useCallback(async (tag: string) => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register(tag);
    }
  }, []);

  return {
    ...state,
    registerServiceWorker,
    requestSync,
  };
}

// Hook for caching data offline
export function useOfflineCache<T>(key: string, initialData?: T) {
  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(true);

  const loadFromCache = useCallback(async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction('cached-data', 'readonly');
      const store = transaction.objectStore('cached-data');
      const request = store.get(key);

      request.onsuccess = () => {
        if (request.result) {
          const cached = request.result as CachedData<T>;
          setData(cached.data);
        }
        setLoading(false);
      };

      request.onerror = () => {
        setLoading(false);
      };
    } catch {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    loadFromCache();
  }, [loadFromCache]);

  const saveToCache = async (newData: T) => {
    try {
      const db = await openDB();
      const transaction = db.transaction('cached-data', 'readwrite');
      const store = transaction.objectStore('cached-data');
      
      const cacheEntry: CachedData<T> = {
        key,
        data: newData,
        timestamp: Date.now(),
      };
      
      store.put(cacheEntry);
      setData(newData);
    } catch (error) {
      logger.error('Failed to save to cache', error instanceof Error ? error : undefined);
    }
  };

  const clearCache = async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction('cached-data', 'readwrite');
      const store = transaction.objectStore('cached-data');
      store.delete(key);
      setData(undefined);
    } catch (error) {
      logger.error('Failed to clear cache', error instanceof Error ? error : undefined);
    }
  };

  return {
    data,
    loading,
    saveToCache,
    clearCache,
    refreshCache: loadFromCache,
  };
}

// Hook for queuing offline actions
export function useOfflineQueue(storeName: 'cart-updates' | 'wishlist-updates') {
  const [pendingCount, setPendingCount] = useState(0);

  const loadPendingCount = useCallback(async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => {
        setPendingCount(request.result);
      };
    } catch {
      // Ignore errors
    }
  }, [storeName]);

  useEffect(() => {
    loadPendingCount();
  }, [loadPendingCount]);

  const addToQueue = async (data: Record<string, unknown>) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      store.add({ data, timestamp: Date.now() });
      setPendingCount(c => c + 1);
    } catch (error) {
      logger.error('Failed to add to offline queue', error instanceof Error ? error : undefined);
    }
  };

  const clearQueue = async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      store.clear();
      setPendingCount(0);
    } catch (error) {
      logger.error('Failed to clear offline queue', error instanceof Error ? error : undefined);
    }
  };

  return {
    pendingCount,
    addToQueue,
    clearQueue,
    refreshCount: loadPendingCount,
  };
}
