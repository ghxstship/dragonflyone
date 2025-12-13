'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface RoleDefinition {
  code: string;
  platform: string;
  description?: string;
  level: string;
  hierarchy_rank: number;
}

export interface UserRole {
  id: string;
  platform_user_id: string;
  organization_id: string;
  role_code: string;
  created_at: string;
  role?: RoleDefinition;
  user?: {
    id: string;
    full_name?: string;
    email: string;
  };
  organization?: {
    id: string;
    name: string;
  };
}

interface RoleFilters {
  platform?: string;
  organization_id?: string;
  user_id?: string;
  include_definitions?: boolean;
}

interface RolesResponse {
  roles?: RoleDefinition[];
  user_roles?: UserRole[];
  summary?: {
    total: number;
    by_role: Record<string, number>;
  };
}

export function useRoles(filters?: RoleFilters) {
  return useQuery({
    queryKey: ['roles', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.platform) params.append('platform', filters.platform);
      if (filters?.organization_id) params.append('organization_id', filters.organization_id);
      if (filters?.user_id) params.append('user_id', filters.user_id);
      if (filters?.include_definitions) params.append('include_definitions', 'true');

      const response = await fetch(`/api/roles?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }
      return response.json() as Promise<RolesResponse>;
    },
  });
}

export function useRoleDefinitions(platform?: string) {
  return useQuery({
    queryKey: ['role-definitions', platform],
    queryFn: async () => {
      const params = new URLSearchParams({ include_definitions: 'true' });
      if (platform) params.append('platform', platform);

      const response = await fetch(`/api/roles?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch role definitions');
      }
      const data = await response.json();
      return data.roles as RoleDefinition[];
    },
  });
}

export function useUserRole(id: string) {
  return useQuery({
    queryKey: ['roles', id],
    queryFn: async () => {
      const response = await fetch(`/api/roles/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user role');
      }
      const data = await response.json();
      return data.user_role as UserRole;
    },
    enabled: !!id,
  });
}

interface AssignRoleInput {
  platform_user_id: string;
  organization_id: string;
  role_code: string;
}

export function useAssignRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignment: AssignRoleInput) => {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assignment),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign role');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UserRole> & { id: string }) => {
      const response = await fetch(`/api/roles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update user role');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      queryClient.invalidateQueries({ queryKey: ['roles', variables.id] });
    },
  });
}

export function useRevokeRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/roles/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to revoke role');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
}

export function getRoleLevelColor(level: string): string {
  const colors: Record<string, string> = {
    god: 'error',
    admin: 'warning',
    manager: 'info',
    member: 'success',
    viewer: 'ghost',
  };
  return colors[level] || 'outline';
}
