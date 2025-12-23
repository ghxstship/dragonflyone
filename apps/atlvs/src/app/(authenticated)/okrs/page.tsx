"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2 } from "lucide-react";
// Layout provided by route group
import {
  ListPage,
  Badge,
  DetailDrawer,
  RecordFormModal,
  ConfirmDialog,
  Grid,
  Body,
  useNotifications,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
  type FormFieldConfig,
} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates } from "@ghxstship/config";
import { useOKRs, useCreateOKR, useDeleteOKR, type OKR } from "@/hooks/useOKRs";
import { DEMO_OKRS_LIST } from "../../../lib/demo-data";

const getProgressVariant = (progress: number): 'solid' | 'outline' | 'ghost' => {
  if (progress >= 70) return 'solid';
  if (progress >= 50) return 'outline';
  return 'ghost';
};

const columns: ListPageColumn<OKR>[] = [
  { key: 'id', label: 'ID', accessor: (r) => r.id.slice(0, 8), sortable: true },
  { key: 'title', label: 'Objective', accessor: 'title', sortable: true },
  { key: 'okr_type', label: 'Type', accessor: 'okr_type', sortable: true, render: (v) => <Badge variant="outline">{String(v).toUpperCase()}</Badge> },
  { key: 'progress', label: 'Progress', accessor: (r) => `${r.progress_percentage || 0}%`, sortable: true, render: (v, r) => <Badge variant={getProgressVariant(r.progress_percentage || 0)}>{String(v)}</Badge> },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={v === 'on_track' ? 'solid' : v === 'at_risk' ? 'warning' : 'outline'}>{String(v).replace('_', ' ').toUpperCase()}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'okr_type', label: 'Type', options: [
    { value: 'objective', label: 'Objective' },
    { value: 'key_result', label: 'Key Result' },
  ]},
  { key: 'status', label: 'Status', options: [
    { value: 'on_track', label: 'On Track' },
    { value: 'at_risk', label: 'At Risk' },
    { value: 'behind', label: 'Behind' },
    { value: 'completed', label: 'Completed' },
  ]},
];

const formFields: FormFieldConfig[] = [
  { name: 'title', label: 'Objective Title', type: 'text', required: true, colSpan: 2 },
  { name: 'okr_type', label: 'Type', type: 'select', required: true, options: [
    { value: 'objective', label: 'Objective' },
    { value: 'key_result', label: 'Key Result' },
  ]},
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'on_track', label: 'On Track' },
    { value: 'at_risk', label: 'At Risk' },
    { value: 'behind', label: 'Behind' },
  ]},
  { name: 'target_value', label: 'Target Value', type: 'number' },
  { name: 'current_value', label: 'Current Value', type: 'number' },
  { name: 'unit', label: 'Unit', type: 'text' },
  { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
];

