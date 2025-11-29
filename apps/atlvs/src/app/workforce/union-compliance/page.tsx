"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../../components/navigation";
import {
  Container, H3, Body, Label, Grid, Stack, StatCard, Select, Button,
  Section, Card, Tabs, TabsList, Tab, TabPanel, Badge, Alert, PageLayout, SectionHeader,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
  EnterprisePageHeader,
  MainContent,} from "@ghxstship/ui";

interface UnionLocal {
  id: string;
  name: string;
  code: string;
  jurisdiction: string;
  memberCount: number;
  contactName: string;
  contactPhone: string;
  agreementExpiry: string;
  status: "Active" | "Expiring" | "Expired";
}

interface UnionRule {
  id: string;
  localId: string;
  category: string;
  rule: string;
  requirement: string;
  penalty?: string;
}

const mockLocals: UnionLocal[] = [
  { id: "UL-001", name: "IATSE Local 1", code: "IA-1", jurisdiction: "New York", memberCount: 3200, contactName: "John Smith", contactPhone: "212-555-0100", agreementExpiry: "2025-06-30", status: "Active" },
  { id: "UL-002", name: "IATSE Local 33", code: "IA-33", jurisdiction: "Los Angeles", memberCount: 2800, contactName: "Maria Garcia", contactPhone: "323-555-0200", agreementExpiry: "2025-03-15", status: "Expiring" },
  { id: "UL-003", name: "IBEW Local 3", code: "IBEW-3", jurisdiction: "New York", memberCount: 1500, contactName: "Robert Johnson", contactPhone: "212-555-0300", agreementExpiry: "2024-12-31", status: "Expiring" },
  { id: "UL-004", name: "Teamsters Local 817", code: "TM-817", jurisdiction: "New York", memberCount: 890, contactName: "Sarah Davis", contactPhone: "212-555-0400", agreementExpiry: "2025-09-30", status: "Active" },
];

const mockRules: UnionRule[] = [
  { id: "UR-001", localId: "UL-001", category: "Work Hours", rule: "8-Hour Day", requirement: "Overtime after 8 hours at 1.5x rate", penalty: "Back pay + penalties" },
  { id: "UR-002", localId: "UL-001", category: "Meal Breaks", rule: "Meal Penalty", requirement: "6-hour meal break maximum", penalty: "$50/30min violation" },
  { id: "UR-003", localId: "UL-001", category: "Turnaround", rule: "12-Hour Rest", requirement: "Minimum 12 hours between calls", penalty: "Golden time rates" },
  { id: "UR-004", localId: "UL-002", category: "Staffing", rule: "Minimum Crew", requirement: "4-person minimum for rigging calls", penalty: "Full crew pay required" },
];

