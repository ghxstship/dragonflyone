/**
 * Chronicle Hooks - Normalized Activities (Transactions)
 * Shared hooks for Chronicle operations across all apps
 * 
 * Architecture: Page → React Query Hook → API Route → Supabase
 * 
 * Note: Chronicle entries are immutable (append-only).
 * Only SELECT and INSERT operations are supported.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  ChronicleEntry,
  ChronicleFilters,
  ChronicleCounts,
  ChronicleStats,
  ChronicleDailyAggregate,
  ActivityFeedItem,
  ActivityFeedResponse,
  CreateChronicleEntryPayload,
  CreateTransactionPayload,
  CreateTimesheetEntryPayload,
  CreateMovementPayload,
} from '../types/chronicle';

// API base path
const API_BASE = '/api/chronicle';

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
// CHRONICLE COUNTS & STATS HOOKS
// ============================================================================

export function useChronicleCounts() {
  return useQuery({
    queryKey: ['chronicle', 'counts'],
    queryFn: async (): Promise<ChronicleCounts> => {
      return apiFetch<ChronicleCounts>(`${API_BASE}/counts`);
    },
    staleTime: 30000,
  });
}

export function useChronicleStats(dateFrom?: string, dateTo?: string) {
  return useQuery({
    queryKey: ['chronicle', 'stats', dateFrom, dateTo],
    queryFn: async (): Promise<ChronicleStats> => {
      const params = new URLSearchParams();
      if (dateFrom) params.set('date_from', dateFrom);
      if (dateTo) params.set('date_to', dateTo);
      return apiFetch<ChronicleStats>(`${API_BASE}/stats?${params.toString()}`);
    },
    staleTime: 60000,
  });
}

// ============================================================================
// CHRONICLE ENTRIES HOOKS
// ============================================================================

interface UseChronicleEntriesOptions {
  filters?: ChronicleFilters;
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

export function useChronicleEntries(options: UseChronicleEntriesOptions = {}) {
  const { filters = {}, page = 1, pageSize = 50 } = options;

  return useQuery({
    queryKey: ['chronicle', 'entries', filters, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (filters.chronicle_type) params.set('chronicle_type', filters.chronicle_type);
      if (filters.chronicle_subtype) params.set('chronicle_subtype', filters.chronicle_subtype);
      if (filters.action_category) params.set('action_category', filters.action_category);
      if (filters.actor_id) params.set('actor_id', filters.actor_id);
      if (filters.subject_entity_type) params.set('subject_entity_type', filters.subject_entity_type);
      if (filters.subject_entity_id) params.set('subject_entity_id', filters.subject_entity_id);
      if (filters.context_entity_type) params.set('context_entity_type', filters.context_entity_type);
      if (filters.context_entity_id) params.set('context_entity_id', filters.context_entity_id);
      if (filters.occurred_from) params.set('occurred_from', filters.occurred_from);
      if (filters.occurred_to) params.set('occurred_to', filters.occurred_to);
      if (filters.source_system) params.set('source_system', filters.source_system);

      return apiFetch<PaginatedResponse<ChronicleEntry>>(`${API_BASE}/entries?${params.toString()}`);
    },
  });
}

export function useChronicleEntry(entryId: string | undefined) {
  return useQuery({
    queryKey: ['chronicle', 'entries', entryId],
    queryFn: async () => {
      if (!entryId) return null;
      return apiFetch<ChronicleEntry>(`${API_BASE}/entries/${entryId}`);
    },
    enabled: !!entryId,
  });
}

// ============================================================================
// CREATE CHRONICLE ENTRY HOOKS
// ============================================================================

export function useCreateChronicleEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateChronicleEntryPayload) => {
      return apiFetch<ChronicleEntry>(`${API_BASE}/entries`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chronicle', 'entries'] });
      queryClient.invalidateQueries({ queryKey: ['chronicle', 'counts'] });
      queryClient.invalidateQueries({ queryKey: ['chronicle', 'stats'] });
    },
  });
}

export function useLogTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTransactionPayload) => {
      return apiFetch<ChronicleEntry>(`${API_BASE}/transactions`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chronicle', 'entries'] });
      queryClient.invalidateQueries({ queryKey: ['chronicle', 'counts'] });
      queryClient.invalidateQueries({ queryKey: ['chronicle', 'stats'] });
    },
  });
}

export function useLogTimesheetEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateTimesheetEntryPayload) => {
      return apiFetch<ChronicleEntry>(`${API_BASE}/timesheets`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chronicle', 'entries'] });
      queryClient.invalidateQueries({ queryKey: ['chronicle', 'counts'] });
      queryClient.invalidateQueries({ queryKey: ['chronicle', 'stats'] });
    },
  });
}

export function useLogMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateMovementPayload) => {
      return apiFetch<ChronicleEntry>(`${API_BASE}/movements`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chronicle', 'entries'] });
      queryClient.invalidateQueries({ queryKey: ['chronicle', 'counts'] });
      queryClient.invalidateQueries({ queryKey: ['chronicle', 'stats'] });
    },
  });
}

// ============================================================================
// ACTIVITY FEED HOOKS
// ============================================================================

interface UseActivityFeedOptions {
  entityType: string;
  entityId: string;
  limit?: number;
  offset?: number;
}

export function useActivityFeed(options: UseActivityFeedOptions) {
  const { entityType, entityId, limit = 50, offset = 0 } = options;

  return useQuery({
    queryKey: ['chronicle', 'activity-feed', entityType, entityId, limit, offset],
    queryFn: async (): Promise<ActivityFeedResponse> => {
      const params = new URLSearchParams();
      params.set('entity_type', entityType);
      params.set('entity_id', entityId);
      params.set('limit', String(limit));
      params.set('offset', String(offset));

      return apiFetch<ActivityFeedResponse>(`${API_BASE}/activity-feed?${params.toString()}`);
    },
    enabled: !!(entityType && entityId),
  });
}

// ============================================================================
// DAILY AGGREGATES HOOKS
// ============================================================================

interface UseDailyAggregatesOptions {
  dateFrom: string;
  dateTo: string;
  chronicleType?: string;
}

export function useChronicleDailyAggregates(options: UseDailyAggregatesOptions) {
  const { dateFrom, dateTo, chronicleType } = options;

  return useQuery({
    queryKey: ['chronicle', 'daily-aggregates', dateFrom, dateTo, chronicleType],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('date_from', dateFrom);
      params.set('date_to', dateTo);
      if (chronicleType) params.set('chronicle_type', chronicleType);

      return apiFetch<{ data: ChronicleDailyAggregate[] }>(`${API_BASE}/daily-aggregates?${params.toString()}`);
    },
    enabled: !!(dateFrom && dateTo),
  });
}

// ============================================================================
// SPECIALIZED QUERY HOOKS
// ============================================================================

export function useTransactionHistory(options: { dateFrom?: string; dateTo?: string; page?: number; pageSize?: number } = {}) {
  const { dateFrom, dateTo, page = 1, pageSize = 50 } = options;

  return useQuery({
    queryKey: ['chronicle', 'transactions', dateFrom, dateTo, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('chronicle_type', 'transaction');
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (dateFrom) params.set('occurred_from', dateFrom);
      if (dateTo) params.set('occurred_to', dateTo);

      return apiFetch<PaginatedResponse<ChronicleEntry>>(`${API_BASE}/entries?${params.toString()}`);
    },
  });
}

export function useTimesheetHistory(options: { personId?: string; dateFrom?: string; dateTo?: string; page?: number; pageSize?: number } = {}) {
  const { personId, dateFrom, dateTo, page = 1, pageSize = 50 } = options;

  return useQuery({
    queryKey: ['chronicle', 'timesheets', personId, dateFrom, dateTo, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('chronicle_type', 'timesheet');
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (personId) params.set('actor_id', personId);
      if (dateFrom) params.set('occurred_from', dateFrom);
      if (dateTo) params.set('occurred_to', dateTo);

      return apiFetch<PaginatedResponse<ChronicleEntry>>(`${API_BASE}/entries?${params.toString()}`);
    },
  });
}

export function useMovementHistory(options: { itemId?: string; locationId?: string; dateFrom?: string; dateTo?: string; page?: number; pageSize?: number } = {}) {
  const { itemId, locationId, dateFrom, dateTo, page = 1, pageSize = 50 } = options;

  return useQuery({
    queryKey: ['chronicle', 'movements', itemId, locationId, dateFrom, dateTo, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('chronicle_type', 'movement');
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (itemId) params.set('subject_entity_id', itemId);
      if (locationId) params.set('context_entity_id', locationId);
      if (dateFrom) params.set('occurred_from', dateFrom);
      if (dateTo) params.set('occurred_to', dateTo);

      return apiFetch<PaginatedResponse<ChronicleEntry>>(`${API_BASE}/entries?${params.toString()}`);
    },
  });
}

export function useAuditLog(options: { tableName?: string; recordId?: string; dateFrom?: string; dateTo?: string; page?: number; pageSize?: number } = {}) {
  const { tableName, recordId, dateFrom, dateTo, page = 1, pageSize = 50 } = options;

  return useQuery({
    queryKey: ['chronicle', 'audit', tableName, recordId, dateFrom, dateTo, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('chronicle_type', 'audit');
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (tableName) params.set('subject_entity_type', tableName);
      if (recordId) params.set('subject_entity_id', recordId);
      if (dateFrom) params.set('occurred_from', dateFrom);
      if (dateTo) params.set('occurred_to', dateTo);

      return apiFetch<PaginatedResponse<ChronicleEntry>>(`${API_BASE}/entries?${params.toString()}`);
    },
  });
}

// ============================================================================
// RE-EXPORTS
// ============================================================================

export type {
  ChronicleEntry,
  ChronicleFilters,
  ChronicleCounts,
  ChronicleStats,
  ChronicleDailyAggregate,
  ActivityFeedItem,
  ActivityFeedResponse,
  CreateChronicleEntryPayload,
  CreateTransactionPayload,
  CreateTimesheetEntryPayload,
  CreateMovementPayload,
};
