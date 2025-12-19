import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface SetlistSong {
  id: string;
  position: number;
  title: string;
  artist?: string;
  duration_seconds: number;
  key?: string;
  bpm?: number;
  notes?: string;
  transition_type?: 'stop' | 'segue' | 'medley';
  lighting_cue?: string;
  video_cue?: string;
}

export interface Setlist {
  id: string;
  booking_id?: string;
  artist_id?: string;
  name: string;
  description?: string;
  songs: SetlistSong[];
  total_duration_seconds: number;
  set_number?: number;
  encore: boolean;
  status: 'draft' | 'submitted' | 'approved' | 'performed';
  performed_at?: string;
  actual_songs?: Array<{
    song_id: string;
    performed: boolean;
    actual_duration_seconds?: number;
    notes?: string;
  }>;
  notes?: string;
  created_by: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSetlistInput {
  booking_id?: string;
  artist_id?: string;
  name: string;
  description?: string;
  songs?: Array<Omit<SetlistSong, 'id' | 'position'>>;
  set_number?: number;
  encore?: boolean;
  notes?: string;
}

async function fetchSetlists(filters?: { bookingId?: string; artistId?: string }): Promise<{
  setlists: Setlist[];
  total: number;
}> {
  const params = new URLSearchParams();
  if (filters?.bookingId) params.set('booking_id', filters.bookingId);
  if (filters?.artistId) params.set('artist_id', filters.artistId);

  const response = await fetch(`/api/setlists?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch setlists');
  }
  return response.json();
}

async function fetchSetlist(id: string): Promise<Setlist> {
  const response = await fetch(`/api/setlists/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch setlist');
  }
  return response.json();
}

async function createSetlist(input: CreateSetlistInput): Promise<Setlist> {
  const response = await fetch('/api/setlists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create setlist');
  }
  return response.json();
}

async function updateSetlist(input: { id: string } & Partial<CreateSetlistInput>): Promise<Setlist> {
  const { id, ...data } = input;
  const response = await fetch(`/api/setlists/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update setlist');
  }
  return response.json();
}

async function deleteSetlist(id: string): Promise<void> {
  const response = await fetch(`/api/setlists/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete setlist');
  }
}

async function addSong(input: { setlistId: string; song: Omit<SetlistSong, 'id' | 'position'> }): Promise<Setlist> {
  const response = await fetch(`/api/setlists/${input.setlistId}/songs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input.song),
  });
  if (!response.ok) {
    throw new Error('Failed to add song');
  }
  return response.json();
}

async function reorderSongs(input: { setlistId: string; songIds: string[] }): Promise<Setlist> {
  const response = await fetch(`/api/setlists/${input.setlistId}/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ song_ids: input.songIds }),
  });
  if (!response.ok) {
    throw new Error('Failed to reorder songs');
  }
  return response.json();
}

async function removeSong(input: { setlistId: string; songId: string }): Promise<Setlist> {
  const response = await fetch(`/api/setlists/${input.setlistId}/songs/${input.songId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to remove song');
  }
  return response.json();
}

async function duplicateSetlist(id: string): Promise<Setlist> {
  const response = await fetch(`/api/setlists/${id}/duplicate`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to duplicate setlist');
  }
  return response.json();
}

export function useSetlists(filters?: { bookingId?: string; artistId?: string }) {
  return useQuery({
    queryKey: ['setlists', filters],
    queryFn: () => fetchSetlists(filters),
  });
}

export function useSetlist(id: string) {
  return useQuery({
    queryKey: ['setlist', id],
    queryFn: () => fetchSetlist(id),
    enabled: !!id,
  });
}

export function useCreateSetlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSetlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setlists'] });
    },
  });
}

export function useUpdateSetlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSetlist,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['setlists'] });
      queryClient.invalidateQueries({ queryKey: ['setlist', data.id] });
    },
  });
}

export function useDeleteSetlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSetlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setlists'] });
    },
  });
}

export function useAddSongToSetlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addSong,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['setlist', data.id] });
    },
  });
}

export function useReorderSetlistSongs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderSongs,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['setlist', data.id] });
    },
  });
}

export function useRemoveSongFromSetlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeSong,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['setlist', data.id] });
    },
  });
}

export function useDuplicateSetlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: duplicateSetlist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setlists'] });
    },
  });
}
