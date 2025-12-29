'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ClientPortalAccess {
  id: string;
  permissions: string[];
  expires_at?: string;
}

export interface PortalContact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
}

export interface PortalBooking {
  id: string;
  booking_number: string;
  event_name?: string;
  event_date: string;
  status: string;
}

export interface PortalEvent {
  id: string;
  booking_number: string;
  event_name?: string;
  event_type?: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  status: string;
  guest_count_expected?: number;
  venue?: { id: string; name: string; city?: string };
  spaces?: Array<{ id: string; space: { id: string; name: string } }>;
}

export interface PortalDocument {
  id: string;
  name: string;
  status: string;
  created_at: string;
  proposal_number?: string;
  valid_until?: string;
}

export interface PortalInvoice {
  id: string;
  invoice_number: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  amount_paid: number;
  balance_due: number;
  due_date?: string;
  issued_at: string;
  booking?: { id: string; booking_number: string; event_name?: string };
}

interface AuthResponse {
  access: ClientPortalAccess;
  contact: PortalContact;
  booking?: PortalBooking;
}

interface EventsResponse {
  events: PortalEvent[];
}

interface DocumentsResponse {
  documents: {
    proposals: PortalDocument[];
    contracts: PortalDocument[];
  };
}

interface InvoicesResponse {
  invoices: PortalInvoice[];
  summary: {
    total_invoices: number;
    total_due: number;
    overdue: number;
  };
}

export interface InviteInput {
  organization_id: string;
  contact_id: string;
  booking_id?: string;
  permissions?: string[];
  expires_in_days?: number;
  send_email?: boolean;
  custom_message?: string;
}

async function authenticatePortal(token: string): Promise<AuthResponse> {
  const res = await fetch(`/api/client-portal/auth?token=${encodeURIComponent(token)}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Authentication failed');
  }
  return res.json();
}

async function fetchPortalEvents(token: string): Promise<EventsResponse> {
  const res = await fetch(`/api/client-portal/events?token=${encodeURIComponent(token)}`);
  if (!res.ok) throw new Error('Failed to fetch events');
  return res.json();
}

async function fetchPortalDocuments(token: string): Promise<DocumentsResponse> {
  const res = await fetch(`/api/client-portal/documents?token=${encodeURIComponent(token)}`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

async function fetchPortalInvoices(token: string): Promise<InvoicesResponse> {
  const res = await fetch(`/api/client-portal/invoices?token=${encodeURIComponent(token)}`);
  if (!res.ok) throw new Error('Failed to fetch invoices');
  return res.json();
}

export function useClientPortalAuth(token: string | undefined) {
  return useQuery({
    queryKey: ['client-portal-auth', token],
    queryFn: () => authenticatePortal(token!),
    enabled: !!token,
    retry: false,
  });
}

export function useClientPortalEvents(token: string | undefined) {
  return useQuery({
    queryKey: ['client-portal-events', token],
    queryFn: () => fetchPortalEvents(token!),
    enabled: !!token,
  });
}

export function useClientPortalDocuments(token: string | undefined) {
  return useQuery({
    queryKey: ['client-portal-documents', token],
    queryFn: () => fetchPortalDocuments(token!),
    enabled: !!token,
  });
}

export function useClientPortalInvoices(token: string | undefined) {
  return useQuery({
    queryKey: ['client-portal-invoices', token],
    queryFn: () => fetchPortalInvoices(token!),
    enabled: !!token,
  });
}

export function useSendPortalInvite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { email: string }) => {
      const res = await fetch('/api/client-portal/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error('Failed to send invite');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['client-portal-access'] });
    },
  });
}

interface PortalAccessItem {
  id: string;
  client_name: string;
  client_email: string;
  status: 'active' | 'pending' | 'expired';
  last_login?: string;
  events_count: number;
  created_at: string;
}

interface PortalAccessResponse {
  accesses: PortalAccessItem[];
}

async function fetchPortalAccess(): Promise<PortalAccessResponse> {
  const res = await fetch('/api/client-portal/access');
  if (!res.ok) {
    throw new Error('Failed to fetch client portal access');
  }
  return res.json();
}

export function useClientPortalAccess() {
  return useQuery({
    queryKey: ['client-portal-access'],
    queryFn: fetchPortalAccess,
  });
}
