// apps/compvss/src/hooks/useAdvancing.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ProductionAdvance,
  CreateAdvancePayload,
  UpdateAdvancePayload,
  FulfillAdvancePayload,
  AdvanceFilters,
} from '@ghxstship/config/types/advancing';

interface AdvancesResponse {
  advances: ProductionAdvance[];
  total: number;
  limit: number;
  offset: number;
}

// List advances
export function useAdvances(filters?: AdvanceFilters) {
  return useQuery({
    queryKey: ['advances', filters],
    queryFn: async (): Promise<AdvancesResponse> => {
      const params = new URLSearchParams();
      
      if (filters?.project_id) params.append('project_id', filters.project_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.submitter_id) params.append('submitter_id', filters.submitter_id);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/advancing?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch advances');
      }
      
      return response.json();
    },
  });
}

// Get single advance
export function useAdvance(id: string) {
  return useQuery({
    queryKey: ['advance', id],
    queryFn: async (): Promise<{ advance: ProductionAdvance }> => {
      const response = await fetch(`/api/advancing/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch advance');
      }
      
      return response.json();
    },
    enabled: !!id,
  });
}

// Create advance
export function useCreateAdvance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: CreateAdvancePayload): Promise<{ advance: ProductionAdvance }> => {
      const response = await fetch('/api/advancing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create advance');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advances'] });
    },
  });
}

// Update advance
export function useUpdateAdvance(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: UpdateAdvancePayload): Promise<{ advance: ProductionAdvance }> => {
      const response = await fetch(`/api/advancing/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update advance');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advance', id] });
      queryClient.invalidateQueries({ queryKey: ['advances'] });
    },
  });
}

// Delete advance
export function useDeleteAdvance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<{ message: string }> => {
      const response = await fetch(`/api/advancing/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete advance');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advances'] });
    },
  });
}

// Fulfill advance
export function useFulfillAdvance(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: FulfillAdvancePayload): Promise<{ advance: ProductionAdvance; message: string }> => {
      const response = await fetch(`/api/advancing/${id}/fulfill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fulfill advance');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advance', id] });
      queryClient.invalidateQueries({ queryKey: ['advances'] });
    },
  });
}
