import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface TeamAssignment {
  id: string;
  team_member_id: string;
  project_id?: string;
  event_id?: string;
  role: string;
  department: string;
  start_date: string;
  end_date?: string;
  status: 'assigned' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at?: string;
  team_member?: { id: string; full_name: string; email: string };
  project?: { id: string; name: string };
  event?: { id: string; name: string };
}

const API_BASE = '/api/team/assignments';

async function fetchAssignments(params?: {
  team_member_id?: string;
  project_id?: string;
  status?: string;
}): Promise<TeamAssignment[]> {
  const searchParams = new URLSearchParams();
  if (params?.team_member_id) searchParams.set('team_member_id', params.team_member_id);
  if (params?.project_id) searchParams.set('project_id', params.project_id);
  if (params?.status) searchParams.set('status', params.status);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch assignments');
  }

  const { data } = await response.json();
  return data || [];
}

async function createAssignment(data: Partial<TeamAssignment>): Promise<TeamAssignment> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create assignment');
  }

  const result = await response.json();
  return result.data;
}

async function updateAssignment(id: string, data: Partial<TeamAssignment>): Promise<TeamAssignment> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update assignment');
  }

  const result = await response.json();
  return result.data;
}

async function deleteAssignments(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete assignments');
  }
}

export function useAssignmentsQuery(params?: { team_member_id?: string; project_id?: string; status?: string }) {
  return useQuery({
    queryKey: ['team-assignments', params],
    queryFn: () => fetchAssignments(params),
    staleTime: 60000,
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAssignment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-assignments'] }),
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TeamAssignment> }) => updateAssignment(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-assignments'] }),
  });
}

export function useDeleteAssignments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAssignments,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-assignments'] }),
  });
}

export function useTeamAssignments(params?: { team_member_id?: string; project_id?: string; status?: string }) {
  const query = useAssignmentsQuery(params);
  const createMutation = useCreateAssignment();
  const updateMutation = useUpdateAssignment();
  const deleteMutation = useDeleteAssignments();

  return {
    assignments: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createAssignment: createMutation.mutate,
    updateAssignment: updateMutation.mutate,
    deleteAssignments: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
