"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, MapPin, Pencil } from "lucide-react";
// Layout provided by route group
import { useShipments } from "@/hooks/useLogistics";
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  Grid,
  Stack,
  Body,
  EnterprisePageHeader,
  MainContent,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates } from "@ghxstship/config";

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
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedShipment(r); setDrawerOpen(true); } },
    { id: 'track', label: 'Track', icon: <MapPin className="size-4" />, onClick: (r) => router.push(`/logistics/${r.id}`) },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/logistics/${r.id}/edit`) },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await fetch('/api/shipments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setCreateModalOpen(false);
    refetch?.();
  };

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Omit<Shipment, 'id'>>({
    entityType: 'logistics',
    requiredFields: ['equipment', 'origin', 'destination'],
    onImport: async (records) => {
      for (const record of records) {
        await fetch('/api/shipments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
      }
      refetch?.();
    },
  });

  const importTemplates = getImportTemplates('logistics').length > 0 
    ? getImportTemplates('logistics') 
    : [{ id: 'default', name: 'Shipment Import', mapping: { equipment: 'equipment', origin: 'origin', destination: 'destination', driver: 'driver', truck: 'truck', status: 'status' } }];

  const stats = [
    { label: 'Active Shipments', value: shipments.length },
    { label: 'In Transit', value: inTransitCount },
    { label: 'Delivered', value: deliveredCount },
    { label: 'On-Time Rate', value: '96%' },
  ];

  const detailSections: DetailSection[] = selectedShipment ? [
    { id: 'overview', title: 'Shipment Details', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Stack gap={1}><Body className="font-display">ID</Body><Body>{selectedShipment.id}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Status</Body><Body>{selectedShipment.status}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Equipment</Body><Body>{selectedShipment.equipment}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Driver</Body><Body>{selectedShipment.driver}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Origin</Body><Body>{selectedShipment.origin}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Destination</Body><Body>{selectedShipment.destination}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Truck</Body><Body>{selectedShipment.truck}</Body></Stack>
        <Stack gap={1}><Body className="font-display">ETA</Body><Body>{selectedShipment.eta || '—'}</Body></Stack>
      </Grid>
    )},
  ] : [];

  return (
    <>
      <EnterprisePageHeader
        title="Logistics & Transportation"
        subtitle="Track shipments, manage fleet, and coordinate deliveries"
primaryAction={{ label: 'Schedule Shipment', onClick: () => setCreateModalOpen(true) }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
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
          entityType="logistics"
          onImport={handleImport}
          importTemplates={importTemplates}
          importSampleFields={['equipment', 'origin', 'destination', 'driver', 'truck', 'status']}
          onExport={createExportHandler({
            filename: "shipments",
            getData: () => shipments.map(s => ({
              id: s.id,
              status: s.status,
              equipment: s.equipment,
              driver: s.driver,
              origin: s.origin,
              destination: s.destination,
              truck: s.truck,
              eta: s.eta || '',
            })),
          })}
          stats={stats}
          emptyMessage="No shipments found"
          emptyAction={{ label: 'Schedule Shipment', onClick: () => setCreateModalOpen(true) }}
          onBulkAction={async (action, ids) => {
            if (action === 'delete') {
              await fetch('/api/logistics/bulk', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
              });
              refetch?.();
            } else if (action === 'complete') {
              await fetch('/api/logistics/bulk-complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
              });
              refetch?.();
            }
          }}
          bulkActions={[
            { id: 'complete', label: 'Mark Delivered', variant: 'default' },
            { id: 'delete', label: 'Delete Selected', variant: 'danger' },
          ]}
        />
      </MainContent>
      <RecordFormModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} mode="create" title="Schedule Shipment" fields={formFields} onSubmit={handleCreate} size="lg" />
      <DetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} record={selectedShipment} title={(s) => s.id} subtitle={(s) => s.equipment} sections={detailSections} onEdit={(s) => router.push(`/logistics/${s.id}/edit`)} actions={[{ id: 'track', label: 'Track', icon: <MapPin className="size-4" /> }]} onAction={(id, s) => id === 'track' && router.push(`/logistics/${s.id}`)} />
    </>
  );
}
