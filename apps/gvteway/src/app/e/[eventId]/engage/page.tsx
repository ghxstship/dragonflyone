"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, Box, Grid, Spinner, EmptyState } from "@ghxstship/ui";
import { MessageCircle, BarChart, Trophy, Camera } from "lucide-react";
import { useEvent } from "@/hooks/useEvents";

export default function EventEngagePage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.eventId as string;
  const { data: event, isLoading, error } = useEvent(eventId);

  if (isLoading) {
    return (
      <Stack gap={4} className="flex items-center justify-center py-20">
        <Spinner variant="grey" size="lg" text="Loading..." />
      </Stack>
    );
  }

  if (error || !event) {
    return <Stack gap={4}><EmptyState title="Event Not Found" description="Unable to load event data" inverted /></Stack>;
  }

  return (
    <Stack gap={8}>
      <SectionHeader kicker={event.name} title="Engage" description="Interact with the event and community" colorScheme="on-dark" />
      <Grid cols={4} gap={4}>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/e/${eventId}/engage/qa`)}>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <MessageCircle size={24} className="text-primary" />
              </Box>
              <Body className="font-weight-bold text-white">Q&A</Body>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/e/${eventId}/engage/polls`)}>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <BarChart size={24} className="text-secondary" />
              </Box>
              <Body className="font-weight-bold text-white">Polls</Body>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/e/${eventId}/engage/challenges`)}>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <Trophy size={24} className="text-accent" />
              </Box>
              <Body className="font-weight-bold text-white">Challenges</Body>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/e/${eventId}/engage/ugc`)}>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <Camera size={24} className="text-warning" />
              </Box>
              <Body className="font-weight-bold text-white">Share Content</Body>
            </Stack>
          </CardBody>
        </Card>
      </Grid>
    </Stack>
  );
}
