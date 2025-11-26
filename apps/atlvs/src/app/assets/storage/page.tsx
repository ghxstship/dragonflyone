'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../../components/navigation';
import {
  ListPage, Badge, DetailDrawer,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection,
} from '@ghxstship/ui';
import { getBadgeVariant } from '@ghxstship/config';

interface StorageLocation {
  id: string;
  name: string;
  type: 'Warehouse' | 'Bay' | 'Rack' | 'Container';
  capacity: number;
  used: number;
  category: string;
  address?: string;
  climate: 'Standard' | 'Climate Controlled' | 'Outdoor';
  status: 'Active' | 'Full' | 'Maintenance';
  [key: string]: unknown;
}

const mockData: StorageLocation[] = [
  { id: 'LOC-001', name: 'Main Warehouse', type: 'Warehouse', capacity: 50000, used: 38500, category: 'All', address: '123 Industrial Blvd', climate: 'Climate Controlled', status: 'Active' },
  { id: 'LOC-002', name: 'Audio Bay A', type: 'Bay', capacity: 5000, used: 4200, category: 'Audio', climate: 'Climate Controlled', status: 'Active' },
  { id: 'LOC-003', name: 'Lighting Bay B', type: 'Bay', capacity: 5000, used: 4800, category: 'Lighting', climate: 'Standard', status: 'Active' },
  { id: 'LOC-004', name: 'Video Storage', type: 'Bay', capacity: 3000, used: 3000, category: 'Video', climate: 'Climate Controlled', status: 'Full' },
  { id: 'LOC-005', name: 'Rigging Container', type: 'Container', capacity: 2000, used: 1500, category: 'Rigging', climate: 'Outdoor', status: 'Active' },
  { id: 'LOC-006', name: 'Staging Yard', type: 'Warehouse', capacity: 20000, used: 12000, category: 'Staging', address: '456 Staging Way', climate: 'Outdoor', status: 'Active' },
];

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
  const [data] = useState<StorageLocation[]>(mockData);
  const [selected, setSelected] = useState<StorageLocation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalCapacity = data.reduce((s, l) => s + l.capacity, 0);
  const totalUsed = data.reduce((s, l) => s + l.used, 0);
  const utilizationRate = Math.round((totalUsed / totalCapacity) * 100);
  const fullLocations = data.filter(l => l.status === 'Full').length;

  const rowActions: ListPageAction<StorageLocation>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'assets', label: 'View Assets', icon: '📦', onClick: (r) => router.push(`/assets?location=${r.id}`) },
  ];

  const stats = [
    { label: 'Total Capacity', value: `${(totalCapacity / 1000).toFixed(0)}K sq ft` },
    { label: 'Utilization', value: `${utilizationRate}%` },
    { label: 'Locations', value: data.length },
    { label: 'Full Locations', value: fullLocations },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Location Details', content: (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div><strong>Name:</strong> {selected.name}</div>
        <div><strong>Type:</strong> {selected.type}</div>
        <div><strong>Category:</strong> {selected.category}</div>
        <div><strong>Climate:</strong> {selected.climate}</div>
        <div><strong>Capacity:</strong> {selected.capacity.toLocaleString()} sq ft</div>
        <div><strong>Used:</strong> {selected.used.toLocaleString()} sq ft</div>
        <div><strong>Utilization:</strong> {Math.round((selected.used / selected.capacity) * 100)}%</div>
        <div><strong>Status:</strong> {selected.status}</div>
        {selected.address && <div style={{ gridColumn: 'span 2' }}><strong>Address:</strong> {selected.address}</div>}
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<StorageLocation>
        title="Storage Optimization"
        subtitle="Storage location management and optimization recommendations"
        data={data}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search locations..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No locations found"
        header={<Navigation />}
      />
      {selected && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selected}
          title={(r) => r.name}
          subtitle={(r) => `${r.type} • ${r.climate} • ${Math.round((r.used / r.capacity) * 100)}% utilized`}
          sections={detailSections}
          actions={[{ id: 'assets', label: 'View Assets', icon: '📦' }]}
          onAction={(id, r) => { if (id === 'assets') router.push(`/assets?location=${r.id}`); setDrawerOpen(false); }}
        />
      )}
    </>
  );
}
