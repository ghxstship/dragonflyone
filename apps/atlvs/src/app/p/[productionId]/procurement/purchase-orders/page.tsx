"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3, Button, Grid } from "@ghxstship/ui";
import { ShoppingCart, Clock, CheckCircle, Truck, Plus } from "lucide-react";
import { atlvsDemoProductions } from "../../../../../data/atlvs";

export default function ProcurementPurchaseOrdersPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return <Stack gap={4}><SectionHeader kicker="Purchase Orders" title="Production Not Found" colorScheme="on-dark" /></Stack>;
  }

  const stats = { draft: 3, pending: 8, approved: 42, fulfilled: 38 };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader kicker={production.name} title="Purchase Orders" description="Create and track purchase orders" colorScheme="on-dark" />
        <Button variant="solid" size="sm"><Plus size={16} className="mr-2" />New PO</Button>
      </Stack>
      <Grid cols={2} gap={4} className="lg:grid-cols-4">
        <StatCard label="Draft" value={stats.draft.toString()} icon={<ShoppingCart size={20} />} inverted />
        <StatCard label="Pending" value={stats.pending.toString()} icon={<Clock size={20} />} inverted />
        <StatCard label="Approved" value={stats.approved.toString()} icon={<CheckCircle size={20} />} inverted />
        <StatCard label="Fulfilled" value={stats.fulfilled.toString()} icon={<Truck size={20} />} inverted />
      </Grid>
      <Card variant="elevated" inverted><CardBody><Stack gap={4}><H3 className="text-white">Recent Purchase Orders</H3><Body className="text-on-dark-muted">Purchase order list will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
