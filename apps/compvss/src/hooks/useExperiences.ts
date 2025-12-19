import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface JourneyTouchpoint {
  id: string;
  name: string;
  time_offset: number;
  duration: number;
  description: string;
  sensory_elements: {
    visual?: string;
    audio?: string;
    tactile?: string;
    olfactory?: string;
    gustatory?: string;
  };
  interactions: string[];
  staff_required: number;
  assets_required: string[];
}

export interface ExperienceTemplate {
  id: string;
  name: string;
  description?: string;
  event_type: string;
  duration_minutes: number;
  guest_count_min: number;
  guest_count_max: number;
  journey_map: {
    phases: Array<{
      name: string;
      start_offset: number;
      end_offset: number;
      touchpoints: JourneyTouchpoint[];
    }>;
  };
  sensory_palette: {
    color_scheme: string[];
    music_genres: string[];
    scent_profiles: string[];
    texture_themes: string[];
  };
  brand_guidelines?: {
    voice: string;
    messaging: string[];
    prohibited: string[];
  };
  is_template: boolean;
  usage_count: number;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExperienceInput {
  name: string;
  description?: string;
  event_type: string;
  duration_minutes: number;
  guest_count_min: number;
  guest_count_max: number;
  journey_map?: ExperienceTemplate['journey_map'];
  sensory_palette?: ExperienceTemplate['sensory_palette'];
  brand_guidelines?: ExperienceTemplate['brand_guidelines'];
  is_template?: boolean;
}

export interface UpdateExperienceInput extends Partial<CreateExperienceInput> {
  id: string;
}

async function fetchExperiences(): Promise<{ experiences: ExperienceTemplate[]; total: number }> {
  const response = await fetch('/api/experiences');
  if (!response.ok) {
    throw new Error('Failed to fetch experiences');
  }
  return response.json();
}

async function fetchExperience(id: string): Promise<ExperienceTemplate> {
  const response = await fetch(`/api/experiences/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch experience');
  }
  return response.json();
}

async function createExperience(input: CreateExperienceInput): Promise<ExperienceTemplate> {
  const response = await fetch('/api/experiences', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create experience');
  }
  return response.json();
}

async function updateExperience({ id, ...input }: UpdateExperienceInput): Promise<ExperienceTemplate> {
  const response = await fetch(`/api/experiences/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update experience');
  }
  return response.json();
}

async function deleteExperience(id: string): Promise<void> {
  const response = await fetch(`/api/experiences/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete experience');
  }
}

async function applyExperienceToBooking(input: { experienceId: string; bookingId: string }): Promise<{ applied: boolean }> {
  const response = await fetch(`/api/experiences/${input.experienceId}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ booking_id: input.bookingId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to apply experience');
  }
  return response.json();
}

async function duplicateExperience(id: string): Promise<ExperienceTemplate> {
  const response = await fetch(`/api/experiences/${id}/duplicate`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to duplicate experience');
  }
  return response.json();
}

export function useExperiences() {
  return useQuery({
    queryKey: ['experiences'],
    queryFn: fetchExperiences,
  });
}

export function useExperience(id: string) {
  return useQuery({
    queryKey: ['experience', id],
    queryFn: () => fetchExperience(id),
    enabled: !!id,
  });
}

export function useCreateExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}

export function useUpdateExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateExperience,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
      queryClient.invalidateQueries({ queryKey: ['experience', data.id] });
    },
  });
}

export function useDeleteExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}

export function useApplyExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: applyExperienceToBooking,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['experience', variables.experienceId] });
      queryClient.invalidateQueries({ queryKey: ['booking', variables.bookingId] });
    },
  });
}

export function useDuplicateExperience() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: duplicateExperience,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] });
    },
  });
}
