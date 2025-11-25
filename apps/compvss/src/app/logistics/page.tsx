"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import { useShipments } from "@/hooks/useLogistics";
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";

interface Shipment {
  id: string;
  equipment: string;
  origin: string;
  destination: string;
  driver: string;
  truck: string;
  eta?: string;
  status: string;
}

const columns: ListPageColumn<Shipment>[] = [
  { key: 'id', label: 'Shipment ID', accessor: 'id', sortable: true },
  { key: 'equipment', label: 'Equipment', accessor: 'equipment' },
  { key: 'route', label: 'Route', accessor: (r) => `${r.origin} → ${r.destination}` },
  { key: 'driver', label: 'Driver', accessor: 'driver' },
  { key: 'truck', label: 'Truck', accessor: 'truck' },
  { key: 'eta', label: 'ETA', accessor: (r) => r.eta ? new Date(r.eta).toLocaleDateString() : '—', sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={v === 'delivered' ? 'solid' : v === 'in-transit' ? 'outline' : 'ghost'}>{String(v).replace(/-/g, ' ')}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'scheduled', label: 'Scheduled' }, { value: 'loading', label: 'Loading' }, { value: 'in-transit', label: 'In Transit' }, { value: 'delivered', label: 'Delivered' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'equipment', label: 'Equipment', type: 'text', required: true },
  { name: 'origin', label: 'Origin', type: 'text', required: true },
  { name: 'destination', label: 'Destination', type: 'text', required: true },
  { name: 'driver', label: 'Driver', type: 'select', options: [] },
  { name: 'truck', label: 'Truck', type: 'select', options: [] },
  { name: 'eta', label: 'ETA', type: 'date' },
];

export default function LogisticsPage() {
  const router = useRouter();
  const { data: shipmentsData, isLoading, refetch } = useShipments();
  const shipments = (shipmentsData || []) as unknown as Shipment[];
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const inTransitCount = shipments.filter(s => s.status === 'in-transit').length;
  const deliveredCount = shipments.filter(s => s.status === 'delivered').length;

  const rowActions: ListPageAction<Shipment>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedShipment(r); setDrawerOpen(true); } },
    { id: 'track', label: 'Track', icon: '📍', onClick: (r) => router.push(`/logistics/${r.id}`) },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (r) => router.push(`/logistics/${r.id}/edit`) },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    console.log('Schedule shipment:', data);
    setCreateModalOpen(false);
    refetch?.();
  };

  const stats = [
    { label: 'Active Shipments', value: shipments.length },
    { label: 'In Transit', value: inTransitCount },
    { label: 'Delivered', value: deliveredCount },
    { label: 'On-Time Rate', value: '96%' },
  ];

  const detailSections: DetailSection[] = selectedShipment ? [
    { id: 'overview', title: 'Shipment Details', content: (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div><strong>ID:</strong> {selectedShipment.id}</div>
        <div><strong>Status:</strong> {selectedShipment.status}</div>
        <div><strong>Equipment:</strong> {selectedShipment.equipment}</div>
        <div><strong>Driver:</strong> {selectedShipment.driver}</div>
        <div><strong>Origin:</strong> {selectedShipment.origin}</div>
        <div><strong>Destination:</strong> {selectedShipment.destination}</div>
        <div><strong>Truck:</strong> {selectedShipment.truck}</div>
        <div><strong>ETA:</strong> {selectedShipment.eta || '—'}</div>
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<Shipment>
        title="Logistics & Transportation"
        subtitle="Track shipments, manage fleet, and coordinate deliveries"
        data={shipments}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        onRetry={() => refetch?.()}
        searchPlaceholder="Search shipments..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedShipment(r); setDrawerOpen(true); }}
        createLabel="Schedule Shipment"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No shipments found"
        emptyAction={{ label: 'Schedule Shipment', onClick: () => setCreateModalOpen(true) }}
        header={<Navigation />}
      />
      <RecordFormModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} mode="create" title="Schedule Shipment" fields={formFields} onSubmit={handleCreate} size="lg" />
      <DetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} record={selectedShipment} title={(s) => s.id} subtitle={(s) => s.equipment} sections={detailSections} onEdit={(s) => router.push(`/logistics/${s.id}/edit`)} actions={[{ id: 'track', label: 'Track', icon: '📍' }]} onAction={(id, s) => id === 'track' && router.push(`/logistics/${s.id}`)} />
    </>
  );
}
