'use client';

import React from 'react';
import { QueryClientProvider } from './query-client';
import { AuthProvider } from './auth-context';

/**
 * Root Providers Component
 * Combines all necessary providers for the application
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
}

/**
 * Minimal Provider (for pages that don't need auth)
 */
export function MinimalProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider>
      {children}
    </QueryClientProvider>
  );
}
