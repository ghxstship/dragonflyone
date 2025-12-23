"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
// Layout provided by route group
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  StatCard,
  Button,
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
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";
import {
  useBidOpportunities,
  type BidOpportunity,
} from '../../../hooks/useBidOpportunities';


export default function BidDecisionPage() {
  const router = useRouter();
  const { data: opportunities = [] } = useBidOpportunities();
  
  // URL-synced tab state for deep-linking support
  const { activeTab, setActiveTab, isActive } = useTabState({
    defaultTab: 'pending',
    validTabs: ['pending', 'bid', 'nobid', 'all'],
  });
  const [selectedOpp, setSelectedOpp] = useState<BidOpportunity | null>(null);

  const pendingCount = opportunities.filter(o => o.status === "Pending Review" || o.status === "Under Evaluation").length;
  const bidCount = opportunities.filter(o => o.status === "Bid").length;
  const noBidCount = opportunities.filter(o => o.status === "No Bid").length;
  const totalPipelineValue = opportunities.filter(o => o.status === "Bid").reduce((s, o) => s + o.value, 0);

  const calculateScore = (criteria: { score: number; weight: number }[]) => {
    const totalWeight = criteria.reduce((s, c) => s + c.weight, 0);
    const weightedScore = criteria.reduce((s, c) => s + (c.score * c.weight), 0);
    return Math.round((weightedScore / totalWeight) * 10);
  };

  const getStatusVariant = (status: string): 'success' | 'error' | 'warning' | 'info' | 'ghost' => {
    switch (status) {
      case "Bid": return "success";
      case "No Bid": return "error";
      case "Pending Review": return "warning";
      case "Under Evaluation": return "info";
      default: return "ghost";
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const filteredOpps = activeTab === "all" ? opportunities :
    activeTab === "pending" ? opportunities.filter(o => o.status === "Pending Review" || o.status === "Under Evaluation") :
    opportunities.filter(o => o.status.toLowerCase().replace(" ", "") === activeTab);

  return (
    <>
      <EnterprisePageHeader
        title="Bid/No-Bid Decisions"
        subtitle="Opportunity evaluation and decision workflow"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Pending Review" value={pendingCount.toString()} />
              <StatCard label="Bid Decisions" value={bidCount.toString()} />
              <StatCard label="No-Bid" value={noBidCount.toString()} />
              <StatCard label="Pipeline Value" value={formatCurrency(totalPipelineValue)} />
            </Grid>

            <Tabs>
              <TabsList>
                <Tab active={isActive('pending')} onClick={() => setActiveTab('pending')}>Pending</Tab>
                <Tab active={isActive('bid')} onClick={() => setActiveTab('bid')}>Bid</Tab>
                <Tab active={isActive('nobid')} onClick={() => setActiveTab('nobid')}>No Bid</Tab>
                <Tab active={isActive('all')} onClick={() => setActiveTab('all')}>All</Tab>
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
                        <Body size="sm" className="">{opp.client}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body size="sm" className="">Value</Body>
                        <Body className="font-mono">{formatCurrency(opp.value)}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body size="sm" className="">Due Date</Body>
                        <Body>{opp.dueDate}</Body>
                      </Stack>
                      <Stack gap={2}>
                        <Stack direction="horizontal" className="justify-between">
                          <Body size="sm" className="">Score</Body>
                          <Body className="font-mono">{score}/100</Body>
                        </Stack>
                        <ProgressBar value={score} />
                      </Stack>
                      <Badge variant={getStatusVariant(opp.status)}>{opp.status}</Badge>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="outline" size="sm" onClick={() => setSelectedOpp(opp)}>Evaluate</Button>
                      </Stack>
                    </Grid>
                  </Card>
                );
              })}
            </Stack>

            <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
              <Button variant="outline" onClick={() => router.push("/opportunities")}>Opportunities</Button>
              <Button variant="outline" onClick={() => router.push("/opportunities/proposals")}>Proposals</Button>
              <Button variant="outline" onClick={() => router.push("/")}>Dashboard</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>

      <Modal open={!!selectedOpp} onClose={() => setSelectedOpp(null)}>
        <ModalHeader><H3>Evaluate Opportunity</H3></ModalHeader>
        <ModalBody>
          {selectedOpp && (
            <Stack gap={4}>
              <Body className="font-display">{selectedOpp.title}</Body>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}><Body size="sm" className="">Client</Body><Body>{selectedOpp.client}</Body></Stack>
                <Stack gap={1}><Body size="sm" className="">Value</Body><Body className="font-mono">{formatCurrency(selectedOpp.value)}</Body></Stack>
              </Grid>
              <Stack gap={1}><Body size="sm" className="">Due Date</Body><Body>{selectedOpp.dueDate}</Body></Stack>
              <Stack gap={3}>
                <Body size="sm" className="">Scoring Criteria</Body>
                {selectedOpp.criteria.map((criterion, idx) => (
                  <Stack key={idx} gap={2}>
                    <Stack direction="horizontal" className="justify-between">
                      <Body>{criterion.name}</Body>
                      <Stack direction="horizontal" gap={2}>
                        <Body size="sm" className="">Weight: {criterion.weight}%</Body>
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
                    <Body size="sm" className="">Overall Score</Body>
                    <Body className="font-mono">
                      {selectedOpp.score || calculateScore(selectedOpp.criteria)}/100
                    </Body>
                  </Stack>
                  {selectedOpp.recommendation && (
                    <Stack direction="horizontal" className="justify-between">
                      <Body size="sm" className="">Recommendation</Body>
                      <Badge variant={getStatusVariant(selectedOpp.recommendation)}>{selectedOpp.recommendation}</Badge>
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
    </>
  );
}
