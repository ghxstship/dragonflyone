"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Grid, Body, Box, H3 } from "@ghxstship/ui";
import { ShoppingCart, FileSearch, FileQuestion, Receipt, DollarSign } from "lucide-react";
import { atlvsDemoProductions } from "../../../../data/atlvs";

export default function ProductionProcurementPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return <Stack gap={4}><SectionHeader kicker="Procurement" title="Production Not Found" colorScheme="on-dark" /></Stack>;
  }

  const stats = { rfps: 5, quotes: 12, purchaseOrders: 28, totalSpend: 125000 };

  return (
    <Stack gap={8}>
      <SectionHeader kicker={production.name} title="Procurement" description="Manage RFPs, quotes, and purchase orders" colorScheme="on-dark" />
      <Grid cols={2} gap={4} className="lg:grid-cols-4">
        <StatCard label="Active RFPs" value={stats.rfps.toString()} icon={<FileSearch size={20} />} inverted />
        <StatCard label="Pending Quotes" value={stats.quotes.toString()} icon={<FileQuestion size={20} />} inverted />
        <StatCard label="Purchase Orders" value={stats.purchaseOrders.toString()} icon={<Receipt size={20} />} inverted />
        <StatCard label="Total Spend" value={`$${(stats.totalSpend / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} inverted />
      </Grid>
      <Grid cols={3} gap={4}>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/procurement/rfps`)}>
          <CardBody><Stack gap={3} className="items-center text-center"><Box className="flex size-12 items-center justify-center rounded bg-ink-800"><FileSearch size={24} className="text-primary" /></Box><Body className="font-weight-bold text-white">RFPs</Body></Stack></CardBody>
        </Card>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/procurement/quotes`)}>
          <CardBody><Stack gap={3} className="items-center text-center"><Box className="flex size-12 items-center justify-center rounded bg-ink-800"><FileQuestion size={24} className="text-secondary" /></Box><Body className="font-weight-bold text-white">Quotes</Body></Stack></CardBody>
        </Card>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/procurement/purchase-orders`)}>
          <CardBody><Stack gap={3} className="items-center text-center"><Box className="flex size-12 items-center justify-center rounded bg-ink-800"><ShoppingCart size={24} className="text-accent" /></Box><Body className="font-weight-bold text-white">Purchase Orders</Body></Stack></CardBody>
        </Card>
      </Grid>
      <Card variant="elevated" inverted><CardBody><Stack gap={4}><H3 className="text-white">Recent Activity</H3><Body className="text-on-dark-muted">Procurement activity will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
