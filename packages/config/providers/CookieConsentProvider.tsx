"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useCookieConsent, UseCookieConsentOptions, UseCookieConsentReturn, CookiePreferences } from '../hooks/useCookieConsent';

/**
 * Cookie Consent Context
 * Provides cookie consent state and actions throughout the app
 */
const CookieConsentContext = createContext<UseCookieConsentReturn | null>(null);

export interface CookieConsentProviderProps extends UseCookieConsentOptions {
  children: ReactNode;
}

/**
 * Cookie Consent Provider
 * 
 * Wraps the application to provide cookie consent functionality.
 * Should be placed near the root of the app, inside QueryClientProvider.
 * 
 * @example
 * ```tsx
 * <QueryClientProvider client={queryClient}>
 *   <CookieConsentProvider complianceMode="gdpr">
 *     <App />
 *   </CookieConsentProvider>
 * </QueryClientProvider>
 * ```
 */
export function CookieConsentProvider({
  children,
  ...options
}: CookieConsentProviderProps) {
  const cookieConsent = useCookieConsent(options);

  return (
    <CookieConsentContext.Provider value={cookieConsent}>
      {children}
    </CookieConsentContext.Provider>
  );
}

/**
 * Hook to access cookie consent context
 * Must be used within a CookieConsentProvider
 */
export function useCookieConsentContext(): UseCookieConsentReturn {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsentContext must be used within a CookieConsentProvider');
  }
  return context;
}

/**
 * Hook to check if analytics tracking is allowed
 */
export function useAnalyticsConsent(): boolean {
  const context = useContext(CookieConsentContext);
  return context?.isCategoryAllowed('analytics') ?? false;
}

/**
 * Hook to check if advertising/marketing cookies are allowed
 */
export function useAdvertisingConsent(): boolean {
  const context = useContext(CookieConsentContext);
  return context?.isCategoryAllowed('advertising') ?? false;
}

/**
 * Hook to check if functional cookies are allowed
 */
export function useFunctionalConsent(): boolean {
  const context = useContext(CookieConsentContext);
  return context?.isCategoryAllowed('functional') ?? false;
}

/**
 * Higher-order component to conditionally render based on consent
 */
export function withConsentRequired<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  category: keyof CookiePreferences,
  FallbackComponent?: React.ComponentType
) {
  return function ConsentRequiredComponent(props: P) {
    const context = useContext(CookieConsentContext);
    const isAllowed = context?.isCategoryAllowed(category) ?? false;

    if (!isAllowed) {
      return FallbackComponent ? <FallbackComponent /> : null;
    }

    return <WrappedComponent {...props} />;
  };
}

export { CookieConsentContext };
export type { CookiePreferences, UseCookieConsentReturn };
