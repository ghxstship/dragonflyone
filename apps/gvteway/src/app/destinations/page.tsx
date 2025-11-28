"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ConsumerNavigationPublic } from "@/components/navigation";
import {
  H2,
  Body,
  StatCard,
  Select,
  Badge,
  LoadingSpinner,
  EmptyState,
  Container,
  Grid,
  Stack,
  Card,
  Section,
  Input,
  Field,
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  Kicker,
} from "@ghxstship/ui";

interface Destination {
  id: string;
  name: string;
  city: string;
  state?: string;
  country: string;
  description: string;
  image_url?: string;
  venue_count: number;
  upcoming_events: number;
  featured_events: string[];
  popular_genres: string[];
  average_ticket_price: number;
  is_trending: boolean;
}

interface DestinationSummary {
  total_destinations: number;
  trending_count: number;
  total_events: number;
  featured_count: number;
}

export default function DestinationsPage() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [summary, setSummary] = useState<DestinationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRegion, setFilterRegion] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDestinations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterRegion !== "all") params.append("region", filterRegion);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(`/api/destinations?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch destinations");
      
      const data = await response.json();
      setDestinations(data.destinations || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filterRegion, searchQuery]);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const footerContent = (
    <Footer
      logo={<Display size="md">GVTEWAY</Display>}
      copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
    >
      <FooterColumn title="Discover">
        <FooterLink href="/events">Events</FooterLink>
        <FooterLink href="/destinations">Destinations</FooterLink>
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
          <LoadingSpinner size="lg" text="Loading destinations..." />
        </Section>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={footerContent}>
        <Section background="black" className="min-h-screen py-16">
          <Container>
            <EmptyState
              title="Error Loading Destinations"
              description={error}
              action={{ label: "Retry", onClick: fetchDestinations }}
              inverted
            />
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
          <Stack gap={8}>
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Explore</Kicker>
              <H2 size="lg" className="text-white">Event Destinations</H2>
              <Body className="text-on-dark-muted">
                Discover amazing events in cities around the world
              </Body>
            </Stack>

          <Grid cols={4} gap={6}>
            <StatCard
              value={(summary?.total_destinations || 0).toString()}
              label="Destinations"
              inverted
            />
            <StatCard
              value={(summary?.trending_count || 0).toString()}
              label="Trending"
              inverted
            />
            <StatCard
              value={(summary?.total_events || 0).toString()}
              label="Upcoming Events"
              inverted
            />
            <StatCard
              value={(summary?.featured_count || 0).toString()}
              label="Featured"
              inverted
            />
          </Grid>

          <Card inverted variant="elevated" className="p-6">
            <Stack gap={4}>
              <H2 className="text-white">Trending Destinations</H2>
              <Grid cols={4} gap={4}>
                <Card inverted interactive className="cursor-pointer p-4">
                  <Stack gap={2}>
                    <Body className="text-h3-md">🗽</Body>
                    <Body className="font-display text-white">New York</Body>
                    <Body size="sm" className="text-on-dark-muted">1,234 events</Body>
                  </Stack>
                </Card>
                <Card inverted interactive className="cursor-pointer p-4">
                  <Stack gap={2}>
                    <Body className="text-h3-md">🌴</Body>
                    <Body className="font-display text-white">Los Angeles</Body>
                    <Body size="sm" className="text-on-dark-muted">987 events</Body>
                  </Stack>
                </Card>
                <Card inverted interactive className="cursor-pointer p-4">
                  <Stack gap={2}>
                    <Body className="text-h3-md">🎸</Body>
                    <Body className="font-display text-white">Nashville</Body>
                    <Body size="sm" className="text-on-dark-muted">654 events</Body>
                  </Stack>
                </Card>
                <Card inverted interactive className="cursor-pointer p-4">
                  <Stack gap={2}>
                    <Body className="text-h3-md">🎰</Body>
                    <Body className="font-display text-white">Las Vegas</Body>
                    <Body size="sm" className="text-on-dark-muted">543 events</Body>
                  </Stack>
                </Card>
              </Grid>
            </Stack>
          </Card>

          <Stack gap={4} direction="horizontal">
            <Field className="flex-1">
              <Input
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                inverted
              />
            </Field>
            <Select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              inverted
            >
              <option value="all">All Regions</option>
              <option value="northeast">Northeast</option>
              <option value="southeast">Southeast</option>
              <option value="midwest">Midwest</option>
              <option value="southwest">Southwest</option>
              <option value="west">West Coast</option>
              <option value="international">International</option>
            </Select>
          </Stack>

          {destinations.length === 0 ? (
            <EmptyState
              title="No Destinations Found"
              description="Try different search criteria"
              inverted
            />
          ) : (
            <Grid cols={3} gap={6}>
              {destinations.map((dest) => (
                <Card 
                  key={dest.id} 
                  inverted
                  interactive
                  className="cursor-pointer p-6"
                  onClick={() => router.push(`/events?location=${dest.city}`)}
                >
                  <Stack gap={4}>
                    <Stack gap={2} direction="horizontal" className="items-start justify-between">
                      <Stack gap={1}>
                        <H2 className="text-white">{dest.name}</H2>
                        <Body className="text-on-dark-muted">
                          {dest.city}, {dest.state || dest.country}
                        </Body>
                      </Stack>
                      {dest.is_trending && (
                        <Badge variant="solid">Trending</Badge>
                      )}
                    </Stack>

                    <Body size="sm" className="line-clamp-2 text-on-dark-muted">
                      {dest.description}
                    </Body>

                    <Stack gap={2}>
                      <Stack gap={1} direction="horizontal" className="flex-wrap">
                        {dest.popular_genres.slice(0, 3).map((genre) => (
                          <Badge key={genre} variant="outline">
                            {genre}
                          </Badge>
                        ))}
                      </Stack>
                    </Stack>

                    <Stack gap={2} direction="horizontal" className="justify-between border-t border-ink-800 pt-4">
                      <Stack gap={1}>
                        <Body size="sm" className="text-on-dark-muted">{dest.venue_count} venues</Body>
                        <Body size="sm" className="text-on-dark-muted">{dest.upcoming_events} upcoming events</Body>
                      </Stack>
                      <Stack gap={1} className="text-right">
                        <Body size="sm" className="text-on-dark-disabled">Avg. ticket</Body>
                        <Body className="font-mono text-white">
                          {formatCurrency(dest.average_ticket_price)}
                        </Body>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          )}
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
