"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ConsumerNavigationPublic } from "@/components/navigation";
import {
  ListPage,
  Badge,
  DetailDrawer,
  ConfirmDialog,
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from "@ghxstship/ui";

interface ResaleListing {
  id: string;
  ticket_id: string;
  event_id: string;
  event_name: string;
  event_date: string;
  venue_name: string;
  ticket_type: string;
  section?: string;
  row?: string;
  seat?: string;
  original_price: number;
  asking_price: number;
  seller_id: string;
  seller_name: string;
  status: string;
  listed_at: string;
  expires_at?: string;
  [key: string]: unknown;
}

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
  const [listings, setListings] = useState<ResaleListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<ResaleListing | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/resale');
      if (!response.ok) throw new Error("Failed to fetch listings");
      const data = await response.json();
      setListings(data.listings || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleDelete = async () => {
    if (!selectedListing) return;
    setListings(listings.filter(l => l.id !== selectedListing.id));
    setDeleteConfirmOpen(false);
    setSelectedListing(null);
  };

  const activeCount = listings.filter(l => l.status === 'active').length;
  const soldCount = listings.filter(l => l.status === 'sold').length;
  const totalValue = listings.reduce((sum, l) => sum + l.asking_price, 0);

  const rowActions: ListPageAction<ResaleListing>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedListing(r); setDrawerOpen(true); } },
    { id: 'buy', label: 'Buy Now', icon: '🛒', onClick: (r) => router.push(`/checkout?listing=${r.id}`) },
    { id: 'cancel', label: 'Cancel', icon: '❌', onClick: (r) => { setSelectedListing(r); setDeleteConfirmOpen(true); }, variant: 'danger' },
  ];

  const stats = [
    { label: 'Total Listings', value: listings.length },
    { label: 'Active', value: activeCount },
    { label: 'Sold', value: soldCount },
    { label: 'Market Value', value: formatCurrency(totalValue) },
  ];

  const detailSections: DetailSection[] = selectedListing ? [
    { id: 'overview', title: 'Listing Details', content: (
      <div className="grid grid-cols-2 gap-spacing-4">
        <div><strong>Event:</strong> {selectedListing.event_name}</div>
        <div><strong>Venue:</strong> {selectedListing.venue_name}</div>
        <div><strong>Date:</strong> {new Date(selectedListing.event_date).toLocaleDateString()}</div>
        <div><strong>Ticket Type:</strong> {selectedListing.ticket_type}</div>
        <div><strong>Section:</strong> {selectedListing.section || 'GA'}</div>
        <div><strong>Row:</strong> {selectedListing.row || '—'}</div>
        <div><strong>Seat:</strong> {selectedListing.seat || '—'}</div>
        <div><strong>Original Price:</strong> {formatCurrency(selectedListing.original_price)}</div>
        <div><strong>Asking Price:</strong> {formatCurrency(selectedListing.asking_price)}</div>
        <div><strong>Status:</strong> {selectedListing.status}</div>
        <div><strong>Seller:</strong> {selectedListing.seller_name}</div>
        <div><strong>Listed:</strong> {new Date(selectedListing.listed_at).toLocaleDateString()}</div>
      </div>
    )},
  ] : [];

  const footerContent = (
    <Footer
      logo={<Display size="md">GVTEWAY</Display>}
      copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
    >
      <FooterColumn title="Marketplace">
        <FooterLink href="/resale">Resale</FooterLink>
        <FooterLink href="/events">Events</FooterLink>
      </FooterColumn>
      <FooterColumn title="Legal">
        <FooterLink href="/legal/privacy">Privacy</FooterLink>
        <FooterLink href="/legal/terms">Terms</FooterLink>
      </FooterColumn>
    </Footer>
  );

  return (
    <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={footerContent}>
      <ListPage<ResaleListing>
        title="Ticket Resale"
        subtitle="Buy and sell tickets safely through our verified marketplace"
        data={listings}
        columns={columns}
        rowKey="id"
        loading={loading}
        error={error ? new Error(error) : undefined}
        onRetry={fetchListings}
        searchPlaceholder="Search events..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedListing(r); setDrawerOpen(true); }}
        createLabel="List a Ticket"
        onCreate={() => router.push('/tickets')}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No listings found"
        emptyAction={{ label: 'List a Ticket', onClick: () => router.push('/tickets') }}
      />
      {selectedListing && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedListing}
          title={(l) => l.event_name}
          subtitle={(l) => `${l.venue_name} • ${formatCurrency(l.asking_price)}`}
          sections={detailSections}
          actions={[{ id: 'buy', label: 'Buy Now', icon: '🛒' }]}
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
    </PageLayout>
  );
}
