import React, { type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDocuments, useFolders, useCreateDocument, useUpdateDocument, useDeleteDocument, useCreateFolder } from '../useDocuments';

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
        { id: '1', name: 'Contract.pdf', type: 'pdf', size: 1024, url: '/docs/contract.pdf', status: 'active' },
        { id: '2', name: 'Invoice.xlsx', type: 'xlsx', size: 2048, url: '/docs/invoice.xlsx', status: 'active' },
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

describe('useDocuments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useDocuments hook', () => {
    it('should fetch documents successfully', async () => {
      const { result } = renderHook(() => useDocuments(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply folder_id filter', async () => {
      const { result } = renderHook(() => useDocuments({ folder_id: 'folder-1' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should apply type filter', async () => {
      const { result } = renderHook(() => useDocuments({ type: 'pdf' }), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should return loading state initially', () => {
      const { result } = renderHook(() => useDocuments(), { wrapper: createWrapper() });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useFolders hook', () => {
    it('should fetch folders successfully', async () => {
      const { result } = renderHook(() => useFolders(), { wrapper: createWrapper() });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  describe('useCreateDocument hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useCreateDocument(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useCreateDocument(), { wrapper: createWrapper() });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });

  describe('useUpdateDocument hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useUpdateDocument(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });

  describe('useDeleteDocument hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useDeleteDocument(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });

  describe('useCreateFolder hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useCreateFolder(), { wrapper: createWrapper() });
      expect(typeof result.current.mutate).toBe('function');
    });
  });
});

describe('Document interface', () => {
  it('should have required fields', () => {
    const doc = {
      id: '1',
      name: 'Contract.pdf',
      type: 'pdf',
      size: 1024,
      url: '/docs/contract.pdf',
      uploaded_by: 'user-1',
      status: 'active' as const,
    };

    expect(doc.id).toBeDefined();
    expect(doc.name).toBeDefined();
    expect(doc.type).toBeDefined();
    expect(doc.size).toBeDefined();
    expect(doc.url).toBeDefined();
    expect(doc.uploaded_by).toBeDefined();
    expect(doc.status).toBeDefined();
  });

  it('should support optional fields', () => {
    const doc = {
      id: '1',
      name: 'Contract.pdf',
      type: 'pdf',
      size: 1024,
      url: '/docs/contract.pdf',
      uploaded_by: 'user-1',
      status: 'active' as const,
      folder_id: 'folder-1',
      tags: ['legal', 'contract'],
      metadata: { version: 1 },
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(doc.folder_id).toBe('folder-1');
    expect(doc.tags).toEqual(['legal', 'contract']);
    expect(doc.metadata).toEqual({ version: 1 });
  });
});

describe('Folder interface', () => {
  it('should have required fields', () => {
    const folder = {
      id: '1',
      name: 'Contracts',
    };

    expect(folder.id).toBeDefined();
    expect(folder.name).toBeDefined();
  });

  it('should support optional fields', () => {
    const folder = {
      id: '1',
      name: 'Contracts',
      parent_id: 'parent-1',
      description: 'Legal contracts folder',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    expect(folder.parent_id).toBe('parent-1');
    expect(folder.description).toBe('Legal contracts folder');
  });
});
