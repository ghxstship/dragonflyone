"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye, Package, Truck, Trash2, Printer, Download } from "lucide-react";
import { CompvssAppLayout } from "../../components/app-layout";
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Stack,
  Body,
  EnterprisePageHeader,
  MainContent,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";

interface Delivery {
  id: string;
  vendor: string;
  description: string;
  trackingNumber?: string;
  carrier?: string;
  status: "Scheduled" | "In Transit" | "Arrived" | "Received" | "Delayed";
  scheduledDate: string;
  scheduledTime: string;
  actualArrival?: string;
  receivedBy?: string;
  accessPoint: string;
  projectId: string;
  items: { name: string; quantity: number; received?: number }[];
  notes?: string;
}

const mockDeliveries: Delivery[] = [
  { id: "DEL-001", vendor: "PRG Lighting", description: "Lighting fixtures and cables", trackingNumber: "1Z999AA10123456784", carrier: "UPS Freight", status: "In Transit", scheduledDate: "2024-11-24", scheduledTime: "10:00", accessPoint: "Loading Dock 1", projectId: "PROJ-089", items: [{ name: "Robe MegaPointe", quantity: 24 }, { name: "DMX Cable 50ft", quantity: 48 }] },
  { id: "DEL-002", vendor: "Meyer Sound", description: "Line array system", status: "Scheduled", scheduledDate: "2024-11-24", scheduledTime: "14:00", accessPoint: "Loading Dock 2", projectId: "PROJ-089", items: [{ name: "LEO-M Line Array", quantity: 12 }, { name: "1100-LFC Subwoofer", quantity: 8 }] },
  { id: "DEL-003", vendor: "Stageline", description: "Staging deck modules", trackingNumber: "PRO123456", carrier: "Company Truck", status: "Arrived", scheduledDate: "2024-11-24", scheduledTime: "08:00", actualArrival: "08:15", accessPoint: "Main Gate A", projectId: "PROJ-089", items: [{ name: "4x8 Deck Module", quantity: 60 }, { name: "Leg Assembly", quantity: 120 }] },
  { id: "DEL-004", vendor: "Audio Systems Inc", description: "Wireless microphone systems", trackingNumber: "FX123456789", carrier: "FedEx", status: "Received", scheduledDate: "2024-11-23", scheduledTime: "11:00", actualArrival: "10:45", receivedBy: "John Martinez", accessPoint: "Loading Dock 1", projectId: "PROJ-089", items: [{ name: "Shure ULXD4Q", quantity: 4, received: 4 }, { name: "ULXD2 Handheld", quantity: 8, received: 8 }] },
  { id: "DEL-005", vendor: "Rigging Solutions", description: "Chain motors and hardware", status: "Delayed", scheduledDate: "2024-11-24", scheduledTime: "09:00", accessPoint: "Loading Dock 2", projectId: "PROJ-089", items: [{ name: "CM Lodestar 1-Ton", quantity: 20 }], notes: "Truck breakdown - ETA delayed 2 hours" },
];

const columns: ListPageColumn<Delivery>[] = [
  { key: 'vendor', label: 'Vendor', accessor: 'vendor', sortable: true },
  { key: 'description', label: 'Description', accessor: 'description' },
  { key: 'scheduledDate', label: 'Date', accessor: 'scheduledDate', sortable: true },
  { key: 'scheduledTime', label: 'Time', accessor: 'scheduledTime', sortable: true },
  { key: 'accessPoint', label: 'Access Point', accessor: 'accessPoint' },
  { key: 'items', label: 'Items', accessor: (row) => `${row.items.length} items` },
  { 
    key: 'status', 
    label: 'Status', 
    accessor: 'status', 
    sortable: true,
    render: (value) => (
      <Badge variant={value === 'Received' ? 'solid' : value === 'Delayed' ? 'solid' : 'outline'}>
        {String(value)}
      </Badge>
    )
  },
];

