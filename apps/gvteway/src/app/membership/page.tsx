"use client";

import { useRouter } from "next/navigation";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  H2,
  H3,
  Body,
  Button,
  Card,
  Stack,
  Grid,
  Label,
  ScrollReveal,
  StaggerChildren,
} from "@ghxstship/ui";
import {
  Check,
  Lock,
  Clock,
  DollarSign,
  Headphones,
  Globe,
  Users,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import NextLink from "next/link";

// =============================================================================
// MEMBERSHIP PAGE - Detailed tier information and benefits
// =============================================================================

const membershipTiers = [
  {
    id: "member",
    name: "MEMBER",
    price: "$29",
    period: "/mo",
    description: "Your gateway to extraordinary experiences",
    features: [
      "Priority access to all experiences",
      "Member-only pricing (up to 15% off)",
      "48-hour early access windows",
      "Community access",
      "Digital membership card",
    ],
    cta: "Apply Now",
    popular: false,
  },
  {
    id: "plus",
    name: "PLUS",
    price: "$79",
    period: "/mo",
    description: "Enhanced access with premium perks",
    features: [
      "Everything in Member",
      "VIP upgrades when available",
      "Personal concierge service",
      "Exclusive member events",
      "Priority support (24/7)",
      "Guest passes (2/year)",
    ],
    cta: "Apply Now",
    popular: false,
  },
  {
    id: "extra",
    name: "EXTRA",
    price: "$199",
    period: "/mo",
    description: "The ultimate experience membership",
    features: [
      "Everything in Plus",
      "Backstage & VIP access",
      "Curated adventure trips",
      "Artist meet & greets",
      "Dedicated account manager",
      "Complimentary +1 on select experiences",
      "Annual member retreat invitation",
    ],
    cta: "Apply Now",
    popular: true,
  },
];

const membershipBenefits = [
  {
    icon: Lock,
    title: "PRIORITY ACCESS",
    description: "Skip the public chaos. Members get first look at every experience before anyone else.",
  },
  {
    icon: Clock,
    title: "EARLY WINDOWS",
    description: "48-hour head start on every drop. By the time it's public, you're already in.",
  },
  {
    icon: DollarSign,
    title: "MEMBER PRICING",
    description: "Exclusive rates on every experience. The more you attend, the more you save.",
  },
  {
    icon: Headphones,
    title: "PERSONAL CONCIERGE",
    description: "Need something special? Your dedicated concierge makes it happen. (Plus+ and above)",
  },
  {
    icon: Globe,
    title: "GLOBAL ADVENTURES",
    description: "Curated trips to 52+ countries. Festivals, retreats, expeditions.",
  },
  {
    icon: Users,
    title: "THE COMMUNITY",
    description: "Connect with 847 members who share your passion for extraordinary experiences.",
  },
];

const faqs = [
  {
    question: "How does the application process work?",
    answer: "Submit your application and our membership team reviews it within 24-48 hours. Once approved, you'll receive instructions to complete your membership setup.",
  },
  {
    question: "Can I upgrade or downgrade my membership?",
    answer: "Yes, you can change your tier at any time. Upgrades take effect immediately, and downgrades apply at the start of your next billing cycle.",
  },
  {
    question: "What's included in member pricing?",
    answer: "Members receive 10-15% off all experiences, with Plus+ and Extra members getting additional VIP upgrades and exclusive access.",
  },
  {
    question: "Is there a commitment period?",
    answer: "No long-term commitment required. You can cancel anytime, though we think you'll want to stay.",
  },
];

export default function MembershipPage() {
  const router = useRouter();

  return (
    <GvtewayAppLayout>
      {/* Hero Section */}
      <Stack className="relative overflow-hidden py-24">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
          <ScrollReveal animation="fade">
            <Stack gap={6} className="mx-auto max-w-3xl text-center">
              <H2 size="lg" className="text-white">
                MEMBERSHIP TIERS
              </H2>
              <Body size="lg" className="text-on-dark-secondary">
                Choose the level that matches your lifestyle. Every tier unlocks extraordinary—higher tiers unlock more.
              </Body>
            </Stack>
          </ScrollReveal>
      </Stack>

      {/* Membership Tiers */}
      <Stack className="border-t border-ink-900 py-24">
          <StaggerChildren staggerDelay={150} animation="slide-up">
            <Grid cols={3} gap={6} className="mx-auto max-w-5xl">
              {membershipTiers.map((tier) => (
                <Card
                  key={tier.id}
                  inverted
                  className={`relative border-2 p-8 ${
                    tier.popular
                      ? "border-warning shadow-accent"
                      : "border-ink-800"
                  } bg-ink-950`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Label size="xs" className="bg-accent-500 px-4 py-1 text-black">
                        <Sparkles className="mr-1 inline size-3" />
                        MOST POPULAR
                      </Label>
                    </div>
                  )}

                  <Stack gap={6}>
                    <H3 className="text-white">{tier.name}</H3>

                    <div className="flex items-baseline gap-1">
                      <H2 size="md" className="text-white">{tier.price}</H2>
                      <Label size="sm" className="text-on-dark-muted">{tier.period}</Label>
                    </div>

                    <Body size="sm" className="text-on-dark-muted">
                      {tier.description}
                    </Body>

                    <Stack gap={3} className="border-t border-ink-800 py-4">
                      {tier.features.map((feature) => (
                        <Stack key={feature} direction="horizontal" gap={3} className="items-start">
                          <Check className="mt-0.5 size-4 shrink-0 text-warning" />
                          <Label size="xs" className="text-on-dark-secondary">{feature}</Label>
                        </Stack>
                      ))}
                    </Stack>

                    <NextLink href="/apply" className="w-full">
                      <Button
                        variant={tier.popular ? "solid" : "outline"}
                        size="lg"
                        fullWidth
                        className={
                          tier.popular
                            ? "bg-warning text-black hover:bg-warning/90"
                            : "border-ink-600 text-on-dark-secondary hover:border-white hover:text-white"
                        }
                      >
                        {tier.cta}
                      </Button>
                    </NextLink>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </StaggerChildren>
      </Stack>

      {/* Benefits Grid */}
      <Stack className="border-t border-ink-900 py-24">
          <ScrollReveal animation="fade">
            <H2 size="lg" className="mb-16 text-center text-white">
              WHAT MEMBERSHIP MEANS
            </H2>
          </ScrollReveal>

          <StaggerChildren staggerDelay={100} animation="slide-up">
            <Grid cols={2} gap={6} className="mx-auto max-w-4xl">
              {membershipBenefits.map((benefit) => (
                <Card
                  key={benefit.title}
                  inverted
                  className="border-2 border-ink-800 bg-ink-950 p-8"
                >
                  <Stack gap={4}>
                    <div className="flex size-12 items-center justify-center border-2 border-ink-700 bg-ink-900">
                      <benefit.icon className="size-6 text-warning" />
                    </div>
                    <H3 size="sm" className="text-white">{benefit.title}</H3>
                    <Body size="sm" className="text-on-dark-muted">
                      {benefit.description}
                    </Body>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </StaggerChildren>
      </Stack>

      {/* FAQ Section */}
      <Stack className="border-t border-ink-900 py-24">
          <ScrollReveal animation="fade">
            <H2 size="lg" className="mb-16 text-center text-white">
              FREQUENTLY ASKED
            </H2>
          </ScrollReveal>

          <Stack gap={4} className="mx-auto max-w-2xl">
            {faqs.map((faq, index) => (
              <ScrollReveal key={index} animation="slide-up" delay={index * 100}>
                <Card inverted className="border-2 border-ink-800 bg-ink-950 p-6">
                  <Stack gap={3}>
                    <H3 size="sm" className="text-white">{faq.question}</H3>
                    <Body size="sm" className="text-on-dark-muted">{faq.answer}</Body>
                  </Stack>
                </Card>
              </ScrollReveal>
            ))}
          </Stack>
      </Stack>

      {/* Final CTA */}
      <Stack className="border-t border-ink-900 py-24">
          <ScrollReveal animation="scale">
            <Stack gap={8} className="mx-auto max-w-xl items-center text-center">
              <H2 size="lg" className="text-white">
                READY TO JOIN?
              </H2>
              <Body className="text-on-dark-secondary">
                Applications are reviewed within 24-48 hours. No payment required until approved.
              </Body>
              <NextLink href="/apply">
                <Button
                  variant="solid"
                  size="lg"
                  icon={<ArrowRight className="size-4" />}
                  iconPosition="right"
                  className="bg-warning px-12 text-black hover:bg-warning/90"
                >
                  Apply Now
                </Button>
              </NextLink>
            </Stack>
          </ScrollReveal>
      </Stack>
    </GvtewayAppLayout>
  );
}
