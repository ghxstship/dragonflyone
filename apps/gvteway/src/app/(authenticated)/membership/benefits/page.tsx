"use client";

/**
 * Membership Benefits Page
 * Shows available benefits with usage tracking
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
  DetailPage,
  Section,
  SectionHeader,
  ProgressBar,
} from "@ghxstship/ui";
import {
  Gift,
  Ticket,
  Percent,
  Star,
  Users,
  Lock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface Benefit {
  id: string;
  name: string;
  description: string;
  type: string;
  usageLimit: number;
  usageCount: number;
  available: boolean;
}

const DEMO_BENEFITS: Benefit[] = [
  {
    id: "1",
    name: "Priority Ticket Access",
    description: "Get early access to tickets 48 hours before public sale",
    type: "access",
    usageLimit: -1,
    usageCount: 5,
    available: true,
  },
  {
    id: "2",
    name: "10% Ticket Discount",
    description: "Save 10% on all ticket purchases",
    type: "discount",
    usageLimit: -1,
    usageCount: 3,
    available: true,
  },
  {
    id: "3",
    name: "VIP Lounge Access",
    description: "Access to exclusive VIP lounges at select venues",
    type: "experience",
    usageLimit: 4,
    usageCount: 1,
    available: true,
  },
  {
    id: "4",
    name: "Free Drink Voucher",
    description: "One complimentary drink per event",
    type: "perk",
    usageLimit: 12,
    usageCount: 4,
    available: true,
  },
  {
    id: "5",
    name: "Meet & Greet Access",
    description: "Exclusive meet & greet opportunities with artists",
    type: "experience",
    usageLimit: 2,
    usageCount: 0,
    available: false,
  },
  {
    id: "6",
    name: "Concierge Support",
    description: "24/7 dedicated concierge support",
    type: "service",
    usageLimit: -1,
    usageCount: 0,
    available: false,
  },
];

async function fetchBenefits(): Promise<Benefit[]> {
  const response = await fetch("/api/membership/benefits");
  if (!response.ok) return DEMO_BENEFITS;
  const data = await response.json();
  return data.benefits?.length > 0 ? data.benefits : DEMO_BENEFITS;
}

const benefitIcons: Record<string, React.ReactNode> = {
  access: <Ticket className="size-5" />,
  discount: <Percent className="size-5" />,
  experience: <Star className="size-5" />,
  perk: <Gift className="size-5" />,
  service: <Users className="size-5" />,
};

export default function MembershipBenefitsPage() {
  const router = useRouter();
  const { data: benefits = DEMO_BENEFITS, isLoading, error, refetch } = useQuery({
    queryKey: ["membership-benefits"],
    queryFn: fetchBenefits,
  });

  const availableBenefits = benefits.filter((b) => b.available);
  const lockedBenefits = benefits.filter((b) => !b.available);

  const handleRedeem = async (benefitId: string) => {
    try {
      const response = await fetch("/api/membership/benefits/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ benefit_id: benefitId }),
      });
      if (!response.ok) {
        const data = await response.json();
        alert(data.error || "Failed to redeem benefit. Please try again.");
        return;
      }
      refetch();
    } catch {
      alert("Failed to redeem benefit. Please check your connection and try again.");
    }
  };

  const tabs = [
    {
      id: "available",
      label: "Available",
      icon: <Gift className="size-4" />,
      content: (
        <Section>
          <SectionHeader
            title="Your Benefits"
            description="Benefits included with your membership"
          />
          {availableBenefits.length === 0 ? (
            <Card className="p-8 text-center">
              <Gift className="size-12 text-text-disabled mx-auto mb-4" />
              <Body className="text-text-muted">No benefits available</Body>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => router.push("/membership/apply?upgrade=true")}
              >
                Upgrade for Benefits
              </Button>
            </Card>
          ) : (
            <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2" data-testid="benefits-list">
              {availableBenefits.map((benefit) => (
                <Card key={benefit.id} className="p-6">
                  <Stack gap={4}>
                    <Box className="flex items-start justify-between">
                      <Box className="flex items-center gap-3">
                        <Box className="p-2 bg-primary/10 rounded-card text-primary">
                          {benefitIcons[benefit.type] || <Gift className="size-5" />}
                        </Box>
                        <Box>
                          <Body className="font-weight-medium">{benefit.name}</Body>
                          <Body size="sm" className="text-text-muted">
                            {benefit.description}
                          </Body>
                        </Box>
                      </Box>
                    </Box>

                    {benefit.usageLimit > 0 && (
                      <Box data-testid="benefit-usage">
                        <Box className="flex justify-between mb-1">
                          <Body size="sm" className="text-text-muted">Usage</Body>
                          <Body size="sm" className="text-text-muted">
                            {benefit.usageCount} / {benefit.usageLimit} used
                          </Body>
                        </Box>
                        <ProgressBar
                          value={(benefit.usageCount / benefit.usageLimit) * 100}
                          size="sm"
                        />
                      </Box>
                    )}

                    {benefit.usageLimit === -1 && (
                      <Badge variant="success">Unlimited</Badge>
                    )}

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleRedeem(benefit.id)}
                      disabled={benefit.usageLimit > 0 && benefit.usageCount >= benefit.usageLimit}
                    >
                      {benefit.usageLimit > 0 && benefit.usageCount >= benefit.usageLimit
                        ? "Limit Reached"
                        : "Use Benefit"}
                    </Button>
                  </Stack>
                </Card>
              ))}
            </Grid>
          )}
        </Section>
      ),
    },
    {
      id: "locked",
      label: "Upgrade to Unlock",
      icon: <Lock className="size-4" />,
      content: (
        <Section>
          <SectionHeader
            title="Premium Benefits"
            description="Upgrade your membership to unlock these benefits"
          />
          <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
            {lockedBenefits.map((benefit) => (
              <Card key={benefit.id} className="p-6 opacity-60">
                <Stack gap={4}>
                  <Box className="flex items-start justify-between">
                    <Box className="flex items-center gap-3">
                      <Box className="p-2 bg-surface-secondary rounded-card text-text-muted">
                        {benefitIcons[benefit.type] || <Gift className="size-5" />}
                      </Box>
                      <Box>
                        <Body className="font-weight-medium">{benefit.name}</Body>
                        <Body size="sm" className="text-text-muted">
                          {benefit.description}
                        </Body>
                      </Box>
                    </Box>
                    <Lock className="size-4 text-text-muted" />
                  </Box>

                  <Button
                    variant="solid"
                    className="w-full"
                    onClick={() => router.push("/membership/apply?upgrade=true")}
                  >
                    Upgrade to Unlock
                  </Button>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Membership",
        title: "Your Benefits",
        description: "View and redeem your membership benefits",
        badge: (
          <Badge variant="success">
            {availableBenefits.length} Available
          </Badge>
        ),
      }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
