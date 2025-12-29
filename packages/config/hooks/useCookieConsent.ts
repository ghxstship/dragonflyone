"use client";

/**
 * Cookie Consent Hook
 * 
 * Manages cookie consent state, persistence, and API synchronization
 * for GDPR/ePrivacy/CCPA compliance.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  advertising: boolean;
}

export interface CookieConsentState {
  /** Whether the user has made a consent decision */
  hasConsented: boolean;
  /** The user's cookie preferences */
  preferences: CookiePreferences;
  /** When consent was last updated */
  consentedAt: string | null;
  /** Session ID for anonymous users */
  sessionId: string;
}

export interface UseCookieConsentOptions {
  /** API endpoint for saving consent */
  apiEndpoint?: string;
  /** Storage key for local persistence */
  storageKey?: string;
  /** Whether to show banner for returning users who haven't consented */
  showForReturningUsers?: boolean;
  /** Compliance mode affects default behavior */
  complianceMode?: 'gdpr' | 'ccpa' | 'default';
  /** Callback when consent changes */
  onConsentChange?: (preferences: CookiePreferences) => void;
  /** Regions that require consent banner (ISO country codes) */
  consentRequiredRegions?: string[];
}

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  functional: false,
  analytics: false,
  advertising: false,
};

const CONSENT_REQUIRED_REGIONS = [
  // EU countries
  'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
  'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
  'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
  // EEA
  'IS', 'LI', 'NO',
  // UK
  'GB',
  // Brazil (LGPD)
  'BR',
  // California (CCPA) - handled separately via state detection
];

/**
 * Generate a unique session ID for anonymous consent tracking
 */
