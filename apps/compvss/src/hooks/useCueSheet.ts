import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Cue {
  id: string;
  cue_number: string;
  name: string;
  description?: string;
  cue_type: 'lighting' | 'sound' | 'video' | 'pyro' | 'automation' | 'general';
  department: string;
  trigger_time?: string;
  trigger_type: 'time' | 'action' | 'manual' | 'follow';
  follow_cue_id?: string;
  follow_delay_seconds?: number;
  duration_seconds?: number;
  notes?: string;
  assigned_to?: string;
  status: 'pending' | 'ready' | 'standby' | 'go' | 'complete' | 'skipped';
  executed_at?: string;
}

export interface CueSheet {
  id: string;
  booking_id: string;
  event_name: string;
  event_date: string;
  name: string;
  description?: string;
  cues: Cue[];
  departments: string[];
  show_start_time: string;
  show_end_time: string;
  version: number;
  status: 'draft' | 'rehearsal' | 'live' | 'archived';
  notes?: string;
  created_by: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCueInput {
  cue_number: string;
  name: string;
  description?: string;
  cue_type: Cue['cue_type'];
  department: string;
  trigger_time?: string;
  trigger_type: Cue['trigger_type'];
  follow_cue_id?: string;
  follow_delay_seconds?: number;
  duration_seconds?: number;
  notes?: string;
  assigned_to?: string;
}

async function fetchCueSheet(bookingId: string): Promise<CueSheet> {
  const response = await fetch(`/api/cue-sheets/${bookingId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch cue sheet');
  }
  return response.json();
}

async function createCueSheet(input: { bookingId: string; name: string; showStartTime: string; showEndTime: string }): Promise<CueSheet> {
  const response = await fetch('/api/cue-sheets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create cue sheet');
  }
  return response.json();
}

async function addCue(input: { cueSheetId: string; cue: CreateCueInput }): Promise<CueSheet> {
  const response = await fetch(`/api/cue-sheets/${input.cueSheetId}/cues`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input.cue),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add cue');
  }
  return response.json();
}

async function updateCue(input: { cueSheetId: string; cueId: string; updates: Partial<CreateCueInput> }): Promise<CueSheet> {
  const response = await fetch(`/api/cue-sheets/${input.cueSheetId}/cues/${input.cueId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input.updates),
  });
  if (!response.ok) {
    throw new Error('Failed to update cue');
  }
  return response.json();
}

async function deleteCue(input: { cueSheetId: string; cueId: string }): Promise<CueSheet> {
  const response = await fetch(`/api/cue-sheets/${input.cueSheetId}/cues/${input.cueId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete cue');
  }
  return response.json();
}

async function reorderCues(input: { cueSheetId: string; cueIds: string[] }): Promise<CueSheet> {
  const response = await fetch(`/api/cue-sheets/${input.cueSheetId}/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cue_ids: input.cueIds }),
  });
  if (!response.ok) {
    throw new Error('Failed to reorder cues');
  }
  return response.json();
}

async function executeCue(input: { cueSheetId: string; cueId: string }): Promise<Cue> {
  const response = await fetch(`/api/cue-sheets/${input.cueSheetId}/cues/${input.cueId}/execute`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to execute cue');
  }
  return response.json();
}

async function setLiveMode(cueSheetId: string, isLive: boolean): Promise<CueSheet> {
  const response = await fetch(`/api/cue-sheets/${cueSheetId}/mode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: isLive ? 'live' : 'rehearsal' }),
  });
  if (!response.ok) {
    throw new Error('Failed to set mode');
  }
  return response.json();
}

export function useCueSheet(bookingId: string) {
  return useQuery({
    queryKey: ['cue-sheet', bookingId],
    queryFn: () => fetchCueSheet(bookingId),
    enabled: !!bookingId,
  });
}

export function useCreateCueSheet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCueSheet,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cue-sheet', data.booking_id] });
    },
  });
}

export function useAddCue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCue,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cue-sheet', data.booking_id] });
    },
  });
}

export function useUpdateCue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCue,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cue-sheet', data.booking_id] });
    },
  });
}

export function useDeleteCue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCue,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cue-sheet', data.booking_id] });
    },
  });
}

export function useReorderCues() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderCues,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cue-sheet', data.booking_id] });
    },
  });
}

export function useExecuteCue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: executeCue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cue-sheet'] });
    },
  });
}

export function useSetCueSheetMode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cueSheetId, isLive }: { cueSheetId: string; isLive: boolean }) => setLiveMode(cueSheetId, isLive),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cue-sheet', data.booking_id] });
    },
  });
}
