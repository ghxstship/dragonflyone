import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEventFilters, type Event } from '../useEventFilters';

describe('useEventFilters', () => {
  const mockEvents: Event[] = [
    { id: '1', title: 'Rock Concert', category: 'music', status: 'upcoming', date: '2025-01-15', price: 50, venue: 'Madison Square Garden' },
    { id: '2', title: 'Jazz Night', category: 'music', status: 'upcoming', date: '2025-01-20', price: 30, venue: 'Blue Note' },
    { id: '3', title: 'Comedy Show', category: 'comedy', status: 'upcoming', date: '2025-01-10', price: 25, venue: 'Comedy Cellar' },
    { id: '4', title: 'Art Exhibition', category: 'art', status: 'ongoing', date: '2025-01-01', price: 15, venue: 'MoMA' },
    { id: '5', title: 'Tech Conference', category: 'tech', status: 'sold_out', date: '2025-02-01', price: 200, venue: 'Javits Center' },
  ];

  describe('initialization', () => {
    it('should return all events with default filters', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      expect(result.current.filteredEvents).toHaveLength(5);
      expect(result.current.totalResults).toBe(5);
    });

    it('should have default filter values', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      expect(result.current.filters.category).toBe('all');
      expect(result.current.filters.status).toBe('all');
      expect(result.current.filters.minPrice).toBe(0);
      expect(result.current.filters.maxPrice).toBe(Infinity);
      expect(result.current.filters.searchQuery).toBe('');
      expect(result.current.filters.sortBy).toBe('date');
      expect(result.current.filters.sortOrder).toBe('asc');
    });
  });

  describe('category filtering', () => {
    it('should filter by category', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.updateFilter('category', 'music');
      });

      expect(result.current.filteredEvents).toHaveLength(2);
      expect(result.current.filteredEvents.every(e => e.category === 'music')).toBe(true);
    });

    it('should show all categories when set to "all"', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.updateFilter('category', 'music');
      });

      act(() => {
        result.current.updateFilter('category', 'all');
      });

      expect(result.current.filteredEvents).toHaveLength(5);
    });
  });

  describe('status filtering', () => {
    it('should filter by status', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.updateFilter('status', 'upcoming');
      });

      expect(result.current.filteredEvents).toHaveLength(3);
      expect(result.current.filteredEvents.every(e => e.status === 'upcoming')).toBe(true);
    });

    it('should filter sold out events', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.updateFilter('status', 'sold_out');
      });

      expect(result.current.filteredEvents).toHaveLength(1);
      expect(result.current.filteredEvents[0].title).toBe('Tech Conference');
    });
  });

  describe('price filtering', () => {
    it('should filter by minimum price', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.updateFilter('minPrice', 30);
      });

      expect(result.current.filteredEvents.every(e => e.price >= 30)).toBe(true);
    });

    it('should filter by maximum price', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.updateFilter('maxPrice', 50);
      });

      expect(result.current.filteredEvents.every(e => e.price <= 50)).toBe(true);
    });

    it('should filter by price range', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.updateFilter('minPrice', 20);
        result.current.updateFilter('maxPrice', 60);
      });

      expect(result.current.filteredEvents.every(e => e.price >= 20 && e.price <= 60)).toBe(true);
    });
  });

  describe('search filtering', () => {
    it('should filter by title search', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.updateFilter('searchQuery', 'rock');
      });

      expect(result.current.filteredEvents).toHaveLength(1);
      expect(result.current.filteredEvents[0].title).toBe('Rock Concert');
    });

    it('should filter by venue search', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.updateFilter('searchQuery', 'moma');
      });

      expect(result.current.filteredEvents).toHaveLength(1);
      expect(result.current.filteredEvents[0].venue).toBe('MoMA');
    });

    it('should be case insensitive', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.updateFilter('searchQuery', 'JAZZ');
      });

      expect(result.current.filteredEvents).toHaveLength(1);
      expect(result.current.filteredEvents[0].title).toBe('Jazz Night');
    });
  });

  describe('sorting', () => {
    it('should sort by date ascending (default)', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      const dates = result.current.filteredEvents.map(e => new Date(e.date).getTime());
      expect(dates).toEqual([...dates].sort((a, b) => a - b));
    });

    it('should sort by date descending', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.updateFilter('sortOrder', 'desc');
      });

      const dates = result.current.filteredEvents.map(e => new Date(e.date).getTime());
      expect(dates).toEqual([...dates].sort((a, b) => b - a));
    });

    it('should sort by price ascending', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.updateFilter('sortBy', 'price');
      });

      const prices = result.current.filteredEvents.map(e => e.price);
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    it('should sort by price descending', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.updateFilter('sortBy', 'price');
        result.current.updateFilter('sortOrder', 'desc');
      });

      const prices = result.current.filteredEvents.map(e => e.price);
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });

    it('should sort by title ascending', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.updateFilter('sortBy', 'title');
      });

      const titles = result.current.filteredEvents.map(e => e.title);
      expect(titles).toEqual([...titles].sort());
    });
  });

  describe('combined filters', () => {
    it('should apply multiple filters together', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.updateFilter('category', 'music');
        result.current.updateFilter('minPrice', 40);
      });

      expect(result.current.filteredEvents).toHaveLength(1);
      expect(result.current.filteredEvents[0].title).toBe('Rock Concert');
    });
  });

  describe('resetFilters', () => {
    it('should reset all filters to defaults', () => {
      const { result } = renderHook(() => useEventFilters(mockEvents));

      act(() => {
        result.current.updateFilter('category', 'music');
        result.current.updateFilter('status', 'upcoming');
        result.current.updateFilter('minPrice', 50);
        result.current.updateFilter('searchQuery', 'test');
      });

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters.category).toBe('all');
      expect(result.current.filters.status).toBe('all');
      expect(result.current.filters.minPrice).toBe(0);
      expect(result.current.filters.searchQuery).toBe('');
      expect(result.current.filteredEvents).toHaveLength(5);
    });
  });

  describe('empty events', () => {
    it('should handle empty events array', () => {
      const { result } = renderHook(() => useEventFilters([]));

      expect(result.current.filteredEvents).toHaveLength(0);
      expect(result.current.totalResults).toBe(0);
    });
  });
});
