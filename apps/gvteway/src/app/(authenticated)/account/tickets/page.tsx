'use client';

import { useState } from 'react';
import {
  Badge,
  Button,
  Input,
  ListPage,
  Modal,
  Stack,
  Text,
  useNotifications,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
} from '@ghxstship/ui';
import { Download, Send, QrCode } from 'lucide-react';
import { useTickets } from '@/hooks/useTickets';
import { useRouter } from 'next/navigation';

interface DisplayTicket {
  id: string;
  eventName: string;
  eventDate: string;
  venue: string;
  ticketType: string;
  status: string;
  seat: string | null;
}

export default function AccountTicketsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const { data: ticketsData, isLoading, error, refetch } = useTickets();
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<DisplayTicket | null>(null);
  const [transferEmail, setTransferEmail] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const tickets: DisplayTicket[] = (ticketsData || []).map(ticket => ({
    id: ticket.id,
    eventName: ticket.event?.title || ticket.event?.name || 'Event',
    eventDate: ticket.event?.event_date || ticket.event?.start_date 
      ? new Date(ticket.event?.event_date || ticket.event?.start_date || '').toLocaleDateString()
      : 'TBD',
    venue: ticket.event?.venue || 'Venue TBD',
    ticketType: ticket.ticket_type?.name || 'General Admission',
    status: ticket.status === 'sold' ? 'active' : ticket.status,
    seat: ticket.seat_number || null,
  }));

  const handleDownloadTicket = async (ticket: DisplayTicket) => {
    try {
      const { PDFGenerator } = await import('@ghxstship/config/pdf-generator');
      const generator = new PDFGenerator({
        title: 'Event Ticket',
        subtitle: ticket.eventName,
        includeTimestamp: false,
        includePageNumbers: false,
      });

      generator.addHeading('Ticket Details', 2);
      generator.addKeyValuePairs([
        { label: 'Ticket ID', value: ticket.id.slice(0, 8).toUpperCase() },
        { label: 'Event', value: ticket.eventName },
        { label: 'Date', value: ticket.eventDate },
        { label: 'Venue', value: ticket.venue },
        { label: 'Ticket Type', value: ticket.ticketType },
        { label: 'Seat', value: ticket.seat || 'General Admission' },
      ]);

      generator.addSpacer(15);
      generator.addHeading('Entry Instructions', 2);
      generator.addParagraph('Present this ticket at the venue entrance. A valid photo ID matching the ticket holder name may be required.');
      generator.addSpacer(10);
      generator.addParagraph('QR Code for entry will be displayed in the GVTEWAY app. Please have your phone ready at the entrance.');

      generator.download(`ticket-${ticket.id.slice(0, 8)}.pdf`);
      addNotification({ type: 'success', title: 'Ticket Downloaded', message: 'Your ticket has been downloaded' });
    } catch (err) {
      addNotification({ type: 'error', title: 'Download Failed', message: err instanceof Error ? err.message : 'Failed to generate ticket' });
    }
  };

  const handleOpenTransferModal = (ticket: DisplayTicket) => {
    setSelectedTicket(ticket);
    setTransferEmail('');
    setTransferModalOpen(true);
  };

  const handleTransferTicket = async () => {
    if (!selectedTicket || !transferEmail) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(transferEmail)) {
      addNotification({ type: 'error', title: 'Invalid Email', message: 'Please enter a valid email address' });
      return;
    }

    setIsTransferring(true);
    try {
      const response = await fetch('/api/tickets/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: selectedTicket.id,
          recipient_email: transferEmail,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Transfer failed');
      }

      addNotification({ 
        type: 'success', 
        title: 'Transfer Initiated', 
        message: `Transfer request sent to ${transferEmail}. They will receive an email to accept the ticket.` 
      });
      setTransferModalOpen(false);
      refetch();
    } catch (err) {
      addNotification({ type: 'error', title: 'Transfer Failed', message: err instanceof Error ? err.message : 'Failed to transfer ticket' });
    } finally {
      setIsTransferring(false);
    }
  };

  const columns: ListPageColumn<DisplayTicket>[] = [
    { key: 'eventName', label: 'Event', accessor: 'eventName', sortable: true },
    { key: 'eventDate', label: 'Date', accessor: 'eventDate', sortable: true },
    { key: 'venue', label: 'Venue', accessor: 'venue' },
    { key: 'ticketType', label: 'Ticket Type', accessor: 'ticketType' },
    { key: 'seat', label: 'Seat', accessor: (t) => t.seat || '—' },
    {
      key: 'status', label: 'Status', accessor: 'status', sortable: true,
      render: (_, ticket) => (
        <Badge variant={ticket.status === 'active' ? 'success' : ticket.status === 'used' ? 'info' : 'warning'}>
          {ticket.status}
        </Badge>
      ),
    },
  ];

  const filters: ListPageFilter[] = [
    { key: 'status', label: 'Status', options: [
      { value: 'active', label: 'Upcoming' },
      { value: 'used', label: 'Used' },
      { value: 'cancelled', label: 'Cancelled' },
    ]},
  ];

  const rowActions: ListPageAction<DisplayTicket>[] = [
    { id: 'view', label: 'View QR', icon: <QrCode className="h-4 w-4" />, onClick: (ticket) => router.push(`/account/tickets/${ticket.id}`) },
    { id: 'download', label: 'Download', icon: <Download className="h-4 w-4" />, onClick: (ticket) => handleDownloadTicket(ticket) },
    { id: 'transfer', label: 'Transfer', icon: <Send className="h-4 w-4" />, onClick: (ticket) => handleOpenTransferModal(ticket) },
  ];

  return (
    <>
      <ListPage<DisplayTicket>
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
        onRowClick={(ticket) => router.push(`/account/tickets/${ticket.id}`)}
        emptyMessage="No tickets yet"
        emptyAction={{ label: 'Browse Events', onClick: () => router.push('/browse') }}
        entityType="tickets"
        breadcrumbs={[{ label: 'Account', href: '/account' }, { label: 'Tickets' }]}
        showFavorite
        showSettings
      />

      <Modal
        open={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        title="Transfer Ticket"
      >
        <Stack gap={4}>
          <Text>
            Transfer your ticket for <strong>{selectedTicket?.eventName}</strong> to another person.
            They will receive an email to accept the transfer.
          </Text>
          <Stack gap={2}>
            <Text className="font-weight-medium">Recipient Email</Text>
            <Input
              type="email"
              value={transferEmail}
              onChange={(e) => setTransferEmail(e.target.value)}
              placeholder="Enter recipient's email address"
            />
          </Stack>
          <Stack direction="horizontal" gap={2} className="justify-end">
            <Button variant="outline" onClick={() => setTransferModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleTransferTicket} 
              disabled={!transferEmail || isTransferring}
            >
              {isTransferring ? 'Transferring...' : 'Transfer Ticket'}
            </Button>
          </Stack>
        </Stack>
      </Modal>
    </>
  );
}
