"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Upload, Pencil } from "lucide-react";
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
import { useRFPData, type RFP } from "@/hooks/useRFP";

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
};
const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<RFP>[] = [
  { key: 'title', label: 'Title', accessor: 'title', sortable: true },
  { key: 'project_type', label: 'Type', accessor: 'project_type', render: (v) => <Badge variant="ghost">{String(v) || 'General'}</Badge> },
  { key: 'budget', label: 'Budget Range', accessor: (r) => r.budget_min && r.budget_max ? `${formatCurrency(r.budget_min)} - ${formatCurrency(r.budget_max)}` : r.budget_max ? formatCurrency(r.budget_max) : '—' },
  { key: 'responses', label: 'Responses', accessor: (r) => r.responses?.[0]?.count || 0, sortable: true },
  { key: 'submission_deadline', label: 'Deadline', accessor: (r) => r.submission_deadline ? new Date(r.submission_deadline).toLocaleDateString() : '—', sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'draft', label: 'Draft' }, { value: 'open', label: 'Open' }, { value: 'evaluation', label: 'Evaluation' }, { value: 'awarded', label: 'Awarded' }, { value: 'closed', label: 'Closed' }] },
];

export default function RFPPage() {
  const router = useRouter();
  const {
    rfps,
    openCount,
    totalResponses,
    isLoading: loading,
    error,
    refetch,
  } = useRFPData();

  const [selectedRfp, setSelectedRfp] = useState<RFP | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalBudget = rfps.reduce((sum: number, r: RFP) => sum + (Number(r.budget_max) || 0), 0);

  const rowActions: ListPageAction<RFP>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedRfp(r); setDrawerOpen(true); } },
    { id: 'publish', label: 'Publish', icon: <Upload className="size-4" />, onClick: async (r) => { await fetch(`/api/rfp/${r.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'open' }) }); refetch(); } },
  ];

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'rfp',
    requiredFields: ['title', 'project_type'],
    onImport: async (records) => {
      for (const record of records) {
        await fetch('/api/rfp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
      }
      refetch();
    },
  });

  const importTemplates = getImportTemplates('rfp').length > 0 
    ? getImportTemplates('rfp') 
    : [{ id: 'default', name: 'RFP Import', mapping: { title: 'title', project_type: 'project_type', budget_min: 'budget_min', budget_max: 'budget_max', deadline: 'deadline' } }];

  const stats = [
    { label: 'Total RFPs', value: rfps.length },
    { label: 'Open', value: openCount },
    { label: 'Total Budget', value: formatCurrency(totalBudget) },
    { label: 'Responses', value: totalResponses },
  ];

  const detailSections: DetailSection[] = selectedRfp ? [
    { id: 'overview', title: 'RFP Details', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Title:</strong> {selectedRfp.title}</Body>
        <Body size="sm"><strong>Type:</strong> {selectedRfp.project_type || 'General'}</Body>
        <Body size="sm"><strong>Budget:</strong> {selectedRfp.budget_min && selectedRfp.budget_max ? `${formatCurrency(selectedRfp.budget_min)} - ${formatCurrency(selectedRfp.budget_max)}` : '—'}</Body>
        <Body size="sm"><strong>Responses:</strong> {selectedRfp.responses?.[0]?.count || 0}</Body>
        <Body size="sm"><strong>Deadline:</strong> {selectedRfp.submission_deadline ? new Date(selectedRfp.submission_deadline).toLocaleDateString() : '—'}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedRfp.status}</Body>
        <Body size="sm"><strong>Created By:</strong> {selectedRfp.created_by_user?.full_name || '—'}</Body>
        <Body size="sm"><strong>Created:</strong> {new Date(selectedRfp.created_at).toLocaleDateString()}</Body>
        {selectedRfp.description && <Body size="sm" className="col-span-2"><strong>Description:</strong> {selectedRfp.description}</Body>}
      </Grid>
    )},
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<RFP>
        title="RFP Management"
        subtitle="Create and manage requests for proposals"
        data={rfps}
        columns={columns}
        rowKey="id"
        loading={loading}
        error={error ? new Error(error) : undefined}
        onRetry={() => refetch()}
        searchPlaceholder="Search RFPs..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedRfp(r); setDrawerOpen(true); }}
        createLabel="Create RFP"
        onCreate={() => router.push('/rfp/new')}
        entityType="rfps"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['title', 'project_type', 'budget_min', 'budget_max', 'deadline']}
        onExport={createExportHandler({
          filename: "rfps",
          getData: () => rfps.map(r => ({
            id: r.id,
            title: r.title,
            client: r.client_name,
            status: r.status,
            deadline: r.deadline,
            value: r.estimated_value,
          })),
        })}
        stats={stats}
        emptyMessage="No RFPs found"
        emptyAction={{ label: 'Create RFP', onClick: () => router.push('/rfp/new') }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/rfps/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          } else if (action === 'archive') {
            await fetch('/api/rfps/bulk-archive', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          }
        }}
        bulkActions={[
          { id: 'archive', label: 'Archive Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />
      {selectedRfp && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedRfp}
          title={(r) => r.title}
          subtitle={(r) => `${r.project_type || 'General'} • ${r.status}`}
          sections={detailSections}
          actions={[{ id: 'edit', label: 'Edit RFP', icon: <Pencil className="size-4" /> }, { id: 'publish', label: 'Publish', icon: <Upload className="size-4" /> }]}
          onAction={(id, r) => { if (id === 'edit') router.push(`/rfp/${r.id}`); setDrawerOpen(false); }}
        />
      )}
    </AtlvsAppLayout>
  );
}
