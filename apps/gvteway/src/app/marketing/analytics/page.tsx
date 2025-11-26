"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, ProgressBar,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface CampaignMetric {
  id: string;
  name: string;
  channel: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  roas: number;
  ctr: number;
  cpc: number;
}

interface AttributionSource {
  source: string;
  conversions: number;
  revenue: number;
  percentage: number;
}

const mockCampaigns: CampaignMetric[] = [
  { id: "CMP-001", name: "Summer Fest Launch", channel: "Facebook", impressions: 245000, clicks: 8420, conversions: 312, spend: 4500, revenue: 46800, roas: 10.4, ctr: 3.44, cpc: 0.53 },
  { id: "CMP-002", name: "Early Bird Promo", channel: "Google Ads", impressions: 189000, clicks: 6230, conversions: 245, spend: 3800, revenue: 36750, roas: 9.67, ctr: 3.30, cpc: 0.61 },
  { id: "CMP-003", name: "Email Blast", channel: "Email", impressions: 45000, clicks: 4520, conversions: 189, spend: 250, revenue: 28350, roas: 113.4, ctr: 10.04, cpc: 0.06 },
  { id: "CMP-004", name: "TikTok Awareness", channel: "TikTok", impressions: 520000, clicks: 12400, conversions: 156, spend: 2800, revenue: 23400, roas: 8.36, ctr: 2.38, cpc: 0.23 },
  { id: "CMP-005", name: "Retargeting", channel: "Facebook", impressions: 78000, clicks: 3420, conversions: 198, spend: 1200, revenue: 29700, roas: 24.75, ctr: 4.38, cpc: 0.35 },
];

const mockAttribution: AttributionSource[] = [
  { source: "Paid Social", conversions: 510, revenue: 76500, percentage: 35 },
  { source: "Paid Search", conversions: 245, revenue: 36750, percentage: 20 },
  { source: "Email", conversions: 189, revenue: 28350, percentage: 15 },
  { source: "Organic Search", conversions: 156, revenue: 23400, percentage: 13 },
  { source: "Direct", conversions: 134, revenue: 20100, percentage: 11 },
  { source: "Referral", conversions: 78, revenue: 11700, percentage: 6 },
];

export default function MarketingAnalyticsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("30d");

  const totalSpend = mockCampaigns.reduce((s, c) => s + c.spend, 0);
  const totalRevenue = mockCampaigns.reduce((s, c) => s + c.revenue, 0);
  const totalConversions = mockCampaigns.reduce((s, c) => s + c.conversions, 0);
  const overallROAS = totalRevenue / totalSpend;

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  return (
    <UISection className="min-h-screen bg-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack direction="horizontal" className="justify-between items-start">
            <Stack gap={2}>
              <H1>MARKETING ANALYTICS</H1>
              <Body className="text-grey-600">Campaign performance and attribution dashboard</Body>
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
              <Tab active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>Overview</Tab>
              <Tab active={activeTab === "campaigns"} onClick={() => setActiveTab("campaigns")}>Campaigns</Tab>
              <Tab active={activeTab === "attribution"} onClick={() => setActiveTab("attribution")}>Attribution</Tab>
              <Tab active={activeTab === "funnel"} onClick={() => setActiveTab("funnel")}>Funnel</Tab>
            </TabsList>

            <TabPanel active={activeTab === "overview"}>
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
                      <Card className="p-4 border border-grey-200 text-center">
                        <Label className="font-mono text-2xl">{(mockCampaigns.reduce((s, c) => s + c.ctr, 0) / mockCampaigns.length).toFixed(2)}%</Label>
                        <Label className="text-grey-500">Avg CTR</Label>
                      </Card>
                      <Card className="p-4 border border-grey-200 text-center">
                        <Label className="font-mono text-2xl">${(totalSpend / totalConversions).toFixed(2)}</Label>
                        <Label className="text-grey-500">Cost per Conversion</Label>
                      </Card>
                      <Card className="p-4 border border-grey-200 text-center">
                        <Label className="font-mono text-2xl">${(totalRevenue / totalConversions).toFixed(0)}</Label>
                        <Label className="text-grey-500">Avg Order Value</Label>
                      </Card>
                      <Card className="p-4 border border-grey-200 text-center">
                        <Label className="font-mono text-2xl">{((totalConversions / mockCampaigns.reduce((s, c) => s + c.clicks, 0)) * 100).toFixed(1)}%</Label>
                        <Label className="text-grey-500">Conversion Rate</Label>
                      </Card>
                    </Grid>
                  </Stack>
                </Card>
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "campaigns"}>
              <Table className="border-2 border-black">
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
                      <TableCell><Label className="font-medium">{campaign.name}</Label></TableCell>
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

            <TabPanel active={activeTab === "attribution"}>
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
                    <Body className="text-grey-600">
                      Last Click attribution assigns 100% of the conversion credit to the last touchpoint before conversion.
                    </Body>
                    <Card className="p-4 border border-grey-200">
                      <Stack gap={2}>
                        <Label className="text-grey-500">Top Converting Path</Label>
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

            <TabPanel active={activeTab === "funnel"}>
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
                          <Label className="font-medium">{stage.stage}</Label>
                          <Stack direction="horizontal" gap={4}>
                            <Label className="font-mono">{stage.count.toLocaleString()}</Label>
                            <Label className="font-mono text-grey-500">{stage.pct}%</Label>
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

          <Button variant="outline" onClick={() => router.push("/marketing")}>Back to Marketing</Button>
        </Stack>
      </Container>
    </UISection>
  );
}
