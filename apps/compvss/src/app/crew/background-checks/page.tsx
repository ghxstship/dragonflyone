"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, Alert, ProgressBar,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "text-success-400";
      case "In Progress": case "Pending": return "text-warning-400";
      case "Failed": case "Expired": return "text-error-400";
      default: return "text-ink-400";
    }
  };

  const getResultColor = (result?: string) => {
    switch (result) {
      case "Clear": return "text-success-400";
      case "Review Required": return "text-warning-400";
      case "Failed": return "text-error-400";
      default: return "text-ink-400";
    }
  };

  const filteredChecks = activeTab === "all" ? mockChecks :
    activeTab === "expiring" ? mockChecks.filter(c => c.daysUntilExpiry !== undefined && c.daysUntilExpiry > 0 && c.daysUntilExpiry <= 30) :
    activeTab === "expired" ? mockChecks.filter(c => c.status === "Expired" || (c.daysUntilExpiry !== undefined && c.daysUntilExpiry < 0)) :
    mockChecks.filter(c => c.status === "In Progress" || c.status === "Pending");

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Background Checks</H1>
            <Label className="text-ink-400">Background check status and renewal alerts</Label>
          </Stack>

          {(expiringCount > 0 || expiredCount > 0) && (
            <Alert variant="warning">
              ⚠️ {expiringCount} check(s) expiring within 30 days, {expiredCount} expired check(s) require renewal
            </Alert>
          )}

          <Grid cols={4} gap={6}>
            <StatCard label="Total Checks" value={mockChecks.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="In Progress" value={pendingCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Expiring Soon" value={expiringCount} trend={expiringCount > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Expired" value={expiredCount} trend={expiredCount > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
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
            <Button variant="outlineWhite" onClick={() => setShowInitiateModal(true)}>Initiate Check</Button>
          </Stack>

          <Table className="border-2 border-ink-800">
            <TableHeader>
              <TableRow className="bg-ink-900">
                <TableHead className="text-ink-400">Employee</TableHead>
                <TableHead className="text-ink-400">Department</TableHead>
                <TableHead className="text-ink-400">Check Type</TableHead>
                <TableHead className="text-ink-400">Status</TableHead>
                <TableHead className="text-ink-400">Result</TableHead>
                <TableHead className="text-ink-400">Expiry</TableHead>
                <TableHead className="text-ink-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChecks.map((check) => (
                <TableRow key={check.id} className="border-ink-800">
                  <TableCell>
                    <Stack gap={1}>
                      <Label className="text-white">{check.employeeName}</Label>
                      <Label size="xs" className="text-ink-500">{check.employeeId}</Label>
                    </Stack>
                  </TableCell>
                  <TableCell><Badge variant="outline">{check.department}</Badge></TableCell>
                  <TableCell><Label className="text-ink-300">{check.checkType}</Label></TableCell>
                  <TableCell><Label className={getStatusColor(check.status)}>{check.status}</Label></TableCell>
                  <TableCell><Label className={getResultColor(check.result)}>{check.result || "-"}</Label></TableCell>
                  <TableCell>
                    {check.expiryDate ? (
                      <Stack gap={1}>
                        <Label className={check.daysUntilExpiry && check.daysUntilExpiry < 0 ? "text-error-400" : check.daysUntilExpiry && check.daysUntilExpiry <= 30 ? "text-warning-400" : "text-ink-300"}>{check.expiryDate}</Label>
                        <Label size="xs" className={check.daysUntilExpiry && check.daysUntilExpiry < 0 ? "text-error-400" : "text-ink-500"}>
                          {check.daysUntilExpiry && check.daysUntilExpiry < 0 ? `${Math.abs(check.daysUntilExpiry)} days ago` : `${check.daysUntilExpiry} days`}
                        </Label>
                      </Stack>
                    ) : (
                      <Label className="text-ink-500">-</Label>
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

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/crew")}>Crew</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/certifications")}>Certifications</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/")}>Dashboard</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedCheck} onClose={() => setSelectedCheck(null)}>
        <ModalHeader><H3>Background Check Details</H3></ModalHeader>
        <ModalBody>
          {selectedCheck && (
            <Stack gap={4}>
              <Body className="text-white">{selectedCheck.employeeName}</Body>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedCheck.department}</Badge>
                <Badge variant="outline">{selectedCheck.checkType}</Badge>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Status</Label><Label className={getStatusColor(selectedCheck.status)}>{selectedCheck.status}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Result</Label><Label className={getResultColor(selectedCheck.result)}>{selectedCheck.result || "Pending"}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Submitted</Label><Label className="text-white">{selectedCheck.submittedDate}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Completed</Label><Label className="text-white">{selectedCheck.completedDate || "In Progress"}</Label></Stack>
              </Grid>
              {selectedCheck.expiryDate && (
                <Stack gap={1}>
                  <Label className="text-ink-400">Expiry Date</Label>
                  <Label className={selectedCheck.daysUntilExpiry && selectedCheck.daysUntilExpiry < 0 ? "text-error-400" : "text-white"}>{selectedCheck.expiryDate}</Label>
                </Stack>
              )}
              {selectedCheck.result === "Review Required" && (
                <Card className="p-4 border border-warning-800 bg-warning-900/20">
                  <Stack gap={2}>
                    <Label className="text-warning-400">⚠️ Review Required</Label>
                    <Label className="text-ink-300">This background check requires manual review before clearance.</Label>
                  </Stack>
                </Card>
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
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Select Employee...</option>
              {mockChecks.map(c => <option key={c.employeeId} value={c.employeeId}>{c.employeeName}</option>)}
            </Select>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Check Type...</option>
              <option value="Criminal">Criminal</option>
              <option value="Employment">Employment Verification</option>
              <option value="Education">Education Verification</option>
              <option value="Credit">Credit Check</option>
              <option value="Comprehensive">Comprehensive</option>
            </Select>
            <Card className="p-4 border border-ink-700">
              <Stack gap={2}>
                <Label className="text-ink-400">Check Pricing</Label>
                <Grid cols={2} gap={2}>
                  <Label className="text-ink-300">Criminal: $25</Label>
                  <Label className="text-ink-300">Employment: $35</Label>
                  <Label className="text-ink-300">Education: $30</Label>
                  <Label className="text-ink-300">Comprehensive: $75</Label>
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
    </UISection>
  );
}
