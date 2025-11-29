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
  Select,
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
  PageLayout,
  SectionHeader,
  EnterprisePageHeader,
  MainContent,} from "@ghxstship/ui";

interface Settlement {
  id: string;
  projectId: string;
  projectName: string;
  eventDate: string;
  status: "Draft" | "Pending Review" | "Approved" | "Finalized";
  contractValue: number;
  actualCosts: number;
  grossProfit: number;
  marginPct: number;
  ticketRevenue?: number;
  merchRevenue?: number;
  sponsorRevenue?: number;
  artistGuarantee?: number;
  artistBackend?: number;
  venueRent?: number;
  productionCosts?: number;
  laborCosts?: number;
  otherCosts?: number;
  adjustments: Adjustment[];
  approvedBy?: string;
  approvedAt?: string;
}

interface Adjustment {
  id: string;
  description: string;
  amount: number;
  type: "Credit" | "Debit";
  category: string;
  approvedBy?: string;
}

const mockSettlements: Settlement[] = [
  {
    id: "SET-001",
    projectId: "PROJ-088",
    projectName: "Fall Festival 2024",
    eventDate: "2024-11-15",
    status: "Pending Review",
    contractValue: 150000,
    actualCosts: 125000,
    grossProfit: 25000,
    marginPct: 16.7,
    ticketRevenue: 180000,
    merchRevenue: 25000,
    sponsorRevenue: 15000,
    artistGuarantee: 50000,
    artistBackend: 8000,
    venueRent: 25000,
    productionCosts: 45000,
    laborCosts: 22000,
    otherCosts: 5000,
    adjustments: [
      { id: "ADJ-001", description: "Weather delay overtime", amount: 2500, type: "Debit", category: "Labor" },
      { id: "ADJ-002", description: "Sponsor bonus for attendance", amount: 5000, type: "Credit", category: "Revenue" },
    ],
  },
  {
    id: "SET-002",
    projectId: "PROJ-087",
    projectName: "Corporate Awards Gala",
    eventDate: "2024-11-10",
    status: "Finalized",
    contractValue: 85000,
    actualCosts: 72000,
    grossProfit: 13000,
    marginPct: 15.3,
    productionCosts: 35000,
    laborCosts: 18000,
    venueRent: 12000,
    otherCosts: 7000,
    adjustments: [],
    approvedBy: "John Smith",
    approvedAt: "2024-11-18",
  },
  {
    id: "SET-003",
    projectId: "PROJ-086",
    projectName: "Tech Conference",
    eventDate: "2024-11-05",
    status: "Draft",
    contractValue: 120000,
    actualCosts: 98000,
    grossProfit: 22000,
    marginPct: 18.3,
    adjustments: [],
  },
];

