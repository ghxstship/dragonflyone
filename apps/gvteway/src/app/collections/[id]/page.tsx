'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Container,
  Section,
  Display,
  H2,
  Body,
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
  price?: number;
  image?: string;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  image?: string;
  events: Event[];
}

export default function CollectionPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollection = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/collections/${collectionId}`);
      if (response.ok) {
        const data = await response.json();
        setCollection(data.collection);
      } else {
        setError('Collection not found');
      }
    } catch (err) {
      setError('Failed to load collection');
    } finally {
      setLoading(false);
    }
  }, [collectionId]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  if (loading) {
    return (
      <Section className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </Section>
    );
  }

  if (error || !collection) {
    return (
      <Section className="min-h-screen bg-white">
        <Container>
          <Stack className="items-center justify-center min-h-[60vh]" gap={4}>
            <Display>COLLECTION NOT FOUND</Display>
            <Body className="text-gray-600">
              The collection you are looking for does not exist.
            </Body>
            <Button variant="outline" onClick={() => router.push('/discover')}>
              Browse Collections
            </Button>
          </Stack>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <Container>
        <Section className="border-b-2 border-black py-8 mb-8">
          <Stack direction="horizontal" className="justify-between items-start">
            <Stack>
              <Display>{collection.name.toUpperCase()}</Display>
              {collection.description && (
                <Body className="mt-2 text-gray-600 max-w-2xl">
                  {collection.description}
                </Body>
              )}
              <Stack direction="horizontal" gap={2} className="mt-4">
                <Badge>{collection.events.length} events</Badge>
              </Stack>
            </Stack>
            <Button variant="outline" onClick={() => router.push('/discover')}>
              Back to Discover
            </Button>
          </Stack>
        </Section>

        {collection.events.length > 0 ? (
          <Grid cols={3} gap={6}>
            {collection.events.map(event => (
              <ProjectCard
                key={event.id}
                title={event.title}
                image={event.image || ''}
                metadata={`${event.date} • ${event.venue}`}
                tags={[event.category]}
                onClick={() => handleEventClick(event.id)}
              />
            ))}
          </Grid>
        ) : (
          <Stack className="items-center py-12">
            <Body className="text-gray-500">No events in this collection yet.</Body>
          </Stack>
        )}
      </Container>
    </Section>
  );
}
