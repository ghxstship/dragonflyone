import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalTabState } from '../hooks/useTabState';

// Mock localStorage
const localStorageMock = (() => {
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
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Note: useTabState requires Next.js navigation hooks which are difficult to mock.
// We test useLocalTabState which provides similar functionality without Next.js dependencies.

describe('useLocalTabState', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with defaultTab when localStorage is empty', () => {
      const { result } = renderHook(() =>
        useLocalTabState({
          storageKey: 'test-tabs',
          defaultTab: 'overview',
        })
      );

      expect(result.current.activeTab).toBe('overview');
    });

    it('should load tab from localStorage on mount', () => {
      localStorageMock.getItem.mockReturnValueOnce('details');

      const { result } = renderHook(() =>
        useLocalTabState({
          storageKey: 'test-tabs',
          defaultTab: 'overview',
        })
      );

      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-tabs');
      expect(result.current.activeTab).toBe('details');
    });
  });

  describe('setActiveTab', () => {
    it('should update active tab', () => {
      const { result } = renderHook(() =>
        useLocalTabState({
          storageKey: 'test-tabs',
          defaultTab: 'overview',
        })
      );

      act(() => {
        result.current.setActiveTab('details');
      });

      expect(result.current.activeTab).toBe('details');
    });

    it('should persist to localStorage', () => {
      const { result } = renderHook(() =>
        useLocalTabState({
          storageKey: 'test-tabs',
          defaultTab: 'overview',
        })
      );

      act(() => {
        result.current.setActiveTab('settings');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('test-tabs', 'settings');
    });
  });

  describe('isActive', () => {
    it('should return true for active tab', () => {
      const { result } = renderHook(() =>
        useLocalTabState({
          storageKey: 'test-tabs',
          defaultTab: 'overview',
        })
      );

      expect(result.current.isActive('overview')).toBe(true);
    });

    it('should return false for inactive tab', () => {
      const { result } = renderHook(() =>
        useLocalTabState({
          storageKey: 'test-tabs',
          defaultTab: 'overview',
        })
      );

      expect(result.current.isActive('details')).toBe(false);
    });

    it('should update after tab change', () => {
      const { result } = renderHook(() =>
        useLocalTabState({
          storageKey: 'test-tabs',
          defaultTab: 'overview',
        })
      );

      act(() => {
        result.current.setActiveTab('details');
      });

      expect(result.current.isActive('overview')).toBe(false);
      expect(result.current.isActive('details')).toBe(true);
    });
  });

  describe('storage key isolation', () => {
    it('should use different storage keys for different instances', () => {
      const { result: result1 } = renderHook(() =>
        useLocalTabState({
          storageKey: 'page1-tabs',
          defaultTab: 'tab1',
        })
      );

      const { result: result2 } = renderHook(() =>
        useLocalTabState({
          storageKey: 'page2-tabs',
          defaultTab: 'tab2',
        })
      );

      act(() => {
        result1.current.setActiveTab('changed1');
      });

      act(() => {
        result2.current.setActiveTab('changed2');
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('page1-tabs', 'changed1');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('page2-tabs', 'changed2');
    });
  });

  describe('type safety', () => {
    it('should work with typed tab values', () => {
      type MyTabs = 'overview' | 'details' | 'settings';
      
      const { result } = renderHook(() =>
        useLocalTabState<MyTabs>({
          storageKey: 'typed-tabs',
          defaultTab: 'overview',
        })
      );

      act(() => {
        result.current.setActiveTab('details');
      });

      expect(result.current.activeTab).toBe('details');
      expect(result.current.isActive('details')).toBe(true);
    });
  });
});
