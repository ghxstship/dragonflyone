"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, ProgressBar,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface MarketingSource {
  id: string;
  name: string;
  channel: string;
  leads: number;
  conversions: number;
  revenue: number;
  cost: number;
  roi: number;
}

interface Campaign {
  id: string;
  name: string;
  source: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  leads: number;
  conversions: number;
  status: "Active" | "Completed" | "Paused";
}

const mockSources: MarketingSource[] = [
  { id: "SRC-001", name: "Google Ads", channel: "Paid Search", leads: 245, conversions: 32, revenue: 156000, cost: 12500, roi: 1148 },
  { id: "SRC-002", name: "LinkedIn", channel: "Social", leads: 189, conversions: 28, revenue: 142000, cost: 8900, roi: 1496 },
  { id: "SRC-003", name: "Email Marketing", channel: "Email", leads: 312, conversions: 45, revenue: 198000, cost: 2400, roi: 8150 },
  { id: "SRC-004", name: "Referrals", channel: "Organic", leads: 156, conversions: 38, revenue: 187000, cost: 0, roi: 0 },
  { id: "SRC-005", name: "Trade Shows", channel: "Events", leads: 89, conversions: 15, revenue: 78000, cost: 25000, roi: 212 },
];

const mockCampaigns: Campaign[] = [
  { id: "CMP-001", name: "Q4 Lead Gen", source: "Google Ads", startDate: "2024-10-01", endDate: "2024-12-31", budget: 15000, spent: 8500, leads: 145, conversions: 18, status: "Active" },
  { id: "CMP-002", name: "Festival Season Push", source: "LinkedIn", startDate: "2024-11-01", endDate: "2024-11-30", budget: 5000, spent: 3200, leads: 89, conversions: 12, status: "Active" },
  { id: "CMP-003", name: "Newsletter Promo", source: "Email Marketing", startDate: "2024-11-15", endDate: "2024-11-22", budget: 500, spent: 500, leads: 67, conversions: 8, status: "Completed" },
];

