import { useMutation, useQueryClient } from '@tanstack/react-query';

export interface BulkOperation {
  id: string;
  operation_type: 'update' | 'delete' | 'export' | 'assign' | 'tag' | 'email';
  resource_type: 'contacts' | 'bookings' | 'invoices' | 'leads' | 'vendors';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  total_items: number;
  processed_items: number;
  success_count: number;
  failure_count: number;
  errors: Array<{ item_id: string; error: string }>;
  parameters: Record<string, unknown>;
  started_at?: string;
  completed_at?: string;
  created_by: string;
  created_at: string;
}

export interface BulkUpdateInput {
  resource_type: BulkOperation['resource_type'];
  item_ids: string[];
  updates: Record<string, unknown>;
}

export interface BulkDeleteInput {
  resource_type: BulkOperation['resource_type'];
  item_ids: string[];
  hard_delete?: boolean;
}

export interface BulkAssignInput {
  resource_type: BulkOperation['resource_type'];
  item_ids: string[];
  assignee_id: string;
}

export interface BulkTagInput {
  resource_type: BulkOperation['resource_type'];
  item_ids: string[];
  tags_to_add?: string[];
  tags_to_remove?: string[];
}

export interface BulkEmailInput {
  resource_type: BulkOperation['resource_type'];
  item_ids: string[];
  template_id: string;
  variables?: Record<string, string>;
  schedule_at?: string;
}

async function bulkUpdate(input: BulkUpdateInput): Promise<BulkOperation> {
  const response = await fetch('/api/bulk/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to start bulk update');
  }
  return response.json();
}

async function bulkDelete(input: BulkDeleteInput): Promise<BulkOperation> {
  const response = await fetch('/api/bulk/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to start bulk delete');
  }
  return response.json();
}

async function bulkAssign(input: BulkAssignInput): Promise<BulkOperation> {
  const response = await fetch('/api/bulk/assign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to start bulk assign');
  }
  return response.json();
}

async function bulkTag(input: BulkTagInput): Promise<BulkOperation> {
  const response = await fetch('/api/bulk/tag', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to start bulk tag');
  }
  return response.json();
}

async function bulkEmail(input: BulkEmailInput): Promise<BulkOperation> {
  const response = await fetch('/api/bulk/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to start bulk email');
  }
  return response.json();
}

async function cancelBulkOperation(operationId: string): Promise<BulkOperation> {
  const response = await fetch(`/api/bulk/${operationId}/cancel`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to cancel operation');
  }
  return response.json();
}

export function useBulkUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkUpdate,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.resource_type] });
    },
  });
}

export function useBulkDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkDelete,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.resource_type] });
    },
  });
}

export function useBulkAssign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkAssign,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.resource_type] });
    },
  });
}

export function useBulkTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bulkTag,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.resource_type] });
    },
  });
}

export function useBulkEmail() {
  return useMutation({
    mutationFn: bulkEmail,
  });
}

export function useCancelBulkOperation() {
  return useMutation({
    mutationFn: cancelBulkOperation,
  });
}
