'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  SectionHeader,
  Card,
  CardBody,
  Stack,
  StatCard,
  Button,
  Badge,
  Grid,
  H3,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  Spinner,
  TableCell,
} from '@ghxstship/ui';
import {
  Ticket,
  Search,
  CheckCircle,
  Clock,
  User,
} from 'lucide-react';
import { GvtewayAppLayout } from '../../../../components/app-layout';
import { log } from '@ghxstship/config';

interface WillCallTicket {
  id: string;
  orderId: string;
  name: string;
  email: string;
  ticketCount: number;
  ticketType: string;
  status: 'pending' | 'picked-up';
  pickupTime?: string;
}

const MOCK_WILL_CALL: WillCallTicket[] = [
  { id: 'WC-001', orderId: 'ORD-12345', name: 'John Smith', email: 'john@email.com', ticketCount: 2, ticketType: 'VIP', status: 'pending' },
  { id: 'WC-002', orderId: 'ORD-12346', name: 'Jane Doe', email: 'jane@email.com', ticketCount: 4, ticketType: 'GA', status: 'picked-up', pickupTime: '18:30' },
  { id: 'WC-003', orderId: 'ORD-12347', name: 'Bob Wilson', email: 'bob@email.com', ticketCount: 1, ticketType: 'Premium', status: 'pending' },
  { id: 'WC-004', orderId: 'ORD-12348', name: 'Sarah Chen', email: 'sarah@email.com', ticketCount: 2, ticketType: 'GA', status: 'picked-up', pickupTime: '19:15' },
];

export default function EventWillCallPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const [tickets, setTickets] = useState<WillCallTicket[]>(MOCK_WILL_CALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchWillCallTickets = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/will-call`);
      if (response.ok) {
        const data = await response.json();
        if (data.tickets && data.tickets.length > 0) {
          setTickets(data.tickets);
        }
      }
    } catch (error) {
      log.error('Failed to fetch will call tickets:', error instanceof Error ? error : undefined);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchWillCallTickets();
  }, [fetchWillCallTickets]);

  const pendingCount = tickets.filter(t => t.status === 'pending').length;
  const pickedUpCount = tickets.filter(t => t.status === 'picked-up').length;
  const totalTickets = tickets.reduce((sum, t) => sum + t.ticketCount, 0);

  const filteredTickets = tickets.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePickup = (id: string) => {
    setTickets(prev => prev.map(t =>
      t.id === id ? { ...t, status: 'picked-up' as const, pickupTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) } : t
    ));
  };

  return (
    <GvtewayAppLayout>
      <Stack gap={8}>
        <SectionHeader kicker="Event" title="Will Call" description="Manage will call ticket pickups" colorScheme="on-dark" />

        <Grid cols={4} gap={4}>
          <StatCard label="Total Orders" value={tickets.length.toString()} icon={<Ticket size={20} />} inverted />
          <StatCard label="Pending" value={pendingCount.toString()} icon={<Clock size={20} />} inverted />
          <StatCard label="Picked Up" value={pickedUpCount.toString()} icon={<CheckCircle size={20} />} inverted />
          <StatCard label="Total Tickets" value={totalTickets.toString()} icon={<User size={20} />} inverted />
        </Grid>

        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <H3 className="text-white">Will Call List</H3>
                <Stack direction="horizontal" gap={2}>
                  <Input placeholder="Search by name, order, or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-80" />
                  <Button variant="outline"><Search size={16} /></Button>
                </Stack>
              </Stack>
              {loading ? (
                <Stack className="items-center py-12">
                  <Spinner variant="grey" size="lg" />
                </Stack>
              ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tickets</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map(ticket => (
                    <TableRow key={ticket.id}>
                      <TableCell>{ticket.orderId}</TableCell>
                      <TableCell className="font-weight-semibold">{ticket.name}</TableCell>
                      <TableCell>{ticket.email}</TableCell>
                      <TableCell>{ticket.ticketCount}</TableCell>
                      <TableCell><Badge variant="info">{ticket.ticketType}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={ticket.status === 'picked-up' ? 'success' : 'warning'}>
                          {ticket.status === 'picked-up' ? `Picked up ${ticket.pickupTime}` : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ticket.status === 'pending' && (
                          <Button variant="solid" size="sm" onClick={() => handlePickup(ticket.id)}>
                            <CheckCircle size={14} className="mr-1" />Release
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              )}
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </GvtewayAppLayout>
  );
}
