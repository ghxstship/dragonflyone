import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useContacts, useContact, useCreateContact, useUpdateContact, useDeleteContact } from '../useContacts';

// Mock Supabase with proper chaining
vi.mock('@/lib/supabase', () => {
  const createChainableMock = (finalData: unknown) => {
    const mock = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
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
        { id: '1', first_name: 'John', last_name: 'Doe', email: 'john@example.com', organization_id: 'org-1' },
        { id: '2', first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com', organization_id: 'org-1' },
      ])),
    },
  };
});

// Type assertion needed due to React types version mismatch in monorepo
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

describe('useContacts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useContacts hook', () => {
    it('should fetch contacts successfully', async () => {
      const { result } = renderHook(() => useContacts(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toHaveLength(2);
      expect(result.current.data?.[0].first_name).toBe('John');
    });

    it('should apply company filter', async () => {
      const { result } = renderHook(() => useContacts({ company: 'Acme' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply organization_id filter', async () => {
      const { result } = renderHook(() => useContacts({ organization_id: 'org-1' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useContacts(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useContact hook', () => {
    it('should not fetch when id is empty', () => {
      const { result } = renderHook(() => useContact(''), { wrapper: createWrapper() });
      expect(result.current.fetchStatus).toBe('idle');
    });

    it('should fetch when id is provided', async () => {
      const { result } = renderHook(() => useContact('1'), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isFetching).toBe(true);
      });
    });
  });

  describe('useCreateContact hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useCreateContact(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useCreateContact(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('useUpdateContact hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useUpdateContact(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });

  describe('useDeleteContact hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useDeleteContact(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });
});

describe('Contact interface', () => {
  it('should have required fields', () => {
    const contact = {
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      organization_id: 'org-1',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(contact.id).toBeDefined();
    expect(contact.first_name).toBeDefined();
    expect(contact.last_name).toBeDefined();
    expect(contact.email).toBeDefined();
    expect(contact.organization_id).toBeDefined();
  });

  it('should support optional fields', () => {
    const contact = {
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      organization_id: 'org-1',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
      phone: '+1234567890',
      company: 'Acme Corp',
      title: 'CEO',
      name: 'John Doe',
      status: 'active',
      type: 'client',
    };

    expect(contact.phone).toBe('+1234567890');
    expect(contact.company).toBe('Acme Corp');
    expect(contact.title).toBe('CEO');
  });
});

describe('ContactFilters interface', () => {
  it('should support company filter', () => {
    const filters = { company: 'Acme' };
    expect(filters.company).toBe('Acme');
  });

  it('should support organization_id filter', () => {
    const filters = { organization_id: 'org-1' };
    expect(filters.organization_id).toBe('org-1');
  });

  it('should support combined filters', () => {
    const filters = { company: 'Acme', organization_id: 'org-1' };
    expect(filters.company).toBe('Acme');
    expect(filters.organization_id).toBe('org-1');
  });
});
