'use client';

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
          <p className="text-destructive">Booking not found</p>
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
              <h1 className="text-h2-md font-weight-bold text-foreground">
                {booking.event_name || 'Untitled Booking'}
              </h1>
              <span className={`px-3 py-1 rounded-avatar text-body-xs font-weight-medium border capitalize ${getStatusColor(booking.status)}`}>
                {booking.status}
              </span>
            </div>
            <p className="text-body-sm text-muted-foreground mt-1">
              {booking.booking_number}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleClone}
            disabled={cloneBooking.isPending}
            className="flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Copy className="h-4 w-4" />
            <span className="text-body-sm">Clone</span>
          </button>
          <Link
            href={`/bookings/${bookingId}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            <span className="text-body-sm font-weight-medium">Edit</span>
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-destructive text-destructive rounded-button hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Event Details</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-body-xs text-muted-foreground">Event Date</p>
                  <p className="text-body-md font-weight-medium text-foreground">
                    {formatDate(booking.event_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-body-xs text-muted-foreground">Time</p>
                  <p className="text-body-md font-weight-medium text-foreground">
                    {booking.start_time || 'TBD'} - {booking.end_time || 'TBD'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-body-xs text-muted-foreground">Guest Count</p>
                  <p className="text-body-md font-weight-medium text-foreground">
                    {booking.guest_count_expected || 0} expected
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-body-xs text-muted-foreground">Venue</p>
                  <p className="text-body-md font-weight-medium text-foreground">
                    {booking.venue?.name || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {booking.client && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Client Information</h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-body-xs text-muted-foreground">Client</p>
                    <p className="text-body-md font-weight-medium text-foreground">
                      {booking.client.name}
                    </p>
                  </div>
                </div>
                {booking.client.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-body-xs text-muted-foreground">Email</p>
                      <a
                        href={`mailto:${booking.client.email}`}
                        className="text-body-md text-primary hover:underline"
                      >
                        {booking.client.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {booking.line_items && booking.line_items.length > 0 && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Line Items</h2>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 text-left text-body-sm font-weight-medium text-muted-foreground">
                      Description
                    </th>
                    <th className="py-2 text-right text-body-sm font-weight-medium text-muted-foreground">
                      Qty
                    </th>
                    <th className="py-2 text-right text-body-sm font-weight-medium text-muted-foreground">
                      Price
                    </th>
                    <th className="py-2 text-right text-body-sm font-weight-medium text-muted-foreground">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {booking.line_items.map((item: { id: string; description: string; quantity: number; unit_price: number; total: number }) => (
                    <tr key={item.id} className="border-b border-border">
                      <td className="py-3 text-body-sm text-foreground">{item.description}</td>
                      <td className="py-3 text-body-sm text-foreground text-right">{item.quantity}</td>
                      <td className="py-3 text-body-sm text-foreground text-right">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="py-3 text-body-sm font-weight-medium text-foreground text-right">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Financial Summary</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-muted-foreground">Subtotal</span>
                <span className="text-body-sm text-foreground">
                  {formatCurrency(booking.subtotal || 0)}
                </span>
              </div>
              {booking.discount_amount > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-body-sm text-muted-foreground">Discount</span>
                  <span className="text-body-sm text-success">
                    -{formatCurrency(booking.discount_amount)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-muted-foreground">Tax</span>
                <span className="text-body-sm text-foreground">
                  {formatCurrency(booking.tax_amount || 0)}
                </span>
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-body-md font-weight-semibold text-foreground">Total</span>
                <span className="text-h4-md font-weight-bold text-foreground">
                  {formatCurrency(booking.total || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href={`/proposals/new?booking=${bookingId}`}
                className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-muted rounded-button transition-colors"
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-body-sm">Create Proposal</span>
              </Link>
              <Link
                href={`/contracts/new?booking=${bookingId}`}
                className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-muted rounded-button transition-colors"
              >
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-body-sm">Create Contract</span>
              </Link>
              <Link
                href={`/invoices/new?booking=${bookingId}`}
                className="flex items-center gap-2 px-4 py-2 w-full text-left hover:bg-muted rounded-button transition-colors"
              >
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-body-sm">Create Invoice</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-md w-full mx-4">
            <h3 className="text-h4-md font-weight-semibold text-foreground mb-2">Cancel Booking</h3>
            <p className="text-body-sm text-muted-foreground mb-4">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteBooking.isPending}
                className="px-4 py-2 bg-destructive text-white rounded-button hover:bg-destructive/90 transition-colors disabled:opacity-50"
              >
                {deleteBooking.isPending ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
