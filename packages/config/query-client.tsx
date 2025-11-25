'use client';

import {
  QueryClient,
  QueryClientProvider as TanStackQueryClientProvider,
  DefaultOptions,
  MutationCache,
  QueryCache,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import React, { useState } from 'react';

/**
 * Default Query Client Configuration
 * Optimized for real-time applications with Supabase integration
 */
const defaultQueryOptions: DefaultOptions = {
  queries: {
    // Cache data for 5 minutes by default
    staleTime: 1000 * 60 * 5,
    // Keep unused data in cache for 10 minutes
    gcTime: 1000 * 60 * 10,
    // Retry failed requests 3 times with exponential backoff
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    // Refetch on window focus for real-time updates
    refetchOnWindowFocus: true,
    // Don't refetch on mount if data is fresh
    refetchOnMount: false,
    // Refetch on reconnect
    refetchOnReconnect: true,
  },
  mutations: {
    // Retry mutations once on failure
    retry: 1,
    retryDelay: 1000,
  },
};

/**
 * Create a new QueryClient instance with error handling
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: defaultQueryOptions,
    queryCache: new QueryCache({
      onError: (error, query) => {
        console.error('Query error:', error);
        console.error('Query key:', query.queryKey);
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        console.error('Mutation error:', error);
        console.error('Mutation key:', mutation.options.mutationKey);
      },
      onSuccess: (_data, _variables, _context, mutation) => {
        console.log('Mutation success:', mutation.options.mutationKey);
      },
    }),
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Get or create a QueryClient instance
 * In browser, we reuse the same instance
 * In server, we create a new instance for each request
 */
export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always create a new query client
    return makeQueryClient();
  } else {
    // Browser: reuse the same query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

/**
 * QueryClient Provider Component
 * Wraps the application with React Query context
 */
export function QueryClientProvider({ children }: { children: React.ReactNode }) {
  // Create a stable query client instance
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <TanStackQueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          initialIsOpen={false}
          buttonPosition="bottom-right"
          position="bottom"
        />
      )}
    </TanStackQueryClientProvider>
  );
}

/**
 * Query Client Configuration Presets
 */
export const queryPresets = {
  // Real-time data that changes frequently (e.g., live event updates)
  realtime: {
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
  },
  // Static data that rarely changes (e.g., venue info, user profiles)
  static: {
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnWindowFocus: false,
  },
  // Data that should always be fresh (e.g., cart, checkout)
  fresh: {
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  },
  // Infinite scroll / pagination
  infinite: {
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    getNextPageParam: (lastPage: any) => lastPage.nextCursor,
    getPreviousPageParam: (firstPage: any) => firstPage.prevCursor,
  },
};
