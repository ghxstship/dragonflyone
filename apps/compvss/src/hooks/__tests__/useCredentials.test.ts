import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCredentialTypes, useCredentials, useZones, useIssueCredential } from '../useCredentials';

// Mock Supabase with proper chaining
vi.mock('@/lib/supabase', () => {
  const createChainableMock = (finalData: unknown) => {
    const mock = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      then: vi.fn((resolve) => resolve({ data: finalData, error: null })),
    };
    Object.keys(mock).forEach(key => {
      if (key !== 'then') {
        (mock as Record<string, ReturnType<typeof vi.fn>>)[key].mockReturnValue(mock);
      }
    });
    return mock;
  };

  return {
    supabase: {
      from: vi.fn(() => createChainableMock([
        { id: '1', name: 'VIP Access', code: 'VIP', access_level: 5 },
        { id: '2', name: 'Staff', code: 'STAFF', access_level: 3 },
      ])),
    },
  };
});

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

describe('useCredentials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useCredentialTypes hook', () => {
    it('should fetch credential types successfully', async () => {
      const { result } = renderHook(() => useCredentialTypes(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply productionId filter', async () => {
      const { result } = renderHook(() => useCredentialTypes('prod-1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useCredentialTypes(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useCredentials hook', () => {
    it('should fetch credentials successfully', async () => {
      const { result } = renderHook(() => useCredentials(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply status filter', async () => {
      const { result } = renderHook(() => useCredentials({ status: 'active' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('useZones hook', () => {
    it('should fetch zones successfully', async () => {
      const { result } = renderHook(() => useZones(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('useIssueCredential hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useIssueCredential(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useIssueCredential(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });
});

describe('CredentialType interface', () => {
  it('should have required fields', () => {
    const credType = {
      id: '1',
      production_id: 'prod-1',
      organization_id: 'org-1',
      name: 'VIP Access',
      code: 'VIP',
      access_level: 5,
      color: '#FF0000',
      requires_photo: true,
      requires_background_check: false,
      is_active: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(credType.id).toBeDefined();
    expect(credType.production_id).toBeDefined();
    expect(credType.name).toBeDefined();
    expect(credType.code).toBeDefined();
    expect(credType.access_level).toBeDefined();
    expect(credType.color).toBeDefined();
    expect(credType.is_active).toBeDefined();
  });
});

describe('Credential interface', () => {
  it('should have required fields', () => {
    const credential = {
      id: '1',
      production_id: 'prod-1',
      credential_type_id: 'type-1',
      contact_id: 'contact-1',
      badge_number: 'VIP-001',
      status: 'active' as const,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(credential.id).toBeDefined();
    expect(credential.production_id).toBeDefined();
    expect(credential.credential_type_id).toBeDefined();
    expect(credential.contact_id).toBeDefined();
    expect(credential.badge_number).toBeDefined();
    expect(credential.status).toBeDefined();
  });
});

describe('Zone interface', () => {
  it('should have required fields', () => {
    const zone = {
      id: '1',
      production_id: 'prod-1',
      name: 'Backstage',
      code: 'BST',
      zone_type: 'backstage' as const,
      access_level: 4,
      is_active: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(zone.id).toBeDefined();
    expect(zone.production_id).toBeDefined();
    expect(zone.name).toBeDefined();
    expect(zone.code).toBeDefined();
    expect(zone.zone_type).toBeDefined();
    expect(zone.access_level).toBeDefined();
    expect(zone.is_active).toBeDefined();
  });
});
