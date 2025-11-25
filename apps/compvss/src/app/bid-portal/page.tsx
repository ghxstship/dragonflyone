"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea, Alert,
} from "@ghxstship/ui";

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Won": return "text-green-400";
      case "Submitted": case "Under Review": return "text-blue-400";
      case "Open": return "text-yellow-400";
      case "Lost": return "text-red-400";
      default: return "text-ink-400";
    }
  };

  const filteredBids = activeTab === "all" ? mockBids : activeTab === "open" ? mockBids.filter(b => b.status === "Open") : mockBids.filter(b => b.status !== "Open");

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Bid Submission Portal</H1>
            <Label className="text-ink-400">Submit proposals and track bid opportunities</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Open" value={openBids} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Submitted" value={submittedBids} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Won" value={mockBids.filter(b => b.status === "Won").length} trend="up" className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Win Rate" value="68%" className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "open"} onClick={() => setActiveTab("open")}>Open</Tab>
              <Tab active={activeTab === "submitted"} onClick={() => setActiveTab("submitted")}>Submitted</Tab>
              <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
            </TabsList>

            <TabPanel active={true}>
              <Stack gap={4}>
                {filteredBids.map((bid) => (
                  <Card key={bid.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Stack gap={1}>
                          <Body className="font-display text-white text-lg">{bid.title}</Body>
                          <Label className="text-ink-400">{bid.client}</Label>
                        </Stack>
                        <Label className={getStatusColor(bid.status)}>{bid.status}</Label>
                      </Stack>
                      <Body className="text-ink-300">{bid.description}</Body>
                      <Grid cols={4} gap={4}>
                        <Stack gap={1}><Label size="xs" className="text-ink-500">Due</Label><Label className="font-mono text-white">{bid.dueDate}</Label></Stack>
                        {bid.budget && <Stack gap={1}><Label size="xs" className="text-ink-500">Budget</Label><Label className="text-white">{bid.budget}</Label></Stack>}
                        <Stack gap={1}><Label size="xs" className="text-ink-500">Type</Label><Badge variant="outline">{bid.type}</Badge></Stack>
                        {bid.bidAmount && <Stack gap={1}><Label size="xs" className="text-ink-500">Our Bid</Label><Label className="font-mono text-green-400">${bid.bidAmount.toLocaleString()}</Label></Stack>}
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

          <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/opportunities")}>Browse Opportunities</Button>
        </Stack>
      </Container>

      <Modal open={showSubmitModal} onClose={() => { setShowSubmitModal(false); setSelectedBid(null); }}>
        <ModalHeader><H3>Submit Proposal</H3></ModalHeader>
        <ModalBody>
          {selectedBid && (
            <Stack gap={4}>
              <Body className="text-white">{selectedBid.title}</Body>
              <Input type="number" placeholder="Bid Amount ($)" className="border-ink-700 bg-black text-white" />
              <Textarea placeholder="Proposal summary..." className="border-ink-700 bg-black text-white" rows={4} />
              <Card className="p-4 border-2 border-dashed border-ink-700 text-center cursor-pointer">
                <Label className="text-ink-400">Drop files here to attach</Label>
              </Card>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowSubmitModal(false); setSelectedBid(null); }}>Cancel</Button>
          <Button variant="solid" onClick={() => { setShowSubmitModal(false); setSelectedBid(null); }}>Submit</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedBid && !showSubmitModal} onClose={() => setSelectedBid(null)}>
        <ModalHeader><H3>Opportunity Details</H3></ModalHeader>
        <ModalBody>
          {selectedBid && (
            <Stack gap={4}>
              <Body className="font-display text-white text-lg">{selectedBid.title}</Body>
              <Label className="text-ink-400">{selectedBid.client}</Label>
              <Body className="text-ink-300">{selectedBid.description}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Due</Label><Label className="text-white">{selectedBid.dueDate}</Label></Stack>
                {selectedBid.budget && <Stack gap={1}><Label size="xs" className="text-ink-500">Budget</Label><Label className="text-white">{selectedBid.budget}</Label></Stack>}
              </Grid>
              <Stack gap={2}>
                <Label className="text-ink-400">Requirements</Label>
                {selectedBid.requirements.map((req, idx) => <Badge key={idx} variant="outline">{req}</Badge>)}
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedBid(null)}>Close</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
