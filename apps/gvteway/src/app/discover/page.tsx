'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ConsumerNavigationPublic } from '../../components/navigation';
import {
  Container,
  Section,
  SectionHeader,
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
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
} from '@ghxstship/ui';
import { Music, Tent, Drama, Trophy, Laugh, Moon, ArrowRight } from 'lucide-react';

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

const categories = [
  { id: 'concert', name: 'Concerts', icon: Music },
  { id: 'festival', name: 'Festivals', icon: Tent },
  { id: 'theater', name: 'Theater', icon: Drama },
  { id: 'sports', name: 'Sports', icon: Trophy },
  { id: 'comedy', name: 'Comedy', icon: Laugh },
  { id: 'nightlife', name: 'Nightlife', icon: Moon },
];

export default function DiscoverPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [trendingEvents, setTrendingEvents] = useState<Event[]>([]);
  const [recommendedEvents, setRecommendedEvents] = useState<Event[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [nearbyEvents, setNearbyEvents] = useState<Event[]>([]);

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
    } catch (_err) {
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

  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Discover">
            <FooterLink href="/events">Browse Events</FooterLink>
            <FooterLink href="/venues">Find Venues</FooterLink>
            <FooterLink href="/artists">Artists</FooterLink>
          </FooterColumn>
          <FooterColumn title="Support">
            <FooterLink href="/help">Help Center</FooterLink>
            <FooterLink href="/help#contact">Contact</FooterLink>
          </FooterColumn>
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section className="bg-black py-16">
        <Container>
          {loading ? (
            <Stack className="flex min-h-[60vh] items-center justify-center">
              <LoadingSpinner size="lg" text="Loading events..." />
            </Stack>
          ) : (
            <Stack gap={16}>
              {/* Page Header */}
              <SectionHeader
                kicker="Personalized For You"
                title="Discover"
                description="Find your next unforgettable experience"
                colorScheme="on-dark"
                gap="lg"
              />

              {/* Browse by Category */}
              <Section border className="py-12">
                <SectionHeader
                  kicker="Explore"
                  title="Browse by Category"
                  colorScheme="on-dark"
                  gap="md"
                />
                <Grid cols={6} gap={4} className="mt-8">
                  {categories.map(category => (
                    <Card
                      key={category.id}
                      className="flex cursor-pointer flex-col items-center gap-4 border-2 border-grey-800 bg-transparent p-6 text-center shadow-sm transition-all duration-100 hover:-translate-y-1 hover:border-white hover:shadow-md"
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      <category.icon className="size-8 text-white" />
                      <Label size="xs" className="tracking-kicker text-on-dark-muted">{category.name}</Label>
                    </Card>
                  ))}
                </Grid>
              </Section>

              {/* Trending Now */}
              {trendingEvents.length > 0 && (
                <Section border className="py-12">
                  <Stack direction="horizontal" className="mb-8 items-end justify-between">
                    <SectionHeader
                      kicker="Hot Right Now"
                      title="Trending Now"
                      description="Most popular events this week"
                      colorScheme="on-dark"
                      gap="md"
                    />
                    <Button 
                      variant="outlineInk" 
                      icon={<ArrowRight />}
                      onClick={() => router.push('/browse?sort=trending')}
                    >
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

              {/* Recommended For You */}
              {recommendedEvents.length > 0 && (
                <Section border className="py-12">
                  <Stack direction="horizontal" className="mb-8 items-end justify-between">
                    <SectionHeader
                      kicker="Personalized"
                      title="Recommended For You"
                      description="Based on your interests and history"
                      colorScheme="on-dark"
                      gap="md"
                    />
                    <Button 
                      variant="outlineInk" 
                      icon={<ArrowRight />}
                      onClick={() => router.push('/browse?sort=recommended')}
                    >
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

              {/* Curated Collections */}
              {collections.length > 0 && (
                <Section border className="py-12">
                  <SectionHeader
                    kicker="Hand-Picked"
                    title="Curated Collections"
                    colorScheme="on-dark"
                    gap="md"
                  />
                  <Grid cols={2} gap={6} className="mt-8">
                    {collections.map(collection => (
                      <Card 
                        key={collection.id} 
                        className="border-2 border-grey-800 bg-transparent p-6 shadow-sm transition-all duration-100 hover:-translate-y-0.5 hover:border-white hover:shadow-md"
                      >
                        <H3 className="text-white">{collection.name}</H3>
                        <Body size="sm" className="mt-2 text-on-dark-muted">{collection.description}</Body>
                        <Stack direction="horizontal" gap={3} className="mt-4 items-center">
                          <Badge variant="outline">{collection.events.length} events</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            inverted
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

              {/* Near You */}
              {nearbyEvents.length > 0 && (
                <Section border className="py-12">
                  <Stack direction="horizontal" className="mb-8 items-end justify-between">
                    <SectionHeader
                      kicker="Local"
                      title="Near You"
                      description="Events happening in your area"
                      colorScheme="on-dark"
                      gap="md"
                    />
                    <Button 
                      variant="outlineInk" 
                      icon={<ArrowRight />}
                      onClick={() => router.push('/browse?nearby=true')}
                    >
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

              {/* Quiz CTA */}
              <Section className="py-12">
                <Card className="border-2 border-grey-700 bg-grey-900/50 p-10 text-center">
                  <SectionHeader
                    kicker="Not Sure?"
                    title="Not Sure What To Do?"
                    description="Take our quick quiz to get personalized event recommendations based on your preferences."
                    align="center"
                    colorScheme="on-dark"
                    gap="lg"
                  />
                  <Button 
                    variant="solid" 
                    size="lg"
                    inverted
                    icon={<ArrowRight />}
                    onClick={() => router.push('/quiz')}
                    className="mt-8"
                  >
                    Take The Quiz
                  </Button>
                </Card>
              </Section>
            </Stack>
          )}
        </Container>
      </Section>
    </PageLayout>
  );
}
