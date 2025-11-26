"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  H1,
  H2,
  Body,
  Button,
  Badge,
  LoadingSpinner,
  Container,
  Grid,
  Stack,
  Card,
  Section,
} from "@ghxstship/ui";

interface OrderDetails {
  id: string;
  order_number: string;
  status: string;
  created_at: string;
  items: OrderItem[];
  subtotal: number;
  fees: number;
  taxes: number;
  discount: number;
  total: number;
  payment_method: string;
  billing_email: string;
}

interface OrderItem {
  id: string;
  event_name: string;
  event_date: string;
  venue_name: string;
  ticket_type: string;
  quantity: number;
  unit_price: number;
  total: number;
}

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);
      if (!response.ok) throw new Error("Failed to fetch order");
      
      const data = await response.json();
      setOrder(data.order);
    } catch (err) {
      console.error("Failed to fetch order:", err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId, fetchOrder]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading order details..." />
        </Container>
      </Section>
    );
  }

  if (!order) {
    return (
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="py-16 text-center">
          <Stack gap={4} className="items-center">
            <H1>Order Not Found</H1>
            <Body className="text-grey-400">We couldn&apos;t find this order.</Body>
            <Button variant="outline" onClick={() => router.push("/orders")}>
              View All Orders
            </Button>
          </Stack>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="relative min-h-screen bg-black text-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8} className="max-w-3xl mx-auto">
          <Stack gap={4} className="text-center">
            <Body className="text-4xl">✓</Body>
            <H1>Order Confirmed!</H1>
            <Body className="text-grey-400">
              Thank you for your purchase. Your tickets are on the way!
            </Body>
            <Badge variant="solid" className="mx-auto">
              Order #{order.order_number}
            </Badge>
          </Stack>

          <Card className="p-6 bg-black border-grey-800">
            <Stack gap={6}>
              <Stack gap={2}>
                <Body className="text-grey-400 text-sm uppercase tracking-wider">Order Details</Body>
                <Stack gap={1} direction="horizontal" className="justify-between">
                  <Body className="text-grey-400">Order Date</Body>
                  <Body>{formatDate(order.created_at)}</Body>
                </Stack>
                <Stack gap={1} direction="horizontal" className="justify-between">
                  <Body className="text-grey-400">Confirmation Email</Body>
                  <Body>{order.billing_email}</Body>
                </Stack>
                <Stack gap={1} direction="horizontal" className="justify-between">
                  <Body className="text-grey-400">Payment Method</Body>
                  <Body>{order.payment_method}</Body>
                </Stack>
              </Stack>

              <Stack gap={4}>
                <Body className="text-grey-400 text-sm uppercase tracking-wider">Tickets</Body>
                {order.items.map((item) => (
                  <Card key={item.id} className="p-4 bg-grey-900 border-grey-700">
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <H2 className="text-lg">{item.event_name}</H2>
                        <Body className="text-grey-400">{item.venue_name}</Body>
                        <Body className="text-grey-500 text-sm">
                          {formatDate(item.event_date)} at {formatTime(item.event_date)}
                        </Body>
                      </Stack>
                      <Stack gap={1} direction="horizontal" className="justify-between">
                        <Stack gap={1}>
                          <Badge variant="outline">{item.ticket_type}</Badge>
                          <Body className="text-grey-400 text-sm">
                            {item.quantity} × {formatCurrency(item.unit_price)}
                          </Body>
                        </Stack>
                        <Body className="font-mono">{formatCurrency(item.total)}</Body>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>

              <Stack gap={2} className="border-t border-grey-800 pt-4">
                <Stack gap={1} direction="horizontal" className="justify-between">
                  <Body className="text-grey-400">Subtotal</Body>
                  <Body className="font-mono">{formatCurrency(order.subtotal)}</Body>
                </Stack>
                <Stack gap={1} direction="horizontal" className="justify-between">
                  <Body className="text-grey-400">Service Fees</Body>
                  <Body className="font-mono">{formatCurrency(order.fees)}</Body>
                </Stack>
                <Stack gap={1} direction="horizontal" className="justify-between">
                  <Body className="text-grey-400">Taxes</Body>
                  <Body className="font-mono">{formatCurrency(order.taxes)}</Body>
                </Stack>
                {order.discount > 0 && (
                  <Stack gap={1} direction="horizontal" className="justify-between">
                    <Body className="text-success-400">Discount</Body>
                    <Body className="font-mono text-success-400">-{formatCurrency(order.discount)}</Body>
                  </Stack>
                )}
                <Stack gap={1} direction="horizontal" className="justify-between border-t border-grey-800 pt-2">
                  <Body className="font-bold">Total Paid</Body>
                  <Body className="font-mono text-xl font-bold">{formatCurrency(order.total)}</Body>
                </Stack>
              </Stack>
            </Stack>
          </Card>

          <Card className="p-6 bg-grey-900 border-grey-700">
            <Stack gap={4}>
              <H2>What&apos;s Next?</H2>
              <Grid cols={3} gap={4}>
                <Stack gap={2}>
                  <Body className="text-2xl">📧</Body>
                  <Body className="font-medium">Check Your Email</Body>
                  <Body className="text-grey-400 text-sm">
                    Your tickets have been sent to {order.billing_email}
                  </Body>
                </Stack>
                <Stack gap={2}>
                  <Body className="text-2xl">📱</Body>
                  <Body className="font-medium">Add to Wallet</Body>
                  <Body className="text-grey-400 text-sm">
                    Save your tickets to Apple Wallet or Google Pay
                  </Body>
                </Stack>
                <Stack gap={2}>
                  <Body className="text-2xl">🎫</Body>
                  <Body className="font-medium">View Tickets</Body>
                  <Body className="text-grey-400 text-sm">
                    Access your tickets anytime from your account
                  </Body>
                </Stack>
              </Grid>
            </Stack>
          </Card>

          <Stack gap={4} direction="horizontal" className="justify-center">
            <Button variant="outlineWhite" onClick={() => router.push("/tickets")}>
              View My Tickets
            </Button>
            <Button variant="ghost" onClick={() => router.push("/events")}>
              Browse More Events
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <Section className="relative min-h-screen bg-black text-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading order details..." />
        </Container>
      </Section>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
