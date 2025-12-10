"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, ShoppingCart, X } from "lucide-react";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  ListPage,
  Badge,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates } from "@ghxstship/config";
import { useResaleData, type ResaleListing } from "@/hooks/useResale";

const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);

const getStatusVariant = (status: string): "solid" | "outline" | "ghost" => {
  switch (status?.toLowerCase()) {
    case "sold": return "solid";
    case "active": case "listed": return "outline";
    default: return "ghost";
  }
};

const columns: ListPageColumn<ResaleListing>[] = [
  { key: 'event_name', label: 'Event', accessor: 'event_name', sortable: true },
  { key: 'venue_name', label: 'Venue', accessor: 'venue_name' },
  { key: 'event_date', label: 'Date', accessor: (r) => new Date(r.event_date).toLocaleDateString(), sortable: true },
  { key: 'ticket_type', label: 'Type', accessor: 'ticket_type' },
  { key: 'seat', label: 'Section/Seat', accessor: (r) => r.section ? `${r.section} / Row ${r.row}` : 'GA' },
  { key: 'asking_price', label: 'Price', accessor: (r) => formatCurrency(r.asking_price), sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'active', label: 'Active' }, { value: 'sold', label: 'Sold' }, { value: 'expired', label: 'Expired' }] },
  { key: 'ticket_type', label: 'Type', options: [{ value: 'GA', label: 'General Admission' }, { value: 'VIP', label: 'VIP' }, { value: 'Reserved', label: 'Reserved' }] },
];

export default function ResalePage() {
  const router = useRouter();
  const [selectedListing, setSelectedListing] = useState<ResaleListing | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const {
    listings,
    isLoading: loading,
    error,
    deleteListing,
    refetch,
  } = useResaleData();

  const handleDelete = async () => {
    if (!selectedListing) return;
    await deleteListing(selectedListing.id);
    setDeleteConfirmOpen(false);
    setSelectedListing(null);
  };

  const activeCount = listings.filter(l => l.status === 'active').length;
  const soldCount = listings.filter(l => l.status === 'sold').length;
  const totalValue = listings.reduce((sum, l) => sum + l.asking_price, 0);

  const rowActions: ListPageAction<ResaleListing>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedListing(r); setDrawerOpen(true); } },
    { id: 'buy', label: 'Buy Now', icon: <ShoppingCart className="size-4" />, onClick: (r) => router.push(`/checkout?listing=${r.id}`) },
    { id: 'cancel', label: 'Cancel', icon: <X className="size-4" />, onClick: (r) => { setSelectedListing(r); setDeleteConfirmOpen(true); }, variant: 'danger' },
  ];

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'resale',
    requiredFields: ['event_name', 'ticket_type', 'asking_price'],
    onImport: async (records) => {
      for (const record of records) {
        const newListing: ResaleListing = {
          id: `RSL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ticket_id: String(record.ticket_id || ''),
          event_id: String(record.event_id || ''),
          event_name: String(record.event_name || ''),
          event_date: String(record.event_date || ''),
          venue_name: String(record.venue_name || ''),
          ticket_type: String(record.ticket_type || ''),
          original_price: Number(record.original_price) || 0,
          asking_price: Number(record.asking_price) || 0,
          seller_id: String(record.seller_id || ''),
          seller_name: String(record.seller_name || ''),
          status: 'active',
          listed_at: new Date().toISOString(),
        };
        // Listing added - refetch to update
      }
    },
  });

  const importTemplates = getImportTemplates('resale').length > 0 
    ? getImportTemplates('resale') 
    : [{ id: 'default', name: 'Resale Import', mapping: { event_name: 'event_name', ticket_type: 'ticket_type', asking_price: 'asking_price', original_price: 'original_price' } }];

  const stats = [
    { label: 'Total Listings', value: listings.length },
    { label: 'Active', value: activeCount },
    { label: 'Sold', value: soldCount },
    { label: 'Market Value', value: formatCurrency(totalValue) },
  ];

  const detailSections: DetailSection[] = selectedListing ? [
    { id: 'overview', title: 'Listing Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Event:</strong> {selectedListing.event_name}</Body>
        <Body size="sm"><strong>Venue:</strong> {selectedListing.venue_name}</Body>
        <Body size="sm"><strong>Date:</strong> {new Date(selectedListing.event_date).toLocaleDateString()}</Body>
        <Body size="sm"><strong>Ticket Type:</strong> {selectedListing.ticket_type}</Body>
        <Body size="sm"><strong>Section:</strong> {selectedListing.section || 'GA'}</Body>
        <Body size="sm"><strong>Row:</strong> {selectedListing.row || '—'}</Body>
        <Body size="sm"><strong>Seat:</strong> {selectedListing.seat || '—'}</Body>
        <Body size="sm"><strong>Original Price:</strong> {formatCurrency(selectedListing.original_price)}</Body>
        <Body size="sm"><strong>Asking Price:</strong> {formatCurrency(selectedListing.asking_price)}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedListing.status}</Body>
        <Body size="sm"><strong>Seller:</strong> {selectedListing.seller_name}</Body>
        <Body size="sm"><strong>Listed:</strong> {new Date(selectedListing.listed_at).toLocaleDateString()}</Body>
      </Grid>
    )},
  ] : [];

  return (
    <GvtewayAppLayout>
      <ListPage<ResaleListing>
        title="Ticket Resale"
        subtitle="Buy and sell tickets safely through our verified marketplace"
        data={listings}
        columns={columns}
        rowKey="id"
        loading={loading}
        error={error instanceof Error ? error : undefined}
        onRetry={refetch}
        searchPlaceholder="Search events..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedListing(r); setDrawerOpen(true); }}
        createLabel="List a Ticket"
        onCreate={() => router.push('/tickets')}
        entityType="resale-listings"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['event_name', 'ticket_type', 'asking_price', 'original_price']}
        onExport={createExportHandler({
          filename: "resale-listings",
          getData: () => listings.map(l => ({
            id: l.id,
            event_name: l.event_name,
            event_date: l.event_date,
            venue_name: l.venue_name,
            ticket_type: l.ticket_type,
            section: l.section || '',
            original_price: l.original_price,
            asking_price: l.asking_price,
            seller_name: l.seller_name,
            status: l.status,
          })),
        })}
        stats={stats}
        emptyMessage="No listings found"
        emptyAction={{ label: 'List a Ticket', onClick: () => router.push('/tickets') }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/resale/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch();
          } else if (action === 'delist') {
            await fetch('/api/resale/bulk-delist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch();
          }
        }}
        bulkActions={[
          { id: 'delist', label: 'Delist Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
      />
      {selectedListing && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedListing}
          title={(l) => l.event_name}
          subtitle={(l) => `${l.venue_name} • ${formatCurrency(l.asking_price)}`}
          sections={detailSections}
          actions={[{ id: 'buy', label: 'Buy Now', icon: <ShoppingCart className="size-4" /> }]}
          onAction={(id, l) => { if (id === 'buy') router.push(`/checkout?listing=${l.id}`); setDrawerOpen(false); }}
        />
      )}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onCancel={() => setDeleteConfirmOpen(false)}
        title="Cancel Listing"
        message={`Are you sure you want to cancel the listing for "${selectedListing?.event_name}"?`}
        confirmLabel="Cancel Listing"
        onConfirm={handleDelete}
        variant="danger"
      />
    </GvtewayAppLayout>
  );
}
