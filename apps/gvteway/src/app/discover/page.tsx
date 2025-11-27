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
  trending?: boolean;
  recommended?: boolean;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  events: Event[];
}

export default function DiscoverPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [trendingEvents, setTrendingEvents] = useState<Event[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<Event[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [nearbyEvents, setNearbyEvents] = useState<Event[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'concert', name: 'Concerts', emoji: '🎸' },
    { id: 'festival', name: 'Festivals', emoji: '🎪' },
    { id: 'theater', name: 'Theater', emoji: '🎭' },
    { id: 'sports', name: 'Sports', emoji: '⚽' },
    { id: 'comedy', name: 'Comedy', emoji: '😂' },
    { id: 'nightlife', name: 'Nightlife', emoji: '🌙' },
  ];

  const fetchDiscoveryData = useCallback(async () => {
    setLoading(true);
    try {
      const [trendingRes, recommendedRes, collectionsRes, nearbyRes] = await Promise.all([
        fetch('/api/events?trending=true&limit=6'),
        fetch('/api/events?recommended=true&limit=6'),
        fetch('/api/collections'),
        fetch('/api/events?nearby=true&limit=6'),
      ]);

      if (trendingRes.ok) {
        const data = await trendingRes.json();
        setTrendingEvents(data.events || []);
      }

      if (recommendedRes.ok) {
        const data = await recommendedRes.json();
        setRecommendedEvents(data.events || []);
      }

      if (collectionsRes.ok) {
        const data = await collectionsRes.json();
        setCollections(data.collections || []);
      }

      if (nearbyRes.ok) {
        const data = await nearbyRes.json();
        setNearbyEvents(data.events || []);
      }
    } catch (err) {
      console.error('Failed to fetch discovery data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscoveryData();
  }, [fetchDiscoveryData]);

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/browse?category=${categoryId}`);
  };

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
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

  return (
    <Section className="min-h-screen bg-white">
      <ConsumerNavigationPublic />
      <Container className="py-spacing-16">
        <Stack gap={8}>
          <Stack gap={2} className="border-b-2 border-black pb-spacing-8">
            <H1>Discover</H1>
            <Body className="text-ink-600">
              Find your next unforgettable experience
            </Body>
          </Stack>

        <Section className="mb-spacing-12">
          <H2 className="mb-spacing-6">BROWSE BY CATEGORY</H2>
          <Grid cols={6} gap={4}>
            {categories.map(category => (
              <Card
                key={category.id}
                className="p-spacing-6 text-center cursor-pointer hover:bg-ink-50 transition-colors"
                onClick={() => handleCategoryClick(category.id)}
              >
                <Body className="text-h3-md mb-spacing-2">{category.emoji}</Body>
                <Body className="font-medium">{category.name}</Body>
              </Card>
            ))}
          </Grid>
        </Section>

        {trendingEvents.length > 0 && (
          <Section className="mb-spacing-12">
            <Stack direction="horizontal" className="justify-between items-center mb-spacing-6">
              <Stack>
                <H2>TRENDING NOW</H2>
                <Body className="text-ink-600">Most popular events this week</Body>
              </Stack>
              <Button variant="outline" onClick={() => router.push('/browse?sort=trending')}>
                View All
              </Button>
            </Stack>
            <Grid cols={3} gap={6}>
              {trendingEvents.map(event => (
                <ProjectCard
                  key={event.id}
                  title={event.title}
                  image={event.image || ''}
                  metadata={`${event.date} • ${event.venue} • From $${event.price}`}
                  onClick={() => handleEventClick(event.id)}
                />
              ))}
            </Grid>
          </Section>
        )}

        {recommendedEvents.length > 0 && (
          <Section className="mb-spacing-12">
            <Stack direction="horizontal" className="justify-between items-center mb-spacing-6">
              <Stack>
                <H2>RECOMMENDED FOR YOU</H2>
                <Body className="text-ink-600">Based on your interests and history</Body>
              </Stack>
              <Button variant="outline" onClick={() => router.push('/browse?sort=recommended')}>
                View All
              </Button>
            </Stack>
            <Grid cols={3} gap={6}>
              {recommendedEvents.map(event => (
                <ProjectCard
                  key={event.id}
                  title={event.title}
                  image={event.image || ''}
                  metadata={`${event.date} • ${event.venue} • From $${event.price}`}
                  onClick={() => handleEventClick(event.id)}
                />
              ))}
            </Grid>
          </Section>
        )}

        {collections.length > 0 && (
          <Section className="mb-spacing-12">
            <H2 className="mb-spacing-6">CURATED COLLECTIONS</H2>
            <Grid cols={2} gap={6}>
              {collections.map(collection => (
                <Card key={collection.id} className="p-spacing-6">
                  <H3 className="mb-spacing-2">{collection.name}</H3>
                  <Body className="text-ink-600 mb-spacing-4">{collection.description}</Body>
                  <Stack direction="horizontal" gap={2}>
                    <Badge>{collection.events.length} events</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/collections/${collection.id}`)}
                    >
                      Explore
                    </Button>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Section>
        )}

        {nearbyEvents.length > 0 && (
          <Section className="mb-spacing-12">
            <Stack direction="horizontal" className="justify-between items-center mb-spacing-6">
              <Stack>
                <H2>NEAR YOU</H2>
                <Body className="text-ink-600">Events happening in your area</Body>
              </Stack>
              <Button variant="outline" onClick={() => router.push('/browse?nearby=true')}>
                View All
              </Button>
            </Stack>
            <Grid cols={3} gap={6}>
              {nearbyEvents.map(event => (
                <ProjectCard
                  key={event.id}
                  title={event.title}
                  image={event.image || ''}
                  metadata={`${event.date} • ${event.venue} • From $${event.price}`}
                  onClick={() => handleEventClick(event.id)}
                />
              ))}
            </Grid>
          </Section>
        )}

          <Section className="mb-spacing-12">
            <Card className="p-spacing-8 bg-black text-white text-center">
              <H2 className="text-white mb-spacing-4">NOT SURE WHAT TO DO?</H2>
              <Body className="text-ink-600 mb-spacing-6 max-w-md mx-auto">
                Take our quick quiz to get personalized event recommendations based on your preferences.
              </Body>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-black" onClick={() => router.push('/quiz')}>
                TAKE THE QUIZ
              </Button>
            </Card>
          </Section>
        </Stack>
      </Container>
    </Section>
  );
}
