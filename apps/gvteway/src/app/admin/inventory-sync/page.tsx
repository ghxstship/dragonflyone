'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../../components/navigation';
import {
  ListPage,
  Badge,
  DetailDrawer,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
  Section,
  Container,
  Stack,
  Grid,
  H1,
  H3,
  Body,
  Label,
  Button,
  Alert,
  StatCard,
  Tabs,
  TabsList,
  Tab,
  Field,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Card,
  Input,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@ghxstship/ui';

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
  const router = useRouter();
  const [inventory, setInventory] = useState<InventoryItem[]>(mockInventory);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedItem(r); setDrawerOpen(true); } },
    { id: 'resolve', label: 'Resolve Conflict', icon: '✅', onClick: (r) => handleResolveConflict(r.id) },
    { id: 'sync', label: 'Sync Item', icon: '🔄', onClick: (r) => handleResolveConflict(r.id) },
  ];

  const stats = [
    { label: 'Total Items', value: totalItems },
    { label: 'Synced', value: syncedCount },
    { label: 'Conflicts', value: conflictCount },
    { label: 'Pending', value: pendingCount },
  ];

  const detailSections: DetailSection[] = selectedItem ? [
    { id: 'overview', title: 'Inventory Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>SKU:</strong> {selectedItem.sku}</div>
        <div><strong>Name:</strong> {selectedItem.name}</div>
        <div><strong>Category:</strong> {selectedItem.category}</div>
        <div><strong>Status:</strong> {selectedItem.sync_status}</div>
        <div><strong>Online Qty:</strong> {selectedItem.online_quantity}</div>
        <div><strong>Physical Qty:</strong> {selectedItem.physical_quantity}</div>
        <div><strong>Reserved:</strong> {selectedItem.reserved_quantity}</div>
        <div><strong>Available:</strong> {selectedItem.available_quantity}</div>
        <div><strong>Last Sync:</strong> {new Date(selectedItem.last_sync).toLocaleString()}</div>
      </div>
    )},
  ] : [];

  return (
    <>
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
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No inventory items"
        header={<Navigation />}
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
            { id: 'sync', label: 'Sync Item', icon: '🔄' },
            ...(selectedItem.sync_status === 'conflict' ? [{ id: 'resolve', label: 'Resolve Conflict', icon: '✅' }] : []),
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
