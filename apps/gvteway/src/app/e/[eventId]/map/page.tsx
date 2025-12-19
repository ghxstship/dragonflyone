"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, H3, Grid, Box, Spinner, EmptyState } from "@ghxstship/ui";
import { Map, MapPin, Navigation, Layers } from "lucide-react";
import { useEvent } from "@/hooks/useEvents";

export default function EventMapPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const { data: event, isLoading, error } = useEvent(eventId);

  if (isLoading) {
    return (
      <Stack gap={4} className="flex items-center justify-center py-20">
        <Spinner variant="grey" size="lg" text="Loading map..." />
      </Stack>
    );
  }

  if (error || !event) {
    return <Stack gap={4}><EmptyState title="Event Not Found" description="Unable to load event data" inverted /></Stack>;
  }

  return (
    <Stack gap={8}>
      <SectionHeader kicker={event.name} title="Venue Map" description="Interactive venue map and points of interest" colorScheme="on-dark" />
      <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
        <Card variant="elevated" inverted>
          <CardBody className="text-center">
            <Stack gap={2} className="items-center">
              <Map size={24} className="text-primary" />
              <Body className="font-weight-bold text-white">Full Map</Body>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted>
          <CardBody className="text-center">
            <Stack gap={2} className="items-center">
              <MapPin size={24} className="text-secondary" />
              <Body className="font-weight-bold text-white">Points of Interest</Body>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted>
          <CardBody className="text-center">
            <Stack gap={2} className="items-center">
              <Navigation size={24} className="text-accent" />
              <Body className="font-weight-bold text-white">Navigate</Body>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted>
          <CardBody className="text-center">
            <Stack gap={2} className="items-center">
              <Layers size={24} className="text-warning" />
              <Body className="font-weight-bold text-white">Layers</Body>
            </Stack>
          </CardBody>
        </Card>
      </Grid>
      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4}>
            <H3 className="text-white">Interactive Map</H3>
            <Box variant="bordered" className="flex h-96 items-center justify-center rounded bg-ink-800">
              <Body className="text-on-dark-muted">Interactive venue map will be displayed here</Body>
            </Box>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
