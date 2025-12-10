'use client';

import { useState } from 'react';
import { Eye, Check, RefreshCw } from 'lucide-react';
import { GvtewayAppLayout } from '@/components/app-layout';
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
} from '@ghxstship/ui';
import { createExportHandler, createImportHandler, getImportTemplates, createImportHandler, getImportTemplates } from '@ghxstship/config';

interface InventoryLocation {
  id: string;
  name: string;
  type: 'warehouse' | 'store' | 'online';
  quantity: number;
  last_updated: string;
}

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  online_quantity: number;
  physical_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  sync_status: 'synced' | 'pending' | 'conflict' | 'error';
  last_sync: string;
  locations: InventoryLocation[];
  [key: string]: unknown;
}

interface SyncLog {
  id: string;
  timestamp: string;
  type: 'manual' | 'auto' | 'scheduled';
  items_synced: number;
  conflicts: number;
  status: 'completed' | 'failed' | 'partial';
  duration_ms: number;
}

const defaultLocations: InventoryLocation[] = [
  { id: 'LOC-001', name: 'Main Warehouse', type: 'warehouse', quantity: 100, last_updated: '2024-11-24T14:30:00Z' },
  { id: 'LOC-002', name: 'Online Store', type: 'online', quantity: 50, last_updated: '2024-11-24T14:30:00Z' },
];

const mockInventory: InventoryItem[] = [
  { id: 'INV-001', sku: 'TSHIRT-BLK-M', name: 'Tour T-Shirt Black (M)', category: 'Apparel', online_quantity: 150, physical_quantity: 148, reserved_quantity: 12, available_quantity: 136, sync_status: 'synced', last_sync: '2024-11-24T14:30:00Z', locations: defaultLocations },
  { id: 'INV-002', sku: 'HOODIE-GRY-L', name: 'Tour Hoodie Gray (L)', category: 'Apparel', online_quantity: 75, physical_quantity: 72, reserved_quantity: 5, available_quantity: 67, sync_status: 'conflict', last_sync: '2024-11-24T14:28:00Z', locations: defaultLocations },
  { id: 'INV-003', sku: 'POSTER-LTD', name: 'Limited Edition Poster', category: 'Collectibles', online_quantity: 200, physical_quantity: 200, reserved_quantity: 45, available_quantity: 155, sync_status: 'synced', last_sync: '2024-11-24T14:32:00Z', locations: defaultLocations },
  { id: 'INV-004', sku: 'CAP-BLK', name: 'Snapback Cap Black', category: 'Accessories', online_quantity: 85, physical_quantity: 85, reserved_quantity: 8, available_quantity: 77, sync_status: 'synced', last_sync: '2024-11-24T14:30:00Z', locations: defaultLocations },
  { id: 'INV-005', sku: 'VINYL-ALBUM', name: 'Vinyl Album', category: 'Music', online_quantity: 50, physical_quantity: 48, reserved_quantity: 3, available_quantity: 45, sync_status: 'pending', last_sync: '2024-11-24T14:15:00Z', locations: defaultLocations },
];

const mockSyncLogs: SyncLog[] = [
  { id: 'LOG-001', timestamp: '2024-11-24T14:30:00Z', type: 'auto', items_synced: 5, conflicts: 1, status: 'completed', duration_ms: 1500 },
  { id: 'LOG-002', timestamp: '2024-11-24T14:00:00Z', type: 'scheduled', items_synced: 5, conflicts: 0, status: 'completed', duration_ms: 1200 },
  { id: 'LOG-003', timestamp: '2024-11-24T13:30:00Z', type: 'manual', items_synced: 3, conflicts: 0, status: 'completed', duration_ms: 800 },
];

const getSyncStatusVariant = (status: string): 'solid' | 'outline' | 'ghost' => {
  switch (status) {
    case 'synced': return 'solid';
    case 'conflict': case 'error': return 'solid';
    case 'pending': return 'outline';
    default: return 'ghost';
  }
};

const columns: ListPageColumn<InventoryItem>[] = [
  { key: 'sku', label: 'SKU', accessor: 'sku', sortable: true },
  { key: 'name', label: 'Product', accessor: 'name', sortable: true },
  { key: 'category', label: 'Category', accessor: 'category', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'online_quantity', label: 'Online', accessor: 'online_quantity', sortable: true },
  { key: 'physical_quantity', label: 'Physical', accessor: 'physical_quantity', sortable: true },
  { key: 'reserved_quantity', label: 'Reserved', accessor: 'reserved_quantity' },
  { key: 'available_quantity', label: 'Available', accessor: 'available_quantity', sortable: true },
  { key: 'sync_status', label: 'Status', accessor: 'sync_status', sortable: true, render: (v) => <Badge variant={getSyncStatusVariant(String(v))}>{String(v).toUpperCase()}</Badge> },
  { key: 'last_sync', label: 'Last Sync', accessor: (r) => new Date(r.last_sync).toLocaleTimeString() },
];

