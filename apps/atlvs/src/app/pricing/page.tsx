"use client";

/**
 * Pricing Page
 * Subscription plans and pricing
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, List, HelpCircle } from "lucide-react";
import {
  Badge,
  Body,
  Button,
  Card,
  Grid,
  Stack,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: { monthly: number; annual: number };
  features: string[];
  highlighted: boolean;
  cta: string;
}

const PLANS: Plan[] = [
  { id: "starter", name: "Starter", description: "For small teams getting started", price: { monthly: 29, annual: 24 }, features: ["Up to 5 team members", "10 active projects", "Basic reporting", "Email support", "1GB storage"], highlighted: false, cta: "Start Free Trial" },
  { id: "professional", name: "Professional", description: "For growing production teams", price: { monthly: 79, annual: 66 }, features: ["Up to 25 team members", "Unlimited projects", "Advanced reporting", "Priority support", "25GB storage", "API access", "Custom integrations"], highlighted: true, cta: "Start Free Trial" },
  { id: "enterprise", name: "Enterprise", description: "For large organizations", price: { monthly: 0, annual: 0 }, features: ["Unlimited team members", "Unlimited projects", "Custom reporting", "Dedicated support", "Unlimited storage", "Full API access", "SSO & SAML", "Custom contracts", "SLA guarantee"], highlighted: false, cta: "Contact Sales" },
];

const FAQS = [
  { q: "Can I change plans later?", a: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards, ACH transfers, and wire transfers for enterprise accounts." },
  { q: "Is there a free trial?", a: "Yes! All plans include a 14-day free trial with full access to all features." },
  { q: "What happens when my trial ends?", a: "You'll be prompted to choose a plan. If you don't, your account will be downgraded to a limited free tier." },
];

export default function PricingPage() {
  const router = useRouter();
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");

  const tabs = [
    {
      id: "plans",
      label: "Plans",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <div className="flex justify-center mb-8">
            <div className="bg-grey-800 p-1 rounded-card flex">
              <Button variant={billing === "monthly" ? "solid" : "ghost"} size="sm" onClick={() => setBilling("monthly")}>Monthly</Button>
              <Button variant={billing === "annual" ? "solid" : "ghost"} size="sm" onClick={() => setBilling("annual")}>Annual <Badge variant="success" className="ml-2">Save 20%</Badge></Button>
            </div>
          </div>

          <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-3">
            {PLANS.map((plan) => (
              <Card key={plan.id} className={`p-6 ${plan.highlighted ? "border-primary ring-2 ring-primary/20" : ""}`}>
                {plan.highlighted && <Badge variant="warning" className="mb-4">Most Popular</Badge>}
                <Body className="font-weight-bold text-h5-md">{plan.name}</Body>
                <Body size="sm" className="text-grey-400 mb-4">{plan.description}</Body>
                <div className="mb-6">
                  {plan.price.monthly === 0 ? (
                    <Body className="font-weight-bold text-h2-md">Custom</Body>
                  ) : (
                    <>
                      <Body className="font-weight-bold text-h2-md">${billing === "monthly" ? plan.price.monthly : plan.price.annual}</Body>
                      <Body size="sm" className="text-grey-500">/user/month</Body>
                    </>
                  )}
                </div>
                <Button variant={plan.highlighted ? "solid" : "outline"} className="w-full mb-6" onClick={() => router.push(plan.id === "enterprise" ? "/contact" : "/auth/signup")}>
                  {plan.cta}
                </Button>
                <Stack gap={3}>
                  {plan.features.map((feature, idx) => (
                    <Stack key={idx} direction="horizontal" gap={2} className="items-center">
                      <Check className="size-4 text-success" />
                      <Body size="sm">{feature}</Body>
                    </Stack>
                  ))}
                </Stack>
              </Card>
            ))}
          </Grid>
        </Section>
      ),
    },
    {
      id: "faq",
      label: "FAQ",
      icon: <HelpCircle className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Frequently Asked Questions" description="Common questions about our pricing" />
          <div className="space-y-4 mt-6 max-w-2xl mx-auto">
            {FAQS.map((faq, idx) => (
              <Card key={idx} className="p-6">
                <Body className="font-weight-bold mb-2">{faq.q}</Body>
                <Body className="text-grey-400">{faq.a}</Body>
              </Card>
            ))}
          </div>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Pricing",
        title: "Simple, Transparent Pricing",
        description: "Choose the plan that's right for your team",
      }}
      tabs={tabs}
      actions={<Button variant="outline" onClick={() => router.push("/contact")}>Contact Sales</Button>}
    />
  );
}
