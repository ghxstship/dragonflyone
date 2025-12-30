"use client";

import { useState } from "react";
import { CreditCard, Search, ShoppingCart, Plus, Minus, List } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Body, Button, Card, Input, Grid, DetailPage, Section, SectionHeader, Box} from "@ghxstship/ui";

interface Product { id: string; name: string; price: number; category: string; }
const DEMO: Product[] = [
  { id: "1", name: "GA Ticket", price: 75, category: "Tickets" },
  { id: "2", name: "VIP Ticket", price: 150, category: "Tickets" },
  { id: "3", name: "T-Shirt", price: 35, category: "Merch" },
];

export default function POSPage() {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<Record<string, number>>({});

  const { data: products = [], isLoading, error, refetch } = useQuery({
    queryKey: ["pos-products"],
    queryFn: async () => { const r = await fetch("/api/admin/pos/products"); if (!r.ok) return DEMO; return (await r.json()).products?.length ? (await r.json()).products : DEMO; },
  });

  const processPayment = useMutation({
    mutationFn: async (data: { items: { productId: string; quantity: number }[]; total: number }) => {
      const r = await fetch("/api/admin/pos/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!r.ok) throw new Error("Payment failed");
      return r.json();
    },
    onSuccess: () => setCart({}),
  });

  const filtered = products.filter((p: Product) => p.name.toLowerCase().includes(search.toLowerCase()));
  const formatCurrency = (a: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(a);
  const updateCart = (id: string, delta: number) => setCart((prev) => { const qty = Math.max(0, (prev[id] || 0) + delta); if (qty === 0) { const { [id]: _, ...rest } = prev; return rest; } return { ...prev, [id]: qty }; });
  const total = Object.entries(cart).reduce((sum, [id, qty]) => sum + (products.find((p: Product) => p.id === id)?.price || 0) * qty, 0);
  const cartItems = Object.entries(cart).filter(([, qty]) => qty > 0);

  const handleCheckout = () => {
    const items = cartItems.map(([productId, quantity]) => ({ productId, quantity }));
    processPayment.mutate({ items, total });
  };

  const tabs = [{
    id: "pos", label: "POS", icon: <List className="size-4" />,
    content: (
      <Section>
        <Grid cols={3} gap={6} className="grid-cols-1 lg:grid-cols-3">
          <Box className="lg:col-span-2">
            <Box className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-dark-muted" /><Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></Box>
            <Grid cols={3} gap={4} className="grid-cols-2 md:grid-cols-3">
              {filtered.map((product: Product) => (
                <Card key={product.id} className="p-4 cursor-pointer hover:border-primary transition-colors" onClick={() => updateCart(product.id, 1)}>
                  <Body className="font-weight-bold">{product.name}</Body>
                  <Body size="sm" className="text-on-dark-muted">{product.category}</Body>
                  <Body className="font-weight-bold mt-2">{formatCurrency(product.price)}</Body>
                </Card>
              ))}
            </Grid>
          </Box>
          <Card className="p-6 h-fit">
            <SectionHeader title="Cart" />
            {cartItems.length === 0 ? (
              <Box className="text-center py-8"><ShoppingCart className="size-8 text-on-dark-disabled mx-auto mb-2" /><Body className="text-on-dark-muted">Cart is empty</Body></Box>
            ) : (
              <Box className="space-y-3 mt-4">
                {cartItems.map(([id, qty]) => {
                  const product = products.find((p: Product) => p.id === id);
                  if (!product) return null;
                  return (
                    <Box key={id} className="flex items-center justify-between">
                      <Box><Body className="font-weight-medium">{product.name}</Body><Body size="sm" className="text-on-dark-muted">{formatCurrency(product.price)} each</Body></Box>
                      <Box className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => updateCart(id, -1)}><Minus className="size-4" /></Button>
                        <Body className="w-6 text-center">{qty}</Body>
                        <Button variant="ghost" size="sm" onClick={() => updateCart(id, 1)}><Plus className="size-4" /></Button>
                      </Box>
                    </Box>
                  );
                })}
                <Box className="border-t border-grey-800 pt-3 flex justify-between"><Body className="font-weight-bold">Total</Body><Body className="font-weight-bold">{formatCurrency(total)}</Body></Box>
              </Box>
            )}
            <Button variant="solid" className="w-full mt-4" icon={<CreditCard className="size-4" />} iconPosition="left" onClick={handleCheckout} disabled={cartItems.length === 0 || processPayment.isPending}>{processPayment.isPending ? "Processing..." : "Charge"}</Button>
          </Card>
        </Grid>
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Admin", title: "Point of Sale", description: "Process in-person sales" }} loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch} tabs={tabs} />;
}
