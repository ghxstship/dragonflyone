"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Search, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Body, Button, Card, Input, Grid, DetailPage, Section } from "@ghxstship/ui";

interface Product { id: string; name: string; artist: string; price: number; category: string; }
const DEMO: Product[] = [
  { id: "1", name: "Festival T-Shirt", artist: "Summer Fest", price: 35, category: "Apparel" },
  { id: "2", name: "Tour Poster", artist: "Jazz Night", price: 25, category: "Posters" },
];

export default function MerchPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data: products = [], isLoading, error, refetch } = useQuery<Product[]>({
    queryKey: ["merch"],
    queryFn: async () => { const r = await fetch("/api/merch"); if (!r.ok) return DEMO; const data = await r.json(); return data.products?.length ? data.products : DEMO; },
  });

  const categories: string[] = ["all", ...Array.from(new Set(products.map((p) => p.category)))];
  const filtered = products.filter((p: Product) => p.name.toLowerCase().includes(search.toLowerCase()) && (category === "all" || p.category === category));
  const formatCurrency = (a: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(a);

  const tabs = [{
    id: "merch", label: "Merch", icon: <List className="size-4" />,
    content: (
      <Section>
        <div className="flex gap-4 items-center mb-6">
          <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-dark-muted" /><Input placeholder="Search merch..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div>
          <div className="flex gap-2">{categories.map((cat) => <Button key={cat} variant={category === cat ? "solid" : "outline"} size="sm" onClick={() => setCategory(cat)}>{cat === "all" ? "All" : cat}</Button>)}</div>
        </div>
        <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4">
          {filtered.map((product: Product) => (
            <Card key={product.id} className="overflow-hidden cursor-pointer hover:border-primary transition-colors" onClick={() => router.push(`/merch/${product.id}`)}>
              <div className="h-40 bg-grey-800 flex items-center justify-center"><ShoppingBag className="size-8 text-on-dark-disabled" /></div>
              <div className="p-4">
                <Badge variant="outline" className="mb-2">{product.category}</Badge>
                <Body className="font-weight-bold">{product.name}</Body>
                <Body size="sm" className="text-on-dark-muted">{product.artist}</Body>
                <Body className="font-weight-bold mt-2">{formatCurrency(product.price)}</Body>
              </div>
            </Card>
          ))}
        </Grid>
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Shop", title: "Merchandise", description: "Official event merch" }} loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch} tabs={tabs} />;
}
