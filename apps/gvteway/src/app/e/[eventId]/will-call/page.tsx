'use client';

import { useState } from 'react';
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
// Layout provided by route group
import { useEventWillCallData, type WillCallTicket } from '@/hooks/useEventOperations';

export default function EventWillCallPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const [searchQuery, setSearchQuery] = useState('');

  const { tickets, isLoading: loading, markPickedUp } = useEventWillCallData(eventId);

  const pendingCount = tickets.filter((t: WillCallTicket) => t.status === 'pending').length;
  const pickedUpCount = tickets.filter((t: WillCallTicket) => t.status === 'picked-up').length;
  const totalTickets = tickets.reduce((sum: number, t: WillCallTicket) => sum + t.ticketCount, 0);

  const filteredTickets = tickets.filter((t: WillCallTicket) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePickup = async (id: string) => {
    try {
      await markPickedUp(id);
    } catch {
      // Error handled by hook
    }
  };

  return (
    <>
      <Stack gap={8}>
        <SectionHeader kicker="Event" title="Will Call" description="Manage will call ticket pickups" colorScheme="on-dark" />

        <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
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
                  {filteredTickets.map((ticket: WillCallTicket) => (
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
    </>
  );
}
