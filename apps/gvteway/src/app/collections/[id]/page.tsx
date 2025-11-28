'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ConsumerNavigationPublic } from '@/components/navigation';
import {
  Container,
  Section,
  H2,
  Body,
  Button,
  Card,
  Grid,
  Stack,
  Badge,
  LoadingSpinner,
  ProjectCard,
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
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

  const footerContent = (
    <Footer
      logo={<Display size="md">GVTEWAY</Display>}
      copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
    >
      <FooterColumn title="Discover">
        <FooterLink href="/discover">Discover</FooterLink>
        <FooterLink href="/collections">Collections</FooterLink>
      </FooterColumn>
      <FooterColumn title="Legal">
        <FooterLink href="/legal/privacy">Privacy</FooterLink>
        <FooterLink href="/legal/terms">Terms</FooterLink>
      </FooterColumn>
    </Footer>
  );

  if (loading) {
    return (
      <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={footerContent}>
        <Section background="black" className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading collection..." />
        </Section>
      </PageLayout>
    );
  }

  if (error || !collection) {
    return (
      <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={footerContent}>
        <Section background="black" className="min-h-screen py-16">
          <Container>
            <Card inverted className="p-12 text-center">
              <H2 className="mb-4 text-white">Collection Not Found</H2>
              <Body className="text-on-dark-muted mb-6">
                The collection you are looking for does not exist.
              </Body>
              <Button variant="solid" inverted onClick={() => router.push('/discover')}>
                Browse Collections
              </Button>
            </Card>
          </Container>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={footerContent}>
      <Section background="black" className="relative min-h-screen overflow-hidden py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
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
                metadata={`${event.date} • ${event.venue}`}
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
        </Container>
      </Section>
    </PageLayout>
  );
}
