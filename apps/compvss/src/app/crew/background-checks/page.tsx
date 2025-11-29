"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../../components/navigation";
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  StatCard,
  Select,
  Button,
  Section,
  Card,
  Tabs,
  TabsList,
  Tab,
  Badge,
  Alert,
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
  PageLayout,
  SectionHeader,
  EnterprisePageHeader,
  MainContent,} from "@ghxstship/ui";

interface BackgroundCheck {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  checkType: "Criminal" | "Employment" | "Education" | "Credit" | "Comprehensive";
  status: "Pending" | "In Progress" | "Completed" | "Failed" | "Expired";
  submittedDate: string;
  completedDate?: string;
  expiryDate?: string;
  daysUntilExpiry?: number;
  result?: "Clear" | "Review Required" | "Failed";
}

const mockChecks: BackgroundCheck[] = [
  { id: "BC-001", employeeName: "John Smith", employeeId: "EMP-001", department: "Audio", checkType: "Comprehensive", status: "Completed", submittedDate: "2024-01-15", completedDate: "2024-01-20", expiryDate: "2025-01-20", daysUntilExpiry: 56, result: "Clear" },
  { id: "BC-002", employeeName: "Sarah Johnson", employeeId: "EMP-002", department: "Lighting", checkType: "Criminal", status: "Expired", submittedDate: "2023-11-01", completedDate: "2023-11-05", expiryDate: "2024-11-05", daysUntilExpiry: -20, result: "Clear" },
  { id: "BC-003", employeeName: "Mike Davis", employeeId: "EMP-003", department: "Stage", checkType: "Comprehensive", status: "In Progress", submittedDate: "2024-11-20" },
  { id: "BC-004", employeeName: "Emily Chen", employeeId: "EMP-004", department: "Video", checkType: "Employment", status: "Completed", submittedDate: "2024-06-01", completedDate: "2024-06-10", expiryDate: "2025-06-10", daysUntilExpiry: 197, result: "Clear" },
  { id: "BC-005", employeeName: "Robert Wilson", employeeId: "EMP-005", department: "Rigging", checkType: "Comprehensive", status: "Completed", submittedDate: "2024-09-15", completedDate: "2024-09-22", expiryDate: "2024-12-22", daysUntilExpiry: 27, result: "Review Required" },
];

