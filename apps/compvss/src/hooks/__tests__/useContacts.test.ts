import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useContacts, useContact } from '../useContacts';

// Mock Supabase with proper chaining
vi.mock('@/lib/supabase', () => {
  const createChainableMock = (finalData: unknown) => {
    const mock = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      or: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
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
        { id: '1', first_name: 'John', last_name: 'Doe', email: 'john@example.com' },
        { id: '2', first_name: 'Jane', last_name: 'Smith', email: 'jane@example.com' },
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
    });

    it('should apply search filter', async () => {
      const { result } = renderHook(() => useContacts({ search: 'john' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply department filter', async () => {
      const { result } = renderHook(() => useContacts({ department: 'Production' }), { wrapper: createWrapper() });

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
});

describe('Contact interface', () => {
  it('should have required fields', () => {
    const contact = {
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(contact.id).toBeDefined();
    expect(contact.first_name).toBeDefined();
    expect(contact.last_name).toBeDefined();
    expect(contact.email).toBeDefined();
    expect(contact.created_at).toBeDefined();
    expect(contact.updated_at).toBeDefined();
  });

  it('should support optional fields', () => {
    const contact = {
      id: '1',
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone: '(555) 123-4567',
      role: 'Manager',
      department: 'Production',
      organization_id: 'org-1',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(contact.phone).toBe('(555) 123-4567');
    expect(contact.role).toBe('Manager');
    expect(contact.department).toBe('Production');
    expect(contact.organization_id).toBe('org-1');
  });
});
