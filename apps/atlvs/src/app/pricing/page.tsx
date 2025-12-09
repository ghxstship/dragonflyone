import { AtlvsAppLayout } from "../../components/app-layout";
import {
  Stack,
  Grid,
  Card,
  Body,
  H1,
  H3,
  Label,
  Container,
  Display,
  Button,
  FullBleedSection,
} from "@ghxstship/ui";
import { Check, ArrowRight, Zap, Building2, Crown } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const pricingData = {
  hero: {
    headline: "SIMPLE, TRANSPARENT PRICING",
    description: "Choose the plan that fits your production needs. All plans include unlimited projects, records, and seats.",
  },
  plans: [
    {
      name: "STARTER",
      price: "Free",
      period: "",
      description: "Perfect for small productions and freelancers getting started.",
      icon: Zap,
      features: [
        "Up to 3 active projects",
        "Basic asset tracking",
        "Team collaboration",
        "Mobile app access",
        "Email support",
      ],
      cta: "START FREE",
      href: "/auth/signup",
      popular: false,
    },
    {
      name: "PROFESSIONAL",
      price: "$99",
      period: "/month",
      description: "For growing production companies with multiple concurrent projects.",
      icon: Building2,
      features: [
        "Unlimited projects",
        "Advanced asset management",
        "Financial tracking & budgets",
        "Crew scheduling",
        "Integrations (Slack, QuickBooks)",
        "Priority support",
        "Custom reports",
      ],
      cta: "START TRIAL",
      href: "/auth/signup?plan=pro",
      popular: true,
    },
    {
      name: "ENTERPRISE",
      price: "Custom",
      period: "",
      description: "For large organizations with complex production operations.",
      icon: Crown,
      features: [
        "Everything in Professional",
        "Dedicated account manager",
        "Custom integrations",
        "SSO & advanced security",
        "SLA guarantees",
        "On-site training",
        "White-label options",
      ],
      cta: "CONTACT SALES",
      href: "/contact",
      popular: false,
    },
  ],
  faq: [
    {
      question: "Can I switch plans anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and we'll prorate your billing.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, ACH transfers, and wire transfers for enterprise customers.",
    },
    {
      question: "Is there a free trial?",
      answer: "Yes! Professional plans come with a 14-day free trial. No credit card required to start.",
    },
    {
      question: "What's included in 'unlimited'?",
      answer: "Unlimited means unlimited. No caps on projects, records, seats, integrations, or automations.",
    },
  ],
  footnote: "All plans include: Unlimited projects, records, seats, integrations, automations, and 24/7/365 support",
};

export default function PricingPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-5xl px-6 lg:px-8">
          <Stack gap={8} className="items-center text-center">
            <Label size="xs" className="text-on-dark-muted">
              PRICING
            </Label>
            <Display size="lg" className="text-white">
              {pricingData.hero.headline}
            </Display>
            <Body size="lg" className="max-w-2xl text-on-dark-secondary">
              {pricingData.hero.description}
            </Body>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Pricing Cards */}
      <FullBleedSection background="white" className="py-24">
        <Container className="mx-auto max-w-container-6xl px-6 lg:px-8">
          <Grid cols={3} gap={6}>
            {pricingData.plans.map((plan) => (
              <Card
                key={plan.name}
                className="relative flex h-full flex-col border-2 border-ink-950 bg-white p-8 shadow-subtle-sm transition-all duration-150 hover:-translate-y-2 hover:shadow-brand-xl"
              >
                {plan.popular && (
                  <Label size="xs" className="absolute -top-3 left-1/2 -translate-x-1/2 border-2 border-brand-pink bg-brand-pink px-3 py-1 text-white">
                    MOST POPULAR
                  </Label>
                )}
                <Stack gap={6}>
                  <Stack className="flex size-12 items-center justify-center border-2 border-ink-950 bg-grey-100">
                    <plan.icon className="size-6 text-ink-950" />
                  </Stack>
                  <Stack gap={2}>
                    <H3 className="text-ink-950">{plan.name}</H3>
                    <Stack direction="horizontal" className="items-baseline gap-1">
                      <Display size="md" className="text-ink-950">{plan.price}</Display>
                      {plan.period && <Label size="sm" className="text-grey-500">{plan.period}</Label>}
                    </Stack>
                    <Body size="sm" className="text-grey-600">
                      {plan.description}
                    </Body>
                  </Stack>
                  <Stack gap={3}>
                    {plan.features.map((feature) => (
                      <Stack key={feature} direction="horizontal" gap={2} className="items-center">
                        <Check className="size-4 text-brand-pink" />
                        <Label size="xs" className="text-grey-700">{feature}</Label>
                      </Stack>
                    ))}
                  </Stack>
                  <NextLink href={plan.href} className="mt-auto">
                    <Button
                      variant={plan.popular ? "pop" : "outline"}
                      size="lg"
                      className="w-full"
                      icon={<ArrowRight />}
                    >
                      {plan.cta}
                    </Button>
                  </NextLink>
                </Stack>
              </Card>
            ))}
          </Grid>

          <Label size="xs" className="mt-8 block text-center text-grey-500">
            {pricingData.footnote}
          </Label>
        </Container>
      </FullBleedSection>

      {/* FAQ */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-24">
        <Container className="mx-auto max-w-container-4xl px-6 lg:px-8">
          <Stack gap={4} className="mb-16 text-center">
            <H1 className="text-ink-950">FREQUENTLY ASKED QUESTIONS</H1>
          </Stack>

          <Grid cols={2} gap={6}>
            {pricingData.faq.map((item) => (
              <Card key={item.question} className="border-2 border-ink-950 bg-white p-6 shadow-subtle-sm transition-all duration-150 hover:-translate-y-2 hover:shadow-brand-xl">
                <Stack gap={3}>
                  <H3 size="sm" className="text-ink-950">{item.question}</H3>
                  <Body size="sm" className="text-grey-600">{item.answer}</Body>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Container>
      </FullBleedSection>

      {/* CTA */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.05} className="py-24">
        <Container className="mx-auto max-w-container-4xl px-6 text-center lg:px-8">
          <Stack gap={8} className="items-center">
            <Display size="md" className="text-white">
              READY TO GET STARTED?
            </Display>
            <Body size="lg" className="text-on-dark-secondary">
              Start your 14-day free trial today. No credit card required.
            </Body>
            <Stack direction="horizontal" gap={4}>
              <NextLink href="/auth/signup">
                <Button variant="pop" size="lg" icon={<ArrowRight />}>
                  Start Free Trial
                </Button>
              </NextLink>
              <NextLink href="/demo">
                <Button variant="outlineWhite" size="lg">
                  Schedule Demo
                </Button>
              </NextLink>
            </Stack>
          </Stack>
        </Container>
      </FullBleedSection>
    </AtlvsAppLayout>
  );
}
