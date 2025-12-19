import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface CustomField {
  id: string;
  name: string;
  label: string;
  field_type: 'text' | 'number' | 'date' | 'datetime' | 'select' | 'multiselect' | 'checkbox' | 'url' | 'email' | 'phone' | 'currency' | 'textarea';
  entity_type: 'contact' | 'booking' | 'lead' | 'vendor' | 'invoice' | 'space';
  options?: Array<{ value: string; label: string }>;
  default_value?: string;
  placeholder?: string;
  help_text?: string;
  required: boolean;
  visible_in_list: boolean;
  visible_in_form: boolean;
  sortable: boolean;
  searchable: boolean;
  order_index: number;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    min_length?: number;
    max_length?: number;
  };
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomFieldInput {
  name: string;
  label: string;
  field_type: CustomField['field_type'];
  entity_type: CustomField['entity_type'];
  options?: CustomField['options'];
  default_value?: string;
  placeholder?: string;
  help_text?: string;
  required?: boolean;
  visible_in_list?: boolean;
  visible_in_form?: boolean;
  sortable?: boolean;
  searchable?: boolean;
  validation?: CustomField['validation'];
}

async function fetchCustomFields(entityType?: CustomField['entity_type']): Promise<{
  fields: CustomField[];
  total: number;
}> {
  const params = new URLSearchParams();
  if (entityType) params.set('entity_type', entityType);

  const response = await fetch(`/api/custom-fields?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch custom fields');
  }
  return response.json();
}

async function createCustomField(input: CreateCustomFieldInput): Promise<CustomField> {
  const response = await fetch('/api/custom-fields', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create custom field');
  }
  return response.json();
}

async function updateCustomField(input: { id: string } & Partial<CreateCustomFieldInput>): Promise<CustomField> {
  const { id, ...data } = input;
  const response = await fetch(`/api/custom-fields/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update custom field');
  }
  return response.json();
}

async function deleteCustomField(id: string): Promise<void> {
  const response = await fetch(`/api/custom-fields/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete custom field');
  }
}

async function reorderCustomFields(input: { entityType: CustomField['entity_type']; fieldIds: string[] }): Promise<void> {
  const response = await fetch('/api/custom-fields/reorder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error('Failed to reorder fields');
  }
}

export function useCustomFields(entityType?: CustomField['entity_type']) {
  return useQuery({
    queryKey: ['custom-fields', entityType],
    queryFn: () => fetchCustomFields(entityType),
  });
}

export function useCreateCustomField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomField,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['custom-fields', data.entity_type] });
      queryClient.invalidateQueries({ queryKey: ['custom-fields'] });
    },
  });
}

export function useUpdateCustomField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCustomField,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['custom-fields', data.entity_type] });
      queryClient.invalidateQueries({ queryKey: ['custom-fields'] });
    },
  });
}

export function useDeleteCustomField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCustomField,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-fields'] });
    },
  });
}

export function useReorderCustomFields() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderCustomFields,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['custom-fields', variables.entityType] });
    },
  });
}
