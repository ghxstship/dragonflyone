'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Timesheet {
  id: string;
  organization_id: string;
  employee_id: string;
  work_date: string;
  project_id?: string;
  department_id?: string;
  clock_in: string;
  clock_out?: string;
  break_minutes: number;
  regular_hours: number;
  overtime_hours: number;
  total_hours: number;
  task_description?: string;
  notes?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  created_at: string;
  updated_at?: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    employee_number: string;
  };
  project?: {
    id: string;
    name: string;
  };
  department?: {
    id: string;
    name: string;
  };
}

interface TimesheetFilters {
  status?: string;
  employee_id?: string;
  project_id?: string;
  department_id?: string;
  start_date?: string;
  end_date?: string;
}

export function useTimesheets(filters?: TimesheetFilters) {
  return useQuery({
    queryKey: ['timesheets', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.employee_id) params.append('employee_id', filters.employee_id);
      if (filters?.project_id) params.append('project_id', filters.project_id);
      if (filters?.department_id) params.append('department_id', filters.department_id);
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);

      const response = await fetch(`/api/timesheets?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch timesheets');
      }
      const data = await response.json();
      return data.timesheets as Timesheet[];
    },
  });
}

export function useTimesheet(id: string) {
  return useQuery({
    queryKey: ['timesheets', id],
    queryFn: async () => {
      const response = await fetch(`/api/timesheets/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch timesheet');
      }
      const data = await response.json();
      return data.timesheet as Timesheet;
    },
    enabled: !!id,
  });
}

export function useCreateTimesheet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (timesheet: Omit<Timesheet, 'id' | 'created_at' | 'updated_at' | 'regular_hours' | 'overtime_hours' | 'total_hours'>) => {
      const response = await fetch('/api/timesheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(timesheet),
      });
      if (!response.ok) {
        throw new Error('Failed to create timesheet');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
    },
  });
}

export function useUpdateTimesheet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Timesheet> & { id: string }) => {
      const response = await fetch(`/api/timesheets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update timesheet');
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
      queryClient.invalidateQueries({ queryKey: ['timesheets', variables.id] });
    },
  });
}

export function useDeleteTimesheet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/timesheets/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete timesheet');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
    },
  });
}

export function useApproveTimesheet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/timesheets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });
      if (!response.ok) {
        throw new Error('Failed to approve timesheet');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
    },
  });
}

export function useRejectTimesheet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await fetch(`/api/timesheets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', rejection_reason: reason }),
      });
      if (!response.ok) {
        throw new Error('Failed to reject timesheet');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timesheets'] });
    },
  });
}
