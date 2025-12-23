"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocalTabState } from "@ghxstship/config/hooks";
// Layout provided by route group
import {
  Container,
  H3,
  Body,
  Label,
  Grid,
  Stack,
  StatCard,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
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
  Alert,
  Textarea,
  EnterprisePageHeader,
  MainContent,
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
  id?: string;
  vendorName?: string;
  name?: string;
  bidAmount?: number;
  price?: number;
  technicalScore?: number;
  priceScore?: number;
  overallScore?: number;
  score?: number;
  rank?: number;
  recommendation?: "Recommended" | "Acceptable" | "Not Recommended";
  notes?: string;
  status?: string;
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

import { DEMO_VENDOR_SELECTIONS } from '../../../../lib/demo-data';

const mockSelections = DEMO_VENDOR_SELECTIONS as unknown as VendorSelection[];

export default function VendorSelectionPage() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useLocalTabState({
    storageKey: 'vendor-selection-tab',
    defaultTab: 'active',
  });
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
    <>
      <EnterprisePageHeader
        title="Vendor Selection"
        subtitle="Evaluate bids, score vendors, and route for approval"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

          <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Active Selections" value={mockSelections.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Pending Approval" value={pendingApprovals} trend={pendingApprovals > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Evaluating" value={evaluating} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Awarded This Month" value={2} trend="up" className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={isActive('active')} onClick={() => setActiveTab('active')}>Active Selections</Tab>
              <Tab active={isActive('completed')} onClick={() => setActiveTab('completed')}>Completed</Tab>
            </TabsList>

            <TabPanel active={isActive('active')}>
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

                      <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
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
                            {(selection.approvers || []).map((a) => (
                              <Badge key={a.id} variant={a.status === "Approved" ? "solid" : "outline"}>
                                {a.status === "Approved" ? "✓" : "○"}
                              </Badge>
                            ))}
                          </Stack>
                        </Stack>
                      </Grid>

                      <Table variant="dark" className="border-2 border-ink-700">
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
                          {(selection.vendors || []).map((vendor, index) => (
                            <TableRow key={vendor.id || index} className={index === 0 ? "bg-success-900/10" : ""}>
                              <TableCell><Badge variant={index === 0 ? "solid" : "outline"}>#{index + 1}</Badge></TableCell>
                              <TableCell><Label className="text-white">{vendor.vendorName || vendor.name}</Label></TableCell>
                              <TableCell className="font-mono text-white">${(vendor.bidAmount || vendor.price || 0).toLocaleString()}</TableCell>
                              <TableCell><Label className="text-ink-300">{vendor.technicalScore || vendor.score || 0}</Label></TableCell>
                              <TableCell><Label className="text-ink-300">{vendor.priceScore || Math.round((vendor.score || 0) * 0.9)}</Label></TableCell>
                              <TableCell><Label className="font-mono text-white">{vendor.overallScore || vendor.score || 0}</Label></TableCell>
                              <TableCell><Label className={getRecommendationColor(vendor.recommendation || ((vendor.score ?? 0) >= 90 ? 'Recommended' : 'Acceptable'))}>{vendor.recommendation || ((vendor.score ?? 0) >= 90 ? 'Recommended' : 'Acceptable')}</Label></TableCell>
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

            <TabPanel active={isActive('completed')}>
              <Card className="border-2 border-ink-800 bg-ink-900/50 p-8 text-center">
                <Label className="text-ink-400">No completed selections to display</Label>
              </Card>
            </TabPanel>
          </Tabs>

            <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
              <Button variant="outlineWhite" onClick={() => router.push("/rfp")}>View RFPs</Button>
              <Button variant="outline" className="border-grey-700 text-grey-400">Export Report</Button>
              <Button variant="outline" className="border-grey-700 text-grey-400" onClick={() => router.push("/procurement")}>Back to Procurement</Button>
            </Grid>

      <Modal open={!!selectedSelection && !showApprovalModal} onClose={() => setSelectedSelection(null)}>
        <ModalHeader><H3>Selection Details</H3></ModalHeader>
        <ModalBody>
          {selectedSelection && (
            <Stack gap={4}>
              <Body className="font-display text-white">{selectedSelection.rfpTitle}</Body>
              <Stack gap={2}>
                <Label className="text-ink-400">Evaluation Criteria</Label>
                {selectedSelection.evaluationCriteria.map((criteria) => (
                  <Card key={criteria.name} className="p-3 bg-ink-800 border-2 border-ink-700">
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
                  <Card key={approver.id} className={`p-3 border-2 ${approver.status === "Approved" ? "border-success-800 bg-success-900/10" : "border-ink-700 bg-ink-800"}`}>
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
                Recommended vendor: {selectedSelection.vendors[0]?.vendorName || selectedSelection.vendors[0]?.name} at ${(selectedSelection.vendors[0]?.bidAmount || selectedSelection.vendors[0]?.price || 0).toLocaleString()}
              </Alert>
              <Stack gap={2}>
                <Label>Your Decision</Label>
                <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
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
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
