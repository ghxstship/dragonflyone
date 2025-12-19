'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface VendorInvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  category?: string;
}

export interface VendorInvoice {
  id: string;
  organization_id: string;
  vendor_profile_id: string;
  purchase_order_id?: string;
  vendor_order_id?: string;
  invoice_number: string;
  vendor_invoice_number?: string;
  invoice_date: string;
  due_date: string;
  payment_terms?: string;
  line_items: VendorInvoiceLineItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  shipping_amount: number;
  total: number;
  currency: string;
  status: 'draft' | 'pending' | 'approved' | 'disputed' | 'paid' | 'partial' | 'cancelled' | 'void';
  payment_status: 'unpaid' | 'partial' | 'paid' | 'overpaid';
  amount_paid: number;
  amount_due: number;
  approved_by?: string;
  approved_at?: string;
  dispute_reason?: string;
  notes?: string;
  internal_notes?: string;
  attachments?: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
  vendor?: {
    id: string;
    name: string;
    logo_url?: string;
  };
  purchase_order?: {
    id: string;
    po_number: string;
  };
  vendor_order?: {
    id: string;
    order_number: string;
  };
}

export interface VendorPayment {
  id: string;
  organization_id: string;
  vendor_invoice_id: string;
  amount: number;
  payment_method: 'check' | 'ach' | 'wire' | 'credit_card' | 'cash' | 'other';
  reference_number?: string;
  check_number?: string;
  payment_date: string;
  bank_account?: string;
  notes?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'reversed';
  processed_by?: string;
  created_at: string;
}

export interface AgingBuckets {
  current: number;
  days_1_30: number;
  days_31_60: number;
  days_61_90: number;
  over_90: number;
  total_outstanding: number;
}

interface InvoicesResponse {
  invoices: VendorInvoice[];
  aging: AgingBuckets;
}

interface InvoiceFilters {
  organization_id?: string;
  vendor_id?: string;
  status?: string;
  payment_status?: string;
  due_before?: string;
  due_after?: string;
}

interface CreateInvoiceInput {
  vendor_profile_id: string;
  purchase_order_id?: string;
  vendor_order_id?: string;
  vendor_invoice_number?: string;
  invoice_date: string;
  due_date: string;
  payment_terms?: string;
  line_items: VendorInvoiceLineItem[];
  subtotal: number;
  tax_amount?: number;
  discount_amount?: number;
  shipping_amount?: number;
  total: number;
  notes?: string;
}

interface RecordPaymentInput {
  invoice_id: string;
  amount: number;
  payment_method: string;
  reference_number?: string;
  check_number?: string;
  payment_date: string;
  bank_account?: string;
  notes?: string;
}

async function fetchInvoices(filters: InvoiceFilters): Promise<InvoicesResponse> {
  const params = new URLSearchParams();
  if (filters.organization_id) params.set('organization_id', filters.organization_id);
  if (filters.vendor_id) params.set('vendor_id', filters.vendor_id);
  if (filters.status) params.set('status', filters.status);
  if (filters.payment_status) params.set('payment_status', filters.payment_status);
  if (filters.due_before) params.set('due_before', filters.due_before);
  if (filters.due_after) params.set('due_after', filters.due_after);

  const res = await fetch(`/api/vendor-invoices?${params}`);
  if (!res.ok) throw new Error('Failed to fetch invoices');
  return res.json();
}

async function fetchInvoice(id: string): Promise<{ invoice: VendorInvoice }> {
  const res = await fetch(`/api/vendor-invoices/${id}`);
  if (!res.ok) throw new Error('Failed to fetch invoice');
  return res.json();
}

async function createInvoice(input: CreateInvoiceInput): Promise<{ invoice: VendorInvoice }> {
  const res = await fetch('/api/vendor-invoices', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to create invoice');
  return res.json();
}

async function updateInvoice(id: string, input: Partial<CreateInvoiceInput>): Promise<{ invoice: VendorInvoice }> {
  const res = await fetch(`/api/vendor-invoices/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to update invoice');
  return res.json();
}

async function approveInvoice(id: string): Promise<{ invoice: VendorInvoice }> {
  const res = await fetch(`/api/vendor-invoices/${id}/approve`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to approve invoice');
  return res.json();
}

async function recordPayment(input: RecordPaymentInput): Promise<{ payment: VendorPayment }> {
  const res = await fetch(`/api/vendor-invoices/${input.invoice_id}/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to record payment');
  return res.json();
}

async function deleteInvoice(id: string): Promise<void> {
  const res = await fetch(`/api/vendor-invoices/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete invoice');
}

export function useVendorInvoices(filters: InvoiceFilters) {
  return useQuery({
    queryKey: ['vendor-invoices', filters],
    queryFn: () => fetchInvoices(filters),
  });
}

export function useVendorInvoice(id: string | undefined) {
  return useQuery({
    queryKey: ['vendor-invoice', id],
    queryFn: () => fetchInvoice(id!),
    enabled: !!id,
  });
}

export function useCreateVendorInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-invoices'] });
    },
  });
}

export function useUpdateVendorInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Partial<CreateInvoiceInput>) =>
      updateInvoice(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-invoice', variables.id] });
    },
  });
}

export function useApproveVendorInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveInvoice,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-invoice', id] });
    },
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recordPayment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-invoices'] });
      queryClient.invalidateQueries({ queryKey: ['vendor-invoice', variables.invoice_id] });
    },
  });
}

export function useDeleteVendorInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-invoices'] });
    },
  });
}
