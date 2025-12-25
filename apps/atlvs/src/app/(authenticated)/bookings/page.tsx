'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Calendar, Users, MoreVertical } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import {
  Badge,
  Body,
  Box,
  Button,
  Card,
  Container,
  EmptyState,
  EnterprisePageHeader,
  Input,
  MainContent,
  Select,
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

export default function BookingsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, error } = useBookings({ status: statusFilter || undefined });

  const bookings = data?.bookings || [];
  const filteredBookings = bookings.filter(
    (booking) =>
      booking.event_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.booking_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success-100 text-success-800';
      case 'pending':
        return 'bg-warning-100 text-warning-800';
      case 'draft':
        return 'bg-ink-100 text-ink-800';
      case 'completed':
        return 'bg-info-100 text-info-800';
      case 'cancelled':
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-ink-100 text-ink-800';
    }
  };

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="Bookings" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Stack gap={4}>
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-64" />
            </Stack>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <EnterprisePageHeader title="Bookings" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Failed to load bookings"
              description="Please try again."
              action={{ label: 'Retry', onClick: () => window.location.reload() }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  return (
    <>
      <EnterprisePageHeader
        title="Bookings"
        subtitle="Manage your venue bookings and reservations"
        primaryAction={{ label: 'New Booking', onClick: () => router.push('/bookings/new') }}
        secondaryActions={[
          { label: 'Templates', onClick: () => router.push('/bookings/templates') }
        ]}
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            <Stack direction="horizontal" gap={4} className="items-center">
              <Box className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </Box>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </Stack>

            {filteredBookings.length === 0 ? (
              <EmptyState
                title={searchQuery || statusFilter ? 'No bookings match your filters' : 'No bookings yet'}
                description={searchQuery || statusFilter ? 'Try adjusting your filters' : 'Create your first booking to get started'}
                icon={<Calendar className="h-12 w-12" />}
                action={!searchQuery && !statusFilter ? { label: 'New Booking', onClick: () => router.push('/bookings/new') } : undefined}
              />
            ) : (
              <Card className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Guests</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <Link href={`/bookings/${booking.id}`}>
                            <Stack gap={0}>
                              <Text className="font-weight-medium hover:text-primary">
                                {booking.event_name || 'Untitled'}
                              </Text>
                              <Body size="xs" className="text-muted-foreground">
                                {booking.booking_number}
                              </Body>
                            </Stack>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <Stack gap={0}>
                              <Body size="sm">{formatDate(booking.event_date)}</Body>
                              {booking.start_time && (
                                <Body size="xs" className="text-muted-foreground">
                                  {booking.start_time} - {booking.end_time}
                                </Body>
                              )}
                            </Stack>
                          </Stack>
                        </TableCell>
                        <TableCell>{booking.client?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <Stack direction="horizontal" gap={1} className="items-center text-muted-foreground">
                            <Users className="h-4 w-4" />
                            <Text size="sm">{booking.guest_count_expected || 0}</Text>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Text className="font-weight-medium">
                            {formatCurrency(booking.total || 0)}
                          </Text>
                        </TableCell>
                        <TableCell>
                          <Badge className={`capitalize ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            )}
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
