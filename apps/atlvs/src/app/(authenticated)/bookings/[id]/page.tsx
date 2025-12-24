'use client';

import {
  Body,
  Button,
  H1,
  H2,
  H3,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, Copy, Trash2, Calendar, Users, DollarSign, Clock, MapPin, User, Mail, FileText } from 'lucide-react';
import { useBooking, useCloneBooking, useDeleteBooking } from '@/hooks/useBookings';
import { useState } from 'react';

export default function BookingDetailPage() {
  const params = useParams();
  const bookingId = params.id as string;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data, isLoading, error } = useBooking(bookingId);
  const cloneBooking = useCloneBooking();
  const deleteBooking = useDeleteBooking();

  const booking = data?.booking;

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success-100 text-success-800 border-success-200';
      case 'pending':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'draft':
        return 'bg-ink-100 text-ink-800 border-ink-200';
      case 'completed':
        return 'bg-info-100 text-info-800 border-info-200';
      case 'cancelled':
        return 'bg-error-100 text-error-800 border-error-200';
      default:
        return 'bg-ink-100 text-ink-800 border-ink-200';
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
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading booking...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <Body className="text-destructive">Booking not found</Body>
          <Link href="/bookings" className="text-primary hover:underline mt-2 inline-block">
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/bookings"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <H1 className="text-h2-md font-weight-bold text-foreground">
                {booking.event_name || 'Untitled Booking'}
              </H1>
              <Text className={`px-3 py-1 rounded-avatar text-body-xs font-weight-medium border capitalize ${getStatusColor(booking.status)}`}>
                {booking.status}
              </Text>
            </div>
            <Body className="text-body-sm text-muted-foreground mt-1">
              {booking.booking_number}
            </Body>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleClone}
            disabled={cloneBooking.isPending}
            className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Copy className="h-4 w-4" />
            <Text className="text-body-sm">Clone</Text>
          </Button>
          <Link
            href={`/bookings/${bookingId}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            <Text className="text-body-sm font-weight-medium">Edit</Text>
          </Link>
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-destructive text-destructive rounded-button hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Event Details</H2>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <Body className="text-body-xs text-muted-foreground">Event Date</Body>
                  <Body className="text-body-md font-weight-medium text-foreground">
                    {formatDate(booking.event_date)}
                  </Body>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <Body className="text-body-xs text-muted-foreground">Time</Body>
                  <Body className="text-body-md font-weight-medium text-foreground">
                    {booking.start_time || 'TBD'} - {booking.end_time || 'TBD'}
                  </Body>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <Body className="text-body-xs text-muted-foreground">Guest Count</Body>
                  <Body className="text-body-md font-weight-medium text-foreground">
                    {booking.guest_count_expected || 0} expected
                  </Body>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <Body className="text-body-xs text-muted-foreground">Venue</Body>
                  <Body className="text-body-md font-weight-medium text-foreground">
                    {booking.venue?.name || 'Not specified'}
                  </Body>
                </div>
              </div>
            </div>
          </div>

          {booking.client && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Client Information</H2>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <Body className="text-body-xs text-muted-foreground">Client</Body>
                    <Body className="text-body-md font-weight-medium text-foreground">
                      {booking.client.name}
                    </Body>
                  </div>
                </div>
                {booking.client.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <Body className="text-body-xs text-muted-foreground">Email</Body>
                      <Link
                        href={`mailto:${booking.client.email}`}
                        className="text-body-md text-primary hover:underline"
                      >
                        {booking.client.email}
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {booking.line_items && booking.line_items.length > 0 && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Line Items</H2>
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-b border-border">
                    <TableHead className="py-2 text-left text-body-sm font-weight-medium text-muted-foreground">
                      Description
                    </TableHead>
                    <TableHead className="py-2 text-right text-body-sm font-weight-medium text-muted-foreground">
                      Qty
                    </TableHead>
                    <TableHead className="py-2 text-right text-body-sm font-weight-medium text-muted-foreground">
                      Price
                    </TableHead>
                    <TableHead className="py-2 text-right text-body-sm font-weight-medium text-muted-foreground">
                      Total
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {booking.line_items.map((item: { id: string; description: string; quantity: number; unit_price: number; total: number }) => (
                    <TableRow key={item.id} className="border-b border-border">
                      <TableCell className="py-3 text-body-sm text-foreground">{item.description}</TableCell>
                      <TableCell className="py-3 text-body-sm text-foreground text-right">{item.quantity}</TableCell>
                      <TableCell className="py-3 text-body-sm text-foreground text-right">
                        {formatCurrency(item.unit_price)}
                      </TableCell>
                      <TableCell className="py-3 text-body-sm font-weight-medium text-foreground text-right">
                        {formatCurrency(item.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Financial Summary</H2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Text className="text-body-sm text-muted-foreground">Subtotal</Text>
                <Text className="text-body-sm text-foreground">
                  {formatCurrency(booking.subtotal || 0)}
                </Text>
              </div>
              {booking.discount_amount > 0 && (
                <div className="flex items-center justify-between">
                  <Text className="text-body-sm text-muted-foreground">Discount</Text>
                  <Text className="text-body-sm text-success">
                    -{formatCurrency(booking.discount_amount)}
                  </Text>
                </div>
              )}
              <div className="flex items-center justify-between">
                <Text className="text-body-sm text-muted-foreground">Tax</Text>
                <Text className="text-body-sm text-foreground">
                  {formatCurrency(booking.tax_amount || 0)}
                </Text>
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <Text className="text-body-md font-weight-semibold text-foreground">Total</Text>
                <Text className="text-h4-md font-weight-bold text-foreground">
                  {formatCurrency(booking.total || 0)}
                </Text>
              </div>
            </div>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Quick Actions</H2>
            <div className="space-y-2">
              <Link
                href={`/proposals/new?booking=${bookingId}`}
                className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-muted rounded-button transition-colors"
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <Text className="text-body-sm">Create Proposal</Text>
              </Link>
              <Link
                href={`/contracts/new?booking=${bookingId}`}
                className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-muted rounded-button transition-colors"
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <Text className="text-body-sm">Create Contract</Text>
              </Link>
              <Link
                href={`/invoices/new?booking=${bookingId}`}
                className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-muted rounded-button transition-colors"
              >
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Text className="text-body-sm">Create Invoice</Text>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-md w-full mx-4">
            <H3 className="text-h4-md font-weight-semibold text-foreground mb-2">Cancel Booking</H3>
            <Body className="text-body-sm text-muted-foreground mb-4">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </Body>
            <div className="flex items-center justify-end gap-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
              >
                Keep Booking
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleteBooking.isPending}
                className="px-4 py-2 bg-destructive text-white rounded-button hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {deleteBooking.isPending ? 'Cancelling...' : 'Cancel Booking'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