export default function UnionCompliancePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("locals");
  const [selectedLocal, setSelectedLocal] = useState<UnionLocal | null>(null);
  const [selectedRule, setSelectedRule] = useState<UnionRule | null>(null);

  const expiringCount = mockLocals.filter(l => l.status === "Expiring").length;
  const totalMembers = mockLocals.reduce((s, l) => s + l.memberCount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-success-400";
      case "Expiring": return "text-warning-400";
      case "Expired": return "text-error-400";
      default: return "text-ink-400";
    }
  };

  return (
    <PageLayout background="black" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <EnterprisePageHeader
        title="Union Compliance"
        subtitle="Union rules, agreements, and compliance tracking"
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Workforce', href: '/workforce' }, { label: 'Union Compliance' }]}
        views={[
          { id: 'default', label: 'Default', icon: 'grid' },
        ]}
        activeView="default"
        showFavorite
        showSettings
      />

          {expiringCount > 0 && (
            <Alert variant="warning">
              ⚠️ {expiringCount} union agreement(s) expiring within 90 days
            </Alert>
          )}

          <Grid cols={4} gap={6}>
            <StatCard label="Union Locals" value={mockLocals.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Members" value={totalMembers.toLocaleString()} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Active Rules" value={mockRules.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Expiring Agreements" value={expiringCount} trend={expiringCount > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "locals"} onClick={() => setActiveTab("locals")}>Union Locals</Tab>
              <Tab active={activeTab === "rules"} onClick={() => setActiveTab("rules")}>Work Rules</Tab>
              <Tab active={activeTab === "agreements"} onClick={() => setActiveTab("agreements")}>Agreements</Tab>
            </TabsList>

            <TabPanel active={activeTab === "locals"}>
              <Grid cols={2} gap={4}>
                {mockLocals.map((local) => (
                  <Card key={local.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between">
                        <Stack gap={1}>
                          <Body className="font-display text-white">{local.name}</Body>
                          <Badge variant="outline">{local.code}</Badge>
                        </Stack>
                        <Label className={getStatusColor(local.status)}>{local.status}</Label>
                      </Stack>
                      <Grid cols={2} gap={4}>
                        <Stack gap={1}><Label size="xs" className="text-ink-500">Jurisdiction</Label><Label className="text-white">{local.jurisdiction}</Label></Stack>
                        <Stack gap={1}><Label size="xs" className="text-ink-500">Members</Label><Label className="font-mono text-white">{local.memberCount.toLocaleString()}</Label></Stack>
                      </Grid>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Contact</Label>
                        <Label className="text-white">{local.contactName}</Label>
                        <Label className="text-ink-400">{local.contactPhone}</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Agreement Expiry</Label>
                        <Label className={getStatusColor(local.status)}>{local.agreementExpiry}</Label>
                      </Stack>
                      <Button variant="outline" size="sm" onClick={() => setSelectedLocal(local)}>View Details</Button>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "rules"}>
              <Table className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead className="text-ink-400">Local</TableHead>
                    <TableHead className="text-ink-400">Category</TableHead>
                    <TableHead className="text-ink-400">Rule</TableHead>
                    <TableHead className="text-ink-400">Requirement</TableHead>
                    <TableHead className="text-ink-400">Penalty</TableHead>
                    <TableHead className="text-ink-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRules.map((rule) => (
                    <TableRow key={rule.id} className="border-ink-800">
                      <TableCell><Badge variant="outline">{mockLocals.find(l => l.id === rule.localId)?.code}</Badge></TableCell>
                      <TableCell><Label className="text-ink-300">{rule.category}</Label></TableCell>
                      <TableCell><Label className="text-white">{rule.rule}</Label></TableCell>
                      <TableCell><Label className="text-ink-300">{rule.requirement}</Label></TableCell>
                      <TableCell><Label className="text-error-400">{rule.penalty || "-"}</Label></TableCell>
                      <TableCell><Button variant="ghost" size="sm" onClick={() => setSelectedRule(rule)}>Details</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>

            <TabPanel active={activeTab === "agreements"}>
              <Stack gap={4}>
                {mockLocals.map((local) => (
                  <Card key={local.id} className="border-2 border-ink-800 bg-ink-900/50 p-4">
                    <Grid cols={6} gap={4} className="items-center">
                      <Stack gap={1}>
                        <Label className="text-white">{local.name}</Label>
                        <Badge variant="outline">{local.code}</Badge>
                      </Stack>
                      <Label className="text-ink-300">{local.jurisdiction}</Label>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Expiry Date</Label>
                        <Label className={getStatusColor(local.status)}>{local.agreementExpiry}</Label>
                      </Stack>
                      <Label className={getStatusColor(local.status)}>{local.status}</Label>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="outline" size="sm">View Agreement</Button>
                        {local.status === "Expiring" && <Button variant="solid" size="sm">Initiate Renewal</Button>}
                      </Stack>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </TabPanel>
          </Tabs>

            <Grid cols={3} gap={4}>
              <Button variant="outline" className="border-grey-700 text-grey-400" onClick={() => router.push("/workforce")}>Workforce</Button>
              <Button variant="outline" className="border-grey-700 text-grey-400" onClick={() => router.push("/employees")}>Employees</Button>
              <Button variant="outline" className="border-grey-700 text-grey-400" onClick={() => router.push("/")}>Dashboard</Button>
            </Grid>
          </Stack>
        </Container>
      </Section>

      <Modal open={!!selectedLocal} onClose={() => setSelectedLocal(null)}>
        <ModalHeader><H3>{selectedLocal?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedLocal && (
            <Stack gap={4}>
              <Badge variant="outline">{selectedLocal.code}</Badge>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-grey-400">Jurisdiction</Label><Label className="text-white">{selectedLocal.jurisdiction}</Label></Stack>
                <Stack gap={1}><Label className="text-grey-400">Members</Label><Label className="font-mono text-white">{selectedLocal.memberCount.toLocaleString()}</Label></Stack>
              </Grid>
              <Stack gap={1}>
                <Label className="text-grey-400">Contact</Label>
                <Label className="text-white">{selectedLocal.contactName}</Label>
                <Label className="text-grey-300">{selectedLocal.contactPhone}</Label>
              </Stack>
              <Stack gap={1}>
                <Label className="text-grey-400">Agreement Status</Label>
                <Label className={getStatusColor(selectedLocal.status)}>{selectedLocal.status} - Expires {selectedLocal.agreementExpiry}</Label>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedLocal(null)}>Close</Button>
          <Button variant="solid">View Agreement</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedRule} onClose={() => setSelectedRule(null)}>
        <ModalHeader><H3>{selectedRule?.rule}</H3></ModalHeader>
        <ModalBody>
          {selectedRule && (
            <Stack gap={4}>
              <Badge variant="outline">{selectedRule.category}</Badge>
              <Stack gap={1}><Label className="text-grey-400">Requirement</Label><Body className="text-white">{selectedRule.requirement}</Body></Stack>
              {selectedRule.penalty && <Stack gap={1}><Label className="text-grey-400">Penalty</Label><Label className="text-error-400">{selectedRule.penalty}</Label></Stack>}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedRule(null)}>Close</Button>
        </ModalFooter>
      </Modal>
    </PageLayout>
  );
}
