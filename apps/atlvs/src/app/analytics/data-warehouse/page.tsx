'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, RefreshCw, Plug } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import {
  ListPage, Badge, DetailDrawer, RecordFormModal, Grid, Body,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection, type FormFieldConfig,
} from '@ghxstship/ui';
import { getBadgeVariant, createExportHandler } from '@ghxstship/config';

interface DataSource {
  id: string;
  name: string;
  type: 'Database' | 'API' | 'File' | 'Streaming';
  status: 'Connected' | 'Syncing' | 'Error' | 'Disconnected';
  lastSync: string;
  recordCount: number;
  syncFrequency: string;
  [key: string]: unknown;
}

const mockData: DataSource[] = [
  { id: 'SRC-001', name: 'ATLVS Production DB', type: 'Database', status: 'Connected', lastSync: '2024-11-25 10:30', recordCount: 2450000, syncFrequency: 'Real-time' },
  { id: 'SRC-002', name: 'COMPVSS Events DB', type: 'Database', status: 'Connected', lastSync: '2024-11-25 10:30', recordCount: 1850000, syncFrequency: 'Real-time' },
  { id: 'SRC-003', name: 'GVTEWAY Consumer DB', type: 'Database', status: 'Syncing', lastSync: '2024-11-25 10:15', recordCount: 3200000, syncFrequency: '15 min' },
  { id: 'SRC-004', name: 'Stripe Payments API', type: 'API', status: 'Connected', lastSync: '2024-11-25 10:28', recordCount: 450000, syncFrequency: 'Hourly' },
  { id: 'SRC-005', name: 'Salesforce CRM', type: 'API', status: 'Connected', lastSync: '2024-11-25 09:00', recordCount: 125000, syncFrequency: 'Daily' },
  { id: 'SRC-006', name: 'Google Analytics', type: 'API', status: 'Error', lastSync: '2024-11-24 18:00', recordCount: 8500000, syncFrequency: 'Daily' },
];

const formatRecords = (count: number) => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
  return count.toString();
};

const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<DataSource>[] = [
  { key: 'name', label: 'Source', accessor: 'name', sortable: true },
  { key: 'type', label: 'Type', accessor: 'type', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'recordCount', label: 'Records', accessor: (r) => formatRecords(r.recordCount), sortable: true },
  { key: 'syncFrequency', label: 'Sync Frequency', accessor: 'syncFrequency' },
  { key: 'lastSync', label: 'Last Sync', accessor: 'lastSync', sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'type', label: 'Type', options: [{ value: 'Database', label: 'Database' }, { value: 'API', label: 'API' }, { value: 'File', label: 'File' }, { value: 'Streaming', label: 'Streaming' }] },
  { key: 'status', label: 'Status', options: [{ value: 'Connected', label: 'Connected' }, { value: 'Syncing', label: 'Syncing' }, { value: 'Error', label: 'Error' }, { value: 'Disconnected', label: 'Disconnected' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Source Name', type: 'text', required: true },
  { name: 'type', label: 'Type', type: 'select', required: true, options: [{ value: 'Database', label: 'Database' }, { value: 'API', label: 'API' }, { value: 'File', label: 'File' }, { value: 'Streaming', label: 'Streaming' }] },
  { name: 'syncFrequency', label: 'Sync Frequency', type: 'select', options: [{ value: 'Real-time', label: 'Real-time' }, { value: '15 min', label: '15 Minutes' }, { value: 'Hourly', label: 'Hourly' }, { value: 'Daily', label: 'Daily' }] },
  { name: 'connectionString', label: 'Connection String', type: 'text', required: true },
];

export default function DataWarehousePage() {
  const router = useRouter();
  const [data] = useState<DataSource[]>(mockData);
  const [selected, setSelected] = useState<DataSource | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const connectedSources = data.filter(s => s.status === 'Connected').length;
  const errorSources = data.filter(s => s.status === 'Error').length;
  const totalRecords = data.reduce((sum, s) => sum + s.recordCount, 0);

  const rowActions: ListPageAction<DataSource>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'sync', label: 'Sync Now', icon: <RefreshCw className="size-4" />, onClick: (r) => {
      fetch(`/api/data-sources/${r.id}/sync`, { method: 'POST' });
    }},
    { id: 'reconnect', label: 'Reconnect', icon: <Plug className="size-4" />, onClick: (r) => {
      fetch(`/api/data-sources/${r.id}/reconnect`, { method: 'POST' });
    }},
  ];

  const stats = [
    { label: 'Data Sources', value: data.length },
    { label: 'Connected', value: connectedSources },
    { label: 'Total Records', value: formatRecords(totalRecords) },
    { label: 'Errors', value: errorSources },
  ];

  const handleCreate = async (formData: Record<string, unknown>) => {
    await fetch('/api/data-sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    setCreateModalOpen(false);
  };

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Data Source Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Name:</strong> {selected.name}</Body>
        <Body size="sm"><strong>Type:</strong> {selected.type}</Body>
        <Body size="sm"><strong>Status:</strong> {selected.status}</Body>
        <Body size="sm"><strong>Sync Frequency:</strong> {selected.syncFrequency}</Body>
        <Body size="sm"><strong>Total Records:</strong> {selected.recordCount.toLocaleString()}</Body>
        <Body size="sm"><strong>Last Sync:</strong> {selected.lastSync}</Body>
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<DataSource, 'id'>>({

    entityType: 'data-sources',

    requiredFields: ['name', 'type', 'syncFrequency'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/data-sources', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      refetch();

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('data-sources');


  return (
    <AtlvsAppLayout>
      <ListPage<DataSource>
        title="Data Warehouse Integration"
        subtitle="Manage data sources, ETL pipelines, and warehouse connections"
        data={data}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search data sources..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        createLabel="Add Data Source"
        onCreate={() => setCreateModalOpen(true)}
        entityType="data-sources"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['name', 'type', 'syncFrequency', 'connectionString', 'recordCount', 'lastSync', 'status']}
        onExport={createExportHandler({
          filename: "data-sources",
          getData: () => data.map(d => ({
            id: d.id,
            name: d.name,
            type: d.type,
            status: d.status,
            lastSync: d.lastSync,
            recordCount: d.recordCount,
            syncFrequency: d.syncFrequency,
          })),
        })}
        stats={stats}
        emptyMessage="No data sources configured"
        emptyAction={{ label: 'Add Data Source', onClick: () => setCreateModalOpen(true) }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/data-sources/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          } else if (action === 'sync') {
            await fetch('/api/data-sources/bulk-sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          }
        }}
        bulkActions={[
          { id: 'sync', label: 'Sync Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />
      <RecordFormModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} mode="create" title="Add Data Source" fields={formFields} onSubmit={handleCreate} size="lg" />
      {selected && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selected}
          title={(r) => r.name}
          subtitle={(r) => `${r.type} • ${r.status}`}
          sections={detailSections}
          actions={[{ id: 'sync', label: 'Sync Now', icon: <RefreshCw className="size-4" /> }, { id: 'configure', label: 'Configure', icon: <Plug className="size-4" /> }]}
          onAction={(id, r) => {
            if (id === 'sync') fetch(`/api/data-sources/${r.id}/sync`, { method: 'POST' });
            if (id === 'configure') router.push(`/analytics/data-warehouse/${r.id}/configure`);
            setDrawerOpen(false);
          }}
        />
      )}
    </AtlvsAppLayout>
  );
}
