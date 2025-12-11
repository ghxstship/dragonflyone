'use client';

import { useQuery } from '@tanstack/react-query';

export interface CollectionEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
  category: string;
  price?: number;
  image?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  image?: string;
  events: CollectionEvent[];
}

const DEMO_COLLECTION: Collection = {
  id: 'demo-1',
  name: 'Summer Festival Series',
  description: 'The best summer festivals and outdoor events',
  events: [
    { id: 'e1', title: 'Summer Music Festival', date: new Date(Date.now() + 7 * 86400000).toISOString(), venue: 'Central Park', category: 'Festival', price: 150 },
    { id: 'e2', title: 'Jazz in the Park', date: new Date(Date.now() + 14 * 86400000).toISOString(), venue: 'Riverside Amphitheater', category: 'Jazz', price: 75 },
  ],
};

export const collectionsKeys = {
  all: ['collections'] as const,
  detail: (id: string) => [...collectionsKeys.all, 'detail', id] as const,
};

export function useCollectionDetail(collectionId: string) {
  return useQuery({
    queryKey: collectionsKeys.detail(collectionId),
    queryFn: async () => {
      const response = await fetch(`/api/collections/${collectionId}`);
      if (!response.ok) return DEMO_COLLECTION;
      const data = await response.json();
      return data.collection || DEMO_COLLECTION;
    },
    enabled: !!collectionId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCollectionData(collectionId: string) {
  const collectionQuery = useCollectionDetail(collectionId);

  return {
    collection: collectionQuery.data || null,
    isLoading: collectionQuery.isLoading,
    error: collectionQuery.error,
    refetch: collectionQuery.refetch,
  };
}
