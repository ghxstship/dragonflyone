'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Calendar, Users, MoreVertical } from 'lucide-react';
import { useBookings } from '@/hooks/useBookings';
import {
  Body,
  Button,
  H1,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

export default function BookingsPage() {
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
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <Body className="text-destructive">Failed to load bookings</Body>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H1 className="text-h2-md font-weight-bold text-foreground">Bookings</H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            Manage your venue bookings and reservations
          </Body>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/bookings/templates"
            className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            <Filter className="h-4 w-4" />
            <Text className="text-body-sm">Templates</Text>
          </Link>
          <Link
            href="/bookings/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <Text className="text-body-sm font-weight-medium">New Booking</Text>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <Body className="text-body-md text-muted-foreground">
            {searchQuery || statusFilter ? 'No bookings match your filters' : 'No bookings yet'}
          </Body>
          {!searchQuery && !statusFilter && (
            <Link
              href="/bookings/new"
              className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
            >
              <Plus className="h-4 w-4" />
              Create your first booking
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-background border-2 border-border rounded-card overflow-hidden">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b border-border bg-muted/30">
                <TableHead className="px-4 py-3 text-left text-body-sm font-weight-medium text-muted-foreground">
                  Booking
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-body-sm font-weight-medium text-muted-foreground">
                  Date
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-body-sm font-weight-medium text-muted-foreground">
                  Client
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-body-sm font-weight-medium text-muted-foreground">
                  Guests
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-body-sm font-weight-medium text-muted-foreground">
                  Total
                </TableHead>
                <TableHead className="px-4 py-3 text-left text-body-sm font-weight-medium text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="px-4 py-3 text-right text-body-sm font-weight-medium text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => (
                <TableRow key={booking.id} className="border-b border-border hover:bg-muted/30">
                  <TableCell className="px-4 py-3">
                    <Link
                      href={`/bookings/${booking.id}`}
                      className="block"
                    >
                      <Text className="text-body-sm font-weight-medium text-foreground hover:text-primary">
                        {booking.event_name || 'Untitled'}
                      </Text>
                      <Body className="text-body-xs text-muted-foreground">
                        {booking.booking_number}
                      </Body>
                    </Link>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Body className="text-body-sm text-foreground">
                          {formatDate(booking.event_date)}
                        </Body>
                        {booking.start_time && (
                          <Body className="text-body-xs text-muted-foreground">
                            {booking.start_time} - {booking.end_time}
                          </Body>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-body-sm text-foreground">
                    {booking.client?.name || 'N/A'}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-1 text-body-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {booking.guest_count_expected || 0}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Text className="text-body-sm font-weight-medium text-foreground">
                      {formatCurrency(booking.total || 0)}
                    </Text>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <Text className={`inline-flex px-2 py-1 rounded text-body-xs capitalize ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </Text>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" className="p-2">
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
