"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, H3, Grid, Box } from "@ghxstship/ui";
import { Car, Train, Footprints } from "lucide-react";
import { gvtewayDemoEvents } from "../../../../../data/gvteway";

export default function DirectionsPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const event = gvtewayDemoEvents.find((e) => e.id === eventId);

  if (!event) {
    return <Stack gap={4}><SectionHeader kicker="Directions" title="Event Not Found" colorScheme="on-dark" /></Stack>;
  }

  return (
    <Stack gap={8}>
      <SectionHeader kicker={event.name} title="Directions" description="Get directions to the venue" colorScheme="on-dark" />
      <Grid cols={3} gap={4}>
        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Car size={24} className="text-primary" />
              <Body className="font-weight-bold text-white">By Car</Body>
              <Body size="sm" className=" text-on-dark-muted">Driving directions and routes</Body>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Train size={24} className="text-secondary" />
              <Body className="font-weight-bold text-white">Public Transit</Body>
              <Body size="sm" className=" text-on-dark-muted">Bus and train options</Body>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Footprints size={24} className="text-accent" />
              <Body className="font-weight-bold text-white">Walking</Body>
              <Body size="sm" className=" text-on-dark-muted">Walking routes nearby</Body>
            </Stack>
          </CardBody>
        </Card>
      </Grid>
      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4}>
            <H3 className="text-white">Map</H3>
            <Box variant="bordered" className="flex h-64 items-center justify-center rounded bg-ink-800">
              <Body className="text-on-dark-muted">Directions map will be displayed here</Body>
            </Box>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
