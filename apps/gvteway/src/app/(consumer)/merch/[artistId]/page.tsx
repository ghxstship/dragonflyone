"use client";

import { useParams } from "next/navigation";
import { ShoppingBag, ShoppingCart, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Body, Button, Card, Grid, DetailPage, Section } from "@ghxstship/ui";

interface Product { id: string; name: string; price: number; description: string; sizes: string[]; }
const DEMO: Product[] = [
  { id: "1", name: "Tour T-Shirt", price: 35, description: "Official tour merchandise", sizes: ["S", "M", "L", "XL"] },
  { id: "2", name: "Hoodie", price: 65, description: "Premium quality hoodie", sizes: ["S", "M", "L", "XL"] },
];

export default function ArtistMerchPage() {
  const params = useParams();
  const artistId = params.artistId as string;

  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ["artist-merch", artistId],
    queryFn: async () => { const r = await fetch(`/api/merch/artist/${artistId}`); if (!r.ok) return DEMO; return (await r.json()).products?.length ? (await r.json()).products : DEMO; },
  });

  const formatCurrency = (a: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(a);

  const tabs = [{
    id: "merch", label: "Merch", icon: <List className="size-4" />,
    content: (
      <Section>
        <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-3">
          {products.map((product: Product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="h-48 bg-grey-800 flex items-center justify-center"><ShoppingBag className="size-12 text-on-dark-disabled" /></div>
              <div className="p-4">
                <Body className="font-weight-bold">{product.name}</Body>
                <Body size="sm" className="text-on-dark-muted mt-1">{product.description}</Body>
                <div className="flex gap-2 mt-3">{product.sizes.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}</div>
                <div className="flex items-center justify-between mt-4">
                  <Body className="font-weight-bold">{formatCurrency(product.price)}</Body>
                  <Button variant="solid" icon={<ShoppingCart className="size-4" />} iconPosition="left">Add to Cart</Button>
                </div>
              </div>
            </Card>
          ))}
        </Grid>
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Artist", title: "Merchandise", description: "Official artist merch" }} backButton={{ label: "Merch", href: "/merch" }} loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch} tabs={tabs} />;
}
