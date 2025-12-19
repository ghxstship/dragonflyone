"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Guitar, Dice1 } from "lucide-react";
import { GvtewayAppLayout, GvtewayLoadingLayout, GvtewayEmptyLayout } from "@/components/app-layout";
import {
  H2,
  Body,
  StatCard,
  Select,
  Badge,
  Grid,
  Stack,
  Card,
  Input,
  Field,
  Kicker,
  EmptyState,
} from "@ghxstship/ui";
import { useDestinationsData } from "@/hooks/useDestinations";

export default function DestinationsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const {
    destinations,
    summary,
    isLoading: loading,
    error,
    refetch,
  } = useDestinationsData(searchQuery);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <GvtewayLoadingLayout text="Loading destinations..." />;
  }

  if (error) {
    return (
      <GvtewayEmptyLayout
        title="Error Loading Destinations"
        description={error instanceof Error ? error.message : String(error)}
        action={{ label: "Retry", onClick: () => refetch() }}
      />
    );
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={8}>
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Explore</Kicker>
              <H2 size="lg" className="text-white">Event Destinations</H2>
              <Body className="text-on-dark-muted">
                Discover amazing events in cities around the world
              </Body>
            </Stack>

          <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
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
              <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
                <Card inverted interactive className="cursor-pointer p-4">
                  <Stack gap={2}>
                    <Guitar className="size-8" />
                    <Body className="font-display text-white">New York</Body>
                    <Body size="sm" className="text-on-dark-muted">1,234 events</Body>
                  </Stack>
                </Card>
                <Card inverted interactive className="cursor-pointer p-4">
                  <Stack gap={2}>
                    <Guitar className="size-8" />
                    <Body className="font-display text-white">Los Angeles</Body>
                    <Body size="sm" className="text-on-dark-muted">987 events</Body>
                  </Stack>
                </Card>
                <Card inverted interactive className="cursor-pointer p-4">
                  <Stack gap={2}>
                    <Guitar className="size-8" />
                    <Body className="font-display text-white">Nashville</Body>
                    <Body size="sm" className="text-on-dark-muted">654 events</Body>
                  </Stack>
                </Card>
                <Card inverted interactive className="cursor-pointer p-4">
                  <Stack gap={2}>
                    <Dice1 className="size-8" />
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
            <Grid cols={3} gap={6} className="sm:grid-cols-2 lg:grid-cols-3">
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
    </GvtewayAppLayout>
  );
}
