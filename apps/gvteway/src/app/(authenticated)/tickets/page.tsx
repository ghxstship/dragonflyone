"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, QrCode, Send, Trash2, Download } from "lucide-react";
import {
  Badge,
  Body,
  ConfirmDialog,
  DetailDrawer,
  Grid,
  ListPage,
  Text,
  type DetailSection,
  type ListPageAction,
  type ListPageBulkAction,
  type ListPageColumn,
  type ListPageFilter,
} from '@ghxstship/ui';
import { createExportHandler } from "@ghxstship/config";
import { useTickets, type Ticket } from "@/hooks/useTickets";

export default function TicketsPage() {
  const router = useRouter();
  const { data: tickets = [], isLoading, error, refetch } = useTickets();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  const columns: ListPageColumn<Ticket>[] = [
    { 
      key: 'event', 
      label: 'Event', 
      accessor: (row) => row.event?.name || row.event?.title || 'Event',
      sortable: true
    },
    { 
      key: 'ticket_type', 
      label: 'Type', 
      accessor: (row) => row.ticket_type?.name || 'General',
      render: (value) => <Badge variant="outline">{String(value)}</Badge>
    },
    { key: 'seat_number', label: 'Seat', accessor: (row) => row.seat_number || 'GA' },
    { 
      key: 'price', 
      label: 'Price', 
      accessor: 'price', 
      sortable: true,
      render: (value) => `$${Number(value || 0).toFixed(2)}`
    },
    { 
      key: 'event_date', 
      label: 'Event Date', 
      accessor: (row) => row.event?.start_date || row.event?.event_date,
      sortable: true,
      render: (value) => value ? new Date(String(value)).toLocaleDateString() : 'TBD'
    },
    { 
      key: 'status', 
      label: 'Status', 
      accessor: 'status', 
      sortable: true,
      render: (value) => {
        // Schema: status enum ['valid', 'used', 'cancelled', 'refunded']
        const variant = value === 'valid' ? 'success' : value === 'used' ? 'info' : value === 'cancelled' ? 'error' : value === 'refunded' ? 'warning' : 'outline';
        return <Badge variant={variant}>{String(value).toUpperCase()}</Badge>;
      }
    },
    { 
      key: 'id', 
      label: 'Ticket ID', 
      accessor: 'id',
      render: (value) => <Text className="font-mono">{String(value).substring(0, 12).toUpperCase()}</Text>
    },
  ];

  const filters: ListPageFilter[] = [
    { 
      key: 'status', 
      label: 'Status', 
      // Schema: status enum from API validation: ['valid', 'used', 'cancelled', 'refunded']
      options: [
        { value: 'valid', label: 'Valid' },
        { value: 'used', label: 'Used' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'refunded', label: 'Refunded' },
      ]
    },
  ];

  const rowActions: ListPageAction<Ticket>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedTicket(row); setDrawerOpen(true); } },
    { id: 'qr', label: 'View QR Code', icon: <QrCode className="size-4" />, onClick: (row) => router.push(`/tickets/${row.id}/qr`) },
    { id: 'transfer', label: 'Transfer', icon: <Send className="size-4" />, onClick: (row) => router.push(`/tickets/${row.id}/transfer`), disabled: (row) => row.status === 'cancelled' },
    { id: 'cancel', label: 'Cancel', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (row) => { setSelectedTicket(row); setCancelConfirmOpen(true); }, disabled: (row) => row.status === 'cancelled' },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
  ];

  const handleCancel = async () => {
    if (selectedTicket) {
      try {
        await fetch(`/api/tickets/${selectedTicket.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'cancelled' }),
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to cancel ticket';
        alert(errorMessage);
      }
    }
    setCancelConfirmOpen(false);
    setSelectedTicket(null);
    refetch();
  };

  // Schema: status enum ['available', 'reserved', 'sold', 'cancelled'] - 'sold' represents sold tickets
  const soldCount = tickets.filter(t => t.status === 'sold').length;
  const totalRevenue = tickets.filter(t => t.status === 'sold').reduce((sum, t) => sum + (t.price || 0), 0);

  const stats = [
    { label: 'Total Tickets', value: tickets.length },
    { label: 'Sold', value: soldCount },
    { label: 'Revenue', value: `$${totalRevenue.toLocaleString()}` },
  ];

  const detailSections: DetailSection[] = selectedTicket ? [
    {
      id: 'overview',
      title: 'Ticket Details',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Body size="sm"><strong>Event:</strong> {selectedTicket.event?.name || selectedTicket.event?.title || 'Event'}</Body>
          <Body size="sm"><strong>Venue:</strong> {selectedTicket.event?.venue || 'TBD'}</Body>
          <Body size="sm"><strong>Type:</strong> {selectedTicket.ticket_type?.name || 'General'}</Body>
          <Body size="sm"><strong>Seat:</strong> {selectedTicket.seat_number || 'General Admission'}</Body>
          <Body size="sm"><strong>Price:</strong> ${(selectedTicket.price || 0).toFixed(2)}</Body>
          <Body size="sm"><strong>Status:</strong> {selectedTicket.status.toUpperCase()}</Body>
          <Body size="sm"><strong>Event Date:</strong> {selectedTicket.event?.start_date ? new Date(selectedTicket.event.start_date).toLocaleDateString() : 'TBD'}</Body>
          <Body size="sm"><strong>Ticket ID:</strong> {selectedTicket.id.substring(0, 12).toUpperCase()}</Body>
        </Grid>
      ),
    },
  ] : [];

  return (
    <>
      <ListPage<Ticket>
        title="My Tickets"
        subtitle="View and manage your event tickets"
        data={tickets}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search tickets..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={async (actionId, selectedIds) => {
          if (actionId === 'export') {
            const selected = tickets.filter(t => selectedIds.includes(t.id));
            const csv = [
              ['Event', 'Type', 'Seat', 'Price', 'Status', 'Ticket ID'].join(','),
              ...selected.map(t => [t.event?.name || t.event?.title, t.ticket_type?.name, t.seat_number, t.price, t.status, t.id].join(','))
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'tickets-export.csv';
            a.click();
            URL.revokeObjectURL(url);
          }
        }}
        onRowClick={(row) => { setSelectedTicket(row); setDrawerOpen(true); }}
        entityType="tickets"
        onExport={createExportHandler({
          filename: "tickets",
          getData: () => tickets.map(t => ({
            event: t.event?.name || t.event?.title,
            type: t.ticket_type?.name,
            seat: t.seat_number,
            price: t.price,
            status: t.status,
            id: t.id,
          })),
        })}
        stats={stats}
        emptyMessage="No tickets found"
        emptyAction={{ label: 'Browse Events', onClick: () => router.push('/events') }}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedTicket}
        title={(t) => t.event?.name || t.event?.title || 'Ticket'}
        subtitle={(t) => t.ticket_type?.name || 'General'}
        sections={detailSections}
      />

      <ConfirmDialog
        open={cancelConfirmOpen}
        title="Cancel Ticket"
        message="Are you sure you want to cancel this ticket? This action cannot be undone."
        variant="danger"
        confirmLabel="Cancel Ticket"
        onConfirm={handleCancel}
        onCancel={() => { setCancelConfirmOpen(false); setSelectedTicket(null); }}
      />
    </>
  );
}
