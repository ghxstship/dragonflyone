'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  H2,
  Body,
  Button,
  Card,
  Field,
  Input,
  Textarea,
  Select,
  Grid,
  Stack,
  Alert,
  Form,
  Kicker,
  Badge,
  Spinner,
} from '@ghxstship/ui';
import { Save, ArrowLeft, Trash2, Eye, EyeOff } from 'lucide-react';
import { useEvent, useUpdateEvent, useDeleteEvent, usePublishEvent } from '@/hooks/useEvents';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const { data: event, isLoading, error } = useEvent(eventId);
  const updateMutation = useUpdateEvent();
  const deleteMutation = useDeleteEvent();
  const publishMutation = usePublishEvent();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    venue: '',
    category: 'concert',
    start_date: '',
    end_date: '',
    capacity: '',
    price: '',
    status: 'draft' as 'draft' | 'published' | 'cancelled' | 'completed',
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (event) {
      setFormData({
        name: event.name || '',
        description: event.description || '',
        venue: event.venue || '',
        category: event.category || 'concert',
        start_date: event.start_date ? event.start_date.split('T')[0] : '',
        end_date: event.end_date ? event.end_date.split('T')[0] : '',
        capacity: event.capacity?.toString() || '',
        price: event.price?.toString() || '',
        status: event.status || 'draft',
      });
    }
  }, [event]);

  const handleSubmit = async () => {
    setLocalError(null);
    setSuccessMessage(null);

    try {
      await updateMutation.mutateAsync({
        id: eventId,
        name: formData.name,
        description: formData.description,
        venue: formData.venue,
        category: formData.category,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        capacity: parseInt(formData.capacity) || 0,
        price: parseFloat(formData.price) || 0,
      });
      setSuccessMessage('Event updated successfully!');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to update event');
    }
  };

  const handlePublish = async () => {
    try {
      await publishMutation.mutateAsync(eventId);
      setSuccessMessage('Event published successfully!');
      setFormData(prev => ({ ...prev, status: 'published' }));
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to publish event');
    }
  };

  const handleUnpublish = async () => {
    try {
      await updateMutation.mutateAsync({ id: eventId, status: 'draft' });
      setSuccessMessage('Event unpublished');
      setFormData(prev => ({ ...prev, status: 'draft' }));
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to unpublish event');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteMutation.mutateAsync(eventId);
      router.push('/events');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Failed to delete event');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <Body className="text-muted">Loading event...</Body>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error">
        <Body>Failed to load event: {error instanceof Error ? error.message : 'Unknown error'}</Body>
      </Alert>
    );
  }

  if (!event) {
    return (
      <Alert variant="error">
        <Body>Event not found</Body>
      </Alert>
    );
  }

  const displayError = localError;
  const isSaving = updateMutation.isPending || deleteMutation.isPending || publishMutation.isPending;

  return (
    <Stack gap={10}>
      <Stack gap={2}>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <Kicker colorScheme="on-dark">Event Management</Kicker>
            <H2 size="lg" className="text-white">Edit Event</H2>
            <Body className="text-on-dark-muted">Update event details and settings</Body>
          </div>
          <Badge variant={formData.status === 'published' ? 'success' : 'info'}>
            {formData.status.toUpperCase()}
          </Badge>
        </div>
      </Stack>

      {displayError && (
        <Alert variant="error" className="mb-6">
          {displayError}
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" className="mb-6">
          {successMessage}
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Grid cols={2} className="mb-8">
          <Card className="p-6 col-span-2">
            <H2 className="mb-6">EVENT DETAILS</H2>

            <Stack gap={6}>
              <Field label="Event Name" required>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Summer Music Festival 2024"
                  required
                />
              </Field>

              <Field label="Description" required>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your event..."
                  rows={4}
                  required
                />
              </Field>

              <Grid cols={2}>
                <Field label="Category" required>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="concert">Concert</option>
                    <option value="festival">Festival</option>
                    <option value="conference">Conference</option>
                    <option value="theater">Theater</option>
                    <option value="sports">Sports</option>
                    <option value="nightlife">Nightlife</option>
                  </Select>
                </Field>

                <Field label="Venue" required>
                  <Input
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="The Arena"
                    required
                  />
                </Field>
              </Grid>

              <Grid cols={2}>
                <Field label="Start Date" required>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </Field>

                <Field label="End Date">
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </Field>
              </Grid>
            </Stack>
          </Card>

          <Card className="p-6 col-span-2">
            <H2 className="mb-6">TICKETING</H2>

            <Stack gap={6}>
              <Grid cols={2}>
                <Field label="Capacity" required>
                  <Input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="5000"
                    required
                  />
                </Field>

                <Field label="Base Ticket Price">
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="50"
                  />
                </Field>
              </Grid>
            </Stack>
          </Card>
        </Grid>

        <div className="flex items-center justify-between">
          <Stack direction="horizontal" gap={4}>
            <Button type="submit" variant="solid" disabled={isSaving}>
              {updateMutation.isPending ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>

            {formData.status === 'draft' ? (
              <Button
                type="button"
                variant="outline"
                onClick={handlePublish}
                disabled={isSaving}
              >
                <Eye className="w-4 h-4 mr-2" />
                Publish Event
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleUnpublish}
                disabled={isSaving}
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Unpublish
              </Button>
            )}
          </Stack>

          <Button
            type="button"
            variant="outline"
            className="text-destructive border-destructive hover:bg-destructive/10"
            onClick={handleDelete}
            disabled={isSaving}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Event
          </Button>
        </div>
      </Form>
    </Stack>
  );
}
