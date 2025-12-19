"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, Box, Grid, Spinner, EmptyState } from "@ghxstship/ui";
import { Search, Headphones, AlertTriangle } from "lucide-react";
import { useEvent } from "@/hooks/useEvents";

export default function EventServicesPage() {
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
      <SectionHeader kicker={event.name} title="Services" description="Event services and support" colorScheme="on-dark" />
      <Grid cols={3} gap={4}>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/e/${eventId}/services/lost-found`)}>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <Search size={24} className="text-primary" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Lost & Found</Body>
                <Body size="sm" className=" text-on-dark-muted">Report or find lost items</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/e/${eventId}/services/support`)}>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <Headphones size={24} className="text-secondary" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Support Chat</Body>
                <Body size="sm" className=" text-on-dark-muted">Get help from staff</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/e/${eventId}/services/emergency`)}>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <AlertTriangle size={24} className="text-error" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Emergency Info</Body>
                <Body size="sm" className=" text-on-dark-muted">Safety and emergency contacts</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Grid>
    </Stack>
  );
}
