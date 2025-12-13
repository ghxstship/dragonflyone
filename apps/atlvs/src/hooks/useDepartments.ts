'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Department {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  created_at: string;
}

interface DepartmentFilters {
  organization_id?: string;
}

export function useDepartments(filters?: DepartmentFilters) {
  return useQuery({
    queryKey: ['departments', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.organization_id) params.append('organization_id', filters.organization_id);
      else params.append('organization_id', 'default-org');

      const response = await fetch(`/api/departments?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      const data = await response.json();
      return data.departments as Department[];
    },
  });
}

export function useDepartment(id: string) {
  return useQuery({
    queryKey: ['departments', id],
    queryFn: async () => {
      const response = await fetch(`/api/departments/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch department');
      }
      const data = await response.json();
      return data.department as Department;
    },
    enabled: !!id,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (department: Omit<Department, 'id' | 'created_at'>) => {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(department),
      });
      if (!response.ok) {
        throw new Error('Failed to create department');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Department> & { id: string }) => {
      const response = await fetch(`/api/departments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update department');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      queryClient.invalidateQueries({ queryKey: ['departments', variables.id] });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/departments/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete department');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    },
  });
}
