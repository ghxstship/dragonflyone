import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CrmTask {
  id: string;
  title: string;
  type: 'Follow-up' | 'Call' | 'Email' | 'Meeting' | 'Task';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  dueTime?: string;
  assignedTo: string;
  linkedContact?: string;
  linkedDeal?: string;
  status: 'Pending' | 'Completed' | 'Overdue';
  reminder?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

const API_BASE = '/api/tasks';

async function fetchTasks(params?: { status?: string; priority?: string }): Promise<CrmTask[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.priority) searchParams.set('priority', params.priority);

  const url = `${API_BASE}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch tasks');
  }

  const { data } = await response.json();
  return data || [];
}

async function createTask(data: Partial<CrmTask>): Promise<CrmTask> {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create task');
  }

  const result = await response.json();
  return result.data;
}

async function updateTask(id: string, data: Partial<CrmTask>): Promise<CrmTask> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update task');
  }

  const result = await response.json();
  return result.data;
}

async function deleteTasks(ids: string[]): Promise<void> {
  const response = await fetch(`${API_BASE}/bulk`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete tasks');
  }
}

export function useCrmTasksQuery(params?: { status?: string; priority?: string }) {
  return useQuery({
    queryKey: ['crm-tasks', params],
    queryFn: () => fetchTasks(params),
    staleTime: 60000,
  });
}

export function useCreateCrmTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm-tasks'] }),
  });
}

export function useUpdateCrmTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CrmTask> }) => updateTask(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm-tasks'] }),
  });
}

export function useDeleteCrmTasks() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTasks,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['crm-tasks'] }),
  });
}

export function useCrmTasks(params?: { status?: string; priority?: string }) {
  const query = useCrmTasksQuery(params);
  const createMutation = useCreateCrmTask();
  const updateMutation = useUpdateCrmTask();
  const deleteMutation = useDeleteCrmTasks();

  const tasks = query.data || [];

  return {
    tasks,
    summary: {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'Pending').length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      overdue: tasks.filter(t => t.status === 'Overdue').length,
    },
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    createTask: createMutation.mutate,
    createTaskAsync: createMutation.mutateAsync,
    updateTask: updateMutation.mutate,
    updateTaskAsync: updateMutation.mutateAsync,
    deleteTasks: deleteMutation.mutate,
    deleteTasksAsync: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
