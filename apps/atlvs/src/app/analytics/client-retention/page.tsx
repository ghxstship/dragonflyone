"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, ProgressBar,
} from "@ghxstship/ui";

interface ClientRetention {
  id: string;
  clientName: string;
  segment: "Enterprise" | "Mid-Market" | "SMB";
  firstDealDate: string;
  totalDeals: number;
  totalRevenue: number;
  lastDealDate: string;
  status: "Active" | "At Risk" | "Churned" | "New";
  healthScore: number;
  daysSinceLastDeal: number;
  avgDealSize: number;
  npsScore?: number;
}

interface ChurnRisk {
  clientId: string;
  clientName: string;
  riskLevel: "High" | "Medium" | "Low";
  riskFactors: string[];
  recommendedActions: string[];
  lastContact: string;
}

const mockClients: ClientRetention[] = [
  { id: "CL-001", clientName: "TechCorp Events", segment: "Enterprise", firstDealDate: "2022-03-15", totalDeals: 12, totalRevenue: 450000, lastDealDate: "2024-11-10", status: "Active", healthScore: 92, daysSinceLastDeal: 14, avgDealSize: 37500, npsScore: 9 },
  { id: "CL-002", clientName: "Festival Productions", segment: "Enterprise", firstDealDate: "2021-06-20", totalDeals: 18, totalRevenue: 680000, lastDealDate: "2024-10-05", status: "Active", healthScore: 88, daysSinceLastDeal: 50, avgDealSize: 37778, npsScore: 8 },
  { id: "CL-003", clientName: "Corporate Events Inc", segment: "Mid-Market", firstDealDate: "2023-01-10", totalDeals: 6, totalRevenue: 125000, lastDealDate: "2024-08-15", status: "At Risk", healthScore: 45, daysSinceLastDeal: 101, avgDealSize: 20833, npsScore: 6 },
  { id: "CL-004", clientName: "StartUp Ventures", segment: "SMB", firstDealDate: "2024-02-01", totalDeals: 2, totalRevenue: 28000, lastDealDate: "2024-05-20", status: "At Risk", healthScore: 35, daysSinceLastDeal: 188, avgDealSize: 14000 },
  { id: "CL-005", clientName: "Media Group LLC", segment: "Mid-Market", firstDealDate: "2022-09-01", totalDeals: 8, totalRevenue: 195000, lastDealDate: "2024-11-20", status: "Active", healthScore: 85, daysSinceLastDeal: 4, avgDealSize: 24375, npsScore: 8 },
  { id: "CL-006", clientName: "Local Business Co", segment: "SMB", firstDealDate: "2023-06-15", totalDeals: 3, totalRevenue: 35000, lastDealDate: "2024-01-10", status: "Churned", healthScore: 15, daysSinceLastDeal: 319, avgDealSize: 11667, npsScore: 4 },
  { id: "CL-007", clientName: "Innovation Labs", segment: "Mid-Market", firstDealDate: "2024-10-01", totalDeals: 1, totalRevenue: 45000, lastDealDate: "2024-10-01", status: "New", healthScore: 75, daysSinceLastDeal: 54, avgDealSize: 45000 },
];

const mockChurnRisks: ChurnRisk[] = [
  { clientId: "CL-003", clientName: "Corporate Events Inc", riskLevel: "High", riskFactors: ["No activity in 100+ days", "Declining NPS score", "Reduced deal frequency"], recommendedActions: ["Schedule executive check-in", "Offer loyalty discount", "Review service quality"], lastContact: "2024-09-15" },
  { clientId: "CL-004", clientName: "StartUp Ventures", riskLevel: "High", riskFactors: ["No activity in 180+ days", "No NPS response", "Budget constraints mentioned"], recommendedActions: ["Reach out with flexible pricing", "Offer smaller package options"], lastContact: "2024-07-01" },
];

