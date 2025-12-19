"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, H3, Spinner, EmptyState } from "@ghxstship/ui";
import { useEvent } from "@/hooks/useEvents";

export default function PollsPage() {
  const params = useParams();
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
      <SectionHeader kicker={event.name} title="Polls" description="Vote and see results" colorScheme="on-dark" />
      <Card variant="elevated" inverted><CardBody><Stack gap={4}><H3 className="text-white">Active Polls</H3><Body className="text-on-dark-muted">Polls will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
