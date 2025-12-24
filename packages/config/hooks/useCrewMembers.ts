import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CrewMember {
  id: string;
  organization_id: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  hourly_rate?: number;
  day_rate?: number;
  status: 'active' | 'inactive' | 'pending' | 'on_leave';
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CrewMemberSummary {
  total: number;
  active: number;
  inactive: number;
  on_leave: number;
}

export interface CrewMembersResponse {
  crew: CrewMember[];
  summary: CrewMemberSummary;
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

const API_BASE = '/api/crew';

async function fetchCrewMembers(params?: {
  organization_id?: string;
  status?: string;
  department?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<CrewMembersResponse> {
  const searchParams = new URLSearchParams();
  if (params?.organization_id) searchParams.set('organization_id', params.organization_id);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.department) searchParams.set('department', params.department);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.offset) searchParams.set('offset', params.offset.toString());

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch crew members');
  }

  return response.json();
}

async function fetchCrewMember(id: string): Promise<CrewMember> {
  const response = await fetch(`${API_BASE}/${id}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch crew member');
  }

  const { crew_member } = await response.json();
  return crew_member;
}

async function createCrewMember(data: Omit<CrewMember, 'id' | 'created_at' | 'updated_at'>): Promise<CrewMember> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create crew member');
  }

  const { crew_member } = await response.json();
  return crew_member;
}

async function updateCrewMember(id: string, data: Partial<CrewMember>): Promise<CrewMember> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update crew member');
  }

  const { crew_member } = await response.json();
  return crew_member;
}

async function deleteCrewMember(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete crew member');
  }
}

export function useCrewMembersQuery(params?: {
  organization_id?: string;
  status?: string;
  department?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['crew-members', params],
    queryFn: () => fetchCrewMembers(params),
    staleTime: 60000,
  });
}

export function useCrewMemberQuery(id: string) {
  return useQuery({
    queryKey: ['crew-members', id],
    queryFn: () => fetchCrewMember(id),
    enabled: !!id,
  });
}

export function useCreateCrewMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCrewMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-members'] });
    },
  });
}

export function useUpdateCrewMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: Partial<CrewMember> & { id: string }) =>
      updateCrewMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-members'] });
    },
  });
}

export function useDeleteCrewMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCrewMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew-members'] });
    },
  });
}

export function useCrewMembers(params?: {
  organization_id?: string;
  status?: string;
  department?: string;
  search?: string;
}) {
  const crewQuery = useCrewMembersQuery(params);
  const createMutation = useCreateCrewMember();
  const updateMutation = useUpdateCrewMember();
  const deleteMutation = useDeleteCrewMember();

  return {
    crewMembers: crewQuery.data?.crew || [],
    summary: crewQuery.data?.summary || null,
    pagination: crewQuery.data?.pagination || null,
    isLoading: crewQuery.isLoading,
    error: crewQuery.error,
    refetch: crewQuery.refetch,
    createCrewMember: createMutation.mutate,
    createCrewMemberAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateCrewMember: updateMutation.mutate,
    updateCrewMemberAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteCrewMember: deleteMutation.mutate,
    deleteCrewMemberAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
