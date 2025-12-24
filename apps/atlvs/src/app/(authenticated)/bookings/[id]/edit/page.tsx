'use client';

import {
  Body,
  Button,
  Form,
  H1,
  H2,
  Input,
  Label,
  Select,
  Textarea,
} from '@ghxstship/ui';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Calendar, Clock, FileText } from 'lucide-react';
import { useBooking, useUpdateBooking } from '@/hooks/useBookings';

export default function EditBookingPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = (params?.id as string) || '';

  const { data: bookingData, isLoading } = useBooking(bookingId);
  const updateBooking = useUpdateBooking();

  const booking = bookingData;

  const [formData, setFormData] = useState({
    event_name: '',
    event_date: '',
    start_time: '',
    end_time: '',
    guest_count_expected: '',
    event_type: '',
    special_requests: '',
    status: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (booking) {
      setFormData({
        event_name: booking.event_name || '',
        event_date: booking.event_date?.split('T')[0] || '',
        start_time: booking.start_time || '',
        end_time: booking.end_time || '',
        guest_count_expected: String(booking.guest_count_expected || ''),
        event_type: booking.event_type || '',
        special_requests: booking.special_requests || '',
        status: booking.status || 'draft',
      });
    }
  }, [booking]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.event_name.trim()) {
      newErrors.event_name = 'Event name is required';
    }
    if (!formData.event_date) {
      newErrors.event_date = 'Event date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await updateBooking.mutateAsync({
        id: bookingId,
        event_name: formData.event_name,
        event_date: formData.event_date,
        start_time: formData.start_time || undefined,
        end_time: formData.end_time || undefined,
        guest_count_expected: formData.guest_count_expected ? parseInt(formData.guest_count_expected) : undefined,
        event_type: formData.event_type || undefined,
        special_requests: formData.special_requests || undefined,
        status: formData.status as 'draft' | 'pending' | 'confirmed' | 'completed' | 'cancelled',
      });
      router.push(`/bookings/${bookingId}`);
    } catch (error) {
      setErrors({ submit: 'Failed to update booking' });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading booking...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/bookings/${bookingId}`}
          className="p-2 hover:bg-muted rounded-button transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <H1 className="text-h2-md font-weight-bold text-foreground">Edit Booking</H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            {booking?.booking_number}
          </Body>
        </div>
      </div>

      <Form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-background border-2 border-border rounded-card p-6">
          <H2 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Event Details
          </H2>
          <div className="space-y-4">
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Event Name *
              </Label>
              <Input
                type="text"
                name="event_name"
                value={formData.event_name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border-2 rounded-button focus:outline-none focus:border-primary ${
                  errors.event_name ? 'border-destructive' : 'border-border'
                }`}
              />
              {errors.event_name && (
                <Body className="text-body-xs text-destructive mt-1">{errors.event_name}</Body>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Event Date *
                </Label>
                <Input
                  type="date"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border-2 rounded-button focus:outline-none focus:border-primary ${
                    errors.event_date ? 'border-destructive' : 'border-border'
                  }`}
                />
                {errors.event_date && (
                  <Body className="text-body-xs text-destructive mt-1">{errors.event_date}</Body>
                )}
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Event Type
                </Label>
                <Select
                  name="event_type"
                  value={formData.event_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                >
                  <option value="">Select type...</option>
                  <option value="wedding">Wedding</option>
                  <option value="corporate">Corporate Event</option>
                  <option value="social">Social Gathering</option>
                  <option value="conference">Conference</option>
                  <option value="gala">Gala</option>
                  <option value="other">Other</option>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <H2 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time & Capacity
          </H2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Start Time
              </Label>
              <Input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                End Time
              </Label>
              <Input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Expected Guests
              </Label>
              <Input
                type="number"
                name="guest_count_expected"
                value={formData.guest_count_expected}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>

        <div className="bg-background border-2 border-border rounded-card p-6">
          <H2 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Status & Notes
          </H2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Status
              </Label>
              <Select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
              >
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
          </div>
          <div className="mt-4">
            <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
              Special Requests
            </Label>
            <Textarea
              name="special_requests"
              value={formData.special_requests}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        {errors.submit && (
          <div className="p-4 bg-destructive/10 border-2 border-destructive rounded-card">
            <Body className="text-body-sm text-destructive">{errors.submit}</Body>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Link
            href={`/bookings/${bookingId}`}
            className="px-6 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            disabled={updateBooking.isPending}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {updateBooking.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Form>
    </div>
  );
}
