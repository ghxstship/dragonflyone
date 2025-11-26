'use client';

import React from 'react';
import { QueryClientProvider } from './query-client';
import { AuthProvider } from './auth-context';
import { AppContextProvider } from './app-context';

/**
 * Root Providers Component
 * Combines all necessary providers for the application
 */
export function AppProviders({ 
  children,
  platform = 'atlvs',
}: { 
  children: React.ReactNode;
  platform?: 'atlvs' | 'compvss' | 'gvteway';
}) {
  return (
    <QueryClientProvider>
      <AuthProvider>
        <AppContextProvider platform={platform}>
          {children}
        </AppContextProvider>
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
