"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil } from "lucide-react";
import { AtlvsAppLayout } from "../../components/app-layout";
import {
  ListPage,
  Badge,
  DetailDrawer,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from "@ghxstship/ui";
import { getBadgeVariant, createExportHandler, createImportHandler, getImportTemplates } from "@ghxstship/config";
import { usePerformanceData, type Review } from "@/hooks/usePerformance";

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
  const {
    reviews,
    completedCount,
    avgScore,
    inProgressCount,
    isLoading: loading,
    error,
    refetch,
  } = usePerformanceData();

  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const rowActions: ListPageAction<Review>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedReview(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/performance/reviews/${r.id}`) },
  ];

  const stats = [
    { label: 'Total Reviews', value: reviews.length },
    { label: 'Completed', value: completedCount },
    { label: 'Avg Score', value: avgScore.toFixed(1) },
    { label: 'In Progress', value: inProgressCount },
  ];

  const detailSections: DetailSection[] = selectedReview ? [
    { id: 'overview', title: 'Review Details', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Employee:</strong> {selectedReview.employee?.full_name || '—'}</Body>
        <Body size="sm"><strong>Reviewer:</strong> {selectedReview.reviewer?.full_name || '—'}</Body>
        <Body size="sm"><strong>Period:</strong> {selectedReview.review_period}</Body>
        <Body size="sm"><strong>Type:</strong> {formatStatus(selectedReview.review_type)}</Body>
        <Body size="sm"><strong>Score:</strong> {selectedReview.overall_score > 0 ? selectedReview.overall_score.toFixed(1) : '—'}</Body>
        <Body size="sm"><strong>Status:</strong> {formatStatus(selectedReview.status)}</Body>
        <Body size="sm"><strong>Scheduled:</strong> {selectedReview.scheduled_date ? new Date(selectedReview.scheduled_date).toLocaleDateString() : '—'}</Body>
        {selectedReview.strengths?.length > 0 && <Body size="sm" className="col-span-2"><strong>Strengths:</strong> {selectedReview.strengths.join(', ')}</Body>}
        {selectedReview.improvements?.length > 0 && <Body size="sm" className="col-span-2"><strong>Improvements:</strong> {selectedReview.improvements.join(', ')}</Body>}
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<Review, 'id'>>({

    entityType: 'performance-reviews',

    requiredFields: ['employee', 'reviewer', 'review_period'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/performance-reviews', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      refetch();

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('performance-reviews');


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
        onRetry={() => refetch()}
        searchPlaceholder="Search reviews..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedReview(r); setDrawerOpen(true); }}
        createLabel="Schedule Review"
        onCreate={() => router.push('/performance/reviews/new')}
        entityType="performance-reviews"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['employee', 'reviewer', 'review_period', 'review_type', 'overall_score', 'status']}
        onExport={createExportHandler({
          filename: "performance-reviews",
          getData: () => reviews.map(r => ({
            id: r.id,
            employee: r.employee?.full_name,
            reviewer: r.reviewer?.full_name,
            period: r.review_period,
            rating: r.overall_score,
            status: r.status,
            due_date: r.scheduled_date || '',
          })),
        })}
        stats={stats}
        emptyMessage="No reviews found"
        emptyAction={{ label: 'Schedule Review', onClick: () => router.push('/performance/reviews/new') }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/performance/reviews/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            await refetch();
          }
        }}
        bulkActions={[
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
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