const filters: ListPageFilter[] = [
  { 
    key: 'status', 
    label: 'Status', 
    options: [
      { value: 'Scheduled', label: 'Scheduled' },
      { value: 'In Transit', label: 'In Transit' },
      { value: 'Arrived', label: 'Arrived' },
      { value: 'Received', label: 'Received' },
      { value: 'Delayed', label: 'Delayed' },
    ]
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'vendor', label: 'Vendor', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'text', required: true },
  { name: 'trackingNumber', label: 'Tracking Number', type: 'text' },
  { name: 'carrier', label: 'Carrier', type: 'select', options: [
    { value: 'ups', label: 'UPS' },
    { value: 'fedex', label: 'FedEx' },
    { value: 'company', label: 'Company Truck' },
    { value: 'other', label: 'Other' },
  ]},
  { name: 'scheduledDate', label: 'Scheduled Date', type: 'date', required: true },
  { name: 'scheduledTime', label: 'Scheduled Time', type: 'text', required: true },
  { name: 'accessPoint', label: 'Access Point', type: 'select', required: true, options: [
    { value: 'dock1', label: 'Loading Dock 1' },
    { value: 'dock2', label: 'Loading Dock 2' },
    { value: 'gateA', label: 'Main Gate A' },
  ]},
  { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
];

export default function DeliveriesPage() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<Delivery[]>(mockDeliveries);
  const [loading, setLoading] = useState(false);
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deliveryToDelete, setDeliveryToDelete] = useState<Delivery | null>(null);

  const refetch = useCallback(() => {
    setDeliveries(mockDeliveries);
  }, []);

  const rowActions: ListPageAction<Delivery>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedDelivery(row); setDrawerOpen(true); } },
    { id: 'receive', label: 'Receive', icon: <Package className="size-4" />, onClick: (row) => router.push(`/deliveries/${row.id}/receive`) },
    { id: 'track', label: 'Track', icon: <Truck className="size-4" />, onClick: (row) => row.trackingNumber && window.open(`https://track.example.com/${row.trackingNumber}`) },
    { id: 'delete', label: 'Cancel', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (row) => { setDeliveryToDelete(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'print', label: 'Print Manifest', icon: <Printer className="size-4" /> },
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    { id: 'delete', label: 'Cancel', icon: <Trash2 className="size-4" />, variant: 'danger' },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    console.log('Create delivery:', data);
    setCreateModalOpen(false);
    refetch();
  };

  const handleDelete = async () => {
    if (deliveryToDelete) {
      setDeliveries(prev => prev.filter(d => d.id !== deliveryToDelete.id));
      setDeleteConfirmOpen(false);
      setDeliveryToDelete(null);
    }
  };

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    console.log('Bulk action:', actionId, selectedIds);
  };

  const inTransit = deliveries.filter(d => d.status === "In Transit").length;
  const arrivedCount = deliveries.filter(d => d.status === "Arrived").length;
  const delayedCount = deliveries.filter(d => d.status === "Delayed").length;

  const stats = [
    { label: 'Total Deliveries', value: deliveries.length },
    { label: 'In Transit', value: inTransit },
    { label: 'Awaiting Receiving', value: arrivedCount },
    { label: 'Delayed', value: delayedCount },
  ];

  const detailSections: DetailSection[] = selectedDelivery ? [
    {
      id: 'overview',
      title: 'Delivery Details',
      content: (
        <Grid cols={2} gap={4}>
          <Stack gap={1}><Body className="font-display">Vendor</Body><Body>{selectedDelivery.vendor}</Body></Stack>
          <Stack gap={1}><Body className="font-display">Status</Body><Body>{selectedDelivery.status}</Body></Stack>
          <Stack gap={1}><Body className="font-display">Date</Body><Body>{selectedDelivery.scheduledDate}</Body></Stack>
          <Stack gap={1}><Body className="font-display">Time</Body><Body>{selectedDelivery.scheduledTime}</Body></Stack>
          <Stack gap={1}><Body className="font-display">Access Point</Body><Body>{selectedDelivery.accessPoint}</Body></Stack>
          <Stack gap={1}><Body className="font-display">Carrier</Body><Body>{selectedDelivery.carrier || '—'}</Body></Stack>
          <Stack gap={1}><Body className="font-display">Tracking</Body><Body>{selectedDelivery.trackingNumber || '—'}</Body></Stack>
          {selectedDelivery.receivedBy && <Stack gap={1}><Body className="font-display">Received By</Body><Body>{selectedDelivery.receivedBy}</Body></Stack>}
        </Grid>
      ),
    },
    {
      id: 'items',
      title: 'Items',
      content: (
        <Stack gap={2}>
          {selectedDelivery.items.map((item, idx) => (
            <Stack key={idx} gap={1} className="py-2 border-b border-ink-700">
              <Body className="font-display">{item.name}</Body>
              <Body>Qty: {item.quantity} {item.received !== undefined && `(Received: ${item.received})`}</Body>
            </Stack>
          ))}
        </Stack>
      ),
    },
  ] : [];

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Delivery Tracking"
        subtitle="Track incoming deliveries, receiving, and signature capture"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Deliveries' }]}
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
        primaryAction={{ label: 'Add Delivery', onClick: () => setCreateModalOpen(true) }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <ListPage<Delivery>
          title="Delivery Tracking"
          subtitle="Track incoming deliveries, receiving, and signature capture"
          data={deliveries}
          columns={columns}
          rowKey="id"
          loading={loading}
          onRetry={refetch}
          searchPlaceholder="Search deliveries..."
          filters={filters}
          rowActions={rowActions}
          bulkActions={bulkActions}
          onBulkAction={handleBulkAction}
          onRowClick={(row) => { setSelectedDelivery(row); setDrawerOpen(true); }}
          createLabel="Add Delivery"
          onCreate={() => setCreateModalOpen(true)}
          onExport={() => console.log('Export deliveries')}
          stats={stats}
          emptyMessage="No deliveries found"
          emptyAction={{ label: 'Add Delivery', onClick: () => setCreateModalOpen(true) }}
        />
      </MainContent>

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Add Delivery"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedDelivery}
        title={(d) => d.vendor}
        subtitle={(d) => d.description}
        sections={detailSections}
        onEdit={(d) => router.push(`/deliveries/${d.id}/edit`)}
        onDelete={(d) => { setDeliveryToDelete(d); setDeleteConfirmOpen(true); setDrawerOpen(false); }}
        actions={[
          { id: 'receive', label: 'Receive', icon: '📦' },
          { id: 'track', label: 'Track', icon: '🚚' },
        ]}
        onAction={(actionId, del) => {
          if (actionId === 'receive') router.push(`/deliveries/${del.id}/receive`);
          if (actionId === 'track' && del.trackingNumber) window.open(`https://track.example.com/${del.trackingNumber}`);
        }}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Cancel Delivery"
        message={`Are you sure you want to cancel the delivery from "${deliveryToDelete?.vendor}"?`}
        variant="danger"
        confirmLabel="Cancel Delivery"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setDeliveryToDelete(null); }}
      />
    </CompvssAppLayout>
  );
}
