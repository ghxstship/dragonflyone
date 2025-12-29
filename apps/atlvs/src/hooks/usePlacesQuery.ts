'use client';

/**
 * Unified Places Query Hook
 * Single source of truth for all location types: venues, warehouses, stages, zones, rooms, spaces
 * Maps to legend_places table
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createBrowserClient } from '@supabase/ssr';

const createClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type PlaceType = 'all' | 'venue' | 'warehouse' | 'stage' | 'zone' | 'room' | 'space' | 'site' | 'office' | 'other';

export interface Place {
  id: string;
  organization_id: string;
  name: string;
  code: string | null;
  description: string | null;
  place_type: PlaceType;
  parent_place_id: string | null;
  capacity: number | null;
  square_footage: number | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string;
  status: 'active' | 'inactive' | 'pending' | 'archived' | 'draft';
  tags: string[];
  image_url: string | null;
  floor_plan_url: string | null;
  metadata: Record<string, unknown>;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  parent_place?: {
    id: string;
    name: string;
  } | null;
}

export interface PlacesFilters {
  search?: string;
  type?: PlaceType;
  status?: string;
  tags?: string[];
  parentId?: string;
}

export const placesKeys = {
  all: ['places'] as const,
  lists: () => [...placesKeys.all, 'list'] as const,
  list: (filters: PlacesFilters) => [...placesKeys.lists(), filters] as const,
  details: () => [...placesKeys.all, 'detail'] as const,
  detail: (id: string) => [...placesKeys.details(), id] as const,
};

async function fetchPlaces(filters: PlacesFilters): Promise<Place[]> {
  const supabase = createClient();
  
  let query = supabase
    .from('legend_places')
    .select(`
      *,
      parent_place:legend_places!parent_place_id(id, name)
    `)
    .order('name', { ascending: true });

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.type && filters.type !== 'all') {
    query = query.eq('place_type', filters.type);
  }

  if (filters.parentId) {
    query = query.eq('parent_place_id', filters.parentId);
  }

  if (filters.tags && filters.tags.length > 0) {
    query = query.contains('tags', filters.tags);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  let places = (data || []) as Place[];

  // Client-side search filtering
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    places = places.filter(place => 
      place.name.toLowerCase().includes(searchLower) ||
      (place.code && place.code.toLowerCase().includes(searchLower)) ||
      (place.description && place.description.toLowerCase().includes(searchLower))
    );
  }

  return places;
}

async function fetchPlace(id: string): Promise<Place> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('legend_places')
    .select(`
      *,
      parent_place:legend_places!parent_place_id(id, name)
    `)
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Place;
}

interface CreatePlaceInput {
  organization_id: string;
  name: string;
  code?: string;
  description?: string;
  place_type: PlaceType;
  parent_place_id?: string;
  capacity?: number;
  square_footage?: number;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  status?: Place['status'];
  tags?: string[];
  image_url?: string;
  floor_plan_url?: string;
  notes?: string;
}

async function createPlace(input: CreatePlaceInput): Promise<Place> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('legend_places')
    .insert(input)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Place;
}

interface UpdatePlaceInput {
  id: string;
  name?: string;
  code?: string;
  description?: string;
  place_type?: PlaceType;
  parent_place_id?: string | null;
  capacity?: number;
  square_footage?: number;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  status?: Place['status'];
  tags?: string[];
  image_url?: string;
  floor_plan_url?: string;
  notes?: string;
}

async function updatePlace(input: UpdatePlaceInput): Promise<Place> {
  const supabase = createClient();
  
  const { id, ...updates } = input;
  
  const { data, error } = await supabase
    .from('legend_places')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Place;
}

async function deletePlace(id: string): Promise<void> {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('legend_places')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

// ============================================================================
// HOOKS
// ============================================================================

export function usePlacesQuery(filters: PlacesFilters = {}) {
  return useQuery({
    queryKey: placesKeys.list(filters),
    queryFn: () => fetchPlaces(filters),
    staleTime: 60000,
  });
}

export function usePlaceQuery(id: string) {
  return useQuery({
    queryKey: placesKeys.detail(id),
    queryFn: () => fetchPlace(id),
    enabled: !!id,
  });
}

export function useCreatePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: placesKeys.all });
    },
  });
}

export function useUpdatePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePlace,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: placesKeys.all });
      queryClient.setQueryData(placesKeys.detail(data.id), data);
    },
  });
}

export function useDeletePlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePlace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: placesKeys.all });
    },
  });
}

export function usePlacesStats(filters: PlacesFilters = {}) {
  const { data: places = [] } = usePlacesQuery(filters);
  
  return {
    total: places.length,
    active: places.filter(p => p.status === 'active').length,
    inactive: places.filter(p => p.status === 'inactive').length,
    pending: places.filter(p => p.status === 'pending').length,
    byType: {
      venue: places.filter(p => p.place_type === 'venue').length,
      warehouse: places.filter(p => p.place_type === 'warehouse').length,
      stage: places.filter(p => p.place_type === 'stage').length,
      zone: places.filter(p => p.place_type === 'zone').length,
      room: places.filter(p => p.place_type === 'room').length,
      space: places.filter(p => p.place_type === 'space').length,
      site: places.filter(p => p.place_type === 'site').length,
      office: places.filter(p => p.place_type === 'office').length,
      other: places.filter(p => p.place_type === 'other').length,
    },
  };
}
