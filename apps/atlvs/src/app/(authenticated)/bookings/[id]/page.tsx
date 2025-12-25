'use client';

import {
  Badge,
  Body,
  Box,
  Button,
  Card,
  Container,
  EmptyState,
  EnterprisePageHeader,
  Grid,
  H2,
  MainContent,
  Modal,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

interface BookingData {
  event_name?: string;
  booking_number: string;
  status: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  guest_count_expected?: number;
  venue?: { name: string };
  client?: { name: string; email?: string };
  line_items?: Array<{ id: string; description: string; quantity: number; unit_price: number; total: number }>;
  subtotal?: number;
  discount_amount?: number;
  tax_amount?: number;
  total?: number;
}

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Edit2, Copy, Trash2, Calendar, Users, DollarSign, Clock, MapPin, User, Mail, FileText } from 'lucide-react';
import { useBooking, useCloneBooking, useDeleteBooking } from '@/hooks/useBookings';
import { useState } from 'react';

export default function BookingDetailPage() {
  const params = useParams();
  const bookingId = params?.id as string;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data, isLoading, error } = useBooking(bookingId);
  const cloneBooking = useCloneBooking();
  const deleteBooking = useDeleteBooking();

  const booking = data as BookingData | undefined;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'info';
    }
  };

  const handleClone = async () => {
    const result = await cloneBooking.mutateAsync(bookingId);
    if (result?.booking?.id) {
      window.location.href = `/bookings/${result.booking.id}`;
    }
  };

  const handleDelete = async () => {
    await deleteBooking.mutateAsync(bookingId);
    window.location.href = '/bookings';
  };

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="Booking Details" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Stack gap={6}>
              <Skeleton className="h-32" />
              <Grid cols={3} gap={6}>
                <Box className="col-span-2"><Skeleton className="h-64" /></Box>
                <Skeleton className="h-64" />
              </Grid>
            </Stack>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error || !booking) {
    return (
      <>
        <EnterprisePageHeader title="Booking Details" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Booking not found"
              description="The booking you're looking for doesn't exist or has been removed."
              action={{ label: 'Back to Bookings', onClick: () => window.location.href = '/bookings' }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  return (
    <>
      <EnterprisePageHeader
        title={booking.event_name || 'Untitled Booking'}
        subtitle={booking.booking_number}
      />
      <Box className="px-6 py-3 border-b border-border flex items-center justify-between">
        <Badge variant={getStatusVariant(booking.status)}>{booking.status}</Badge>
        <Stack direction="horizontal" gap={3}>
          <Button variant="outline" onClick={handleClone} disabled={cloneBooking.isPending}>
            <Copy className="h-4 w-4 mr-2" />
            Clone
          </Button>
          <Link href={`/bookings/${bookingId}/edit`}>
            <Button>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </Stack>
      </Box>
      <MainContent padding="lg">
        <Container>

          <Grid cols={3} gap={6}>
            <Stack gap={6} className="col-span-2">
              <Card className="p-6">
                <H2 className="mb-4">Event Details</H2>
                <Grid cols={2} gap={6}>
                  <Stack direction="horizontal" gap={3}>
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <Stack gap={1}>
                      <Body size="xs" className="text-muted-foreground">Event Date</Body>
                      <Body className="font-weight-medium">{formatDate(booking.event_date)}</Body>
                    </Stack>
                  </Stack>
                  <Stack direction="horizontal" gap={3}>
                    <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <Stack gap={1}>
                      <Body size="xs" className="text-muted-foreground">Time</Body>
                      <Body className="font-weight-medium">
                        {booking.start_time || 'TBD'} - {booking.end_time || 'TBD'}
                      </Body>
                    </Stack>
                  </Stack>
                  <Stack direction="horizontal" gap={3}>
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <Stack gap={1}>
                      <Body size="xs" className="text-muted-foreground">Guest Count</Body>
                      <Body className="font-weight-medium">{booking.guest_count_expected || 0} expected</Body>
                    </Stack>
                  </Stack>
                  <Stack direction="horizontal" gap={3}>
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <Stack gap={1}>
                      <Body size="xs" className="text-muted-foreground">Venue</Body>
                      <Body className="font-weight-medium">{booking.venue?.name || 'Not specified'}</Body>
                    </Stack>
                  </Stack>
                </Grid>
              </Card>

              {booking.client && (
                <Card className="p-6">
                  <H2 className="mb-4">Client Information</H2>
                  <Grid cols={2} gap={6}>
                    <Stack direction="horizontal" gap={3}>
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <Stack gap={1}>
                        <Body size="xs" className="text-muted-foreground">Client</Body>
                        <Body className="font-weight-medium">{booking.client.name}</Body>
                      </Stack>
                    </Stack>
                    {booking.client.email && (
                      <Stack direction="horizontal" gap={3}>
                        <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <Stack gap={1}>
                          <Body size="xs" className="text-muted-foreground">Email</Body>
                          <Link href={`mailto:${booking.client.email}`} className="text-primary hover:underline">
                            {booking.client.email}
                          </Link>
                        </Stack>
                      </Stack>
                    )}
                  </Grid>
                </Card>
              )}

              {booking.line_items && booking.line_items.length > 0 && (
                <Card className="p-6">
                  <H2 className="mb-4">Line Items</H2>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {booking.line_items.map((item: { id: string; description: string; quantity: number; unit_price: number; total: number }) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.description}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                          <TableCell className="text-right font-weight-medium">{formatCurrency(item.total)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}
            </Stack>

            <Stack gap={6}>
              <Card className="p-6">
                <H2 className="mb-4">Financial Summary</H2>
                <Stack gap={3}>
                  <Stack direction="horizontal" className="justify-between">
                    <Text size="sm" className="text-muted-foreground">Subtotal</Text>
                    <Text size="sm">{formatCurrency(booking.subtotal || 0)}</Text>
                  </Stack>
                  {(booking.discount_amount ?? 0) > 0 && (
                    <Stack direction="horizontal" className="justify-between">
                      <Text size="sm" className="text-muted-foreground">Discount</Text>
                      <Text size="sm" className="text-success">-{formatCurrency(booking.discount_amount ?? 0)}</Text>
                    </Stack>
                  )}
                  <Stack direction="horizontal" className="justify-between">
                    <Text size="sm" className="text-muted-foreground">Tax</Text>
                    <Text size="sm">{formatCurrency(booking.tax_amount || 0)}</Text>
                  </Stack>
                  <Box className="pt-3 border-t border-border">
                    <Stack direction="horizontal" className="justify-between">
                      <Text className="font-weight-semibold">Total</Text>
                      <Text className="text-h4-md font-weight-bold">{formatCurrency(booking.total || 0)}</Text>
                    </Stack>
                  </Box>
                </Stack>
              </Card>

              <Card className="p-6">
                <H2 className="mb-4">Quick Actions</H2>
                <Stack gap={2}>
                  <Link href={`/proposals/new?booking=${bookingId}`} className="flex items-center gap-2 px-4 py-2 hover:bg-muted rounded-button transition-colors">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Text size="sm">Create Proposal</Text>
                  </Link>
                  <Link href={`/contracts/new?booking=${bookingId}`} className="flex items-center gap-2 px-4 py-2 hover:bg-muted rounded-button transition-colors">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Text size="sm">Create Contract</Text>
                  </Link>
                  <Link href={`/invoices/new?booking=${bookingId}`} className="flex items-center gap-2 px-4 py-2 hover:bg-muted rounded-button transition-colors">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Text size="sm">Create Invoice</Text>
                  </Link>
                </Stack>
              </Card>
            </Stack>
          </Grid>

          <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Cancel Booking">
            <Body size="sm" className="text-muted-foreground mb-4">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </Body>
            <Stack direction="horizontal" gap={3} className="justify-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Keep Booking
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteBooking.isPending}>
                {deleteBooking.isPending ? 'Cancelling...' : 'Cancel Booking'}
              </Button>
            </Stack>
          </Modal>
        </Container>
      </MainContent>
    </>
  );
}
