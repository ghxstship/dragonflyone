'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Copy } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import {
  ListPage, Badge, DetailDrawer, RecordFormModal, Grid, Body,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection, type FormFieldConfig,
} from '@ghxstship/ui';
import { createExportHandler, createImportHandler, getImportTemplates, createImportHandler, getImportTemplates } from '@ghxstship/config';

interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgetCount: number;
  isDefault: boolean;
  createdAt: string;
  lastModified: string;
  status: 'Active' | 'Draft';
  [key: string]: unknown;
}

const mockData: Dashboard[] = [
  { id: 'DB-001', name: 'Executive Overview', description: 'High-level KPIs for leadership', widgetCount: 8, isDefault: true, createdAt: '2024-11-01', lastModified: '2024-11-20', status: 'Active' },
  { id: 'DB-002', name: 'Finance Dashboard', description: 'Financial metrics and trends', widgetCount: 12, isDefault: false, createdAt: '2024-11-10', lastModified: '2024-11-18', status: 'Active' },
  { id: 'DB-003', name: 'Operations Dashboard', description: 'Operational KPIs and workflows', widgetCount: 6, isDefault: false, createdAt: '2024-11-15', lastModified: '2024-11-15', status: 'Draft' },
  { id: 'DB-004', name: 'Sales Pipeline', description: 'Deal tracking and forecasting', widgetCount: 10, isDefault: false, createdAt: '2024-10-20', lastModified: '2024-11-22', status: 'Active' },
  { id: 'DB-005', name: 'HR Analytics', description: 'Workforce metrics', widgetCount: 5, isDefault: false, createdAt: '2024-10-15', lastModified: '2024-11-10', status: 'Active' },
];

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
  const [data, setData] = useState<Dashboard[]>(mockData);
  const [selected, setSelected] = useState<Dashboard | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const totalWidgets = data.reduce((sum, d) => sum + d.widgetCount, 0);

  const rowActions: ListPageAction<Dashboard>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit Dashboard', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/analytics/dashboard-builder/${r.id}`) },
    { id: 'duplicate', label: 'Duplicate', icon: <Copy className="size-4" />, onClick: (r) => {
      const duplicated: Dashboard = { ...r, id: `DB-${Date.now()}`, name: `${r.name} (Copy)`, isDefault: false, createdAt: new Date().toISOString().split('T')[0], lastModified: new Date().toISOString().split('T')[0] };
      setData(prev => [...prev, duplicated]);
    }},
  ];

  const stats = [
    { label: 'Total Dashboards', value: data.length },
    { label: 'Active', value: data.filter(d => d.status === 'Active').length },
    { label: 'Total Widgets', value: totalWidgets },
    { label: 'Default Set', value: data.filter(d => d.isDefault).length },
  ];

  const handleCreate = async (formData: Record<string, unknown>) => {
    const newDashboard: Dashboard = {
      id: `DB-${Date.now()}`,
      name: String(formData.name || 'Untitled'),
      description: String(formData.description || ''),
      widgetCount: 0,
      isDefault: false,
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      status: 'Draft',
    };
    setData(prev => [...prev, newDashboard]);
    setCreateModalOpen(false);
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

      refetch();

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
        loading={false}
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
            setData(prev => prev.filter(d => !ids.includes(d.id)));
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
