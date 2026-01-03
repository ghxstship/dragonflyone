"use client";

/**
 * Membership Landing Page
 * Public page showcasing membership tiers, pricing, and benefits
 * Uses marketing-style layout with tier comparison
 */

import { useRouter } from "next/navigation";
import {
  Body,
  Button,
  Card,
  Grid,
  Badge,
  Box,
  Stack,
  H1,
  H2,
  H3,
  Text,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@ghxstship/ui";
import {
  Crown,
  Star,
  Zap,
  Check,
  ArrowRight,
  Sparkles,
  Shield,
  Gift,
  Ticket,
  Users,
  Calendar,
  Percent,
} from "lucide-react";
import { useMembershipTiers, MembershipTier } from "@/hooks/useMembershipTiers";

interface TierFeature {
  name: string;
  included: boolean;
}

interface MembershipTierDisplay {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  description: string;
  color: string;
  icon: React.ReactNode;
  popular?: boolean;
  features: TierFeature[];
}

const DEMO_TIERS: MembershipTierDisplay[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    billingCycle: "forever",
    description: "Get started with basic access",
    color: "text-text-muted",
    icon: <Star className="size-6" />,
    features: [
      { name: "Browse all events", included: true },
      { name: "Basic event notifications", included: true },
      { name: "Standard ticket purchasing", included: true },
      { name: "Priority access", included: false },
      { name: "Exclusive discounts", included: false },
      { name: "VIP experiences", included: false },
      { name: "Concierge support", included: false },
    ],
  },
  {
    id: "silver",
    name: "Silver",
    price: 9.99,
    billingCycle: "monthly",
    description: "Enhanced access for regular attendees",
    color: "text-text-secondary",
    icon: <Zap className="size-6" />,
    features: [
      { name: "Browse all events", included: true },
      { name: "Priority notifications", included: true },
      { name: "Standard ticket purchasing", included: true },
      { name: "Early access (24 hours)", included: true },
      { name: "5% ticket discounts", included: true },
      { name: "VIP experiences", included: false },
      { name: "Concierge support", included: false },
    ],
  },
  {
    id: "gold",
    name: "Gold",
    price: 24.99,
    billingCycle: "monthly",
    description: "Premium benefits for dedicated fans",
    color: "text-accent",
    icon: <Crown className="size-6" />,
    popular: true,
    features: [
      { name: "Browse all events", included: true },
      { name: "Priority notifications", included: true },
      { name: "Skip-the-line purchasing", included: true },
      { name: "Early access (48 hours)", included: true },
      { name: "10% ticket discounts", included: true },
      { name: "VIP lounge access", included: true },
      { name: "Concierge support", included: false },
    ],
  },
  {
    id: "platinum",
    name: "Platinum",
    price: 49.99,
    billingCycle: "monthly",
    description: "Ultimate VIP experience",
    color: "text-primary",
    icon: <Sparkles className="size-6" />,
    features: [
      { name: "Browse all events", included: true },
      { name: "Priority notifications", included: true },
      { name: "Skip-the-line purchasing", included: true },
      { name: "Early access (72 hours)", included: true },
      { name: "15% ticket discounts", included: true },
      { name: "VIP lounge + backstage", included: true },
      { name: "24/7 concierge support", included: true },
    ],
  },
];

const BENEFITS_HIGHLIGHTS = [
  {
    icon: <Ticket className="size-8" />,
    title: "Priority Access",
    description: "Get tickets before they go on sale to the public",
  },
  {
    icon: <Percent className="size-8" />,
    title: "Exclusive Discounts",
    description: "Save up to 15% on every ticket purchase",
  },
  {
    icon: <Gift className="size-8" />,
    title: "Member Rewards",
    description: "Earn points on every purchase and redeem for perks",
  },
  {
    icon: <Shield className="size-8" />,
    title: "Ticket Protection",
    description: "Free cancellation and transfer on all tickets",
  },
  {
    icon: <Users className="size-8" />,
    title: "VIP Experiences",
    description: "Access exclusive lounges and meet & greets",
  },
  {
    icon: <Calendar className="size-8" />,
    title: "Early Announcements",
    description: "Be the first to know about new events",
  },
];

