"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GvtewayAppLayout, GvtewayLoadingLayout, GvtewayEmptyLayout } from "@/components/app-layout";
import {
  H2,
  H3,
  Body,
  Button,
  Badge,
  Grid,
  Stack,
  Card,
  Kicker,
} from "@ghxstship/ui";
import { useConfirmationData } from "@/hooks/useConfirmation";

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  
  const {
    order,
    isLoading: loading,
  } = useConfirmationData(orderId);

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
    return <GvtewayLoadingLayout text="Loading order details..." />;
  }

  if (!order) {
    return (
      <GvtewayEmptyLayout
        title="Order Not Found"
        description="We couldn't find this order."
        action={{ label: "View All Orders", onClick: () => router.push("/orders") }}
      />
    );
  }

  return (
    <GvtewayAppLayout>
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
    </GvtewayAppLayout>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<GvtewayLoadingLayout text="Loading order details..." />}>
      <ConfirmationContent />
    </Suspense>
  );
}
