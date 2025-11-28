"use client";

import { useRouter } from "next/navigation";
import { ConsumerNavigationPublic } from "@/components/navigation";
import {
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  H2,
  H3,
  Body,
  Button,
  Badge,
  Card,
  Section,
  Container,
  Stack,
  Grid,
  StatCard,
  Kicker,
  Label,
} from "@ghxstship/ui";
import { Check, Crown } from "lucide-react";

const membershipTiers = [
  {
    id: "free",
    name: "Free",
    price: 0,
    features: [
      "Access to public events",
      "Standard ticket pricing",
      "Email notifications",
      "Basic profile",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    price: 9.99,
    features: [
      "Early access to tickets",
      "5% discount on all tickets",
      "Priority customer support",
      "Exclusive member events",
      "Free shipping on merch",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 29.99,
    features: [
      "VIP early access (48h before public)",
      "15% discount on all tickets",
      "Dedicated concierge service",
      "Exclusive VIP events & experiences",
      "Free express shipping",
      "Access to artist meet & greets",
      "Complimentary drink tickets",
    ],
  },
];

const currentMembership = "free";

export default function MembershipPage() {
  const router = useRouter();
  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Account">
            <FooterLink href="/profile">Profile</FooterLink>
            <FooterLink href="/membership">Membership</FooterLink>
          </FooterColumn>
          <FooterColumn title="Discover">
            <FooterLink href="/events">Browse Events</FooterLink>
            <FooterLink href="/venues">Find Venues</FooterLink>
          </FooterColumn>
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section background="black" className="relative min-h-screen overflow-hidden py-16">
        {/* Grid Pattern Background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(#fff 1px, transparent 1px),
              linear-gradient(90deg, #fff 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
          <Stack gap={12}>
            {/* Page Header */}
            <Stack gap={4} className="text-center">
              <Kicker colorScheme="on-dark">Exclusive Benefits</Kicker>
              <H2 size="lg" className="text-white">Membership Tiers</H2>
              <Body className="text-on-dark-muted">
                Unlock exclusive benefits and early access to the best events
              </Body>
            </Stack>

            {/* Membership Tiers */}
            <Grid cols={3} gap={8}>
              {membershipTiers.map((tier) => {
                const isCurrent = tier.id === currentMembership;
                const isPremium = tier.id === "premium";
                return (
                  <Card
                    key={tier.id}
                    inverted
                    variant={isPremium ? "elevated" : "default"}
                    className={`relative p-8 ${isPremium ? "ring-2 ring-white" : ""}`}
                  >
                    {isPremium && (
                      <Badge variant="solid" className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Crown className="mr-1 inline size-3" />
                        Recommended
                      </Badge>
                    )}
                    <Stack gap={6}>
                      <Stack gap={4}>
                        <H3 className="text-white">{tier.name}</H3>
                        <Stack gap={2} direction="horizontal" className="items-baseline">
                          <Display size="md" className="text-white">${tier.price}</Display>
                          {tier.price > 0 && (
                            <Label size="xs" className="text-on-dark-muted">/month</Label>
                          )}
                        </Stack>
                      </Stack>

                      <Stack gap={3}>
                        {tier.features.map((feature, idx) => (
                          <Stack key={idx} gap={2} direction="horizontal" className="items-start">
                            <Check className="mt-0.5 size-4 shrink-0 text-white" />
                            <Body size="sm" className="text-on-dark-muted">{feature}</Body>
                          </Stack>
                        ))}
                      </Stack>

                      <Stack gap={0} className="pt-6">
                        {isCurrent ? (
                          <Button variant="outlineInk" disabled fullWidth>
                            Current Plan
                          </Button>
                        ) : (
                          <Button
                            variant={isPremium ? "solid" : "outlineInk"}
                            inverted={isPremium}
                            fullWidth
                            onClick={() => router.push(`/membership/upgrade?tier=${tier.id}`)}
                          >
                            {tier.price === 0 ? "Downgrade" : "Upgrade"}
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  </Card>
                );
              })}
            </Grid>

            {/* Membership Stats */}
            <Card inverted variant="elevated" className="p-8">
              <Stack gap={6}>
                <H3 className="text-white">Your Membership</H3>
                <Grid cols={4} gap={6}>
                  <StatCard
                    value="Free"
                    label="Current Tier"
                    inverted
                  />
                  <StatCard
                    value="Jan 2024"
                    label="Member Since"
                    inverted
                  />
                  <StatCard
                    value="12"
                    label="Events Attended"
                    inverted
                  />
                  <StatCard
                    value="$0"
                    label="Total Savings"
                    inverted
                  />
                </Grid>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
