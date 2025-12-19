'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface VendorReview {
  id: string;
  vendor_profile_id: string;
  organization_id: string;
  booking_id?: string;
  reviewer_id?: string;
  overall_rating: number;
  category_ratings: Record<string, number>;
  review_text?: string;
  pros?: string;
  cons?: string;
  would_recommend: boolean;
  is_public: boolean;
  status: 'pending' | 'published' | 'hidden' | 'removed';
  response?: string;
  responded_at?: string;
  responded_by?: string;
  created_at: string;
  updated_at: string;
  booking?: {
    id: string;
    booking_number: string;
    event_name?: string;
    event_date?: string;
  };
}

export interface VendorMetric {
  id: string;
  vendor_profile_id: string;
  organization_id: string;
  metric_period: string;
  period_type: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  total_bookings: number;
  total_revenue: number;
  on_time_rate?: number;
  quality_score?: number;
  response_time_hours?: number;
  issue_count: number;
  cancellation_count: number;
  repeat_booking_rate?: number;
  metadata?: Record<string, unknown>;
  calculated_at: string;
}

export interface VendorIssue {
  id: string;
  vendor_profile_id: string;
  organization_id: string;
  booking_id?: string;
  order_id?: string;
  issue_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated';
  resolution?: string;
  resolved_at?: string;
  resolved_by?: string;
  reported_by?: string;
  created_at: string;
  updated_at: string;
  booking?: { id: string; booking_number: string; event_name?: string };
  order?: { id: string; order_number: string };
}

interface ReviewsResponse {
  reviews: VendorReview[];
  stats: {
    total_reviews: number;
    average_rating: number;
    would_recommend_percent: number;
    rating_distribution: Record<number, number>;
  };
}

interface MetricsResponse {
  metrics: VendorMetric[];
  summary: {
    total_orders: number;
    total_revenue: number;
    completed_orders: number;
    open_issues: number;
    critical_issues: number;
    average_rating: number;
    total_reviews: number;
  };
}

interface IssuesResponse {
  issues: VendorIssue[];
  stats: {
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
    by_severity: Record<string, number>;
  };
}

interface CreateReviewInput {
  organization_id: string;
  booking_id?: string;
  overall_rating: number;
  category_ratings?: Record<string, number>;
  review_text?: string;
  pros?: string;
  cons?: string;
  would_recommend?: boolean;
  is_public?: boolean;
}

interface CreateIssueInput {
  organization_id: string;
  booking_id?: string;
  order_id?: string;
  issue_type: string;
  severity?: VendorIssue['severity'];
  title: string;
  description: string;
}

interface UpdateIssueInput {
  severity?: VendorIssue['severity'];
  status?: VendorIssue['status'];
  resolution?: string;
}

async function fetchVendorReviews(vendorId: string, status?: string): Promise<ReviewsResponse> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);

  const res = await fetch(`/api/vendor-profiles/${vendorId}/reviews?${params}`);
  if (!res.ok) throw new Error('Failed to fetch reviews');
  return res.json();
}

async function fetchVendorMetrics(
  vendorId: string,
  periodType?: string,
  limit?: number
): Promise<MetricsResponse> {
  const params = new URLSearchParams();
  if (periodType) params.set('period_type', periodType);
  if (limit) params.set('limit', String(limit));

  const res = await fetch(`/api/vendor-profiles/${vendorId}/metrics?${params}`);
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
}

async function fetchVendorIssues(
  vendorId: string,
  filters?: { status?: string; severity?: string }
): Promise<IssuesResponse> {
  const params = new URLSearchParams();
  if (filters?.status) params.set('status', filters.status);
  if (filters?.severity) params.set('severity', filters.severity);

  const res = await fetch(`/api/vendor-profiles/${vendorId}/issues?${params}`);
  if (!res.ok) throw new Error('Failed to fetch issues');
  return res.json();
}

async function createReview(
  vendorId: string,
  input: CreateReviewInput
): Promise<{ review: VendorReview }> {
  const res = await fetch(`/api/vendor-profiles/${vendorId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to create review');
  return res.json();
}

async function createIssue(
  vendorId: string,
  input: CreateIssueInput
): Promise<{ issue: VendorIssue }> {
  const res = await fetch(`/api/vendor-profiles/${vendorId}/issues`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to create issue');
  return res.json();
}

async function updateIssue(
  vendorId: string,
  issueId: string,
  input: UpdateIssueInput
): Promise<{ issue: VendorIssue }> {
  const res = await fetch(`/api/vendor-profiles/${vendorId}/issues?issue_id=${issueId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to update issue');
  return res.json();
}

export function useVendorReviews(vendorId: string | undefined, status?: string) {
  return useQuery({
    queryKey: ['vendor-reviews', vendorId, status],
    queryFn: () => fetchVendorReviews(vendorId!, status),
    enabled: !!vendorId,
  });
}

export function useVendorMetrics(
  vendorId: string | undefined,
  periodType?: string,
  limit?: number
) {
  return useQuery({
    queryKey: ['vendor-metrics', vendorId, periodType, limit],
    queryFn: () => fetchVendorMetrics(vendorId!, periodType, limit),
    enabled: !!vendorId,
  });
}

export function useVendorIssues(
  vendorId: string | undefined,
  filters?: { status?: string; severity?: string }
) {
  return useQuery({
    queryKey: ['vendor-issues', vendorId, filters],
    queryFn: () => fetchVendorIssues(vendorId!, filters),
    enabled: !!vendorId,
  });
}

export function useCreateVendorReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, input }: { vendorId: string; input: CreateReviewInput }) =>
      createReview(vendorId, input),
    onSuccess: (_, { vendorId }) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-reviews', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-profile', vendorId] });
    },
  });
}

export function useCreateVendorIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vendorId, input }: { vendorId: string; input: CreateIssueInput }) =>
      createIssue(vendorId, input),
    onSuccess: (_, { vendorId }) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-issues', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-metrics', vendorId] });
    },
  });
}

export function useUpdateVendorIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vendorId,
      issueId,
      input,
    }: {
      vendorId: string;
      issueId: string;
      input: UpdateIssueInput;
    }) => updateIssue(vendorId, issueId, input),
    onSuccess: (_, { vendorId }) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-issues', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-metrics', vendorId] });
    },
  });
}

export function useResolveVendorIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vendorId,
      issueId,
      resolution,
    }: {
      vendorId: string;
      issueId: string;
      resolution: string;
    }) => updateIssue(vendorId, issueId, { status: 'resolved', resolution }),
    onSuccess: (_, { vendorId }) => {
      queryClient.invalidateQueries({ queryKey: ['vendor-issues', vendorId] });
      queryClient.invalidateQueries({ queryKey: ['vendor-metrics', vendorId] });
    },
  });
}
