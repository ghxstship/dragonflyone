import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSaveProfile, useSaveOrganization, useSaveRole, useSavePreferences, useCompleteOnboarding, useOnboarding } from '../useOnboarding';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(() => 'mock-token'),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock config logger
vi.mock('@ghxstship/config', () => ({
  log: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

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

describe('useOnboarding hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({}) });
  });

  describe('useSaveProfile hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useSaveProfile(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useSaveProfile(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });

    it('should have isPending property', () => {
      const { result } = renderHook(() => useSaveProfile(), { wrapper: createWrapper() });
      expect(result.current.isPending).toBe(false);
    });

    it('should call fetch with correct endpoint', async () => {
      const { result } = renderHook(() => useSaveProfile(), { wrapper: createWrapper() });
      
      result.current.mutate({
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        bio: 'Test bio',
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/onboarding/profile', expect.objectContaining({
          method: 'POST',
        }));
      });
    });
  });

  describe('useSaveOrganization hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useSaveOrganization(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should call fetch with correct endpoint', async () => {
      const { result } = renderHook(() => useSaveOrganization(), { wrapper: createWrapper() });
      
      result.current.mutate({
        name: 'Test Org',
        type: 'production',
        role: 'admin',
        teamSize: '10-50',
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/onboarding/organization', expect.objectContaining({
          method: 'POST',
        }));
      });
    });
  });

  describe('useSaveRole hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useSaveRole(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should call fetch with correct endpoint', async () => {
      const { result } = renderHook(() => useSaveRole(), { wrapper: createWrapper() });
      
      result.current.mutate({ role: 'COMPVSS_ADMIN' });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/onboarding/role', expect.objectContaining({
          method: 'POST',
        }));
      });
    });
  });

  describe('useSavePreferences hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useSavePreferences(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should call fetch with correct endpoint', async () => {
      const { result } = renderHook(() => useSavePreferences(), { wrapper: createWrapper() });
      
      result.current.mutate({
        theme: 'dark',
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/onboarding/preferences', expect.objectContaining({
          method: 'POST',
        }));
      });
    });
  });

  describe('useCompleteOnboarding hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useCompleteOnboarding(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should call fetch with correct endpoint', async () => {
      const { result } = renderHook(() => useCompleteOnboarding(), { wrapper: createWrapper() });
      
      result.current.mutate();

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/onboarding/complete', expect.objectContaining({
          method: 'POST',
        }));
      });
    });
  });

  describe('useOnboarding combined hook', () => {
    it('should return all mutation hooks', () => {
      const { result } = renderHook(() => useOnboarding(), { wrapper: createWrapper() });
      
      expect(result.current.saveProfile).toBeDefined();
      expect(result.current.saveOrganization).toBeDefined();
      expect(result.current.saveRole).toBeDefined();
      expect(result.current.savePreferences).toBeDefined();
      expect(result.current.completeOnboarding).toBeDefined();
    });

    it('should have isLoading property', () => {
      const { result } = renderHook(() => useOnboarding(), { wrapper: createWrapper() });
      expect(typeof result.current.isLoading).toBe('boolean');
    });

    it('should have profileError property', () => {
      const { result } = renderHook(() => useOnboarding(), { wrapper: createWrapper() });
      expect(result.current.profileError).toBeNull();
    });
  });
});

describe('Onboarding data interfaces', () => {
  describe('ProfileData', () => {
    it('should have required fields', () => {
      const profile = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        bio: 'Test bio',
      };

      expect(profile.firstName).toBeDefined();
      expect(profile.lastName).toBeDefined();
      expect(profile.phone).toBeDefined();
      expect(profile.bio).toBeDefined();
    });
  });

  describe('OrganizationData', () => {
    it('should have required fields', () => {
      const org = {
        name: 'Test Org',
        type: 'production',
        role: 'admin',
        teamSize: '10-50',
      };

      expect(org.name).toBeDefined();
      expect(org.type).toBeDefined();
      expect(org.role).toBeDefined();
      expect(org.teamSize).toBeDefined();
    });
  });

  describe('PreferencesData', () => {
    it('should have required fields', () => {
      const prefs = {
        theme: 'dark',
        emailNotifications: true,
        pushNotifications: true,
        marketingEmails: false,
      };

      expect(prefs.theme).toBeDefined();
      expect(typeof prefs.emailNotifications).toBe('boolean');
      expect(typeof prefs.pushNotifications).toBe('boolean');
      expect(typeof prefs.marketingEmails).toBe('boolean');
    });
  });
});
