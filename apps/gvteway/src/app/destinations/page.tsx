"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  H1,
  H2,
  Body,
  StatCard,
  Select,
  Button,
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

  if (loading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading destinations..." />
        </Container>
      </Section>
    );
  }

  if (error) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="py-16">
          <EmptyState
            title="Error Loading Destinations"
            description={error}
            action={{ label: "Retry", onClick: fetchDestinations }}
          />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="relative min-h-screen bg-black text-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Event Destinations</H1>
            <Body className="text-grey-400">
              Discover amazing events in cities around the world
            </Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard
              value={summary?.total_destinations || 0}
              label="Destinations"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.trending_count || 0}
              label="Trending"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.total_events || 0}
              label="Upcoming Events"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={summary?.featured_count || 0}
              label="Featured"
              className="bg-black text-white border-grey-800"
            />
          </Grid>

          <Card className="p-6 bg-black border-grey-800">
            <Stack gap={4}>
              <H2>Trending Destinations</H2>
              <Grid cols={4} gap={4}>
                <Card className="p-4 bg-grey-900 border-grey-700 cursor-pointer hover:border-grey-600">
                  <Stack gap={2}>
                    <Body className="text-2xl">🗽</Body>
                    <Body className="font-medium">New York</Body>
                    <Body className="text-grey-400 text-sm">1,234 events</Body>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700 cursor-pointer hover:border-grey-600">
                  <Stack gap={2}>
                    <Body className="text-2xl">🌴</Body>
                    <Body className="font-medium">Los Angeles</Body>
                    <Body className="text-grey-400 text-sm">987 events</Body>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700 cursor-pointer hover:border-grey-600">
                  <Stack gap={2}>
                    <Body className="text-2xl">🎸</Body>
                    <Body className="font-medium">Nashville</Body>
                    <Body className="text-grey-400 text-sm">654 events</Body>
                  </Stack>
                </Card>
                <Card className="p-4 bg-grey-900 border-grey-700 cursor-pointer hover:border-grey-600">
                  <Stack gap={2}>
                    <Body className="text-2xl">🎰</Body>
                    <Body className="font-medium">Las Vegas</Body>
                    <Body className="text-grey-400 text-sm">543 events</Body>
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
                className="bg-black text-white border-grey-700"
              />
            </Field>
            <Select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="bg-black text-white border-grey-700"
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
            />
          ) : (
            <Grid cols={3} gap={6}>
              {destinations.map((dest) => (
                <Card 
                  key={dest.id} 
                  className="p-6 bg-black border-grey-800 cursor-pointer hover:border-grey-700 transition-colors"
                  onClick={() => router.push(`/events?location=${dest.city}`)}
                >
                  <Stack gap={4}>
                    <Stack gap={2} direction="horizontal" className="justify-between items-start">
                      <Stack gap={1}>
                        <H2 className="text-xl">{dest.name}</H2>
                        <Body className="text-grey-400">
                          {dest.city}, {dest.state || dest.country}
                        </Body>
                      </Stack>
                      {dest.is_trending && (
                        <Badge variant="solid">Trending</Badge>
                      )}
                    </Stack>

                    <Body className="text-grey-400 text-sm line-clamp-2">
                      {dest.description}
                    </Body>

                    <Stack gap={2}>
                      <Stack gap={1} direction="horizontal" className="flex-wrap">
                        {dest.popular_genres.slice(0, 3).map((genre) => (
                          <Badge key={genre} variant="outline" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                      </Stack>
                    </Stack>

                    <Stack gap={2} direction="horizontal" className="justify-between text-grey-500 text-sm border-t border-grey-800 pt-4">
                      <Stack gap={1}>
                        <Body>{dest.venue_count} venues</Body>
                        <Body>{dest.upcoming_events} upcoming events</Body>
                      </Stack>
                      <Stack gap={1} className="text-right">
                        <Body className="text-grey-400">Avg. ticket</Body>
                        <Body className="text-white font-mono">
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
  );
}
