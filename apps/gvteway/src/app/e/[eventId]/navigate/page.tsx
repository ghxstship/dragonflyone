"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, Box, Grid, Spinner, EmptyState } from "@ghxstship/ui";
import { Navigation, Car, Accessibility, MapPin } from "lucide-react";
import { useEvent } from "@/hooks/useEvents";

export default function EventNavigatePage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.eventId as string;
  const { data: event, isLoading, error } = useEvent(eventId);

  if (isLoading) {
    return <Stack gap={4} className="flex items-center justify-center py-20"><Spinner variant="grey" size="lg" text="Loading..." /></Stack>;
  }

  if (error || !event) {
    return <Stack gap={4}><EmptyState title="Event Not Found" description="Unable to load event data" inverted /></Stack>;
  }

  return (
    <Stack gap={8}>
      <SectionHeader kicker={event.name} title="Navigate" description="Directions, parking, and accessibility info" colorScheme="on-dark" />
      <Grid cols={3} gap={4}>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/e/${eventId}/navigate/directions`)}>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <Navigation size={24} className="text-primary" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Directions</Body>
                <Body size="sm" className=" text-on-dark-muted">Get directions to venue</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/e/${eventId}/navigate/parking`)}>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <Car size={24} className="text-secondary" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Parking</Body>
                <Body size="sm" className=" text-on-dark-muted">Find parking options</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/e/${eventId}/navigate/accessibility`)}>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <Accessibility size={24} className="text-accent" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Accessibility</Body>
                <Body size="sm" className=" text-on-dark-muted">Accessibility information</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Grid>
      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={3}>
            <Stack direction="horizontal" gap={2} className="items-center">
              <MapPin size={20} className="text-primary" />
              <Body className="font-weight-bold text-white">{event.venue}</Body>
            </Stack>
            <Body className="text-on-dark-muted">Venue address and location details will be displayed here.</Body>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
