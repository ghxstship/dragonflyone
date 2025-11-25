"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, ProgressBar,
} from "@ghxstship/ui";

interface AssetUtilization {
  id: string;
  name: string;
  category: string;
  purchasePrice: number;
  currentValue: number;
  totalRevenue: number;
  utilizationRate: number;
  daysDeployed: number;
  daysAvailable: number;
  projectCount: number;
  roi: number;
  costPerDay: number;
  revenuePerDay: number;
}

const mockUtilizationData: AssetUtilization[] = [
  { id: "AST-001", name: "Meyer Sound LEO Line Array", category: "Audio", purchasePrice: 285000, currentValue: 228000, totalRevenue: 142500, utilizationRate: 0.82, daysDeployed: 299, daysAvailable: 365, projectCount: 47, roi: 50, costPerDay: 780, revenuePerDay: 476 },
  { id: "AST-002", name: "Robe MegaPointe (24x)", category: "Lighting", purchasePrice: 156000, currentValue: 124800, totalRevenue: 98400, utilizationRate: 0.91, daysDeployed: 332, daysAvailable: 365, projectCount: 52, roi: 63, costPerDay: 427, revenuePerDay: 296 },
  { id: "AST-003", name: "disguise gx 2c Media Server", category: "Video", purchasePrice: 48000, currentValue: 38400, totalRevenue: 28500, utilizationRate: 0.75, daysDeployed: 274, daysAvailable: 365, projectCount: 38, roi: 59, costPerDay: 131, revenuePerDay: 104 },
  { id: "AST-004", name: "Staging Deck System", category: "Staging", purchasePrice: 95000, currentValue: 76000, totalRevenue: 51300, utilizationRate: 0.68, daysDeployed: 248, daysAvailable: 365, projectCount: 41, roi: 54, costPerDay: 260, revenuePerDay: 207 },
  { id: "AST-005", name: "Chain Motor Hoists (20x)", category: "Rigging", purchasePrice: 42000, currentValue: 33600, totalRevenue: 33600, utilizationRate: 0.79, daysDeployed: 288, daysAvailable: 365, projectCount: 56, roi: 80, costPerDay: 115, revenuePerDay: 117 },
];

const categoryMetrics = [
  { category: "Audio", totalValue: 456000, totalRevenue: 198000, avgUtilization: 0.78, assetCount: 12 },
  { category: "Lighting", totalValue: 324000, totalRevenue: 156000, avgUtilization: 0.85, assetCount: 8 },
  { category: "Video", totalValue: 186000, totalRevenue: 89000, avgUtilization: 0.72, assetCount: 6 },
  { category: "Staging", totalValue: 145000, totalRevenue: 67000, avgUtilization: 0.65, assetCount: 4 },
  { category: "Rigging", totalValue: 98000, totalRevenue: 52000, avgUtilization: 0.81, assetCount: 5 },
];

