import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCateringServices, useCateringData, cateringKeys } from '../useCatering';

// Mock fetch
global.fetch = vi.fn();

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useCatering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('cateringKeys', () => {
    it('should generate correct all key', () => {
      expect(cateringKeys.all).toEqual(['catering']);
    });

    it('should generate correct list key with filters', () => {
      expect(cateringKeys.list({ projectId: 'proj-1', mealType: 'lunch' })).toEqual(['catering', 'list', { projectId: 'proj-1', mealType: 'lunch' }]);
    });

    it('should generate correct list key without filters', () => {
      expect(cateringKeys.list()).toEqual(['catering', 'list', undefined]);
    });
  });

  describe('useCateringServices hook', () => {
    it('should handle 401 response as error', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      const { result } = renderHook(() => useCateringServices(), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should apply projectId filter', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ services: [], summary: {} }),
      });

      const { result } = renderHook(() => useCateringServices({ projectId: 'proj-1' }), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply mealType filter', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 200,
        ok: true,
        json: () => Promise.resolve({ services: [], summary: {} }),
      });

      const { result } = renderHook(() => useCateringServices({ mealType: 'lunch' }), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));
      const { result } = renderHook(() => useCateringServices(), { wrapper: TestWrapper });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useCateringData hook', () => {
    it('should return combined data structure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
      });

      const { result } = renderHook(() => useCateringData(), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.services).toBeDefined();
      expect(result.current.summary).toBeDefined();
      expect(typeof result.current.refetch).toBe('function');
    });
  });
});

describe('MealService interface', () => {
  it('should have required fields', () => {
    const service = {
      id: '1',
      project_id: 'proj-1',
      project_name: 'Summer Festival',
      service_date: '2024-07-15',
      meal_type: 'lunch',
      headcount: 50,
      location: 'Backstage',
      cost_per_head: 20,
      total_cost: 1000,
      status: 'confirmed',
    };

    expect(service.id).toBeDefined();
    expect(service.project_id).toBeDefined();
    expect(service.meal_type).toBeDefined();
    expect(service.headcount).toBeDefined();
    expect(service.location).toBeDefined();
    expect(service.cost_per_head).toBeDefined();
    expect(service.total_cost).toBeDefined();
    expect(service.status).toBeDefined();
  });

  it('should support optional fields', () => {
    const service = {
      id: '1',
      project_id: 'proj-1',
      project_name: 'Summer Festival',
      service_date: '2024-07-15',
      meal_type: 'lunch',
      headcount: 50,
      vendor_id: 'vendor-1',
      vendor_name: 'Gourmet Catering',
      location: 'Backstage',
      dietary_notes: 'Vegetarian options available',
      cost_per_head: 20,
      total_cost: 1000,
      status: 'confirmed',
    };

    expect(service.vendor_id).toBe('vendor-1');
    expect(service.vendor_name).toBe('Gourmet Catering');
    expect(service.dietary_notes).toBe('Vegetarian options available');
  });
});

describe('CateringSummary interface', () => {
  it('should have all summary fields', () => {
    const summary = {
      total_services: 10,
      upcoming_meals: 5,
      total_headcount: 500,
      total_cost: 10000,
      average_cost_per_head: 20,
      dietary_requirements: [{ type: 'vegetarian', count: 50 }],
    };

    expect(summary.total_services).toBe(10);
    expect(summary.upcoming_meals).toBe(5);
    expect(summary.total_headcount).toBe(500);
    expect(summary.total_cost).toBe(10000);
    expect(summary.average_cost_per_head).toBe(20);
    expect(summary.dietary_requirements).toHaveLength(1);
  });
});
