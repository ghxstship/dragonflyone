"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, List } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Body, Button, Card, Grid, DetailPage, Section, SectionHeader, Box} from "@ghxstship/ui";

interface CartItem { id: string; name: string; quantity: number; price: number; type: string; }
const DEMO_CART: CartItem[] = [
  { id: "1", name: "Summer Festival - GA", quantity: 2, price: 75, type: "Ticket" },
  { id: "2", name: "Festival T-Shirt", quantity: 1, price: 35, type: "Merch" },
];

export default function CartPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading, error, refetch } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await fetch("/api/cart");
      if (!response.ok) return DEMO_CART;
      return (await response.json()).items?.length ? (await response.json()).items : DEMO_CART;
    },
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const response = await fetch(`/api/cart/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quantity }) });
      if (!response.ok) throw new Error("Failed to update");
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/cart/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to remove");
      return response.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
  });

  const formatCurrency = (a: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(a);
  const subtotal = items.reduce((sum: number, i: CartItem) => sum + i.price * i.quantity, 0);
  const fees = subtotal * 0.1;
  const total = subtotal + fees;

  const tabs = [{
    id: "cart", label: "Cart", icon: <List className="size-4" />,
    content: (
      <Section>
        {items.length === 0 ? (
          <Card className="p-8 text-center">
            <ShoppingCart className="size-12 text-on-dark-disabled mx-auto mb-4" />
            <Body className="font-weight-medium mb-2">Your cart is empty</Body>
            <Body className="text-on-dark-muted mb-4">Browse events to find tickets</Body>
            <Button variant="solid" onClick={() => router.push("/browse")}>Browse Events</Button>
          </Card>
        ) : (
          <Grid cols={3} gap={6} className="grid-cols-1 lg:grid-cols-3">
            <Box className="lg:col-span-2 space-y-4">
              {items.map((item: CartItem) => (
                <Card key={item.id} className="p-4">
                  <Box className="flex items-center justify-between">
                    <Box>
                      <Body className="font-weight-bold">{item.name}</Body>
                      <Body size="sm" className="text-on-dark-muted">{item.type}</Body>
                    </Box>
                    <Box className="flex items-center gap-4">
                      <Box className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => updateQuantity.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}><Minus className="size-4" /></Button>
                        <Body className="w-8 text-center">{item.quantity}</Body>
                        <Button variant="ghost" size="sm" onClick={() => updateQuantity.mutate({ id: item.id, quantity: item.quantity + 1 })}><Plus className="size-4" /></Button>
                      </Box>
                      <Body className="font-weight-bold w-20 text-right">{formatCurrency(item.price * item.quantity)}</Body>
                      <Button variant="ghost" size="sm" onClick={() => removeItem.mutate(item.id)}><Trash2 className="size-4 text-error" /></Button>
                    </Box>
                  </Box>
                </Card>
              ))}
            </Box>
            <Card className="p-6 h-fit">
              <SectionHeader title="Order Summary" />
              <Box className="space-y-3 mt-4">
                <Box className="flex justify-between"><Body className="text-on-dark-muted">Subtotal</Body><Body>{formatCurrency(subtotal)}</Body></Box>
                <Box className="flex justify-between"><Body className="text-on-dark-muted">Service Fees</Body><Body>{formatCurrency(fees)}</Body></Box>
                <Box className="border-t border-grey-800 pt-3 flex justify-between"><Body className="font-weight-bold">Total</Body><Body className="font-weight-bold">{formatCurrency(total)}</Body></Box>
              </Box>
              <Button variant="solid" className="w-full mt-6" icon={<CreditCard className="size-4" />} iconPosition="left" onClick={() => router.push("/checkout")}>Checkout</Button>
            </Card>
          </Grid>
        )}
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Shopping", title: "Cart", description: `${items.length} items` }} loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch} tabs={tabs} />;
}
