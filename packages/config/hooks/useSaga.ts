/**
 * Saga Hooks - Normalized Workflows (Verbs)
 * Shared hooks for Saga CRUD operations across all apps
 * 
 * Architecture: Page → React Query Hook → API Route → Supabase
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  SagaInstance,
  SagaStep,
  SagaComment,
  SagaAttachment,
  SagaParticipant,
  SagaTransition,
  SagaTemplate,
  SagaFilters,
  SagaCounts,
  CreateSagaPayload,
  UpdateSagaPayload,
  TransitionSagaPayload,
  CreateSagaStepPayload,
  CreateSagaCommentPayload,
  CreateSagaAttachmentPayload,
} from '../types/saga';

// API base path
const API_BASE = '/api/saga';

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
// SAGA COUNTS HOOK
// ============================================================================

export function useSagaCounts() {
  return useQuery({
    queryKey: ['saga', 'counts'],
    queryFn: async (): Promise<SagaCounts> => {
      return apiFetch<SagaCounts>(`${API_BASE}/counts`);
    },
    staleTime: 30000,
  });
}

// ============================================================================
// SAGA INSTANCES HOOKS
// ============================================================================

interface UseSagasOptions {
  filters?: SagaFilters;
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

export function useSagas(options: UseSagasOptions = {}) {
  const { filters = {}, page = 1, pageSize = 25 } = options;

  return useQuery({
    queryKey: ['saga', 'instances', filters, page, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (filters.search) params.set('search', filters.search);
      if (filters.saga_type) params.set('saga_type', filters.saga_type);
      if (filters.saga_subtype) params.set('saga_subtype', filters.saga_subtype);
      if (filters.current_state) params.set('current_state', filters.current_state);
      if (filters.priority) params.set('priority', filters.priority);
      if (filters.initiated_by) params.set('initiated_by', filters.initiated_by);
      if (filters.assigned_to) params.set('assigned_to', filters.assigned_to);
      if (filters.due_date_from) params.set('due_date_from', filters.due_date_from);
      if (filters.due_date_to) params.set('due_date_to', filters.due_date_to);
      if (filters.tags?.length) params.set('tags', filters.tags.join(','));

      return apiFetch<PaginatedResponse<SagaInstance>>(`${API_BASE}/instances?${params.toString()}`);
    },
  });
}

export function useSaga(sagaId: string | undefined) {
  return useQuery({
    queryKey: ['saga', 'instances', sagaId],
    queryFn: async () => {
      if (!sagaId) return null;
      return apiFetch<SagaInstance>(`${API_BASE}/instances/${sagaId}`);
    },
    enabled: !!sagaId,
  });
}

export function useCreateSaga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSagaPayload) => {
      return apiFetch<SagaInstance>(`${API_BASE}/instances`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saga', 'instances'] });
      queryClient.invalidateQueries({ queryKey: ['saga', 'counts'] });
    },
  });
}

export function useUpdateSaga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateSagaPayload) => {
      const { id, ...updates } = payload;
      return apiFetch<SagaInstance>(`${API_BASE}/instances/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['saga', 'instances'] });
      queryClient.invalidateQueries({ queryKey: ['saga', 'instances', data.id] });
    },
  });
}

export function useTransitionSaga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TransitionSagaPayload) => {
      const { id, ...transition } = payload;
      return apiFetch<SagaInstance>(`${API_BASE}/instances/${id}/transition`, {
        method: 'POST',
        body: JSON.stringify(transition),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['saga', 'instances'] });
      queryClient.invalidateQueries({ queryKey: ['saga', 'instances', data.id] });
      queryClient.invalidateQueries({ queryKey: ['saga', 'counts'] });
    },
  });
}

export function useDeleteSaga() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch<void>(`${API_BASE}/instances/${id}`, { method: 'DELETE' });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saga', 'instances'] });
      queryClient.invalidateQueries({ queryKey: ['saga', 'counts'] });
    },
  });
}

// ============================================================================
// SAGA STEPS HOOKS
// ============================================================================

export function useSagaSteps(sagaId: string | undefined) {
  return useQuery({
    queryKey: ['saga', 'steps', sagaId],
    queryFn: async () => {
      if (!sagaId) return { data: [] };
      return apiFetch<{ data: SagaStep[] }>(`${API_BASE}/instances/${sagaId}/steps`);
    },
    enabled: !!sagaId,
  });
}

export function useCreateSagaStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSagaStepPayload) => {
      return apiFetch<SagaStep>(`${API_BASE}/instances/${payload.saga_id}/steps`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['saga', 'steps', data.saga_id] });
      queryClient.invalidateQueries({ queryKey: ['saga', 'instances', data.saga_id] });
    },
  });
}

export function useUpdateSagaStep() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: string; saga_id: string; status?: string; output_data?: Record<string, unknown>; notes?: string }) => {
      const { id, ...updates } = payload;
      return apiFetch<SagaStep>(`${API_BASE}/steps/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['saga', 'steps', data.saga_id] });
      queryClient.invalidateQueries({ queryKey: ['saga', 'instances', data.saga_id] });
    },
  });
}

// ============================================================================
// SAGA TRANSITIONS HOOKS
// ============================================================================

export function useSagaTransitions(sagaId: string | undefined) {
  return useQuery({
    queryKey: ['saga', 'transitions', sagaId],
    queryFn: async () => {
      if (!sagaId) return { data: [] };
      return apiFetch<{ data: SagaTransition[] }>(`${API_BASE}/instances/${sagaId}/transitions`);
    },
    enabled: !!sagaId,
  });
}

// ============================================================================
// SAGA PARTICIPANTS HOOKS
// ============================================================================

export function useSagaParticipants(sagaId: string | undefined) {
  return useQuery({
    queryKey: ['saga', 'participants', sagaId],
    queryFn: async () => {
      if (!sagaId) return { data: [] };
      return apiFetch<{ data: SagaParticipant[] }>(`${API_BASE}/instances/${sagaId}/participants`);
    },
    enabled: !!sagaId,
  });
}

export function useAddSagaParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { saga_id: string; person_id: string; role: string }) => {
      return apiFetch<SagaParticipant>(`${API_BASE}/instances/${payload.saga_id}/participants`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['saga', 'participants', data.saga_id] });
    },
  });
}

export function useRemoveSagaParticipant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { saga_id: string; participant_id: string }) => {
      await apiFetch<void>(`${API_BASE}/participants/${payload.participant_id}`, { method: 'DELETE' });
      return payload;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['saga', 'participants', data.saga_id] });
    },
  });
}

// ============================================================================
// SAGA COMMENTS HOOKS
// ============================================================================

export function useSagaComments(sagaId: string | undefined) {
  return useQuery({
    queryKey: ['saga', 'comments', sagaId],
    queryFn: async () => {
      if (!sagaId) return { data: [] };
      return apiFetch<{ data: SagaComment[] }>(`${API_BASE}/instances/${sagaId}/comments`);
    },
    enabled: !!sagaId,
  });
}

export function useCreateSagaComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSagaCommentPayload) => {
      return apiFetch<SagaComment>(`${API_BASE}/instances/${payload.saga_id}/comments`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['saga', 'comments', data.saga_id] });
    },
  });
}

export function useDeleteSagaComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { saga_id: string; comment_id: string }) => {
      await apiFetch<void>(`${API_BASE}/comments/${payload.comment_id}`, { method: 'DELETE' });
      return payload;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['saga', 'comments', data.saga_id] });
    },
  });
}

// ============================================================================
// SAGA ATTACHMENTS HOOKS
// ============================================================================

export function useSagaAttachments(sagaId: string | undefined) {
  return useQuery({
    queryKey: ['saga', 'attachments', sagaId],
    queryFn: async () => {
      if (!sagaId) return { data: [] };
      return apiFetch<{ data: SagaAttachment[] }>(`${API_BASE}/instances/${sagaId}/attachments`);
    },
    enabled: !!sagaId,
  });
}

export function useCreateSagaAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateSagaAttachmentPayload) => {
      return apiFetch<SagaAttachment>(`${API_BASE}/instances/${payload.saga_id}/attachments`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['saga', 'attachments', data.saga_id] });
    },
  });
}

export function useDeleteSagaAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { saga_id: string; attachment_id: string }) => {
      await apiFetch<void>(`${API_BASE}/attachments/${payload.attachment_id}`, { method: 'DELETE' });
      return payload;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['saga', 'attachments', data.saga_id] });
    },
  });
}

// ============================================================================
// SAGA TEMPLATES HOOKS
// ============================================================================

export function useSagaTemplates() {
  return useQuery({
    queryKey: ['saga', 'templates'],
    queryFn: async () => {
      return apiFetch<{ data: SagaTemplate[] }>(`${API_BASE}/templates`);
    },
  });
}

export function useSagaTemplate(templateId: string | undefined) {
  return useQuery({
    queryKey: ['saga', 'templates', templateId],
    queryFn: async () => {
      if (!templateId) return null;
      return apiFetch<SagaTemplate>(`${API_BASE}/templates/${templateId}`);
    },
    enabled: !!templateId,
  });
}

export function useCreateSagaTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<SagaTemplate>) => {
      return apiFetch<SagaTemplate>(`${API_BASE}/templates`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saga', 'templates'] });
    },
  });
}

export function useUpdateSagaTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: string } & Partial<SagaTemplate>) => {
      const { id, ...updates } = payload;
      return apiFetch<SagaTemplate>(`${API_BASE}/templates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['saga', 'templates'] });
      queryClient.invalidateQueries({ queryKey: ['saga', 'templates', data.id] });
    },
  });
}

export function useDeleteSagaTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiFetch<void>(`${API_BASE}/templates/${id}`, { method: 'DELETE' });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saga', 'templates'] });
    },
  });
}

// ============================================================================
// MY PENDING ACTIONS HOOK
// ============================================================================

export function useMyPendingSagaActions() {
  return useQuery({
    queryKey: ['saga', 'my-pending-actions'],
    queryFn: async () => {
      return apiFetch<{ data: SagaInstance[] }>(`${API_BASE}/my-pending-actions`);
    },
  });
}

// ============================================================================
// RE-EXPORTS
// ============================================================================

export type {
  SagaInstance,
  SagaStep,
  SagaComment,
  SagaAttachment,
  SagaParticipant,
  SagaTransition,
  SagaTemplate,
  SagaFilters,
  SagaCounts,
  CreateSagaPayload,
  UpdateSagaPayload,
  TransitionSagaPayload,
};
