"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@ghxstship/ui";
import { GvtewayAppLayout, GvtewayLoadingLayout } from "@/components/app-layout";
import { useMerch } from "../../hooks/useMerch";
import {
  H2,
  Body,
  Button,
  Badge,
  Select,
  EmptyState,
  Grid,
  Stack,
  Card,
  Kicker,
} from "@ghxstship/ui";
import type { MerchItem } from "../../hooks/useMerch";

// Demo data for unauthenticated users
const DEMO_MERCH: MerchItem[] = [
  {
    id: "demo-1",
    name: "Festival Tour T-Shirt",
    description: "Official tour merchandise",
    price: 35,
    category: "apparel",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "White"],
    stock: 150,
    images: [],
    status: "active",
  },
  {
    id: "demo-2",
    name: "Limited Edition Poster",
    description: "Signed artist poster",
    price: 25,
    category: "art",
    stock: 50,
    images: [],
    status: "active",
  },
  {
    id: "demo-3",
    name: "Festival Cap",
    description: "Embroidered logo cap",
    price: 28,
    category: "accessories",
    colors: ["Black", "Navy"],
    stock: 75,
    images: [],
    status: "active",
  },
];

export default function MerchPage() {
  const _router = useRouter();
  const { addNotification } = useNotifications();
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const { data: merchItems, isLoading, error, refetch: _refetch } = useMerch(
    filterCategory !== "all" ? { category: filterCategory } : undefined
  );

  // Use demo data when there's an error (e.g., unauthenticated)
  const effectiveMerch = error ? DEMO_MERCH : (merchItems || []);

  const sortedMerch = [...effectiveMerch].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return 0;
  });

  if (isLoading) {
    return <GvtewayLoadingLayout text="Loading merchandise..." />;
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Shop</Kicker>
              <H2 size="lg" className="text-white">Official Merchandise</H2>
              <Body className="text-on-dark-muted">
                Exclusive gear from your favorite events and festivals
              </Body>
            </Stack>

            <Stack gap={4} direction="horizontal">
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                inverted
              >
                <option value="all">All Categories</option>
                <option value="apparel">Apparel</option>
                <option value="accessories">Accessories</option>
                <option value="art">Art</option>
              </Select>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                inverted
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </Select>
            </Stack>

            {sortedMerch.length === 0 ? (
              <EmptyState
                title="No Merchandise Found"
                description="Check back soon for new items"
                inverted
              />
            ) : (
              <Grid cols={3} gap={6}>
                {sortedMerch.map((item) => (
                  <Card key={item.id} inverted interactive className="p-6">
                    <Stack gap={4}>
                      <Stack className="aspect-square rounded-card bg-ink-900" />
                      <Stack gap={2} direction="horizontal" className="items-start justify-between">
                        <Body className="font-display text-white">{item.name}</Body>
                        <Badge variant="outline">{item.category}</Badge>
                      </Stack>
                      <Body className="font-display text-white">${item.price}</Body>
                      <Body size="sm" className="text-on-dark-muted">{item.stock} in stock</Body>
                      <Button 
                        variant="solid" 
                        inverted 
                        fullWidth 
                        onClick={() => { addNotification({ type: 'success', title: 'Added', message: `${item.name} added to cart` }); }}
                      >
                        Add to Cart
                      </Button>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            )}
          </Stack>
    </GvtewayAppLayout>
  );
}
