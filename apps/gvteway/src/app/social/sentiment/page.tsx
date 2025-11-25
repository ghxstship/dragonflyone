"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, Alert, ProgressBar,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface SentimentAlert {
  id: string;
  type: "Negative Spike" | "Trending Topic" | "Crisis" | "Positive Surge";
  severity: "Low" | "Medium" | "High" | "Critical";
  source: string;
  keyword: string;
  mentions: number;
  sentiment: number;
  timestamp: string;
  status: "Active" | "Acknowledged" | "Resolved";
}

const mockAlerts: SentimentAlert[] = [
  { id: "SA-001", type: "Negative Spike", severity: "High", source: "Twitter", keyword: "ticket issues", mentions: 156, sentiment: -0.72, timestamp: "10 min ago", status: "Active" },
  { id: "SA-002", type: "Trending Topic", severity: "Low", source: "Instagram", keyword: "lineup reveal", mentions: 2450, sentiment: 0.85, timestamp: "25 min ago", status: "Acknowledged" },
  { id: "SA-003", type: "Positive Surge", severity: "Low", source: "TikTok", keyword: "dance challenge", mentions: 8900, sentiment: 0.92, timestamp: "1 hr ago", status: "Resolved" },
  { id: "SA-004", type: "Crisis", severity: "Critical", source: "Twitter", keyword: "refund", mentions: 89, sentiment: -0.88, timestamp: "5 min ago", status: "Active" },
];

const mockMetrics = {
  overall: 0.72,
  positive: 68,
  neutral: 22,
  negative: 10,
  volume: 15600,
  trending: ["#SummerFest2024", "lineup", "tickets", "VIP"],
};

