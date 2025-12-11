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
import { createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';

import {
  DEMO_INVENTORY_ITEMS,
  DEMO_SYNC_LOGS,
  type DemoInventoryItem as InventoryItem,
  type DemoSyncLog as SyncLog,
} from '@/lib/demo-data';

const mockInventory = DEMO_INVENTORY_ITEMS;
const mockSyncLogs = DEMO_SYNC_LOGS;

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