export default function OKRsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const { data: okrsData, isLoading, error, refetch } = useOKRs();
  const createMutation = useCreateOKR();
  const deleteMutation = useDeleteOKR();

  // Fallback to demo data if API returns empty
  const okrs = (okrsData && okrsData.length > 0) ? okrsData : DEMO_OKRS_LIST.map(d => ({
    id: d.id,
    organization_id: 'demo',
    okr_type: 'objective',
    title: d.objective,
    description: '',
    progress_percentage: d.progress,
    status: d.progress >= 70 ? 'on_track' : d.progress >= 50 ? 'in_progress' : 'at_risk',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })) as OKR[];

  const [selectedOKR, setSelectedOKR] = useState<OKR | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [okrToDelete, setOkrToDelete] = useState<OKR | null>(null);

  const avgProgress = okrs.length > 0 ? Math.round(okrs.reduce((sum, o) => sum + (o.progress_percentage || 0), 0) / okrs.length) : 0;
  const onTrackCount = okrs.filter(o => o.status === 'on_track' || (o.progress_percentage || 0) >= 70).length;
  const atRiskCount = okrs.filter(o => o.status === 'at_risk' || (o.progress_percentage || 0) < 50).length;

  const rowActions: ListPageAction<OKR>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedOKR(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/okrs/${r.id}/edit`) },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (r) => { setOkrToDelete(r); setDeleteConfirmOpen(true); } },
  ];

  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'okrs',
    requiredFields: ['title', 'okr_type'],
    onImport: async (records) => {
      for (const record of records) {
        await fetch('/api/okrs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ organization_id: 'default-org', ...record }),
        });
      }
      refetch();
    },
  });

  const importTemplates = getImportTemplates('okrs').length > 0 
    ? getImportTemplates('okrs') 
    : [{ id: 'default', name: 'OKR Import', mapping: { title: 'title', okr_type: 'okr_type', target_value: 'target_value' } }];

  const stats = [
    { label: 'Active OKRs', value: okrs.length },
    { label: 'Avg Progress', value: `${avgProgress}%` },
    { label: 'On Track', value: onTrackCount },
    { label: 'At Risk', value: atRiskCount },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createMutation.mutateAsync({
        organization_id: String(data.organization_id || 'default-org'),
        okr_type: String(data.okr_type || 'objective'),
        title: String(data.title || ''),
        description: data.description ? String(data.description) : undefined,
        target_value: data.target_value ? Number(data.target_value) : undefined,
        current_value: data.current_value ? Number(data.current_value) : undefined,
        unit: data.unit ? String(data.unit) : undefined,
        status: String(data.status || 'on_track'),
      });
      setCreateModalOpen(false);
      addNotification({ type: 'success', title: 'OKR Created', message: 'OKR has been created successfully.' });
    } catch (err) {
      addNotification({ type: 'error', title: 'Failed to Create OKR', message: err instanceof Error ? err.message : 'An unexpected error occurred' });
    }
  };

  const handleDelete = async () => {
    if (okrToDelete) {
      try {
        await deleteMutation.mutateAsync(okrToDelete.id);
        setDeleteConfirmOpen(false);
        addNotification({ type: 'success', title: 'OKR Deleted', message: 'OKR has been deleted.' });
        setOkrToDelete(null);
      } catch (err) {
        addNotification({ type: 'error', title: 'Failed to Delete OKR', message: err instanceof Error ? err.message : 'An unexpected error occurred' });
      }
    }
  };

  const detailSections: DetailSection[] = selectedOKR ? [
    { id: 'overview', title: 'OKR Details', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>ID:</strong> {selectedOKR.id.slice(0, 8)}</Body>
        <Body size="sm"><strong>Type:</strong> {selectedOKR.okr_type}</Body>
        <Body size="sm" className="col-span-2"><strong>Title:</strong> {selectedOKR.title}</Body>
        <Body size="sm"><strong>Progress:</strong> {selectedOKR.progress_percentage || 0}%</Body>
        <Body size="sm"><strong>Status:</strong> {selectedOKR.status?.replace('_', ' ').toUpperCase()}</Body>
        <Body size="sm"><strong>Target:</strong> {selectedOKR.target_value || '—'} {selectedOKR.unit || ''}</Body>
        <Body size="sm"><strong>Current:</strong> {selectedOKR.current_value || '—'} {selectedOKR.unit || ''}</Body>
        {selectedOKR.description && <Body size="sm" className="col-span-2"><strong>Description:</strong> {selectedOKR.description}</Body>}
      </Grid>
    )},
  ] : [];

  return (
    <>
      <ListPage<OKR>
        title="OKRs & Strategic Goals"
        subtitle="Track objectives and key results across the organization"
        data={okrs}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error ? new Error(error.message) : undefined}
        searchPlaceholder="Search OKRs..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedOKR(r); setDrawerOpen(true); }}
        createLabel="Create New OKR"
        onCreate={() => setCreateModalOpen(true)}
        entityType="okrs"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['title', 'okr_type', 'target_value']}
        onExport={createExportHandler({
          filename: "okrs",
          getData: () => okrs.map(o => ({
            id: o.id,
            title: o.title,
            type: o.okr_type,
            target_value: o.target_value || '',
            current_value: o.current_value || '',
            progress: o.progress_percentage || 0,
            status: o.status,
          })),
        })}
        stats={stats}
        emptyMessage="No OKRs found"
        emptyAction={{ label: 'Create OKR', onClick: () => setCreateModalOpen(true) }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            for (const id of ids) {
              await deleteMutation.mutateAsync(id);
            }
          } else if (action === 'archive') {
            await fetch('/api/okrs/bulk-archive', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch();
          }
        }}
        bulkActions={[
          { id: 'archive', label: 'Archive Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create New OKR"
        fields={formFields}
        onSubmit={handleCreate}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete OKR"
        message={`Are you sure you want to delete "${okrToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setOkrToDelete(null); }}
      />

      {selectedOKR && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedOKR}
          title={(o) => o.title}
          subtitle={(o) => `${o.okr_type.toUpperCase()} • ${o.progress_percentage || 0}% Complete`}
          sections={detailSections}
          onEdit={(o) => router.push(`/okrs/${o.id}/edit`)}
        />
      )}
    </>
  );
}