function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}`;
}

/**
 * Get or create session ID from localStorage
 */
function getOrCreateSessionId(storageKey: string): string {
  if (typeof window === 'undefined') return generateSessionId();
  
  const stored = localStorage.getItem(`${storageKey}_session`);
  if (stored) return stored;
  
  const newId = generateSessionId();
  localStorage.setItem(`${storageKey}_session`, newId);
  return newId;
}

/**
 * Load consent state from localStorage
 */
function loadConsentState(storageKey: string): CookieConsentState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Save consent state to localStorage
 */
function saveConsentState(storageKey: string, state: CookieConsentState): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Storage might be full or disabled
    console.warn('Failed to save cookie consent to localStorage');
  }
}

/**
 * Detect user's country from various sources
 */
async function detectUserCountry(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  // Check Cloudflare header (if available via API)
  // This would typically be passed from the server
  const cfCountry = document.querySelector('meta[name="cf-ipcountry"]')?.getAttribute('content');
  if (cfCountry) return cfCountry;
  
  // Check navigator.language as fallback (not reliable for country)
  // This is a rough approximation
  const lang = navigator.language || (navigator as { userLanguage?: string }).userLanguage;
  if (lang) {
    const parts = lang.split('-');
    if (parts.length > 1) {
      return parts[1].toUpperCase();
    }
  }
  
  return null;
}

/**
 * Check if consent is required based on user's region
 */
function isConsentRequired(
  countryCode: string | null,
  consentRequiredRegions: string[]
): boolean {
  if (!countryCode) return true; // Default to requiring consent if unknown
  return consentRequiredRegions.includes(countryCode.toUpperCase());
}

/**
 * Hook for managing cookie consent
 */
export function useCookieConsent(options: UseCookieConsentOptions = {}) {
  const {
    apiEndpoint = '/api/privacy/cookies',
    storageKey = 'ghxstship_cookie_consent',
    showForReturningUsers = true,
    complianceMode = 'gdpr',
    onConsentChange,
    consentRequiredRegions = CONSENT_REQUIRED_REGIONS,
  } = options;

  const queryClient = useQueryClient();
  
  // Initialize state
  const [sessionId] = useState(() => getOrCreateSessionId(storageKey));
  const [localState, setLocalState] = useState<CookieConsentState | null>(() => 
    loadConsentState(storageKey)
  );
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Detect user country on mount
  useEffect(() => {
    detectUserCountry().then(country => {
      setUserCountry(country);
      setIsInitialized(true);
    });
  }, []);

  // Query for server-side consent state
  const { data: serverState, isLoading: isLoadingServer } = useQuery({
    queryKey: ['cookie-consent', sessionId],
    queryFn: async () => {
      try {
        const response = await fetch(`${apiEndpoint}?session_id=${sessionId}`);
        if (!response.ok) {
          // Return default state on error - don't throw
          return {
            necessary: true,
            functional: false,
            analytics: false,
            advertising: false,
            consented: false,
            consented_at: undefined,
          };
        }
        const result = await response.json();
        return result.data as {
          necessary: boolean;
          functional: boolean;
          analytics: boolean;
          advertising: boolean;
          consented: boolean;
          consented_at?: string;
        };
      } catch {
        // Return default state on network error
        return {
          necessary: true,
          functional: false,
          analytics: false,
          advertising: false,
          consented: false,
          consented_at: undefined,
        };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // Don't retry - use local storage as fallback
  });

  // Mutation for saving consent
  const saveConsentMutation = useMutation({
    mutationFn: async (preferences: CookiePreferences) => {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          ...preferences,
        }),
      });
      if (!response.ok) throw new Error('Failed to save consent');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cookie-consent', sessionId] });
    },
  });

  // Determine effective consent state (local takes precedence)
  const effectiveState = useMemo((): CookieConsentState => {
    if (localState) return localState;
    
    if (serverState?.consented) {
      return {
        hasConsented: true,
        preferences: {
          necessary: serverState.necessary,
          functional: serverState.functional,
          analytics: serverState.analytics,
          advertising: serverState.advertising,
        },
        consentedAt: serverState.consented_at || null,
        sessionId,
      };
    }
    
    return {
      hasConsented: false,
      preferences: DEFAULT_PREFERENCES,
      consentedAt: null,
      sessionId,
    };
  }, [localState, serverState, sessionId]);

  // Check if banner should be shown
  const shouldShowBanner = useMemo(() => {
    if (!isInitialized) return false;
    
    // Don't show if user has already consented
    if (effectiveState.hasConsented && !showForReturningUsers) return false;
    if (effectiveState.hasConsented) return false;
    
    // Check if consent is required for user's region
    return isConsentRequired(userCountry, consentRequiredRegions);
  }, [isInitialized, effectiveState.hasConsented, showForReturningUsers, userCountry, consentRequiredRegions]);

  // Accept all cookies
  const acceptAll = useCallback(() => {
    const preferences: CookiePreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      advertising: true,
    };
    
    const newState: CookieConsentState = {
      hasConsented: true,
      preferences,
      consentedAt: new Date().toISOString(),
      sessionId,
    };
    
    setLocalState(newState);
    saveConsentState(storageKey, newState);
    saveConsentMutation.mutate(preferences);
    onConsentChange?.(preferences);
  }, [sessionId, storageKey, saveConsentMutation, onConsentChange]);

  // Reject all non-essential cookies
  const rejectAll = useCallback(() => {
    const preferences: CookiePreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      advertising: false,
    };
    
    const newState: CookieConsentState = {
      hasConsented: true,
      preferences,
      consentedAt: new Date().toISOString(),
      sessionId,
    };
    
    setLocalState(newState);
    saveConsentState(storageKey, newState);
    saveConsentMutation.mutate(preferences);
    onConsentChange?.(preferences);
  }, [sessionId, storageKey, saveConsentMutation, onConsentChange]);

  // Save custom preferences
  const savePreferences = useCallback((preferences: CookiePreferences) => {
    // Ensure necessary is always true
    const safePreferences = { ...preferences, necessary: true };
    
    const newState: CookieConsentState = {
      hasConsented: true,
      preferences: safePreferences,
      consentedAt: new Date().toISOString(),
      sessionId,
    };
    
    setLocalState(newState);
    saveConsentState(storageKey, newState);
    saveConsentMutation.mutate(safePreferences);
    onConsentChange?.(safePreferences);
  }, [sessionId, storageKey, saveConsentMutation, onConsentChange]);

  // Reset consent (for testing or user request)
  const resetConsent = useCallback(() => {
    setLocalState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
    queryClient.invalidateQueries({ queryKey: ['cookie-consent', sessionId] });
  }, [storageKey, sessionId, queryClient]);

  // Check if a specific cookie category is allowed
  const isCategoryAllowed = useCallback((category: keyof CookiePreferences): boolean => {
    if (category === 'necessary') return true;
    return effectiveState.preferences[category];
  }, [effectiveState.preferences]);

  return {
    // State
    hasConsented: effectiveState.hasConsented,
    preferences: effectiveState.preferences,
    consentedAt: effectiveState.consentedAt,
    sessionId,
    userCountry,
    complianceMode,
    
    // UI state
    shouldShowBanner,
    isLoading: !isInitialized || isLoadingServer,
    isSaving: saveConsentMutation.isPending,
    
    // Actions
    acceptAll,
    rejectAll,
    savePreferences,
    resetConsent,
    
    // Helpers
    isCategoryAllowed,
    isConsentRequired: isConsentRequired(userCountry, consentRequiredRegions),
  };
}

export type UseCookieConsentReturn = ReturnType<typeof useCookieConsent>;

export default useCookieConsent;
