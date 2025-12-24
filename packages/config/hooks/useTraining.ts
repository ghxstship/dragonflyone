import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface TrainingProgram {
  id: string;
  title: string;
  description?: string;
  category: 'safety' | 'management' | 'compliance' | 'technical' | 'soft_skills' | 'certification';
  duration_hours: number;
  instructor_name?: string;
  capacity: number;
  enrolled_count: number;
  start_date?: string;
  end_date?: string;
  location?: string;
  is_virtual: boolean;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  certification_awarded?: string;
  created_at: string;
}

export interface TrainingCompletion {
  id: string;
  user_id: string;
  program_id: string;
  completed_at: string;
  score?: number;
  employee?: { id: string; full_name: string; email: string };
  program?: { id: string; title: string };
}

const API_BASE = '/api/training';

async function fetchTrainingPrograms(params?: {
  category?: string;
  status?: string;
}): Promise<{ programs: TrainingProgram[]; recent_completions: TrainingCompletion[]; summary: Record<string, unknown> }> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.status) searchParams.set('status', params.status);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch training programs');
  }

  return response.json();
}

async function createTrainingProgram(data: Partial<TrainingProgram>): Promise<TrainingProgram> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create training program');
  }

  return response.json();
}

async function deleteTrainingPrograms(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete training programs');
  }
}

export function useTrainingQuery(params?: { category?: string; status?: string }) {
  return useQuery({
    queryKey: ['training', params],
    queryFn: () => fetchTrainingPrograms(params),
    staleTime: 60000,
  });
}

export function useCreateTrainingProgram() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTrainingProgram,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['training'] }),
  });
}

export function useDeleteTrainingPrograms() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTrainingPrograms,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['training'] }),
  });
}

export function useTraining(params?: { category?: string; status?: string }) {
  const trainingQuery = useTrainingQuery(params);
  const createMutation = useCreateTrainingProgram();
  const deleteMutation = useDeleteTrainingPrograms();

  return {
    programs: trainingQuery.data?.programs || [],
    recentCompletions: trainingQuery.data?.recent_completions || [],
    summary: trainingQuery.data?.summary || {},
    isLoading: trainingQuery.isLoading,
    error: trainingQuery.error,
    refetch: trainingQuery.refetch,
    createProgram: createMutation.mutate,
    createProgramAsync: createMutation.mutateAsync,
    deletePrograms: deleteMutation.mutate,
    deleteProgramsAsync: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
