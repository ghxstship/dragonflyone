import { QueryClient } from '@tanstack/react-query';

/**
 * Query Utilities for Optimistic Updates and Cache Management
 */

/**
 * Optimistically update a single item in a list query
 */
export function optimisticUpdate<T extends { id: string }>(
  queryClient: QueryClient,
  queryKey: unknown[],
  itemId: string,
  updates: Partial<T>
) {
  queryClient.setQueryData<T[]>(queryKey, (old) => {
    if (!old) return old;
    return old.map((item) => (item.id === itemId ? { ...item, ...updates } : item));
  });
}

/**
 * Optimistically add an item to a list query
 */
export function optimisticAdd<T extends { id: string }>(
  queryClient: QueryClient,
  queryKey: unknown[],
  newItem: T
) {
  queryClient.setQueryData<T[]>(queryKey, (old) => {
    if (!old) return [newItem];
    return [...old, newItem];
  });
}

/**
 * Optimistically remove an item from a list query
 */
export function optimisticRemove<T extends { id: string }>(
  queryClient: QueryClient,
  queryKey: unknown[],
  itemId: string
) {
  queryClient.setQueryData<T[]>(queryKey, (old) => {
    if (!old) return old;
    return old.filter((item) => item.id !== itemId);
  });
}

/**
 * Invalidate and refetch multiple related queries
 */
export async function invalidateRelated(
  queryClient: QueryClient,
  queryKeys: unknown[][]
) {
  await Promise.all(
    queryKeys.map((key) => queryClient.invalidateQueries({ queryKey: key }))
  );
}

/**
 * Prefetch data for a query
 */
export async function prefetchQuery<T>(
  queryClient: QueryClient,
  queryKey: unknown[],
  queryFn: () => Promise<T>,
  staleTime?: number
) {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime,
  });
}

/**
 * Get cached data without triggering a fetch
 */
export function getCachedData<T>(queryClient: QueryClient, queryKey: unknown[]): T | undefined {
  return queryClient.getQueryData<T>(queryKey);
}

/**
 * Set query data manually
 */
export function setQueryData<T>(
  queryClient: QueryClient,
  queryKey: unknown[],
  data: T | ((old: T | undefined) => T)
) {
  queryClient.setQueryData<T>(queryKey, data);
}

/**
 * Clear all queries matching a key pattern
 */
export function clearQueries(queryClient: QueryClient, queryKeyPrefix: unknown[]) {
  queryClient.removeQueries({ queryKey: queryKeyPrefix });
}

/**
 * Reset specific query to initial state
 */
export function resetQuery(queryClient: QueryClient, queryKey: unknown[]) {
  queryClient.resetQueries({ queryKey });
}

/**
 * Cancel ongoing queries (useful before navigation)
 */
export async function cancelQueries(queryClient: QueryClient, queryKey: unknown[]) {
  await queryClient.cancelQueries({ queryKey });
}

/**
 * Generic mutation with optimistic update pattern
 */
export interface OptimisticMutationOptions<TData, TVariables> {
  queryClient: QueryClient;
  queryKey: unknown[];
  mutationFn: (variables: TVariables) => Promise<TData>;
  onOptimisticUpdate?: (old: TData | undefined, variables: TVariables) => TData;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables, context: { previousData?: TData }) => void;
}

export function createOptimisticMutation<TData, TVariables>({
  queryClient,
  queryKey,
  mutationFn,
  onOptimisticUpdate,
  onSuccess,
  onError,
}: OptimisticMutationOptions<TData, TVariables>) {
  return {
    mutationFn,
    onMutate: async (variables: TVariables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TData>(queryKey);

      // Optimistically update
      if (onOptimisticUpdate && previousData) {
        queryClient.setQueryData<TData>(queryKey, onOptimisticUpdate(previousData, variables));
      }

      return { previousData };
    },
    onError: (error: Error, variables: TVariables, context?: { previousData?: TData }) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData<TData>(queryKey, context.previousData);
      }
      onError?.(error, variables, context || {});
    },
    onSuccess: (data: TData, variables: TVariables) => {
      onSuccess?.(data, variables);
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey });
    },
  };
}
