'use client';

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
  updated_at?: string;
}

interface CrewFilters {
  organization_id?: string;
  status?: string;
  department?: string;
  search?: string;
}

export function useCrew(filters?: CrewFilters) {
  return useQuery({
    queryKey: ['crew', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.organization_id) params.append('organization_id', filters.organization_id);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.department) params.append('department', filters.department);
      if (filters?.search) params.append('search', filters.search);

      const response = await fetch(`/api/crew?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch crew members');
      }
      const data = await response.json();
      return data.crew || [];
    },
  });
}

export function useCrewMember(id: string) {
  return useQuery({
    queryKey: ['crew', id],
    queryFn: async () => {
      const response = await fetch(`/api/crew/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch crew member');
      }
      const data = await response.json();
      return data.crew_member;
    },
    enabled: !!id,
  });
}

interface CreateCrewMemberInput {
  organization_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  role?: string;
  department?: string;
  hourly_rate?: number;
  day_rate?: number;
  status?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
}

export function useCreateCrewMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCrewMemberInput) => {
      const response = await fetch('/api/crew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to create crew member');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew'] });
    },
  });
}

export function useUpdateCrewMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CrewMember> & { id: string }) => {
      const response = await fetch(`/api/crew/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update crew member');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['crew'] });
      queryClient.invalidateQueries({ queryKey: ['crew', variables.id] });
    },
  });
}

export function useDeleteCrewMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/crew/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete crew member');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crew'] });
    },
  });
}