export default function SentimentAnalysisPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedAlert, setSelectedAlert] = useState<SentimentAlert | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "text-red-600 bg-red-100";
      case "High": return "text-orange-600 bg-orange-100";
      case "Medium": return "text-yellow-600 bg-yellow-100";
      case "Low": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-red-600";
      case "Acknowledged": return "text-yellow-600";
      case "Resolved": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  const activeAlerts = mockAlerts.filter(a => a.status === "Active").length;
  const criticalAlerts = mockAlerts.filter(a => a.severity === "Critical" && a.status === "Active").length;

  return (
    <UISection className="min-h-screen bg-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>SENTIMENT ANALYSIS</H1>
            <Body className="text-gray-600">Real-time social sentiment monitoring with alert triggers</Body>
          </Stack>

          {criticalAlerts > 0 && (
            <Alert variant="error">
              ⚠️ {criticalAlerts} critical alert(s) require immediate attention
            </Alert>
          )}

          <Grid cols={4} gap={6}>
            <StatCard label="Overall Sentiment" value={`${(mockMetrics.overall * 100).toFixed(0)}%`} trend="up" className="border-2 border-black" />
            <StatCard label="Mentions (24h)" value={mockMetrics.volume.toLocaleString()} className="border-2 border-black" />
            <StatCard label="Active Alerts" value={activeAlerts} trend={activeAlerts > 0 ? "down" : "neutral"} className="border-2 border-black" />
            <StatCard label="Positive Rate" value={`${mockMetrics.positive}%`} className="border-2 border-black" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")}>Dashboard</Tab>
              <Tab active={activeTab === "alerts"} onClick={() => setActiveTab("alerts")}>Alerts</Tab>
              <Tab active={activeTab === "keywords"} onClick={() => setActiveTab("keywords")}>Keywords</Tab>
            </TabsList>

            <TabPanel active={activeTab === "dashboard"}>
              <Grid cols={2} gap={6}>
                <Card className="border-2 border-black p-6">
                  <Stack gap={4}>
                    <H3>Sentiment Breakdown</H3>
                    <Stack gap={3}>
                      <Stack gap={1}>
                        <Stack direction="horizontal" className="justify-between">
                          <Label>Positive</Label>
                          <Label className="text-green-600">{mockMetrics.positive}%</Label>
                        </Stack>
                        <ProgressBar value={mockMetrics.positive} className="h-3 bg-green-100" />
                      </Stack>
                      <Stack gap={1}>
                        <Stack direction="horizontal" className="justify-between">
                          <Label>Neutral</Label>
                          <Label className="text-gray-600">{mockMetrics.neutral}%</Label>
                        </Stack>
                        <ProgressBar value={mockMetrics.neutral} className="h-3 bg-gray-100" />
                      </Stack>
                      <Stack gap={1}>
                        <Stack direction="horizontal" className="justify-between">
                          <Label>Negative</Label>
                          <Label className="text-red-600">{mockMetrics.negative}%</Label>
                        </Stack>
                        <ProgressBar value={mockMetrics.negative} className="h-3 bg-red-100" />
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
                <Card className="border-2 border-black p-6">
                  <Stack gap={4}>
                    <H3>Trending Keywords</H3>
                    <Stack direction="horizontal" gap={2} className="flex-wrap">
                      {mockMetrics.trending.map((keyword, idx) => (
                        <Badge key={idx} variant="outline" className="text-lg py-2 px-4">{keyword}</Badge>
                      ))}
                    </Stack>
                    <Stack gap={2}>
                      <Label className="text-gray-500">Top Sources</Label>
                      {["Twitter (45%)", "Instagram (32%)", "TikTok (18%)", "Facebook (5%)"].map((src, idx) => (
                        <Label key={idx}>{src}</Label>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "alerts"}>
              <Table className="border-2 border-black">
                <TableHeader>
                  <TableRow className="bg-black text-white">
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Keyword</TableHead>
                    <TableHead>Mentions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell><Label>{alert.type}</Label></TableCell>
                      <TableCell><Badge variant="outline" className={getSeverityColor(alert.severity)}>{alert.severity}</Badge></TableCell>
                      <TableCell><Label>{alert.source}</Label></TableCell>
                      <TableCell><Label className="font-mono">{alert.keyword}</Label></TableCell>
                      <TableCell><Label className="font-mono">{alert.mentions}</Label></TableCell>
                      <TableCell><Label className={getStatusColor(alert.status)}>{alert.status}</Label></TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => setSelectedAlert(alert)}>View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>

            <TabPanel active={activeTab === "keywords"}>
              <Card className="border-2 border-black p-6">
                <Stack gap={4}>
                  <H3>Monitored Keywords</H3>
                  <Grid cols={3} gap={4}>
                    {["Summer Fest", "tickets", "lineup", "VIP", "refund", "parking", "merch", "security", "weather"].map((kw, idx) => (
                      <Card key={idx} className="p-3 border border-gray-200">
                        <Stack direction="horizontal" className="justify-between items-center">
                          <Label>{kw}</Label>
                          <Button variant="ghost" size="sm">Remove</Button>
                        </Stack>
                      </Card>
                    ))}
                  </Grid>
                  <Stack direction="horizontal" gap={2}>
                    <Input placeholder="Add keyword..." className="border-2 border-black flex-1" />
                    <Button variant="solid">Add</Button>
                  </Stack>
                </Stack>
              </Card>
            </TabPanel>
          </Tabs>

          <Button variant="outline" onClick={() => router.push("/social")}>Back to Social</Button>
        </Stack>
      </Container>

      <Modal open={!!selectedAlert} onClose={() => setSelectedAlert(null)}>
        <ModalHeader><H3>Alert Details</H3></ModalHeader>
        <ModalBody>
          {selectedAlert && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between">
                <Label>{selectedAlert.type}</Label>
                <Badge variant="outline" className={getSeverityColor(selectedAlert.severity)}>{selectedAlert.severity}</Badge>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-gray-500">Source</Label><Label>{selectedAlert.source}</Label></Stack>
                <Stack gap={1}><Label className="text-gray-500">Keyword</Label><Label className="font-mono">{selectedAlert.keyword}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-gray-500">Mentions</Label><Label className="font-mono">{selectedAlert.mentions}</Label></Stack>
                <Stack gap={1}><Label className="text-gray-500">Sentiment</Label><Label className={selectedAlert.sentiment < 0 ? "text-red-600" : "text-green-600"}>{(selectedAlert.sentiment * 100).toFixed(0)}%</Label></Stack>
              </Grid>
              <Stack gap={1}><Label className="text-gray-500">Status</Label><Label className={getStatusColor(selectedAlert.status)}>{selectedAlert.status}</Label></Stack>
              <Stack gap={1}><Label className="text-gray-500">Detected</Label><Label>{selectedAlert.timestamp}</Label></Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedAlert(null)}>Close</Button>
          {selectedAlert?.status === "Active" && <Button variant="outline">Acknowledge</Button>}
          {selectedAlert?.status !== "Resolved" && <Button variant="solid">Resolve</Button>}
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
