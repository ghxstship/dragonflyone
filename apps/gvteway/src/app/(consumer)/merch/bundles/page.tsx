"use client";

import { Package, ShoppingCart, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Body, Button, Card, Grid, DetailPage, Section, Box, Stack } from "@ghxstship/ui";

interface Bundle { id: string; name: string; items: string[]; price: number; savings: number; }
const DEMO: Bundle[] = [
  { id: "1", name: "Festival Starter Pack", items: ["T-Shirt", "Cap", "Poster"], price: 75, savings: 20 },
  { id: "2", name: "VIP Bundle", items: ["Hoodie", "T-Shirt", "Tote Bag", "Poster"], price: 120, savings: 35 },
];

export default function MerchBundlesPage() {

  const { data: bundles = [], isLoading, error, refetch } = useQuery({
    queryKey: ["merch-bundles"],
    queryFn: async () => { const r = await fetch("/api/merch/bundles"); if (!r.ok) return DEMO; return (await r.json()).bundles?.length ? (await r.json()).bundles : DEMO; },
  });

  const formatCurrency = (a: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(a);

  const tabs = [{
    id: "bundles", label: "Bundles", icon: <List className="size-4" />,
    content: (
      <Section>
        <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2">
          {bundles.map((bundle: Bundle) => (
            <Card key={bundle.id} className="p-6">
              <Box className="flex items-start justify-between mb-4">
                <Box className="flex items-center gap-3"><Package className="size-8 text-primary" /><Body className="font-weight-bold">{bundle.name}</Body></Box>
                <Badge variant="success">Save {formatCurrency(bundle.savings)}</Badge>
              </Box>
              <Stack gap={2} className="mb-4">{bundle.items.map((item, i) => <Body key={i} size="sm" className="text-on-dark-muted">• {item}</Body>)}</Stack>
              <Box className="flex items-center justify-between">
                <Body className="font-weight-bold">{formatCurrency(bundle.price)}</Body>
                <Button variant="solid" icon={<ShoppingCart className="size-4" />} iconPosition="left">Add Bundle</Button>
              </Box>
            </Card>
          ))}
        </Grid>
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Shop", title: "Merch Bundles", description: "Save with bundle deals" }} backButton={{ label: "Merch", href: "/merch" }} loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch} tabs={tabs} />;
}
