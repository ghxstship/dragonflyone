'use client';

import React from 'react';
import { QueryClientProvider } from './query-client';
import { AuthProvider } from './auth-context';
import { AppContextProvider } from './app-context';
import { CookieConsentProvider } from './providers/CookieConsentProvider';

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
      <CookieConsentProvider complianceMode="gdpr">
        <AuthProvider>
          <AppContextProvider platform={platform}>
            {children}
          </AppContextProvider>
        </AuthProvider>
      </CookieConsentProvider>
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
