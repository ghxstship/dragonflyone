// apps/atlvs/src/hooks/useAdvanceReview.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ProductionAdvance,
  ApproveAdvancePayload,
  RejectAdvancePayload,
  AdvanceFilters,
} from '@ghxstship/config/types/advancing';

interface AdvancesResponse {
  advances: ProductionAdvance[];
  total: number;
  limit: number;
  offset: number;
}

// List advances for review
export function useAdvanceReviewQueue(filters?: AdvanceFilters) {
  return useQuery({
    queryKey: ['advance-review-queue', filters],
    queryFn: async (): Promise<AdvancesResponse> => {
      const params = new URLSearchParams();
      
      if (filters?.status) params.append('status', filters.status);
      if (filters?.project_id) params.append('project_id', filters.project_id);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.offset) params.append('offset', filters.offset.toString());

      const response = await fetch(`/api/advances?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch advances for review');
      }
      
      return response.json();
    },
  });
}

// Get single advance for review
export function useAdvanceForReview(id: string) {
  return useQuery({
    queryKey: ['advance-review', id],
    queryFn: async (): Promise<{ advance: ProductionAdvance }> => {
      const response = await fetch(`/api/advances/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch advance');
      }
      
      return response.json();
    },
    enabled: !!id,
  });
}

// Approve advance
export function useApproveAdvance(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: ApproveAdvancePayload): Promise<{ advance: ProductionAdvance; message: string }> => {
      const response = await fetch(`/api/advances/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve advance');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advance-review', id] });
      queryClient.invalidateQueries({ queryKey: ['advance-review-queue'] });
    },
  });
}

// Reject advance
export function useRejectAdvance(id: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: RejectAdvancePayload): Promise<{ advance: ProductionAdvance; message: string }> => {
      const response = await fetch(`/api/advances/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject advance');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advance-review', id] });
      queryClient.invalidateQueries({ queryKey: ['advance-review-queue'] });
    },
  });
}
