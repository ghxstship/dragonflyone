"use client";

/**
 * Discover Page
 * Find your next unforgettable experience
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import {
  Badge,
  Body,
  Button,
  Card,
  Grid,
  DetailPage,
  Section,
  SectionHeader,
  ProjectCard,
Box} from "@ghxstship/ui";
import { Music, Tent, Drama, Trophy, Laugh, Moon, ArrowRight, Compass } from "lucide-react";
import { useDiscoverData } from "@/hooks/useDiscover";

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
  { id: "concert", name: "Concerts", icon: Music },
  { id: "festival", name: "Festivals", icon: Tent },
  { id: "theater", name: "Theater", icon: Drama },
  { id: "sports", name: "Sports", icon: Trophy },
  { id: "comedy", name: "Comedy", icon: Laugh },
  { id: "nightlife", name: "Nightlife", icon: Moon },
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
    refetch,
  } = useDiscoverData();

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/browse?category=${categoryId}`);
  };

  const handleEventClick = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const tabs = [
    {
      id: "browse",
      label: "Browse",
      icon: <Compass className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Browse by Category" description="Explore events by type" />
          <Grid cols={6} gap={4} className="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-8">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="flex cursor-pointer flex-col items-center gap-4 p-6 text-center hover:border-primary transition-colors"
                onClick={() => handleCategoryClick(category.id)}
                onKeyDown={(e) => e.key === "Enter" && handleCategoryClick(category.id)}
                role="button"
                tabIndex={0}
                aria-label={`Browse ${category.name} events`}
              >
                <category.icon className="size-8" aria-hidden="true" />
                <Body size="sm">{category.name}</Body>
              </Card>
            ))}
          </Grid>

          {trendingEvents.length > 0 && (
            <>
              <Box className="flex items-end justify-between mb-4">
                <SectionHeader title="Trending Now" description="Most popular events this week" />
                <Button variant="outline" onClick={() => router.push("/browse?sort=trending")} icon={<ArrowRight className="size-4" />} iconPosition="right">
                  View All
                </Button>
              </Box>
              <Grid cols={3} gap={6} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                {trendingEvents.map((event: DiscoverEvent) => (
                  <ProjectCard
                    key={event.id}
                    title={event.title}
                    image={event.image || ""}
                    metadata={`${event.date} • ${event.venue} • From $${event.price}`}
                    onClick={() => handleEventClick(event.id)}
                  />
                ))}
              </Grid>
            </>
          )}

          {recommendedEvents.length > 0 && (
            <>
              <Box className="flex items-end justify-between mb-4">
                <SectionHeader title="Recommended For You" description="Based on your interests and history" />
                <Button variant="outline" onClick={() => router.push("/browse?sort=recommended")} icon={<ArrowRight className="size-4" />} iconPosition="right">
                  View All
                </Button>
              </Box>
              <Grid cols={3} gap={6} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                {recommendedEvents.map((event: DiscoverEvent) => (
                  <ProjectCard
                    key={event.id}
                    title={event.title}
                    image={event.image || ""}
                    metadata={`${event.date} • ${event.venue} • From $${event.price}`}
                    onClick={() => handleEventClick(event.id)}
                  />
                ))}
              </Grid>
            </>
          )}

          {nearbyEvents.length > 0 && (
            <>
              <Box className="flex items-end justify-between mb-4">
                <SectionHeader title="Near You" description="Events happening in your area" />
                <Button variant="outline" onClick={() => router.push("/browse?nearby=true")} icon={<ArrowRight className="size-4" />} iconPosition="right">
                  View All
                </Button>
              </Box>
              <Grid cols={3} gap={6} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {nearbyEvents.map((event: DiscoverEvent) => (
                  <ProjectCard
                    key={event.id}
                    title={event.title}
                    image={event.image || ""}
                    metadata={`${event.date} • ${event.venue} • From $${event.price}`}
                    onClick={() => handleEventClick(event.id)}
                  />
                ))}
              </Grid>
            </>
          )}
        </Section>
      ),
    },
    {
      id: "collections",
      label: "Collections",
      icon: <Music className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Curated Collections" description="Hand-picked event collections" />
          {collections.length === 0 ? (
            <Box className="text-center py-12">
              <Music className="size-12 text-text-disabled mx-auto mb-4" />
              <Body className="text-text-muted">No collections available</Body>
            </Box>
          ) : (
            <Grid cols={2} gap={6} className="grid-cols-1 lg:grid-cols-2">
              {collections.map((collection: DiscoverCollection) => (
                <Card key={collection.id} className="p-6" role="article" aria-label={`${collection.name} collection with ${collection.events.length} events`}>
                  <Body className="font-weight-medium">{collection.name}</Body>
                  <Body size="sm" className="mt-2 text-text-muted">{collection.description}</Body>
                  <Box className="flex items-center gap-3 mt-4">
                    <Badge variant="outline">{collection.events.length} events</Badge>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/collections/${collection.id}`)}>
                      Explore
                    </Button>
                  </Box>
                </Card>
              ))}
            </Grid>
          )}

          <Card className="p-10 text-center mt-8">
            <SectionHeader title="Not Sure What To Do?" description="Take our quick quiz to get personalized event recommendations based on your preferences." />
            <Button variant="solid" size="lg" onClick={() => router.push("/quiz")} icon={<ArrowRight className="size-4" />} iconPosition="right" className="mt-6">
              Take The Quiz
            </Button>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Explore",
        title: "Discover",
        description: "Find your next unforgettable experience",
      }}
      loading={loading}
      error={discoverError instanceof Error ? discoverError : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
