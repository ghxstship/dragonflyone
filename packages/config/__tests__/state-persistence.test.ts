import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getStorageItem,
  setStorageItem,
  removeStorageItem,
  clearStorage,
  getStorageKeys,
  createNamespacedStorage,
  persistQueryCache,
  hydrateQueryCache,
} from '../state-persistence';

// Mock localStorage and sessionStorage
const createStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    ...Object.keys(store).reduce((acc, key) => {
      acc[key] = store[key];
      return acc;
    }, {} as Record<string, string>),
  };
};

describe('state-persistence', () => {
  let localStorageMock: ReturnType<typeof createStorageMock>;
  let sessionStorageMock: ReturnType<typeof createStorageMock>;

  beforeEach(() => {
    localStorageMock = createStorageMock();
    sessionStorageMock = createStorageMock();

    vi.stubGlobal('localStorage', localStorageMock);
    vi.stubGlobal('sessionStorage', sessionStorageMock);
  });

  describe('getStorageItem', () => {
    it('should return parsed value from localStorage', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ name: 'test' }));
      const result = getStorageItem<{ name: string }>('testKey');
      expect(result).toEqual({ name: 'test' });
    });

    it('should return null for non-existent key', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const result = getStorageItem('nonExistent');
      expect(result).toBeNull();
    });

    it('should return default value when key not found', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const result = getStorageItem('nonExistent', 'local', 'default');
      expect(result).toBe('default');
    });

    it('should use sessionStorage when specified', () => {
      sessionStorageMock.getItem.mockReturnValue(JSON.stringify('session-value'));
      const result = getStorageItem('testKey', 'session');
      expect(sessionStorageMock.getItem).toHaveBeenCalledWith('testKey');
      expect(result).toBe('session-value');
    });
  });

  describe('setStorageItem', () => {
    it('should store stringified value in localStorage', () => {
      const result = setStorageItem('testKey', { name: 'test' });
      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'testKey',
        JSON.stringify({ name: 'test' })
      );
    });

    it('should use sessionStorage when specified', () => {
      setStorageItem('testKey', 'value', 'session');
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        'testKey',
        JSON.stringify('value')
      );
    });

    it('should return true on success', () => {
      const result = setStorageItem('testKey', 'value');
      expect(result).toBe(true);
    });
  });

  describe('removeStorageItem', () => {
    it('should remove item from localStorage', () => {
      const result = removeStorageItem('testKey');
      expect(result).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('testKey');
    });

    it('should use sessionStorage when specified', () => {
      removeStorageItem('testKey', 'session');
      expect(sessionStorageMock.removeItem).toHaveBeenCalledWith('testKey');
    });
  });

  describe('clearStorage', () => {
    it('should clear localStorage', () => {
      const result = clearStorage();
      expect(result).toBe(true);
      expect(localStorageMock.clear).toHaveBeenCalled();
    });

    it('should clear sessionStorage when specified', () => {
      clearStorage('session');
      expect(sessionStorageMock.clear).toHaveBeenCalled();
    });
  });

  describe('getStorageKeys', () => {
    it('should return array of keys', () => {
      // Mock Object.keys behavior
      vi.stubGlobal('localStorage', {
        ...localStorageMock,
        key1: 'value1',
        key2: 'value2',
        getItem: localStorageMock.getItem,
        setItem: localStorageMock.setItem,
        removeItem: localStorageMock.removeItem,
        clear: localStorageMock.clear,
      });
      
      const keys = getStorageKeys();
      expect(Array.isArray(keys)).toBe(true);
    });
  });

  describe('createNamespacedStorage', () => {
    it('should create storage with namespace prefix', () => {
      const storage = createNamespacedStorage('myApp');
      storage.set('key', 'value');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'myApp:key',
        JSON.stringify('value')
      );
    });

    it('should get value with namespace prefix', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify('namespaced-value'));
      const storage = createNamespacedStorage('myApp');
      storage.get('key');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('myApp:key');
    });

    it('should remove value with namespace prefix', () => {
      const storage = createNamespacedStorage('myApp');
      storage.remove('key');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('myApp:key');
    });

    it('should use sessionStorage when specified', () => {
      const storage = createNamespacedStorage('myApp', 'session');
      storage.set('key', 'value');
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        'myApp:key',
        JSON.stringify('value')
      );
    });
  });

  describe('persistQueryCache', () => {
    it('should persist cache data with default key', () => {
      const cacheData = { queries: [] };
      persistQueryCache(cacheData);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ghxstship-query-cache',
        JSON.stringify(cacheData)
      );
    });

    it('should persist cache data with custom key', () => {
      const cacheData = { queries: [] };
      persistQueryCache(cacheData, 'custom-cache');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'custom-cache',
        JSON.stringify(cacheData)
      );
    });
  });

  describe('hydrateQueryCache', () => {
    it('should hydrate cache with default key', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ queries: [] }));
      hydrateQueryCache();
      expect(localStorageMock.getItem).toHaveBeenCalledWith('ghxstship-query-cache');
    });

    it('should hydrate cache with custom key', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ queries: [] }));
      hydrateQueryCache('custom-cache');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('custom-cache');
    });

    it('should return null for non-existent cache', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const _result = hydrateQueryCache();
      expect(_result).toBeNull();
    });
  });
});