export default function MembershipPage() {
  const router = useRouter();
  const { data: tiers = [], isLoading } = useMembershipTiers();

  // Use API tiers if available, otherwise use demo data
  const displayTiers: MembershipTierDisplay[] = tiers.length > 0
    ? tiers.map((tier: MembershipTier) => ({
        id: tier.id,
        name: tier.name,
        price: tier.price,
        billingCycle: tier.billingCycle === "Monthly" ? "monthly" : "yearly",
        description: `${tier.name} membership tier`,
        color: tier.color || "text-primary",
        icon: <Crown className="size-6" />,
        popular: tier.name.toLowerCase() === "gold",
        features: (tier.benefits || []).map((b: { name: string; enabled: boolean }) => ({
          name: b.name,
          included: b.enabled,
        })),
      }))
    : DEMO_TIERS;

  const handleJoinClick = (tierId: string) => {
    router.push(`/membership/apply?tier=${tierId}`);
  };

  return (
    <Box className="min-h-screen bg-surface-secondary">
      {/* Hero Section */}
      <Box className="bg-surface-primary border-b-2 border-border-primary">
        <Box className="container mx-auto px-4 py-16 text-center">
          <Badge variant="warning" className="mb-4">
            <Sparkles className="size-3 mr-1" />
            Membership Program
          </Badge>
          <H1 className="text-display-lg font-weight-bold mb-4">
            Unlock Exclusive Benefits
          </H1>
          <Body size="lg" className="text-text-muted max-w-2xl mx-auto mb-8">
            Join our membership program and get priority access, exclusive discounts,
            VIP experiences, and more. Choose the tier that fits your lifestyle.
          </Body>
          <Button
            variant="solid"
            size="lg"
            onClick={() => document.getElementById("tiers")?.scrollIntoView({ behavior: "smooth" })}
          >
            View Membership Tiers
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </Box>
      </Box>

      {/* Benefits Highlights */}
      <Box className="container mx-auto px-4 py-16">
        <Box className="text-center mb-12">
          <H2 className="text-h2-desktop font-weight-bold mb-4">Why Join?</H2>
          <Body className="text-text-muted">
            Members enjoy exclusive perks that make every event unforgettable
          </Body>
        </Box>
        <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {BENEFITS_HIGHLIGHTS.map((benefit, idx) => (
            <Card key={idx} className="p-6 text-center hover:shadow-lg transition-shadow">
              <Box className="inline-flex items-center justify-center size-16 rounded-card bg-primary/10 text-primary mb-4">
                {benefit.icon}
              </Box>
              <H3 className="text-h4-desktop font-weight-medium mb-2">{benefit.title}</H3>
              <Body size="sm" className="text-text-muted">
                {benefit.description}
              </Body>
            </Card>
          ))}
        </Grid>
      </Box>

      {/* Pricing Tiers */}
      <Box id="tiers" className="bg-surface-primary border-y-2 border-border-primary">
        <Box className="container mx-auto px-4 py-16">
          <Box className="text-center mb-12">
            <H2 className="text-h2-desktop font-weight-bold mb-4">Choose Your Tier</H2>
            <Body className="text-text-muted">
              Select the membership level that matches your event lifestyle
            </Body>
          </Box>

          {isLoading ? (
            <Box className="flex justify-center py-12">
              <Box className="animate-spin size-8 border-4 border-primary border-t-transparent rounded-avatar" />
            </Box>
          ) : (
            <Grid
              cols={4}
              gap={6}
              className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
              data-testid="membership-tiers"
            >
              {displayTiers.map((tier) => (
                <Card
                  key={tier.id}
                  className={`p-6 relative ${
                    tier.popular
                      ? "border-2 border-primary shadow-primary"
                      : "border-2 border-border-primary"
                  }`}
                >
                  {tier.popular && (
                    <Badge
                      variant="solid"
                      className="absolute -top-3 left-1/2 -translate-x-1/2"
                    >
                      Most Popular
                    </Badge>
                  )}

                  <Stack gap={4}>
                    <Box className="text-center">
                      <Box className={`inline-flex ${tier.color} mb-2`}>
                        {tier.icon}
                      </Box>
                      <H3 className="text-h3-desktop font-weight-bold">{tier.name}</H3>
                      <Body size="sm" className="text-text-muted">
                        {tier.description}
                      </Body>
                    </Box>

                    <Box className="text-center py-4" data-testid="tier-price">
                      <Box className="flex items-baseline justify-center gap-1">
                        <Text className="text-h2-desktop font-weight-bold">
                          ${tier.price.toFixed(2)}
                        </Text>
                        {tier.price > 0 && (
                          <Text className="text-text-muted">/{tier.billingCycle}</Text>
                        )}
                      </Box>
                    </Box>

                    <Stack gap={2} data-testid="tier-benefits">
                      {tier.features.map((feature, idx) => (
                        <Box
                          key={idx}
                          className={`flex items-center gap-2 ${
                            feature.included ? "text-text-primary" : "text-text-disabled"
                          }`}
                        >
                          <Check
                            className={`size-4 flex-shrink-0 ${
                              feature.included ? "text-success" : "text-text-disabled"
                            }`}
                          />
                          <Body size="sm">{feature.name}</Body>
                        </Box>
                      ))}
                    </Stack>

                    <Button
                      variant={tier.popular ? "solid" : "outline"}
                      className="w-full mt-4"
                      onClick={() => handleJoinClick(tier.id)}
                    >
                      {tier.price === 0 ? "Get Started" : "Join Now"}
                    </Button>
                  </Stack>
                </Card>
              ))}
            </Grid>
          )}
        </Box>
      </Box>

      {/* Comparison Table */}
      <Box className="container mx-auto px-4 py-16">
        <Box className="text-center mb-12">
          <H2 className="text-h2-desktop font-weight-bold mb-4">Compare All Features</H2>
          <Body className="text-text-muted">
            See exactly what you get with each membership tier
          </Body>
        </Box>

        <Card className="overflow-x-auto" data-testid="comparison-table">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-b-2 border-border-primary">
                <TableHead className="text-left p-4 font-weight-medium">Feature</TableHead>
                {displayTiers.map((tier) => (
                  <TableHead key={tier.id} className="text-center p-4 font-weight-medium">
                    <Box className={tier.color}>{tier.name}</Box>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayTiers[0]?.features.map((feature, idx) => (
                <TableRow key={idx} className="border-b border-border-secondary">
                  <TableCell className="p-4">
                    <Body size="sm">{feature.name}</Body>
                  </TableCell>
                  {displayTiers.map((tier) => (
                    <TableCell key={tier.id} className="text-center p-4">
                      {tier.features[idx]?.included ? (
                        <Check className="size-5 text-success mx-auto" />
                      ) : (
                        <Box className="size-5 mx-auto text-text-disabled">—</Box>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              <TableRow className="bg-surface-secondary">
                <TableCell className="p-4">
                  <Body size="sm" className="font-weight-medium">
                    Monthly Price
                  </Body>
                </TableCell>
                {displayTiers.map((tier) => (
                  <TableCell key={tier.id} className="text-center p-4">
                    <Body className="font-weight-bold">
                      {tier.price === 0 ? "Free" : `$${tier.price.toFixed(2)}`}
                    </Body>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </Box>

      {/* CTA Section */}
      <Box className="bg-primary text-white">
        <Box className="container mx-auto px-4 py-16 text-center">
          <H2 className="text-h2-desktop font-weight-bold mb-4">
            Ready to Upgrade Your Experience?
          </H2>
          <Body size="lg" className="mb-8 opacity-90">
            Join thousands of members enjoying exclusive benefits at every event.
          </Body>
          <Button
            variant="outline"
            size="lg"
            className="border-white text-white hover:bg-white hover:text-primary"
            onClick={() => handleJoinClick("gold")}
          >
            Start Your Membership
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
