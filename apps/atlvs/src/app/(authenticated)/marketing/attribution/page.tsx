"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocalTabState } from "@ghxstship/config/hooks";
// Layout provided by route group
import {
  Container,
  H3,
  Body,
  Label,
  Grid,
  Stack,
  StatCard,
  Button,
  Card,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  Badge,
  ProgressBar,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";
import { useMarketingAttribution, type MarketingSource as APIMarketingSource, type AttributionCampaign } from "@ghxstship/config";
import { DEMO_MARKETING_SOURCES, DEMO_MARKETING_CAMPAIGNS } from '../../../../lib/demo-data';

type MarketingSource = APIMarketingSource;
type Campaign = AttributionCampaign;

export default function MarketingAttributionPage() {
  const router = useRouter();
  const { sources: apiSources, campaigns: apiCampaigns, summary, isLoading } = useMarketingAttribution();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useLocalTabState({
    storageKey: 'marketing-attribution-tab',
    defaultTab: 'sources',
  });
  const [selectedSource, setSelectedSource] = useState<MarketingSource | null>(null);

  // Use API data or fall back to demo data
  const sources: MarketingSource[] = apiSources.length > 0 ? apiSources : (DEMO_MARKETING_SOURCES as unknown as MarketingSource[]);
  const campaigns: Campaign[] = apiCampaigns.length > 0 ? apiCampaigns : (DEMO_MARKETING_CAMPAIGNS as unknown as Campaign[]);

  const totalLeads = summary?.totalLeads || sources.reduce((s, src) => s + src.leads, 0);
  const totalRevenue = summary?.totalRevenue || sources.reduce((s, src) => s + src.revenue, 0);
  const totalCost = summary?.totalCost || sources.reduce((s, src) => s + src.cost, 0);
  const avgROI = summary?.avgROI || Math.round(((totalRevenue - totalCost) / totalCost) * 100);

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  return (
    <>
      <EnterprisePageHeader
        title="Marketing Attribution"
        subtitle="Track marketing sources and campaign performance"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-pulse text-muted-foreground">Loading marketing data...</div>
            </div>
          )}

          <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total Leads" value={totalLeads} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Revenue" value={formatCurrency(totalRevenue)} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Marketing Spend" value={formatCurrency(totalCost)} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Avg ROI" value={`${avgROI}%`} trend="up" className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={isActive('sources')} onClick={() => setActiveTab('sources')}>Sources</Tab>
              <Tab active={isActive('campaigns')} onClick={() => setActiveTab('campaigns')}>Campaigns</Tab>
              <Tab active={isActive('funnel')} onClick={() => setActiveTab('funnel')}>Funnel</Tab>
            </TabsList>

            <TabPanel active={isActive('sources')}>
              <Table variant="dark" className="border-2 border-ink-800">
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
                  {sources.map((source) => (
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

            <TabPanel active={isActive('campaigns')}>
              <Stack gap={4}>
                {campaigns.map((campaign) => (
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
                      <Grid cols={2} gap={2} className="sm:grid-cols-1 lg:grid-cols-2">
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

            <TabPanel active={isActive('funnel')}>
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

            <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
              <Button variant="outline" className="border-ink-800 text-grey-400" onClick={() => router.push("/deals")}>Deals</Button>
              <Button variant="outline" className="border-ink-800 text-grey-400" onClick={() => router.push("/analytics")}>Analytics</Button>
              <Button variant="outline" className="border-ink-800 text-grey-400" onClick={() => router.push("/")}>Dashboard</Button>
            </Grid>

      <Modal open={!!selectedSource} onClose={() => setSelectedSource(null)}>
        <ModalHeader><H3>{selectedSource?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedSource && (
            <Stack gap={4}>
              <Badge variant="outline">{selectedSource.channel}</Badge>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}><Label className="text-ink-400">Leads</Label><Label className="font-mono text-white text-h6-md">{selectedSource.leads}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Conversions</Label><Label className="font-mono text-white text-h6-md">{selectedSource.conversions}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}><Label className="text-ink-400">Revenue</Label><Label className="font-mono text-success-400 text-h6-md">{formatCurrency(selectedSource.revenue)}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Cost</Label><Label className="font-mono text-ink-400 text-h6-md">{formatCurrency(selectedSource.cost)}</Label></Stack>
              </Grid>
              <Stack gap={1}>
                <Label className="text-ink-400">ROI</Label>
                <Label className={`font-mono text-h5-md ${selectedSource.roi > 500 ? "text-success-400" : "text-warning-400"}`}>
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
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
