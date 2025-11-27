"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, ProgressBar,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
} from "@ghxstship/ui";

interface BidOpportunity {
  id: string;
  title: string;
  client: string;
  value: number;
  dueDate: string;
  status: "Pending Review" | "Bid" | "No Bid" | "Under Evaluation";
  score?: number;
  criteria: { name: string; score: number; weight: number }[];
  recommendation?: "Bid" | "No Bid";
  notes?: string;
}

const mockOpportunities: BidOpportunity[] = [
  { id: "OPP-001", title: "Summer Festival 2025", client: "Festival Productions", value: 450000, dueDate: "2024-12-01", status: "Pending Review", criteria: [{ name: "Strategic Fit", score: 8, weight: 25 }, { name: "Profitability", score: 7, weight: 30 }, { name: "Resource Availability", score: 6, weight: 20 }, { name: "Win Probability", score: 8, weight: 25 }], recommendation: "Bid" },
  { id: "OPP-002", title: "Corporate Conference", client: "Tech Corp", value: 85000, dueDate: "2024-11-28", status: "Under Evaluation", criteria: [{ name: "Strategic Fit", score: 5, weight: 25 }, { name: "Profitability", score: 4, weight: 30 }, { name: "Resource Availability", score: 3, weight: 20 }, { name: "Win Probability", score: 6, weight: 25 }] },
  { id: "OPP-003", title: "Concert Series", client: "Live Nation", value: 780000, dueDate: "2024-12-15", status: "Bid", score: 82, criteria: [{ name: "Strategic Fit", score: 9, weight: 25 }, { name: "Profitability", score: 8, weight: 30 }, { name: "Resource Availability", score: 7, weight: 20 }, { name: "Win Probability", score: 9, weight: 25 }], notes: "High-profile opportunity, strong relationship with client" },
  { id: "OPP-004", title: "Small Venue Event", client: "Local Promoter", value: 25000, dueDate: "2024-11-25", status: "No Bid", score: 38, criteria: [{ name: "Strategic Fit", score: 3, weight: 25 }, { name: "Profitability", score: 2, weight: 30 }, { name: "Resource Availability", score: 5, weight: 20 }, { name: "Win Probability", score: 6, weight: 25 }], notes: "Low margin, conflicts with larger project" },
];

