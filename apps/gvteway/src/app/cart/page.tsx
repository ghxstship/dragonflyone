"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ConsumerNavigationPublic } from "../../components/navigation";
import {
  H1,
  H2,
  Body,
  Button,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  LoadingSpinner,
  EmptyState,
  Container,
  Grid,
  Stack,
  Card,
  Section,
  Input,
  Field,
  Label,
  useNotifications,
} from "@ghxstship/ui";

interface CartItem {
  id: string;
  event_id: string;
  event_name: string;
  event_date: string;
  venue_name: string;
  ticket_type_id: string;
  ticket_type_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  fees: number;
  total: number;
}

interface CartSummary {
  item_count: number;
  subtotal: number;
  service_fees: number;
  taxes: number;
  total: number;
}

export default function CartPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [items, setItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/cart");
      if (!response.ok) throw new Error("Failed to fetch cart");
      
      const data = await response.json();
      setItems(data.items || []);
      setSummary(data.summary || null);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      if (response.ok) {
        fetchCart();
      }
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: "Failed to update quantity" });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        addNotification({ type: "success", title: "Removed", message: "Item removed from cart" });
        fetchCart();
      }
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: "Failed to remove item" });
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const response = await fetch("/api/cart/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode }),
      });
      if (response.ok) {
        const data = await response.json();
        setDiscount(data.discount || 0);
        setPromoApplied(true);
        addNotification({ type: "success", title: "Success", message: "Promo code applied!" });
        fetchCart();
      } else {
        addNotification({ type: "error", title: "Invalid Code", message: "Promo code not valid" });
      }
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: "Failed to apply promo code" });
    }
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (loading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <ConsumerNavigationPublic />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading cart..." />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="relative min-h-screen bg-black text-white">
      <ConsumerNavigationPublic />
      <Container className="py-16">
        <Stack gap={8}>
          <H1>Your Cart</H1>

          {items.length === 0 ? (
            <EmptyState
              title="Your Cart is Empty"
              description="Browse events and add tickets to your cart"
              action={{ label: "Browse Events", onClick: () => router.push("/events") }}
            />
          ) : (
            <Grid cols={3} gap={8}>
              <Stack gap={6} className="col-span-2">
                {items.map((item) => (
                  <Card key={item.id} className="p-6 bg-black border-grey-800">
                    <Stack gap={4}>
                      <Stack gap={2} direction="horizontal" className="justify-between">
                        <Stack gap={1}>
                          <H2 className="text-h6-md">{item.event_name}</H2>
                          <Body className="text-grey-400">{item.venue_name}</Body>
                          <Body className="text-grey-500 text-body-sm">{formatDate(item.event_date)}</Body>
                        </Stack>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-grey-400 hover:text-error-400"
                        >
                          Remove
                        </Button>
                      </Stack>

                      <Stack gap={2} direction="horizontal" className="justify-between items-center">
                        <Stack gap={1}>
                          <Badge variant="outline">{item.ticket_type_name}</Badge>
                          <Body className="text-grey-400 text-body-sm">
                            {formatCurrency(item.unit_price)} each
                          </Body>
                        </Stack>

                        <Stack gap={2} direction="horizontal" className="items-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <Body className="w-8 text-center font-mono">{item.quantity}</Body>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </Stack>

                        <Body className="font-mono text-body-md">
                          {formatCurrency(item.subtotal)}
                        </Body>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>

              <Stack gap={6}>
                <Card className="p-6 bg-black border-grey-800">
                  <Stack gap={4}>
                    <H2>Order Summary</H2>
                    
                    <Stack gap={2}>
                      <Stack gap={1} direction="horizontal" className="justify-between">
                        <Body className="text-grey-400">Subtotal ({summary?.item_count} items)</Body>
                        <Body className="font-mono">{formatCurrency(summary?.subtotal || 0)}</Body>
                      </Stack>
                      <Stack gap={1} direction="horizontal" className="justify-between">
                        <Body className="text-grey-400">Service Fees</Body>
                        <Body className="font-mono">{formatCurrency(summary?.service_fees || 0)}</Body>
                      </Stack>
                      <Stack gap={1} direction="horizontal" className="justify-between">
                        <Body className="text-grey-400">Taxes</Body>
                        <Body className="font-mono">{formatCurrency(summary?.taxes || 0)}</Body>
                      </Stack>
                      {discount > 0 && (
                        <Stack gap={1} direction="horizontal" className="justify-between">
                          <Body className="text-success-400">Discount</Body>
                          <Body className="font-mono text-success-400">-{formatCurrency(discount)}</Body>
                        </Stack>
                      )}
                    </Stack>

                    <Stack gap={1} direction="horizontal" className="justify-between border-t border-grey-800 pt-4">
                      <Body className="font-bold">Total</Body>
                      <Body className="font-mono text-h6-md font-bold">
                        {formatCurrency((summary?.total || 0) - discount)}
                      </Body>
                    </Stack>
                  </Stack>
                </Card>

                <Card className="p-6 bg-black border-grey-800">
                  <Stack gap={4}>
                    <Body className="text-grey-400 text-body-sm uppercase tracking-widest">Promo Code</Body>
                    <Stack gap={2} direction="horizontal">
                      <Field className="flex-1">
                        <Input
                          placeholder="Enter code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          disabled={promoApplied}
                          className="bg-black text-white border-grey-700"
                        />
                      </Field>
                      <Button 
                        variant="outline" 
                        onClick={handleApplyPromo}
                        disabled={promoApplied}
                      >
                        {promoApplied ? "Applied" : "Apply"}
                      </Button>
                    </Stack>
                  </Stack>
                </Card>

                <Button 
                  variant="solid" 
                  size="lg" 
                  className="w-full"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </Button>

                <Body className="text-grey-500 text-body-sm text-center">
                  Tickets are held for 10 minutes during checkout
                </Body>
              </Stack>
            </Grid>
          )}
        </Stack>
      </Container>
    </Section>
  );
}
