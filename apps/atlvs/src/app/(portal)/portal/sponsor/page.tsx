"use client";

/**
 * Sponsor Portal Page
 * Portal for sponsors to manage sponsorships
 * Uses DetailPage template for consistent layout
 */

import { Award, BarChart3, DollarSign, Eye, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge, Body, Card, Grid, StatCard, DetailPage, Section, SectionHeader, Box} from "@ghxstship/ui";

interface Sponsorship {
  id: string;
  event: string;
  tier: string;
  value: number;
  impressions: number;
  status: "active" | "upcoming" | "completed";
}

const DEMO_SPONSORSHIPS: Sponsorship[] = [
  { id: "1", event: "Summer Festival 2024", tier: "Platinum", value: 100000, impressions: 500000, status: "active" },
  { id: "2", event: "Music Awards 2025", tier: "Gold", value: 50000, impressions: 250000, status: "upcoming" },
  { id: "3", event: "Tech Conference", tier: "Silver", value: 25000, impressions: 100000, status: "completed" },
];

const STATUS_CONFIG = {
  active: { label: "Active", variant: "success" as const },
  upcoming: { label: "Upcoming", variant: "warning" as const },
  completed: { label: "Completed", variant: "info" as const },
};

export default function SponsorPortalPage() {

  const { data: sponsorships = [], isLoading, error, refetch } = useQuery({
    queryKey: ["sponsor-sponsorships"],
    queryFn: async () => {
      const response = await fetch("/api/portal/sponsor/sponsorships");
      if (!response.ok) return DEMO_SPONSORSHIPS;
      const data = await response.json();
      return data.sponsorships?.length ? data.sponsorships : DEMO_SPONSORSHIPS;
    },
  });

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
  const formatNumber = (num: number) => new Intl.NumberFormat("en-US").format(num);

  const totalInvestment = sponsorships.reduce((sum: number, s: Sponsorship) => sum + s.value, 0);
  const totalImpressions = sponsorships.reduce((sum: number, s: Sponsorship) => sum + s.impressions, 0);

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4 mb-6">
            <StatCard label="Sponsorships" value={sponsorships.length.toString()} icon={<Award className="size-5" />} />
            <StatCard label="Investment" value={formatCurrency(totalInvestment)} icon={<DollarSign className="size-5" />} />
            <StatCard label="Impressions" value={formatNumber(totalImpressions)} icon={<Eye className="size-5" />} />
            <StatCard label="Active" value={sponsorships.filter((s: Sponsorship) => s.status === "active").length.toString()} icon={<BarChart3 className="size-5" />} />
          </Grid>

          <SectionHeader title="Sponsorships" />
          <Box className="space-y-4 mt-4">
            {sponsorships.map((sponsorship: Sponsorship) => (
              <Card key={sponsorship.id} className="p-6">
                <Box className="flex items-start justify-between">
                  <Box>
                    <Body className="font-weight-bold font-weight-medium">{sponsorship.event}</Body>
                    <Box className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{sponsorship.tier}</Badge>
                      <Body size="sm" className="text-on-dark-muted">{formatNumber(sponsorship.impressions)} impressions</Body>
                    </Box>
                  </Box>
                  <Box className="text-right">
                    <Body className="font-weight-bold">{formatCurrency(sponsorship.value)}</Body>
                    <Badge variant={STATUS_CONFIG[sponsorship.status].variant} className="mt-2">{STATUS_CONFIG[sponsorship.status].label}</Badge>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        </Section>
      ),
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: <BarChart3 className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Sponsorship Analytics" description="Track your sponsorship performance" />
          <Card className="p-8 text-center mt-4">
            <BarChart3 className="size-12 text-on-dark-disabled mx-auto mb-4" />
            <Body className="font-weight-medium font-weight-medium mb-2">Analytics Dashboard</Body>
            <Body className="text-on-dark-muted">Detailed analytics coming soon</Body>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Portal", title: "Sponsor Dashboard", description: "Manage your sponsorships and track ROI" }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
