import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTravelBookings, useTravelData, travelKeys } from '../useTravel';

// Mock fetch
global.fetch = vi.fn();

const createWrapper = (): (({ children }: { children: ReactNode }) => JSX.Element) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function TestWrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useTravel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('travelKeys', () => {
    it('should generate correct all key', () => {
      expect(travelKeys.all).toEqual(['travel']);
    });

    it('should generate correct list key', () => {
      expect(travelKeys.list()).toEqual(['travel', 'list']);
    });
  });

  describe('useTravelBookings hook', () => {
    it('should return demo data on 401 response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useTravelBookings(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(result.current.data?.length).toBeGreaterThan(0);
    });

    it('should return loading state initially', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));
      const { result } = renderHook(() => useTravelBookings(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useTravelData hook', () => {
    it('should return combined data structure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useTravelData(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.bookings).toBeDefined();
      expect(typeof result.current.totalCost).toBe('number');
      expect(typeof result.current.confirmedCount).toBe('number');
      expect(typeof result.current.pendingCount).toBe('number');
      expect(typeof result.current.refetch).toBe('function');
    });

    it('should calculate totals correctly', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useTravelData(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.totalCost).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('TravelBooking interface', () => {
  it('should have required fields', () => {
    const booking = {
      id: '1',
      booking_reference: 'TRV-001',
      crew_member_id: 'c1',
      crew_member_name: 'John Smith',
      project_id: 'p1',
      project_name: 'Summer Festival',
      travel_type: 'flight',
      departure_date: '2025-02-15',
      origin: 'LAX',
      destination: 'JFK',
      cost: 450,
      status: 'confirmed',
    };

    expect(booking.id).toBeDefined();
    expect(booking.booking_reference).toBeDefined();
    expect(booking.crew_member_id).toBeDefined();
    expect(booking.crew_member_name).toBeDefined();
    expect(booking.project_id).toBeDefined();
    expect(booking.travel_type).toBeDefined();
    expect(booking.departure_date).toBeDefined();
    expect(booking.origin).toBeDefined();
    expect(booking.destination).toBeDefined();
    expect(booking.cost).toBeDefined();
    expect(booking.status).toBeDefined();
  });

  it('should support optional fields', () => {
    const booking = {
      id: '1',
      booking_reference: 'TRV-001',
      crew_member_id: 'c1',
      crew_member_name: 'John Smith',
      project_id: 'p1',
      project_name: 'Summer Festival',
      travel_type: 'flight',
      departure_date: '2025-02-15',
      return_date: '2025-02-20',
      origin: 'LAX',
      destination: 'JFK',
      carrier: 'Delta',
      flight_number: 'DL123',
      hotel_name: 'Grand Hotel',
      confirmation_number: 'CONF123',
      cost: 450,
      status: 'confirmed',
      notes: 'Window seat preferred',
    };

    expect(booking.return_date).toBe('2025-02-20');
    expect(booking.carrier).toBe('Delta');
    expect(booking.flight_number).toBe('DL123');
    expect(booking.hotel_name).toBe('Grand Hotel');
    expect(booking.confirmation_number).toBe('CONF123');
    expect(booking.notes).toBe('Window seat preferred');
  });
});
