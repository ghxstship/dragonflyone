"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../../components/navigation";
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  StatCard,
  Button,
  Section,
  Card,
  Tabs,
  TabsList,
  Tab,
  Badge,
  ProgressBar,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  PageLayout,
  SectionHeader,
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
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <SectionHeader
              kicker="COMPVSS"
              title="Bid/No-Bid Decisions"
              description="Opportunity evaluation and decision workflow"
              colorScheme="on-light"
              gap="lg"
            />

            <Grid cols={4} gap={6}>
              <StatCard label="Pending Review" value={pendingCount.toString()} />
              <StatCard label="Bid Decisions" value={bidCount.toString()} />
              <StatCard label="No-Bid" value={noBidCount.toString()} />
              <StatCard label="Pipeline Value" value={formatCurrency(totalPipelineValue)} />
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
                  <Card key={opp.id}>
                    <Grid cols={6} gap={4} className="items-center">
                      <Stack gap={1}>
                        <Body className="font-display">{opp.title}</Body>
                        <Body className="text-body-sm">{opp.client}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-body-sm">Value</Body>
                        <Body className="font-mono">{formatCurrency(opp.value)}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-body-sm">Due Date</Body>
                        <Body>{opp.dueDate}</Body>
                      </Stack>
                      <Stack gap={2}>
                        <Stack direction="horizontal" className="justify-between">
                          <Body className="text-body-sm">Score</Body>
                          <Body className="font-mono">{score}/100</Body>
                        </Stack>
                        <ProgressBar value={score} />
                      </Stack>
                      <Badge variant={opp.status === "Bid" ? "solid" : "outline"}>{opp.status}</Badge>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="outline" size="sm" onClick={() => setSelectedOpp(opp)}>Evaluate</Button>
                      </Stack>
                    </Grid>
                  </Card>
                );
              })}
            </Stack>

            <Grid cols={3} gap={4}>
              <Button variant="outline" onClick={() => router.push("/opportunities")}>Opportunities</Button>
              <Button variant="outline" onClick={() => router.push("/opportunities/proposals")}>Proposals</Button>
              <Button variant="outline" onClick={() => router.push("/")}>Dashboard</Button>
            </Grid>
          </Stack>
        </Container>
      </Section>

      <Modal open={!!selectedOpp} onClose={() => setSelectedOpp(null)}>
        <ModalHeader><H3>Evaluate Opportunity</H3></ModalHeader>
        <ModalBody>
          {selectedOpp && (
            <Stack gap={4}>
              <Body className="font-display">{selectedOpp.title}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Body className="text-body-sm">Client</Body><Body>{selectedOpp.client}</Body></Stack>
                <Stack gap={1}><Body className="text-body-sm">Value</Body><Body className="font-mono">{formatCurrency(selectedOpp.value)}</Body></Stack>
              </Grid>
              <Stack gap={1}><Body className="text-body-sm">Due Date</Body><Body>{selectedOpp.dueDate}</Body></Stack>
              <Stack gap={3}>
                <Body className="text-body-sm">Scoring Criteria</Body>
                {selectedOpp.criteria.map((criterion, idx) => (
                  <Stack key={idx} gap={2}>
                    <Stack direction="horizontal" className="justify-between">
                      <Body>{criterion.name}</Body>
                      <Stack direction="horizontal" gap={2}>
                        <Body className="text-body-sm">Weight: {criterion.weight}%</Body>
                        <Body className="font-mono">{criterion.score}/10</Body>
                      </Stack>
                    </Stack>
                    <ProgressBar value={criterion.score * 10} />
                  </Stack>
                ))}
              </Stack>
              <Card>
                <Stack gap={2}>
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="text-body-sm">Overall Score</Body>
                    <Body className="font-mono">
                      {selectedOpp.score || calculateScore(selectedOpp.criteria)}/100
                    </Body>
                  </Stack>
                  {selectedOpp.recommendation && (
                    <Stack direction="horizontal" className="justify-between">
                      <Body className="text-body-sm">Recommendation</Body>
                      <Badge variant={selectedOpp.recommendation === "Bid" ? "solid" : "outline"}>{selectedOpp.recommendation}</Badge>
                    </Stack>
                  )}
                </Stack>
              </Card>
              <Textarea placeholder="Decision notes..." defaultValue={selectedOpp.notes} rows={2} />
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedOpp(null)}>Cancel</Button>
          <Button variant="outline">No Bid</Button>
          <Button variant="solid">Bid</Button>
        </ModalFooter>
      </Modal>
    </PageLayout>
  );
}
