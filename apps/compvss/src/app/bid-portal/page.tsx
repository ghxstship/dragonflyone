"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  StatCard,
  Input,
  Button,
  Section,
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
  PageLayout,
  SectionHeader,
  EnterprisePageHeader,
  MainContent,} from "@ghxstship/ui";

interface BidOpportunity {
  id: string;
  title: string;
  client: string;
  type: "RFP" | "RFQ" | "Invitation";
  category: string;
  dueDate: string;
  budget?: string;
  status: "Open" | "Submitted" | "Under Review" | "Won" | "Lost";
  description: string;
  requirements: string[];
  attachments: number;
  bidAmount?: number;
}

const mockBids: BidOpportunity[] = [
  { id: "BID-001", title: "Summer Festival 2025 - Full Production", client: "Festival Productions", type: "RFP", category: "Full Service", dueDate: "2024-12-15", budget: "$500K-$750K", status: "Open", description: "Full production for 3-day outdoor festival", requirements: ["10+ years experience", "Festival experience"], attachments: 5 },
  { id: "BID-002", title: "Corporate Gala - AV Services", client: "TechCorp Events", type: "RFQ", category: "Audio", dueDate: "2024-12-01", budget: "$75K-$100K", status: "Submitted", description: "AV services for 500-person awards ceremony", requirements: ["Corporate experience"], attachments: 3, bidAmount: 85000 },
  { id: "BID-003", title: "Theater Production - Lighting", client: "City Arts Center", type: "Invitation", category: "Lighting", dueDate: "2024-11-30", budget: "$25K-$35K", status: "Under Review", description: "Lighting design for 6-week theater run", requirements: ["Theater experience"], attachments: 2, bidAmount: 32000 },
  { id: "BID-004", title: "Concert Series - Staging", client: "Live Nation", type: "RFP", category: "Staging", dueDate: "2024-11-25", status: "Won", description: "Staging for 10-city tour", requirements: ["Tour experience"], attachments: 6, bidAmount: 425000 },
];

export default function BidPortalPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("open");
  const [selectedBid, setSelectedBid] = useState<BidOpportunity | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const openBids = mockBids.filter(b => b.status === "Open").length;
  const submittedBids = mockBids.filter(b => b.status === "Submitted" || b.status === "Under Review").length;

  const filteredBids = activeTab === "all" ? mockBids : activeTab === "open" ? mockBids.filter(b => b.status === "Open") : mockBids.filter(b => b.status !== "Open");

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            {/* Page Header */}
            <EnterprisePageHeader
        title="Bid Submission Portal"
        subtitle="Submit proposals and track bid opportunities"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Bid Portal' }]}
        views={[
          { id: 'default', label: 'Default', icon: 'grid' },
        ]}
        activeView="default"
        showFavorite
        showSettings
      />

            {/* Stats Grid */}
            <Grid cols={4} gap={6}>
              <StatCard value={openBids.toString()} label="Open" />
              <StatCard value={submittedBids.toString()} label="Submitted" />
              <StatCard value={mockBids.filter(b => b.status === "Won").length.toString()} label="Won" />
              <StatCard value="68%" label="Win Rate" />
            </Grid>

            {/* Tabs */}
            <Card className="p-6">
              <Tabs>
                <TabsList>
                  <Tab active={activeTab === "open"} onClick={() => setActiveTab("open")}>Open</Tab>
                  <Tab active={activeTab === "submitted"} onClick={() => setActiveTab("submitted")}>Submitted</Tab>
                  <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
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
      </Section>

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
    </PageLayout>
  );
}
