import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface StageElement {
  id: string;
  element_type: 'instrument' | 'microphone' | 'monitor' | 'amp' | 'drum_kit' | 'keyboard' | 'dj_equipment' | 'lighting' | 'riser' | 'barrier' | 'custom';
  name: string;
  label?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color?: string;
  icon?: string;
  notes?: string;
  channel_number?: number;
  input_list_ref?: string;
}

export interface Stageplot {
  id: string;
  booking_id?: string;
  artist_id?: string;
  name: string;
  description?: string;
  stage_dimensions: {
    width: number;
    depth: number;
    unit: 'feet' | 'meters';
  };
  elements: StageElement[];
  input_list: Array<{
    channel: number;
    instrument: string;
    microphone?: string;
    notes?: string;
  }>;
  notes?: string;
  version: number;
  is_template: boolean;
  status: 'draft' | 'submitted' | 'approved' | 'archived';
  submitted_at?: string;
  approved_at?: string;
  approved_by?: string;
  created_by: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateStageplotInput {
  booking_id?: string;
  artist_id?: string;
  name: string;
  description?: string;
  stage_dimensions: Stageplot['stage_dimensions'];
  elements?: StageElement[];
  input_list?: Stageplot['input_list'];
  notes?: string;
  is_template?: boolean;
}

async function fetchStageplots(filters?: { bookingId?: string; artistId?: string; isTemplate?: boolean }): Promise<{
  stageplots: Stageplot[];
  total: number;
}> {
  const params = new URLSearchParams();
  if (filters?.bookingId) params.set('booking_id', filters.bookingId);
  if (filters?.artistId) params.set('artist_id', filters.artistId);
  if (filters?.isTemplate) params.set('is_template', 'true');

  const response = await fetch(`/api/stageplots?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch stageplots');
  }
  return response.json();
}

async function fetchStageplot(id: string): Promise<Stageplot> {
  const response = await fetch(`/api/stageplots/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch stageplot');
  }
  return response.json();
}

async function createStageplot(input: CreateStageplotInput): Promise<Stageplot> {
  const response = await fetch('/api/stageplots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create stageplot');
  }
  return response.json();
}

async function updateStageplot(input: { id: string } & Partial<CreateStageplotInput>): Promise<Stageplot> {
  const { id, ...data } = input;
  const response = await fetch(`/api/stageplots/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update stageplot');
  }
  return response.json();
}

async function deleteStageplot(id: string): Promise<void> {
  const response = await fetch(`/api/stageplots/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete stageplot');
  }
}

async function submitForApproval(id: string): Promise<Stageplot> {
  const response = await fetch(`/api/stageplots/${id}/submit`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to submit stageplot');
  }
  return response.json();
}

async function approveStageplot(id: string, notes?: string): Promise<Stageplot> {
  const response = await fetch(`/api/stageplots/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  });
  if (!response.ok) {
    throw new Error('Failed to approve stageplot');
  }
  return response.json();
}

async function duplicateStageplot(id: string): Promise<Stageplot> {
  const response = await fetch(`/api/stageplots/${id}/duplicate`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to duplicate stageplot');
  }
  return response.json();
}

async function exportStageplot(id: string, format: 'pdf' | 'png' | 'svg'): Promise<{ download_url: string }> {
  const response = await fetch(`/api/stageplots/${id}/export?format=${format}`);
  if (!response.ok) {
    throw new Error('Failed to export stageplot');
  }
  return response.json();
}

export function useStageplots(filters?: { bookingId?: string; artistId?: string; isTemplate?: boolean }) {
  return useQuery({
    queryKey: ['stageplots', filters],
    queryFn: () => fetchStageplots(filters),
  });
}

export function useStageplot(id: string) {
  return useQuery({
    queryKey: ['stageplot', id],
    queryFn: () => fetchStageplot(id),
    enabled: !!id,
  });
}

export function useCreateStageplot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStageplot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stageplots'] });
    },
  });
}

export function useUpdateStageplot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStageplot,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stageplots'] });
      queryClient.invalidateQueries({ queryKey: ['stageplot', data.id] });
    },
  });
}

export function useDeleteStageplot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStageplot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stageplots'] });
    },
  });
}

export function useSubmitStageplot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitForApproval,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stageplots'] });
      queryClient.invalidateQueries({ queryKey: ['stageplot', data.id] });
    },
  });
}

export function useApproveStageplot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => approveStageplot(id, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stageplots'] });
      queryClient.invalidateQueries({ queryKey: ['stageplot', data.id] });
    },
  });
}

export function useDuplicateStageplot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: duplicateStageplot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stageplots'] });
    },
  });
}

export function useExportStageplot() {
  return useMutation({
    mutationFn: ({ id, format }: { id: string; format: 'pdf' | 'png' | 'svg' }) => exportStageplot(id, format),
  });
}
