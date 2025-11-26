"use client";

import { useRouter } from "next/navigation";
import {
  PageLayout,
  Navigation,
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
  SectionLayout,
  Container,
  Stack,
  Grid,
  StatCard,
  Link,
} from "@ghxstship/ui";

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
      header={
        <Navigation
          logo={<Display size="md" className="text-display-md">GVTEWAY</Display>}
          cta={<Button variant="outlineWhite" size="sm" onClick={() => router.push('/profile')}>PROFILE</Button>}
        >
          <Link href="/" className="font-heading text-sm uppercase tracking-wider hover:text-grey-400">Home</Link>
          <Link href="/events" className="font-heading text-sm uppercase tracking-wider hover:text-grey-400">Events</Link>
        </Navigation>
      }
      footer={
        <Footer
          logo={<Display size="md" className="text-white text-display-md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Account">
            <FooterLink href="/profile">Profile</FooterLink>
            <FooterLink href="/membership">Membership</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <SectionLayout background="black">
        <Container size="xl">
          <Stack gap={12}>
            <Stack gap={4} className="text-center">
              <H2 className="text-white">Membership Tiers</H2>
              <Body className="text-grey-400">
                Unlock exclusive benefits and early access to the best events
              </Body>
            </Stack>

            <Grid cols={3} gap={8}>
              {membershipTiers.map((tier) => {
                const isCurrent = tier.id === currentMembership;
                return (
                  <Card
                    key={tier.id}
                    className={`border-2 ${
                      tier.id === "premium" ? "border-white" : "border-grey-800"
                    } p-8 bg-black ${tier.id === "premium" ? "relative" : ""}`}
                  >
                    {tier.id === "premium" && (
                      <Badge className="absolute -top-4 left-1/2 -translate-x-1/2">Recommended</Badge>
                    )}
                    <Stack gap={6}>
                      <Stack gap={4}>
                        <H3 className="text-white">{tier.name}</H3>
                        <Stack gap={2} direction="horizontal" className="items-baseline">
                          <Display size="md" className="text-white">${tier.price}</Display>
                          {tier.price > 0 && (
                            <Body className="font-mono text-sm text-grey-400">/month</Body>
                          )}
                        </Stack>
                      </Stack>

                      <Stack gap={3}>
                        {tier.features.map((feature, idx) => (
                          <Stack key={idx} gap={2} direction="horizontal" className="items-start">
                            <Body className="text-white">✓</Body>
                            <Body className="text-sm text-grey-300">{feature}</Body>
                          </Stack>
                        ))}
                      </Stack>

                      <Stack gap={0} className="pt-6">
                        {isCurrent ? (
                          <Button variant="outline" disabled className="w-full">
                            Current Plan
                          </Button>
                        ) : (
                          <Button
                            variant={tier.id === "premium" ? "solid" : "outline"}
                            className="w-full"
                            onClick={() => window.location.href = `/membership/upgrade?tier=${tier.id}`}
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

            <Card className="border-2 border-grey-800 p-8 bg-black">
              <Stack gap={6}>
                <H3 className="text-white">Membership Benefits</H3>
                <Grid cols={2} gap={6}>
                  <StatCard
                    value="Free"
                    label="Current Tier"
                    className="bg-black text-white border-grey-800"
                  />
                  <StatCard
                    value="Jan 2024"
                    label="Member Since"
                    className="bg-black text-white border-grey-800"
                  />
                  <StatCard
                    value={12}
                    label="Events Attended"
                    className="bg-black text-white border-grey-800"
                  />
                  <StatCard
                    value="$0"
                    label="Total Savings"
                    className="bg-black text-white border-grey-800"
                  />
                </Grid>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </SectionLayout>
    </PageLayout>
  );
}
