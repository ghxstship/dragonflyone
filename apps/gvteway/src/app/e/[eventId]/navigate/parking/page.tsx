"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, Spinner, EmptyState } from "@ghxstship/ui";
import { DollarSign, MapPin } from "lucide-react";
import { useEvent } from "@/hooks/useEvents";

export default function ParkingPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const { data: event, isLoading, error } = useEvent(eventId);

  if (isLoading) {
    return <Stack gap={4} className="flex items-center justify-center py-20"><Spinner variant="grey" size="lg" text="Loading..." /></Stack>;
  }

  if (error || !event) {
    return <Stack gap={4}><EmptyState title="Event Not Found" description="Unable to load event data" inverted /></Stack>;
  }

  const parkingOptions = [
    { name: "Main Lot", distance: "0.1 mi", price: "$25", spots: "Available" },
    { name: "Overflow Lot", distance: "0.3 mi", price: "$15", spots: "Available" },
    { name: "Street Parking", distance: "0.2 mi", price: "Metered", spots: "Limited" },
  ];

  return (
    <Stack gap={8}>
      <SectionHeader kicker={event.name} title="Parking" description="Find parking near the venue" colorScheme="on-dark" />
      <Stack gap={4}>
        {parkingOptions.map((lot, index) => (
          <Card key={index} variant="elevated" inverted>
            <CardBody>
              <Stack direction="horizontal" className="items-center justify-between">
                <Stack gap={1}>
                  <Body className="font-weight-bold text-white">{lot.name}</Body>
                  <Stack direction="horizontal" gap={4}>
                    <Stack direction="horizontal" gap={1} className="items-center">
                      <MapPin size={14} className="text-on-dark-muted" />
                      <Body size="sm" className=" text-on-dark-muted">{lot.distance}</Body>
                    </Stack>
                    <Stack direction="horizontal" gap={1} className="items-center">
                      <DollarSign size={14} className="text-on-dark-muted" />
                      <Body size="sm" className=" text-on-dark-muted">{lot.price}</Body>
                    </Stack>
                  </Stack>
                </Stack>
                <Body size="sm" className=" text-success">{lot.spots}</Body>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}
