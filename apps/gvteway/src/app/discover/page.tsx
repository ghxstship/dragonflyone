'use client';

import { useRouter } from 'next/navigation';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import {
  EnterprisePageHeader,
  MainContent,
  Container,
  SectionHeader,
  H3,
  Body,
  Label,
  Button,
  Card,
  Grid,
  Stack,
  Badge,
  ProjectCard,
  Section,
} from '@ghxstship/ui';
import { Music, Tent, Drama, Trophy, Laugh, Moon, ArrowRight } from 'lucide-react';
import { useDiscoverData } from '@/hooks/useDiscover';

interface DiscoverEvent {
  id: string;
  title: string;
  image?: string;
  date: string;
  venue: string;
  price: number;
}

interface DiscoverCollection {
  id: string;
  name: string;
  description: string;
  events: { id: string }[];
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

  const {
    trendingEvents,
    recommendedEvents,
    collections,
    nearbyEvents,
    isLoading: loading,
    error: discoverError,
  } = useDiscoverData();

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/browse?category=${categoryId}`);
  };

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  if (loading) {
    return <GvtewayLoadingLayout text="Loading events..." />;
  }

  if (discoverError) {
    return (
      <GvtewayAppLayout>
        <Stack gap={6} className="items-center justify-center py-20">
          <Card inverted className="max-w-md p-8 text-center">
            <Stack gap={4}>
              <H3 className="text-white">Error Loading Events</H3>
              <Body className="text-grey-400">
                {discoverError instanceof Error ? discoverError.message : 'Failed to load discover data'}
              </Body>
              <Button variant="solid" inverted onClick={() => window.location.reload()}>
                Retry
              </Button>
            </Stack>
          </Card>
        </Stack>
      </GvtewayAppLayout>
    );
  }

  return (
    <GvtewayAppLayout>
      <EnterprisePageHeader
        title="Discover"
        subtitle="Find your next unforgettable experience"
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={16}>
            {/* Browse by Category */}
            <Section border-2 className="py-12">
                <SectionHeader
                  kicker="Explore"
                  title="Browse by Category"
                  colorScheme="on-dark"
                  gap="md"
                />
                <Grid cols={6} gap={4} className="mt-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                  {categories.map(category => (
                    <Card
                      key={category.id}
                      inverted
                      interactive
                      className="flex cursor-pointer flex-col items-center gap-4 p-6 text-center"
                      onClick={() => handleCategoryClick(category.id)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCategoryClick(category.id)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Browse ${category.name} events`}
                    >
                      <category.icon className="size-8 text-white" aria-hidden="true" />
                      <Label size="xs" className="text-on-dark-muted">{category.name}</Label>
                    </Card>
                  ))}
                </Grid>
              </Section>

              {/* Trending Now */}
              {trendingEvents.length > 0 && (
                <Section border-2 className="py-12">
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
                  <Grid cols={3} gap={6} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {trendingEvents.map((event: DiscoverEvent) => (
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
                <Section border-2 className="py-12">
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
                  <Grid cols={3} gap={6} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {recommendedEvents.map((event: DiscoverEvent) => (
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
                <Section border-2 className="py-12">
                  <SectionHeader
                    kicker="Hand-Picked"
                    title="Curated Collections"
                    colorScheme="on-dark"
                    gap="md"
                  />
                  <Grid cols={2} gap={6} className="mt-8 grid-cols-1 lg:grid-cols-2">
                    {collections.map((collection: DiscoverCollection) => (
                      <Card 
                        key={collection.id}
                        inverted
                        interactive
                        className="p-6"
                        role="article"
                        aria-label={`${collection.name} collection with ${collection.events.length} events`}
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
                <Section border-2 className="py-12">
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
                  <Grid cols={3} gap={6} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {nearbyEvents.map((event: DiscoverEvent) => (
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
                <Card inverted variant="elevated" className="p-10 text-center">
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
        </Container>
      </MainContent>
    </GvtewayAppLayout>
  );
}
