import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
  department?: string;
  title?: string;
  phone?: string;
  permissions: string[];
  status: 'active' | 'invited' | 'inactive' | 'suspended';
  last_active_at?: string;
  invited_by?: string;
  invited_at?: string;
  joined_at?: string;
  organization_id: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  department?: string;
  lead_id?: string;
  lead_name?: string;
  member_count: number;
  members: TeamMember[];
  permissions: string[];
  organization_id: string;
  created_at: string;
}

export interface InviteMemberInput {
  email: string;
  name?: string;
  role: TeamMember['role'];
  team_ids?: string[];
  permissions?: string[];
  message?: string;
}

async function fetchTeamMembers(filters?: { role?: string; status?: string; department?: string }): Promise<{
  members: TeamMember[];
  total: number;
}> {
  const params = new URLSearchParams();
  if (filters?.role) params.set('role', filters.role);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.department) params.set('department', filters.department);

  const response = await fetch(`/api/team/members?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch team members');
  }
  return response.json();
}

async function fetchTeams(): Promise<{ teams: Team[]; total: number }> {
  const response = await fetch('/api/teams');
  if (!response.ok) {
    throw new Error('Failed to fetch teams');
  }
  return response.json();
}

async function inviteMember(input: InviteMemberInput): Promise<TeamMember> {
  const response = await fetch('/api/team/invite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to invite member');
  }
  return response.json();
}

async function updateMemberRole(input: { memberId: string; role: TeamMember['role'] }): Promise<TeamMember> {
  const response = await fetch(`/api/team/members/${input.memberId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: input.role }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update role');
  }
  return response.json();
}

async function updateMemberPermissions(input: { memberId: string; permissions: string[] }): Promise<TeamMember> {
  const response = await fetch(`/api/team/members/${input.memberId}/permissions`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ permissions: input.permissions }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update permissions');
  }
  return response.json();
}

async function removeMember(memberId: string): Promise<void> {
  const response = await fetch(`/api/team/members/${memberId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove member');
  }
}

async function resendInvite(memberId: string): Promise<{ sent: boolean }> {
  const response = await fetch(`/api/team/members/${memberId}/resend-invite`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to resend invite');
  }
  return response.json();
}

async function createTeam(input: { name: string; description?: string; department?: string; memberIds?: string[] }): Promise<Team> {
  const response = await fetch('/api/teams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create team');
  }
  return response.json();
}

async function addMemberToTeam(input: { teamId: string; memberId: string }): Promise<Team> {
  const response = await fetch(`/api/teams/${input.teamId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ member_id: input.memberId }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to add member to team');
  }
  return response.json();
}

export function useTeamMembers(filters?: { role?: string; status?: string; department?: string }) {
  return useQuery({
    queryKey: ['team-members', filters],
    queryFn: () => fetchTeamMembers(filters),
  });
}

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: fetchTeams,
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
  });
}

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMemberRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
  });
}

export function useUpdateMemberPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMemberPermissions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
  });
}

export function useRemoveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useResendInvite() {
  return useMutation({
    mutationFn: resendInvite,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

export function useAddMemberToTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addMemberToTeam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}
