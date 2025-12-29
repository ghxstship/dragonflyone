'use client';

/**
 * React Query hooks for Batch Operations
 * Provides data fetching, mutations, and cache management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@supabase/ssr';

const createClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface BatchOperation {
  id: string;
  organization_id: string;
  user_id: string;
  entity_type: string;
  operation_type: string;
  entity_ids: string[];
  parameters: Record<string, unknown> | null;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial' | 'cancelled';
  total_count: number;
  processed_count: number;
  success_count: number;
  failed_count: number;
  results: Record<string, unknown> | null;
  error_message: string | null;
  error_log: unknown[];
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface BatchOperationFilters {
  status?: string;
  entity_type?: string;
  limit?: number;
}

// Query keys
export const batchOperationsKeys = {
  all: ['batch-operations'] as const,
  lists: () => [...batchOperationsKeys.all, 'list'] as const,
  list: (filters: BatchOperationFilters) => [...batchOperationsKeys.lists(), filters] as const,
  details: () => [...batchOperationsKeys.all, 'detail'] as const,
  detail: (id: string) => [...batchOperationsKeys.details(), id] as const,
};

// Fetch batch operations
async function fetchBatchOperations(filters: BatchOperationFilters): Promise<BatchOperation[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('batch_operations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(filters.limit || 100);

  if (filters.status && filters.status !== 'all') {
    query = query.eq('status', filters.status);
  }

  if (filters.entity_type) {
    query = query.eq('entity_type', filters.entity_type);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

// Fetch single batch operation
async function fetchBatchOperation(id: string): Promise<BatchOperation> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('batch_operations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Cancel batch operation
async function cancelBatchOperation(id: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('batch_operations')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('status', 'pending');

  if (error) {
    throw new Error(error.message);
  }
}

// Retry batch operation
async function retryBatchOperation(id: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('batch_operations')
    .update({ 
      status: 'pending', 
      failed_count: 0, 
      error_log: [],
      error_message: null 
    })
    .eq('id', id)
    .eq('status', 'failed');

  if (error) {
    throw new Error(error.message);
  }
}

// Hook: List batch operations
export function useBatchOperationsQuery(filters: BatchOperationFilters = {}) {
  return useQuery({
    queryKey: batchOperationsKeys.list(filters),
    queryFn: () => fetchBatchOperations(filters),
    staleTime: 30000, // 30 seconds
    refetchInterval: 10000, // Auto-refresh every 10 seconds for live updates
  });
}

// Hook: Get single batch operation
export function useBatchOperationQuery(id: string) {
  return useQuery({
    queryKey: batchOperationsKeys.detail(id),
    queryFn: () => fetchBatchOperation(id),
    enabled: !!id,
    staleTime: 10000,
  });
}

// Hook: Cancel batch operation
export function useCancelBatchOperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelBatchOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchOperationsKeys.all });
    },
  });
}

// Hook: Retry batch operation
export function useRetryBatchOperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: retryBatchOperation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchOperationsKeys.all });
    },
  });
}

// Hook: Execute new batch operation
export function useExecuteBatchOperation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      operation: 'create' | 'update' | 'delete' | 'archive';
      entity_type: string;
      records: Array<{ id?: string; data?: Record<string, unknown> }>;
      options?: { validate?: boolean; rollback_on_error?: boolean };
    }) => {
      const response = await fetch('/api/batch/operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Batch operation failed');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchOperationsKeys.all });
    },
  });
}
