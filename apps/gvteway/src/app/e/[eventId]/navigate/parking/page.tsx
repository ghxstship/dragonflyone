"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body} from "@ghxstship/ui";
import { DollarSign, MapPin } from "lucide-react";
import { gvtewayDemoEvents } from "../../../../../data/gvteway";

export default function ParkingPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const event = gvtewayDemoEvents.find((e) => e.id === eventId);

  if (!event) {
    return <Stack gap={4}><SectionHeader kicker="Parking" title="Event Not Found" colorScheme="on-dark" /></Stack>;
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
                      <Body className="text-body-sm text-on-dark-muted">{lot.distance}</Body>
                    </Stack>
                    <Stack direction="horizontal" gap={1} className="items-center">
                      <DollarSign size={14} className="text-on-dark-muted" />
                      <Body className="text-body-sm text-on-dark-muted">{lot.price}</Body>
                    </Stack>
                  </Stack>
                </Stack>
                <Body className="text-body-sm text-success">{lot.spots}</Body>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}
