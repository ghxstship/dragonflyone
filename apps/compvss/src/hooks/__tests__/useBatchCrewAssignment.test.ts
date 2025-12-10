import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBatchCrewAssignment } from '../useBatchCrewAssignment';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useBatchCrewAssignment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with loading false and no error', () => {
      const { result } = renderHook(() => useBatchCrewAssignment());

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should provide assignCrew function', () => {
      const { result } = renderHook(() => useBatchCrewAssignment());

      expect(typeof result.current.assignCrew).toBe('function');
    });
  });

  describe('assignCrew', () => {
    it('should set loading state during assignment', async () => {
      mockFetch.mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          }), 100)
        )
      );

      const { result } = renderHook(() => useBatchCrewAssignment());

      act(() => {
        result.current.assignCrew({
          projectId: 'proj-1',
          crewMembers: [{ userId: 'user-1', role: 'Stagehand' }],
        });
      });

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should call API with correct data', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true, assignedCount: 2 }),
      });

      const { result } = renderHook(() => useBatchCrewAssignment());

      const assignmentData = {
        projectId: 'proj-123',
        crewMembers: [
          { userId: 'user-1', role: 'Stagehand', callTime: '08:00', rate: 25 },
          { userId: 'user-2', role: 'Rigger', callTime: '07:00', rate: 35 },
        ],
      };

      await act(async () => {
        await result.current.assignCrew(assignmentData);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignmentData),
      });
    });

    it('should return result on success', async () => {
      const mockResult = { success: true, assignedCount: 3, assignments: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });

      const { result } = renderHook(() => useBatchCrewAssignment());

      let returnValue;
      await act(async () => {
        returnValue = await result.current.assignCrew({
          projectId: 'proj-1',
          crewMembers: [{ userId: 'user-1', role: 'Stagehand' }],
        });
      });

      expect(returnValue).toEqual(mockResult);
      expect(result.current.error).toBeNull();
    });

    it('should handle API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Project not found' }),
      });

      const { result } = renderHook(() => useBatchCrewAssignment());

      await expect(
        act(async () => {
          await result.current.assignCrew({
            projectId: 'invalid-proj',
            crewMembers: [{ userId: 'user-1', role: 'Stagehand' }],
          });
        })
      ).rejects.toThrow('Project not found');

      expect(result.current.loading).toBe(false);
    });

    it('should use default error message when none provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({}),
      });

      const { result } = renderHook(() => useBatchCrewAssignment());

      await expect(
        act(async () => {
          await result.current.assignCrew({
            projectId: 'proj-1',
            crewMembers: [],
          });
        })
      ).rejects.toThrow('Crew assignment failed');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useBatchCrewAssignment());

      await expect(
        act(async () => {
          await result.current.assignCrew({
            projectId: 'proj-1',
            crewMembers: [{ userId: 'user-1', role: 'Stagehand' }],
          });
        })
      ).rejects.toThrow('Network error');

      expect(result.current.loading).toBe(false);
    });

    it('should clear error on new assignment attempt', async () => {
      // First call fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'First error' }),
      });

      const { result } = renderHook(() => useBatchCrewAssignment());

      try {
        await act(async () => {
          await result.current.assignCrew({
            projectId: 'proj-1',
            crewMembers: [],
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
        await result.current.assignCrew({
          projectId: 'proj-1',
          crewMembers: [{ userId: 'user-1', role: 'Stagehand' }],
        });
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('multiple assignments', () => {
    it('should handle sequential assignments', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, batch: 1 }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, batch: 2 }),
        });

      const { result } = renderHook(() => useBatchCrewAssignment());

      let result1, result2;
      await act(async () => {
        result1 = await result.current.assignCrew({
          projectId: 'proj-1',
          crewMembers: [{ userId: 'user-1', role: 'Stagehand' }],
        });
      });

      await act(async () => {
        result2 = await result.current.assignCrew({
          projectId: 'proj-2',
          crewMembers: [{ userId: 'user-2', role: 'Rigger' }],
        });
      });

      expect(result1).toEqual({ success: true, batch: 1 });
      expect(result2).toEqual({ success: true, batch: 2 });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
