/**
 * State Persistence Utilities
 * Handles localStorage/sessionStorage with error handling and type safety
 */

export type StorageType = 'local' | 'session';

/**
 * Check if storage is available
 */
function isStorageAvailable(type: StorageType): boolean {
  try {
    const storage = type === 'local' ? localStorage : sessionStorage;
    const test = '__storage_test__';
    storage.setItem(test, test);
    storage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get item from storage with type safety
 */
export function getStorageItem<T>(
  key: string,
  type: StorageType = 'local',
  defaultValue?: T
): T | null {
  if (!isStorageAvailable(type)) return defaultValue || null;

  try {
    const storage = type === 'local' ? localStorage : sessionStorage;
    const item = storage.getItem(key);
    return item ? JSON.parse(item) : defaultValue || null;
  } catch (error) {
    console.error(`Error reading from ${type}Storage:`, error);
    return defaultValue || null;
  }
}

/**
 * Set item in storage
 */
export function setStorageItem<T>(
  key: string,
  value: T,
  type: StorageType = 'local'
): boolean {
  if (!isStorageAvailable(type)) return false;

  try {
    const storage = type === 'local' ? localStorage : sessionStorage;
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to ${type}Storage:`, error);
    return false;
  }
}

/**
 * Remove item from storage
 */
export function removeStorageItem(key: string, type: StorageType = 'local'): boolean {
  if (!isStorageAvailable(type)) return false;

  try {
    const storage = type === 'local' ? localStorage : sessionStorage;
    storage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from ${type}Storage:`, error);
    return false;
  }
}

/**
 * Clear all items from storage
 */
export function clearStorage(type: StorageType = 'local'): boolean {
  if (!isStorageAvailable(type)) return false;

  try {
    const storage = type === 'local' ? localStorage : sessionStorage;
    storage.clear();
    return true;
  } catch (error) {
    console.error(`Error clearing ${type}Storage:`, error);
    return false;
  }
}

/**
 * Get all keys from storage
 */
export function getStorageKeys(type: StorageType = 'local'): string[] {
  if (!isStorageAvailable(type)) return [];

  try {
    const storage = type === 'local' ? localStorage : sessionStorage;
    return Object.keys(storage);
  } catch (error) {
    console.error(`Error reading keys from ${type}Storage:`, error);
    return [];
  }
}

/**
 * Create a namespaced storage handler
 */
export function createNamespacedStorage(namespace: string, type: StorageType = 'local') {
  const prefix = `${namespace}:`;

  return {
    get<T>(key: string, defaultValue?: T): T | null {
      return getStorageItem<T>(`${prefix}${key}`, type, defaultValue);
    },
    set<T>(key: string, value: T): boolean {
      return setStorageItem(`${prefix}${key}`, value, type);
    },
    remove(key: string): boolean {
      return removeStorageItem(`${prefix}${key}`, type);
    },
    clear(): boolean {
      const keys = getStorageKeys(type).filter((key) => key.startsWith(prefix));
      let success = true;
      keys.forEach((key) => {
        if (!removeStorageItem(key, type)) success = false;
      });
      return success;
    },
    keys(): string[] {
      return getStorageKeys(type)
        .filter((key) => key.startsWith(prefix))
        .map((key) => key.replace(prefix, ''));
    },
  };
}

/**
 * Persist query cache to storage
 */
export function persistQueryCache(
  cacheData: unknown,
  key: string = 'ghxstship-query-cache'
): boolean {
  return setStorageItem(key, cacheData);
}

/**
 * Hydrate query cache from storage
 */
export function hydrateQueryCache(key: string = 'ghxstship-query-cache'): unknown {
  return getStorageItem(key);
}

/**
 * Create storage listener for cross-tab synchronization
 */
export function createStorageListener(
  callback: (key: string, newValue: unknown, oldValue: unknown) => void
): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key && e.storageArea === localStorage) {
      const newValue = e.newValue ? JSON.parse(e.newValue) : null;
      const oldValue = e.oldValue ? JSON.parse(e.oldValue) : null;
      callback(e.key, newValue, oldValue);
    }
  };

  window.addEventListener('storage', handler);

  return () => window.removeEventListener('storage', handler);
}
