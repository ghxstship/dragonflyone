"use client";

import { CompvssAppLayout } from "../../components/app-layout";
import {
  H3,
  Body,
  Badge,
  Card,
  Container,
  Grid,
  Stack,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";

const venues = [
  { id: "VEN-001", name: "Bayfront Park", city: "Miami, FL", capacity: 65000, type: "Outdoor", status: "Available" },
  { id: "VEN-002", name: "Hard Rock Stadium", city: "Miami Gardens, FL", capacity: 75540, type: "Stadium", status: "Booked" },
  { id: "VEN-003", name: "Mana Wynwood", city: "Miami, FL", capacity: 15000, type: "Indoor/Outdoor", status: "Available" },
];

export default function VenuesPage() {
  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Venue Directory"
        subtitle="Browse and manage venue information for productions"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Venues' }]}
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>
            <Grid cols={3} gap={6}>
              {venues.map((venue) => (
                <Card key={venue.id}>
                  <Stack gap={4}>
                    <Stack gap={2}>
                      <H3>{venue.name}</H3>
                      <Body className="text-body-sm">{venue.city}</Body>
                    </Stack>
                    <Stack gap={2}>
                      <Stack gap={2} direction="horizontal" className="justify-between text-body-sm">
                        <Body className="text-body-sm">Capacity:</Body>
                        <Body className="font-mono">{venue.capacity.toLocaleString()}</Body>
                      </Stack>
                      <Stack gap={2} direction="horizontal" className="justify-between text-body-sm">
                        <Body className="text-body-sm">Type:</Body>
                        <Badge variant="outline">{venue.type}</Badge>
                      </Stack>
                      <Stack gap={2} direction="horizontal" className="justify-between text-body-sm">
                        <Body className="text-body-sm">Status:</Body>
                        <Badge variant={venue.status === "Available" ? "solid" : "outline"}>{venue.status}</Badge>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        </Container>
      </MainContent>
    </CompvssAppLayout>
  );
}
