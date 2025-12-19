"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, Grid, StatCard } from "@ghxstship/ui";
import { Megaphone, Plus, BarChart, Share2, Mail, Users } from "lucide-react";
import { atlvsDemoProductions } from "../../../../data/atlvs";

export default function ProductionMarketingPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  const marketingStats = { reach: 125000, engagement: 8.5, conversions: 2400, spend: 15000 };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Marketing"
          description="Campaigns, analytics, and promotional activities"
          colorScheme="on-dark"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="solid" size="sm">
            <Plus size={16} className="mr-2" />
            New Campaign
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/marketing/campaigns`)}>
            Campaigns
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/marketing/analytics`)}>
            <BarChart size={16} className="mr-2" />
            Analytics
          </Button>
        </Stack>
      </Stack>

      <Grid cols={1} gap={4} className="sm:grid-cols-4">
        <StatCard label="Total Reach" value={`${(marketingStats.reach / 1000).toFixed(0)}K`} icon={<Users size={20} />} trend="up" inverted />
        <StatCard label="Engagement Rate" value={`${marketingStats.engagement}%`} icon={<Share2 size={20} />} trend="up" inverted />
        <StatCard label="Conversions" value={marketingStats.conversions.toLocaleString()} icon={<Megaphone size={20} />} trend="up" inverted />
        <StatCard label="Ad Spend" value={`$${(marketingStats.spend / 1000).toFixed(0)}K`} icon={<BarChart size={20} />} inverted />
      </Grid>

      <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/marketing/social`)}>
          <CardBody>
            <Stack gap={4} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <Share2 size={24} className="text-primary" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Social Media</Body>
                <Body size="sm" className=" text-on-dark-muted">Manage social campaigns</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/marketing/email`)}>
          <CardBody>
            <Stack gap={4} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <Mail size={24} className="text-secondary" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Email Marketing</Body>
                <Body size="sm" className=" text-on-dark-muted">Email campaigns and lists</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/marketing/press`)}>
          <CardBody>
            <Stack gap={4} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                <Megaphone size={24} className="text-warning" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold text-white">Press & PR</Body>
                <Body size="sm" className=" text-on-dark-muted">Media relations</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Grid>
    </Stack>
  );
}
