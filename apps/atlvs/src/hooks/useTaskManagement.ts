import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Task {
  id: string;
  title: string;
  description?: string;
  task_type: 'follow_up' | 'call' | 'email' | 'meeting' | 'site_visit' | 'document' | 'payment' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'deferred';
  due_date?: string;
  due_time?: string;
  reminder_at?: string;
  assigned_to: string;
  assigned_to_name: string;
  created_by: string;
  created_by_name: string;
  related_to?: {
    type: 'contact' | 'booking' | 'lead' | 'invoice' | 'contract' | 'proposal';
    id: string;
    name: string;
  };
  tags?: string[];
  completed_at?: string;
  completed_by?: string;
  notes?: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskFilters {
  status?: Task['status'];
  priority?: Task['priority'];
  task_type?: Task['task_type'];
  assigned_to?: string;
  related_type?: string;
  related_id?: string;
  due_before?: string;
  due_after?: string;
  overdue?: boolean;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  task_type: Task['task_type'];
  priority: Task['priority'];
  due_date?: string;
  due_time?: string;
  reminder_at?: string;
  assigned_to?: string;
  related_to?: Task['related_to'];
  tags?: string[];
}

async function fetchTasks(filters?: TaskFilters): Promise<{
  tasks: Task[];
  total: number;
  summary: {
    pending: number;
    in_progress: number;
    completed_today: number;
    overdue: number;
    by_priority: Record<string, number>;
  };
}> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.priority) params.set('priority', filters.priority);
  if (filters?.task_type) params.set('type', filters.task_type);
  if (filters?.assigned_to) params.set('assigned_to', filters.assigned_to);
  if (filters?.related_type) params.set('related_type', filters.related_type);
  if (filters?.related_id) params.set('related_id', filters.related_id);
  if (filters?.due_before) params.set('due_before', filters.due_before);
  if (filters?.due_after) params.set('due_after', filters.due_after);
  if (filters?.overdue) params.set('overdue', 'true');

  const response = await fetch(`/api/tasks?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
}

async function fetchTask(id: string): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch task');
  }
  return response.json();
}

async function createTask(input: CreateTaskInput): Promise<Task> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create task');
  }
  return response.json();
}

async function updateTask(input: { id: string } & Partial<CreateTaskInput>): Promise<Task> {
  const { id, ...data } = input;
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update task');
  }
  return response.json();
}

async function completeTask(id: string, notes?: string): Promise<Task> {
  const response = await fetch(`/api/tasks/${id}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  });
  if (!response.ok) {
    throw new Error('Failed to complete task');
  }
  return response.json();
}

async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`/api/tasks/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete task');
  }
}

async function reassignTask(input: { taskId: string; assigneeId: string }): Promise<Task> {
  const response = await fetch(`/api/tasks/${input.taskId}/reassign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignee_id: input.assigneeId }),
  });
  if (!response.ok) {
    throw new Error('Failed to reassign task');
  }
  return response.json();
}

export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => fetchTasks(filters),
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => fetchTask(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', data.id] });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) => completeTask(id, notes),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', data.id] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useReassignTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reassignTask,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task', data.id] });
    },
  });
}