export default function BidDecisionPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedOpp, setSelectedOpp] = useState<BidOpportunity | null>(null);

  const pendingCount = mockOpportunities.filter(o => o.status === "Pending Review" || o.status === "Under Evaluation").length;
  const bidCount = mockOpportunities.filter(o => o.status === "Bid").length;
  const noBidCount = mockOpportunities.filter(o => o.status === "No Bid").length;
  const totalPipelineValue = mockOpportunities.filter(o => o.status === "Bid").reduce((s, o) => s + o.value, 0);

  const calculateScore = (criteria: { score: number; weight: number }[]) => {
    const totalWeight = criteria.reduce((s, c) => s + c.weight, 0);
    const weightedScore = criteria.reduce((s, c) => s + (c.score * c.weight), 0);
    return Math.round((weightedScore / totalWeight) * 10);
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-success-400";
    if (score >= 50) return "text-warning-400";
    return "text-error-400";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Bid": return "text-success-400";
      case "No Bid": return "text-error-400";
      case "Pending Review": return "text-warning-400";
      case "Under Evaluation": return "text-info-400";
      default: return "text-ink-400";
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const filteredOpps = activeTab === "all" ? mockOpportunities :
    activeTab === "pending" ? mockOpportunities.filter(o => o.status === "Pending Review" || o.status === "Under Evaluation") :
    mockOpportunities.filter(o => o.status.toLowerCase().replace(" ", "") === activeTab);

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Bid/No-Bid Decisions</H1>
            <Label className="text-ink-400">Opportunity evaluation and decision workflow</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Pending Review" value={pendingCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Bid Decisions" value={bidCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="No-Bid" value={noBidCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Pipeline Value" value={formatCurrency(totalPipelineValue)} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "pending"} onClick={() => setActiveTab("pending")}>Pending</Tab>
              <Tab active={activeTab === "bid"} onClick={() => setActiveTab("bid")}>Bid</Tab>
              <Tab active={activeTab === "nobid"} onClick={() => setActiveTab("nobid")}>No Bid</Tab>
              <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
            </TabsList>
          </Tabs>

          <Stack gap={4}>
            {filteredOpps.map((opp) => {
              const score = opp.score || calculateScore(opp.criteria);
              return (
                <Card key={opp.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                  <Grid cols={6} gap={4} className="items-center">
                    <Stack gap={1}>
                      <Body className="font-display text-white">{opp.title}</Body>
                      <Label className="text-ink-400">{opp.client}</Label>
                    </Stack>
                    <Stack gap={1}>
                      <Label size="xs" className="text-ink-500">Value</Label>
                      <Label className="font-mono text-white">{formatCurrency(opp.value)}</Label>
                    </Stack>
                    <Stack gap={1}>
                      <Label size="xs" className="text-ink-500">Due Date</Label>
                      <Label className="text-ink-300">{opp.dueDate}</Label>
                    </Stack>
                    <Stack gap={2}>
                      <Stack direction="horizontal" className="justify-between">
                        <Label size="xs" className="text-ink-500">Score</Label>
                        <Label className={`font-mono ${getScoreColor(score)}`}>{score}/100</Label>
                      </Stack>
                      <ProgressBar value={score} className="h-2" />
                    </Stack>
                    <Label className={getStatusColor(opp.status)}>{opp.status}</Label>
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="outline" size="sm" onClick={() => setSelectedOpp(opp)}>Evaluate</Button>
                    </Stack>
                  </Grid>
                </Card>
              );
            })}
          </Stack>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/opportunities")}>Opportunities</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/opportunities/proposals")}>Proposals</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/")}>Dashboard</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedOpp} onClose={() => setSelectedOpp(null)}>
        <ModalHeader><H3>Evaluate Opportunity</H3></ModalHeader>
        <ModalBody>
          {selectedOpp && (
            <Stack gap={4}>
              <Body className="text-white">{selectedOpp.title}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Client</Label><Label className="text-white">{selectedOpp.client}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Value</Label><Label className="font-mono text-white">{formatCurrency(selectedOpp.value)}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label className="text-ink-400">Due Date</Label><Label className="text-white">{selectedOpp.dueDate}</Label></Stack>
              <Stack gap={3}>
                <Label className="text-ink-400">Scoring Criteria</Label>
                {selectedOpp.criteria.map((criterion, idx) => (
                  <Stack key={idx} gap={2}>
                    <Stack direction="horizontal" className="justify-between">
                      <Label className="text-white">{criterion.name}</Label>
                      <Stack direction="horizontal" gap={2}>
                        <Label size="xs" className="text-ink-500">Weight: {criterion.weight}%</Label>
                        <Label className="font-mono text-white">{criterion.score}/10</Label>
                      </Stack>
                    </Stack>
                    <ProgressBar value={criterion.score * 10} className="h-2" />
                  </Stack>
                ))}
              </Stack>
              <Card className="p-4 border border-ink-700">
                <Stack gap={2}>
                  <Stack direction="horizontal" className="justify-between">
                    <Label className="text-ink-400">Overall Score</Label>
                    <Label className={`font-mono text-h6-md ${getScoreColor(selectedOpp.score || calculateScore(selectedOpp.criteria))}`}>
                      {selectedOpp.score || calculateScore(selectedOpp.criteria)}/100
                    </Label>
                  </Stack>
                  {selectedOpp.recommendation && (
                    <Stack direction="horizontal" className="justify-between">
                      <Label className="text-ink-400">Recommendation</Label>
                      <Label className={selectedOpp.recommendation === "Bid" ? "text-success-400" : "text-error-400"}>{selectedOpp.recommendation}</Label>
                    </Stack>
                  )}
                </Stack>
              </Card>
              <Textarea placeholder="Decision notes..." defaultValue={selectedOpp.notes} rows={2} className="border-ink-700 bg-black text-white" />
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedOpp(null)}>Cancel</Button>
          <Button variant="outline" className="text-error-400">No Bid</Button>
          <Button variant="solid" className="bg-success-600">Bid</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
