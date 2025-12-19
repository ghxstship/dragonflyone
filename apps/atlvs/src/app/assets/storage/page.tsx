'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Package } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import {
  ListPage, Badge, DetailDrawer, Grid, Body,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection,
} from '@ghxstship/ui';
import { getBadgeVariant, createExportHandler, createImportHandler, getImportTemplates, useStorageLocations, type StorageLocation } from '@ghxstship/config';
import { DEMO_STORAGE_LOCATIONS } from '../../../lib/demo-data';

const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<StorageLocation>[] = [
  { key: 'name', label: 'Location', accessor: 'name', sortable: true },
  { key: 'type', label: 'Type', accessor: 'type', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'category', label: 'Category', accessor: 'category' },
  { key: 'utilization', label: 'Utilization', accessor: (r) => `${Math.round((r.used / r.capacity) * 100)}%`, sortable: true },
  { key: 'capacity', label: 'Capacity', accessor: (r) => r.capacity.toLocaleString() },
  { key: 'climate', label: 'Climate', accessor: 'climate' },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'type', label: 'Type', options: [{ value: 'Warehouse', label: 'Warehouse' }, { value: 'Bay', label: 'Bay' }, { value: 'Container', label: 'Container' }] },
  { key: 'status', label: 'Status', options: [{ value: 'Active', label: 'Active' }, { value: 'Full', label: 'Full' }, { value: 'Maintenance', label: 'Maintenance' }] },
  { key: 'climate', label: 'Climate', options: [{ value: 'Climate Controlled', label: 'Climate Controlled' }, { value: 'Standard', label: 'Standard' }, { value: 'Outdoor', label: 'Outdoor' }] },
];

export default function StorageOptimizationPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<StorageLocation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Real API integration with demo fallback
  const { locations: apiData, isLoading, error, deleteLocationsAsync, refetch } = useStorageLocations();
  const data: StorageLocation[] = apiData.length > 0 ? apiData : (DEMO_STORAGE_LOCATIONS as unknown as StorageLocation[]);

  const totalCapacity = data.reduce((s, l) => s + l.capacity, 0);
  const totalUsed = data.reduce((s, l) => s + l.used, 0);
  const utilizationRate = totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0;
  const fullLocations = data.filter(l => l.status === 'Full').length;

  const rowActions: ListPageAction<StorageLocation>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'assets', label: 'View Assets', icon: <Package className="size-4" />, onClick: (r) => router.push(`/assets?location=${r.id}`) },
  ];

  const stats = [
    { label: 'Total Capacity', value: `${(totalCapacity / 1000).toFixed(0)}K sq ft` },
    { label: 'Utilization', value: `${utilizationRate}%` },
    { label: 'Locations', value: data.length },
    { label: 'Full Locations', value: fullLocations },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Location Details', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Name:</strong> {selected.name}</Body>
        <Body size="sm"><strong>Type:</strong> {selected.type}</Body>
        <Body size="sm"><strong>Category:</strong> {selected.category}</Body>
        <Body size="sm"><strong>Climate:</strong> {selected.climate}</Body>
        <Body size="sm"><strong>Capacity:</strong> {selected.capacity.toLocaleString()} sq ft</Body>
        <Body size="sm"><strong>Used:</strong> {selected.used.toLocaleString()} sq ft</Body>
        <Body size="sm"><strong>Utilization:</strong> {Math.round((selected.used / selected.capacity) * 100)}%</Body>
        <Body size="sm"><strong>Status:</strong> {selected.status}</Body>
        {selected.address && <Body size="sm" className="col-span-2"><strong>Address:</strong> {selected.address}</Body>}
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<StorageLocation, 'id'>>({

    entityType: 'storage',

    requiredFields: ['name', 'type', 'category'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/storage', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      // Data refreshed after import

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('storage');


  return (
    <AtlvsAppLayout>
      <ListPage<StorageLocation>
        title="Storage Optimization"
        subtitle="Storage location management and optimization recommendations"
        data={data}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error as Error | undefined}
        searchPlaceholder="Search locations..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        entityType="storage"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['name', 'type', 'category', 'utilization', 'capacity', 'climate', 'status']}
        onExport={createExportHandler({
          filename: "storage-locations",
          getData: () => data.map(l => ({
            id: l.id,
            name: l.name,
            type: l.type,
            capacity: l.capacity,
            used: l.used,
            available: l.available,
            status: l.status,
            address: l.address || '',
          })),
        })}
        stats={stats}
        emptyMessage="No locations found"
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await deleteLocationsAsync(ids);
            refetch();
          }
        }}
        bulkActions={[
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />
      {selected && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selected}
          title={(r) => r.name}
          subtitle={(r) => `${r.type} • ${r.climate} • ${Math.round((r.used / r.capacity) * 100)}% utilized`}
          sections={detailSections}
          actions={[{ id: 'assets', label: 'View Assets', icon: <Package className="size-4" /> }]}
          onAction={(id, r) => { if (id === 'assets') router.push(`/assets?location=${r.id}`); setDrawerOpen(false); }}
        />
      )}
    </AtlvsAppLayout>
  );
}
