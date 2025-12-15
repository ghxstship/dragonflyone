"use client";

import { CompvssAppLayout } from "../../components/app-layout";
import { useVenues } from "../../hooks/useVenues";
import {
  H3,
  Body,
  Badge,
  Card,
  Container,
  Grid,
  Stack,
  EnterprisePageHeader,
  MainContent,
  Spinner,
  Alert,
  EmptyState,
} from "@ghxstship/ui";
import { MapPin } from "lucide-react";

export default function VenuesPage() {
  const { data: venues, isLoading, error, refetch } = useVenues();

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Venue Directory"
        subtitle="Browse and manage venue information for productions"
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          {isLoading && (
            <Stack className="items-center justify-center py-12">
              <Spinner variant="grey" size="lg" />
              <Body className="mt-4">Loading venues...</Body>
            </Stack>
          )}

          {error && (
            <Alert variant="error" title="Error loading venues">
              <Body>{error instanceof Error ? error.message : 'Failed to load venues'}</Body>
              <button onClick={() => refetch()} className="mt-2 underline">
                Try again
              </button>
            </Alert>
          )}

          {!isLoading && !error && venues && venues.length === 0 && (
            <EmptyState
              icon={<MapPin className="size-12" />}
              title="No Venues Found"
              description="No venues have been added to the system yet."
            />
          )}

          {!isLoading && !error && venues && venues.length > 0 && (
            <Stack gap={10}>
              <Grid cols={3} gap={6}>
                {venues.map((venue) => (
                  <Card key={venue.id}>
                    <Stack gap={4}>
                      <Stack gap={2}>
                        <H3>{venue.name}</H3>
                        <Body size="sm">{venue.city}, {venue.state}</Body>
                      </Stack>
                      <Stack gap={2}>
                        <Stack gap={2} direction="horizontal" className="justify-between">
                          <Body size="sm">Capacity:</Body>
                          <Body className="font-mono">{venue.capacity?.toLocaleString() || '—'}</Body>
                        </Stack>
                        <Stack gap={2} direction="horizontal" className="justify-between">
                          <Body size="sm">Type:</Body>
                          <Badge variant="outline">{venue.type || 'Unknown'}</Badge>
                        </Stack>
                        <Stack gap={2} direction="horizontal" className="justify-between">
                          <Body size="sm">Status:</Body>
                          <Badge variant={venue.status === "active" ? "solid" : "outline"}>
                            {venue.status === "active" ? "Available" : "Inactive"}
                          </Badge>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Stack>
          )}
        </Container>
      </MainContent>
    </CompvssAppLayout>
  );
}
