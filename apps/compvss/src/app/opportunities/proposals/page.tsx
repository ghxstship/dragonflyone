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
import {
  useProposals,
  type Proposal,
} from '../../../hooks/useProposals';


export default function ProposalsPage() {
  const router = useRouter();
  const { data: proposals = [] } = useProposals();
  
  // URL-synced tab state for deep-linking support
  const { activeTab, setActiveTab, isActive } = useTabState({
    defaultTab: 'all',
    validTabs: ['all', 'draft', 'inreview', 'submitted', 'won'],
  });
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const totalValue = proposals.filter(p => p.status !== "Lost").reduce((s, p) => s + p.value, 0);
  const wonValue = proposals.filter(p => p.status === "Won").reduce((s, p) => s + p.value, 0);
  const pendingCount = proposals.filter(p => ["Draft", "In Review", "Submitted"].includes(p.status)).length;

  const getStatusVariant = (status: string): 'success' | 'info' | 'warning' | 'ghost' | 'error' => {
    switch (status) {
      case "Won": return "success";
      case "Submitted": return "info";
      case "In Review": return "warning";
      case "Draft": return "ghost";
      case "Lost": return "error";
      default: return "ghost";
    }
  };

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const filteredProposals = activeTab === "all" ? proposals : proposals.filter(p => p.status.toLowerCase().replace(" ", "") === activeTab);

  return (
    <>
      <EnterprisePageHeader
        title="Proposals"
        subtitle="Collaborative proposal creation with version control"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard value={proposals.length.toString()} label="Total Proposals" />
              <StatCard value={formatCurrency(totalValue)} label="Pipeline Value" />
              <StatCard value={formatCurrency(wonValue)} label="Won Value" />
              <StatCard value={pendingCount.toString()} label="Pending" />
            </Grid>

            <Stack direction="horizontal" className="justify-between">
              <Tabs>
                <TabsList>
                  <Tab active={isActive('all')} onClick={() => setActiveTab('all')}>All</Tab>
                  <Tab active={isActive('draft')} onClick={() => setActiveTab('draft')}>Draft</Tab>
                  <Tab active={isActive('inreview')} onClick={() => setActiveTab('inreview')}>In Review</Tab>
                  <Tab active={isActive('submitted')} onClick={() => setActiveTab('submitted')}>Submitted</Tab>
                  <Tab active={isActive('won')} onClick={() => setActiveTab('won')}>Won</Tab>
                </TabsList>
              </Tabs>
              <Button variant="solid" onClick={() => setShowCreateModal(true)}>Create Proposal</Button>
            </Stack>

            <Table variant="dark">
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
                        {proposal.rfpId && <Body size="sm" className="">{proposal.rfpId}</Body>}
                      </Stack>
                    </TableCell>
                    <TableCell><Body size="sm" className="">{proposal.client}</Body></TableCell>
                    <TableCell><Body className="font-display">{formatCurrency(proposal.value)}</Body></TableCell>
                    <TableCell><Body size="sm" className="">{proposal.dueDate}</Body></TableCell>
                    <TableCell><Badge variant="outline">v{proposal.version}</Badge></TableCell>
                    <TableCell><Badge variant={getStatusVariant(proposal.status)}>{proposal.status}</Badge></TableCell>
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

            <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
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
                <Badge variant={getStatusVariant(selectedProposal.status)}>{selectedProposal.status}</Badge>
              </Stack>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Body size="sm" className="">Client</Body>
                  <Body>{selectedProposal.client}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">Value</Body>
                  <Body className="font-display">{formatCurrency(selectedProposal.value)}</Body>
                </Stack>
              </Grid>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Body size="sm" className="">Due Date</Body>
                  <Body>{selectedProposal.dueDate}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">Last Modified</Body>
                  <Body>{selectedProposal.lastModified}</Body>
                </Stack>
              </Grid>
              {selectedProposal.rfpId && (
                <Stack gap={1}>
                  <Body size="sm" className="">RFP Reference</Body>
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
                          <Body size="sm" className="">{idx === 0 ? "Current" : `${idx + 1} revision(s) ago`}</Body>
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
    </>
  );
}
