import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFavorites, type FavoriteItem } from '../hooks/useFavorites';

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

describe('useFavorites', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with empty favorites when localStorage is empty', () => {
      const { result } = renderHook(() =>
        useFavorites({ storageKey: 'test' })
      );

      expect(result.current.favorites).toEqual([]);
    });

    it('should load favorites from localStorage on mount', () => {
      const storedFavorites: FavoriteItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Projects', href: '/projects' },
      ];
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(storedFavorites));

      const { result } = renderHook(() =>
        useFavorites({ storageKey: 'test' })
      );

      expect(localStorageMock.getItem).toHaveBeenCalledWith('test-favorites');
      expect(result.current.favorites).toEqual(storedFavorites);
    });

    it('should handle invalid JSON in localStorage gracefully', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid-json');

      const { result } = renderHook(() =>
        useFavorites({ storageKey: 'test' })
      );

      expect(result.current.favorites).toEqual([]);
    });
  });

  describe('addFavorite', () => {
    it('should add a favorite item', () => {
      const { result } = renderHook(() =>
        useFavorites({ storageKey: 'test' })
      );

      act(() => {
        result.current.addFavorite({ label: 'Dashboard', href: '/dashboard' });
      });

      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.favorites[0].label).toBe('Dashboard');
      expect(result.current.favorites[0].href).toBe('/dashboard');
      expect(result.current.favorites[0].addedAt).toBeDefined();
    });

    it('should not add duplicate favorites', () => {
      const { result } = renderHook(() =>
        useFavorites({ storageKey: 'test' })
      );

      act(() => {
        result.current.addFavorite({ label: 'Dashboard', href: '/dashboard' });
        result.current.addFavorite({ label: 'Dashboard Copy', href: '/dashboard' });
      });

      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.favorites[0].label).toBe('Dashboard');
    });

    it('should add new favorites at the beginning', () => {
      const { result } = renderHook(() =>
        useFavorites({ storageKey: 'test' })
      );

      act(() => {
        result.current.addFavorite({ label: 'First', href: '/first' });
        result.current.addFavorite({ label: 'Second', href: '/second' });
      });

      expect(result.current.favorites[0].label).toBe('Second');
      expect(result.current.favorites[1].label).toBe('First');
    });

    it('should respect maxFavorites limit', () => {
      const { result } = renderHook(() =>
        useFavorites({ storageKey: 'test', maxFavorites: 2 })
      );

      act(() => {
        result.current.addFavorite({ label: 'First', href: '/first' });
        result.current.addFavorite({ label: 'Second', href: '/second' });
        result.current.addFavorite({ label: 'Third', href: '/third' });
      });

      expect(result.current.favorites).toHaveLength(2);
      expect(result.current.favorites[0].label).toBe('Third');
      expect(result.current.favorites[1].label).toBe('Second');
    });

    it('should persist to localStorage', () => {
      const { result } = renderHook(() =>
        useFavorites({ storageKey: 'test' })
      );

      act(() => {
        result.current.addFavorite({ label: 'Dashboard', href: '/dashboard' });
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'test-favorites',
        expect.stringContaining('/dashboard')
      );
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite by href', () => {
      const { result } = renderHook(() =>
        useFavorites({ storageKey: 'test' })
      );

      act(() => {
        result.current.addFavorite({ label: 'Dashboard', href: '/dashboard' });
        result.current.addFavorite({ label: 'Projects', href: '/projects' });
      });

      act(() => {
        result.current.removeFavorite('/dashboard');
      });

      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.favorites[0].href).toBe('/projects');
    });

    it('should do nothing if href not found', () => {
      const { result } = renderHook(() =>
        useFavorites({ storageKey: 'test' })
      );

      act(() => {
        result.current.addFavorite({ label: 'Dashboard', href: '/dashboard' });
      });

      act(() => {
        result.current.removeFavorite('/nonexistent');
      });

      expect(result.current.favorites).toHaveLength(1);
    });
  });

  describe('toggleFavorite', () => {
    it('should add item if not in favorites', () => {
      const { result } = renderHook(() =>
        useFavorites({ storageKey: 'test' })
      );

      act(() => {
        result.current.toggleFavorite({ label: 'Dashboard', href: '/dashboard' });
      });

      expect(result.current.favorites).toHaveLength(1);
      expect(result.current.isFavorite('/dashboard')).toBe(true);
    });

    it('should remove item if already in favorites', () => {
      const { result } = renderHook(() =>
        useFavorites({ storageKey: 'test' })
      );

      act(() => {
        result.current.addFavorite({ label: 'Dashboard', href: '/dashboard' });
      });

      act(() => {
        result.current.toggleFavorite({ label: 'Dashboard', href: '/dashboard' });
      });

      expect(result.current.favorites).toHaveLength(0);
      expect(result.current.isFavorite('/dashboard')).toBe(false);
    });
  });

  describe('isFavorite', () => {
    it('should return true for favorited items', () => {
      const { result } = renderHook(() =>
        useFavorites({ storageKey: 'test' })
      );

      act(() => {
        result.current.addFavorite({ label: 'Dashboard', href: '/dashboard' });
      });

      expect(result.current.isFavorite('/dashboard')).toBe(true);
    });

    it('should return false for non-favorited items', () => {
      const { result } = renderHook(() =>
        useFavorites({ storageKey: 'test' })
      );

      expect(result.current.isFavorite('/dashboard')).toBe(false);
    });
  });

  describe('reorderFavorites', () => {
    it('should reorder favorites correctly', () => {
      const { result } = renderHook(() =>
        useFavorites({ storageKey: 'test' })
      );

      act(() => {
        result.current.addFavorite({ label: 'First', href: '/first' });
        result.current.addFavorite({ label: 'Second', href: '/second' });
        result.current.addFavorite({ label: 'Third', href: '/third' });
      });

      // Order is: Third, Second, First (newest first)
      act(() => {
        result.current.reorderFavorites(0, 2); // Move Third to end
      });

      expect(result.current.favorites[0].label).toBe('Second');
      expect(result.current.favorites[1].label).toBe('First');
      expect(result.current.favorites[2].label).toBe('Third');
    });

    it('should handle invalid indices gracefully', () => {
      const { result } = renderHook(() =>
        useFavorites({ storageKey: 'test' })
      );

      act(() => {
        result.current.addFavorite({ label: 'First', href: '/first' });
      });

      act(() => {
        result.current.reorderFavorites(-1, 0);
        result.current.reorderFavorites(0, 10);
      });

      expect(result.current.favorites).toHaveLength(1);
    });
  });

  describe('clearFavorites', () => {
    it('should clear all favorites', () => {
      const { result } = renderHook(() =>
        useFavorites({ storageKey: 'test' })
      );

      act(() => {
        result.current.addFavorite({ label: 'Dashboard', href: '/dashboard' });
        result.current.addFavorite({ label: 'Projects', href: '/projects' });
      });

      act(() => {
        result.current.clearFavorites();
      });

      expect(result.current.favorites).toHaveLength(0);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('test-favorites');
    });
  });

  describe('storage key isolation', () => {
    it('should use different storage keys for different apps', () => {
      const { result: atlvsResult } = renderHook(() =>
        useFavorites({ storageKey: 'atlvs' })
      );
      const { result: compvssResult } = renderHook(() =>
        useFavorites({ storageKey: 'compvss' })
      );

      act(() => {
        atlvsResult.current.addFavorite({ label: 'ATLVS Page', href: '/atlvs' });
      });

      act(() => {
        compvssResult.current.addFavorite({ label: 'COMPVSS Page', href: '/compvss' });
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'atlvs-favorites',
        expect.any(String)
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'compvss-favorites',
        expect.any(String)
      );
    });
  });
});
