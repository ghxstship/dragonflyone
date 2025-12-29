"use client";

import { ShoppingBag, Play, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Body, Button, Card, Grid, DetailPage, Section, SectionHeader } from "@ghxstship/ui";

interface ShoppableItem { id: string; title: string; price: number; type: string; }
const DEMO: ShoppableItem[] = [
  { id: "1", title: "Festival Highlights", price: 25, type: "Video" },
  { id: "2", title: "Exclusive Interview", price: 15, type: "Video" },
];

export default function ShoppablePage() {

  const { data: items = [], isLoading, error, refetch } = useQuery({
    queryKey: ["shoppable"],
    queryFn: async () => { const r = await fetch("/api/shop/shoppable"); if (!r.ok) return DEMO; return (await r.json()).items?.length ? (await r.json()).items : DEMO; },
  });

  const formatCurrency = (a: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(a);

  const tabs = [{
    id: "shoppable", label: "Shoppable", icon: <List className="size-4" />,
    content: (
      <Section>
        <SectionHeader title="Shoppable Content" description="Purchase exclusive content" />
        <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3 mt-4">
          {items.map((item: ShoppableItem) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="h-40 bg-grey-800 flex items-center justify-center relative">
                <Play className="size-12 text-grey-600" />
                <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded-badge">{item.type}</div>
              </div>
              <div className="p-4">
                <Body className="font-weight-bold">{item.title}</Body>
                <div className="flex items-center justify-between mt-3">
                  <Body className="font-weight-bold">{formatCurrency(item.price)}</Body>
                  <Button variant="solid" size="sm" icon={<ShoppingBag className="size-4" />} iconPosition="left">Buy</Button>
                </div>
              </div>
            </Card>
          ))}
        </Grid>
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Shop", title: "Shoppable Content", description: "Exclusive videos and content" }} loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch} tabs={tabs} />;
}
