'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ConsumerNavigationPublic } from '../../components/navigation';
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
  Select,
  Grid,
  Stack,
  Badge,
  LoadingSpinner,
  ProjectCard,
} from '@ghxstship/ui';

interface Event {
  id: string;
  title: string;
  date: string;
  venue: string;
  category: string;
  price: number;
  image?: string;
  announced_at: string;
  on_sale_date?: string;
  presale_date?: string;
}

export default function NewEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('7d');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchNewEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        new: 'true',
        timeframe: timeFilter,
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
      });
      
      const response = await fetch(`/api/events?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error('Failed to fetch new events');
    } finally {
      setLoading(false);
    }
  }, [timeFilter, categoryFilter]);

  useEffect(() => {
    fetchNewEvents();
  }, [fetchNewEvents]);

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const getTimeSinceAnnounced = (announcedAt: string) => {
    const now = new Date();
    const announced = new Date(announcedAt);
    const diffMs = now.getTime() - announced.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just announced';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const justAnnouncedEvents = events.filter(e => {
    const hours = (new Date().getTime() - new Date(e.announced_at).getTime()) / (1000 * 60 * 60);
    return hours < 24;
  });

  const thisWeekEvents = events.filter(e => {
    const hours = (new Date().getTime() - new Date(e.announced_at).getTime()) / (1000 * 60 * 60);
    return hours >= 24 && hours < 168;
  });

  const olderEvents = events.filter(e => {
    const hours = (new Date().getTime() - new Date(e.announced_at).getTime()) / (1000 * 60 * 60);
    return hours >= 168;
  });

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

  return (
    <Section className="min-h-screen bg-white">
      <ConsumerNavigationPublic />
      <Container className="py-16">
        <Stack gap={8}>
        <Stack direction="horizontal" className="flex-col md:flex-row md:items-center md:justify-between border-b-2 border-black pb-8">
          <Stack gap={2}>
            <H1>New & Announced</H1>
            <Body className="text-grey-600">
              Be the first to know about upcoming events
            </Body>
          </Stack>
            <Stack direction="horizontal" gap={4}>
              <Select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </Select>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="concert">Concerts</option>
                <option value="festival">Festivals</option>
                <option value="theater">Theater</option>
                <option value="sports">Sports</option>
                <option value="comedy">Comedy</option>
              </Select>
            </Stack>
        </Stack>

        {justAnnouncedEvents.length > 0 && (
          <Section className="mb-12">
            <Stack direction="horizontal" gap={3} className="items-center mb-6">
              <H2>JUST ANNOUNCED</H2>
              <Badge>New</Badge>
            </Stack>
            <Grid cols={3} gap={6}>
              {justAnnouncedEvents.map(event => (
                <Card key={event.id} className="overflow-hidden">
                  <Stack className="relative">
                    <Badge className="absolute top-2 left-2 z-10 bg-error-500 text-white">
                      {getTimeSinceAnnounced(event.announced_at)}
                    </Badge>
                    <ProjectCard
                      title={event.title}
                      image={event.image || ''}
                      metadata={`${event.date} • ${event.venue}`}
                      tags={[event.category]}
                      onClick={() => handleEventClick(event.id)}
                    />
                  </Stack>
                  {event.presale_date && new Date(event.presale_date) > new Date() && (
                    <Stack className="p-3 bg-grey-50 border-t">
                      <Body className="text-sm text-grey-600">
                        Presale: {new Date(event.presale_date).toLocaleDateString()}
                      </Body>
                    </Stack>
                  )}
                  {event.on_sale_date && new Date(event.on_sale_date) > new Date() && (
                    <Stack className="p-3 bg-grey-50 border-t">
                      <Body className="text-sm text-grey-600">
                        On Sale: {new Date(event.on_sale_date).toLocaleDateString()}
                      </Body>
                    </Stack>
                  )}
                </Card>
              ))}
            </Grid>
          </Section>
        )}

        {thisWeekEvents.length > 0 && (
          <Section className="mb-12">
            <H2 className="mb-6">THIS WEEK</H2>
            <Grid cols={3} gap={6}>
              {thisWeekEvents.map(event => (
                <Card key={event.id} className="overflow-hidden">
                  <Stack className="relative">
                    <Badge className="absolute top-2 left-2 z-10" variant="outline">
                      {getTimeSinceAnnounced(event.announced_at)}
                    </Badge>
                    <ProjectCard
                      title={event.title}
                      image={event.image || ''}
                      metadata={`${event.date} • ${event.venue}`}
                      tags={[event.category]}
                      onClick={() => handleEventClick(event.id)}
                    />
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Section>
        )}

        {olderEvents.length > 0 && (
          <Section className="mb-12">
            <H2 className="mb-6">RECENTLY ANNOUNCED</H2>
            <Grid cols={3} gap={6}>
              {olderEvents.map(event => (
                <ProjectCard
                  key={event.id}
                  title={event.title}
                  image={event.image || ''}
                  metadata={`${event.date} • ${event.venue} • From $${event.price}`}
                  tags={[event.category]}
                  onClick={() => handleEventClick(event.id)}
                />
              ))}
            </Grid>
          </Section>
        )}

        {events.length === 0 && (
          <Card className="p-12 text-center">
            <H3 className="mb-4">NO NEW EVENTS</H3>
            <Body className="text-grey-600 mb-6">
              No new events have been announced in the selected time period.
            </Body>
            <Button variant="outline" onClick={() => router.push('/browse')}>
              Browse All Events
            </Button>
          </Card>
        )}

        <Card className="p-6 bg-black text-white mt-8">
          <Stack direction="horizontal" className="justify-between items-center">
            <Stack>
              <H3 className="text-white">NEVER MISS AN ANNOUNCEMENT</H3>
              <Body className="text-grey-600">
                Follow your favorite artists and venues to get notified first.
              </Body>
            </Stack>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black" onClick={() => router.push('/profile/follows')}>
              Manage Follows
            </Button>
          </Stack>
        </Card>
        </Stack>
      </Container>
    </Section>
  );
}
