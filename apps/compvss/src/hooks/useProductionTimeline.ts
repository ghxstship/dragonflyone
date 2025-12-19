import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface TimelinePhase {
  id: string;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed' | 'cancelled';
  color: string;
  order_index: number;
  dependencies?: string[];
  assigned_team?: string;
  notes?: string;
}

export interface ProductionTimeline {
  id: string;
  booking_id: string;
  event_name: string;
  event_date: string;
  venue_name: string;
  phases: TimelinePhase[];
  milestones: Array<{
    id: string;
    name: string;
    due_time: string;
    completed: boolean;
    completed_at?: string;
  }>;
  critical_path: string[];
  total_duration_hours: number;
  buffer_time_minutes: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface CreateTimelineInput {
  booking_id: string;
  phases: Array<Omit<TimelinePhase, 'id' | 'status'>>;
  milestones?: Array<{ name: string; due_time: string }>;
  buffer_time_minutes?: number;
}

async function fetchProductionTimeline(bookingId: string): Promise<ProductionTimeline> {
  const response = await fetch(`/api/production-timelines/${bookingId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch production timeline');
  }
  return response.json();
}

async function createProductionTimeline(input: CreateTimelineInput): Promise<ProductionTimeline> {
  const response = await fetch('/api/production-timelines', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create timeline');
  }
  return response.json();
}

async function updatePhaseStatus(input: { timelineId: string; phaseId: string; status: TimelinePhase['status']; notes?: string }): Promise<ProductionTimeline> {
  const response = await fetch(`/api/production-timelines/${input.timelineId}/phases/${input.phaseId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: input.status, notes: input.notes }),
  });
  if (!response.ok) {
    throw new Error('Failed to update phase');
  }
  return response.json();
}

async function completeMilestone(input: { timelineId: string; milestoneId: string }): Promise<ProductionTimeline> {
  const response = await fetch(`/api/production-timelines/${input.timelineId}/milestones/${input.milestoneId}/complete`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to complete milestone');
  }
  return response.json();
}

async function reorderPhases(input: { timelineId: string; phaseIds: string[] }): Promise<ProductionTimeline> {
  const response = await fetch(`/api/production-timelines/${input.timelineId}/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phase_ids: input.phaseIds }),
  });
  if (!response.ok) {
    throw new Error('Failed to reorder phases');
  }
  return response.json();
}

async function generateFromTemplate(input: { bookingId: string; templateId: string }): Promise<ProductionTimeline> {
  const response = await fetch('/api/production-timelines/from-template', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error('Failed to generate timeline');
  }
  return response.json();
}

export function useProductionTimeline(bookingId: string) {
  return useQuery({
    queryKey: ['production-timeline', bookingId],
    queryFn: () => fetchProductionTimeline(bookingId),
    enabled: !!bookingId,
  });
}

export function useCreateProductionTimeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProductionTimeline,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['production-timeline', data.booking_id] });
    },
  });
}

export function useUpdatePhaseStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePhaseStatus,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['production-timeline', data.booking_id] });
    },
  });
}

export function useCompleteMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: completeMilestone,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['production-timeline', data.booking_id] });
    },
  });
}

export function useReorderPhases() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderPhases,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['production-timeline', data.booking_id] });
    },
  });
}

export function useGenerateTimelineFromTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateFromTemplate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['production-timeline', data.booking_id] });
    },
  });
}
