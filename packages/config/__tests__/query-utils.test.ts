import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import {
  optimisticUpdate,
  optimisticAdd,
  optimisticRemove,
  getCachedData,
  setQueryData,
  clearQueries,
  createOptimisticMutation,
} from '../query-utils';

describe('query-utils', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  describe('optimisticUpdate', () => {
    it('should update an item in the cache', () => {
      const queryKey = ['items'];
      const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];
      queryClient.setQueryData(queryKey, items);

      optimisticUpdate<{ id: string; name: string }>(queryClient, queryKey, '1', { name: 'Updated Item 1' });

      const result = queryClient.getQueryData<typeof items>(queryKey);
      expect(result?.[0].name).toBe('Updated Item 1');
      expect(result?.[1].name).toBe('Item 2');
    });

    it('should not modify items that do not match the id', () => {
      const queryKey = ['items'];
      const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];
      queryClient.setQueryData(queryKey, items);

      optimisticUpdate<{ id: string; name: string }>(queryClient, queryKey, '3', { name: 'Non-existent' });

      const result = queryClient.getQueryData<typeof items>(queryKey);
      expect(result).toEqual(items);
    });

    it('should handle empty cache gracefully', () => {
      const queryKey = ['items'];
      optimisticUpdate<{ id: string; name: string }>(queryClient, queryKey, '1', { name: 'Updated' });
      const result = queryClient.getQueryData(queryKey);
      expect(result).toBeUndefined();
    });
  });

  describe('optimisticAdd', () => {
    it('should add an item to the cache', () => {
      const queryKey = ['items'];
      const items = [{ id: '1', name: 'Item 1' }];
      queryClient.setQueryData(queryKey, items);

      optimisticAdd(queryClient, queryKey, { id: '2', name: 'Item 2' });

      const result = queryClient.getQueryData<typeof items>(queryKey);
      expect(result?.length).toBe(2);
      expect(result?.[1].name).toBe('Item 2');
    });

    it('should create array with single item if cache is empty', () => {
      const queryKey = ['items'];
      optimisticAdd(queryClient, queryKey, { id: '1', name: 'Item 1' });

      const result = queryClient.getQueryData<{ id: string; name: string }[]>(queryKey);
      expect(result?.length).toBe(1);
      expect(result?.[0].name).toBe('Item 1');
    });
  });

  describe('optimisticRemove', () => {
    it('should remove an item from the cache', () => {
      const queryKey = ['items'];
      const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ];
      queryClient.setQueryData(queryKey, items);

      optimisticRemove(queryClient, queryKey, '1');

      const result = queryClient.getQueryData<typeof items>(queryKey);
      expect(result?.length).toBe(1);
      expect(result?.[0].id).toBe('2');
    });

    it('should handle removing non-existent item gracefully', () => {
      const queryKey = ['items'];
      const items = [{ id: '1', name: 'Item 1' }];
      queryClient.setQueryData(queryKey, items);

      optimisticRemove(queryClient, queryKey, '999');

      const result = queryClient.getQueryData<typeof items>(queryKey);
      expect(result?.length).toBe(1);
    });

    it('should handle empty cache gracefully', () => {
      const queryKey = ['items'];
      optimisticRemove(queryClient, queryKey, '1');
      const result = queryClient.getQueryData(queryKey);
      expect(result).toBeUndefined();
    });
  });

  describe('getCachedData', () => {
    it('should return cached data', () => {
      const queryKey = ['items'];
      const items = [{ id: '1', name: 'Item 1' }];
      queryClient.setQueryData(queryKey, items);

      const result = getCachedData<typeof items>(queryClient, queryKey);
      expect(result).toEqual(items);
    });

    it('should return undefined for missing cache', () => {
      const queryKey = ['non-existent'];
      const result = getCachedData(queryClient, queryKey);
      expect(result).toBeUndefined();
    });
  });

  describe('setQueryData', () => {
    it('should set data directly', () => {
      const queryKey = ['items'];
      const items = [{ id: '1', name: 'Item 1' }];

      setQueryData(queryClient, queryKey, items);

      const result = queryClient.getQueryData(queryKey);
      expect(result).toEqual(items);
    });

    it('should set data using updater function', () => {
      const queryKey = ['count'];
      queryClient.setQueryData(queryKey, 5);

      setQueryData<number>(queryClient, queryKey, (old) => (old || 0) + 1);

      const result = queryClient.getQueryData<number>(queryKey);
      expect(result).toBe(6);
    });
  });

  describe('clearQueries', () => {
    it('should remove queries matching prefix', () => {
      queryClient.setQueryData(['items', 'list'], [{ id: '1' }]);
      queryClient.setQueryData(['items', 'detail', '1'], { id: '1' });
      queryClient.setQueryData(['users'], [{ id: 'u1' }]);

      clearQueries(queryClient, ['items']);

      expect(queryClient.getQueryData(['items', 'list'])).toBeUndefined();
      expect(queryClient.getQueryData(['items', 'detail', '1'])).toBeUndefined();
      expect(queryClient.getQueryData(['users'])).toBeDefined();
    });
  });

  describe('createOptimisticMutation', () => {
    it('should create mutation config with optimistic update', async () => {
      const queryKey = ['items'];
      const items = [{ id: '1', name: 'Item 1' }];
      queryClient.setQueryData(queryKey, items);

      const mutationConfig = createOptimisticMutation<typeof items, { id: string; name: string }>({
        queryClient,
        queryKey,
        mutationFn: async (variables) => {
          return [...items, variables];
        },
        onOptimisticUpdate: (old, variables) => {
          return old ? [...old, variables] : [variables];
        },
      });

      expect(mutationConfig.mutationFn).toBeDefined();
      expect(mutationConfig.onMutate).toBeDefined();
      expect(mutationConfig.onError).toBeDefined();
      expect(mutationConfig.onSuccess).toBeDefined();
      expect(mutationConfig.onSettled).toBeDefined();
    });

    it('should call onMutate and return previous data', async () => {
      const queryKey = ['items'];
      const items = [{ id: '1', name: 'Item 1' }];
      queryClient.setQueryData(queryKey, items);

      const mutationConfig = createOptimisticMutation<typeof items, { id: string; name: string }>({
        queryClient,
        queryKey,
        mutationFn: async (variables) => [...items, variables],
        onOptimisticUpdate: (old, variables) => (old ? [...old, variables] : [variables]),
      });

      const context = await mutationConfig.onMutate({ id: '2', name: 'Item 2' });
      expect(context?.previousData).toEqual(items);
    });

    it('should rollback on error', async () => {
      const queryKey = ['items'];
      const items = [{ id: '1', name: 'Item 1' }];
      queryClient.setQueryData(queryKey, items);

      const onErrorSpy = vi.fn();
      const mutationConfig = createOptimisticMutation<typeof items, { id: string; name: string }>({
        queryClient,
        queryKey,
        mutationFn: async () => {
          throw new Error('Failed');
        },
        onOptimisticUpdate: (old, variables) => (old ? [...old, variables] : [variables]),
        onError: onErrorSpy,
      });

      // Simulate onMutate
      const context = await mutationConfig.onMutate({ id: '2', name: 'Item 2' });

      // Simulate error
      mutationConfig.onError(new Error('Failed'), { id: '2', name: 'Item 2' }, context);

      // Should rollback
      const result = queryClient.getQueryData<typeof items>(queryKey);
      expect(result).toEqual(items);
      expect(onErrorSpy).toHaveBeenCalled();
    });

    it('should call onSuccess callback', () => {
      const queryKey = ['items'];
      const onSuccessSpy = vi.fn();

      const mutationConfig = createOptimisticMutation<{ id: string }[], { id: string }>({
        queryClient,
        queryKey,
        mutationFn: async (variables) => [variables],
        onSuccess: onSuccessSpy,
      });

      mutationConfig.onSuccess([{ id: '1' }], { id: '1' });
      expect(onSuccessSpy).toHaveBeenCalledWith([{ id: '1' }], { id: '1' });
    });
  });
});
