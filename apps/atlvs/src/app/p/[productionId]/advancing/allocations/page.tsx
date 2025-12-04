"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3, Grid } from "@ghxstship/ui";
import { Package, Warehouse, Key, ShoppingCart } from "lucide-react";
import { atlvsDemoProductions } from "../../../../../data/atlvs";

export default function AdvancingAllocationsPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return (
      <Stack gap={4}>
        <SectionHeader kicker="Allocations" title="Production Not Found" colorScheme="on-dark" />
      </Stack>
    );
  }

  const allocationStats = { fromInventory: 45, fromRentals: 23, fromProcurement: 12, total: 80 };

  return (
    <Stack gap={8}>
      <SectionHeader
        kicker={production.name}
        title="Allocations"
        description="Assign resources from inventory, rentals, or procurement"
        colorScheme="on-dark"
      />
      <Grid cols={2} gap={4} className="lg:grid-cols-4">
        <StatCard label="From Inventory" value={allocationStats.fromInventory.toString()} icon={<Warehouse size={20} />} inverted />
        <StatCard label="From Rentals" value={allocationStats.fromRentals.toString()} icon={<Key size={20} />} inverted />
        <StatCard label="From Procurement" value={allocationStats.fromProcurement.toString()} icon={<ShoppingCart size={20} />} inverted />
        <StatCard label="Total Allocated" value={allocationStats.total.toString()} icon={<Package size={20} />} inverted />
      </Grid>
      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4}>
            <H3 className="text-white">Pending Allocations</H3>
            <Body className="text-on-dark-muted">No pending allocations at this time.</Body>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
