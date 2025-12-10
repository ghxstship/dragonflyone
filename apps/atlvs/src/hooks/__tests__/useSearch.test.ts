import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSearch } from '../useSearch';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with null results', () => {
      const { result } = renderHook(() => useSearch());

      expect(result.current.results).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('search', () => {
    it('should set loading state during search', async () => {
      mockFetch.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: () => Promise.resolve({ query: 'test', totalResults: 0, results: {} }),
        }), 100))
      );

      const { result } = renderHook(() => useSearch());

      act(() => {
        result.current.search('test');
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should return search results', async () => {
      const mockResults = {
        query: 'test',
        totalResults: 2,
        results: {
          productions: [{ id: '1', name: 'Test Production' }],
          contacts: [{ id: '2', name: 'Test Contact' }],
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResults),
      });

      const { result } = renderHook(() => useSearch());

      await act(async () => {
        await result.current.search('test');
      });

      expect(result.current.results).toEqual(mockResults);
      expect(result.current.error).toBeNull();
    });

    it('should handle empty query', async () => {
      const { result } = renderHook(() => useSearch());

      await act(async () => {
        await result.current.search('');
      });

      expect(result.current.results).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should handle whitespace-only query', async () => {
      const { result } = renderHook(() => useSearch());

      await act(async () => {
        await result.current.search('   ');
      });

      expect(result.current.results).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should build correct URL with query parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ query: 'test', totalResults: 0, results: {} }),
      });

      const { result } = renderHook(() => useSearch());

      await act(async () => {
        await result.current.search('test query');
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/search?q=test+query');
    });

    it('should include tables parameter when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ query: 'test', totalResults: 0, results: {} }),
      });

      const { result } = renderHook(() => useSearch());

      await act(async () => {
        await result.current.search('test', ['productions', 'contacts']);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('tables=productions%2Ccontacts')
      );
    });

    it('should include limit parameter when provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ query: 'test', totalResults: 0, results: {} }),
      });

      const { result } = renderHook(() => useSearch());

      await act(async () => {
        await result.current.search('test', undefined, 10);
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10')
      );
    });
  });

  describe('error handling', () => {
    it('should throw on API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Search service unavailable' }),
      });

      const { result } = renderHook(() => useSearch());

      await expect(
        act(async () => {
          await result.current.search('test');
        })
      ).rejects.toThrow('Search service unavailable');
    });

    it('should throw default error message when no error provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({}),
      });

      const { result } = renderHook(() => useSearch());

      await expect(
        act(async () => {
          await result.current.search('test');
        })
      ).rejects.toThrow('Search failed');
    });

    it('should throw on network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useSearch());

      await expect(
        act(async () => {
          await result.current.search('test');
        })
      ).rejects.toThrow('Network error');
    });

    it('should set loading to false after error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Error' }),
      });

      const { result } = renderHook(() => useSearch());

      try {
        await act(async () => {
          await result.current.search('test');
        });
      } catch {
        // Expected
      }

      expect(result.current.loading).toBe(false);
    });
  });

  describe('clearResults', () => {
    it('should clear results and error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ query: 'test', totalResults: 1, results: { items: [] } }),
      });

      const { result } = renderHook(() => useSearch());

      await act(async () => {
        await result.current.search('test');
      });

      expect(result.current.results).not.toBeNull();

      act(() => {
        result.current.clearResults();
      });

      expect(result.current.results).toBeNull();
      expect(result.current.error).toBeNull();
    });

  });

  describe('multiple searches', () => {
    it('should update results on subsequent searches', async () => {
      const firstResults = { query: 'first', totalResults: 1, results: { items: [{ id: '1' }] } };
      const secondResults = { query: 'second', totalResults: 2, results: { items: [{ id: '2' }, { id: '3' }] } };

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(firstResults),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(secondResults),
        });

      const { result } = renderHook(() => useSearch());

      await act(async () => {
        await result.current.search('first');
      });

      expect(result.current.results).toEqual(firstResults);

      await act(async () => {
        await result.current.search('second');
      });

      expect(result.current.results).toEqual(secondResults);
    });
  });
});
