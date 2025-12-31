'use client';

/**
 * Edit Event Page
 * Form for editing existing events
 * 
 * Uses normalized EditPage template from @ghxstship/ui
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Calendar, MapPin, Settings, FileText } from 'lucide-react';
import { useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';
import {
  Body, EditPage, Grid, Input, Select, Stack, Text, Textarea, useToast,
  type FormSection} from "@ghxstship/ui";
import { useEvent, useUpdateEvent, useDeleteEvent, type Event } from '@/hooks/useEvents';

const EVENT_TYPES = [
  { value: 'concert', label: 'Concert' },
  { value: 'festival', label: 'Festival' },
  { value: 'corporate', label: 'Corporate Event' },
  { value: 'theater', label: 'Theater' },
  { value: 'sports', label: 'Sports Event' },
  { value: 'conference', label: 'Conference' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'on_sale', label: 'On Sale' },
  { value: 'sold_out', label: 'Sold Out' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'unlisted', label: 'Unlisted' },
];

interface FormData {
  name: string;
  description: string;
  event_type: Event['event_type'];
  category: string;
  venue_name: string;
  venue_address: string;
  venue_city: string;
  venue_state: string;
  venue_country: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  status: Event['status'];
  visibility: Event['visibility'];
  capacity: string;
  tags: string;
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params?.id as string;
  
  const { hasRole } = useAuthContext();
  const toast = useToast();
  
  const { data: event, isLoading, error } = useEvent(eventId);
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();

  const canManageEvents = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    event_type: 'concert',
    category: '',
    venue_name: '',
    venue_address: '',
    venue_city: '',
    venue_state: '',
    venue_country: 'USA',
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    status: 'draft',
    visibility: 'private',
    capacity: '',
    tags: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || '',
        description: event.description || '',
        event_type: event.event_type || 'concert',
        category: event.category || '',
        venue_name: event.venue_name || '',
        venue_address: event.venue_address || '',
        venue_city: event.venue_city || '',
        venue_state: event.venue_state || '',
        venue_country: event.venue_country || 'USA',
        start_date: event.start_date?.split('T')[0] || '',
        end_date: event.end_date?.split('T')[0] || '',
        start_time: event.start_time || '',
        end_time: event.end_time || '',
        status: event.status,
        visibility: event.visibility,
        capacity: event.capacity?.toString() || '',
        tags: event.tags?.join(', ') || '',
      });
    }
  }, [event]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Event name is required';
    }
    if (!formData.start_date) {
      newErrors.start_date = 'Start date is required';
    }
    if (formData.capacity && isNaN(parseInt(formData.capacity))) {
      newErrors.capacity = 'Capacity must be a number';
    }
    if (formData.end_date && formData.start_date && formData.end_date < formData.start_date) {
      newErrors.end_date = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const tags = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      await updateMutation.mutateAsync({
        id: eventId,
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        event_type: formData.event_type,
        category: formData.category.trim() || undefined,
        venue_name: formData.venue_name.trim() || undefined,
        venue_address: formData.venue_address.trim() || undefined,
        venue_city: formData.venue_city.trim() || undefined,
        venue_state: formData.venue_state.trim() || undefined,
        venue_country: formData.venue_country.trim() || undefined,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        start_time: formData.start_time || undefined,
        end_time: formData.end_time || undefined,
        status: formData.status,
        visibility: formData.visibility,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        tags: tags.length > 0 ? tags : undefined,
      });

      toast.success('Event Updated', `${formData.name} has been updated.`);

      router.push(`/events/${eventId}`);
    } catch (err) {
      toast.error('Failed to Update Event', err instanceof Error ? err.message : 'An error occurred',);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await deleteMutation.mutateAsync(eventId);

      toast.success('Event Deleted', `${event?.name} has been removed.`);

      router.push('/events');
    } catch (err) {
      toast.error('Failed to Delete Event', err instanceof Error ? err.message : 'An error occurred',);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      if (prev[field]) {
        return { ...prev, [field]: undefined };
      }
      return prev;
    });
  }, []);

  // Form sections for EditPage template
  const sections: FormSection[] = useMemo(() => [
    {
      id: 'details',
      title: 'Event Details',
      icon: <Calendar className="h-5 w-5" />,
      content: (
        <Stack gap={4}>
          <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
            <Stack gap={2} className="md:col-span-2">
              <Text className="font-weight-medium text-body-sm">Event Name *</Text>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter event name"
                className={errors.name ? 'border-error' : ''}
              />
              {errors.name && (
                <Body size="xs" className="text-error">{errors.name}</Body>
              )}
            </Stack>

            <Stack gap={2}>
              <Text className="font-weight-medium text-body-sm">Event Type</Text>
              <Select
                id="event_type"
                value={formData.event_type}
                onChange={(e) => handleChange('event_type', e.target.value)}
              >
                {EVENT_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </Stack>

            <Stack gap={2}>
              <Text className="font-weight-medium text-body-sm">Category</Text>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                placeholder="e.g., Rock, Jazz, EDM"
              />
            </Stack>
          </Grid>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Description</Text>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the event..."
              rows={4}
            />
          </Stack>
        </Stack>
      ),
    },
    {
      id: 'datetime',
      title: 'Date & Time',
      icon: <FileText className="h-5 w-5" />,
      content: (
        <Grid cols={4} gap={4} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Start Date *</Text>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => handleChange('start_date', e.target.value)}
              className={errors.start_date ? 'border-error' : ''}
            />
            {errors.start_date && (
              <Body size="xs" className="text-error">{errors.start_date}</Body>
            )}
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Start Time</Text>
            <Input
              id="start_time"
              type="time"
              value={formData.start_time}
              onChange={(e) => handleChange('start_time', e.target.value)}
            />
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">End Date</Text>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => handleChange('end_date', e.target.value)}
              className={errors.end_date ? 'border-error' : ''}
            />
            {errors.end_date && (
              <Body size="xs" className="text-error">{errors.end_date}</Body>
            )}
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">End Time</Text>
            <Input
              id="end_time"
              type="time"
              value={formData.end_time}
              onChange={(e) => handleChange('end_time', e.target.value)}
            />
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'venue',
      title: 'Venue',
      icon: <MapPin className="h-5 w-5" />,
      content: (
        <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
          <Stack gap={2} className="md:col-span-2">
            <Text className="font-weight-medium text-body-sm">Venue Name</Text>
            <Input
              id="venue_name"
              value={formData.venue_name}
              onChange={(e) => handleChange('venue_name', e.target.value)}
              placeholder="e.g., Madison Square Garden"
            />
          </Stack>

          <Stack gap={2} className="md:col-span-2">
            <Text className="font-weight-medium text-body-sm">Address</Text>
            <Input
              id="venue_address"
              value={formData.venue_address}
              onChange={(e) => handleChange('venue_address', e.target.value)}
              placeholder="Street address"
            />
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">City</Text>
            <Input
              id="venue_city"
              value={formData.venue_city}
              onChange={(e) => handleChange('venue_city', e.target.value)}
              placeholder="City"
            />
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">State / Province</Text>
            <Input
              id="venue_state"
              value={formData.venue_state}
              onChange={(e) => handleChange('venue_state', e.target.value)}
              placeholder="State"
            />
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Country</Text>
            <Input
              id="venue_country"
              value={formData.venue_country}
              onChange={(e) => handleChange('venue_country', e.target.value)}
              placeholder="Country"
            />
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Capacity</Text>
            <Input
              id="capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => handleChange('capacity', e.target.value)}
              placeholder="e.g., 5000"
              className={errors.capacity ? 'border-error' : ''}
            />
            {errors.capacity && (
              <Body size="xs" className="text-error">{errors.capacity}</Body>
            )}
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: <Settings className="h-5 w-5" />,
      content: (
        <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Status</Text>
            <Select
              id="status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Stack>

          <Stack gap={2}>
            <Text className="font-weight-medium text-body-sm">Visibility</Text>
            <Select
              id="visibility"
              value={formData.visibility}
              onChange={(e) => handleChange('visibility', e.target.value)}
            >
              {VISIBILITY_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Stack>

          <Stack gap={2} className="md:col-span-2">
            <Text className="font-weight-medium text-body-sm">Tags</Text>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              placeholder="Enter tags separated by commas (e.g., Featured, VIP, Outdoor)"
            />
            <Body size="xs" className="text-muted-foreground">
              Separate multiple tags with commas
            </Body>
          </Stack>
        </Grid>
      ),
    },
  ], [formData, errors, handleChange]);

  // EditPage handles loading, not found, and access denied states
  return (
    <EditPage
      title={event ? `Edit ${event.name}` : 'Edit Event'}
      subtitle="Update event information"
      breadcrumbs={event ? [
        { label: 'Events', href: '/events' },
        { label: event.name, href: `/events/${eventId}` },
        { label: 'Edit' },
      ] : undefined}
      backHref={event ? `/events/${eventId}` : '/events'}
      backLabel="Back to Event"
      sections={sections}
      onSubmit={handleSubmit}
      submitLabel="Save Changes"
      isSubmitting={isSubmitting}
      isValid={true}
      isLoading={isLoading}
      notFound={!isLoading && (error || !event) ? {
        title: 'Event Not Found',
        description: "The event you're trying to edit doesn't exist or has been removed.",
        action: { label: 'Back to Events', onClick: () => router.push('/events') },
      } : undefined}
      accessDenied={!canManageEvents ? {
        title: 'Permission Required',
        description: 'You do not have permission to edit events.',
        action: { label: 'Back to Events', onClick: () => router.push('/events') },
      } : undefined}
      onDelete={handleDelete}
      isDeleting={isDeleting}
      deleteConfirmMessage="This action cannot be undone. This will permanently delete the event and all associated tickets, bookings, and history."
    />
  );
}
