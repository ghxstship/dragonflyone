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
  Box,
  Text,
} from "@ghxstship/ui";
import { Check, Minus, ArrowRight, User, Users, Rocket, Crown, Zap, Shield, Headphones } from "lucide-react";
import NextLink from "next/link";

export const runtime = "edge";

const pricingData = {
  hero: {
    headline: "SIMPLE, TRANSPARENT PRICING",
    description: "Choose the plan that fits your production needs. Annual plans get 2 months free.",
  },
  plans: [
    {
      name: "DEVIATOR",
      price: "$49",
      annualPrice: "$490",
      period: "/month",
      annualPeriod: "/year",
      description: "Perfect for solo operators who like to keep things lean.",
      icon: User,
      features: [
        "ATLVS only",
        "1 Seat included",
        "Unlimited Projects",
        "Unlimited Records",
        "Email Support",
        "7-day data retention",
        "Community access",
      ],
      cta: "START FREE",
      href: "/auth/signup?plan=deviator",
      popular: false,
    },
    {
      name: "NAVIGATOR",
      price: "$149",
      annualPrice: "$1,490",
      period: "/month",
      annualPeriod: "/year",
      description: "For teams who are done playing spreadsheet roulette.",
      icon: Users,
      features: [
        "ATLVS + COMPVSS",
        "Unlimited Seats",
        "Unlimited Projects",
        "Unlimited Records",
        "Priority Support",
        "90-day data retention",
        "API access",
        "Advanced analytics",
      ],
      cta: "START TRIAL",
      href: "/auth/signup?plan=navigator",
      popular: true,
    },
    {
      name: "AVIATOR",
      price: "$399",
      annualPrice: "$3,990",
      period: "/month",
      annualPeriod: "/year",
      description: "The whole enchilada. For those who refuse to compromise.",
      icon: Rocket,
      features: [
        "ATLVS + COMPVSS + GVTEWAY",
        "Unlimited Seats",
        "Unlimited Projects",
        "Unlimited Records",
        "Dedicated CSM",
        "Unlimited data retention",
        "Full API access",
        "SSO & advanced security",
        "Custom integrations",
      ],
      cta: "START TRIAL",
      href: "/auth/signup?plan=aviator",
      popular: false,
    },
    {
      name: "ENTERPRISE",
      price: "Custom",
      annualPrice: "Custom",
      period: "",
      annualPeriod: "",
      description: "For large organizations with complex production operations.",
      icon: Crown,
      features: [
        "Everything in Aviator",
        "Unlimited Seats",
        "White-label options",
        "On-premise deployment",
        "SLA guarantees",
        "On-site training",
        "Dedicated infrastructure",
        "Custom contracts",
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
      answer: "Yes! All paid plans come with a 14-day free trial. No credit card required to start.",
    },
    {
      question: "What's included in 'unlimited'?",
      answer: "Unlimited means unlimited. No caps on projects, records, integrations, or automations. Seats are unlimited on Navigator and above.",
    },
    {
      question: "What's the difference between tiers?",
      answer: "Deviator is ATLVS only with 1 seat. Navigator adds COMPVSS and unlimited seats. Aviator includes the full suite with GVTEWAY, dedicated support, and enterprise security.",
    },
    {
      question: "Do you offer annual billing?",
      answer: "Yes! Annual plans save you 2 months compared to monthly billing. That's over 16% off.",
    },
  ],
  footnote: "All plans include: Unlimited Projects, Records, Integrations, Automations, and 24/7/365 Support",
};

export default function PricingPage() {
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      {/* Hero */}
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-4 sm:px-6 lg:px-8">
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
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-7xl px-4 sm:px-4 sm:px-6 lg:px-8">
          <Grid cols={4} gap={6} className="lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
            {pricingData.plans.map((plan) => (
              <Card
                key={plan.name}
                className="relative flex h-full flex-col border-2 border-ink-950 bg-white p-4 shadow-subtle-sm transition-all duration-150 hover:-translate-y-2 hover:shadow-brand-xl sm:p-6 lg:p-8"
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
                      <Stack key={feature} direction="horizontal" gap={2} className="items-start">
                        <Check className="size-4 shrink-0 mt-0.5 text-brand-pink" />
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

      {/* Feature Comparison Table */}
      <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-6xl px-4 sm:px-6 lg:px-8">
          <Stack gap={12}>
            <Stack gap={4} className="text-center">
              <H1 className="text-ink-950">FEATURE COMPARISON</H1>
              <Body size="lg" className="text-grey-600 max-w-2xl mx-auto">
                See exactly what&apos;s included in each plan.
              </Body>
            </Stack>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b-2 border-ink-950">
                    <th className="pb-4 text-left font-display text-h6-md uppercase text-ink-950 w-1/3">Feature</th>
                    <th className="pb-4 text-center font-display text-h6-md uppercase text-ink-950">Deviator</th>
                    <th className="pb-4 text-center font-display text-h6-md uppercase text-brand-pink">Navigator</th>
                    <th className="pb-4 text-center font-display text-h6-md uppercase text-ink-950">Aviator</th>
                    <th className="pb-4 text-center font-display text-h6-md uppercase text-ink-950">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-grey-200">
                    <td colSpan={5} className="py-3">
                      <Label size="xs" className="text-grey-500 uppercase tracking-kicker">Products Included</Label>
                    </td>
                  </tr>
                  <tr className="border-t border-grey-100">
                    <td className="py-3"><Text size="sm" className="text-grey-700">ATLVS (Production Management)</Text></td>
                    <td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                    <td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                    <td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                    <td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  </tr>
                  <tr className="border-t border-grey-100">
                    <td className="py-3"><Text size="sm" className="text-grey-700">COMPVSS (Crew & Operations)</Text></td>
                    <td className="py-3 text-center"><Minus className="h-5 w-5 text-grey-300 mx-auto" /></td>
                    <td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                    <td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                    <td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  </tr>
                  <tr className="border-t border-grey-100">
                    <td className="py-3"><Text size="sm" className="text-grey-700">GVTEWAY (Ticketing & Experience)</Text></td>
                    <td className="py-3 text-center"><Minus className="h-5 w-5 text-grey-300 mx-auto" /></td>
                    <td className="py-3 text-center"><Minus className="h-5 w-5 text-grey-300 mx-auto" /></td>
                    <td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                    <td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  </tr>
                  <tr className="border-t border-grey-200">
                    <td colSpan={5} className="py-3">
                      <Label size="xs" className="text-grey-500 uppercase tracking-kicker">Team & Support</Label>
                    </td>
                  </tr>
                  <tr className="border-t border-grey-100">
                    <td className="py-3"><Text size="sm" className="text-grey-700">Team seats</Text></td>
                    <td className="py-3 text-center"><Text size="sm" className="text-grey-600">1</Text></td>
                    <td className="py-3 text-center"><Text size="sm" className="text-grey-600">Unlimited</Text></td>
                    <td className="py-3 text-center"><Text size="sm" className="text-grey-600">Unlimited</Text></td>
                    <td className="py-3 text-center"><Text size="sm" className="text-grey-600">Unlimited</Text></td>
                  </tr>
                  <tr className="border-t border-grey-100">
                    <td className="py-3"><Text size="sm" className="text-grey-700">Support level</Text></td>
                    <td className="py-3 text-center"><Text size="sm" className="text-grey-600">Email</Text></td>
                    <td className="py-3 text-center"><Text size="sm" className="text-grey-600">Priority</Text></td>
                    <td className="py-3 text-center"><Text size="sm" className="text-grey-600">Dedicated CSM</Text></td>
                    <td className="py-3 text-center"><Text size="sm" className="text-grey-600">24/7 Phone + CSM</Text></td>
                  </tr>
                  <tr className="border-t border-grey-100">
                    <td className="py-3"><Text size="sm" className="text-grey-700">Data retention</Text></td>
                    <td className="py-3 text-center"><Text size="sm" className="text-grey-600">7 days</Text></td>
                    <td className="py-3 text-center"><Text size="sm" className="text-grey-600">90 days</Text></td>
                    <td className="py-3 text-center"><Text size="sm" className="text-grey-600">Unlimited</Text></td>
                    <td className="py-3 text-center"><Text size="sm" className="text-grey-600">Unlimited</Text></td>
                  </tr>
                  <tr className="border-t border-grey-200">
                    <td colSpan={5} className="py-3">
                      <Label size="xs" className="text-grey-500 uppercase tracking-kicker">Security & Compliance</Label>
                    </td>
                  </tr>
                  <tr className="border-t border-grey-100">
                    <td className="py-3"><Text size="sm" className="text-grey-700">SSO / SAML</Text></td>
                    <td className="py-3 text-center"><Minus className="h-5 w-5 text-grey-300 mx-auto" /></td>
                    <td className="py-3 text-center"><Minus className="h-5 w-5 text-grey-300 mx-auto" /></td>
                    <td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                    <td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  </tr>
                  <tr className="border-t border-grey-100">
                    <td className="py-3"><Text size="sm" className="text-grey-700">Advanced audit logs</Text></td>
                    <td className="py-3 text-center"><Minus className="h-5 w-5 text-grey-300 mx-auto" /></td>
                    <td className="py-3 text-center"><Minus className="h-5 w-5 text-grey-300 mx-auto" /></td>
                    <td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                    <td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  </tr>
                  <tr className="border-t border-grey-100">
                    <td className="py-3"><Text size="sm" className="text-grey-700">On-premise deployment</Text></td>
                    <td className="py-3 text-center"><Minus className="h-5 w-5 text-grey-300 mx-auto" /></td>
                    <td className="py-3 text-center"><Minus className="h-5 w-5 text-grey-300 mx-auto" /></td>
                    <td className="py-3 text-center"><Minus className="h-5 w-5 text-grey-300 mx-auto" /></td>
                    <td className="py-3 text-center"><Check className="h-5 w-5 text-success mx-auto" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* Add-ons */}
      <FullBleedSection background="ink" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-5xl px-4 sm:px-6 lg:px-8">
          <Stack gap={12}>
            <Stack gap={4} className="text-center">
              <Label size="xs" className="text-grey-500 uppercase tracking-kicker">ADD-ONS</Label>
              <H1 className="text-white">ENHANCE YOUR PLAN</H1>
              <Body size="lg" className="text-grey-400 max-w-2xl mx-auto">
                Add these optional features to any plan for additional capabilities.
              </Body>
            </Stack>

            <Grid cols={3} gap={6} className="sm:grid-cols-1">
              <Card className="border-2 border-ink-700 bg-ink-900 p-6">
                <Stack gap={4}>
                  <Box className="flex h-12 w-12 items-center justify-center border-2 border-brand-pink bg-ink-800">
                    <Zap className="h-6 w-6 text-brand-pink" />
                  </Box>
                  <H3 size="sm" className="text-white">API Access</H3>
                  <Body size="sm" className="text-grey-400">
                    Full REST API access for custom integrations and automations.
                  </Body>
                  <Stack direction="horizontal" gap={1} className="items-baseline">
                    <Display size="md" className="text-white">$99</Display>
                    <Label size="sm" className="text-grey-500">/month</Label>
                  </Stack>
                </Stack>
              </Card>

              <Card className="border-2 border-ink-700 bg-ink-900 p-6">
                <Stack gap={4}>
                  <Box className="flex h-12 w-12 items-center justify-center border-2 border-brand-cyan bg-ink-800">
                    <Shield className="h-6 w-6 text-brand-cyan" />
                  </Box>
                  <H3 size="sm" className="text-white">Advanced Security</H3>
                  <Body size="sm" className="text-grey-400">
                    SSO, advanced audit logs, and custom security policies.
                  </Body>
                  <Stack direction="horizontal" gap={1} className="items-baseline">
                    <Display size="md" className="text-white">$149</Display>
                    <Label size="sm" className="text-grey-500">/month</Label>
                  </Stack>
                </Stack>
              </Card>

              <Card className="border-2 border-ink-700 bg-ink-900 p-6">
                <Stack gap={4}>
                  <Box className="flex h-12 w-12 items-center justify-center border-2 border-brand-yellow bg-ink-800">
                    <Headphones className="h-6 w-6 text-brand-yellow" />
                  </Box>
                  <H3 size="sm" className="text-white">Premium Support</H3>
                  <Body size="sm" className="text-grey-400">
                    24/7 phone support with dedicated success manager.
                  </Body>
                  <Stack direction="horizontal" gap={1} className="items-baseline">
                    <Display size="md" className="text-white">$199</Display>
                    <Label size="sm" className="text-grey-500">/month</Label>
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </Stack>
        </Container>
      </FullBleedSection>

      {/* FAQ */}
      <FullBleedSection background="white" className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 sm:px-6 lg:px-8">
          <Stack gap={4} className="mb-16 text-center">
            <H1 className="text-ink-950">FREQUENTLY ASKED QUESTIONS</H1>
          </Stack>

          <Grid cols={2} gap={6} className="sm:grid-cols-1">
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
      <FullBleedSection background="ink" pattern="grid" patternOpacity={0.05} className="py-12 sm:py-16 lg:py-24">
        <Container className="mx-auto max-w-container-4xl px-4 text-center sm:px-6 lg:px-8">
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
