"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3 } from "@ghxstship/ui";
import { Truck, CheckCircle, Clock, Package } from "lucide-react";
import { atlvsDemoProductions } from "../../../../../data/atlvs";

export default function AdvancingFulfillmentPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return (
      <Stack gap={4}>
        <SectionHeader kicker="Fulfillment" title="Production Not Found" colorScheme="on-dark" />
      </Stack>
    );
  }

  const fulfillmentStats = { inTransit: 8, delivered: 45, confirmed: 42, pending: 5 };

  return (
    <Stack gap={8}>
      <SectionHeader
        kicker={production.name}
        title="Fulfillment"
        description="Track delivery and receipt of allocated items"
        colorScheme="on-dark"
      />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="In Transit" value={fulfillmentStats.inTransit.toString()} icon={<Truck size={20} />} inverted />
        <StatCard label="Delivered" value={fulfillmentStats.delivered.toString()} icon={<Package size={20} />} inverted />
        <StatCard label="Confirmed" value={fulfillmentStats.confirmed.toString()} icon={<CheckCircle size={20} />} inverted />
        <StatCard label="Pending" value={fulfillmentStats.pending.toString()} icon={<Clock size={20} />} inverted />
      </div>
      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4}>
            <H3 className="text-white">Delivery Tracking</H3>
            <Body className="text-on-dark-muted">All deliveries are on schedule.</Body>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
