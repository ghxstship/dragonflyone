"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GvtewayAppLayout, GvtewayLoadingLayout } from "@/components/app-layout";
import {
  H2,
  H3,
  Body,
  Button,
  Badge,
  EmptyState,
  Grid,
  Stack,
  Card,
  Input,
  Label,
  Kicker,
  useNotifications,
} from "@ghxstship/ui";
import { Trash2, Minus, Plus, Tag, CreditCard, Clock } from "lucide-react";
import { useCartData } from "@/hooks/useCart";

export default function CartPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const {
    items,
    summary,
    isLoading: loading,
    updateQuantity,
    removeItem,
    applyPromo,
  } = useCartData();

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [discount, setDiscount] = useState(0);

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
      await updateQuantity({ itemId, quantity });
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: "Failed to update quantity" });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeItem(itemId);
      addNotification({ type: "success", title: "Removed", message: "Item removed from cart" });
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: "Failed to remove item" });
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const data = await applyPromo(promoCode);
      setDiscount(data.discount || 0);
      setPromoApplied(true);
      addNotification({ type: "success", title: "Success", message: "Promo code applied!" });
    } catch (err) {
      addNotification({ type: "error", title: "Invalid Code", message: "Promo code not valid" });
    }
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  if (loading) {
    return <GvtewayLoadingLayout text="Loading cart..." />;
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Checkout</Kicker>
              <H2 size="lg" className="text-white">Your Cart</H2>
              <Body className="text-on-dark-muted">
                {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
              </Body>
            </Stack>

            {items.length === 0 ? (
              <EmptyState
                title="Your Cart is Empty"
                description="Browse events and add tickets to your cart"
                action={{ label: "Browse Events", onClick: () => router.push("/events") }}
                inverted
              />
            ) : (
              <Grid cols={3} gap={8}>
                {/* Cart Items */}
                <Stack gap={4} className="col-span-2">
                  {items.map((item) => (
                    <Card key={item.id} inverted className="p-6">
                      <Stack gap={4}>
                        <Stack gap={2} direction="horizontal" className="justify-between">
                          <Stack gap={1}>
                            <H3 className="text-white">{item.event_name}</H3>
                            <Body className="text-on-dark-muted">{item.venue_name}</Body>
                            <Label size="xs" className="text-on-dark-disabled">{formatDate(item.event_date)}</Label>
                          </Stack>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            icon={<Trash2 className="size-4" />}
                          />
                        </Stack>

                        <Stack gap={4} direction="horizontal" className="items-center justify-between">
                          <Stack gap={1}>
                            <Badge variant="outline">{item.ticket_type_name}</Badge>
                            <Label size="xs" className="text-on-dark-muted">
                              {formatCurrency(item.unit_price)} each
                            </Label>
                          </Stack>

                          <Stack gap={2} direction="horizontal" className="items-center">
                            <Button 
                              variant="outlineInk" 
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              icon={<Minus className="size-4" />}
                            />
                            <Body className="w-8 text-center font-mono text-white">{item.quantity}</Body>
                            <Button 
                              variant="outlineInk" 
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              icon={<Plus className="size-4" />}
                            />
                          </Stack>

                          <Body className="font-display text-white">
                            {formatCurrency(item.subtotal)}
                          </Body>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Stack>

                {/* Order Summary */}
                <Stack gap={6}>
                  <Card inverted variant="elevated" className="p-6">
                    <Stack gap={4}>
                      <H3 className="text-white">Order Summary</H3>
                      
                      <Stack gap={3}>
                        <Stack gap={1} direction="horizontal" className="justify-between">
                          <Body className="text-on-dark-muted">Subtotal ({summary?.item_count} items)</Body>
                          <Body className="font-mono text-white">{formatCurrency(summary?.subtotal || 0)}</Body>
                        </Stack>
                        <Stack gap={1} direction="horizontal" className="justify-between">
                          <Body className="text-on-dark-muted">Service Fees</Body>
                          <Body className="font-mono text-white">{formatCurrency(summary?.service_fees || 0)}</Body>
                        </Stack>
                        <Stack gap={1} direction="horizontal" className="justify-between">
                          <Body className="text-on-dark-muted">Taxes</Body>
                          <Body className="font-mono text-white">{formatCurrency(summary?.taxes || 0)}</Body>
                        </Stack>
                        {discount > 0 && (
                          <Stack gap={1} direction="horizontal" className="justify-between">
                            <Body className="text-success">Discount</Body>
                            <Body className="font-mono text-success">-{formatCurrency(discount)}</Body>
                          </Stack>
                        )}
                      </Stack>

                      <Stack gap={1} direction="horizontal" className="justify-between border-t border-ink-800 pt-4">
                        <Body className="font-display text-white">Total</Body>
                        <Body className="font-display text-white">
                          {formatCurrency((summary?.total || 0) - discount)}
                        </Body>
                      </Stack>
                    </Stack>
                  </Card>

                  <Card inverted className="p-6">
                    <Stack gap={4}>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Tag className="size-4 text-on-dark-muted" />
                        <Label size="xs" className="text-on-dark-muted">Promo Code</Label>
                      </Stack>
                      <Stack gap={2} direction="horizontal">
                        <Input
                          placeholder="Enter code"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          disabled={promoApplied}
                          inverted
                          className="flex-1"
                        />
                        <Button 
                          variant="outlineInk" 
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
                    fullWidth
                    inverted
                    onClick={handleCheckout}
                    icon={<CreditCard className="size-5" />}
                    iconPosition="left"
                  >
                    Proceed to Checkout
                  </Button>

                  <Stack direction="horizontal" gap={2} className="items-center justify-center">
                    <Clock className="size-4 text-on-dark-disabled" />
                    <Label size="xs" className="text-on-dark-disabled">
                      Tickets are held for 10 minutes during checkout
                    </Label>
                  </Stack>
                </Stack>
              </Grid>
            )}
          </Stack>
    </GvtewayAppLayout>
  );
}
