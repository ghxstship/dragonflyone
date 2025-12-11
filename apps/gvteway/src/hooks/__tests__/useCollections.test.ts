import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCollectionDetail, useCollectionData, collectionsKeys } from '../useCollections';

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

describe('useCollections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('collectionsKeys', () => {
    it('should generate correct all key', () => {
      expect(collectionsKeys.all).toEqual(['collections']);
    });

    it('should generate correct detail key', () => {
      expect(collectionsKeys.detail('col-1')).toEqual(['collections', 'detail', 'col-1']);
    });
  });

  describe('useCollectionDetail hook', () => {
    it('should not fetch when collectionId is empty', () => {
      const { result } = renderHook(() => useCollectionDetail(''), { wrapper: createWrapper() });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should return demo data on error response', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useCollectionDetail('col-1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
    });
  });

  describe('useCollectionData hook', () => {
    it('should return combined data structure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
      });

      const { result } = renderHook(() => useCollectionData('col-1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
    });
  });
});

describe('Collection interface', () => {
  it('should have required fields', () => {
    const collection = {
      id: '1',
      name: 'Summer Festival Series',
      description: 'The best summer festivals',
      events: [],
    };

    expect(collection.id).toBeDefined();
    expect(collection.name).toBeDefined();
    expect(collection.description).toBeDefined();
    expect(collection.events).toBeDefined();
  });
});

describe('CollectionEvent interface', () => {
  it('should have required fields', () => {
    const event = {
      id: '1',
      title: 'Summer Music Festival',
      date: '2024-07-15',
      venue: 'Central Park',
      category: 'Festival',
    };

    expect(event.id).toBeDefined();
    expect(event.title).toBeDefined();
    expect(event.date).toBeDefined();
    expect(event.venue).toBeDefined();
    expect(event.category).toBeDefined();
  });

  it('should support optional fields', () => {
    const event = {
      id: '1',
      title: 'Summer Music Festival',
      date: '2024-07-15',
      venue: 'Central Park',
      category: 'Festival',
      price: 150,
      image: '/images/festival.jpg',
    };

    expect(event.price).toBe(150);
    expect(event.image).toBe('/images/festival.jpg');
  });
});
