import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBatchOperations } from '../useBatchOperations';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useBatchOperations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with loading false and no error', () => {
      const { result } = renderHook(() => useBatchOperations());

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should provide executeBatch function', () => {
      const { result } = renderHook(() => useBatchOperations());

      expect(typeof result.current.executeBatch).toBe('function');
    });
  });

  describe('executeBatch', () => {
    it('should set loading state during operation', async () => {
      mockFetch.mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          }), 100)
        )
      );

      const { result } = renderHook(() => useBatchOperations());

      act(() => {
        result.current.executeBatch({
          operation: 'create',
          table: 'productions',
          data: [{ name: 'Test' }],
        });
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should call API with create operation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, created: 2 }),
      });

      const { result } = renderHook(() => useBatchOperations());

      const operation = {
        operation: 'create' as const,
        table: 'productions',
        data: [
          { name: 'Production 1', status: 'draft' },
          { name: 'Production 2', status: 'active' },
        ],
      };

      await act(async () => {
        await result.current.executeBatch(operation);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(operation),
      });
    });

    it('should call API with update operation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, updated: 3 }),
      });

      const { result } = renderHook(() => useBatchOperations());

      const operation = {
        operation: 'update' as const,
        table: 'contacts',
        data: [
          { id: '1', status: 'active' },
          { id: '2', status: 'active' },
          { id: '3', status: 'inactive' },
        ],
      };

      await act(async () => {
        await result.current.executeBatch(operation);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(operation),
      });
    });

    it('should call API with delete operation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, deleted: 2 }),
      });

      const { result } = renderHook(() => useBatchOperations());

      const operation = {
        operation: 'delete' as const,
        table: 'tasks',
        data: [{ id: '1' }, { id: '2' }],
      };

      await act(async () => {
        await result.current.executeBatch(operation);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(operation),
      });
    });

    it('should return result on success', async () => {
      const mockResult = { success: true, created: 5, ids: ['1', '2', '3', '4', '5'] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });

      const { result } = renderHook(() => useBatchOperations());

      let returnValue;
      await act(async () => {
        returnValue = await result.current.executeBatch({
          operation: 'create',
          table: 'tasks',
          data: [{ name: 'Task 1' }],
        });
      });

      expect(returnValue).toEqual(mockResult);
      expect(result.current.error).toBeNull();
    });

    it('should handle API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Table not found' }),
      });

      const { result } = renderHook(() => useBatchOperations());

      await expect(
        act(async () => {
          await result.current.executeBatch({
            operation: 'create',
            table: 'invalid_table',
            data: [{ name: 'Test' }],
          });
        })
      ).rejects.toThrow('Table not found');

      expect(result.current.loading).toBe(false);
    });

    it('should use default error message when none provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({}),
      });

      const { result } = renderHook(() => useBatchOperations());

      await expect(
        act(async () => {
          await result.current.executeBatch({
            operation: 'update',
            table: 'productions',
            data: [],
          });
        })
      ).rejects.toThrow('Batch operation failed');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useBatchOperations());

      await expect(
        act(async () => {
          await result.current.executeBatch({
            operation: 'delete',
            table: 'contacts',
            data: [{ id: '1' }],
          });
        })
      ).rejects.toThrow('Network error');

      expect(result.current.loading).toBe(false);
    });

    it('should clear error on new operation', async () => {
      // First call fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'First error' }),
      });

      const { result } = renderHook(() => useBatchOperations());

      try {
        await act(async () => {
          await result.current.executeBatch({
            operation: 'create',
            table: 'test',
            data: [],
          });
        });
      } catch {
        // Expected
      }

      // Second call succeeds
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await act(async () => {
        await result.current.executeBatch({
          operation: 'create',
          table: 'test',
          data: [{ name: 'Test' }],
        });
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('multiple operations', () => {
    it('should handle sequential operations', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, operation: 'create' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, operation: 'update' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, operation: 'delete' }),
        });

      const { result } = renderHook(() => useBatchOperations());

      let result1, result2, result3;
      await act(async () => {
        result1 = await result.current.executeBatch({
          operation: 'create',
          table: 'tasks',
          data: [{ name: 'Task' }],
        });
      });

      await act(async () => {
        result2 = await result.current.executeBatch({
          operation: 'update',
          table: 'tasks',
          data: [{ id: '1', status: 'done' }],
        });
      });

      await act(async () => {
        result3 = await result.current.executeBatch({
          operation: 'delete',
          table: 'tasks',
          data: [{ id: '1' }],
        });
      });

      expect(result1).toEqual({ success: true, operation: 'create' });
      expect(result2).toEqual({ success: true, operation: 'update' });
      expect(result3).toEqual({ success: true, operation: 'delete' });
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });
  });
});
