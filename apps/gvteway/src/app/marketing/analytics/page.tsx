"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Select, Button,
  Card, Tabs, TabsList, Tab, TabPanel, Badge, ProgressBar,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Kicker,
} from "@ghxstship/ui";

import {
  DEMO_CAMPAIGN_METRICS,
  DEMO_ATTRIBUTION_SOURCES,
  type DemoCampaignMetric as CampaignMetric,
  type DemoAttributionSource as AttributionSource,
} from "@/lib/demo-data";

const mockCampaigns = DEMO_CAMPAIGN_METRICS;
const mockAttribution = DEMO_ATTRIBUTION_SOURCES;

function MarketingAnalyticsPageContent() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'overview',
    validTabs: ['overview', 'campaigns', 'attribution', 'funnel'],
  });
  const [dateRange, setDateRange] = useState("30d");

  const totalSpend = mockCampaigns.reduce((s, c) => s + c.spend, 0);
  const totalRevenue = mockCampaigns.reduce((s, c) => s + c.revenue, 0);
  const totalConversions = mockCampaigns.reduce((s, c) => s + c.conversions, 0);
  const overallROAS = totalRevenue / totalSpend;

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack direction="horizontal" className="items-start justify-between">
              <Stack gap={2}>
                <Kicker colorScheme="on-dark">Marketing</Kicker>
                <H2 size="lg" className="text-white">Marketing Analytics</H2>
                <Body className="text-on-dark-muted">Campaign performance and attribution dashboard</Body>
              </Stack>
            <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="border-2 border-black">
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="ytd">Year to Date</option>
            </Select>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Spend" value={formatCurrency(totalSpend)} className="border-2 border-black" />
            <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} className="border-2 border-black" />
            <StatCard label="Conversions" value={totalConversions.toLocaleString()} className="border-2 border-black" />
            <StatCard label="Overall ROAS" value={`${overallROAS.toFixed(1)}x`} trend="up" className="border-2 border-black" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={isActive('overview')} onClick={() => setActiveTab('overview')}>Overview</Tab>
              <Tab active={isActive('campaigns')} onClick={() => setActiveTab('campaigns')}>Campaigns</Tab>
              <Tab active={isActive('attribution')} onClick={() => setActiveTab('attribution')}>Attribution</Tab>
              <Tab active={isActive('funnel')} onClick={() => setActiveTab('funnel')}>Funnel</Tab>
            </TabsList>

            <TabPanel active={isActive('overview')}>
              <Grid cols={2} gap={6}>
                <Card className="border-2 border-black p-6">
                  <Stack gap={4}>
                    <H3>Channel Performance</H3>
                    <Stack gap={3}>
                      {["Facebook", "Google Ads", "Email", "TikTok"].map((channel) => {
                        const channelData = mockCampaigns.filter(c => c.channel === channel);
                        const channelRevenue = channelData.reduce((s, c) => s + c.revenue, 0);
                        const pct = (channelRevenue / totalRevenue) * 100;
                        return (
                          <Stack key={channel} gap={2}>
                            <Stack direction="horizontal" className="justify-between">
                              <Label>{channel}</Label>
                              <Label className="font-mono">{formatCurrency(channelRevenue)}</Label>
                            </Stack>
                            <ProgressBar value={pct} className="h-2" />
                          </Stack>
                        );
                      })}
                    </Stack>
                  </Stack>
                </Card>
                <Card className="border-2 border-black p-6">
                  <Stack gap={4}>
                    <H3>Key Metrics</H3>
                    <Grid cols={2} gap={4}>
                      <Card className="p-4 border-2 border-ink-200 text-center">
                        <Label className="font-mono text-h5-md">{(mockCampaigns.reduce((s, c) => s + c.ctr, 0) / mockCampaigns.length).toFixed(2)}%</Label>
                        <Label className="text-ink-500">Avg CTR</Label>
                      </Card>
                      <Card className="p-4 border-2 border-ink-200 text-center">
                        <Label className="font-mono text-h5-md">${(totalSpend / totalConversions).toFixed(2)}</Label>
                        <Label className="text-ink-500">Cost per Conversion</Label>
                      </Card>
                      <Card className="p-4 border-2 border-ink-200 text-center">
                        <Label className="font-mono text-h5-md">${(totalRevenue / totalConversions).toFixed(0)}</Label>
                        <Label className="text-ink-500">Avg Order Value</Label>
                      </Card>
                      <Card className="p-4 border-2 border-ink-200 text-center">
                        <Label className="font-mono text-h5-md">{((totalConversions / mockCampaigns.reduce((s, c) => s + c.clicks, 0)) * 100).toFixed(1)}%</Label>
                        <Label className="text-ink-500">Conversion Rate</Label>
                      </Card>
                    </Grid>
                  </Stack>
                </Card>
              </Grid>
            </TabPanel>

            <TabPanel active={isActive('campaigns')}>
              <Table variant="dark" className="border-2 border-black">
                <TableHeader>
                  <TableRow className="bg-black text-white">
                    <TableHead>Campaign</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead>Impressions</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>CTR</TableHead>
                    <TableHead>Conversions</TableHead>
                    <TableHead>Spend</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>ROAS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCampaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell><Label className="font-weight-medium">{campaign.name}</Label></TableCell>
                      <TableCell><Badge variant="outline">{campaign.channel}</Badge></TableCell>
                      <TableCell><Label className="font-mono">{campaign.impressions.toLocaleString()}</Label></TableCell>
                      <TableCell><Label className="font-mono">{campaign.clicks.toLocaleString()}</Label></TableCell>
                      <TableCell><Label className="font-mono">{campaign.ctr.toFixed(2)}%</Label></TableCell>
                      <TableCell><Label className="font-mono">{campaign.conversions}</Label></TableCell>
                      <TableCell><Label className="font-mono">{formatCurrency(campaign.spend)}</Label></TableCell>
                      <TableCell><Label className="font-mono text-success-600">{formatCurrency(campaign.revenue)}</Label></TableCell>
                      <TableCell><Label className={`font-mono ${campaign.roas >= 10 ? "text-success-600" : ""}`}>{campaign.roas.toFixed(1)}x</Label></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>

            <TabPanel active={isActive('attribution')}>
              <Grid cols={2} gap={6}>
                <Card className="border-2 border-black p-6">
                  <Stack gap={4}>
                    <H3>Attribution by Source</H3>
                    <Stack gap={3}>
                      {mockAttribution.map((source) => (
                        <Stack key={source.source} gap={2}>
                          <Stack direction="horizontal" className="justify-between">
                            <Label>{source.source}</Label>
                            <Stack direction="horizontal" gap={4}>
                              <Label className="font-mono">{source.conversions}</Label>
                              <Label className="font-mono text-success-600">{formatCurrency(source.revenue)}</Label>
                            </Stack>
                          </Stack>
                          <ProgressBar value={source.percentage} className="h-3" />
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
                <Card className="border-2 border-black p-6">
                  <Stack gap={4}>
                    <H3>Attribution Model</H3>
                    <Select className="border-2 border-black">
                      <option value="last">Last Click</option>
                      <option value="first">First Click</option>
                      <option value="linear">Linear</option>
                      <option value="decay">Time Decay</option>
                      <option value="position">Position Based</option>
                    </Select>
                    <Body className="text-ink-600">
                      Last Click attribution assigns 100% of the conversion credit to the last touchpoint before conversion.
                    </Body>
                    <Card className="p-4 border-2 border-ink-200">
                      <Stack gap={2}>
                        <Label className="text-ink-500">Top Converting Path</Label>
                        <Stack direction="horizontal" gap={2}>
                          <Badge variant="outline">Paid Social</Badge>
                          <Label>→</Label>
                          <Badge variant="outline">Email</Badge>
                          <Label>→</Label>
                          <Badge variant="solid">Purchase</Badge>
                        </Stack>
                      </Stack>
                    </Card>
                  </Stack>
                </Card>
              </Grid>
            </TabPanel>

            <TabPanel active={isActive('funnel')}>
              <Card className="border-2 border-black p-6">
                <Stack gap={6}>
                  <H3>Conversion Funnel</H3>
                  <Stack gap={4}>
                    {[
                      { stage: "Impressions", count: 1077000, pct: 100 },
                      { stage: "Clicks", count: 34990, pct: 3.2 },
                      { stage: "Landing Page Views", count: 28500, pct: 2.6 },
                      { stage: "Add to Cart", count: 4200, pct: 0.39 },
                      { stage: "Checkout Started", count: 2800, pct: 0.26 },
                      { stage: "Purchase", count: 1100, pct: 0.10 },
                    ].map((stage, idx) => (
                      <Stack key={idx} gap={2}>
                        <Stack direction="horizontal" className="justify-between">
                          <Label className="font-weight-medium">{stage.stage}</Label>
                          <Stack direction="horizontal" gap={4}>
                            <Label className="font-mono">{stage.count.toLocaleString()}</Label>
                            <Label className="font-mono text-ink-500">{stage.pct}%</Label>
                          </Stack>
                        </Stack>
                        <ProgressBar value={Math.log10(stage.count) * 15} className="h-6" />
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            </TabPanel>
          </Tabs>

          <Button variant="outlineInk" onClick={() => router.push("/marketing")}>Back to Marketing</Button>
          </Stack>
    </GvtewayAppLayout>
  );
}

export default function MarketingAnalyticsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <MarketingAnalyticsPageContent />
    </Suspense>
  );
}
