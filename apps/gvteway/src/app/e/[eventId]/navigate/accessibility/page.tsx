"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, H3, Grid, Spinner, EmptyState } from "@ghxstship/ui";
import { Accessibility, Eye, Ear, PersonStanding } from "lucide-react";
import { useEvent } from "@/hooks/useEvents";

export default function AccessibilityPage() {
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
      <SectionHeader kicker={event.name} title="Accessibility" description="Accessibility services and accommodations" colorScheme="on-dark" />
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={3}>
              <Stack direction="horizontal" gap={2} className="items-center">
                <PersonStanding size={20} className="text-primary" />
                <Body className="font-weight-bold text-white">Wheelchair Access</Body>
              </Stack>
              <Body className="text-on-dark-muted">ADA-compliant entrances and seating areas available. Contact venue for assistance.</Body>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={3}>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Eye size={20} className="text-secondary" />
                <Body className="font-weight-bold text-white">Visual Assistance</Body>
              </Stack>
              <Body className="text-on-dark-muted">Large print programs and audio descriptions available upon request.</Body>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={3}>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Ear size={20} className="text-accent" />
                <Body className="font-weight-bold text-white">Hearing Assistance</Body>
              </Stack>
              <Body className="text-on-dark-muted">Assistive listening devices and sign language interpreters available.</Body>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={3}>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Accessibility size={20} className="text-warning" />
                <Body className="font-weight-bold text-white">Service Animals</Body>
              </Stack>
              <Body className="text-on-dark-muted">Service animals welcome. Relief areas located near main entrance.</Body>
            </Stack>
          </CardBody>
        </Card>
      </Grid>
      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4}>
            <H3 className="text-white">Need Assistance?</H3>
            <Body className="text-on-dark-muted">Contact our accessibility team for special accommodations or questions.</Body>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
