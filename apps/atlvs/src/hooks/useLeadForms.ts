'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface LeadFormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'date' | 'number' | 'checkbox';
  label: string;
  name: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  order_index: number;
}

export interface LeadFormSettings {
  submit_button_text: string;
  success_message: string;
  auto_response_enabled: boolean;
  auto_response_template?: string;
  notification_enabled: boolean;
  default_lead_source: string;
  default_assigned_to?: string;
}

export interface LeadFormStyling {
  theme: 'light' | 'dark' | 'custom';
  primary_color: string;
  font_family?: string;
  custom_css?: string;
}

export interface LeadForm {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description?: string;
  fields: LeadFormField[];
  settings: LeadFormSettings;
  styling: LeadFormStyling;
  redirect_url?: string;
  notification_emails: string[];
  active: boolean;
  submissions_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLeadFormInput {
  organization_id: string;
  name: string;
  slug: string;
  description?: string;
  fields?: LeadFormField[];
  settings?: Partial<LeadFormSettings>;
  styling?: Partial<LeadFormStyling>;
  redirect_url?: string;
  notification_emails?: string[];
  active?: boolean;
}

export interface UpdateLeadFormInput {
  name?: string;
  slug?: string;
  description?: string | null;
  fields?: LeadFormField[];
  settings?: Partial<LeadFormSettings>;
  styling?: Partial<LeadFormStyling>;
  redirect_url?: string | null;
  notification_emails?: string[];
  active?: boolean;
}

const fetchLeadForms = async (organizationId?: string, activeOnly?: boolean): Promise<LeadForm[]> => {
  const params = new URLSearchParams();
  if (organizationId) params.set('organization_id', organizationId);
  if (activeOnly) params.set('active', 'true');

  const response = await fetch(`/api/lead-forms?${params}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch lead forms');
  }
  const data = await response.json();
  return data.forms;
};

const fetchLeadForm = async (id: string): Promise<LeadForm> => {
  const response = await fetch(`/api/lead-forms/${id}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch lead form');
  }
  const data = await response.json();
  return data.form;
};

const createLeadForm = async (input: CreateLeadFormInput): Promise<LeadForm> => {
  const response = await fetch('/api/lead-forms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create lead form');
  }
  const data = await response.json();
  return data.form;
};

const updateLeadForm = async ({ id, ...input }: UpdateLeadFormInput & { id: string }): Promise<LeadForm> => {
  const response = await fetch(`/api/lead-forms/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update lead form');
  }
  const data = await response.json();
  return data.form;
};

const deleteLeadForm = async (id: string): Promise<void> => {
  const response = await fetch(`/api/lead-forms/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete lead form');
  }
};

export function useLeadForms(organizationId?: string, activeOnly?: boolean) {
  return useQuery({
    queryKey: ['lead-forms', organizationId, activeOnly],
    queryFn: () => fetchLeadForms(organizationId, activeOnly),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLeadForm(id: string) {
  return useQuery({
    queryKey: ['lead-form', id],
    queryFn: () => fetchLeadForm(id),
    enabled: !!id,
  });
}

export function useCreateLeadForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLeadForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-forms'] });
    },
  });
}

export function useUpdateLeadForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLeadForm,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lead-forms'] });
      queryClient.setQueryData(['lead-form', data.id], data);
    },
  });
}

export function useDeleteLeadForm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLeadForm,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-forms'] });
    },
  });
}
