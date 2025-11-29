"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompvssAppLayout } from "../../../components/app-layout";
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
  Card,
  Tabs,
  TabsList,
  Tab,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EnterprisePageHeader,
  MainContent,
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
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Proposals"
        subtitle="Collaborative proposal creation with version control"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Opportunities', href: '/opportunities' }, { label: 'Proposals' }]}
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6}>
              <StatCard value={mockProposals.length.toString()} label="Total Proposals" />
              <StatCard value={formatCurrency(totalValue)} label="Pipeline Value" />
              <StatCard value={formatCurrency(wonValue)} label="Won Value" />
              <StatCard value={pendingCount.toString()} label="Pending" />
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
              <Button variant="solid" onClick={() => setShowCreateModal(true)}>Create Proposal</Button>
            </Stack>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proposal</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProposals.map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell>
                      <Stack gap={1}>
                        <Body>{proposal.title}</Body>
                        {proposal.rfpId && <Body className="text-body-sm">{proposal.rfpId}</Body>}
                      </Stack>
                    </TableCell>
                    <TableCell><Body className="text-body-sm">{proposal.client}</Body></TableCell>
                    <TableCell><Body className="font-display">{formatCurrency(proposal.value)}</Body></TableCell>
                    <TableCell><Body className="text-body-sm">{proposal.dueDate}</Body></TableCell>
                    <TableCell><Badge variant="outline">v{proposal.version}</Badge></TableCell>
                    <TableCell><Badge variant={proposal.status === "Won" ? "solid" : "outline"}>{proposal.status}</Badge></TableCell>
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
              <Button variant="outline" onClick={() => router.push("/opportunities")}>Opportunities</Button>
              <Button variant="outline" onClick={() => router.push("/rfp")}>RFPs</Button>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>Dashboard</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>

      <Modal open={!!selectedProposal} onClose={() => setSelectedProposal(null)}>
        <ModalHeader><H3>{selectedProposal?.title}</H3></ModalHeader>
        <ModalBody>
          {selectedProposal && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">v{selectedProposal.version}</Badge>
                <Badge variant={selectedProposal.status === "Won" ? "solid" : "outline"}>{selectedProposal.status}</Badge>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="text-body-sm">Client</Body>
                  <Body>{selectedProposal.client}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="text-body-sm">Value</Body>
                  <Body className="font-display">{formatCurrency(selectedProposal.value)}</Body>
                </Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="text-body-sm">Due Date</Body>
                  <Body>{selectedProposal.dueDate}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="text-body-sm">Last Modified</Body>
                  <Body>{selectedProposal.lastModified}</Body>
                </Stack>
              </Grid>
              {selectedProposal.rfpId && (
                <Stack gap={1}>
                  <Body className="text-body-sm">RFP Reference</Body>
                  <Body>{selectedProposal.rfpId}</Body>
                </Stack>
              )}
              <Stack gap={2}>
                <Body className="font-display">Team</Body>
                <Stack direction="horizontal" gap={2}>
                  {selectedProposal.team.map((member, idx) => <Badge key={idx} variant="outline">{member}</Badge>)}
                </Stack>
              </Stack>
              <Stack gap={2}>
                <Body className="font-display">Version History</Body>
                <Stack gap={2}>
                  {Array.from({ length: Math.min(selectedProposal.version, 3) }).map((_, idx) => (
                    <Card key={idx} className="p-3">
                      <Stack direction="horizontal" className="justify-between">
                        <Stack gap={1}>
                          <Badge variant={idx === 0 ? "solid" : "outline"}>v{selectedProposal.version - idx}</Badge>
                          <Body className="text-body-sm">{idx === 0 ? "Current" : `${idx + 1} revision(s) ago`}</Body>
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
            <Input placeholder="Proposal Title" />
            <Select>
              <option value="">Select Client...</option>
              <option value="festival">Festival Productions</option>
              <option value="tech">Tech Corp</option>
              <option value="live">Live Nation</option>
            </Select>
            <Select>
              <option value="">Link to RFP (optional)...</option>
              <option value="rfp1">RFP-2024-045</option>
              <option value="rfp2">RFP-2024-042</option>
            </Select>
            <Input type="number" placeholder="Estimated Value" />
            <Input type="date" placeholder="Due Date" />
            <Select>
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
    </CompvssAppLayout>
  );
}
