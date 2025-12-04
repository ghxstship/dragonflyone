"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Body, H3, Grid } from "@ghxstship/ui";
import { ShoppingBag, Shirt, Coffee, Gift } from "lucide-react";
import { gvtewayDemoEvents } from "../../../../data/gvteway";

export default function ShopPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const event = gvtewayDemoEvents.find((e) => e.id === eventId);

  if (!event) {
    return <Stack gap={4}><SectionHeader kicker="Shop" title="Event Not Found" colorScheme="on-dark" /></Stack>;
  }

  return (
    <Stack gap={8}>
      <SectionHeader kicker={event.name} title="Shop" description="Merchandise and concessions" colorScheme="on-dark" />
      <Grid cols={4} gap={4}>
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
