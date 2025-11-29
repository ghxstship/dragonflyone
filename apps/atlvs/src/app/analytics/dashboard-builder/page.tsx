'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../../components/navigation';
import {
  ListPage, Badge, DetailDrawer, RecordFormModal,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection, type FormFieldConfig,
} from '@ghxstship/ui';

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
  const [data] = useState<Dashboard[]>(mockData);
  const [selected, setSelected] = useState<Dashboard | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const totalWidgets = data.reduce((sum, d) => sum + d.widgetCount, 0);

  const rowActions: ListPageAction<Dashboard>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit Dashboard', icon: '✏️', onClick: (r) => router.push(`/analytics/dashboard-builder/${r.id}`) },
    { id: 'duplicate', label: 'Duplicate', icon: '📋', onClick: (r) => console.log('Duplicate', r.id) },
  ];

  const stats = [
    { label: 'Total Dashboards', value: data.length },
    { label: 'Active', value: data.filter(d => d.status === 'Active').length },
    { label: 'Total Widgets', value: totalWidgets },
    { label: 'Default Set', value: data.filter(d => d.isDefault).length },
  ];

  const handleCreate = async (formData: Record<string, unknown>) => {
    console.log('Create dashboard:', formData);
    setCreateModalOpen(false);
  };

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Dashboard Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Name:</strong> {selected.name}</div>
        <div><strong>Status:</strong> {selected.status}</div>
        <div><strong>Widgets:</strong> {selected.widgetCount}</div>
        <div><strong>Default:</strong> {selected.isDefault ? 'Yes' : 'No'}</div>
        <div><strong>Created:</strong> {selected.createdAt}</div>
        <div><strong>Last Modified:</strong> {selected.lastModified}</div>
        {selected.description && <div className="col-span-2"><strong>Description:</strong> {selected.description}</div>}
      </div>
    )},
  ] : [];

  return (
    <>
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
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No dashboards found"
        emptyAction={{ label: 'Create Dashboard', onClick: () => setCreateModalOpen(true) }}
        header={<CreatorNavigationAuthenticated
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Analytics', href: '/analytics' }, { label: 'Dashboard Builder' }]}
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
        showFavorite
        showSettings />}
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
          actions={[{ id: 'edit', label: 'Edit Dashboard', icon: '✏️' }, { id: 'duplicate', label: 'Duplicate', icon: '📋' }]}
          onAction={(id, r) => { if (id === 'edit') router.push(`/analytics/dashboard-builder/${r.id}`); setDrawerOpen(false); }}
        />
      )}
    </>
  );
}
