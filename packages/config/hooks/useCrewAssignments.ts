import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CrewAssignment {
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
  updated_at: string;
  team_member?: {
    id: string;
    full_name: string;
    email?: string;
  };
  project?: {
    id: string;
    name: string;
  };
}

const API_BASE = '/api/team/assignments';

async function fetchCrewAssignments(params?: {
  team_member_id?: string;
  project_id?: string;
  status?: string;
}): Promise<CrewAssignment[]> {
  const searchParams = new URLSearchParams();
  if (params?.team_member_id) searchParams.set('team_member_id', params.team_member_id);
  if (params?.project_id) searchParams.set('project_id', params.project_id);
  if (params?.status) searchParams.set('status', params.status);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch crew assignments');
  }

  const { data } = await response.json();
  return data || [];
}

async function createCrewAssignment(data: Omit<CrewAssignment, 'id' | 'created_at' | 'updated_at' | 'team_member' | 'project'>): Promise<CrewAssignment> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create crew assignment');
  }

  const { data: assignment } = await response.json();
  return assignment;
}

async function updateCrewAssignment(id: string, data: Partial<CrewAssignment>): Promise<CrewAssignment> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update crew assignment');
  }

  const { data: assignment } = await response.json();
  return assignment;
}

async function deleteCrewAssignment(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete crew assignment');
  }
}

export function useCrewAssignmentsQuery(params?: {
  team_member_id?: string;
  project_id?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['crew-assignments', params],
    queryFn: () => fetchCrewAssignments(params),
    staleTime: 60000,
  });
}

export function useCreateCrewAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCrewAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-assignments'] });
    },
  });
}

export function useUpdateCrewAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: Partial<CrewAssignment> & { id: string }) =>
      updateCrewAssignment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-assignments'] });
    },
  });
}

export function useDeleteCrewAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCrewAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-assignments'] });
    },
  });
}

export function useCrewAssignments(params?: {
  team_member_id?: string;
  project_id?: string;
  status?: string;
}) {
  const assignmentsQuery = useCrewAssignmentsQuery(params);
  const createMutation = useCreateCrewAssignment();
  const updateMutation = useUpdateCrewAssignment();
  const deleteMutation = useDeleteCrewAssignment();

  const assignments = assignmentsQuery.data || [];
  
  // Calculate summary stats
  const summary = {
    total: assignments.length,
    confirmed: assignments.filter(a => a.status === 'confirmed').length,
    pending: assignments.filter(a => a.status === 'assigned').length,
    in_progress: assignments.filter(a => a.status === 'in_progress').length,
    completed: assignments.filter(a => a.status === 'completed').length,
  };

  return {
    assignments,
    summary,
    isLoading: assignmentsQuery.isLoading,
    error: assignmentsQuery.error,
    refetch: assignmentsQuery.refetch,
    createAssignment: createMutation.mutate,
    createAssignmentAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateAssignment: updateMutation.mutate,
    updateAssignmentAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteAssignment: deleteMutation.mutate,
    deleteAssignmentAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
