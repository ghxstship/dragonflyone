import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CapacityConfig {
  id: string;
  space_id: string;
  setup_type: 'theater' | 'classroom' | 'banquet' | 'cocktail' | 'conference' | 'u_shape' | 'hollow_square' | 'custom';
  capacity: number;
  diagram_url?: string;
  notes?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCapacityConfigInput {
  space_id: string;
  setup_type: CapacityConfig['setup_type'];
  capacity: number;
  diagram_url?: string;
  notes?: string;
  is_default?: boolean;
}

export interface UpdateCapacityConfigInput extends Partial<Omit<CreateCapacityConfigInput, 'space_id'>> {
  id: string;
}

async function fetchCapacityConfigs(spaceId: string): Promise<{ configs: CapacityConfig[]; total: number }> {
  const response = await fetch(`/api/spaces/${spaceId}/capacity-configs`);
  if (!response.ok) {
    throw new Error('Failed to fetch capacity configs');
  }
  return response.json();
}

async function createCapacityConfig(input: CreateCapacityConfigInput): Promise<CapacityConfig> {
  const response = await fetch(`/api/spaces/${input.space_id}/capacity-configs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create capacity config');
  }
  return response.json();
}

async function updateCapacityConfig({ id, ...input }: UpdateCapacityConfigInput & { space_id: string }): Promise<CapacityConfig> {
  const response = await fetch(`/api/spaces/${input.space_id}/capacity-configs/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update capacity config');
  }
  return response.json();
}

async function deleteCapacityConfig({ id, spaceId }: { id: string; spaceId: string }): Promise<void> {
  const response = await fetch(`/api/spaces/${spaceId}/capacity-configs/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete capacity config');
  }
}

export function useSpaceCapacityConfigs(spaceId: string) {
  return useQuery({
    queryKey: ['space-capacity-configs', spaceId],
    queryFn: () => fetchCapacityConfigs(spaceId),
    enabled: !!spaceId,
  });
}

export function useCreateCapacityConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCapacityConfig,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['space-capacity-configs', data.space_id] });
      queryClient.invalidateQueries({ queryKey: ['venue-space', data.space_id] });
    },
  });
}

export function useUpdateCapacityConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCapacityConfigInput & { space_id: string }) => updateCapacityConfig(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['space-capacity-configs', data.space_id] });
      queryClient.invalidateQueries({ queryKey: ['venue-space', data.space_id] });
    },
  });
}

export function useDeleteCapacityConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCapacityConfig,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['space-capacity-configs', variables.spaceId] });
      queryClient.invalidateQueries({ queryKey: ['venue-space', variables.spaceId] });
    },
  });
}
