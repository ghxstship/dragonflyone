'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../../components/navigation';
import {
  ListPage, Badge, DetailDrawer,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection,
} from '@ghxstship/ui';
import { getBadgeVariant } from '@ghxstship/config';

interface AssetLocation {
  id: string;
  assetId: string;
  assetName: string;
  category: string;
  trackingType: 'GPS' | 'RFID' | 'Manual';
  locationName: string;
  locationAddress: string;
  zone?: string;
  lastSeen: string;
  status: 'Active' | 'In Transit' | 'Stationary' | 'Offline';
  batteryLevel?: number;
  assignedProject?: string;
  [key: string]: unknown;
}

const mockData: AssetLocation[] = [
  { id: 'LOC-001', assetId: 'AST-001', assetName: 'Meyer Sound LEO Line Array', category: 'Audio', trackingType: 'GPS', locationName: 'Tampa Convention Center', locationAddress: '333 S Franklin St, Tampa, FL', zone: 'Loading Dock A', lastSeen: '2024-11-24T14:32:00Z', status: 'Active', batteryLevel: 87, assignedProject: 'PROJ-2024-089' },
  { id: 'LOC-002', assetId: 'AST-002', assetName: 'Robe MegaPointe (24x)', category: 'Lighting', trackingType: 'RFID', locationName: 'Warehouse A', locationAddress: '1234 Industrial Blvd, Tampa, FL', zone: 'Bay 1 - Rack C', lastSeen: '2024-11-24T15:00:00Z', status: 'Stationary' },
  { id: 'LOC-003', assetId: 'AST-003', assetName: 'disguise gx 2c Media Server', category: 'Video', trackingType: 'GPS', locationName: 'In Transit', locationAddress: 'I-4 East, Orlando, FL', lastSeen: '2024-11-24T14:45:00Z', status: 'In Transit', batteryLevel: 92, assignedProject: 'PROJ-2024-091' },
  { id: 'LOC-004', assetId: 'AST-004', assetName: 'Staging Deck System', category: 'Staging', trackingType: 'Manual', locationName: 'Warehouse B', locationAddress: '5678 Storage Way, Tampa, FL', zone: 'Ground Level - Section D', lastSeen: '2024-11-23T16:00:00Z', status: 'Stationary' },
  { id: 'LOC-005', assetId: 'AST-005', assetName: 'Chain Motor Hoists (20x)', category: 'Rigging', trackingType: 'RFID', locationName: 'Amalie Arena', locationAddress: '401 Channelside Dr, Tampa, FL', zone: 'Rigging Grid - Section 4', lastSeen: '2024-11-24T10:00:00Z', status: 'Active', assignedProject: 'PROJ-2024-088' },
];

const getStatusVariant = getBadgeVariant;

const formatTimestamp = (ts: string) => new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

const columns: ListPageColumn<AssetLocation>[] = [
  { key: 'assetName', label: 'Asset', accessor: (r) => `${r.assetName} (${r.assetId})`, sortable: true },
  { key: 'category', label: 'Category', accessor: 'category', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'trackingType', label: 'Tracking', accessor: 'trackingType', render: (v) => <Badge variant={v === 'GPS' ? 'solid' : 'outline'}>{String(v)}</Badge> },
  { key: 'locationName', label: 'Location', accessor: 'locationName' },
  { key: 'lastSeen', label: 'Last Seen', accessor: (r) => formatTimestamp(r.lastSeen), sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
  { key: 'batteryLevel', label: 'Battery', accessor: (r) => r.batteryLevel ? `${r.batteryLevel}%` : 'N/A' },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'Active', label: 'Active' }, { value: 'In Transit', label: 'In Transit' }, { value: 'Stationary', label: 'Stationary' }, { value: 'Offline', label: 'Offline' }] },
  { key: 'trackingType', label: 'Tracking', options: [{ value: 'GPS', label: 'GPS' }, { value: 'RFID', label: 'RFID' }, { value: 'Manual', label: 'Manual' }] },
  { key: 'category', label: 'Category', options: [{ value: 'Audio', label: 'Audio' }, { value: 'Lighting', label: 'Lighting' }, { value: 'Video', label: 'Video' }, { value: 'Staging', label: 'Staging' }, { value: 'Rigging', label: 'Rigging' }] },
];

export default function AssetTrackingPage() {
  const router = useRouter();
  const [data] = useState<AssetLocation[]>(mockData);
  const [selected, setSelected] = useState<AssetLocation | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeAssets = data.filter(a => a.status === 'Active').length;
  const inTransitAssets = data.filter(a => a.status === 'In Transit').length;
  const gpsTracked = data.filter(a => a.trackingType === 'GPS').length;
  const offlineAssets = data.filter(a => a.status === 'Offline').length;

  const rowActions: ListPageAction<AssetLocation>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'history', label: 'View History', icon: '📜', onClick: (r) => console.log('History:', r.id) },
  ];

  const stats = [
    { label: 'Active Trackers', value: activeAssets },
    { label: 'In Transit', value: inTransitAssets },
    { label: 'GPS Tracked', value: gpsTracked },
    { label: 'Offline', value: offlineAssets },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Tracking Details', content: (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div><strong>Asset:</strong> {selected.assetName}</div>
        <div><strong>Asset ID:</strong> {selected.assetId}</div>
        <div><strong>Category:</strong> {selected.category}</div>
        <div><strong>Tracking Type:</strong> {selected.trackingType}</div>
        <div><strong>Location:</strong> {selected.locationName}</div>
        <div><strong>Address:</strong> {selected.locationAddress}</div>
        {selected.zone && <div><strong>Zone:</strong> {selected.zone}</div>}
        <div><strong>Last Seen:</strong> {formatTimestamp(selected.lastSeen)}</div>
        <div><strong>Status:</strong> {selected.status}</div>
        {selected.batteryLevel && <div><strong>Battery:</strong> {selected.batteryLevel}%</div>}
        {selected.assignedProject && <div><strong>Project:</strong> {selected.assignedProject}</div>}
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<AssetLocation>
        title="Asset Location Tracking"
        subtitle="Real-time GPS and RFID tracking for production equipment"
        data={data}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search assets, locations..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No tracked assets found"
        header={<Navigation />}
      />
      {selected && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selected}
          title={(r) => r.assetName}
          subtitle={(r) => `${r.trackingType} • ${r.status} • ${r.locationName}`}
          sections={detailSections}
          actions={[{ id: 'history', label: 'View History', icon: '📜' }]}
          onAction={(id) => { console.log('Action:', id); setDrawerOpen(false); }}
        />
      )}
    </>
  );
}
