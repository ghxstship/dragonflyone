/**
 * Legend Master Data Hooks
 * Shared hooks for Legend entity CRUD operations across all apps
 * 
 * Architecture: Page → React Query Hook → API Route → Supabase
 * This pattern ensures:
 * - Server handles auth/org extraction from session
 * - Additional server-side validation layer
 * - Consistent with all other pages in the codebase
 * - Easy to add caching, rate limiting, business logic
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  LegendPerson,
  LegendPlace,
  LegendOrganization,
  LegendProduct,
  LegendEvent,
  LegendDocument,
  LegendDepartment,
  LegendTeam,
  LegendPosition,
  LegendRelationship,
  LegendEntityCounts,
  LegendPeopleFilters,
  LegendPlacesFilters,
  CreateLegendPersonPayload,
  UpdateLegendPersonPayload,
  CreateLegendPlacePayload,
  UpdateLegendPlacePayload,
} from '../types/legend';

// API base path
const API_BASE = '/api/legend';

// ============================================================================
// HELPER: API Fetch with error handling
// ============================================================================

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// LEGEND ENTITY COUNTS HOOK
// ============================================================================

export function useLegendEntityCounts() {
  return useQuery({
    queryKey: ['legend', 'counts'],
    queryFn: async (): Promise<LegendEntityCounts> => {
      return apiFetch<LegendEntityCounts>(`${API_BASE}/counts`);
    },
    staleTime: 30000,
  });
}

// ============================================================================
// LEGEND PEOPLE HOOKS
// ============================================================================

interface UseLegendPeopleOptions {
  filters?: LegendPeopleFilters;
  page?: number;
  pageSize?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export function useLegendPeople(options: UseLegendPeopleOptions = {}) {
  const { filters = {}, page = 1, pageSize = 25 } = options;

  return useQuery({
    queryKey: ['legend', 'people', filters, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (filters.search) params.set('search', filters.search);
      if (filters.status) params.set('status', filters.status);
      if (filters.tags?.length) params.set('tags', filters.tags.join(','));

      return apiFetch<PaginatedResponse<LegendPerson>>(`${API_BASE}/people?${params.toString()}`);
    },
  });
}

export function useLegendPerson(personId: string | undefined) {
  return useQuery({
    queryKey: ['legend', 'people', personId],
    queryFn: async () => {
      if (!personId) return null;
      return apiFetch<LegendPerson>(`${API_BASE}/people/${personId}`);
    },
    enabled: !!personId,
  });
}

export function useCreateLegendPerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateLegendPersonPayload) => {
      return apiFetch<LegendPerson>(`${API_BASE}/people`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legend', 'people'] });
      queryClient.invalidateQueries({ queryKey: ['legend', 'counts'] });
    },
  });
}

export function useUpdateLegendPerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateLegendPersonPayload) => {
      const { id, ...updates } = payload;
      return apiFetch<LegendPerson>(`${API_BASE}/people/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['legend', 'people'] });
      queryClient.invalidateQueries({ queryKey: ['legend', 'people', data.id] });
    },
  });
}

export function useDeleteLegendPerson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch<void>(`${API_BASE}/people/${id}`, { method: 'DELETE' });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legend', 'people'] });
      queryClient.invalidateQueries({ queryKey: ['legend', 'counts'] });
    },
  });
}

// ============================================================================
// LEGEND PLACES HOOKS
// ============================================================================

interface UseLegendPlacesOptions {
  filters?: LegendPlacesFilters;
  page?: number;
  pageSize?: number;
}

export function useLegendPlaces(options: UseLegendPlacesOptions = {}) {
  const { filters = {}, page = 1, pageSize = 25 } = options;

  return useQuery({
    queryKey: ['legend', 'places', filters, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (filters.search) params.set('search', filters.search);
      if (filters.status) params.set('status', filters.status);
      if (filters.place_type) params.set('place_type', filters.place_type);
      if (filters.tags?.length) params.set('tags', filters.tags.join(','));

      return apiFetch<PaginatedResponse<LegendPlace>>(`${API_BASE}/places?${params.toString()}`);
    },
  });
}

export function useLegendPlace(placeId: string | undefined) {
  return useQuery({
    queryKey: ['legend', 'places', placeId],
    queryFn: async () => {
      if (!placeId) return null;
      return apiFetch<LegendPlace>(`${API_BASE}/places/${placeId}`);
    },
    enabled: !!placeId,
  });
}

export function useCreateLegendPlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateLegendPlacePayload) => {
      return apiFetch<LegendPlace>(`${API_BASE}/places`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legend', 'places'] });
      queryClient.invalidateQueries({ queryKey: ['legend', 'counts'] });
    },
  });
}

export function useUpdateLegendPlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateLegendPlacePayload) => {
      const { id, ...updates } = payload;
      return apiFetch<LegendPlace>(`${API_BASE}/places/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['legend', 'places'] });
      queryClient.invalidateQueries({ queryKey: ['legend', 'places', data.id] });
    },
  });
}

export function useDeleteLegendPlace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch<void>(`${API_BASE}/places/${id}`, { method: 'DELETE' });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legend', 'places'] });
      queryClient.invalidateQueries({ queryKey: ['legend', 'counts'] });
    },
  });
}

// ============================================================================
// LEGEND DEPARTMENTS HOOKS
// ============================================================================

export function useLegendDepartments() {
  return useQuery({
    queryKey: ['legend', 'departments'],
    queryFn: async () => {
      return apiFetch<{ data: LegendDepartment[] }>(`${API_BASE}/departments`);
    },
  });
}

export function useCreateLegendDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<LegendDepartment>) => {
      return apiFetch<LegendDepartment>(`${API_BASE}/departments`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legend', 'departments'] });
      queryClient.invalidateQueries({ queryKey: ['legend', 'counts'] });
    },
  });
}

export function useDeleteLegendDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch<void>(`${API_BASE}/departments/${id}`, { method: 'DELETE' });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legend', 'departments'] });
      queryClient.invalidateQueries({ queryKey: ['legend', 'counts'] });
    },
  });
}

// ============================================================================
// LEGEND TEAMS HOOKS
// ============================================================================

interface UseLegendTeamsOptions {
  departmentId?: string;
}

export function useLegendTeams(options: UseLegendTeamsOptions = {}) {
  const { departmentId } = options;

  return useQuery({
    queryKey: ['legend', 'teams', departmentId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (departmentId) params.set('department_id', departmentId);
      return apiFetch<{ data: LegendTeam[] }>(`${API_BASE}/teams?${params.toString()}`);
    },
  });
}

export function useCreateLegendTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<LegendTeam>) => {
      return apiFetch<LegendTeam>(`${API_BASE}/teams`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legend', 'teams'] });
      queryClient.invalidateQueries({ queryKey: ['legend', 'counts'] });
    },
  });
}

export function useDeleteLegendTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch<void>(`${API_BASE}/teams/${id}`, { method: 'DELETE' });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legend', 'teams'] });
      queryClient.invalidateQueries({ queryKey: ['legend', 'counts'] });
    },
  });
}

// ============================================================================
// LEGEND POSITIONS HOOKS
// ============================================================================

export function useLegendPositions() {
  return useQuery({
    queryKey: ['legend', 'positions'],
    queryFn: async () => {
      return apiFetch<{ data: LegendPosition[] }>(`${API_BASE}/positions`);
    },
  });
}

export function useCreateLegendPosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<LegendPosition>) => {
      return apiFetch<LegendPosition>(`${API_BASE}/positions`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legend', 'positions'] });
      queryClient.invalidateQueries({ queryKey: ['legend', 'counts'] });
    },
  });
}

export function useDeleteLegendPosition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch<void>(`${API_BASE}/positions/${id}`, { method: 'DELETE' });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legend', 'positions'] });
      queryClient.invalidateQueries({ queryKey: ['legend', 'counts'] });
    },
  });
}

// ============================================================================
// LEGEND RELATIONSHIPS HOOKS
// ============================================================================

interface UseLegendRelationshipsOptions {
  entityType?: string;
  entityId?: string;
}

export function useLegendRelationships(options: UseLegendRelationshipsOptions = {}) {
  const { entityType, entityId } = options;

  return useQuery({
    queryKey: ['legend', 'relationships', entityType, entityId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (entityType) params.set('entity_type', entityType);
      if (entityId) params.set('entity_id', entityId);
      return apiFetch<{ data: LegendRelationship[] }>(`${API_BASE}/relationships?${params.toString()}`);
    },
    enabled: !!(entityType && entityId),
  });
}

export function useCreateLegendRelationship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<LegendRelationship>) => {
      return apiFetch<LegendRelationship>(`${API_BASE}/relationships`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legend', 'relationships'] });
    },
  });
}

export function useDeleteLegendRelationship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch<void>(`${API_BASE}/relationships/${id}`, { method: 'DELETE' });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['legend', 'relationships'] });
    },
  });
}

// ============================================================================
// RE-EXPORTS for convenience
// ============================================================================

export type {
  LegendPerson,
  LegendPlace,
  LegendOrganization,
  LegendProduct,
  LegendEvent,
  LegendDocument,
  LegendDepartment,
  LegendTeam,
  LegendPosition,
  LegendRelationship,
  LegendEntityCounts,
  LegendPeopleFilters,
  LegendPlacesFilters,
  CreateLegendPersonPayload,
  UpdateLegendPersonPayload,
  CreateLegendPlacePayload,
  UpdateLegendPlacePayload,
};