export default function BackgroundChecksPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCheck, setSelectedCheck] = useState<BackgroundCheck | null>(null);
  const [showInitiateModal, setShowInitiateModal] = useState(false);

  const expiringCount = mockChecks.filter(c => c.daysUntilExpiry !== undefined && c.daysUntilExpiry > 0 && c.daysUntilExpiry <= 30).length;
  const expiredCount = mockChecks.filter(c => c.status === "Expired" || (c.daysUntilExpiry !== undefined && c.daysUntilExpiry < 0)).length;
  const pendingCount = mockChecks.filter(c => c.status === "Pending" || c.status === "In Progress").length;

  const filteredChecks = activeTab === "all" ? mockChecks :
    activeTab === "expiring" ? mockChecks.filter(c => c.daysUntilExpiry !== undefined && c.daysUntilExpiry > 0 && c.daysUntilExpiry <= 30) :
    activeTab === "expired" ? mockChecks.filter(c => c.status === "Expired" || (c.daysUntilExpiry !== undefined && c.daysUntilExpiry < 0)) :
    mockChecks.filter(c => c.status === "In Progress" || c.status === "Pending");

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <EnterprisePageHeader
        title="Background Checks"
        subtitle="Background check status and renewal alerts"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Crew', href: '/crew' }, { label: 'Background Checks' }]}
        views={[
          { id: 'default', label: 'Default', icon: 'grid' },
        ]}
        activeView="default"
        showFavorite
        showSettings
      />

            {(expiringCount > 0 || expiredCount > 0) && (
              <Alert variant="warning">
                {expiringCount} check(s) expiring within 30 days, {expiredCount} expired check(s) require renewal
              </Alert>
            )}

            <Grid cols={4} gap={6}>
              <StatCard value={mockChecks.length.toString()} label="Total Checks" />
              <StatCard value={pendingCount.toString()} label="In Progress" />
              <StatCard value={expiringCount.toString()} label="Expiring Soon" />
              <StatCard value={expiredCount.toString()} label="Expired" />
            </Grid>

            <Stack direction="horizontal" className="justify-between">
              <Tabs>
                <TabsList>
                  <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
                  <Tab active={activeTab === "pending"} onClick={() => setActiveTab("pending")}>In Progress</Tab>
                  <Tab active={activeTab === "expiring"} onClick={() => setActiveTab("expiring")}>Expiring</Tab>
                  <Tab active={activeTab === "expired"} onClick={() => setActiveTab("expired")}>Expired</Tab>
                </TabsList>
              </Tabs>
              <Button variant="solid" onClick={() => setShowInitiateModal(true)}>Initiate Check</Button>
            </Stack>

            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Check Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChecks.map((check) => (
                    <TableRow key={check.id}>
                      <TableCell>
                        <Stack gap={1}>
                          <Body>{check.employeeName}</Body>
                          <Body className="text-body-sm">{check.employeeId}</Body>
                        </Stack>
                      </TableCell>
                      <TableCell><Badge variant="outline">{check.department}</Badge></TableCell>
                      <TableCell><Body className="text-body-sm">{check.checkType}</Body></TableCell>
                      <TableCell><Badge variant={check.status === "Completed" ? "solid" : "outline"}>{check.status}</Badge></TableCell>
                      <TableCell><Body className="text-body-sm">{check.result || "-"}</Body></TableCell>
                      <TableCell>
                        {check.expiryDate ? (
                          <Stack gap={1}>
                            <Body className="text-body-sm">{check.expiryDate}</Body>
                            <Body className="text-body-sm">
                              {check.daysUntilExpiry && check.daysUntilExpiry < 0 ? `${Math.abs(check.daysUntilExpiry)} days ago` : `${check.daysUntilExpiry} days`}
                            </Body>
                          </Stack>
                        ) : (
                          <Body className="text-body-sm">-</Body>
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedCheck(check)}>View</Button>
                          {(check.status === "Expired" || (check.daysUntilExpiry && check.daysUntilExpiry <= 30)) && (
                            <Button variant="solid" size="sm">Renew</Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <Grid cols={3} gap={4}>
              <Button variant="outline" onClick={() => router.push("/crew")}>Crew</Button>
              <Button variant="outline" onClick={() => router.push("/certifications")}>Certifications</Button>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>Dashboard</Button>
            </Grid>
          </Stack>
        </Container>
      </Section>

      <Modal open={!!selectedCheck} onClose={() => setSelectedCheck(null)}>
        <ModalHeader><H3>Background Check Details</H3></ModalHeader>
        <ModalBody>
          {selectedCheck && (
            <Stack gap={4}>
              <Body className="font-display">{selectedCheck.employeeName}</Body>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedCheck.department}</Badge>
                <Badge variant="outline">{selectedCheck.checkType}</Badge>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="font-display">Status</Body>
                  <Badge variant={selectedCheck.status === "Completed" ? "solid" : "outline"}>{selectedCheck.status}</Badge>
                </Stack>
                <Stack gap={1}>
                  <Body className="font-display">Result</Body>
                  <Body>{selectedCheck.result || "Pending"}</Body>
                </Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="font-display">Submitted</Body>
                  <Body>{selectedCheck.submittedDate}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="font-display">Completed</Body>
                  <Body>{selectedCheck.completedDate || "In Progress"}</Body>
                </Stack>
              </Grid>
              {selectedCheck.expiryDate && (
                <Stack gap={1}>
                  <Body className="font-display">Expiry Date</Body>
                  <Body>{selectedCheck.expiryDate}</Body>
                </Stack>
              )}
              {selectedCheck.result === "Review Required" && (
                <Alert variant="warning">
                  This background check requires manual review before clearance.
                </Alert>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedCheck(null)}>Close</Button>
          <Button variant="outline">Download Report</Button>
          {selectedCheck?.status === "Expired" && <Button variant="solid">Initiate Renewal</Button>}
        </ModalFooter>
      </Modal>

      <Modal open={showInitiateModal} onClose={() => setShowInitiateModal(false)}>
        <ModalHeader><H3>Initiate Background Check</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Select>
              <option value="">Select Employee...</option>
              {mockChecks.map(c => <option key={c.employeeId} value={c.employeeId}>{c.employeeName}</option>)}
            </Select>
            <Select>
              <option value="">Check Type...</option>
              <option value="Criminal">Criminal</option>
              <option value="Employment">Employment Verification</option>
              <option value="Education">Education Verification</option>
              <option value="Credit">Credit Check</option>
              <option value="Comprehensive">Comprehensive</option>
            </Select>
            <Card className="p-4">
              <Stack gap={2}>
                <Body className="font-display">Check Pricing</Body>
                <Grid cols={2} gap={2}>
                  <Body className="text-body-sm">Criminal: $25</Body>
                  <Body className="text-body-sm">Employment: $35</Body>
                  <Body className="text-body-sm">Education: $30</Body>
                  <Body className="text-body-sm">Comprehensive: $75</Body>
                </Grid>
              </Stack>
            </Card>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowInitiateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowInitiateModal(false)}>Submit Request</Button>
        </ModalFooter>
      </Modal>
    </PageLayout>
  );
}
