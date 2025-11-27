"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Alert,
} from "@ghxstship/ui";

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
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Post-Production Settlement</H1>
            <Label className="text-ink-400">Financial closeout and settlement for completed projects</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Pending Settlements" value={pendingCount} trend={pendingCount > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Profit (MTD)" value={`$${(totalProfit / 1000).toFixed(0)}K`} trend="up" className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Avg Margin" value={`${avgMargin}%`} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Finalized This Month" value={mockSettlements.filter(s => s.status === "Finalized").length} className="bg-transparent border-2 border-ink-800" />
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
                    <Card key={settlement.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                      <Stack gap={4}>
                        <Stack direction="horizontal" className="justify-between items-start">
                          <Stack gap={1}>
                            <Body className="font-display text-white text-lg">{settlement.projectName}</Body>
                            <Label className="text-ink-500">Event Date: {settlement.eventDate}</Label>
                          </Stack>
                          <Label className={getStatusColor(settlement.status)}>{settlement.status}</Label>
                        </Stack>

                        <Grid cols={4} gap={4}>
                          <Card className="p-3 bg-ink-800 border border-ink-700">
                            <Stack gap={1}>
                              <Label size="xs" className="text-ink-500">Contract Value</Label>
                              <Label className="font-mono text-white text-lg">${settlement.contractValue.toLocaleString()}</Label>
                            </Stack>
                          </Card>
                          <Card className="p-3 bg-ink-800 border border-ink-700">
                            <Stack gap={1}>
                              <Label size="xs" className="text-ink-500">Actual Costs</Label>
                              <Label className="font-mono text-white text-lg">${settlement.actualCosts.toLocaleString()}</Label>
                            </Stack>
                          </Card>
                          <Card className="p-3 bg-ink-800 border border-ink-700">
                            <Stack gap={1}>
                              <Label size="xs" className="text-ink-500">Gross Profit</Label>
                              <Label className="font-mono text-success-400 text-lg">${settlement.grossProfit.toLocaleString()}</Label>
                            </Stack>
                          </Card>
                          <Card className="p-3 bg-ink-800 border border-ink-700">
                            <Stack gap={1}>
                              <Label size="xs" className="text-ink-500">Margin</Label>
                              <Label className="font-mono text-white text-lg">{settlement.marginPct}%</Label>
                            </Stack>
                          </Card>
                        </Grid>

                        {settlement.adjustments.length > 0 && (
                          <Stack gap={2}>
                            <Label className="text-ink-400">Adjustments ({settlement.adjustments.length})</Label>
                            {settlement.adjustments.map((adj) => (
                              <Card key={adj.id} className={`p-2 border ${adj.type === "Credit" ? "border-success-800 bg-success-900/10" : "border-error-800 bg-error-900/10"}`}>
                                <Stack direction="horizontal" className="justify-between">
                                  <Label className="text-ink-300">{adj.description}</Label>
                                  <Label className={adj.type === "Credit" ? "text-success-400" : "text-error-400"}>
                                    {adj.type === "Credit" ? "+" : "-"}${adj.amount.toLocaleString()}
                                  </Label>
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
            <Button variant="outlineWhite">Create Settlement</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Export Report</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/projects")}>Back to Projects</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedSettlement} onClose={() => setSelectedSettlement(null)}>
        <ModalHeader><H3>Settlement Details</H3></ModalHeader>
        <ModalBody>
          {selectedSettlement && (
            <Stack gap={4}>
              <Body className="font-display text-white text-lg">{selectedSettlement.projectName}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Event Date</Label><Label className="font-mono text-white">{selectedSettlement.eventDate}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Status</Label><Label className={getStatusColor(selectedSettlement.status)}>{selectedSettlement.status}</Label></Stack>
              </Grid>

              <H3 className="mt-4">Revenue</H3>
              <Grid cols={2} gap={2}>
                {selectedSettlement.ticketRevenue && <Stack direction="horizontal" className="justify-between"><Label className="text-ink-400">Ticket Revenue</Label><Label className="font-mono text-white">${selectedSettlement.ticketRevenue.toLocaleString()}</Label></Stack>}
                {selectedSettlement.merchRevenue && <Stack direction="horizontal" className="justify-between"><Label className="text-ink-400">Merch Revenue</Label><Label className="font-mono text-white">${selectedSettlement.merchRevenue.toLocaleString()}</Label></Stack>}
                {selectedSettlement.sponsorRevenue && <Stack direction="horizontal" className="justify-between"><Label className="text-ink-400">Sponsor Revenue</Label><Label className="font-mono text-white">${selectedSettlement.sponsorRevenue.toLocaleString()}</Label></Stack>}
              </Grid>

              <H3 className="mt-4">Costs</H3>
              <Grid cols={2} gap={2}>
                {selectedSettlement.artistGuarantee && <Stack direction="horizontal" className="justify-between"><Label className="text-ink-400">Artist Guarantee</Label><Label className="font-mono text-white">${selectedSettlement.artistGuarantee.toLocaleString()}</Label></Stack>}
                {selectedSettlement.artistBackend && <Stack direction="horizontal" className="justify-between"><Label className="text-ink-400">Artist Backend</Label><Label className="font-mono text-white">${selectedSettlement.artistBackend.toLocaleString()}</Label></Stack>}
                {selectedSettlement.venueRent && <Stack direction="horizontal" className="justify-between"><Label className="text-ink-400">Venue Rent</Label><Label className="font-mono text-white">${selectedSettlement.venueRent.toLocaleString()}</Label></Stack>}
                {selectedSettlement.productionCosts && <Stack direction="horizontal" className="justify-between"><Label className="text-ink-400">Production</Label><Label className="font-mono text-white">${selectedSettlement.productionCosts.toLocaleString()}</Label></Stack>}
                {selectedSettlement.laborCosts && <Stack direction="horizontal" className="justify-between"><Label className="text-ink-400">Labor</Label><Label className="font-mono text-white">${selectedSettlement.laborCosts.toLocaleString()}</Label></Stack>}
                {selectedSettlement.otherCosts && <Stack direction="horizontal" className="justify-between"><Label className="text-ink-400">Other</Label><Label className="font-mono text-white">${selectedSettlement.otherCosts.toLocaleString()}</Label></Stack>}
              </Grid>

              <Card className="p-4 bg-ink-800 border border-ink-700 mt-4">
                <Grid cols={3} gap={4}>
                  <Stack gap={1}><Label size="xs" className="text-ink-500">Total Revenue</Label><Label className="font-mono text-white">${selectedSettlement.contractValue.toLocaleString()}</Label></Stack>
                  <Stack gap={1}><Label size="xs" className="text-ink-500">Total Costs</Label><Label className="font-mono text-white">${selectedSettlement.actualCosts.toLocaleString()}</Label></Stack>
                  <Stack gap={1}><Label size="xs" className="text-ink-500">Net Profit</Label><Label className="font-mono text-success-400">${selectedSettlement.grossProfit.toLocaleString()}</Label></Stack>
                </Grid>
              </Card>

              {selectedSettlement.approvedBy && (
                <Stack gap={1} className="mt-4">
                  <Label size="xs" className="text-ink-500">Approved By</Label>
                  <Label className="text-white">{selectedSettlement.approvedBy} on {selectedSettlement.approvedAt}</Label>
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
            <Input placeholder="Description" className="border-ink-700 bg-black text-white" />
            <Grid cols={2} gap={4}>
              <Input type="number" placeholder="Amount" className="border-ink-700 bg-black text-white" />
              <Select className="border-ink-700 bg-black text-white">
                <option value="Credit">Credit (+)</option>
                <option value="Debit">Debit (-)</option>
              </Select>
            </Grid>
            <Select className="border-ink-700 bg-black text-white">
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
    </UISection>
  );
}
