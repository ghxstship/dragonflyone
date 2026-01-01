"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil } from "lucide-react";
import {
  ListPage, DetailDrawer, Grid, Stack, Body,
  type ListPageAction, type DetailSection} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates, getEntityColumns, getEntityFilters } from "@ghxstship/config";
import { useTravelData, type TravelBooking } from "@/hooks/useTravel";

const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);

export default function TravelPage() {
  const router = useRouter();
  const {
    bookings,
    totalCost,
    confirmedCount,
    pendingCount,
    isLoading: loading,
    error,
    refetch,
  } = useTravelData();

  const [selectedBooking, setSelectedBooking] = useState<TravelBooking | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const columns = getEntityColumns<TravelBooking>('travel');
  const filters = getEntityFilters('travel');

  const rowActions: ListPageAction<TravelBooking>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedBooking(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/travel/${r.id}/edit`) },
  ];

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Omit<TravelBooking, 'id'>>({
    entityType: 'travel',
    requiredFields: ['booking_reference', 'crew_member_name', 'departure_date'],
    onImport: async (records) => {
      for (const record of records) {
        await fetch('/api/travel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
      }
      refetch();
    },
  });

  const importTemplates = getImportTemplates('travel').length > 0 
    ? getImportTemplates('travel') 
    : [{ id: 'default', name: 'Travel Import', mapping: { booking_reference: 'booking_reference', crew_member_name: 'crew_member_name', departure_date: 'departure_date', origin: 'origin', destination: 'destination', cost: 'cost' } }];

  const stats = [
    { label: 'Total Bookings', value: bookings.length },
    { label: 'Confirmed', value: confirmedCount },
    { label: 'Pending', value: pendingCount },
    { label: 'Total Cost', value: formatCurrency(totalCost) },
  ];

  const detailSections: DetailSection[] = selectedBooking ? [
    { id: 'overview', title: 'Booking Details', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Stack gap={1}><Body className="font-display">Reference</Body><Body>{selectedBooking.booking_reference}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Crew Member</Body><Body>{selectedBooking.crew_member_name}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Project</Body><Body>{selectedBooking.project_name}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Type</Body><Body>{selectedBooking.travel_type}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Origin</Body><Body>{selectedBooking.origin}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Destination</Body><Body>{selectedBooking.destination}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Departure</Body><Body>{new Date(selectedBooking.departure_date).toLocaleDateString()}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Return</Body><Body>{selectedBooking.return_date ? new Date(selectedBooking.return_date).toLocaleDateString() : '—'}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Carrier</Body><Body>{selectedBooking.carrier || '—'}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Flight #</Body><Body>{selectedBooking.flight_number || '—'}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Cost</Body><Body>{formatCurrency(selectedBooking.cost)}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Status</Body><Body>{selectedBooking.status}</Body></Stack>
        {selectedBooking.notes && <Stack gap={1} className="col-span-2"><Body className="font-display">Notes</Body><Body>{selectedBooking.notes}</Body></Stack>}
      </Grid>
    )},
  ] : [];

  return (
    <>
      <ListPage<TravelBooking>
          title="Travel Coordination"
          subtitle="Manage crew flights, accommodations, and travel logistics"
          data={bookings}
          columns={columns}
          rowKey="id"
          loading={loading}
          error={error instanceof Error ? error : error ? new Error(String(error)) : undefined}
          onRetry={() => refetch()}
          searchPlaceholder="Search bookings..."
          filters={filters}
          rowActions={rowActions}
          onRowClick={(r) => { setSelectedBooking(r); setDrawerOpen(true); }}
          createLabel="Book Travel"
          onCreate={() => router.push('/travel/new')}
          entityType="travel"
          onImport={handleImport}
          importTemplates={importTemplates}
          importSampleFields={['booking_reference', 'crew_member_name', 'departure_date', 'origin', 'destination', 'cost']}
          templateDownloadUrl="/templates/advancing/hospitality-requirements.csv"
          onExport={createExportHandler({
            filename: "travel-bookings",
            getData: () => bookings.map((b: TravelBooking) => ({
              id: b.id,
              booking_reference: b.booking_reference,
              crew_member_name: b.crew_member_name,
              project_name: b.project_name,
              travel_type: b.travel_type,
              departure_date: b.departure_date,
              return_date: b.return_date || '',
              origin: b.origin,
              destination: b.destination,
              carrier: b.carrier || '',
              cost: b.cost,
              status: b.status,
            })),
          })}
          stats={stats}
          emptyMessage="No travel bookings"
          emptyAction={{ label: 'Book Travel', onClick: () => router.push('/travel/new') }}
          onBulkAction={async (action, ids) => {
            if (action === 'delete') {
              await fetch('/api/travel/bulk', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
              });
              refetch();
            } else if (action === 'cancel') {
              await fetch('/api/travel/bulk-cancel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
              });
              refetch();
            }
          }}
        bulkActions={[
          { id: 'cancel', label: 'Cancel Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        enableCapabilityDetection
        onScanAction={(capability, route) => router.push(route)}
        capabilityBasePath=""
        showFavorite
        showSettings
      />
      {selectedBooking && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedBooking}
          title={(b) => b.booking_reference}
          subtitle={(b) => `${b.crew_member_name} • ${b.origin} → ${b.destination}`}
          sections={detailSections}
          actions={[{ id: 'edit', label: 'Edit Booking', icon: <Pencil className="size-4" /> }]}
          onAction={(id, b) => { if (id === 'edit') router.push(`/travel/${b.id}/edit`); setDrawerOpen(false); }}
        />
      )}
    </>
  );
}
