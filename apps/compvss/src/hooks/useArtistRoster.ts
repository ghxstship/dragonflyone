import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Artist {
  id: string;
  name: string;
  stage_name?: string;
  genre: string[];
  bio?: string;
  photo_url?: string;
  banner_url?: string;
  contact: {
    email?: string;
    phone?: string;
    management_name?: string;
    management_email?: string;
    management_phone?: string;
    booking_agent_name?: string;
    booking_agent_email?: string;
    booking_agent_phone?: string;
  };
  social_links?: {
    website?: string;
    spotify?: string;
    apple_music?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
  };
  technical_requirements?: {
    stage_size_min?: string;
    sound_system_requirements?: string;
    lighting_requirements?: string;
    backline_provided?: string[];
    backline_required?: string[];
    crew_traveling?: number;
  };
  hospitality_rider?: {
    dressing_room?: string;
    catering?: string;
    beverages?: string;
    dietary_restrictions?: string[];
    other_requirements?: string;
  };
  fee_range?: {
    min: number;
    max: number;
    currency: string;
  };
  performance_duration_minutes?: number;
  set_types: string[];
  territories?: string[];
  status: 'active' | 'inactive' | 'pending';
  rating?: number;
  bookings_count: number;
  last_booked_at?: string;
  tags?: string[];
  notes?: string;
  documents?: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface ArtistFilters {
  genre?: string;
  status?: Artist['status'];
  fee_min?: number;
  fee_max?: number;
  territory?: string;
  search?: string;
  tags?: string[];
}

export interface CreateArtistInput {
  name: string;
  stage_name?: string;
  genre: string[];
  bio?: string;
  photo_url?: string;
  contact?: Artist['contact'];
  social_links?: Artist['social_links'];
  technical_requirements?: Artist['technical_requirements'];
  hospitality_rider?: Artist['hospitality_rider'];
  fee_range?: Artist['fee_range'];
  performance_duration_minutes?: number;
  set_types?: string[];
  territories?: string[];
  tags?: string[];
  notes?: string;
}

async function fetchArtists(filters?: ArtistFilters): Promise<{
  artists: Artist[];
  total: number;
  by_genre: Record<string, number>;
  by_status: Record<string, number>;
}> {
  const params = new URLSearchParams();
  if (filters?.genre) params.set('genre', filters.genre);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.fee_min) params.set('fee_min', filters.fee_min.toString());
  if (filters?.fee_max) params.set('fee_max', filters.fee_max.toString());
  if (filters?.territory) params.set('territory', filters.territory);
  if (filters?.search) params.set('q', filters.search);
  if (filters?.tags?.length) params.set('tags', filters.tags.join(','));

  const response = await fetch(`/api/artists?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch artists');
  }
  return response.json();
}

async function fetchArtist(id: string): Promise<Artist & { booking_history: Array<{ id: string; event_name: string; event_date: string; venue_name: string; fee: number }> }> {
  const response = await fetch(`/api/artists/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch artist');
  }
  return response.json();
}

async function createArtist(input: CreateArtistInput): Promise<Artist> {
  const response = await fetch('/api/artists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create artist');
  }
  return response.json();
}

async function updateArtist(input: { id: string } & Partial<CreateArtistInput>): Promise<Artist> {
  const { id, ...data } = input;
  const response = await fetch(`/api/artists/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update artist');
  }
  return response.json();
}

async function deleteArtist(id: string): Promise<void> {
  const response = await fetch(`/api/artists/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete artist');
  }
}

async function checkArtistAvailability(input: { artistId: string; date: string }): Promise<{
  available: boolean;
  conflicts?: Array<{ booking_id: string; event_name: string }>;
}> {
  const response = await fetch(`/api/artists/${input.artistId}/availability?date=${input.date}`);
  if (!response.ok) {
    throw new Error('Failed to check availability');
  }
  return response.json();
}

export function useArtists(filters?: ArtistFilters) {
  return useQuery({
    queryKey: ['artists', filters],
    queryFn: () => fetchArtists(filters),
  });
}

export function useArtist(id: string) {
  return useQuery({
    queryKey: ['artist', id],
    queryFn: () => fetchArtist(id),
    enabled: !!id,
  });
}

export function useCreateArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createArtist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    },
  });
}

export function useUpdateArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateArtist,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
      queryClient.invalidateQueries({ queryKey: ['artist', data.id] });
    },
  });
}

export function useDeleteArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteArtist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    },
  });
}

export function useCheckArtistAvailability() {
  return useMutation({
    mutationFn: checkArtistAvailability,
  });
}
