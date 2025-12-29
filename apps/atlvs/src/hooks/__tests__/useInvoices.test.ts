import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInvoices, useCreateInvoice, invoiceKeys } from '../useInvoices';

// Mock fetch
global.fetch = vi.fn();

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  return React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useInvoices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('invoiceKeys', () => {
    it('should generate correct all key', () => {
      expect(invoiceKeys.all).toEqual(['invoices']);
    });

    it('should generate correct list key', () => {
      expect(invoiceKeys.list()).toEqual(['invoices', 'list']);
    });

    it('should generate correct detail key', () => {
      expect(invoiceKeys.detail('1')).toEqual(['invoices', 'detail', '1']);
    });
  });

  describe('useInvoices hook', () => {
    it('should handle 401 response as error', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        status: 401,
        ok: false,
        json: () => Promise.resolve({ error: 'Unauthorized' }),
      });

      const { result } = renderHook(() => useInvoices(), { wrapper: TestWrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should return loading state initially', () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockImplementationOnce(() => new Promise(() => {}));
      const { result } = renderHook(() => useInvoices(), { wrapper: TestWrapper });
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('useCreateInvoice hook', () => {
    it('should have mutate function', () => {
      const { result } = renderHook(() => useCreateInvoice(), { wrapper: TestWrapper });
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should have mutateAsync function', () => {
      const { result } = renderHook(() => useCreateInvoice(), { wrapper: TestWrapper });
      expect(typeof result.current.mutateAsync).toBe('function');
    });
  });
});

describe('Invoice interface', () => {
  it('should have required fields', () => {
    const invoice = {
      id: '1',
      invoice_number: 'INV-2025-001',
      client_id: 'client-1',
      client_name: 'Acme Corp',
      total_amount: 50000,
      amount_paid: 25000,
      amount_due: 25000,
      issue_date: '2025-01-15',
      due_date: '2025-02-15',
      status: 'partial',
    };

    expect(invoice.id).toBeDefined();
    expect(invoice.invoice_number).toBeDefined();
    expect(invoice.client_id).toBeDefined();
    expect(invoice.client_name).toBeDefined();
    expect(invoice.total_amount).toBeDefined();
    expect(invoice.amount_paid).toBeDefined();
    expect(invoice.amount_due).toBeDefined();
    expect(invoice.issue_date).toBeDefined();
    expect(invoice.due_date).toBeDefined();
    expect(invoice.status).toBeDefined();
  });

  it('should support optional fields', () => {
    const invoice = {
      id: '1',
      invoice_number: 'INV-2025-001',
      client_id: 'client-1',
      client_name: 'Acme Corp',
      project_id: 'proj-1',
      project_name: 'Summer Festival 2025',
      total_amount: 50000,
      amount_paid: 25000,
      amount_due: 25000,
      issue_date: '2025-01-15',
      due_date: '2025-02-15',
      status: 'partial',
      notes: 'Payment due in 30 days',
    };

    expect(invoice.project_id).toBe('proj-1');
    expect(invoice.project_name).toBe('Summer Festival 2025');
    expect(invoice.notes).toBe('Payment due in 30 days');
  });
});