export default function MarketingAttributionPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("sources");
  const [selectedSource, setSelectedSource] = useState<MarketingSource | null>(null);

  const totalLeads = mockSources.reduce((s, src) => s + src.leads, 0);
  const totalRevenue = mockSources.reduce((s, src) => s + src.revenue, 0);
  const totalCost = mockSources.reduce((s, src) => s + src.cost, 0);
  const avgROI = Math.round(((totalRevenue - totalCost) / totalCost) * 100);

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Marketing Attribution</H1>
            <Label className="text-ink-400">Track marketing sources and campaign performance</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Leads" value={totalLeads} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Marketing Spend" value={formatCurrency(totalCost)} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Avg ROI" value={`${avgROI}%`} trend="up" className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "sources"} onClick={() => setActiveTab("sources")}>Sources</Tab>
              <Tab active={activeTab === "campaigns"} onClick={() => setActiveTab("campaigns")}>Campaigns</Tab>
              <Tab active={activeTab === "funnel"} onClick={() => setActiveTab("funnel")}>Funnel</Tab>
            </TabsList>

            <TabPanel active={activeTab === "sources"}>
              <Table className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead className="text-ink-400">Source</TableHead>
                    <TableHead className="text-ink-400">Channel</TableHead>
                    <TableHead className="text-ink-400">Leads</TableHead>
                    <TableHead className="text-ink-400">Conversions</TableHead>
                    <TableHead className="text-ink-400">Revenue</TableHead>
                    <TableHead className="text-ink-400">Cost</TableHead>
                    <TableHead className="text-ink-400">ROI</TableHead>
                    <TableHead className="text-ink-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSources.map((source) => (
                    <TableRow key={source.id} className="border-ink-800">
                      <TableCell><Label className="text-white">{source.name}</Label></TableCell>
                      <TableCell><Badge variant="outline">{source.channel}</Badge></TableCell>
                      <TableCell><Label className="font-mono text-white">{source.leads}</Label></TableCell>
                      <TableCell><Label className="font-mono text-white">{source.conversions}</Label></TableCell>
                      <TableCell><Label className="font-mono text-success-400">{formatCurrency(source.revenue)}</Label></TableCell>
                      <TableCell><Label className="font-mono text-ink-400">{formatCurrency(source.cost)}</Label></TableCell>
                      <TableCell><Label className={`font-mono ${source.roi > 500 ? "text-success-400" : "text-warning-400"}`}>{source.roi > 0 ? `${source.roi}%` : "N/A"}</Label></TableCell>
                      <TableCell><Button variant="ghost" size="sm" onClick={() => setSelectedSource(source)}>Details</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>

            <TabPanel active={activeTab === "campaigns"}>
              <Stack gap={4}>
                {mockCampaigns.map((campaign) => (
                  <Card key={campaign.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                    <Grid cols={6} gap={4} className="items-center">
                      <Stack gap={1}>
                        <Body className="font-display text-white">{campaign.name}</Body>
                        <Badge variant="outline">{campaign.source}</Badge>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Duration</Label>
                        <Label className="text-ink-300">{campaign.startDate} - {campaign.endDate}</Label>
                      </Stack>
                      <Stack gap={2}>
                        <Stack direction="horizontal" className="justify-between">
                          <Label size="xs" className="text-ink-500">Budget</Label>
                          <Label size="xs" className="text-ink-400">{formatCurrency(campaign.spent)} / {formatCurrency(campaign.budget)}</Label>
                        </Stack>
                        <ProgressBar value={(campaign.spent / campaign.budget) * 100} className="h-2" />
                      </Stack>
                      <Grid cols={2} gap={2}>
                        <Stack gap={0}><Label className="font-mono text-white">{campaign.leads}</Label><Label size="xs" className="text-ink-500">Leads</Label></Stack>
                        <Stack gap={0}><Label className="font-mono text-white">{campaign.conversions}</Label><Label size="xs" className="text-ink-500">Conv</Label></Stack>
                      </Grid>
                      <Badge variant={campaign.status === "Active" ? "solid" : "outline"}>{campaign.status}</Badge>
                      <Button variant="outline" size="sm">View</Button>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "funnel"}>
              <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={6}>
                  <H3>Conversion Funnel</H3>
                  <Stack gap={4}>
                    {[
                      { stage: "Website Visitors", count: 15600, pct: 100 },
                      { stage: "Leads Generated", count: 991, pct: 6.4 },
                      { stage: "Qualified Leads", count: 445, pct: 2.9 },
                      { stage: "Proposals Sent", count: 198, pct: 1.3 },
                      { stage: "Deals Won", count: 158, pct: 1.0 },
                    ].map((stage, idx) => (
                      <Stack key={idx} gap={2}>
                        <Stack direction="horizontal" className="justify-between">
                          <Label className="text-white">{stage.stage}</Label>
                          <Stack direction="horizontal" gap={4}>
                            <Label className="font-mono text-white">{stage.count.toLocaleString()}</Label>
                            <Label className="font-mono text-ink-400">{stage.pct}%</Label>
                          </Stack>
                        </Stack>
                        <ProgressBar value={stage.pct} className="h-4" />
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            </TabPanel>
          </Tabs>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/deals")}>Deals</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/analytics")}>Analytics</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/")}>Dashboard</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedSource} onClose={() => setSelectedSource(null)}>
        <ModalHeader><H3>{selectedSource?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedSource && (
            <Stack gap={4}>
              <Badge variant="outline">{selectedSource.channel}</Badge>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Leads</Label><Label className="font-mono text-white text-xl">{selectedSource.leads}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Conversions</Label><Label className="font-mono text-white text-xl">{selectedSource.conversions}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Revenue</Label><Label className="font-mono text-success-400 text-xl">{formatCurrency(selectedSource.revenue)}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Cost</Label><Label className="font-mono text-ink-400 text-xl">{formatCurrency(selectedSource.cost)}</Label></Stack>
              </Grid>
              <Stack gap={1}>
                <Label className="text-ink-400">ROI</Label>
                <Label className={`font-mono text-2xl ${selectedSource.roi > 500 ? "text-success-400" : "text-warning-400"}`}>
                  {selectedSource.roi > 0 ? `${selectedSource.roi}%` : "N/A (Organic)"}
                </Label>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedSource(null)}>Close</Button>
          <Button variant="solid">View Leads</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
