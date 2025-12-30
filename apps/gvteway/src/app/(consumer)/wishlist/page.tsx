"use client";

import { useRouter } from "next/navigation";
import { Heart, Trash2, Calendar, MapPin, List } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Body, Button, Card, Grid, DetailPage, Section, Link } from "@ghxstship/ui";

interface WishlistItem {
  id: string;
  name: string;
  date: string;
  venue: string;
  price: number;
}

const DEMO: WishlistItem[] = [
  { id: "1", name: "Summer Festival 2024", date: "2024-12-20", venue: "Central Park", price: 75 },
  { id: "2", name: "Jazz Night", date: "2024-12-22", venue: "Blue Note", price: 45 },
];

export default function WishlistPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading, error, refetch } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const r = await fetch("/api/wishlist");
      if (!r.ok) return DEMO;
      const data = await r.json();
      return data.items?.length ? data.items : DEMO;
    },
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      await fetch(`/api/wishlist/${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wishlist"] }),
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const formatCurrency = (a: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(a);

  const renderEmptyState = () => (
    <Card className="p-8 text-center">
      <Heart className="size-12 text-on-dark-disabled mx-auto mb-4" />
      <Body className="font-weight-medium text-h5-md mb-2">Your wishlist is empty</Body>
      <Body className="text-on-dark-muted mb-4">Save events you are interested in</Body>
      <Button variant="solid" onClick={() => router.push("/browse")}>
        Browse Events
      </Button>
    </Card>
  );

  const renderWishlistItems = () => (
    <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
      {items.map((item: WishlistItem) => (
        <Card key={item.id} className="p-4">
          <div className="flex items-start justify-between">
            <Link href={`/e/${item.id}`} className="block text-left">
              <Body className="font-weight-bold">{item.name}</Body>
              <div className="flex items-center gap-4 mt-2 text-on-dark-muted">
                <div className="flex items-center gap-1">
                  <Calendar className="size-4" />
                  <Body size="sm">{formatDate(item.date)}</Body>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="size-4" />
                  <Body size="sm">{item.venue}</Body>
                </div>
              </div>
              <Body className="font-weight-bold mt-2">From {formatCurrency(item.price)}</Body>
            </Link>
            <Button variant="ghost" size="sm" onClick={() => removeItem.mutate(item.id)}>
              <Trash2 className="size-4 text-error" />
            </Button>
          </div>
        </Card>
      ))}
    </Grid>
  );

  const tabs = [
    {
      id: "wishlist",
      label: "Wishlist",
      icon: <List className="size-4" />,
      content: (
        <Section>{items.length === 0 ? renderEmptyState() : renderWishlistItems()}</Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Saved",
        title: "Wishlist",
        description: `${items.length} saved events`,
      }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
