'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ConsumerNavigationPublic } from '../../../components/navigation';
import {
  Container,
  Section,
  H1,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Grid,
  Stack,
  Badge,
  Alert,
  LoadingSpinner,
  Figure,
} from '@ghxstship/ui';
import Image from 'next/image';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  category: string;
  price_min: number;
  price_max: number;
  capacity: number;
  tickets_available: number;
  image?: string;
  description?: string;
  amenities?: string[];
  age_restriction?: string;
  parking_available?: boolean;
  accessibility?: boolean;
}

function CompareEventsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventIds = useMemo(() => searchParams.get('ids')?.split(',') || [], [searchParams]);

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (eventIds.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const eventPromises = eventIds.map(id =>
        fetch(`/api/events/${id}`).then(res => res.json())
      );
      const results = await Promise.all(eventPromises);
      setEvents(results.map(r => r.event).filter(Boolean));
    } catch (err) {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [eventIds]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleRemoveEvent = (eventId: string) => {
    const newIds = eventIds.filter(id => id !== eventId);
    if (newIds.length > 0) {
      router.push(`/events/compare?ids=${newIds.join(',')}`);
    } else {
      router.push('/browse');
    }
  };

  const handleViewEvent = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handleBuyTickets = (eventId: string) => {
    router.push(`/events/${eventId}/tickets`);
  };

  const getAvailabilityStatus = (event: Event) => {
    const percentage = (event.tickets_available / event.capacity) * 100;
    if (percentage === 0) return { label: 'Sold Out', color: 'bg-error-500' };
    if (percentage < 10) return { label: 'Almost Gone', color: 'bg-warning-500' };
    if (percentage < 30) return { label: 'Selling Fast', color: 'bg-warning-500' };
    return { label: 'Available', color: 'bg-success-500' };
  };

  if (loading) {
    return (
      <Section className="min-h-screen bg-white">
        <ConsumerNavigationPublic />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading events..." />
        </Container>
      </Section>
    );
  }

  if (events.length === 0) {
    return (
      <Section className="min-h-screen bg-white">
        <ConsumerNavigationPublic />
        <Container className="py-16">
          <Card className="p-12 text-center">
            <H1 className="mb-4">No Events to Compare</H1>
            <Body className="text-grey-600 mb-6">
              Add events to compare by clicking the compare button on event pages.
            </Body>
            <Button variant="solid" onClick={() => router.push('/browse')}>
              Browse Events
            </Button>
          </Card>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <ConsumerNavigationPublic />
      <Container className="py-16">
        <Stack gap={8}>
        <Stack direction="horizontal" className="flex-col md:flex-row md:items-center md:justify-between border-b-2 border-black pb-8">
          <Stack gap={2}>
            <H1>Compare Events</H1>
            <Body className="text-grey-600">
              Comparing {events.length} events
            </Body>
          </Stack>
          <Button variant="outline" onClick={() => router.push('/browse')}>
            Add More Events
          </Button>
        </Stack>

        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        <Stack className="overflow-x-auto">
          <Grid cols={events.length as 1 | 2 | 3 | 4} gap={4} className="min-w-max">
            {events.map(event => (
              <Card key={event.id} className="min-w-[300px]">
                {event.image && (
                  <Figure className="relative h-48 bg-grey-100 overflow-hidden">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  </Figure>
                )}
                <Stack className="p-4" gap={4}>
                  <Stack direction="horizontal" className="justify-between items-start">
                    <H3 className="flex-1">{event.title}</H3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveEvent(event.id)}
                    >
                      Remove
                    </Button>
                  </Stack>
                  <Badge>{event.category}</Badge>
                </Stack>
              </Card>
            ))}
          </Grid>

          <Card className="mt-4 p-4">
            <Stack gap={0}>
              <Stack direction="horizontal" className="border-b-2 border-black py-3">
                <Body className="w-40 font-bold">Date & Time</Body>
                {events.map(event => (
                  <Stack key={event.id} className="flex-1 px-2">
                    <Body>{event.date}</Body>
                    <Body className="text-grey-500 text-sm">{event.time}</Body>
                  </Stack>
                ))}
              </Stack>

              <Stack direction="horizontal" className="border-b border-grey-200 py-3">
                <Body className="w-40 font-bold">Venue</Body>
                {events.map(event => (
                  <Stack key={event.id} className="flex-1 px-2">
                    <Body>{event.venue}</Body>
                    <Body className="text-grey-500 text-sm">{event.city}</Body>
                  </Stack>
                ))}
              </Stack>

              <Stack direction="horizontal" className="border-b border-grey-200 py-3">
                <Body className="w-40 font-bold">Price Range</Body>
                {events.map(event => (
                  <Stack key={event.id} className="flex-1 px-2">
                    <Body className="font-bold">
                      ${event.price_min} - ${event.price_max}
                    </Body>
                  </Stack>
                ))}
              </Stack>

              <Stack direction="horizontal" className="border-b border-grey-200 py-3">
                <Body className="w-40 font-bold">Availability</Body>
                {events.map(event => {
                  const status = getAvailabilityStatus(event);
                  return (
                    <Stack key={event.id} className="flex-1 px-2">
                      <Badge className={`${status.color} text-white`}>
                        {status.label}
                      </Badge>
                      <Body className="text-sm text-grey-500 mt-1">
                        {event.tickets_available} / {event.capacity}
                      </Body>
                    </Stack>
                  );
                })}
              </Stack>

              <Stack direction="horizontal" className="border-b border-grey-200 py-3">
                <Body className="w-40 font-bold">Age Restriction</Body>
                {events.map(event => (
                  <Stack key={event.id} className="flex-1 px-2">
                    <Body>{event.age_restriction || 'All Ages'}</Body>
                  </Stack>
                ))}
              </Stack>

              <Stack direction="horizontal" className="border-b border-grey-200 py-3">
                <Body className="w-40 font-bold">Parking</Body>
                {events.map(event => (
                  <Stack key={event.id} className="flex-1 px-2">
                    <Body>{event.parking_available ? 'Available' : 'Not Available'}</Body>
                  </Stack>
                ))}
              </Stack>

              <Stack direction="horizontal" className="border-b border-grey-200 py-3">
                <Body className="w-40 font-bold">Accessibility</Body>
                {events.map(event => (
                  <Stack key={event.id} className="flex-1 px-2">
                    <Body>{event.accessibility ? 'ADA Accessible' : 'Contact Venue'}</Body>
                  </Stack>
                ))}
              </Stack>

              <Stack direction="horizontal" className="py-4">
                <Body className="w-40 font-bold">Actions</Body>
                {events.map(event => (
                  <Stack key={event.id} className="flex-1 px-2" gap={2}>
                    <Button
                      variant="solid"
                      className="w-full"
                      onClick={() => handleBuyTickets(event.id)}
                    >
                      Buy Tickets
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleViewEvent(event.id)}
                    >
                      View Details
                    </Button>
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </Card>
        </Stack>
        </Stack>
      </Container>
    </Section>
  );
}

export default function CompareEventsPage() {
  return (
    <Suspense fallback={
      <Section className="min-h-screen bg-white">
        <ConsumerNavigationPublic />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading..." />
        </Container>
      </Section>
    }>
      <CompareEventsContent />
    </Suspense>
  );
}
