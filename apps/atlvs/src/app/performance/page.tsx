"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil } from "lucide-react";
import { AtlvsAppLayout } from "../../components/app-layout";
import {
  ListPage,
  Badge,
  DetailDrawer,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from "@ghxstship/ui";
import { getBadgeVariant } from "@ghxstship/config";

interface Review {
  id: string;
  employee_id: string;
  reviewer_id: string;
  employee?: { id: string; full_name: string; email: string };
  reviewer?: { id: string; full_name: string; email: string };
  review_period: string;
  review_type: string;
  status: string;
  overall_score: number;
  strengths: string[];
  improvements: string[];
  scheduled_date: string;
  created_at: string;
  [key: string]: unknown;
}

const getStatusVariant = getBadgeVariant;
const formatStatus = (status: string) => status?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || status;

const columns: ListPageColumn<Review>[] = [
  { key: 'employee', label: 'Employee', accessor: (r) => r.employee?.full_name || '—', sortable: true },
  { key: 'reviewer', label: 'Reviewer', accessor: (r) => r.reviewer?.full_name || '—' },
  { key: 'review_period', label: 'Period', accessor: 'review_period', sortable: true },
  { key: 'review_type', label: 'Type', accessor: 'review_type', render: (v) => <Badge variant="ghost">{formatStatus(String(v))}</Badge> },
  { key: 'overall_score', label: 'Score', accessor: (r) => r.overall_score > 0 ? r.overall_score.toFixed(1) : '—', sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{formatStatus(String(v))}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'scheduled', label: 'Scheduled' }, { value: 'in_progress', label: 'In Progress' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }] },
];

export default function PerformancePage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchPerformance = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/performance?include_goals=true');
      if (!response.ok) throw new Error("Failed to fetch performance data");
      const data = await response.json();
      setReviews(data.reviews || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPerformance(); }, [fetchPerformance]);

  const completedCount = reviews.filter(r => r.status === 'completed').length;
  const avgScore = reviews.filter(r => r.overall_score > 0).reduce((sum, r) => sum + r.overall_score, 0) / (reviews.filter(r => r.overall_score > 0).length || 1);

  const rowActions: ListPageAction<Review>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedReview(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/performance/reviews/${r.id}`) },
  ];

  const stats = [
    { label: 'Total Reviews', value: reviews.length },
    { label: 'Completed', value: completedCount },
    { label: 'Avg Score', value: avgScore.toFixed(1) },
    { label: 'In Progress', value: reviews.filter(r => r.status === 'in_progress').length },
  ];

  const detailSections: DetailSection[] = selectedReview ? [
    { id: 'overview', title: 'Review Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Employee:</strong> {selectedReview.employee?.full_name || '—'}</div>
        <div><strong>Reviewer:</strong> {selectedReview.reviewer?.full_name || '—'}</div>
        <div><strong>Period:</strong> {selectedReview.review_period}</div>
        <div><strong>Type:</strong> {formatStatus(selectedReview.review_type)}</div>
        <div><strong>Score:</strong> {selectedReview.overall_score > 0 ? selectedReview.overall_score.toFixed(1) : '—'}</div>
        <div><strong>Status:</strong> {formatStatus(selectedReview.status)}</div>
        <div><strong>Scheduled:</strong> {selectedReview.scheduled_date ? new Date(selectedReview.scheduled_date).toLocaleDateString() : '—'}</div>
        {selectedReview.strengths?.length > 0 && <div className="col-span-2"><strong>Strengths:</strong> {selectedReview.strengths.join(', ')}</div>}
        {selectedReview.improvements?.length > 0 && <div className="col-span-2"><strong>Improvements:</strong> {selectedReview.improvements.join(', ')}</div>}
      </div>
    )},
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<Review>
        title="Performance Reviews"
        subtitle="Track employee performance and development"
        data={reviews}
        columns={columns}
        rowKey="id"
        loading={loading}
        error={error ? new Error(error) : undefined}
        onRetry={fetchPerformance}
        searchPlaceholder="Search reviews..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedReview(r); setDrawerOpen(true); }}
        createLabel="Schedule Review"
        onCreate={() => router.push('/performance/reviews/new')}
        onExport={() => router.push('/performance/goals/new')}
        stats={stats}
        emptyMessage="No reviews found"
        emptyAction={{ label: 'Schedule Review', onClick: () => router.push('/performance/reviews/new') }}
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Performance' }]}
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
        showFavorite
        showSettings
      />
      {selectedReview && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedReview}
          title={(r) => r.employee?.full_name || 'Review'}
          subtitle={(r) => `${r.review_period} • ${formatStatus(r.review_type)}`}
          sections={detailSections}
          actions={[{ id: 'edit', label: 'Edit Review', icon: <Pencil className="size-4" /> }]}
          onAction={(id, r) => { if (id === 'edit') router.push(`/performance/reviews/${r.id}`); setDrawerOpen(false); }}
        />
      )}
    </AtlvsAppLayout>
  );
}
