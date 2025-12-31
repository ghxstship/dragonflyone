"use client";

import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

export interface OptimisticUpdateOptions<TData, TVariables> {
  /** Query key to update optimistically */
  queryKey: unknown[];
  /** Function to update the cache optimistically */
  updateFn: (oldData: TData | undefined, variables: TVariables) => TData;
  /** Mutation function to execute */
  mutationFn: (variables: TVariables) => Promise<unknown>;
  /** Callback on success */
  onSuccess?: (data: unknown, variables: TVariables) => void;
  /** Callback on error */
  onError?: (error: Error, variables: TVariables, rollback: () => void) => void;
  /** Delay before showing loading state (ms) - prevents flash for fast operations */
  loadingDelay?: number;
}

export interface OptimisticUpdateReturn<TVariables> {
  /** Execute the optimistic mutation */
  mutate: (variables: TVariables) => Promise<void>;
  /** Whether the mutation is in progress */
  isLoading: boolean;
  /** Error from the last mutation */
  error: Error | null;
  /** Reset error state */
  reset: () => void;
}

/**
 * useOptimisticUpdate - Hook for optimistic UI updates
 * 
 * Features:
 * - Immediate UI update before server response
 * - Automatic rollback on error
 * - Delayed loading state to prevent flash
 * - Error handling with rollback callback
 * 
 * @example
 * ```tsx
 * const { mutate, isLoading } = useOptimisticUpdate({
 *   queryKey: ['todos'],
 *   updateFn: (oldData, newTodo) => [...(oldData || []), newTodo],
 *   mutationFn: (newTodo) => api.createTodo(newTodo),
 *   onSuccess: () => toast.success('Todo Created'),
 *   onError: (error, _, rollback) => {
 *     rollback();
 *     toast.error('Failed', error.message);
 *   },
 * });
 * ```
 */
export function useOptimisticUpdate<TData, TVariables>({
  queryKey,
  updateFn,
  mutationFn,
  onSuccess,
  onError,
  loadingDelay = 150,
}: OptimisticUpdateOptions<TData, TVariables>): OptimisticUpdateReturn<TVariables> {
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (variables: TVariables) => {
      setError(null);

      // Store previous data for rollback
      const previousData = queryClient.getQueryData<TData>(queryKey);

      // Optimistically update the cache
      queryClient.setQueryData<TData>(queryKey, (oldData) =>
        updateFn(oldData, variables)
      );

      // Delayed loading state to prevent flash
      let loadingTimeout: ReturnType<typeof setTimeout> | null = null;
      loadingTimeout = setTimeout(() => {
        setIsLoading(true);
      }, loadingDelay);

      // Rollback function
      const rollback = () => {
        queryClient.setQueryData(queryKey, previousData);
      };

      try {
        const result = await mutationFn(variables);
        
        // Clear loading timeout if operation was fast
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
        }
        setIsLoading(false);

        // Invalidate to get fresh data from server
        await queryClient.invalidateQueries({ queryKey });

        onSuccess?.(result, variables);
      } catch (err) {
        // Clear loading timeout
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
        }
        setIsLoading(false);

        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);

        // Call error handler with rollback
        if (onError) {
          onError(error, variables, rollback);
        } else {
          // Default: rollback on error
          rollback();
        }
      }
    },
    [queryClient, queryKey, updateFn, mutationFn, onSuccess, onError, loadingDelay]
  );

  const reset = useCallback(() => {
    setError(null);
  }, []);

  return {
    mutate,
    isLoading,
    error,
    reset,
  };
}

/**
 * Helper: Create optimistic delete update function
 */
export function createOptimisticDelete<T extends { id: string }>(
  id: string
): (oldData: T[] | undefined) => T[] {
  return (oldData) => (oldData || []).filter((item) => item.id !== id);
}

/**
 * Helper: Create optimistic add update function
 */
export function createOptimisticAdd<T>(
  newItem: T
): (oldData: T[] | undefined) => T[] {
  return (oldData) => [...(oldData || []), newItem];
}

/**
 * Helper: Create optimistic update function for a single item
 */
export function createOptimisticItemUpdate<T extends { id: string }>(
  id: string,
  updates: Partial<T>
): (oldData: T[] | undefined) => T[] {
  return (oldData) =>
    (oldData || []).map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
}

export default useOptimisticUpdate;