export default function AssetUtilizationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [dateRange, setDateRange] = useState("ytd");

  const totalAssetValue = categoryMetrics.reduce((sum, c) => sum + c.totalValue, 0);
  const totalRevenue = categoryMetrics.reduce((sum, c) => sum + c.totalRevenue, 0);
  const avgUtilization = categoryMetrics.reduce((sum, c) => sum + c.avgUtilization, 0) / categoryMetrics.length;
  const overallROI = ((totalRevenue / totalAssetValue) * 100).toFixed(1);

  const filteredAssets = selectedCategory === "All" 
    ? mockUtilizationData 
    : mockUtilizationData.filter(a => a.category === selectedCategory);

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Asset Utilization & ROI</H1>
            <Label className="text-ink-400">Performance analytics, utilization rates, and return on investment</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Asset Value" value={`$${(totalAssetValue / 1000).toFixed(0)}K`} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="YTD Revenue" value={`$${(totalRevenue / 1000).toFixed(0)}K`} trend="up" className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Avg Utilization" value={`${(avgUtilization * 100).toFixed(0)}%`} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Overall ROI" value={`${overallROI}%`} trend="up" className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Grid cols={3} gap={4}>
            <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="border-ink-700 bg-black text-white">
              <option value="All">All Categories</option>
              {categoryMetrics.map(c => <option key={c.category} value={c.category}>{c.category}</option>)}
            </Select>
            <Select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="border-ink-700 bg-black text-white">
              <option value="ytd">Year to Date</option>
              <option value="q4">Q4 2024</option>
              <option value="q3">Q3 2024</option>
              <option value="12m">Last 12 Months</option>
            </Select>
            <Button variant="outline" className="border-ink-700 text-ink-400">Export Report</Button>
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>Overview</Tab>
              <Tab active={activeTab === "assets"} onClick={() => setActiveTab("assets")}>By Asset</Tab>
              <Tab active={activeTab === "category"} onClick={() => setActiveTab("category")}>By Category</Tab>
              <Tab active={activeTab === "trends"} onClick={() => setActiveTab("trends")}>Trends</Tab>
            </TabsList>

            <TabPanel active={activeTab === "overview"}>
              <Grid cols={2} gap={6}>
                <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                  <Stack gap={4}>
                    <H3>Utilization by Category</H3>
                    {categoryMetrics.map((cat) => (
                      <Stack key={cat.category} gap={2}>
                        <Stack direction="horizontal" className="justify-between">
                          <Label className="text-white">{cat.category}</Label>
                          <Label className="text-ink-400">{(cat.avgUtilization * 100).toFixed(0)}%</Label>
                        </Stack>
                        <ProgressBar value={cat.avgUtilization * 100} variant="inverse" size="sm" />
                      </Stack>
                    ))}
                  </Stack>
                </Card>

                <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                  <Stack gap={4}>
                    <H3>Revenue by Category</H3>
                    {categoryMetrics.map((cat) => (
                      <Card key={cat.category} className="p-3 bg-ink-800 border border-ink-700">
                        <Grid cols={3} gap={2}>
                          <Label className="text-white">{cat.category}</Label>
                          <Label className="font-mono text-white">${(cat.totalRevenue / 1000).toFixed(0)}K</Label>
                          <Label className="text-ink-400 text-right">{cat.assetCount} assets</Label>
                        </Grid>
                      </Card>
                    ))}
                  </Stack>
                </Card>
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "assets"}>
              <Table className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead>Asset</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Projects</TableHead>
                    <TableHead>ROI</TableHead>
                    <TableHead>Cost/Day</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell>
                        <Stack gap={1}>
                          <Body className="font-display text-white">{asset.name}</Body>
                          <Label size="xs" className="text-ink-500">{asset.id} • {asset.category}</Label>
                        </Stack>
                      </TableCell>
                      <TableCell className="font-mono text-white">${(asset.currentValue / 1000).toFixed(0)}K</TableCell>
                      <TableCell className="font-mono text-green-400">${(asset.totalRevenue / 1000).toFixed(0)}K</TableCell>
                      <TableCell>
                        <Stack gap={1}>
                          <ProgressBar value={asset.utilizationRate * 100} variant="inverse" size="sm" className="w-20" />
                          <Label size="xs" className="text-ink-400">{(asset.utilizationRate * 100).toFixed(0)}%</Label>
                        </Stack>
                      </TableCell>
                      <TableCell className="text-ink-300">{asset.projectCount}</TableCell>
                      <TableCell><Label className={asset.roi > 50 ? "text-green-400" : "text-yellow-400"}>{asset.roi}%</Label></TableCell>
                      <TableCell className="font-mono text-ink-400">${asset.costPerDay}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>

            <TabPanel active={activeTab === "category"}>
              <Grid cols={3} gap={6}>
                {categoryMetrics.map((cat) => (
                  <Card key={cat.category} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between items-start">
                        <H3>{cat.category}</H3>
                        <Badge variant="outline">{cat.assetCount} assets</Badge>
                      </Stack>
                      <Grid cols={2} gap={4}>
                        <Stack gap={1}>
                          <Label size="xs" className="text-ink-500">Total Value</Label>
                          <Label className="font-mono text-white text-lg">${(cat.totalValue / 1000).toFixed(0)}K</Label>
                        </Stack>
                        <Stack gap={1}>
                          <Label size="xs" className="text-ink-500">Revenue</Label>
                          <Label className="font-mono text-green-400 text-lg">${(cat.totalRevenue / 1000).toFixed(0)}K</Label>
                        </Stack>
                      </Grid>
                      <Stack gap={2}>
                        <Stack direction="horizontal" className="justify-between">
                          <Label className="text-ink-400">Utilization</Label>
                          <Label className="text-white">{(cat.avgUtilization * 100).toFixed(0)}%</Label>
                        </Stack>
                        <ProgressBar value={cat.avgUtilization * 100} variant="inverse" size="sm" />
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">ROI</Label>
                        <Label className="text-green-400 text-lg">{((cat.totalRevenue / cat.totalValue) * 100).toFixed(1)}%</Label>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "trends"}>
              <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={4}>
                  <H3>Utilization Trends</H3>
                  <Card className="h-64 bg-ink-800 border border-ink-700 flex items-center justify-center">
                    <Stack gap={2} className="text-center">
                      <Label className="text-ink-400">Chart Visualization</Label>
                      <Body className="text-ink-500">Line chart showing utilization trends over time</Body>
                    </Stack>
                  </Card>
                  <Grid cols={4} gap={4}>
                    <Card className="p-3 bg-ink-800 border border-ink-700">
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Peak Month</Label>
                        <Label className="text-white">October 2024</Label>
                        <Label size="xs" className="text-green-400">92% utilization</Label>
                      </Stack>
                    </Card>
                    <Card className="p-3 bg-ink-800 border border-ink-700">
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Low Month</Label>
                        <Label className="text-white">January 2024</Label>
                        <Label size="xs" className="text-yellow-400">54% utilization</Label>
                      </Stack>
                    </Card>
                    <Card className="p-3 bg-ink-800 border border-ink-700">
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">YoY Change</Label>
                        <Label className="text-green-400">+12%</Label>
                      </Stack>
                    </Card>
                    <Card className="p-3 bg-ink-800 border border-ink-700">
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Projected EOY</Label>
                        <Label className="text-white">78%</Label>
                      </Stack>
                    </Card>
                  </Grid>
                </Stack>
              </Card>
            </TabPanel>
          </Tabs>

          <Grid cols={3} gap={4}>
            <Button variant="outlineWhite" onClick={() => router.push("/assets")}>Back to Assets</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Schedule Report</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/reports")}>Full Reports</Button>
          </Grid>
        </Stack>
      </Container>
    </UISection>
  );
}