export default function ClientRetentionPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSegment, setSelectedSegment] = useState("All");

  const activeClients = mockClients.filter(c => c.status === "Active").length;
  const atRiskClients = mockClients.filter(c => c.status === "At Risk").length;
  const churnedClients = mockClients.filter(c => c.status === "Churned").length;
  const retentionRate = ((activeClients / (activeClients + churnedClients)) * 100).toFixed(1);
  const avgHealthScore = Math.round(mockClients.reduce((sum, c) => sum + c.healthScore, 0) / mockClients.length);

  const filteredClients = selectedSegment === "All" ? mockClients : mockClients.filter(c => c.segment === selectedSegment);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-green-400";
      case "At Risk": return "text-yellow-400";
      case "Churned": return "text-red-400";
      case "New": return "text-blue-400";
      default: return "text-ink-400";
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Client Retention & Churn Analysis</H1>
            <Label className="text-ink-400">Monitor client health, identify churn risks, and improve retention</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Retention Rate" value={`${retentionRate}%`} trend="up" className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Active Clients" value={activeClients} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="At Risk" value={atRiskClients} trend={atRiskClients > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Avg Health Score" value={avgHealthScore} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Select value={selectedSegment} onChange={(e) => setSelectedSegment(e.target.value)} className="border-ink-700 bg-black text-white w-48">
            <option value="All">All Segments</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Mid-Market">Mid-Market</option>
            <option value="SMB">SMB</option>
          </Select>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>Client Overview</Tab>
              <Tab active={activeTab === "at-risk"} onClick={() => setActiveTab("at-risk")}>At Risk ({atRiskClients})</Tab>
              <Tab active={activeTab === "cohort"} onClick={() => setActiveTab("cohort")}>Cohort Analysis</Tab>
            </TabsList>

            <TabPanel active={activeTab === "overview"}>
              <Table className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead>Client</TableHead>
                    <TableHead>Segment</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Deals</TableHead>
                    <TableHead>Last Deal</TableHead>
                    <TableHead>Health</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id} className={client.status === "At Risk" ? "bg-yellow-900/10" : client.status === "Churned" ? "bg-red-900/10" : ""}>
                      <TableCell>
                        <Stack gap={1}>
                          <Body className="text-white">{client.clientName}</Body>
                          <Label size="xs" className="text-ink-500">Since {client.firstDealDate}</Label>
                        </Stack>
                      </TableCell>
                      <TableCell><Badge variant="outline">{client.segment}</Badge></TableCell>
                      <TableCell className="font-mono text-white">${(client.totalRevenue / 1000).toFixed(0)}K</TableCell>
                      <TableCell><Label className="text-ink-300">{client.totalDeals}</Label></TableCell>
                      <TableCell>
                        <Stack gap={1}>
                          <Label className="font-mono text-ink-300">{client.lastDealDate}</Label>
                          <Label size="xs" className="text-ink-500">{client.daysSinceLastDeal} days ago</Label>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack gap={1}>
                          <Label className={`font-mono ${getHealthColor(client.healthScore)}`}>{client.healthScore}</Label>
                          <ProgressBar value={client.healthScore} size="sm" className="w-16" />
                        </Stack>
                      </TableCell>
                      <TableCell><Label className={getStatusColor(client.status)}>{client.status}</Label></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>

            <TabPanel active={activeTab === "at-risk"}>
              <Stack gap={4}>
                {mockChurnRisks.map((risk) => (
                  <Card key={risk.clientId} className="border-2 border-yellow-800 bg-yellow-900/10 p-6">
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Stack gap={1}>
                          <Body className="font-display text-white text-lg">{risk.clientName}</Body>
                          <Label className="text-ink-500">Last contact: {risk.lastContact}</Label>
                        </Stack>
                        <Badge variant="solid">{risk.riskLevel} Risk</Badge>
                      </Stack>

                      <Grid cols={2} gap={6}>
                        <Stack gap={2}>
                          <Label className="text-ink-400">Risk Factors</Label>
                          {risk.riskFactors.map((factor, idx) => (
                            <Stack key={idx} direction="horizontal" gap={2}>
                              <Label className="text-red-400">⚠</Label>
                              <Label className="text-ink-300">{factor}</Label>
                            </Stack>
                          ))}
                        </Stack>
                        <Stack gap={2}>
                          <Label className="text-ink-400">Recommended Actions</Label>
                          {risk.recommendedActions.map((action, idx) => (
                            <Stack key={idx} direction="horizontal" gap={2}>
                              <Label className="text-green-400">→</Label>
                              <Label className="text-ink-300">{action}</Label>
                            </Stack>
                          ))}
                        </Stack>
                      </Grid>

                      <Stack direction="horizontal" gap={4}>
                        <Button variant="outline" size="sm">Schedule Call</Button>
                        <Button variant="outline" size="sm">Send Email</Button>
                        <Button variant="outline" size="sm">Create Task</Button>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "cohort"}>
              <Grid cols={2} gap={6}>
                <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                  <Stack gap={4}>
                    <H3>Retention by Cohort</H3>
                    <Stack gap={3}>
                      {[
                        { cohort: "2024 Q4", clients: 5, retained: 5, rate: 100 },
                        { cohort: "2024 Q3", clients: 8, retained: 7, rate: 87.5 },
                        { cohort: "2024 Q2", clients: 12, retained: 10, rate: 83.3 },
                        { cohort: "2024 Q1", clients: 10, retained: 8, rate: 80 },
                        { cohort: "2023", clients: 25, retained: 18, rate: 72 },
                      ].map((item) => (
                        <Stack key={item.cohort} gap={2}>
                          <Stack direction="horizontal" className="justify-between">
                            <Label className="text-white">{item.cohort}</Label>
                            <Label className="text-ink-400">{item.retained}/{item.clients} ({item.rate}%)</Label>
                          </Stack>
                          <ProgressBar value={item.rate} size="sm" />
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
                <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                  <Stack gap={4}>
                    <H3>Churn Reasons</H3>
                    <Stack gap={3}>
                      {[
                        { reason: "Budget constraints", count: 5, pct: 35 },
                        { reason: "Competitor switch", count: 3, pct: 21 },
                        { reason: "Service issues", count: 3, pct: 21 },
                        { reason: "Business closed", count: 2, pct: 14 },
                        { reason: "Other", count: 1, pct: 7 },
                      ].map((item) => (
                        <Card key={item.reason} className="p-3 bg-ink-800 border border-ink-700">
                          <Stack direction="horizontal" className="justify-between items-center">
                            <Label className="text-white">{item.reason}</Label>
                            <Stack direction="horizontal" gap={2}>
                              <Label className="font-mono text-ink-400">{item.count}</Label>
                              <Label className="text-ink-500">({item.pct}%)</Label>
                            </Stack>
                          </Stack>
                        </Card>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            </TabPanel>
          </Tabs>

          <Grid cols={3} gap={4}>
            <Button variant="outlineWhite">Export Report</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Schedule Review</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/analytics")}>Back to Analytics</Button>
          </Grid>
        </Stack>
      </Container>
    </UISection>
  );
}
