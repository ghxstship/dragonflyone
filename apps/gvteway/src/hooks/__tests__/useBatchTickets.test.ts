import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBatchTickets } from '../useBatchTickets';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('useBatchTickets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with loading false and no error', () => {
      const { result } = renderHook(() => useBatchTickets());

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should provide generateTickets function', () => {
      const { result } = renderHook(() => useBatchTickets());

      expect(typeof result.current.generateTickets).toBe('function');
    });
  });

  describe('generateTickets', () => {
    it('should set loading state during generation', async () => {
      mockFetch.mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          }), 100)
        )
      );

      const { result } = renderHook(() => useBatchTickets());

      act(() => {
        result.current.generateTickets({
          eventId: 'event-1',
          tickets: [{ ticketTypeId: 'vip', quantity: 10, price: 100 }],
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
        json: () => Promise.resolve({ success: true, ticketsGenerated: 50 }),
      });

      const { result } = renderHook(() => useBatchTickets());

      const ticketData = {
        eventId: 'event-123',
        tickets: [
          { ticketTypeId: 'vip', quantity: 20, price: 150, seatNumber: 'A1' },
          { ticketTypeId: 'general', quantity: 30, price: 50 },
        ],
      };

      await act(async () => {
        await result.current.generateTickets(ticketData);
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/batch/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      });
    });

    it('should return result on success', async () => {
      const mockResult = {
        success: true,
        ticketsGenerated: 100,
        ticketIds: ['t1', 't2', 't3'],
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });

      const { result } = renderHook(() => useBatchTickets());

      let returnValue;
      await act(async () => {
        returnValue = await result.current.generateTickets({
          eventId: 'event-1',
          tickets: [{ ticketTypeId: 'ga', quantity: 100, price: 25 }],
        });
      });

      expect(returnValue).toEqual(mockResult);
      expect(result.current.error).toBeNull();
    });

    it('should handle API error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'Event not found' }),
      });

      const { result } = renderHook(() => useBatchTickets());

      await expect(
        act(async () => {
          await result.current.generateTickets({
            eventId: 'invalid-event',
            tickets: [{ ticketTypeId: 'vip', quantity: 10, price: 100 }],
          });
        })
      ).rejects.toThrow('Event not found');

      expect(result.current.loading).toBe(false);
    });

    it('should use default error message when none provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({}),
      });

      const { result } = renderHook(() => useBatchTickets());

      await expect(
        act(async () => {
          await result.current.generateTickets({
            eventId: 'event-1',
            tickets: [],
          });
        })
      ).rejects.toThrow('Ticket generation failed');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useBatchTickets());

      await expect(
        act(async () => {
          await result.current.generateTickets({
            eventId: 'event-1',
            tickets: [{ ticketTypeId: 'ga', quantity: 50, price: 30 }],
          });
        })
      ).rejects.toThrow('Network error');

      expect(result.current.loading).toBe(false);
    });

    it('should clear error on new generation attempt', async () => {
      // First call fails
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'First error' }),
      });

      const { result } = renderHook(() => useBatchTickets());

      try {
        await act(async () => {
          await result.current.generateTickets({
            eventId: 'event-1',
            tickets: [],
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
        await result.current.generateTickets({
          eventId: 'event-1',
          tickets: [{ ticketTypeId: 'ga', quantity: 10, price: 25 }],
        });
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('multiple ticket types', () => {
    it('should handle multiple ticket types in one batch', async () => {
      const mockResult = {
        success: true,
        ticketsGenerated: 150,
        breakdown: {
          vip: 50,
          premium: 50,
          general: 50,
        },
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResult),
      });

      const { result } = renderHook(() => useBatchTickets());

      const ticketData = {
        eventId: 'concert-2025',
        tickets: [
          { ticketTypeId: 'vip', quantity: 50, price: 200, seatNumber: 'VIP-1' },
          { ticketTypeId: 'premium', quantity: 50, price: 100 },
          { ticketTypeId: 'general', quantity: 50, price: 50 },
        ],
      };

      let returnValue;
      await act(async () => {
        returnValue = await result.current.generateTickets(ticketData);
      });

      expect(returnValue).toEqual(mockResult);
      expect(mockFetch).toHaveBeenCalledWith('/api/batch/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      });
    });
  });

  describe('sequential generations', () => {
    it('should handle multiple sequential generations', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, event: 'event-1' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, event: 'event-2' }),
        });

      const { result } = renderHook(() => useBatchTickets());

      let result1, result2;
      await act(async () => {
        result1 = await result.current.generateTickets({
          eventId: 'event-1',
          tickets: [{ ticketTypeId: 'ga', quantity: 100, price: 25 }],
        });
      });

      await act(async () => {
        result2 = await result.current.generateTickets({
          eventId: 'event-2',
          tickets: [{ ticketTypeId: 'vip', quantity: 50, price: 150 }],
        });
      });

      expect(result1).toEqual({ success: true, event: 'event-1' });
      expect(result2).toEqual({ success: true, event: 'event-2' });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});
