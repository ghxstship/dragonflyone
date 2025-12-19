"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, H3, Grid, Spinner, EmptyState } from "@ghxstship/ui";
import { ShoppingBag, Shirt, Coffee, Gift } from "lucide-react";
import { useEvent } from "@/hooks/useEvents";

export default function ShopPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const { data: event, isLoading, error } = useEvent(eventId);

  if (isLoading) {
    return (
      <Stack gap={4} className="flex items-center justify-center py-20">
        <Spinner variant="grey" size="lg" text="Loading shop..." />
      </Stack>
    );
  }

  if (error || !event) {
    return <Stack gap={4}><EmptyState title="Event Not Found" description="Unable to load shop data" inverted /></Stack>;
  }

  return (
    <Stack gap={8}>
      <SectionHeader kicker={event.name} title="Shop" description="Merchandise and concessions" colorScheme="on-dark" />
      <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Shirt size={24} className="text-primary" />
              <Body className="font-weight-bold text-white">Merch</Body>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Coffee size={24} className="text-secondary" />
              <Body className="font-weight-bold text-white">Food & Drinks</Body>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <Gift size={24} className="text-accent" />
              <Body className="font-weight-bold text-white">VIP Upgrades</Body>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted>
          <CardBody>
            <Stack gap={3} className="items-center text-center">
              <ShoppingBag size={24} className="text-warning" />
              <Body className="font-weight-bold text-white">My Orders</Body>
            </Stack>
          </CardBody>
        </Card>
      </Grid>
      <Card variant="elevated" inverted><CardBody><Stack gap={4}><H3 className="text-white">Featured Items</H3><Body className="text-on-dark-muted">Shop items will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
