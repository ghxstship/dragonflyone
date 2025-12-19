'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export type ProposalStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired';

export interface ProposalPricingItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
  category?: string;
  optional?: boolean;
}

export interface ProposalContentSection {
  id: string;
  type: 'text' | 'pricing' | 'images' | 'timeline' | 'terms' | 'signature';
  title?: string;
  content: unknown;
  order_index: number;
}

export interface ProposalContent {
  header?: {
    title?: string;
    subtitle?: string;
    logo_url?: string;
  };
  sections: ProposalContentSection[];
  footer?: {
    company_name?: string;
    contact_info?: string;
  };
}

export interface ProposalBranding {
  primary_color: string;
  secondary_color?: string;
  font_family?: string;
  logo_url?: string;
}

export interface Proposal {
  id: string;
  organization_id: string;
  proposal_number: string;
  booking_id?: string;
  lead_id?: string;
  contact_id: string;
  name: string;
  status: ProposalStatus;
  version: number;
  content: ProposalContent;
  branding: ProposalBranding;
  pricing_items: ProposalPricingItem[];
  subtotal: number;
  tax_amount: number;
  total: number;
  terms?: string;
  valid_until?: string;
  sent_at?: string;
  viewed_at?: string;
  view_count: number;
  responded_at?: string;
  response_notes?: string;
  signature_data?: unknown;
  signed_at?: string;
  public_token?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  contact?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    company?: string;
  };
  booking?: {
    id: string;
    booking_number: string;
    event_name?: string;
    event_date: string;
  };
  lead?: {
    id: string;
    title?: string;
  };
}

export interface CreateProposalInput {
  organization_id: string;
  booking_id?: string;
  lead_id?: string;
  contact_id: string;
  name: string;
  content?: ProposalContent;
  branding?: Partial<ProposalBranding>;
  pricing_items?: ProposalPricingItem[];
  subtotal?: number;
  tax_amount?: number;
  total?: number;
  terms?: string;
  valid_until?: string;
}

export interface UpdateProposalInput {
  name?: string;
  status?: ProposalStatus;
  content?: ProposalContent;
  branding?: Partial<ProposalBranding>;
  pricing_items?: ProposalPricingItem[];
  subtotal?: number;
  tax_amount?: number;
  total?: number;
  terms?: string;
  valid_until?: string;
}

export interface ProposalsFilters {
  organization_id?: string;
  booking_id?: string;
  lead_id?: string;
  contact_id?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

const fetchProposals = async (filters: ProposalsFilters): Promise<{ proposals: Proposal[]; pagination: { limit: number; offset: number; total: number } }> => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  });

  const response = await fetch(`/api/proposals?${params}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch proposals');
  }
  return response.json();
};

const fetchProposal = async (id: string): Promise<Proposal> => {
  const response = await fetch(`/api/proposals/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch proposal');
  }
  const data = await response.json();
  return data.proposal;
};

const createProposal = async (input: CreateProposalInput): Promise<Proposal> => {
  const response = await fetch('/api/proposals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create proposal');
  }
  const data = await response.json();
  return data.proposal;
};

const updateProposal = async ({ id, ...input }: UpdateProposalInput & { id: string }): Promise<Proposal> => {
  const response = await fetch(`/api/proposals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update proposal');
  }
  const data = await response.json();
  return data.proposal;
};

const sendProposal = async (id: string): Promise<Proposal> => {
  const response = await fetch(`/api/proposals/${id}/send`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send proposal');
  }
  const data = await response.json();
  return data.proposal;
};

const deleteProposal = async (id: string): Promise<void> => {
  const response = await fetch(`/api/proposals/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete proposal');
  }
};

export function useProposals(filters: ProposalsFilters = {}) {
  return useQuery({
    queryKey: ['proposals', filters],
    queryFn: () => fetchProposals(filters),
    staleTime: 2 * 60 * 1000,
  });
}

export function useProposal(id: string) {
  return useQuery({
    queryKey: ['proposal', id],
    queryFn: () => fetchProposal(id),
    enabled: !!id,
  });
}

export function useCreateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
}

export function useUpdateProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProposal,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.setQueryData(['proposal', data.id], data);
    },
  });
}

export function useSendProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendProposal,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.setQueryData(['proposal', data.id], data);
    },
  });
}

export function useDeleteProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProposal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
}
