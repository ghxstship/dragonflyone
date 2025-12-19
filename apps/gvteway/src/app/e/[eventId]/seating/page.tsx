"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, Box, Spinner } from "@ghxstship/ui";
import { Grid, MapPin } from "lucide-react";
import { useEvent } from "@/hooks/useEvents";

export default function EventSeatingPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const { data: event, isLoading } = useEvent(eventId);

  if (isLoading) {
    return (
      <Stack gap={4} className="flex items-center justify-center py-20">
        <Spinner variant="grey" size="lg" text="Loading seating..." />
      </Stack>
    );
  }

  const sections = [
    { id: "1", name: "Floor - General", available: 200, total: 500, price: 75 },
    { id: "2", name: "Floor - VIP", available: 30, total: 100, price: 150 },
    { id: "3", name: "Balcony Left", available: 50, total: 150, price: 85 },
    { id: "4", name: "Balcony Right", available: 45, total: 150, price: 85 },
    { id: "5", name: "Premium Box", available: 5, total: 20, price: 250 },
  ];

  return (
    <Stack gap={8}>
      <SectionHeader
        kicker={event?.name || "Event"}
        title="Seating"
        description="View available seats and sections"
        colorScheme="on-dark"
      />

      {/* Placeholder for seating map */}
      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4} className="items-center justify-center py-12">
            <Box className="flex size-24 items-center justify-center rounded bg-ink-800">
              <Grid size={48} className="text-on-dark-muted" />
            </Box>
            <Body className="text-on-dark-muted">Interactive seating map</Body>
          </Stack>
        </CardBody>
      </Card>

      <Stack gap={4}>
        <Body className="font-weight-bold text-white">Available Sections</Body>
        {sections.map((section) => (
          <Card key={section.id} variant="elevated" inverted>
            <CardBody>
              <Stack direction="horizontal" gap={4} className="items-center justify-between">
                <Stack direction="horizontal" gap={3} className="items-center">
                  <MapPin size={20} className="text-primary" />
                  <Stack gap={1}>
                    <Body className="font-weight-medium text-white">{section.name}</Body>
                    <Body size="sm" className=" text-on-dark-muted">{section.available} of {section.total} available</Body>
                  </Stack>
                </Stack>
                <Body className="font-weight-bold text-white">${section.price}</Body>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}
