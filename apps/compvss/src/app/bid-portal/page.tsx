"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { CompvssAppLayout } from "../../components/app-layout";
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  StatCard,
  Input,
  Button,
  Card,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";

import {
  DEMO_BID_OPPORTUNITIES,
  type DemoBidOpportunity as BidOpportunity,
} from "../../lib/demo-data";

export default function BidPortalPage() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { activeTab, setActiveTab, isActive } = useTabState({
    defaultTab: 'open',
    validTabs: ['open', 'submitted', 'all'],
  });
  const [selectedBid, setSelectedBid] = useState<BidOpportunity | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const openBids = DEMO_BID_OPPORTUNITIES.filter(b => b.status === "Open").length;
  const submittedBids = DEMO_BID_OPPORTUNITIES.filter(b => b.status === "Submitted" || b.status === "Under Review").length;

  const filteredBids = activeTab === "all" ? DEMO_BID_OPPORTUNITIES : activeTab === "open" ? DEMO_BID_OPPORTUNITIES.filter(b => b.status === "Open") : DEMO_BID_OPPORTUNITIES.filter(b => b.status !== "Open");

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Bid Submission Portal"
        subtitle="Submit proposals and track bid opportunities"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            {/* Stats Grid */}
            <Grid cols={4} gap={6}>
              <StatCard value={openBids.toString()} label="Open" />
              <StatCard value={submittedBids.toString()} label="Submitted" />
              <StatCard value={DEMO_BID_OPPORTUNITIES.filter(b => b.status === "Won").length.toString()} label="Won" />
              <StatCard value="68%" label="Win Rate" />
            </Grid>

            {/* Tabs */}
            <Card className="p-6">
              <Tabs>
                <TabsList>
                  <Tab active={isActive('open')} onClick={() => setActiveTab('open')}>Open</Tab>
                  <Tab active={isActive('submitted')} onClick={() => setActiveTab('submitted')}>Submitted</Tab>
                  <Tab active={isActive('all')} onClick={() => setActiveTab('all')}>All</Tab>
                </TabsList>

                <TabPanel active={true}>
                  <Stack gap={4} className="mt-6">
                    {filteredBids.map((bid) => (
                      <Card key={bid.id} className="p-6">
                        <Stack gap={4}>
                          <Stack direction="horizontal" className="items-start justify-between">
                            <Stack gap={1}>
                              <Body className="text-body-md font-display">{bid.title}</Body>
                              <Body className="text-body-sm">{bid.client}</Body>
                            </Stack>
                            <Badge variant={bid.status === "Won" ? "solid" : "outline"}>{bid.status}</Badge>
                          </Stack>
                          <Body className="text-body-sm">{bid.description}</Body>
                          <Grid cols={4} gap={4}>
                            <Stack gap={1}>
                              <Body className="text-body-sm font-display">Due</Body>
                              <Body className="text-body-sm">{bid.dueDate}</Body>
                            </Stack>
                            {bid.budget && (
                              <Stack gap={1}>
                                <Body className="text-body-sm font-display">Budget</Body>
                                <Body className="text-body-sm">{bid.budget}</Body>
                              </Stack>
                            )}
                            <Stack gap={1}>
                              <Body className="text-body-sm font-display">Type</Body>
                              <Badge variant="outline">{bid.type}</Badge>
                            </Stack>
                            {bid.bidAmount && (
                              <Stack gap={1}>
                                <Body className="text-body-sm font-display">Our Bid</Body>
                                <Body className="text-body-sm font-display">${bid.bidAmount.toLocaleString()}</Body>
                              </Stack>
                            )}
                          </Grid>
                          <Stack direction="horizontal" gap={4} className="justify-end">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedBid(bid)}>Details</Button>
                            {bid.status === "Open" && <Button variant="solid" size="sm" onClick={() => { setSelectedBid(bid); setShowSubmitModal(true); }}>Submit Proposal</Button>}
                          </Stack>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </TabPanel>
              </Tabs>
            </Card>

            {/* Quick Links */}
            <Button variant="outline" onClick={() => router.push("/opportunities")}>Browse Opportunities</Button>
          </Stack>
        </Container>
      </MainContent>

      {/* Submit Proposal Modal */}
      <Modal open={showSubmitModal} onClose={() => { setShowSubmitModal(false); setSelectedBid(null); }}>
        <ModalHeader><H3>Submit Proposal</H3></ModalHeader>
        <ModalBody>
          {selectedBid && (
            <Stack gap={4}>
              <Body className="font-display">{selectedBid.title}</Body>
              <Input type="number" placeholder="Bid Amount ($)" />
              <Textarea placeholder="Proposal summary..." rows={4} />
              <Card className="cursor-pointer border-2 border-dashed p-4 text-center">
                <Body className="text-body-sm">Drop files here to attach</Body>
              </Card>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowSubmitModal(false); setSelectedBid(null); }}>Cancel</Button>
          <Button variant="solid" onClick={() => { setShowSubmitModal(false); setSelectedBid(null); }}>Submit</Button>
        </ModalFooter>
      </Modal>

      {/* Opportunity Details Modal */}
      <Modal open={!!selectedBid && !showSubmitModal} onClose={() => setSelectedBid(null)}>
        <ModalHeader><H3>Opportunity Details</H3></ModalHeader>
        <ModalBody>
          {selectedBid && (
            <Stack gap={4}>
              <Body className="text-body-md font-display">{selectedBid.title}</Body>
              <Body className="text-body-sm">{selectedBid.client}</Body>
              <Body>{selectedBid.description}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="text-body-sm font-display">Due</Body>
                  <Body>{selectedBid.dueDate}</Body>
                </Stack>
                {selectedBid.budget && (
                  <Stack gap={1}>
                    <Body className="text-body-sm font-display">Budget</Body>
                    <Body>{selectedBid.budget}</Body>
                  </Stack>
                )}
              </Grid>
              <Stack gap={2}>
                <Body className="font-display">Requirements</Body>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {selectedBid.requirements.map((req, idx) => <Badge key={idx} variant="outline">{req}</Badge>)}
                </Stack>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedBid(null)}>Close</Button>
        </ModalFooter>
      </Modal>
    </CompvssAppLayout>
  );
}
