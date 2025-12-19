'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface AutoAction {
  action_type: 'send_email' | 'create_task' | 'notify_user' | 'update_field';
  config: Record<string, unknown>;
}

export interface PipelineStage {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  order_index: number;
  probability: number;
  color: string;
  is_won: boolean;
  is_lost: boolean;
  auto_actions: AutoAction[];
  created_at: string;
  updated_at: string;
  leads?: { count: number }[];
}

export interface CreatePipelineStageInput {
  organization_id: string;
  name: string;
  description?: string;
  probability?: number;
  color?: string;
  is_won?: boolean;
  is_lost?: boolean;
  auto_actions?: AutoAction[];
}

export interface UpdatePipelineStageInput {
  name?: string;
  description?: string;
  probability?: number;
  color?: string;
  is_won?: boolean;
  is_lost?: boolean;
  auto_actions?: AutoAction[];
}

export interface ReorderStagesInput {
  stages: { id: string; order_index: number }[];
}

const fetchPipelineStages = async (organizationId?: string): Promise<PipelineStage[]> => {
  const params = new URLSearchParams();
  if (organizationId) params.set('organization_id', organizationId);

  const response = await fetch(`/api/pipeline-stages?${params}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch pipeline stages');
  }
  const data = await response.json();
  return data.stages;
};

const fetchPipelineStage = async (id: string): Promise<PipelineStage> => {
  const response = await fetch(`/api/pipeline-stages/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch pipeline stage');
  }
  const data = await response.json();
  return data.stage;
};

const createPipelineStage = async (input: CreatePipelineStageInput): Promise<PipelineStage> => {
  const response = await fetch('/api/pipeline-stages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create pipeline stage');
  }
  const data = await response.json();
  return data.stage;
};

const updatePipelineStage = async ({ id, ...input }: UpdatePipelineStageInput & { id: string }): Promise<PipelineStage> => {
  const response = await fetch(`/api/pipeline-stages/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update pipeline stage');
  }
  const data = await response.json();
  return data.stage;
};

const reorderPipelineStages = async (input: ReorderStagesInput): Promise<void> => {
  const response = await fetch('/api/pipeline-stages', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reorder pipeline stages');
  }
};

const deletePipelineStage = async (id: string): Promise<void> => {
  const response = await fetch(`/api/pipeline-stages/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete pipeline stage');
  }
};

export function usePipelineStages(organizationId?: string) {
  return useQuery({
    queryKey: ['pipeline-stages', organizationId],
    queryFn: () => fetchPipelineStages(organizationId),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePipelineStage(id: string) {
  return useQuery({
    queryKey: ['pipeline-stage', id],
    queryFn: () => fetchPipelineStage(id),
    enabled: !!id,
  });
}

export function useCreatePipelineStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPipelineStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-stages'] });
    },
  });
}

export function useUpdatePipelineStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePipelineStage,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-stages'] });
      queryClient.setQueryData(['pipeline-stage', data.id], data);
    },
  });
}

export function useReorderPipelineStages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderPipelineStages,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-stages'] });
    },
  });
}

export function useDeletePipelineStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePipelineStage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline-stages'] });
    },
  });
}
