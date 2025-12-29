"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Package, Truck, Trash2, Printer, Download } from "lucide-react";
// Layout provided by route group
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Stack,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates, useAuthContext, PlatformRole } from "@ghxstship/config";

const ADMIN_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

import {
  useDeliveries,
  useCreateDelivery,
  useDeleteDelivery,
  type Delivery,
} from "@/hooks/useDeliveries";

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
  const { hasRole } = useAuthContext();
  
  // RBAC: Check if user has admin access
  const canManageDeliveries = ADMIN_ROLES.some(role => hasRole(role));
  
  const { data: deliveries = [], isLoading: loading, refetch } = useDeliveries();
  const createDeliveryMutation = useCreateDelivery();
  const deleteDeliveryMutation = useDeleteDelivery();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deliveryToDelete, setDeliveryToDelete] = useState<Delivery | null>(null);

  const rowActions: ListPageAction<Delivery>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedDelivery(row); setDrawerOpen(true); } },
    ...(canManageDeliveries ? [
      { id: 'receive', label: 'Receive', icon: <Package className="size-4" />, onClick: (row: Delivery) => router.push(`/deliveries/${row.id}/receive`) },
    ] : []),
    { id: 'track', label: 'Track', icon: <Truck className="size-4" />, onClick: (row) => row.trackingNumber && window.open(`https://track.example.com/${row.trackingNumber}`) },
    ...(canManageDeliveries ? [
      { id: 'delete', label: 'Cancel', icon: <Trash2 className="size-4" />, variant: 'danger' as const, onClick: (row: Delivery) => { setDeliveryToDelete(row); setDeleteConfirmOpen(true); } },
    ] : []),
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'print', label: 'Print Manifest', icon: <Printer className="size-4" /> },
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    { id: 'delete', label: 'Cancel', icon: <Trash2 className="size-4" />, variant: 'danger' },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await createDeliveryMutation.mutateAsync({
      vendor: String(data.vendor || ''),
      description: String(data.description || ''),
      scheduledDate: String(data.scheduledDate || new Date().toISOString().split('T')[0]),
      scheduledTime: String(data.scheduledTime || '09:00'),
      accessPoint: String(data.accessPoint || 'Main Gate'),
      projectId: data.projectId ? String(data.projectId) : undefined,
      status: 'Scheduled',
      items: [],
    });
    refetch();
    setCreateModalOpen(false);
  };

  const handleDelete = async () => {
    if (deliveryToDelete) {
      await deleteDeliveryMutation.mutateAsync(deliveryToDelete.id);
      refetch();
      setDeleteConfirmOpen(false);
      setDeliveryToDelete(null);
    }
  };

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    if (actionId === 'export') {
      const selected = deliveries.filter(d => selectedIds.includes(d.id));
      const csv = [
        ['ID', 'Vendor', 'Status', 'Date', 'Time', 'Access Point', 'Carrier', 'Tracking'].join(','),
        ...selected.map(d => [d.id, d.vendor, d.status, d.scheduledDate, d.scheduledTime, d.accessPoint, d.carrier || '', d.trackingNumber || ''].join(','))
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'deliveries-export.csv';
      a.click();
      URL.revokeObjectURL(url);
    } else if (actionId === 'print') {
      window.print();
    } else if (actionId === 'delete') {
      for (const id of selectedIds) {
        await deleteDeliveryMutation.mutateAsync(id);
      }
      refetch();
    }
  };

  const inTransit = deliveries.filter(d => d.status === "In Transit").length;
  const arrivedCount = deliveries.filter(d => d.status === "Arrived").length;
  const delayedCount = deliveries.filter(d => d.status === "Delayed").length;

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Omit<Delivery, 'id'>>({
    entityType: 'deliveries',
    requiredFields: ['vendor', 'description', 'scheduledDate'],
    onImport: async (records) => {
      for (const record of records) {
        await createDeliveryMutation.mutateAsync({
          vendor: String(record.vendor || ''),
          description: String(record.description || ''),
          scheduledDate: String(record.scheduledDate || ''),
          scheduledTime: String(record.scheduledTime || '09:00'),
          accessPoint: String(record.accessPoint || 'Main Gate'),
          status: (record.status as Delivery['status']) || 'Scheduled',
          items: [],
        });
      }
      refetch();
    },
  });

  const importTemplates = getImportTemplates('deliveries').length > 0 
    ? getImportTemplates('deliveries') 
    : [{ id: 'default', name: 'Delivery Import', mapping: { vendor: 'vendor', description: 'description', scheduledDate: 'scheduledDate', scheduledTime: 'scheduledTime', status: 'status' } }];

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
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
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
    <>
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
        onCreate={canManageDeliveries ? () => setCreateModalOpen(true) : undefined}
        entityType="deliveries"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['vendor', 'description', 'scheduledDate', 'scheduledTime', 'status']}
        onExport={createExportHandler({
          filename: "deliveries",
          getData: () => deliveries.map(d => ({
            id: d.id,
            vendor: d.vendor,
            status: d.status,
            scheduledDate: d.scheduledDate,
            scheduledTime: d.scheduledTime,
            accessPoint: d.accessPoint,
            carrier: d.carrier || '',
            trackingNumber: d.trackingNumber || '',
          })),
        })}
        stats={stats}
        emptyMessage="No deliveries found"
        emptyAction={canManageDeliveries ? { label: 'Add Delivery', onClick: () => setCreateModalOpen(true) } : undefined}
        showFavorite
        showSettings
      />

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
          { id: 'receive', label: 'Receive', icon: <Package className="size-4" /> },
          { id: 'track', label: 'Track', icon: <Truck className="size-4" /> },
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
    </>
  );
}
