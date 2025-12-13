'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Opportunity {
  id: string;
  name: string;
  contact_id: string;
  deal_id?: string;
  type: 'new_business' | 'upsell' | 'cross_sell' | 'renewal' | 'expansion';
  stage: 'identified' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  value: number;
  probability: number;
  expected_close_date: string;
  source?: string;
  description?: string;
  products?: string[];
  competitors?: string[];
  owner_id: string;
  next_step?: string;
  next_step_date?: string;
  created_at: string;
  updated_at?: string;
  contact?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  owner?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface OpportunityFilters {
  type?: string;
  stage?: string;
  owner_id?: string;
  contact_id?: string;
}

interface OpportunitiesResponse {
  opportunities: Opportunity[];
  by_stage: Record<string, { count: number; value: number; weighted: number }>;
  summary: {
    total_opportunities: number;
    total_value: number;
    weighted_value: number;
    average_probability: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export function useOpportunities(filters?: OpportunityFilters) {
  return useQuery({
    queryKey: ['opportunities', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('type', 'pipeline');
      if (filters?.stage) params.append('stage', filters.stage);
      if (filters?.owner_id) params.append('owner_id', filters.owner_id);
      if (filters?.contact_id) params.append('contact_id', filters.contact_id);
      if (filters?.type) params.append('opp_type', filters.type);

      const response = await fetch(`/api/opportunities?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch opportunities');
      }
      return response.json() as Promise<OpportunitiesResponse>;
    },
  });
}

export function useOpportunity(id: string) {
  return useQuery({
    queryKey: ['opportunities', id],
    queryFn: async () => {
      const response = await fetch(`/api/opportunities?id=${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch opportunity');
      }
      const data = await response.json();
      return data.opportunity as Opportunity;
    },
    enabled: !!id,
  });
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (opportunity: Omit<Opportunity, 'id' | 'created_at' | 'updated_at' | 'contact' | 'owner'>) => {
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opportunity),
      });
      if (!response.ok) {
        throw new Error('Failed to create opportunity');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Opportunity> & { id: string }) => {
      const response = await fetch(`/api/opportunities`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
      if (!response.ok) {
        throw new Error('Failed to update opportunity');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities', variables.id] });
    },
  });
}

export function useDeleteOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/opportunities`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete opportunity');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}
