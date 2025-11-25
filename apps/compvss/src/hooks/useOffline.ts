'use client';

import { useState, useEffect, useCallback } from 'react';

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

const DB_NAME = 'compvss-offline';
const DB_VERSION = 1;

// Open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains('crew-updates')) {
        db.createObjectStore('crew-updates', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('timesheet-entries')) {
        db.createObjectStore('timesheet-entries', { keyPath: 'id', autoIncrement: true });
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
        console.log('[App] Service Worker registered:', registration.scope);
        setState(s => ({ ...s, isServiceWorkerReady: true }));
      } catch (error) {
        console.error('[App] Service Worker registration failed:', error);
      }
    }
  }, []);

  const requestSync = useCallback(async (tag: string) => {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register(tag);
    }
  }, []);

  return {
    ...state,
    registerServiceWorker,
    requestSync,
  };
}

// Hook for caching data locally
export function useOfflineCache<T>(key: string, maxAge: number = 3600000) {
  const [cachedData, setCachedData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load cached data on mount
  useEffect(() => {
    async function loadCached() {
      try {
        const db = await openDB();
        const transaction = db.transaction('cached-data', 'readonly');
        const store = transaction.objectStore('cached-data');
        const request = store.get(key);

        request.onsuccess = () => {
          const result = request.result as CachedData<T> | undefined;
          if (result && Date.now() - result.timestamp < maxAge) {
            setCachedData(result.data);
          }
          setIsLoading(false);
        };

        request.onerror = () => {
          setIsLoading(false);
        };
      } catch {
        setIsLoading(false);
      }
    }

    loadCached();
  }, [key, maxAge]);

  // Save data to cache
  const saveToCache = useCallback(async (data: T) => {
    try {
      const db = await openDB();
      const transaction = db.transaction('cached-data', 'readwrite');
      const store = transaction.objectStore('cached-data');
      
      const cacheEntry: CachedData<T> = {
        key,
        data,
        timestamp: Date.now(),
      };
      
      store.put(cacheEntry);
      setCachedData(data);
    } catch (error) {
      console.error('[Cache] Failed to save:', error);
    }
  }, [key]);

  // Clear cached data
  const clearCache = useCallback(async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction('cached-data', 'readwrite');
      const store = transaction.objectStore('cached-data');
      store.delete(key);
      setCachedData(null);
    } catch (error) {
      console.error('[Cache] Failed to clear:', error);
    }
  }, [key]);

  return {
    cachedData,
    isLoading,
    saveToCache,
    clearCache,
  };
}

// Hook for queuing offline actions
export function useOfflineQueue(storeName: 'crew-updates' | 'timesheet-entries') {
  const [pendingCount, setPendingCount] = useState(0);

  // Get pending count
  useEffect(() => {
    async function getPendingCount() {
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
    }

    getPendingCount();
  }, [storeName]);

  // Add item to queue
  const addToQueue = useCallback(async (data: any) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      store.add({
        data,
        timestamp: Date.now(),
      });

      setPendingCount(c => c + 1);

      // Request background sync if available
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await (registration as any).sync.register(`sync-${storeName}`);
      }
    } catch (error) {
      console.error('[Queue] Failed to add:', error);
      throw error;
    }
  }, [storeName]);

  // Get all pending items
  const getPendingItems = useCallback(async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      
      return new Promise<any[]>((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('[Queue] Failed to get pending:', error);
      return [];
    }
  }, [storeName]);

  // Clear all pending items
  const clearQueue = useCallback(async () => {
    try {
      const db = await openDB();
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      store.clear();
      setPendingCount(0);
    } catch (error) {
      console.error('[Queue] Failed to clear:', error);
    }
  }, [storeName]);

  return {
    pendingCount,
    addToQueue,
    getPendingItems,
    clearQueue,
  };
}

export default useOffline;
