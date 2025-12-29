import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface RunOfShow {
  id: string;
  event_id: string;
  entries: ShowEntry[];
  status: 'draft' | 'approved' | 'live' | 'completed';
  version: number;
  created_at: string;
  updated_at: string;
}

export interface ShowEntry {
  id: string;
  time: string;
  duration: number;
  description: string;
  department: string;
  responsible: string;
  notes?: string;
}

export interface ShowCue {
  id: string;
  event_id: string;
  cue_number: string;
  cue_type: 'lighting' | 'audio' | 'video' | 'pyro' | 'stage' | 'other';
  description: string;
  trigger_time?: string;
  status: 'pending' | 'standby' | 'executed' | 'skipped';
  department: string;
  created_at: string;
}

export interface SetTime {
  id: string;
  event_id: string;
  artist_id?: string;
  artist_name: string;
  stage: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

const API_BASE = '/api/shows';

async function fetchRunOfShows(eventId?: string): Promise<RunOfShow[]> {
  const url = eventId ? `${API_BASE}/run-of-show?event_id=${eventId}` : `${API_BASE}/run-of-show`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch run of shows');
  }
  const { data } = await response.json();
  return data || [];
}

async function fetchShowCues(eventId?: string): Promise<ShowCue[]> {
  const url = eventId ? `${API_BASE}/cues?event_id=${eventId}` : `${API_BASE}/cues`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch show cues');
  }
  const { data } = await response.json();
  return data || [];
}

async function fetchSetTimes(eventId?: string): Promise<SetTime[]> {
  const url = eventId ? `${API_BASE}/set-times?event_id=${eventId}` : `${API_BASE}/set-times`;
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch set times');
  }
  const { data } = await response.json();
  return data || [];
}

async function updateCueStatus(id: string, status: ShowCue['status']): Promise<ShowCue> {
  const response = await fetch(`${API_BASE}/cues/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update cue status');
  }
  const { data } = await response.json();
  return data;
}

export function useRunOfShowQuery(eventId?: string) {
  return useQuery({
    queryKey: ['run-of-show', eventId],
    queryFn: () => fetchRunOfShows(eventId),
    staleTime: 30000,
  });
}

export function useShowCuesQuery(eventId?: string) {
  return useQuery({
    queryKey: ['show-cues', eventId],
    queryFn: () => fetchShowCues(eventId),
    staleTime: 30000,
  });
}

export function useSetTimesQuery(eventId?: string) {
  return useQuery({
    queryKey: ['set-times', eventId],
    queryFn: () => fetchSetTimes(eventId),
    staleTime: 30000,
  });
}

export function useUpdateCueStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ShowCue['status'] }) => updateCueStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['show-cues'] });
      queryClient.invalidateQueries({ queryKey: ['master-calendar'] });
    },
  });
}

export function useRunOfShow(eventId?: string) {
  const query = useRunOfShowQuery(eventId);
  return {
    shows: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useShowCues(eventId?: string) {
  const query = useShowCuesQuery(eventId);
  const updateMutation = useUpdateCueStatus();
  return {
    cues: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    updateStatus: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}

export function useSetTimes(eventId?: string) {
  const query = useSetTimesQuery(eventId);
  return {
    setTimes: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
