"use client";

/**
 * Payment Page
 * Public payment page for invoices
 * Uses DetailPage template for consistent layout
 */

import { useParams } from "next/navigation";
import { CreditCard, CheckCircle, Lock} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Body, Button, Card, Form, Input, DetailPage, Section, SectionHeader, useNotifications} from "@ghxstship/ui";

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  dueDate: string;
  status: "pending" | "paid";
}

const DEMO_INVOICE: Invoice = {
  id: "1",
  number: "INV-001",
  client: "Acme Productions",
  amount: 5000,
  dueDate: "2024-12-31",
  status: "pending",
};

export default function PaymentPage() {
  const params = useParams();
  const { addNotification } = useNotifications();
  const token = params.token as string;
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Cardholder name is required";
    if (!cardNumber.trim()) newErrors.cardNumber = "Card number is required";
    else if (cardNumber.replace(/\s/g, "").length < 13) newErrors.cardNumber = "Invalid card number";
    if (!expiry.trim()) newErrors.expiry = "Expiry date is required";
    else if (!/^\d{2}\/\d{2}$/.test(expiry)) newErrors.expiry = "Use MM/YY format";
    if (!cvc.trim()) newErrors.cvc = "CVC is required";
    else if (cvc.length < 3) newErrors.cvc = "Invalid CVC";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { data: invoice = DEMO_INVOICE, isLoading, error, refetch } = useQuery({
    queryKey: ["payment", token],
    queryFn: async () => {
      const response = await fetch(`/api/pay/${token}`);
      if (!response.ok) return DEMO_INVOICE;
      const data = await response.json();
      return data.invoice || DEMO_INVOICE;
    },
  });

  const processPayment = useMutation({
    mutationFn: async (paymentData: { cardNumber: string; expiry: string; cvc: string; name: string }) => {
      const response = await fetch(`/api/pay/${token}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Payment failed");
      }
      return response.json();
    },
    onSuccess: () => {
      addNotification({ type: "success", title: "Payment Successful", message: "Your payment has been processed" });
      refetch();
    },
    onError: (err: Error) => {
      addNotification({ type: "error", title: "Payment Failed", message: err.message });
    },
  });

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  const handleChange = (field: string, value: string) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    switch (field) {
      case "name": setName(value); break;
      case "cardNumber": setCardNumber(value); break;
      case "expiry": setExpiry(value); break;
      case "cvc": setCvc(value); break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    processPayment.mutate({ cardNumber, expiry, cvc, name });
  };

  const tabs = [
    {
      id: "payment",
      label: "Payment",
      icon: <CreditCard className="size-4" />,
      content: invoice.status === "paid" ? (
        <Section>
          <Card className="p-8 text-center border-success">
            <CheckCircle className="size-16 text-success mx-auto mb-4" />
            <Body className="font-weight-bold font-weight-bold mb-2">Payment Complete</Body>
            <Body className="text-grey-400">Thank you for your payment of {formatCurrency(invoice.amount)}</Body>
          </Card>
        </Section>
      ) : (
        <Section>
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <Body className="text-grey-400">Invoice {invoice.number}</Body>
                <Body className="font-weight-bold font-weight-medium">{invoice.client}</Body>
              </div>
              <div className="text-right">
                <Body className="text-grey-400">Amount Due</Body>
                <Body className="font-weight-bold font-weight-bold">{formatCurrency(invoice.amount)}</Body>
              </div>
            </div>
          </Card>

          <SectionHeader title="Payment Details" />
          <Form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <Body size="sm" className="mb-1">Cardholder Name *</Body>
              <Input placeholder="John Doe" value={name} onChange={(e) => handleChange("name", e.target.value)} error={!!errors.name} />
              {errors.name && <Body size="sm" className="text-error mt-1">{errors.name}</Body>}
            </div>
            <div>
              <Body size="sm" className="mb-1">Card Number *</Body>
              <Input placeholder="4242 4242 4242 4242" value={cardNumber} onChange={(e) => handleChange("cardNumber", e.target.value)} error={!!errors.cardNumber} />
              {errors.cardNumber && <Body size="sm" className="text-error mt-1">{errors.cardNumber}</Body>}
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Body size="sm" className="mb-1">Expiry *</Body>
                <Input placeholder="MM/YY" value={expiry} onChange={(e) => handleChange("expiry", e.target.value)} error={!!errors.expiry} />
                {errors.expiry && <Body size="sm" className="text-error mt-1">{errors.expiry}</Body>}
              </div>
              <div className="flex-1">
                <Body size="sm" className="mb-1">CVC *</Body>
                <Input placeholder="123" value={cvc} onChange={(e) => handleChange("cvc", e.target.value)} error={!!errors.cvc} />
                {errors.cvc && <Body size="sm" className="text-error mt-1">{errors.cvc}</Body>}
              </div>
            </div>
            <Button type="submit" variant="solid" className="w-full" disabled={processPayment.isPending}>
              {processPayment.isPending ? "Processing..." : `Pay ${formatCurrency(invoice.amount)}`}
            </Button>
          </Form>

          <div className="flex items-center justify-center gap-2 mt-6 text-grey-400">
            <Lock className="size-4" />
            <Body size="sm">Secured by Stripe</Body>
          </div>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Payment", title: `Invoice ${invoice.number}`, description: "Secure payment portal" }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
