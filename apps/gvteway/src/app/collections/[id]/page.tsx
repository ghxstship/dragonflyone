'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import {
  H2,
  Body,
  Button,
  Card,
  Grid,
  Stack,
  Badge,
  ProjectCard,
  Kicker,
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
    return <GvtewayLoadingLayout />;
  }

  if (error || !collection) {
    return (
      <GvtewayAppLayout>
            <Card inverted className="p-12 text-center">
              <H2 className="mb-4 text-white">Collection Not Found</H2>
              <Body className="text-on-dark-muted mb-6">
                The collection you are looking for does not exist.
              </Body>
              <Button variant="solid" inverted onClick={() => router.push('/discover')}>
                Browse Collections
              </Button>
            </Card>
      </GvtewayAppLayout>
    );
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Collections</Kicker>
              <H2 size="lg" className="text-white">{collection.name}</H2>
              {collection.description && (
                <Body className="text-on-dark-muted max-w-2xl">
                  {collection.description}
                </Body>
              )}
              <Stack direction="horizontal" gap={2} className="mt-2">
                <Badge>{collection.events.length} events</Badge>
              </Stack>
            </Stack>

        {collection.events.length > 0 ? (
          <Grid cols={3} gap={6}>
            {collection.events.map(event => (
              <ProjectCard
                key={event.id}
                title={event.title}
                image={event.image || ''}
                metadata={`${event.date} - ${event.venue}`}
                tags={[event.category]}
                onClick={() => handleEventClick(event.id)}
              />
            ))}
          </Grid>
        ) : (
          <Stack className="items-center py-12">
            <Body className="text-on-dark-muted">No events in this collection yet.</Body>
          </Stack>
        )}

            <Button variant="outlineInk" onClick={() => router.push('/discover')}>
              Back to Discover
            </Button>
          </Stack>
    </GvtewayAppLayout>
  );
}
