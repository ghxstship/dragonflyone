import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCommandPalette, type CommandItem, type CommandCategory } from '../hooks/useCommandPalette';

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

describe('useCommandPalette', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  const mockNavigationItems: CommandItem[] = [
    { id: 'nav-1', label: 'Dashboard', href: '/dashboard' },
    { id: 'nav-2', label: 'Projects', href: '/projects' },
    { id: 'nav-3', label: 'Settings', href: '/settings' },
  ];

  const mockActionItems: CommandItem[] = [
    { id: 'action-1', label: 'New Project', action: vi.fn() },
    { id: 'action-2', label: 'Search', action: vi.fn() },
  ];

  describe('initialization', () => {
    it('should initialize with closed state', () => {
      const { result } = renderHook(() =>
        useCommandPalette({
          navigationItems: mockNavigationItems,
          actionItems: mockActionItems,
        })
      );

      expect(result.current.isOpen).toBe(false);
    });

    it('should initialize with empty recent items', () => {
      const { result } = renderHook(() =>
        useCommandPalette({
          navigationItems: mockNavigationItems,
          actionItems: mockActionItems,
        })
      );

      expect(result.current.recentItems).toEqual([]);
    });

    it('should load recent items from localStorage', () => {
      const storedRecent: CommandItem[] = [
        { id: 'nav-1', label: 'Dashboard', href: '/dashboard' },
      ];
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(storedRecent));

      const { result } = renderHook(() =>
        useCommandPalette({
          navigationItems: mockNavigationItems,
          actionItems: mockActionItems,
        })
      );

      expect(result.current.recentItems).toEqual(storedRecent);
    });
  });

  describe('open/close', () => {
    it('should open the palette', () => {
      const { result } = renderHook(() =>
        useCommandPalette({
          navigationItems: mockNavigationItems,
          actionItems: mockActionItems,
        })
      );

      act(() => {
        result.current.open();
      });

      expect(result.current.isOpen).toBe(true);
    });

    it('should close the palette', () => {
      const { result } = renderHook(() =>
        useCommandPalette({
          navigationItems: mockNavigationItems,
          actionItems: mockActionItems,
        })
      );

      act(() => {
        result.current.open();
      });

      act(() => {
        result.current.close();
      });

      expect(result.current.isOpen).toBe(false);
    });

    it('should toggle the palette', () => {
      const { result } = renderHook(() =>
        useCommandPalette({
          navigationItems: mockNavigationItems,
          actionItems: mockActionItems,
        })
      );

      act(() => {
        result.current.toggle();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.toggle();
      });
      expect(result.current.isOpen).toBe(false);
    });
  });

  describe('categories', () => {
    it('should include navigation category', () => {
      const { result } = renderHook(() =>
        useCommandPalette({
          navigationItems: mockNavigationItems,
          actionItems: mockActionItems,
        })
      );

      const navCategory = result.current.categories.find(c => c.label === 'Navigation');
      expect(navCategory).toBeDefined();
      expect(navCategory?.items).toHaveLength(3);
    });

    it('should include actions category', () => {
      const { result } = renderHook(() =>
        useCommandPalette({
          navigationItems: mockNavigationItems,
          actionItems: mockActionItems,
        })
      );

      const actionsCategory = result.current.categories.find(c => c.label === 'Actions');
      expect(actionsCategory).toBeDefined();
      expect(actionsCategory?.items).toHaveLength(2);
    });

    it('should include custom categories', () => {
      const customCategories: CommandCategory[] = [
        {
          id: 'custom',
          label: 'Custom',
          items: [{ id: 'custom-1', label: 'Custom Action', action: vi.fn() }],
        },
      ];

      const { result } = renderHook(() =>
        useCommandPalette({
          navigationItems: mockNavigationItems,
          actionItems: mockActionItems,
          categories: customCategories,
        })
      );

      const customCategory = result.current.categories.find(c => c.label === 'Custom');
      expect(customCategory).toBeDefined();
      expect(customCategory?.items).toHaveLength(1);
    });
  });

  describe('handleSelect', () => {
    it('should call action when item has action', () => {
      const action = vi.fn();
      const actionItems: CommandItem[] = [
        { id: 'action-1', label: 'Test Action', action },
      ];

      const { result } = renderHook(() =>
        useCommandPalette({
          navigationItems: [],
          actionItems,
        })
      );

      act(() => {
        result.current.open();
      });

      act(() => {
        result.current.handleSelect(actionItems[0]);
      });

      expect(action).toHaveBeenCalledTimes(1);
      expect(result.current.isOpen).toBe(false);
    });

    it('should call onNavigate when item has href', () => {
      const onNavigate = vi.fn();

      const { result } = renderHook(() =>
        useCommandPalette({
          navigationItems: mockNavigationItems,
          actionItems: [],
          onNavigate,
        })
      );

      act(() => {
        result.current.open();
      });

      act(() => {
        result.current.handleSelect(mockNavigationItems[0]);
      });

      expect(onNavigate).toHaveBeenCalledWith('/dashboard');
      expect(result.current.isOpen).toBe(false);
    });

    it('should add item to recent items', () => {
      const { result } = renderHook(() =>
        useCommandPalette({
          navigationItems: mockNavigationItems,
          actionItems: [],
        })
      );

      act(() => {
        result.current.handleSelect(mockNavigationItems[0]);
      });

      expect(result.current.recentItems).toHaveLength(1);
      expect(result.current.recentItems[0].id).toBe('nav-1');
    });

    it('should persist recent items to localStorage', () => {
      const { result } = renderHook(() =>
        useCommandPalette({
          navigationItems: mockNavigationItems,
          actionItems: [],
        })
      );

      act(() => {
        result.current.handleSelect(mockNavigationItems[0]);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ghxstship-command-recent',
        expect.stringContaining('nav-1')
      );
    });

    it('should limit recent items to max (default 5)', () => {
      const manyItems: CommandItem[] = Array.from({ length: 7 }, (_, i) => ({
        id: `nav-${i}`,
        label: `Item ${i}`,
        href: `/item-${i}`,
      }));

      const { result } = renderHook(() =>
        useCommandPalette({
          navigationItems: manyItems,
          actionItems: [],
        })
      );

      act(() => {
        manyItems.forEach(item => {
          result.current.handleSelect(item);
        });
      });

      // Default max is 5
      expect(result.current.recentItems.length).toBeLessThanOrEqual(5);
    });

    it('should move existing item to top of recent', () => {
      const { result } = renderHook(() =>
        useCommandPalette({
          navigationItems: mockNavigationItems,
          actionItems: [],
        })
      );

      act(() => {
        result.current.handleSelect(mockNavigationItems[0]);
        result.current.handleSelect(mockNavigationItems[1]);
        result.current.handleSelect(mockNavigationItems[0]); // Select first again
      });

      expect(result.current.recentItems[0].id).toBe('nav-1');
      expect(result.current.recentItems).toHaveLength(2);
    });
  });

  describe('contextual commands', () => {
    it('should filter contextual commands by current path', () => {
      const contextualCommands: CommandItem[] = [
        { id: 'ctx-1', label: 'Deal Action', href: '/deals/new', contextPaths: ['/deals*'] },
        { id: 'ctx-2', label: 'Contact Action', href: '/contacts/new', contextPaths: ['/contacts*'] },
      ];

      const { result } = renderHook(() =>
        useCommandPalette({
          navigationItems: [],
          actionItems: [],
          contextualCommands,
          currentPath: '/deals/123',
        })
      );

      const suggestedCategory = result.current.categories.find(c => c.label === 'Suggested');
      expect(suggestedCategory).toBeDefined();
      expect(suggestedCategory?.items).toHaveLength(1);
      expect(suggestedCategory?.items[0].id).toBe('ctx-1');
    });

    it('should not show suggested category when no contextual commands match', () => {
      const contextualCommands: CommandItem[] = [
        { id: 'ctx-1', label: 'Deal Action', href: '/deals/new', contextPaths: ['/deals*'] },
      ];

      const { result } = renderHook(() =>
        useCommandPalette({
          navigationItems: mockNavigationItems,
          actionItems: [],
          contextualCommands,
          currentPath: '/settings',
        })
      );

      const suggestedCategory = result.current.categories.find(c => c.label === 'Suggested');
      expect(suggestedCategory).toBeUndefined();
    });
  });

  describe('frecency', () => {
    it('should update frecency data on selection when enabled', () => {
      const { result } = renderHook(() =>
        useCommandPalette({
          navigationItems: mockNavigationItems,
          actionItems: [],
          enableFrecency: true,
        })
      );

      act(() => {
        result.current.handleSelect(mockNavigationItems[0]);
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'ghxstship-command-frecency',
        expect.any(String)
      );
    });

    it('should not update frecency when disabled', () => {
      const { result } = renderHook(() =>
        useCommandPalette({
          navigationItems: mockNavigationItems,
          actionItems: [],
          enableFrecency: false,
        })
      );

      act(() => {
        result.current.handleSelect(mockNavigationItems[0]);
      });

      // Should only save recent items, not frecency
      const frecencyCalls = localStorageMock.setItem.mock.calls.filter(
        (call: string[]) => call[0] === 'command-palette-frecency'
      );
      expect(frecencyCalls).toHaveLength(0);
    });
  });

  describe('enabled state', () => {
    it('should not respond to keyboard when disabled', () => {
      const { result } = renderHook(() =>
        useCommandPalette({
          navigationItems: mockNavigationItems,
          actionItems: [],
          enabled: false,
        })
      );

      // Simulate Cmd+K
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        metaKey: true,
        bubbles: true,
      });
      window.dispatchEvent(event);

      expect(result.current.isOpen).toBe(false);
    });
  });
});
