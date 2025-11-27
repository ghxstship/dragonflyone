"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea, Alert, ProgressBar,
} from "@ghxstship/ui";

interface VendorSelection {
  id: string;
  rfpId: string;
  rfpTitle: string;
  status: "Evaluating" | "Pending Approval" | "Approved" | "Rejected" | "Awarded";
  vendors: VendorBid[];
  evaluationCriteria: EvaluationCriteria[];
  approvers: Approver[];
  dueDate: string;
  createdAt: string;
}

interface VendorBid {
  id: string;
  vendorName: string;
  bidAmount: number;
  technicalScore: number;
  priceScore: number;
  overallScore: number;
  rank: number;
  recommendation: "Recommended" | "Acceptable" | "Not Recommended";
  notes?: string;
}

interface EvaluationCriteria {
  name: string;
  weight: number;
  description: string;
}

interface Approver {
  id: string;
  name: string;
  role: string;
  status: "Pending" | "Approved" | "Rejected";
  approvedAt?: string;
  comments?: string;
}

const mockSelections: VendorSelection[] = [
  {
    id: "VS-001",
    rfpId: "RFP-2024-045",
    rfpTitle: "Audio Equipment Rental - Summer Fest 2024",
    status: "Pending Approval",
    dueDate: "2024-11-30",
    createdAt: "2024-11-15",
    vendors: [
      { id: "V-001", vendorName: "PRG Audio", bidAmount: 45000, technicalScore: 92, priceScore: 85, overallScore: 89, rank: 1, recommendation: "Recommended" },
      { id: "V-002", vendorName: "Sound Systems Inc", bidAmount: 42000, technicalScore: 78, priceScore: 90, overallScore: 83, rank: 2, recommendation: "Acceptable" },
      { id: "V-003", vendorName: "AudioTech Pro", bidAmount: 38000, technicalScore: 65, priceScore: 95, overallScore: 77, rank: 3, recommendation: "Not Recommended", notes: "Limited experience with large-scale events" },
    ],
    evaluationCriteria: [
      { name: "Technical Capability", weight: 40, description: "Equipment quality and technical expertise" },
      { name: "Price", weight: 30, description: "Competitive pricing and value" },
      { name: "Experience", weight: 20, description: "Past performance and references" },
      { name: "Availability", weight: 10, description: "Equipment availability and delivery" },
    ],
    approvers: [
      { id: "A-001", name: "John Smith", role: "Procurement Manager", status: "Approved", approvedAt: "2024-11-20", comments: "Good selection, recommend proceeding" },
      { id: "A-002", name: "Jane Doe", role: "Finance Director", status: "Pending" },
      { id: "A-003", name: "Mike Johnson", role: "Operations VP", status: "Pending" },
    ],
  },
  {
    id: "VS-002",
    rfpId: "RFP-2024-046",
    rfpTitle: "Lighting Package - Corporate Gala",
    status: "Evaluating",
    dueDate: "2024-12-05",
    createdAt: "2024-11-18",
    vendors: [
      { id: "V-004", vendorName: "Robe Lighting", bidAmount: 28000, technicalScore: 88, priceScore: 82, overallScore: 86, rank: 1, recommendation: "Recommended" },
      { id: "V-005", vendorName: "Stage Lights Co", bidAmount: 25000, technicalScore: 75, priceScore: 88, overallScore: 80, rank: 2, recommendation: "Acceptable" },
    ],
    evaluationCriteria: [
      { name: "Technical Capability", weight: 40, description: "Equipment quality" },
      { name: "Price", weight: 35, description: "Competitive pricing" },
      { name: "Experience", weight: 25, description: "Past performance" },
    ],
    approvers: [
      { id: "A-004", name: "Sarah Chen", role: "Procurement Manager", status: "Pending" },
    ],
  },
];

