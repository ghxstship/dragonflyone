import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface LeadFormSubmission {
  id: string;
  form_id: string;
  lead_id?: string;
  data: Record<string, unknown>;
  source?: string;
  utm_params?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  };
  ip_address?: string;
  user_agent?: string;
  status: 'new' | 'reviewed' | 'converted' | 'spam';
  created_at: string;
}

export interface SubmissionFilters {
  form_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

async function fetchSubmissions(formId: string, filters?: SubmissionFilters): Promise<{ submissions: LeadFormSubmission[]; total: number }> {
  const params = new URLSearchParams();
  if (filters?.status) {
    params.set('status', filters.status);
  }
  if (filters?.date_from) {
    params.set('date_from', filters.date_from);
  }
  if (filters?.date_to) {
    params.set('date_to', filters.date_to);
  }

  const response = await fetch(`/api/lead-forms/${formId}/submissions?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch submissions');
  }
  return response.json();
}

async function fetchSubmission(formId: string, submissionId: string): Promise<LeadFormSubmission> {
  const response = await fetch(`/api/lead-forms/${formId}/submissions/${submissionId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch submission');
  }
  return response.json();
}

async function updateSubmissionStatus({ formId, submissionId, status }: { formId: string; submissionId: string; status: string }): Promise<LeadFormSubmission> {
  const response = await fetch(`/api/lead-forms/${formId}/submissions/${submissionId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update submission');
  }
  return response.json();
}

async function convertSubmissionToLead({ formId, submissionId }: { formId: string; submissionId: string }): Promise<{ lead_id: string }> {
  const response = await fetch(`/api/lead-forms/${formId}/submissions/${submissionId}/convert`, {
    method: 'POST',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to convert submission');
  }
  return response.json();
}

async function deleteSubmission({ formId, submissionId }: { formId: string; submissionId: string }): Promise<void> {
  const response = await fetch(`/api/lead-forms/${formId}/submissions/${submissionId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete submission');
  }
}

export function useLeadFormSubmissions(formId: string, filters?: SubmissionFilters) {
  return useQuery({
    queryKey: ['lead-form-submissions', formId, filters],
    queryFn: () => fetchSubmissions(formId, filters),
    enabled: !!formId,
  });
}

export function useLeadFormSubmission(formId: string, submissionId: string) {
  return useQuery({
    queryKey: ['lead-form-submission', formId, submissionId],
    queryFn: () => fetchSubmission(formId, submissionId),
    enabled: !!formId && !!submissionId,
  });
}

export function useUpdateSubmissionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSubmissionStatus,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead-form-submissions', variables.formId] });
      queryClient.invalidateQueries({ queryKey: ['lead-form-submission', variables.formId, variables.submissionId] });
    },
  });
}

export function useConvertSubmissionToLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: convertSubmissionToLead,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead-form-submissions', variables.formId] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useDeleteSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSubmission,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['lead-form-submissions', variables.formId] });
    },
  });
}
