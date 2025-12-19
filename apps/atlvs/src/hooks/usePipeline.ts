'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface PipelineDeal {
  id: string;
  deal_number: string;
  name: string;
  client_id?: string;
  client?: { id: string; name: string; email?: string };
  contact_name?: string;
  contact_email?: string;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  value: number;
  probability: number;
  expected_close_date?: string;
  source?: string;
  notes?: string;
  assigned_to?: string;
  assignee?: { id: string; full_name: string; email: string };
  created_at: string;
  updated_at: string;
}

interface PipelineSummary {
  total_deals: number;
  total_value: number;
  weighted_value: number;
  by_stage: Array<{ stage: string; count: number; value: number }>;
}

interface PipelineDealsResponse {
  deals: PipelineDeal[];
  summary: PipelineSummary;
}

export function usePipelineDeals(filters?: { stage?: string; assigned_to?: string }) {
  return useQuery({
    queryKey: ['pipeline-deals', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.stage) params.set('stage', filters.stage);
      if (filters?.assigned_to) params.set('assigned_to', filters.assigned_to);

      const response = await fetch(`/api/pipeline/deals?${params}`);
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Failed to fetch pipeline deals' }));
        throw new Error(error.error || 'Failed to fetch pipeline deals');
      }
      return response.json() as Promise<PipelineDealsResponse>;
    },
  });
}

export function usePipelineDeal(dealId: string) {
  return useQuery({
    queryKey: ['pipeline-deal', dealId],
    queryFn: async () => {
      const response = await fetch(`/api/pipeline/deals/${dealId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch deal');
      }
      return response.json();
    },
    enabled: !!dealId,
  });
}

interface CreateDealInput {
  name: string;
  client_id?: string;
  contact_name?: string;
  contact_email?: string;
  stage?: string;
  value?: number;
  probability?: number;
  expected_close_date?: string;
  source?: string;
  notes?: string;
}

export function useCreateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateDealInput) => {
      const response = await fetch('/api/pipeline/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create deal');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-deals'] });
    },
  });
}

export function useUpdateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dealId, ...input }: Partial<CreateDealInput> & { dealId: string }) => {
      const response = await fetch(`/api/pipeline/deals/${dealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update deal');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-deals'] });
      queryClient.invalidateQueries({ queryKey: ['pipeline-deal', variables.dealId] });
    },
  });
}

export function useMoveDeals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ dealId, stage, reason }: { dealId: string; stage: string; reason?: string }) => {
      const response = await fetch(`/api/pipeline/deals/${dealId}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, reason }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to move deal');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-deals'] });
    },
  });
}

export function useDeleteDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dealId: string) => {
      const response = await fetch(`/api/pipeline/deals/${dealId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete deal');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-deals'] });
    },
  });
}

interface PipelineAnalytics {
  summary: {
    total_deals: number;
    open_deals: number;
    closed_won: number;
    closed_lost: number;
    win_rate: number;
    pipeline_value: number;
    weighted_pipeline: number;
    revenue_this_period: number;
    deals_created_this_period: number;
    avg_deal_size: number;
  };
  stage_distribution: Array<{ stage: string; count: number; value: number }>;
  period: string;
}

export function usePipelineAnalytics(period: string = '30d') {
  return useQuery({
    queryKey: ['pipeline-analytics', period],
    queryFn: async () => {
      const response = await fetch(`/api/pipeline/analytics?period=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      return response.json() as Promise<PipelineAnalytics>;
    },
  });
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  probability: number;
  order_index: number;
  is_active: boolean;
}

export function usePipelineStages() {
  return useQuery({
    queryKey: ['pipeline-stages'],
    queryFn: async () => {
      const response = await fetch('/api/pipeline-stages');
      if (!response.ok) {
        return { stages: [] };
      }
      return response.json() as Promise<{ stages: PipelineStage[] }>;
    },
  });
}

export function useCreatePipelineStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: Omit<PipelineStage, 'id'>) => {
      const response = await fetch('/api/pipeline-stages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create stage');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-stages'] });
    },
  });
}

export function useUpdatePipelineStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ stageId, ...input }: Partial<PipelineStage> & { stageId: string }) => {
      const response = await fetch(`/api/pipeline-stages/${stageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update stage');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-stages'] });
    },
  });
}

export function useDeletePipelineStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stageId: string) => {
      const response = await fetch(`/api/pipeline-stages/${stageId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete stage');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-stages'] });
    },
  });
}
