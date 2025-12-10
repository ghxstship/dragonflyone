'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, History } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import {
  ListPage, Badge, DetailDrawer, Grid, Body,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection,
} from '@ghxstship/ui';
import { getBadgeVariant, createExportHandler } from '@ghxstship/config';

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
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'history', label: 'View History', icon: <History className="size-4" />, onClick: (r) => router.push(`/assets/tracking/${r.id}/history`) },
  ];

  const stats = [
    { label: 'Active Trackers', value: activeAssets },
    { label: 'In Transit', value: inTransitAssets },
    { label: 'GPS Tracked', value: gpsTracked },
    { label: 'Offline', value: offlineAssets },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Tracking Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Asset:</strong> {selected.assetName}</Body>
        <Body size="sm"><strong>Asset ID:</strong> {selected.assetId}</Body>
        <Body size="sm"><strong>Category:</strong> {selected.category}</Body>
        <Body size="sm"><strong>Tracking Type:</strong> {selected.trackingType}</Body>
        <Body size="sm"><strong>Location:</strong> {selected.locationName}</Body>
        <Body size="sm"><strong>Address:</strong> {selected.locationAddress}</Body>
        {selected.zone && <Body size="sm"><strong>Zone:</strong> {selected.zone}</Body>}
        <Body size="sm"><strong>Last Seen:</strong> {formatTimestamp(selected.lastSeen)}</Body>
        <Body size="sm"><strong>Status:</strong> {selected.status}</Body>
        {selected.batteryLevel && <Body size="sm"><strong>Battery:</strong> {selected.batteryLevel}%</Body>}
        {selected.assignedProject && <Body size="sm"><strong>Project:</strong> {selected.assignedProject}</Body>}
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<AssetLocation, 'id'>>({

    entityType: 'asset-tracking',

    requiredFields: ['assetName', 'category', 'trackingType'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/asset-tracking', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      refetch();

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('asset-tracking');


  return (
    <AtlvsAppLayout>
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
        entityType="asset-tracking"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['assetName', 'category', 'trackingType', 'locationName', 'lastSeen', 'status', 'batteryLevel']}
        onExport={createExportHandler({
          filename: "asset-tracking",
          getData: () => data.map(a => ({
            id: a.id,
            assetId: a.assetId,
            assetName: a.assetName,
            category: a.category,
            currentLocation: a.locationName,
            lastScan: a.lastSeen,
            status: a.status,
            assignedTo: a.assignedProject || '',
          })),
        })}
        stats={stats}
        emptyMessage="No tracked assets found"
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/assets/tracking/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
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
          title={(r) => r.assetName}
          subtitle={(r) => `${r.trackingType} • ${r.status} • ${r.locationName}`}
          sections={detailSections}
          actions={[{ id: 'history', label: 'View History', icon: <History className="size-4" /> }]}
          onAction={(id, r) => {
            if (id === 'history') router.push(`/assets/tracking/${r.id}/history`);
            setDrawerOpen(false);
          }}
        />
      )}
    </AtlvsAppLayout>
  );
}
