"use client";

import { Navigation } from "../../components/navigation";
import {
  H1,
  H3,
  Body,
  Badge,
  Card,
  Container,
  Grid,
  Stack,
  Section,
} from "@ghxstship/ui";

const venues = [
  { id: "VEN-001", name: "Bayfront Park", city: "Miami, FL", capacity: 65000, type: "Outdoor", status: "Available" },
  { id: "VEN-002", name: "Hard Rock Stadium", city: "Miami Gardens, FL", capacity: 75540, type: "Stadium", status: "Booked" },
  { id: "VEN-003", name: "Mana Wynwood", city: "Miami, FL", capacity: 15000, type: "Indoor/Outdoor", status: "Available" },
];

export default function VenuesPage() {
  return (
    <Section className="relative min-h-screen bg-black text-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <H1>Venue Directory</H1>
          <Grid cols={3} gap={6}>
            {venues.map((venue) => (
              <Card key={venue.id} className="border-2 border-grey-800 p-6 bg-black">
                <Stack gap={4}>
                  <Stack gap={2}>
                    <H3 className="text-white">{venue.name}</H3>
                    <Body className="text-grey-400">{venue.city}</Body>
                  </Stack>
                  <Stack gap={2}>
                    <Stack gap={2} direction="horizontal" className="justify-between text-sm">
                      <Body className="text-grey-500">Capacity:</Body>
                      <Body className="font-mono text-white">{venue.capacity.toLocaleString()}</Body>
                    </Stack>
                    <Stack gap={2} direction="horizontal" className="justify-between text-sm">
                      <Body className="text-grey-500">Type:</Body>
                      <Badge variant="outline">{venue.type}</Badge>
                    </Stack>
                    <Stack gap={2} direction="horizontal" className="justify-between text-sm">
                      <Body className="text-grey-500">Status:</Body>
                      <Badge variant={venue.status === "Available" ? "solid" : "outline"}>{venue.status}</Badge>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
