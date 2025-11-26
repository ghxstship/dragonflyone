"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  ListPage,
  Badge,
  DetailDrawer,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from "@ghxstship/ui";
import { getBadgeVariant } from "@ghxstship/config";

interface TravelBooking {
  id: string;
  booking_reference: string;
  crew_member_id: string;
  crew_member_name: string;
  project_id: string;
  project_name: string;
  travel_type: string;
  departure_date: string;
  return_date?: string;
  origin: string;
  destination: string;
  carrier?: string;
  flight_number?: string;
  hotel_name?: string;
  confirmation_number?: string;
  cost: number;
  status: string;
  notes?: string;
  [key: string]: unknown;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);

const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<TravelBooking>[] = [
  { key: 'booking_reference', label: 'Reference', accessor: 'booking_reference', sortable: true },
  { key: 'crew_member_name', label: 'Crew Member', accessor: 'crew_member_name', sortable: true },
  { key: 'project_name', label: 'Project', accessor: 'project_name' },
  { key: 'route', label: 'Route', accessor: (r) => `${r.origin} → ${r.destination}` },
  { key: 'departure_date', label: 'Departure', accessor: (r) => new Date(r.departure_date).toLocaleDateString(), sortable: true },
  { key: 'carrier', label: 'Carrier', accessor: (r) => r.carrier || '—' },
  { key: 'cost', label: 'Cost', accessor: (r) => formatCurrency(r.cost), sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'confirmed', label: 'Confirmed' }, { value: 'pending', label: 'Pending' }, { value: 'cancelled', label: 'Cancelled' }] },
  { key: 'travel_type', label: 'Type', options: [{ value: 'flight', label: 'Flight' }, { value: 'train', label: 'Train' }, { value: 'bus', label: 'Bus' }] },
];

export default function TravelPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<TravelBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<TravelBooking | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchTravelData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/travel");
      if (!response.ok) throw new Error("Failed to fetch travel data");
      const data = await response.json();
      setBookings(data.bookings || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTravelData(); }, [fetchTravelData]);

  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length;
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const totalCost = bookings.reduce((sum, b) => sum + b.cost, 0);

  const rowActions: ListPageAction<TravelBooking>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedBooking(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (r) => router.push(`/travel/${r.id}/edit`) },
  ];

  const stats = [
    { label: 'Total Bookings', value: bookings.length },
    { label: 'Confirmed', value: confirmedCount },
    { label: 'Pending', value: pendingCount },
    { label: 'Total Cost', value: formatCurrency(totalCost) },
  ];

  const detailSections: DetailSection[] = selectedBooking ? [
    { id: 'overview', title: 'Booking Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Reference:</strong> {selectedBooking.booking_reference}</div>
        <div><strong>Crew Member:</strong> {selectedBooking.crew_member_name}</div>
        <div><strong>Project:</strong> {selectedBooking.project_name}</div>
        <div><strong>Type:</strong> {selectedBooking.travel_type}</div>
        <div><strong>Origin:</strong> {selectedBooking.origin}</div>
        <div><strong>Destination:</strong> {selectedBooking.destination}</div>
        <div><strong>Departure:</strong> {new Date(selectedBooking.departure_date).toLocaleDateString()}</div>
        <div><strong>Return:</strong> {selectedBooking.return_date ? new Date(selectedBooking.return_date).toLocaleDateString() : '—'}</div>
        <div><strong>Carrier:</strong> {selectedBooking.carrier || '—'}</div>
        <div><strong>Flight #:</strong> {selectedBooking.flight_number || '—'}</div>
        <div><strong>Cost:</strong> {formatCurrency(selectedBooking.cost)}</div>
        <div><strong>Status:</strong> {selectedBooking.status}</div>
        {selectedBooking.notes && <div className="col-span-2"><strong>Notes:</strong> {selectedBooking.notes}</div>}
      </div>
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
        error={error ? new Error(error) : undefined}
        onRetry={fetchTravelData}
        searchPlaceholder="Search bookings..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedBooking(r); setDrawerOpen(true); }}
        createLabel="Book Travel"
        onCreate={() => router.push('/travel/new')}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No travel bookings"
        emptyAction={{ label: 'Book Travel', onClick: () => router.push('/travel/new') }}
        header={<Navigation />}
      />
      {selectedBooking && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedBooking}
          title={(b) => b.booking_reference}
          subtitle={(b) => `${b.crew_member_name} • ${b.origin} → ${b.destination}`}
          sections={detailSections}
          actions={[{ id: 'edit', label: 'Edit Booking', icon: '✏️' }]}
          onAction={(id, b) => { if (id === 'edit') router.push(`/travel/${b.id}/edit`); setDrawerOpen(false); }}
        />
      )}
    </>
  );
}
