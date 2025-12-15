'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Copy } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import {
  ListPage, Badge, DetailDrawer, RecordFormModal, Grid, Body,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection, type FormFieldConfig,
} from '@ghxstship/ui';
import { createExportHandler, createImportHandler, getImportTemplates, useDashboardBuilder, type DashboardConfig } from '@ghxstship/config';
import { DEMO_DASHBOARDS } from '../../../lib/demo-data';

type Dashboard = DashboardConfig;

const columns: ListPageColumn<Dashboard>[] = [
  { key: 'name', label: 'Dashboard', accessor: 'name', sortable: true },
  { key: 'description', label: 'Description', accessor: (r) => r.description || '—' },
  { key: 'widgetCount', label: 'Widgets', accessor: 'widgetCount', sortable: true },
  { key: 'isDefault', label: 'Default', accessor: (r) => r.isDefault ? '✓' : '—' },
  { key: 'lastModified', label: 'Last Modified', accessor: 'lastModified', sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={v === 'Active' ? 'solid' : 'outline'}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'Active', label: 'Active' }, { value: 'Draft', label: 'Draft' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Dashboard Name', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'template', label: 'Start From', type: 'select', options: [{ value: 'blank', label: 'Blank Dashboard' }, { value: 'executive', label: 'Executive Template' }, { value: 'finance', label: 'Finance Template' }] },
];

export default function DashboardBuilderPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<Dashboard | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Real API integration with demo fallback
  const { dashboards: apiData, isLoading, error, createDashboardAsync, duplicateDashboardAsync, deleteDashboardsAsync, refetch } = useDashboardBuilder();
  const data: Dashboard[] = apiData.length > 0 ? apiData : (DEMO_DASHBOARDS as unknown as Dashboard[]);

  const totalWidgets = data.reduce((sum, d) => sum + d.widgetCount, 0);

  const rowActions: ListPageAction<Dashboard>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit Dashboard', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/analytics/dashboard-builder/${r.id}`) },
    { id: 'duplicate', label: 'Duplicate', icon: <Copy className="size-4" />, onClick: async (r) => {
      await duplicateDashboardAsync(r.id);
      refetch();
    }},
  ];

  const stats = [
    { label: 'Total Dashboards', value: data.length },
    { label: 'Active', value: data.filter(d => d.status === 'Active').length },
    { label: 'Total Widgets', value: totalWidgets },
    { label: 'Default Set', value: data.filter(d => d.isDefault).length },
  ];

  const handleCreate = async (formData: Record<string, unknown>) => {
    await createDashboardAsync({
      name: String(formData.name || 'Untitled'),
      description: String(formData.description || ''),
      widgetCount: 0,
      isDefault: false,
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      status: 'Draft',
    });
    setCreateModalOpen(false);
    refetch();
  };

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Dashboard Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Name:</strong> {selected.name}</Body>
        <Body size="sm"><strong>Status:</strong> {selected.status}</Body>
        <Body size="sm"><strong>Widgets:</strong> {selected.widgetCount}</Body>
        <Body size="sm"><strong>Default:</strong> {selected.isDefault ? 'Yes' : 'No'}</Body>
        <Body size="sm"><strong>Created:</strong> {selected.createdAt}</Body>
        <Body size="sm"><strong>Last Modified:</strong> {selected.lastModified}</Body>
        {selected.description && <Body size="sm" className="col-span-2"><strong>Description:</strong> {selected.description}</Body>}
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<Dashboard, 'id'>>({

    entityType: 'dashboards',

    requiredFields: ['name', 'description', 'template'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/dashboards', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      // Data refreshed after import

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('dashboards');


  return (
    <AtlvsAppLayout>
      <ListPage<Dashboard>
        title="Dashboard Builder"
        subtitle="Create and customize analytics dashboards"
        data={data}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error as Error | undefined}
        searchPlaceholder="Search dashboards..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        createLabel="New Dashboard"
        onCreate={() => setCreateModalOpen(true)}
        entityType="dashboards"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['name', 'description', 'template', 'dashboards', 'widgetCount', 'isDefault', 'lastModified']}
        onExport={createExportHandler({
          filename: "dashboards",
          getData: () => data.map(d => ({
            id: d.id,
            name: d.name,
            description: d.description || '',
            widgetCount: d.widgetCount,
            isDefault: d.isDefault,
            status: d.status,
            createdAt: d.createdAt,
            lastModified: d.lastModified,
          })),
        })}
        stats={stats}
        emptyMessage="No dashboards found"
        emptyAction={{ label: 'Create Dashboard', onClick: () => setCreateModalOpen(true) }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await deleteDashboardsAsync(ids);
            refetch();
          }
        }}
        bulkActions={[
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />
      <RecordFormModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} mode="create" title="Create Dashboard" fields={formFields} onSubmit={handleCreate} />
      {selected && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selected}
          title={(r) => r.name}
          subtitle={(r) => `${r.widgetCount} widgets • ${r.status}`}
          sections={detailSections}
          actions={[{ id: 'edit', label: 'Edit Dashboard', icon: <Pencil className="size-4" /> }, { id: 'duplicate', label: 'Duplicate', icon: <Copy className="size-4" /> }]}
          onAction={(id, r) => { if (id === 'edit') router.push(`/analytics/dashboard-builder/${r.id}`); setDrawerOpen(false); }}
        />
      )}
    </AtlvsAppLayout>
  );
}
