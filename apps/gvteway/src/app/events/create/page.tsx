'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../../components/navigation';
import {
  Container,
  Section,
  H1,
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
  Spinner,
  Form,
} from '@ghxstship/ui';

export default function CreateEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    eventType: 'concert',
    date: '',
    time: '',
    capacity: '',
    ticketPrice: '',
    vipPrice: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create event');
      }

      const event = await response.json();
      router.push(`/events/${event.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Section className="min-h-screen bg-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
        <Stack gap={2} className="border-b-2 border-black pb-8">
          <H1>Create Event</H1>
          <Body className="text-grey-600">Set up your new event</Body>
        </Stack>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Grid cols={2} className="mb-8">
            <Card className="p-6 col-span-2">
              <H2 className="mb-6">EVENT DETAILS</H2>
              
              <Stack gap={6}>
                <Field label="Event Title" required>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                  <Field label="Event Type" required>
                    <Select
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
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
                  <Field label="Date" required>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </Field>

                  <Field label="Time" required>
                    <Input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </Field>
                </Grid>
              </Stack>
            </Card>

            <Card className="p-6 col-span-2">
              <H2 className="mb-6">TICKETING</H2>
              
              <Stack gap={6}>
                <Field label="Capacity" required>
                  <Input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="5000"
                    required
                  />
                </Field>

                <Grid cols={2}>
                  <Field label="GA Ticket Price" required>
                    <Input
                      type="number"
                      value={formData.ticketPrice}
                      onChange={(e) => setFormData({ ...formData, ticketPrice: e.target.value })}
                      placeholder="50"
                      required
                    />
                  </Field>

                  <Field label="VIP Ticket Price">
                    <Input
                      type="number"
                      value={formData.vipPrice}
                      onChange={(e) => setFormData({ ...formData, vipPrice: e.target.value })}
                      placeholder="150"
                    />
                  </Field>
                </Grid>
              </Stack>
            </Card>
          </Grid>

          <Stack direction="horizontal" gap={4}>
            <Button type="submit" variant="solid" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Creating...
                </>
              ) : (
                'Create Event'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </Stack>
        </Form>
        </Stack>
      </Container>
    </Section>
  );
}