const filters: ListPageFilter[] = [
  { key: 'sync_status', label: 'Status', options: [{ value: 'synced', label: 'Synced' }, { value: 'pending', label: 'Pending' }, { value: 'conflict', label: 'Conflict' }] },
  { key: 'category', label: 'Category', options: [{ value: 'Apparel', label: 'Apparel' }, { value: 'Accessories', label: 'Accessories' }, { value: 'Collectibles', label: 'Collectibles' }, { value: 'Music', label: 'Music' }] },
];

export default function InventorySyncPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [syncLogs] = useState<SyncLog[]>(mockSyncLogs);

  const conflictCount = inventory.filter(i => i.sync_status === 'conflict').length;
  const pendingCount = inventory.filter(i => i.sync_status === 'pending').length;
  const syncedCount = inventory.filter(i => i.sync_status === 'synced').length;
  const totalItems = inventory.reduce((sum, i) => sum + i.available_quantity, 0);

  const handleSync = () => {
    setInventory(inventory.map(item => ({
      ...item,
      sync_status: 'synced' as const,
      last_sync: new Date().toISOString(),
      physical_quantity: item.online_quantity,
    })));
  };

  const handleResolveConflict = (itemId: string) => {
    setInventory(inventory.map(item => 
      item.id === itemId ? { ...item, sync_status: 'synced' as const, physical_quantity: item.online_quantity, last_sync: new Date().toISOString() } : item
    ));
  };

  const rowActions: ListPageAction<InventoryItem>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedItem(r); setDrawerOpen(true); } },
    { id: 'resolve', label: 'Resolve Conflict', icon: <Check className="size-4" />, onClick: (r) => handleResolveConflict(r.id) },
    { id: 'sync', label: 'Sync Item', icon: <RefreshCw className="size-4" />, onClick: (r) => handleResolveConflict(r.id) },
  ];

  const lastSync = syncLogs.length > 0 ? new Date(syncLogs[0].timestamp).toLocaleTimeString() : 'Never';
  const stats = [
    { label: 'Total Items', value: totalItems },
    { label: 'Synced', value: syncedCount },
    { label: 'Pending', value: pendingCount },
    { label: 'Conflicts', value: conflictCount },
    { label: 'Last Sync', value: lastSync },
  ];

  const detailSections: DetailSection[] = selectedItem ? [
    { id: 'overview', title: 'Inventory Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>SKU:</strong> {selectedItem.sku}</Body>
        <Body size="sm"><strong>Name:</strong> {selectedItem.name}</Body>
        <Body size="sm"><strong>Category:</strong> {selectedItem.category}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedItem.sync_status}</Body>
        <Body size="sm"><strong>Online Qty:</strong> {selectedItem.online_quantity}</Body>
        <Body size="sm"><strong>Physical Qty:</strong> {selectedItem.physical_quantity}</Body>
        <Body size="sm"><strong>Reserved:</strong> {selectedItem.reserved_quantity}</Body>
        <Body size="sm"><strong>Available:</strong> {selectedItem.available_quantity}</Body>
        <Body size="sm"><strong>Last Sync:</strong> {new Date(selectedItem.last_sync).toLocaleString()}</Body>
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<InventoryItem, 'id'>>({

    entityType: 'inventory',

    requiredFields: ['inventory', 'sku', 'name'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/inventory', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      refetch();

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('inventory');


  return (
    <GvtewayAppLayout>
      <ListPage<InventoryItem>
        title="Inventory Synchronization"
        subtitle="Real-time inventory sync between online and physical locations"
        data={inventory}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search inventory..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedItem(r); setDrawerOpen(true); }}
        createLabel="Sync Now"
        onCreate={handleSync}
        entityType="inventory"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['inventory', 'sku', 'name', 'category', 'online_quantity', 'physical_quantity', 'reserved_quantity']}
        onExport={createExportHandler({
          filename: "inventory",
          getData: () => inventory.map(i => ({
            id: i.id,
            sku: i.sku,
            name: i.name,
            category: i.category,
            online_quantity: i.online_quantity,
            physical_quantity: i.physical_quantity,
            reserved_quantity: i.reserved_quantity,
            available_quantity: i.available_quantity,
            sync_status: i.sync_status,
            last_sync: i.last_sync,
          })),
        })}
        stats={stats}
        emptyMessage="No inventory items"
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            setInventory(prev => prev.filter(i => !ids.includes(i.id)));
          } else if (action === 'sync') {
            setInventory(prev => prev.map(i => ids.includes(i.id) ? { ...i, sync_status: 'synced' as const, last_sync: new Date().toISOString() } : i));
          }
        }}
        bulkActions={[
          { id: 'sync', label: 'Sync Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
      />

      {selectedItem && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedItem}
          title={(i) => i.name}
          subtitle={(i) => `${i.sku} • ${i.category}`}
          sections={detailSections}
          actions={[
            { id: 'sync', label: 'Sync Item', icon: <RefreshCw className="size-4" /> },
            ...(selectedItem.sync_status === 'conflict' ? [{ id: 'resolve', label: 'Resolve Conflict', icon: <Check className="size-4" /> }] : []),
          ]}
          onAction={(id, i) => {
            if (id === 'sync' || id === 'resolve') handleResolveConflict(i.id);
            setDrawerOpen(false);
          }}
        />
      )}
    </GvtewayAppLayout>
  );
}
