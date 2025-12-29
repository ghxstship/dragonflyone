"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gift, CreditCard, List } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Body, Button, Card, Input, Textarea, Grid, DetailPage, Section, SectionHeader } from "@ghxstship/ui";

const AMOUNTS = [25, 50, 100, 250];

export default function GiftCardsPage() {
  const router = useRouter();
  const [amount, setAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [message, setMessage] = useState("");

  const purchaseGiftCard = useMutation({
    mutationFn: async (data: { amount: number; recipientEmail: string; message: string }) => {
      const r = await fetch("/api/gift-cards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!r.ok) throw new Error("Failed to purchase");
      return r.json();
    },
    onSuccess: () => router.push("/confirmation"),
  });

  const formatCurrency = (a: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(a);
  const selectedAmount = customAmount ? parseInt(customAmount) : amount;

  const tabs = [{
    id: "gift-cards", label: "Gift Cards", icon: <List className="size-4" />,
    content: (
      <Section>
        <Grid cols={2} gap={6} className="grid-cols-1 lg:grid-cols-2">
          <Card className="p-6">
            <SectionHeader title="Select Amount" />
            <div className="flex gap-2 mt-4 flex-wrap">
              {AMOUNTS.map((a) => <Button key={a} variant={amount === a && !customAmount ? "solid" : "outline"} onClick={() => { setAmount(a); setCustomAmount(""); }}>{formatCurrency(a)}</Button>)}
            </div>
            <div className="mt-4"><Body size="sm" className="mb-1">Custom Amount</Body><Input type="number" min="10" max="500" placeholder="Enter amount" value={customAmount} onChange={(e) => setCustomAmount(e.target.value)} /></div>
            <div className="mt-6"><Body size="sm" className="mb-1">Recipient Email</Body><Input type="email" placeholder="friend@example.com" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} /></div>
            <div className="mt-4"><Body size="sm" className="mb-1">Personal Message (optional)</Body><Textarea rows={3} placeholder="Add a personal message..." value={message} onChange={(e) => setMessage(e.target.value)} /></div>
          </Card>
          <Card className="p-6 h-fit">
            <div className="text-center mb-6"><Gift className="size-16 text-primary mx-auto mb-4" /><Body className="font-weight-bold">GVTEWAY Gift Card</Body><Body className="text-grey-400 mt-2">The perfect gift for any event lover</Body></div>
            <div className="border-t border-grey-800 pt-6">
              <div className="flex justify-between mb-4"><Body className="text-grey-400">Amount</Body><Body className="font-weight-bold">{formatCurrency(selectedAmount || 0)}</Body></div>
              <Button variant="solid" className="w-full" icon={<CreditCard className="size-4" />} iconPosition="left" onClick={() => purchaseGiftCard.mutate({ amount: selectedAmount, recipientEmail, message })} disabled={!selectedAmount || !recipientEmail || purchaseGiftCard.isPending}>{purchaseGiftCard.isPending ? "Processing..." : "Purchase Gift Card"}</Button>
            </div>
          </Card>
        </Grid>
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Shop", title: "Gift Cards", description: "Give the gift of experiences" }} tabs={tabs} />;
}
