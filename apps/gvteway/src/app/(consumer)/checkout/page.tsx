"use client";

/**
 * Checkout Page
 * Complete purchase securely
 * Uses DetailPage template for consistent layout
 */

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Badge,
  Body,
  Button,
  Card,
  Grid,
  Input,
  DetailPage,
  Section,
  SectionHeader,
  useToast,
Box} from "@ghxstship/ui";
import { CreditCard, Lock, Check, ShoppingCart, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { log } from "@ghxstship/config";

interface CartItem {
  id: string;
  event_title: string;
  ticket_type_name: string;
  price: number;
  qty: number;
  ticket_type_id: string;
  event_id: string;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState<"cart" | "payment" | "confirm">("cart");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    street: "",
    city: "",
    state: "",
    zip: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "cardName": return value.trim().length < 2 ? "Cardholder name is required" : "";
      case "cardNumber": return !/^\d{13,19}$/.test(value.replace(/\s/g, "")) ? "Enter a valid card number" : "";
      case "expiry": return !/^(0[1-9]|1[0-2])\/\d{2}$/.test(value) ? "Enter MM/YY format" : "";
      case "cvv": return !/^\d{3,4}$/.test(value) ? "Enter 3-4 digit CVV" : "";
      case "street": return value.trim().length < 3 ? "Street address is required" : "";
      case "city": return value.trim().length < 2 ? "City is required" : "";
      case "state": return value.trim().length < 2 ? "State is required" : "";
      case "zip": return !/^\d{5}(-\d{4})?$/.test(value) ? "Enter valid ZIP code" : "";
      default: return "";
    }
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleFieldBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, formData[name as keyof typeof formData]) }));
  };

  const isFormValid = () => {
    const requiredFields = ["cardName", "cardNumber", "expiry", "cvv", "street", "city", "state", "zip"];
    return requiredFields.every((field) => {
      const value = formData[field as keyof typeof formData];
      return value && !validateField(field, value);
    });
  };

  const loadCartItems = useCallback(async () => {
    try {
      const eventId = searchParams.get("event");
      const ticketId = searchParams.get("ticket");
      const qty = parseInt(searchParams.get("qty") || "1");

      if (eventId && ticketId) {
        const { data: event } = await supabase.from("events").select("id, title").eq("id", eventId).single();
        const { data: ticket } = await supabase.from("ticket_types").select("id, name, price").eq("id", ticketId).single();

        if (event && ticket) {
          setCartItems([{ id: ticketId, event_title: event.title, ticket_type_name: ticket.name, price: ticket.price, qty, ticket_type_id: ticket.id, event_id: event.id }]);
        }
      }
    } catch (error) {
      log.error("Error loading cart:", error instanceof Error ? error : undefined);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadCartItems();
  }, [loadCartItems]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const fees = subtotal * 0.12;
  const total = subtotal + fees;

  async function handlePayment() {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/signin?redirect=/checkout"); return; }

      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cartItems, userId: user.id, paymentMethod: formData }),
      });

      const data = await response.json();
      if (data.success) { setOrderId(data.orderId); setStep("confirm"); }
      else toast.error("Payment Failed", data.error || "Payment could not be processed");
    } catch (error) {
      log.error("Payment error:", error instanceof Error ? error : undefined);
      toast.error("Payment Error", "Payment processing failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  }

  const stepLabels = ["Review", "Payment", "Confirm"];

  const tabs = [
    {
      id: "checkout",
      label: "Checkout",
      icon: <ShoppingCart className="size-4" />,
      content: (
        <Section>
          <Card className="p-4 mb-6">
            <Box className="flex justify-between">
              {stepLabels.map((label, idx) => {
                const stepKey = ["cart", "payment", "confirm"][idx];
                const isActive = step === stepKey;
                const isPast = (step === "payment" && idx === 0) || (step === "confirm" && idx < 2);
                return (
                  <Box key={label} className="flex-1 flex items-center">
                    <Box className="flex flex-col items-center">
                      <Badge variant={isActive || isPast ? "success" : "outline"}>{idx + 1}</Badge>
                      <Body size="sm" className={isActive ? "font-weight-medium" : "text-on-dark-muted"}>{label}</Body>
                    </Box>
                    {idx < 2 && <ChevronRight className={`size-4 mx-2 ${isPast ? "text-success" : "text-on-dark-disabled"}`} />}
                  </Box>
                );
              })}
            </Box>
          </Card>

          {step === "cart" && (
            <Grid cols={3} gap={6} className="grid-cols-1 lg:grid-cols-3">
              <Card className="lg:col-span-2 p-6">
                <SectionHeader title="Order Summary" />
                {cartItems.length > 0 ? (
                  <Box className="space-y-4 mt-4">
                    {cartItems.map((item) => (
                      <Box key={item.id} className="flex justify-between border-b border-grey-700 pb-4">
                        <Box>
                          <Body className="font-weight-medium">{item.event_title}</Body>
                          <Body size="sm" className="text-on-dark-muted">{item.ticket_type_name}</Body>
                          <Body size="sm" className="text-on-dark-muted">Qty: {item.qty}</Body>
                        </Box>
                        <Body className="font-weight-medium">${(item.price * item.qty).toFixed(2)}</Body>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Body className="text-on-dark-muted mt-4">Your cart is empty</Body>
                )}
              </Card>
              <Box className="space-y-4">
                <Card className="p-6">
                  <SectionHeader title="Total" />
                  <Box className="space-y-3 mt-4">
                    <Box className="flex justify-between"><Body className="text-on-dark-muted">Subtotal</Body><Body>${subtotal.toFixed(2)}</Body></Box>
                    <Box className="flex justify-between"><Body className="text-on-dark-muted">Service Fees</Body><Body>${fees.toFixed(2)}</Body></Box>
                    <Box className="flex justify-between border-t border-grey-700 pt-3"><Body className="font-weight-medium">Total</Body><Body className="font-weight-medium">${total.toFixed(2)}</Body></Box>
                  </Box>
                </Card>
                <Button variant="solid" className="w-full" onClick={() => setStep("payment")} icon={<ChevronRight className="size-4" />} iconPosition="right">Proceed to Payment</Button>
              </Box>
            </Grid>
          )}

          {step === "payment" && (
            <Grid cols={3} gap={6} className="grid-cols-1 lg:grid-cols-3">
              <Card className="lg:col-span-2 p-6">
                <SectionHeader title="Payment Information" />
                <Box className="space-y-4 mt-4">
                  <Box><Body size="sm" className="text-on-dark-muted mb-1">Cardholder Name *</Body><Input placeholder="John Smith" value={formData.cardName} onChange={(e) => handleFieldChange("cardName", e.target.value)} onBlur={() => handleFieldBlur("cardName")} />{touched.cardName && errors.cardName && <Body size="sm" className="text-error">{errors.cardName}</Body>}</Box>
                  <Box><Body size="sm" className="text-on-dark-muted mb-1">Card Number *</Body><Input placeholder="4242 4242 4242 4242" value={formData.cardNumber} onChange={(e) => handleFieldChange("cardNumber", e.target.value)} onBlur={() => handleFieldBlur("cardNumber")} />{touched.cardNumber && errors.cardNumber && <Body size="sm" className="text-error">{errors.cardNumber}</Body>}</Box>
                  <Grid cols={2} gap={4} className="grid-cols-1 lg:grid-cols-2">
                    <Box><Body size="sm" className="text-on-dark-muted mb-1">Expiry Date *</Body><Input placeholder="MM/YY" value={formData.expiry} onChange={(e) => handleFieldChange("expiry", e.target.value)} onBlur={() => handleFieldBlur("expiry")} />{touched.expiry && errors.expiry && <Body size="sm" className="text-error">{errors.expiry}</Body>}</Box>
                    <Box><Body size="sm" className="text-on-dark-muted mb-1">CVV *</Body><Input placeholder="123" type="password" value={formData.cvv} onChange={(e) => handleFieldChange("cvv", e.target.value)} onBlur={() => handleFieldBlur("cvv")} />{touched.cvv && errors.cvv && <Body size="sm" className="text-error">{errors.cvv}</Body>}</Box>
                  </Grid>
                  <Box className="border-t border-grey-700 pt-4"><SectionHeader title="Billing Address" /></Box>
                  <Box><Body size="sm" className="text-on-dark-muted mb-1">Street Address *</Body><Input placeholder="123 Main St" value={formData.street} onChange={(e) => handleFieldChange("street", e.target.value)} onBlur={() => handleFieldBlur("street")} />{touched.street && errors.street && <Body size="sm" className="text-error">{errors.street}</Body>}</Box>
                  <Grid cols={2} gap={4} className="grid-cols-1 lg:grid-cols-2">
                    <Box><Body size="sm" className="text-on-dark-muted mb-1">City *</Body><Input placeholder="New York" value={formData.city} onChange={(e) => handleFieldChange("city", e.target.value)} onBlur={() => handleFieldBlur("city")} />{touched.city && errors.city && <Body size="sm" className="text-error">{errors.city}</Body>}</Box>
                    <Box><Body size="sm" className="text-on-dark-muted mb-1">State *</Body><Input placeholder="NY" value={formData.state} onChange={(e) => handleFieldChange("state", e.target.value)} onBlur={() => handleFieldBlur("state")} />{touched.state && errors.state && <Body size="sm" className="text-error">{errors.state}</Body>}</Box>
                  </Grid>
                  <Box><Body size="sm" className="text-on-dark-muted mb-1">ZIP Code *</Body><Input placeholder="10001" value={formData.zip} onChange={(e) => handleFieldChange("zip", e.target.value)} onBlur={() => handleFieldBlur("zip")} />{touched.zip && errors.zip && <Body size="sm" className="text-error">{errors.zip}</Body>}</Box>
                </Box>
              </Card>
              <Box className="space-y-4">
                <Card className="p-6"><SectionHeader title="Total" /><Box className="flex justify-between mt-4"><Body className="font-weight-medium">Total</Body><Body className="font-weight-medium">${total.toFixed(2)}</Body></Box></Card>
                <Card className="p-4"><Box className="flex items-center gap-2"><Lock className="size-4 text-on-dark-muted" /><Body size="sm" className="text-on-dark-muted">Secure Checkout</Body></Box><Body size="sm" className="text-on-dark-muted mt-2">Your payment information is encrypted and secure</Body></Card>
                <Button variant="solid" className="w-full" onClick={handlePayment} disabled={processing || !isFormValid()} icon={<CreditCard className="size-4" />} iconPosition="left">{processing ? "Processing..." : "Complete Purchase"}</Button>
              </Box>
            </Grid>
          )}

          {step === "confirm" && (
            <Card className="p-12 text-center">
              <Box className="flex flex-col items-center gap-6">
                <Badge variant="success" className="size-16 rounded-avatar flex items-center justify-center"><Check className="size-8" /></Badge>
                <Box><Body className="font-weight-bold">Order Confirmed!</Body><Body className="text-on-dark-muted">Order #{orderId || "PROCESSING"}</Body></Box>
                <Card className="p-6"><Body className="text-on-dark-muted mb-2">Tickets have been sent to:</Body><Body className="font-weight-medium">user@example.com</Body></Card>
                <Box className="flex gap-4"><Button variant="outline" onClick={() => router.push("/tickets")}>View Tickets</Button><Button variant="solid" onClick={() => router.push("/events")}>Browse More Events</Button></Box>
              </Box>
            </Card>
          )}
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Secure Checkout", title: "Checkout", description: "Complete your purchase securely" }}
      loading={loading}
      tabs={tabs}
    />
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<Box className="flex items-center justify-center min-h-screen"><Body>Loading checkout...</Body></Box>}>
      <CheckoutContent />
    </Suspense>
  );
}