export default function SettlementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);

  const pendingCount = mockSettlements.filter(s => s.status === "Pending Review" || s.status === "Draft").length;
  const totalProfit = mockSettlements.reduce((sum, s) => sum + s.grossProfit, 0);
  const avgMargin = (mockSettlements.reduce((sum, s) => sum + s.marginPct, 0) / mockSettlements.length).toFixed(1);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Finalized": return "text-success-400";
      case "Approved": return "text-info-400";
      case "Pending Review": return "text-warning-400";
      case "Draft": return "text-ink-400";
      default: return "text-ink-400";
    }
  };

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <EnterprisePageHeader
        title="Post-Production Settlement"
        subtitle="Financial closeout and settlement for completed projects"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Settlement' }]}
        views={[
          { id: 'default', label: 'Default', icon: 'grid' },
        ]}
        activeView="default"
        showFavorite
        showSettings
      />

            <Grid cols={4} gap={6}>
              <StatCard value={pendingCount.toString()} label="Pending Settlements" />
              <StatCard value={`$${(totalProfit / 1000).toFixed(0)}K`} label="Total Profit (MTD)" />
              <StatCard value={`${avgMargin}%`} label="Avg Margin" />
              <StatCard value={mockSettlements.filter(s => s.status === "Finalized").length.toString()} label="Finalized This Month" />
            </Grid>

            <Tabs>
              <TabsList>
                <Tab active={activeTab === "pending"} onClick={() => setActiveTab("pending")}>Pending ({pendingCount})</Tab>
                <Tab active={activeTab === "finalized"} onClick={() => setActiveTab("finalized")}>Finalized</Tab>
                <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
              </TabsList>

              <TabPanel active={true}>
                <Stack gap={4}>
                  {mockSettlements
                    .filter(s => activeTab === "all" || (activeTab === "pending" ? (s.status === "Draft" || s.status === "Pending Review") : s.status === "Finalized"))
                    .map((settlement) => (
                      <Card key={settlement.id} className="p-6">
                        <Stack gap={4}>
                          <Stack direction="horizontal" className="items-start justify-between">
                            <Stack gap={1}>
                              <Body className="font-display">{settlement.projectName}</Body>
                              <Body className="text-body-sm">Event Date: {settlement.eventDate}</Body>
                            </Stack>
                            <Badge variant={settlement.status === "Finalized" ? "solid" : "outline"}>{settlement.status}</Badge>
                          </Stack>

                          <Grid cols={4} gap={4}>
                            <Card className="p-3">
                              <Stack gap={1}>
                                <Body className="text-body-sm">Contract Value</Body>
                                <Body className="font-display">${settlement.contractValue.toLocaleString()}</Body>
                              </Stack>
                            </Card>
                            <Card className="p-3">
                              <Stack gap={1}>
                                <Body className="text-body-sm">Actual Costs</Body>
                                <Body className="font-display">${settlement.actualCosts.toLocaleString()}</Body>
                              </Stack>
                            </Card>
                            <Card className="p-3">
                              <Stack gap={1}>
                                <Body className="text-body-sm">Gross Profit</Body>
                                <Body className="font-display">${settlement.grossProfit.toLocaleString()}</Body>
                              </Stack>
                            </Card>
                            <Card className="p-3">
                              <Stack gap={1}>
                                <Body className="text-body-sm">Margin</Body>
                                <Body className="font-display">{settlement.marginPct}%</Body>
                              </Stack>
                            </Card>
                          </Grid>

                          {settlement.adjustments.length > 0 && (
                            <Stack gap={2}>
                              <Body className="font-display">Adjustments ({settlement.adjustments.length})</Body>
                              {settlement.adjustments.map((adj) => (
                                <Card key={adj.id} className="p-2">
                                  <Stack direction="horizontal" className="justify-between">
                                    <Body className="text-body-sm">{adj.description}</Body>
                                    <Badge variant={adj.type === "Credit" ? "solid" : "outline"}>
                                      {adj.type === "Credit" ? "+" : "-"}${adj.amount.toLocaleString()}
                                    </Badge>
                                  </Stack>
                                </Card>
                              ))}
                            </Stack>
                          )}

                          <Stack direction="horizontal" gap={4} className="justify-end">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedSettlement(settlement)}>View Details</Button>
                            {settlement.status === "Draft" && <Button variant="outline" size="sm">Submit for Review</Button>}
                            {settlement.status === "Pending Review" && <Button variant="outline" size="sm">Approve</Button>}
                            {settlement.status === "Approved" && <Button variant="solid" size="sm">Finalize</Button>}
                          </Stack>
                        </Stack>
                      </Card>
                    ))}
                </Stack>
              </TabPanel>
            </Tabs>

            <Grid cols={3} gap={4}>
              <Button variant="solid">Create Settlement</Button>
              <Button variant="outline">Export Report</Button>
              <Button variant="outline" onClick={() => router.push("/projects")}>Back to Projects</Button>
            </Grid>
          </Stack>
        </Container>
      </Section>

      <Modal open={!!selectedSettlement} onClose={() => setSelectedSettlement(null)}>
        <ModalHeader><H3>Settlement Details</H3></ModalHeader>
        <ModalBody>
          {selectedSettlement && (
            <Stack gap={4}>
              <Body className="font-display">{selectedSettlement.projectName}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="text-body-sm">Event Date</Body>
                  <Body>{selectedSettlement.eventDate}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="text-body-sm">Status</Body>
                  <Badge variant={selectedSettlement.status === "Finalized" ? "solid" : "outline"}>{selectedSettlement.status}</Badge>
                </Stack>
              </Grid>

              <H3 className="mt-4">Revenue</H3>
              <Grid cols={2} gap={2}>
                {selectedSettlement.ticketRevenue && (
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="text-body-sm">Ticket Revenue</Body>
                    <Body>${selectedSettlement.ticketRevenue.toLocaleString()}</Body>
                  </Stack>
                )}
                {selectedSettlement.merchRevenue && (
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="text-body-sm">Merch Revenue</Body>
                    <Body>${selectedSettlement.merchRevenue.toLocaleString()}</Body>
                  </Stack>
                )}
                {selectedSettlement.sponsorRevenue && (
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="text-body-sm">Sponsor Revenue</Body>
                    <Body>${selectedSettlement.sponsorRevenue.toLocaleString()}</Body>
                  </Stack>
                )}
              </Grid>

              <H3 className="mt-4">Costs</H3>
              <Grid cols={2} gap={2}>
                {selectedSettlement.artistGuarantee && (
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="text-body-sm">Artist Guarantee</Body>
                    <Body>${selectedSettlement.artistGuarantee.toLocaleString()}</Body>
                  </Stack>
                )}
                {selectedSettlement.artistBackend && (
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="text-body-sm">Artist Backend</Body>
                    <Body>${selectedSettlement.artistBackend.toLocaleString()}</Body>
                  </Stack>
                )}
                {selectedSettlement.venueRent && (
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="text-body-sm">Venue Rent</Body>
                    <Body>${selectedSettlement.venueRent.toLocaleString()}</Body>
                  </Stack>
                )}
                {selectedSettlement.productionCosts && (
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="text-body-sm">Production</Body>
                    <Body>${selectedSettlement.productionCosts.toLocaleString()}</Body>
                  </Stack>
                )}
                {selectedSettlement.laborCosts && (
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="text-body-sm">Labor</Body>
                    <Body>${selectedSettlement.laborCosts.toLocaleString()}</Body>
                  </Stack>
                )}
                {selectedSettlement.otherCosts && (
                  <Stack direction="horizontal" className="justify-between">
                    <Body className="text-body-sm">Other</Body>
                    <Body>${selectedSettlement.otherCosts.toLocaleString()}</Body>
                  </Stack>
                )}
              </Grid>

              <Card className="mt-4 p-4">
                <Grid cols={3} gap={4}>
                  <Stack gap={1}>
                    <Body className="text-body-sm">Total Revenue</Body>
                    <Body className="font-display">${selectedSettlement.contractValue.toLocaleString()}</Body>
                  </Stack>
                  <Stack gap={1}>
                    <Body className="text-body-sm">Total Costs</Body>
                    <Body className="font-display">${selectedSettlement.actualCosts.toLocaleString()}</Body>
                  </Stack>
                  <Stack gap={1}>
                    <Body className="text-body-sm">Net Profit</Body>
                    <Body className="font-display">${selectedSettlement.grossProfit.toLocaleString()}</Body>
                  </Stack>
                </Grid>
              </Card>

              {selectedSettlement.approvedBy && (
                <Stack gap={1} className="mt-4">
                  <Body className="text-body-sm">Approved By</Body>
                  <Body>{selectedSettlement.approvedBy} on {selectedSettlement.approvedAt}</Body>
                </Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedSettlement(null)}>Close</Button>
          <Button variant="outline" onClick={() => { setShowAdjustmentModal(true); }}>Add Adjustment</Button>
          <Button variant="solid">Export PDF</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showAdjustmentModal} onClose={() => setShowAdjustmentModal(false)}>
        <ModalHeader><H3>Add Adjustment</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Description" />
            <Grid cols={2} gap={4}>
              <Input type="number" placeholder="Amount" />
              <Select>
                <option value="Credit">Credit (+)</option>
                <option value="Debit">Debit (-)</option>
              </Select>
            </Grid>
            <Select>
              <option value="">Category...</option>
              <option value="Revenue">Revenue</option>
              <option value="Labor">Labor</option>
              <option value="Production">Production</option>
              <option value="Venue">Venue</option>
              <option value="Other">Other</option>
            </Select>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAdjustmentModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowAdjustmentModal(false)}>Add Adjustment</Button>
        </ModalFooter>
      </Modal>
    </PageLayout>
  );
}
