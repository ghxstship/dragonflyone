'use client';

import { useState } from 'react';
import { Eye, Check, RefreshCw } from 'lucide-react';
// Layout provided by route group
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

import { useInventorySyncData, type InventoryItem } from '@/hooks/useInventorySync';

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
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { items: inventory, logs: syncLogs, isLoading, error, refetch, syncInventory } = useInventorySyncData();

  const conflictCount = inventory.filter((i: InventoryItem) => i.sync_status === 'conflict').length;
  const pendingCount = inventory.filter((i: InventoryItem) => i.sync_status === 'pending').length;
  const syncedCount = inventory.filter((i: InventoryItem) => i.sync_status === 'synced').length;
  const totalItems = inventory.reduce((sum: number, i: InventoryItem) => sum + i.available_quantity, 0);

  const handleSync = async () => {
    try {
      await syncInventory(inventory.map((i: InventoryItem) => i.id));
      refetch();
    } catch {
      // Error handled silently
    }
  };

  const handleResolveConflict = async (itemId: string) => {
    try {
      await syncInventory([itemId]);
      refetch();
    } catch {
      // Error handled silently
    }
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
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
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
    <>
      <ListPage<InventoryItem>
        title="Inventory Synchronization"
        subtitle="Real-time inventory sync between online and physical locations"
        data={inventory}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={() => refetch()}
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
          getData: () => inventory.map((i: InventoryItem) => ({
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
            await fetch('/api/admin/inventory/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch();
          } else if (action === 'sync') {
            await syncInventory(ids);
            refetch();
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
    </>
  );
}
