"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ConsumerNavigationPublic } from "@/components/navigation";
import {
  H2,
  H3,
  Body,
  Button,
  Badge,
  LoadingSpinner,
  Container,
  Grid,
  Stack,
  Card,
  Section,
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  Kicker,
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

const footerContent = (
  <Footer
    logo={<Display size="md">GVTEWAY</Display>}
    copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
  >
    <FooterColumn title="Orders">
      <FooterLink href="/orders">My Orders</FooterLink>
      <FooterLink href="/tickets">My Tickets</FooterLink>
    </FooterColumn>
    <FooterColumn title="Legal">
      <FooterLink href="/legal/privacy">Privacy</FooterLink>
      <FooterLink href="/legal/terms">Terms</FooterLink>
    </FooterColumn>
  </Footer>
);

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
      <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={footerContent}>
        <Section background="black" className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading order details..." />
        </Section>
      </PageLayout>
    );
  }

  if (!order) {
    return (
      <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={footerContent}>
        <Section background="black" className="min-h-screen py-16">
          <Container className="text-center">
            <Stack gap={4} className="items-center">
              <H2 size="lg" className="text-white">Order Not Found</H2>
              <Body className="text-on-dark-muted">We couldn&apos;t find this order.</Body>
              <Button variant="outlineInk" onClick={() => router.push("/orders")}>
                View All Orders
              </Button>
            </Stack>
          </Container>
        </Section>
      </PageLayout>
    );
  }

  return (
    <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={footerContent}>
      <Section background="black" className="relative min-h-screen overflow-hidden py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
          <Stack gap={8} className="mx-auto max-w-3xl">
            <Stack gap={4} className="text-center">
              <Body className="text-h3-md">✓</Body>
              <Kicker colorScheme="on-dark">Purchase Complete</Kicker>
              <H2 size="lg" className="text-white">Order Confirmed!</H2>
              <Body className="text-on-dark-muted">
                Thank you for your purchase. Your tickets are on the way!
              </Body>
            <Badge variant="solid" className="mx-auto">
              Order #{order.order_number}
            </Badge>
          </Stack>

          <Card inverted variant="elevated" className="p-6">
            <Stack gap={6}>
              <Stack gap={2}>
                <Kicker colorScheme="on-dark">Order Details</Kicker>
                <Stack gap={1} direction="horizontal" className="justify-between">
                  <Body className="text-on-dark-muted">Order Date</Body>
                  <Body className="text-white">{formatDate(order.created_at)}</Body>
                </Stack>
                <Stack gap={1} direction="horizontal" className="justify-between">
                  <Body className="text-on-dark-muted">Confirmation Email</Body>
                  <Body className="text-white">{order.billing_email}</Body>
                </Stack>
                <Stack gap={1} direction="horizontal" className="justify-between">
                  <Body className="text-on-dark-muted">Payment Method</Body>
                  <Body className="text-white">{order.payment_method}</Body>
                </Stack>
              </Stack>

              <Stack gap={4}>
                <Kicker colorScheme="on-dark">Tickets</Kicker>
                {order.items.map((item) => (
                  <Card key={item.id} inverted interactive className="p-4">
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <H3 className="text-white">{item.event_name}</H3>
                        <Body className="text-on-dark-muted">{item.venue_name}</Body>
                        <Body size="sm" className="text-on-dark-disabled">
                          {formatDate(item.event_date)} at {formatTime(item.event_date)}
                        </Body>
                      </Stack>
                      <Stack gap={1} direction="horizontal" className="justify-between">
                        <Stack gap={1}>
                          <Badge variant="outline">{item.ticket_type}</Badge>
                          <Body size="sm" className="text-on-dark-muted">
                            {item.quantity} × {formatCurrency(item.unit_price)}
                          </Body>
                        </Stack>
                        <Body className="font-mono text-white">{formatCurrency(item.total)}</Body>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>

              <Stack gap={2} className="border-t border-ink-800 pt-4">
                <Stack gap={1} direction="horizontal" className="justify-between">
                  <Body className="text-on-dark-muted">Subtotal</Body>
                  <Body className="font-mono text-white">{formatCurrency(order.subtotal)}</Body>
                </Stack>
                <Stack gap={1} direction="horizontal" className="justify-between">
                  <Body className="text-on-dark-muted">Service Fees</Body>
                  <Body className="font-mono text-white">{formatCurrency(order.fees)}</Body>
                </Stack>
                <Stack gap={1} direction="horizontal" className="justify-between">
                  <Body className="text-on-dark-muted">Taxes</Body>
                  <Body className="font-mono text-white">{formatCurrency(order.taxes)}</Body>
                </Stack>
                {order.discount > 0 && (
                  <Stack gap={1} direction="horizontal" className="justify-between">
                    <Body className="text-success">Discount</Body>
                    <Body className="font-mono text-success">-{formatCurrency(order.discount)}</Body>
                  </Stack>
                )}
                <Stack gap={1} direction="horizontal" className="justify-between border-t border-ink-800 pt-2">
                  <Body className="font-display text-white">Total Paid</Body>
                  <Body className="font-display text-white">{formatCurrency(order.total)}</Body>
                </Stack>
              </Stack>
            </Stack>
          </Card>

          <Card inverted className="p-6">
            <Stack gap={4}>
              <H3 className="text-white">What&apos;s Next?</H3>
              <Grid cols={3} gap={4}>
                <Stack gap={2}>
                  <Body className="text-h3-md">📧</Body>
                  <Body className="font-display text-white">Check Your Email</Body>
                  <Body size="sm" className="text-on-dark-muted">
                    Your tickets have been sent to {order.billing_email}
                  </Body>
                </Stack>
                <Stack gap={2}>
                  <Body className="text-h3-md">📱</Body>
                  <Body className="font-display text-white">Add to Wallet</Body>
                  <Body size="sm" className="text-on-dark-muted">
                    Save your tickets to Apple Wallet or Google Pay
                  </Body>
                </Stack>
                <Stack gap={2}>
                  <Body className="text-h3-md">🎫</Body>
                  <Body className="font-display text-white">View Tickets</Body>
                  <Body size="sm" className="text-on-dark-muted">
                    Access your tickets anytime from your account
                  </Body>
                </Stack>
              </Grid>
            </Stack>
          </Card>

          <Stack gap={4} direction="horizontal" className="justify-center">
            <Button variant="outlineInk" onClick={() => router.push("/tickets")}>
              View My Tickets
            </Button>
            <Button variant="ghost" onClick={() => router.push("/events")}>
              Browse More Events
            </Button>
          </Stack>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={footerContent}>
        <Section background="black" className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading order details..." />
        </Section>
      </PageLayout>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
