"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, ProgressBar,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface Proposal {
  id: string;
  title: string;
  client: string;
  rfpId?: string;
  value: number;
  status: "Draft" | "In Review" | "Submitted" | "Won" | "Lost";
  dueDate: string;
  version: number;
  lastModified: string;
  team: string[];
}

const mockProposals: Proposal[] = [
  { id: "PROP-001", title: "Summer Festival 2025 Production", client: "Festival Productions", rfpId: "RFP-2024-045", value: 450000, status: "In Review", dueDate: "2024-12-01", version: 3, lastModified: "2024-11-24", team: ["John Smith", "Sarah Johnson"] },
  { id: "PROP-002", title: "Corporate Gala AV Package", client: "Tech Corp", value: 125000, status: "Draft", dueDate: "2024-11-30", version: 1, lastModified: "2024-11-25", team: ["Mike Davis"] },
  { id: "PROP-003", title: "Concert Series Production", client: "Live Nation", rfpId: "RFP-2024-042", value: 780000, status: "Submitted", dueDate: "2024-11-20", version: 5, lastModified: "2024-11-18", team: ["John Smith", "Emily Chen", "Robert Wilson"] },
  { id: "PROP-004", title: "Theater Technical Services", client: "Broadway Inc", value: 95000, status: "Won", dueDate: "2024-11-15", version: 4, lastModified: "2024-11-14", team: ["Sarah Johnson"] },
  { id: "PROP-005", title: "Sports Event Production", client: "Stadium Group", rfpId: "RFP-2024-038", value: 320000, status: "Lost", dueDate: "2024-11-10", version: 2, lastModified: "2024-11-08", team: ["Mike Davis", "Emily Chen"] },
];

