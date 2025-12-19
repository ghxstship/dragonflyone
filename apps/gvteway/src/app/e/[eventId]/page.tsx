"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, Badge, Grid, Spinner, EmptyState } from "@ghxstship/ui";
import { Calendar, Ticket, MapPin, Music, Users, Clock } from "lucide-react";
import { useEvent } from "@/hooks/useEvents";

/**
 * Event Overview Page
 * Main landing page for a specific event
 */
export default function EventOverviewPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.eventId as string;

  const { data: event, isLoading, error } = useEvent(eventId);

  if (isLoading) {
    return (
      <Stack gap={4} className="flex items-center justify-center py-20">
        <Spinner variant="grey" size="lg" text="Loading event..." />
      </Stack>
    );
  }

  if (error || !event) {
    return (
      <Stack gap={4}>
        <EmptyState
          title="Event Not Found"
          description={error ? (error instanceof Error ? error.message : "An error occurred") : "The requested event could not be found."}
          action={{ label: "Browse Events", onClick: () => router.push('/events') }}
          inverted
        />
      </Stack>
    );
  }

  const eventDetails = {
    date: event.start_date ? new Date(event.start_date).toLocaleDateString() : "TBD",
    venue: event.venue || "TBD",
    lineup: ["Headliner", "Support Act 1", "Support Act 2"],
    ticketsAvailable: event.capacity ? Math.floor(event.capacity * 0.1) : 500,
    ticketsSold: event.tickets_sold || 0,
  };

  return (
    <Stack gap={8}>
      {/* Header */}
      <Stack gap={4}>
        <SectionHeader
          kicker="Event"
          title={event.name}
          description={`${eventDetails.venue} | ${eventDetails.date}`}
          colorScheme="on-dark"
        />
        <Stack direction="horizontal" gap={2} className="flex-wrap">
          <Badge variant={event.status === "published" ? "success" : event.status === "completed" ? "info" : "solid"}>
            {event.status.toUpperCase()}
          </Badge>
          <Badge variant="outline">
            <MapPin size={12} className="mr-1" />
            {eventDetails.venue}
          </Badge>
          <Badge variant="outline">
            <Calendar size={12} className="mr-1" />
            {eventDetails.date}
          </Badge>
        </Stack>
      </Stack>

      {/* Quick Actions */}
      <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/e/${eventId}/tickets`)}>
          <CardBody>
            <Stack gap={4} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <Ticket size={24} className="text-primary" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Buy Tickets</Body>
                <Body size="sm" className=" text-on-dark-muted">{eventDetails.ticketsAvailable} available</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/e/${eventId}/program`)}>
          <CardBody>
            <Stack gap={4} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <Clock size={24} className="text-secondary" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Program</Body>
                <Body size="sm" className=" text-on-dark-muted">Event schedule</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/e/${eventId}/lineup`)}>
          <CardBody>
            <Stack gap={4} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <Music size={24} className="text-warning" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Lineup</Body>
                <Body size="sm" className=" text-on-dark-muted">{eventDetails.lineup.length} artists</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/e/${eventId}/friends`)}>
          <CardBody>
            <Stack gap={4} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <Users size={24} className="text-success" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Friends</Body>
                <Body size="sm" className=" text-on-dark-muted">Who is going</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      {/* Event Info */}
      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4}>
            <Body className="font-weight-bold text-white">About This Event</Body>
            <Body className="text-on-dark-muted">
              Join us for an unforgettable experience at {event.name}. This event features 
              world-class performances, amazing atmosphere, and memories that will last a lifetime.
              Get your tickets now before they sell out!
            </Body>
            <Stack direction="horizontal" gap={4}>
              <Button variant="solid" onClick={() => router.push(`/e/${eventId}/tickets`)}>
                Get Tickets
              </Button>
              <Button variant="outline" onClick={() => router.push(`/e/${eventId}/entry-info`)}>
                Entry Info
              </Button>
            </Stack>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
