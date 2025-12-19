import { useQuery } from '@tanstack/react-query';

export interface LeadFormAnalytics {
  form_id: string;
  total_submissions: number;
  submissions_by_status: {
    new: number;
    reviewed: number;
    converted: number;
    spam: number;
  };
  conversion_rate: number;
  submissions_by_day: Array<{
    date: string;
    count: number;
  }>;
  submissions_by_source: Array<{
    source: string;
    count: number;
  }>;
  top_utm_campaigns: Array<{
    campaign: string;
    count: number;
  }>;
  average_time_to_convert_hours: number;
  field_completion_rates: Array<{
    field_name: string;
    completion_rate: number;
  }>;
}

export interface LeadFormPerformance {
  form_id: string;
  form_name: string;
  views: number;
  submissions: number;
  conversion_rate: number;
  average_completion_time_seconds: number;
  drop_off_rate: number;
  drop_off_by_field: Array<{
    field_name: string;
    drop_off_count: number;
  }>;
}

async function fetchLeadFormAnalytics(formId: string, dateRange?: { from: string; to: string }): Promise<LeadFormAnalytics> {
  const params = new URLSearchParams();
  if (dateRange?.from) {
    params.set('date_from', dateRange.from);
  }
  if (dateRange?.to) {
    params.set('date_to', dateRange.to);
  }

  const response = await fetch(`/api/lead-forms/${formId}/analytics?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch lead form analytics');
  }
  return response.json();
}

async function fetchLeadFormPerformance(formId: string): Promise<LeadFormPerformance> {
  const response = await fetch(`/api/lead-forms/${formId}/performance`);
  if (!response.ok) {
    throw new Error('Failed to fetch lead form performance');
  }
  return response.json();
}

async function fetchAllFormsAnalytics(dateRange?: { from: string; to: string }): Promise<{
  forms: Array<{
    id: string;
    name: string;
    submissions: number;
    conversion_rate: number;
  }>;
  total_submissions: number;
  total_conversions: number;
  overall_conversion_rate: number;
}> {
  const params = new URLSearchParams();
  if (dateRange?.from) {
    params.set('date_from', dateRange.from);
  }
  if (dateRange?.to) {
    params.set('date_to', dateRange.to);
  }

  const response = await fetch(`/api/lead-forms/analytics?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch all forms analytics');
  }
  return response.json();
}

export function useLeadFormAnalytics(formId: string, dateRange?: { from: string; to: string }) {
  return useQuery({
    queryKey: ['lead-form-analytics', formId, dateRange],
    queryFn: () => fetchLeadFormAnalytics(formId, dateRange),
    enabled: !!formId,
  });
}

export function useLeadFormPerformance(formId: string) {
  return useQuery({
    queryKey: ['lead-form-performance', formId],
    queryFn: () => fetchLeadFormPerformance(formId),
    enabled: !!formId,
  });
}

export function useAllFormsAnalytics(dateRange?: { from: string; to: string }) {
  return useQuery({
    queryKey: ['all-forms-analytics', dateRange],
    queryFn: () => fetchAllFormsAnalytics(dateRange),
  });
}