export default function VendorSelectionPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
  const [selectedSelection, setSelectedSelection] = useState<VendorSelection | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const pendingApprovals = mockSelections.filter(s => s.status === "Pending Approval").length;
  const evaluating = mockSelections.filter(s => s.status === "Evaluating").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Awarded": return "text-success-400";
      case "Approved": return "text-info-400";
      case "Pending Approval": return "text-warning-400";
      case "Evaluating": return "text-ink-400";
      case "Rejected": return "text-error-400";
      default: return "text-ink-400";
    }
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case "Recommended": return "text-success-400";
      case "Acceptable": return "text-warning-400";
      case "Not Recommended": return "text-error-400";
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
            <H1>Vendor Selection</H1>
            <Label className="text-ink-400">Evaluate bids, score vendors, and route for approval</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Active Selections" value={mockSelections.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Pending Approval" value={pendingApprovals} trend={pendingApprovals > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Evaluating" value={evaluating} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Awarded This Month" value={2} trend="up" className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "active"} onClick={() => setActiveTab("active")}>Active Selections</Tab>
              <Tab active={activeTab === "completed"} onClick={() => setActiveTab("completed")}>Completed</Tab>
            </TabsList>

            <TabPanel active={activeTab === "active"}>
              <Stack gap={4}>
                {mockSelections.map((selection) => (
                  <Card key={selection.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Stack gap={1}>
                          <Body className="font-display text-white text-body-md">{selection.rfpTitle}</Body>
                          <Label className="text-ink-500">{selection.rfpId}</Label>
                        </Stack>
                        <Label className={getStatusColor(selection.status)}>{selection.status}</Label>
                      </Stack>

                      <Grid cols={3} gap={4}>
                        <Stack gap={1}>
                          <Label size="xs" className="text-ink-500">Vendors Evaluated</Label>
                          <Label className="text-white">{selection.vendors.length}</Label>
                        </Stack>
                        <Stack gap={1}>
                          <Label size="xs" className="text-ink-500">Due Date</Label>
                          <Label className="font-mono text-white">{selection.dueDate}</Label>
                        </Stack>
                        <Stack gap={1}>
                          <Label size="xs" className="text-ink-500">Approval Progress</Label>
                          <Stack direction="horizontal" gap={2}>
                            {selection.approvers.map((a) => (
                              <Badge key={a.id} variant={a.status === "Approved" ? "solid" : "outline"}>
                                {a.status === "Approved" ? "✓" : "○"}
                              </Badge>
                            ))}
                          </Stack>
                        </Stack>
                      </Grid>

                      <Table className="border border-ink-700">
                        <TableHeader>
                          <TableRow className="bg-ink-800">
                            <TableHead>Rank</TableHead>
                            <TableHead>Vendor</TableHead>
                            <TableHead>Bid Amount</TableHead>
                            <TableHead>Technical</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Overall</TableHead>
                            <TableHead>Recommendation</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selection.vendors.map((vendor) => (
                            <TableRow key={vendor.id} className={vendor.rank === 1 ? "bg-success-900/10" : ""}>
                              <TableCell><Badge variant={vendor.rank === 1 ? "solid" : "outline"}>#{vendor.rank}</Badge></TableCell>
                              <TableCell><Label className="text-white">{vendor.vendorName}</Label></TableCell>
                              <TableCell className="font-mono text-white">${vendor.bidAmount.toLocaleString()}</TableCell>
                              <TableCell><Label className="text-ink-300">{vendor.technicalScore}</Label></TableCell>
                              <TableCell><Label className="text-ink-300">{vendor.priceScore}</Label></TableCell>
                              <TableCell><Label className="font-mono text-white">{vendor.overallScore}</Label></TableCell>
                              <TableCell><Label className={getRecommendationColor(vendor.recommendation)}>{vendor.recommendation}</Label></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      <Stack direction="horizontal" gap={4} className="justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedSelection(selection)}>View Details</Button>
                        {selection.status === "Pending Approval" && (
                          <Button variant="outline" size="sm" onClick={() => { setSelectedSelection(selection); setShowApprovalModal(true); }}>Review & Approve</Button>
                        )}
                        {selection.status === "Evaluating" && (
                          <Button variant="outline" size="sm">Complete Evaluation</Button>
                        )}
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "completed"}>
              <Card className="border-2 border-ink-800 bg-ink-900/50 p-8 text-center">
                <Label className="text-ink-400">No completed selections to display</Label>
              </Card>
            </TabPanel>
          </Tabs>

          <Grid cols={3} gap={4}>
            <Button variant="outlineWhite" onClick={() => router.push("/rfp")}>View RFPs</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Export Report</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/procurement")}>Back to Procurement</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedSelection && !showApprovalModal} onClose={() => setSelectedSelection(null)}>
        <ModalHeader><H3>Selection Details</H3></ModalHeader>
        <ModalBody>
          {selectedSelection && (
            <Stack gap={4}>
              <Body className="font-display text-white">{selectedSelection.rfpTitle}</Body>
              <Stack gap={2}>
                <Label className="text-ink-400">Evaluation Criteria</Label>
                {selectedSelection.evaluationCriteria.map((criteria) => (
                  <Card key={criteria.name} className="p-3 bg-ink-800 border border-ink-700">
                    <Stack direction="horizontal" className="justify-between">
                      <Stack gap={1}>
                        <Label className="text-white">{criteria.name}</Label>
                        <Label size="xs" className="text-ink-500">{criteria.description}</Label>
                      </Stack>
                      <Badge variant="outline">{criteria.weight}%</Badge>
                    </Stack>
                  </Card>
                ))}
              </Stack>
              <Stack gap={2}>
                <Label className="text-ink-400">Approval Chain</Label>
                {selectedSelection.approvers.map((approver) => (
                  <Card key={approver.id} className={`p-3 border ${approver.status === "Approved" ? "border-success-800 bg-success-900/10" : "border-ink-700 bg-ink-800"}`}>
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack gap={1}>
                        <Label className="text-white">{approver.name}</Label>
                        <Label size="xs" className="text-ink-500">{approver.role}</Label>
                      </Stack>
                      <Label className={approver.status === "Approved" ? "text-success-400" : approver.status === "Rejected" ? "text-error-400" : "text-warning-400"}>
                        {approver.status}
                      </Label>
                    </Stack>
                    {approver.comments && <Label size="xs" className="text-ink-400 mt-2">{approver.comments}</Label>}
                  </Card>
                ))}
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedSelection(null)}>Close</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showApprovalModal} onClose={() => { setShowApprovalModal(false); setSelectedSelection(null); }}>
        <ModalHeader><H3>Review & Approve</H3></ModalHeader>
        <ModalBody>
          {selectedSelection && (
            <Stack gap={4}>
              <Body className="text-white">{selectedSelection.rfpTitle}</Body>
              <Alert variant="info">
                Recommended vendor: {selectedSelection.vendors.find(v => v.rank === 1)?.vendorName} at ${selectedSelection.vendors.find(v => v.rank === 1)?.bidAmount.toLocaleString()}
              </Alert>
              <Stack gap={2}>
                <Label>Your Decision</Label>
                <Grid cols={2} gap={4}>
                  <Card className="p-4 border-2 border-success-800 bg-success-900/10 cursor-pointer text-center">
                    <Label className="text-success-400">Approve</Label>
                  </Card>
                  <Card className="p-4 border-2 border-error-800 bg-error-900/10 cursor-pointer text-center">
                    <Label className="text-error-400">Reject</Label>
                  </Card>
                </Grid>
              </Stack>
              <Stack gap={2}>
                <Label>Comments</Label>
                <Textarea placeholder="Add your comments..." className="border-ink-700 bg-black text-white" rows={3} />
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowApprovalModal(false); setSelectedSelection(null); }}>Cancel</Button>
          <Button variant="solid" onClick={() => { setShowApprovalModal(false); setSelectedSelection(null); }}>Submit Decision</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
