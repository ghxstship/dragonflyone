import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  category: 'booking' | 'invoice' | 'contract' | 'proposal' | 'beo' | 'reminder' | 'notification' | 'marketing' | 'custom';
  body_html: string;
  body_text: string;
  variables: Array<{
    name: string;
    description: string;
    default_value?: string;
    required: boolean;
  }>;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
  }>;
  is_default: boolean;
  is_active: boolean;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEmailTemplateInput {
  name: string;
  subject: string;
  category: EmailTemplate['category'];
  body_html: string;
  body_text: string;
  variables?: EmailTemplate['variables'];
  is_default?: boolean;
  is_active?: boolean;
}

export interface SendEmailInput {
  template_id: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  variables: Record<string, string>;
  attachments?: Array<{ name: string; url: string }>;
  schedule_at?: string;
}

async function fetchEmailTemplates(category?: EmailTemplate['category']): Promise<{
  templates: EmailTemplate[];
  total: number;
}> {
  const params = new URLSearchParams();
  if (category) params.set('category', category);

  const response = await fetch(`/api/email-templates?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch email templates');
  }
  return response.json();
}

async function fetchEmailTemplate(id: string): Promise<EmailTemplate> {
  const response = await fetch(`/api/email-templates/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch email template');
  }
  return response.json();
}

async function createEmailTemplate(input: CreateEmailTemplateInput): Promise<EmailTemplate> {
  const response = await fetch('/api/email-templates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create email template');
  }
  return response.json();
}

async function updateEmailTemplate(input: { id: string } & Partial<CreateEmailTemplateInput>): Promise<EmailTemplate> {
  const { id, ...data } = input;
  const response = await fetch(`/api/email-templates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update email template');
  }
  return response.json();
}

async function deleteEmailTemplate(id: string): Promise<void> {
  const response = await fetch(`/api/email-templates/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete email template');
  }
}

async function previewEmail(input: { templateId: string; variables: Record<string, string> }): Promise<{
  subject: string;
  body_html: string;
  body_text: string;
}> {
  const response = await fetch(`/api/email-templates/${input.templateId}/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ variables: input.variables }),
  });
  if (!response.ok) {
    throw new Error('Failed to preview email');
  }
  return response.json();
}

async function sendEmail(input: SendEmailInput): Promise<{ sent: boolean; message_id: string }> {
  const response = await fetch('/api/emails/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to send email');
  }
  return response.json();
}

async function duplicateTemplate(id: string): Promise<EmailTemplate> {
  const response = await fetch(`/api/email-templates/${id}/duplicate`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to duplicate template');
  }
  return response.json();
}

export function useEmailTemplates(category?: EmailTemplate['category']) {
  return useQuery({
    queryKey: ['email-templates', category],
    queryFn: () => fetchEmailTemplates(category),
  });
}

export function useEmailTemplate(id: string) {
  return useQuery({
    queryKey: ['email-template', id],
    queryFn: () => fetchEmailTemplate(id),
    enabled: !!id,
  });
}

export function useCreateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEmailTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
  });
}

export function useUpdateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEmailTemplate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      queryClient.invalidateQueries({ queryKey: ['email-template', data.id] });
    },
  });
}

export function useDeleteEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEmailTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
  });
}

export function usePreviewEmail() {
  return useMutation({
    mutationFn: previewEmail,
  });
}

export function useSendEmail() {
  return useMutation({
    mutationFn: sendEmail,
  });
}

export function useDuplicateEmailTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: duplicateTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    },
  });
}