export default function ProposalsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const totalValue = mockProposals.filter(p => p.status !== "Lost").reduce((s, p) => s + p.value, 0);
  const wonValue = mockProposals.filter(p => p.status === "Won").reduce((s, p) => s + p.value, 0);
  const pendingCount = mockProposals.filter(p => ["Draft", "In Review", "Submitted"].includes(p.status)).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Won": return "text-success-400";
      case "Submitted": return "text-info-400";
      case "In Review": return "text-warning-400";
      case "Draft": return "text-ink-400";
      case "Lost": return "text-error-400";
      default: return "text-ink-400";
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const filteredProposals = activeTab === "all" ? mockProposals : mockProposals.filter(p => p.status.toLowerCase().replace(" ", "") === activeTab);

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Proposals</H1>
            <Label className="text-ink-400">Collaborative proposal creation with version control</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Proposals" value={mockProposals.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Pipeline Value" value={formatCurrency(totalValue)} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Won Value" value={formatCurrency(wonValue)} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Pending" value={pendingCount} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
                <Tab active={activeTab === "draft"} onClick={() => setActiveTab("draft")}>Draft</Tab>
                <Tab active={activeTab === "inreview"} onClick={() => setActiveTab("inreview")}>In Review</Tab>
                <Tab active={activeTab === "submitted"} onClick={() => setActiveTab("submitted")}>Submitted</Tab>
                <Tab active={activeTab === "won"} onClick={() => setActiveTab("won")}>Won</Tab>
              </TabsList>
            </Tabs>
            <Button variant="outlineWhite" onClick={() => setShowCreateModal(true)}>Create Proposal</Button>
          </Stack>

          <Table className="border-2 border-ink-800">
            <TableHeader>
              <TableRow className="bg-ink-900">
                <TableHead className="text-ink-400">Proposal</TableHead>
                <TableHead className="text-ink-400">Client</TableHead>
                <TableHead className="text-ink-400">Value</TableHead>
                <TableHead className="text-ink-400">Due Date</TableHead>
                <TableHead className="text-ink-400">Version</TableHead>
                <TableHead className="text-ink-400">Status</TableHead>
                <TableHead className="text-ink-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProposals.map((proposal) => (
                <TableRow key={proposal.id} className="border-ink-800">
                  <TableCell>
                    <Stack gap={1}>
                      <Label className="text-white">{proposal.title}</Label>
                      {proposal.rfpId && <Label size="xs" className="text-ink-500">{proposal.rfpId}</Label>}
                    </Stack>
                  </TableCell>
                  <TableCell><Label className="text-ink-300">{proposal.client}</Label></TableCell>
                  <TableCell><Label className="font-mono text-white">{formatCurrency(proposal.value)}</Label></TableCell>
                  <TableCell><Label className="text-ink-300">{proposal.dueDate}</Label></TableCell>
                  <TableCell><Badge variant="outline">v{proposal.version}</Badge></TableCell>
                  <TableCell><Label className={getStatusColor(proposal.status)}>{proposal.status}</Label></TableCell>
                  <TableCell>
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedProposal(proposal)}>View</Button>
                      {proposal.status === "Draft" && <Button variant="solid" size="sm">Edit</Button>}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/opportunities")}>Opportunities</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/rfp")}>RFPs</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/")}>Dashboard</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedProposal} onClose={() => setSelectedProposal(null)}>
        <ModalHeader><H3>{selectedProposal?.title}</H3></ModalHeader>
        <ModalBody>
          {selectedProposal && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">v{selectedProposal.version}</Badge>
                <Label className={getStatusColor(selectedProposal.status)}>{selectedProposal.status}</Label>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Client</Label><Label className="text-white">{selectedProposal.client}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Value</Label><Label className="font-mono text-white">{formatCurrency(selectedProposal.value)}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Due Date</Label><Label className="text-white">{selectedProposal.dueDate}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Last Modified</Label><Label className="text-white">{selectedProposal.lastModified}</Label></Stack>
              </Grid>
              {selectedProposal.rfpId && <Stack gap={1}><Label className="text-ink-400">RFP Reference</Label><Label className="text-white">{selectedProposal.rfpId}</Label></Stack>}
              <Stack gap={2}>
                <Label className="text-ink-400">Team</Label>
                <Stack direction="horizontal" gap={2}>
                  {selectedProposal.team.map((member, idx) => <Badge key={idx} variant="outline">{member}</Badge>)}
                </Stack>
              </Stack>
              <Stack gap={2}>
                <Label className="text-ink-400">Version History</Label>
                <Stack gap={2}>
                  {Array.from({ length: Math.min(selectedProposal.version, 3) }).map((_, idx) => (
                    <Card key={idx} className="p-3 border border-ink-700">
                      <Stack direction="horizontal" className="justify-between">
                        <Stack gap={1}>
                          <Badge variant={idx === 0 ? "solid" : "outline"}>v{selectedProposal.version - idx}</Badge>
                          <Label size="xs" className="text-ink-500">{idx === 0 ? "Current" : `${idx + 1} revision(s) ago`}</Label>
                        </Stack>
                        <Button variant="ghost" size="sm">View</Button>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedProposal(null)}>Close</Button>
          <Button variant="outline">Download PDF</Button>
          {selectedProposal?.status === "Draft" && <Button variant="solid">Edit Proposal</Button>}
        </ModalFooter>
      </Modal>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Proposal</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Proposal Title" className="border-ink-700 bg-black text-white" />
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Select Client...</option>
              <option value="festival">Festival Productions</option>
              <option value="tech">Tech Corp</option>
              <option value="live">Live Nation</option>
            </Select>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Link to RFP (optional)...</option>
              <option value="rfp1">RFP-2024-045</option>
              <option value="rfp2">RFP-2024-042</option>
            </Select>
            <Input type="number" placeholder="Estimated Value" className="border-ink-700 bg-black text-white" />
            <Input type="date" placeholder="Due Date" className="border-ink-700 bg-black text-white" />
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Use Template...</option>
              <option value="standard">Standard Production</option>
              <option value="festival">Festival Package</option>
              <option value="corporate">Corporate Event</option>
            </Select>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Create</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
