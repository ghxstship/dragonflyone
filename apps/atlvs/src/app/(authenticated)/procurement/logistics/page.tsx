'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Download, Trash2, MapPin } from 'lucide-react';
import {
  Badge,
  Body,
  ConfirmDialog,
  DetailDrawer,
  Grid,
  ListPage,
  RecordFormModal,
  Stack,
  Text,
  type DetailSection,
  type FormFieldConfig,
  type ListPageAction,
  type ListPageBulkAction,
  type ListPageColumn,
  type ListPageFilter,
} from '@ghxstship/ui';
import { createExportHandler } from '@ghxstship/config';
import { useShipments, useCreateShipment, type Shipment } from '../../../../hooks/useShipments';
// Layout provided by route group

const carriers = ['XPO Logistics', 'Old Dominion', 'FedEx Freight', 'Estes Express', 'YRC Freight'];

export default function LogisticsPage() {
  const router = useRouter();
  const { data: shipmentsData, isLoading, error, refetch } = useShipments();
  const createMutation = useCreateShipment();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const shipments = shipmentsData?.shipments || [];
  const summary = shipmentsData?.summary || { total: 0, active: 0, in_transit: 0, delayed: 0, total_cost: 0 };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const columns: ListPageColumn<Shipment>[] = [
    { 
      key: 'project_name', 
      label: 'Shipment', 
      accessor: (row) => row.project_name || 'Unassigned',
      sortable: true,
      render: (value, row) => (
        <Stack gap={0}>
          <Text>{String(value)}</Text>
          <Text className="text-body-xs text-grey-500">{row.id.substring(0, 8)}</Text>
        </Stack>
      )
    },
    { 
      key: 'route', 
      label: 'Route', 
      accessor: (row) => `${row.origin} → ${row.destination}`,
      render: (value, row) => (
        <Stack gap={0}>
          <Text>{row.origin}</Text>
          <Text className="text-body-xs text-grey-500">→ {row.destination}</Text>
        </Stack>
      )
    },
    { key: 'carrier', label: 'Carrier', accessor: 'carrier', sortable: true },
    { 
      key: 'items', 
      label: 'Items/Weight', 
      accessor: (row) => `${row.items_count} items`,
      render: (value, row) => (
        <Stack gap={0}>
          <Text>{row.items_count} items</Text>
          <Text className="text-body-xs text-grey-500">{row.weight.toLocaleString()} lbs</Text>
        </Stack>
      )
    },
    { key: 'expected_delivery', label: 'Expected', accessor: 'expected_delivery', sortable: true },
    { 
      key: 'cost', 
      label: 'Cost', 
      accessor: 'cost', 
      sortable: true,
      render: (value) => `$${Number(value).toLocaleString()}`
    },
    { 
      key: 'status', 
      label: 'Status', 
      accessor: 'status', 
      sortable: true,
      render: (value) => {
        const variant = value === 'delivered' ? 'success' : value === 'in_transit' ? 'info' : value === 'delayed' ? 'error' : 'outline';
        return <Badge variant={variant}>{formatStatus(String(value))}</Badge>;
      }
    },
  ];

  const filters: ListPageFilter[] = [
    { 
      key: 'status', 
      label: 'Status', 
      options: [
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'in_transit', label: 'In Transit' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'delayed', label: 'Delayed' },
      ]
    },
    { 
      key: 'carrier', 
      label: 'Carrier', 
      options: carriers.map(c => ({ value: c, label: c }))
    },
  ];

  const formFields: FormFieldConfig[] = [
    { name: 'origin', label: 'Origin City, State', type: 'text', required: true },
    { name: 'destination', label: 'Destination City, State', type: 'text', required: true },
    { name: 'carrier', label: 'Carrier', type: 'select', required: true, options: carriers.map(c => ({ value: c, label: c })) },
    { name: 'ship_date', label: 'Ship Date', type: 'date', required: true },
    { name: 'expected_delivery', label: 'Expected Delivery', type: 'date', required: true },
    { name: 'items_count', label: 'Number of Items', type: 'number', required: true },
    { name: 'weight', label: 'Weight (lbs)', type: 'number', required: true },
    { name: 'cost', label: 'Cost ($)', type: 'number', required: true },
  ];

  const rowActions: ListPageAction<Shipment>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedShipment(row); setDrawerOpen(true); } },
    { id: 'track', label: 'Track', icon: <MapPin className="size-4" />, onClick: () => {}, disabled: (row) => !row.tracking_number },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (row) => { setSelectedShipment(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createMutation.mutateAsync({
        origin: String(data.origin),
        destination: String(data.destination),
        carrier: String(data.carrier),
        ship_date: String(data.ship_date),
        expected_delivery: String(data.expected_delivery),
        items_count: Number(data.items_count),
        weight: Number(data.weight),
        cost: Number(data.cost),
      });
      setCreateModalOpen(false);
      refetch();
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    setDeleteConfirmOpen(false);
    setSelectedShipment(null);
    refetch();
  };

  const stats = [
    { label: 'Active Shipments', value: summary.active },
    { label: 'In Transit', value: summary.in_transit },
    { label: 'Delayed', value: summary.delayed },
    { label: 'Total Freight Cost', value: `$${summary.total_cost.toLocaleString()}` },
  ];

  const detailSections: DetailSection[] = selectedShipment ? [
    {
      id: 'overview',
      title: 'Shipment Details',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Body size="sm"><strong>Project:</strong> {selectedShipment.project_name || 'Unassigned'}</Body>
          <Body size="sm"><strong>Carrier:</strong> {selectedShipment.carrier}</Body>
          <Body size="sm"><strong>Origin:</strong> {selectedShipment.origin}</Body>
          <Body size="sm"><strong>Destination:</strong> {selectedShipment.destination}</Body>
          <Body size="sm"><strong>Ship Date:</strong> {selectedShipment.ship_date}</Body>
          <Body size="sm"><strong>Expected:</strong> {selectedShipment.expected_delivery}</Body>
          <Body size="sm"><strong>Items:</strong> {selectedShipment.items_count}</Body>
          <Body size="sm"><strong>Weight:</strong> {selectedShipment.weight.toLocaleString()} lbs</Body>
          <Body size="sm"><strong>Cost:</strong> ${selectedShipment.cost.toLocaleString()}</Body>
          <Body size="sm"><strong>Status:</strong> {formatStatus(selectedShipment.status)}</Body>
          {selectedShipment.tracking_number && (
            <Body size="sm" className="col-span-2"><strong>Tracking:</strong> {selectedShipment.tracking_number}</Body>
          )}
        </Grid>
      ),
    },
  ] : [];

  return (
    <>
      <ListPage<Shipment>
        title="Freight & Logistics"
        subtitle="Coordinate shipments and track deliveries"
        data={shipments}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search shipments..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={async (actionId, selectedIds) => {
          if (actionId === 'export') {
            const selected = shipments.filter(s => selectedIds.includes(s.id));
            const csv = [
              ['Project', 'Origin', 'Destination', 'Carrier', 'Items', 'Weight', 'Cost', 'Status'].join(','),
              ...selected.map(s => [s.project_name, s.origin, s.destination, s.carrier, s.items_count, s.weight, s.cost, s.status].join(','))
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'shipments-export.csv';
            a.click();
            URL.revokeObjectURL(url);
          }
        }}
        onRowClick={(row) => { setSelectedShipment(row); setDrawerOpen(true); }}
        createLabel="New Shipment"
        onCreate={() => setCreateModalOpen(true)}
        entityType="shipments"
        onExport={createExportHandler({
          filename: "shipments",
          getData: () => shipments.map(s => ({
            project: s.project_name,
            origin: s.origin,
            destination: s.destination,
            carrier: s.carrier,
            items: s.items_count,
            weight: s.weight,
            cost: s.cost,
            status: s.status,
            expected: s.expected_delivery,
          })),
        })}
        stats={stats}
        emptyMessage="No shipments found"
        emptyAction={{ label: 'Create Shipment', onClick: () => setCreateModalOpen(true) }}
        quickActions={[
          { id: 'back', label: 'Back to Procurement', onClick: () => router.push('/procurement') },
        ]}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="New Shipment"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedShipment}
        title={(s) => s.project_name || 'Shipment'}
        subtitle={(s) => `${s.origin} → ${s.destination}`}
        sections={detailSections}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Shipment"
        message="Are you sure you want to delete this shipment?"
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setSelectedShipment(null); }}
      />
    </>
  );
}
