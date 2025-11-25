"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, Alert,
  Modal, ModalHeader, ModalBody, ModalFooter, ProgressBar,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface BackgroundCheck {
  id: string;
  crewMemberId: string;
  crewMemberName: string;
  department: string;
  checkType: "Standard" | "Enhanced" | "Federal";
  status: "Pending" | "In Progress" | "Cleared" | "Flagged" | "Expired";
  submittedDate: string;
  completedDate?: string;
  expirationDate?: string;
  provider: string;
  daysUntilExpiry?: number;
}

const mockChecks: BackgroundCheck[] = [
  { id: "BGC-001", crewMemberId: "CRW-101", crewMemberName: "John Smith", department: "Audio", checkType: "Enhanced", status: "Cleared", submittedDate: "2024-01-15", completedDate: "2024-01-22", expirationDate: "2025-01-22", provider: "Sterling", daysUntilExpiry: 58 },
  { id: "BGC-002", crewMemberId: "CRW-102", crewMemberName: "Sarah Johnson", department: "Lighting", checkType: "Standard", status: "Cleared", submittedDate: "2024-03-10", completedDate: "2024-03-15", expirationDate: "2025-03-15", provider: "Checkr", daysUntilExpiry: 110 },
  { id: "BGC-003", crewMemberId: "CRW-103", crewMemberName: "Mike Davis", department: "Stage", checkType: "Enhanced", status: "Expired", submittedDate: "2023-06-01", completedDate: "2023-06-08", expirationDate: "2024-06-08", provider: "Sterling", daysUntilExpiry: -170 },
  { id: "BGC-004", crewMemberId: "CRW-104", crewMemberName: "Emily Chen", department: "Video", checkType: "Standard", status: "In Progress", submittedDate: "2024-11-20", provider: "Checkr" },
  { id: "BGC-005", crewMemberId: "CRW-105", crewMemberName: "Alex Rodriguez", department: "Rigging", checkType: "Federal", status: "Pending", submittedDate: "2024-11-24", provider: "Sterling" },
  { id: "BGC-006", crewMemberId: "CRW-106", crewMemberName: "Lisa Park", department: "Audio", checkType: "Enhanced", status: "Cleared", submittedDate: "2024-08-01", completedDate: "2024-08-10", expirationDate: "2024-12-10", provider: "Checkr", daysUntilExpiry: 15 },
];

export default function BackgroundChecksPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCheck, setSelectedCheck] = useState<BackgroundCheck | null>(null);
  const [showInitiateModal, setShowInitiateModal] = useState(false);

  const expiringSoon = mockChecks.filter(c => c.daysUntilExpiry !== undefined && c.daysUntilExpiry > 0 && c.daysUntilExpiry <= 30).length;
  const expired = mockChecks.filter(c => c.status === "Expired").length;
  const pending = mockChecks.filter(c => c.status === "Pending" || c.status === "In Progress").length;
  const cleared = mockChecks.filter(c => c.status === "Cleared").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Cleared": return "text-green-400";
      case "Pending": case "In Progress": return "text-yellow-400";
      case "Expired": return "text-red-400";
      case "Flagged": return "text-orange-400";
      default: return "text-ink-400";
    }
  };

  const getExpiryColor = (days?: number) => {
    if (days === undefined) return "text-ink-400";
    if (days < 0) return "text-red-400";
    if (days <= 30) return "text-orange-400";
    if (days <= 60) return "text-yellow-400";
    return "text-green-400";
  };

  const filteredChecks = activeTab === "all" ? mockChecks :
    activeTab === "expiring" ? mockChecks.filter(c => c.daysUntilExpiry !== undefined && c.daysUntilExpiry > 0 && c.daysUntilExpiry <= 30) :
    activeTab === "expired" ? mockChecks.filter(c => c.status === "Expired") :
    mockChecks.filter(c => c.status === "Pending" || c.status === "In Progress");

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Background Checks</H1>
            <Label className="text-ink-400">Crew background check status and renewal management</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Cleared" value={cleared} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Pending" value={pending} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Expiring Soon" value={expiringSoon} trend={expiringSoon > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Expired" value={expired} trend={expired > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          {(expiringSoon > 0 || expired > 0) && (
            <Alert variant="warning">
              ⚠️ {expiringSoon} check(s) expiring within 30 days, {expired} expired check(s) require renewal
            </Alert>
          )}

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
                <Tab active={activeTab === "expiring"} onClick={() => setActiveTab("expiring")}>Expiring Soon</Tab>
                <Tab active={activeTab === "expired"} onClick={() => setActiveTab("expired")}>Expired</Tab>
                <Tab active={activeTab === "pending"} onClick={() => setActiveTab("pending")}>Pending</Tab>
              </TabsList>
            </Tabs>
            <Button variant="outlineWhite" onClick={() => setShowInitiateModal(true)}>Initiate Check</Button>
          </Stack>

          <Table className="border-2 border-ink-800">
            <TableHeader>
              <TableRow className="bg-ink-900">
                <TableHead className="text-ink-400">Crew Member</TableHead>
                <TableHead className="text-ink-400">Department</TableHead>
                <TableHead className="text-ink-400">Check Type</TableHead>
                <TableHead className="text-ink-400">Status</TableHead>
                <TableHead className="text-ink-400">Expiration</TableHead>
                <TableHead className="text-ink-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredChecks.map((check) => (
                <TableRow key={check.id} className="border-ink-800">
                  <TableCell>
                    <Stack gap={1}>
                      <Label className="text-white">{check.crewMemberName}</Label>
                      <Label size="xs" className="text-ink-500">{check.crewMemberId}</Label>
                    </Stack>
                  </TableCell>
                  <TableCell><Badge variant="outline">{check.department}</Badge></TableCell>
                  <TableCell><Label className="text-ink-300">{check.checkType}</Label></TableCell>
                  <TableCell><Label className={getStatusColor(check.status)}>{check.status}</Label></TableCell>
                  <TableCell>
                    {check.expirationDate ? (
                      <Stack gap={1}>
                        <Label className="text-ink-300">{check.expirationDate}</Label>
                        <Label size="xs" className={getExpiryColor(check.daysUntilExpiry)}>
                          {check.daysUntilExpiry !== undefined && check.daysUntilExpiry < 0 ? `${Math.abs(check.daysUntilExpiry)} days ago` : `${check.daysUntilExpiry} days`}
                        </Label>
                      </Stack>
                    ) : (
                      <Label className="text-ink-500">-</Label>
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedCheck(check)}>Details</Button>
                      {(check.status === "Expired" || (check.daysUntilExpiry !== undefined && check.daysUntilExpiry <= 30)) && (
                        <Button variant="solid" size="sm">Renew</Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400">Export Report</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/certifications")}>Certifications</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/crew")}>Crew Directory</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedCheck} onClose={() => setSelectedCheck(null)}>
        <ModalHeader><H3>Background Check Details</H3></ModalHeader>
        <ModalBody>
          {selectedCheck && (
            <Stack gap={4}>
              <Body className="font-display text-white text-lg">{selectedCheck.crewMemberName}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Department</Label><Badge variant="outline">{selectedCheck.department}</Badge></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Check Type</Label><Label className="text-white">{selectedCheck.checkType}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Status</Label><Label className={getStatusColor(selectedCheck.status)}>{selectedCheck.status}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Provider</Label><Label className="text-white">{selectedCheck.provider}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Submitted</Label><Label className="text-white">{selectedCheck.submittedDate}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Completed</Label><Label className="text-white">{selectedCheck.completedDate || "Pending"}</Label></Stack>
              </Grid>
              {selectedCheck.expirationDate && (
                <Stack gap={2}>
                  <Stack gap={1}><Label size="xs" className="text-ink-500">Expiration</Label><Label className={getExpiryColor(selectedCheck.daysUntilExpiry)}>{selectedCheck.expirationDate}</Label></Stack>
                  {selectedCheck.daysUntilExpiry !== undefined && selectedCheck.daysUntilExpiry > 0 && (
                    <ProgressBar value={Math.max(0, 100 - (selectedCheck.daysUntilExpiry / 365) * 100)} className="h-2" />
                  )}
                </Stack>
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
              <option value="">Select Crew Member...</option>
              <option value="CRW-107">New Hire - James Wilson</option>
              <option value="CRW-108">New Hire - Maria Garcia</option>
            </Select>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Check Type...</option>
              <option value="standard">Standard</option>
              <option value="enhanced">Enhanced</option>
              <option value="federal">Federal</option>
            </Select>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Provider...</option>
              <option value="sterling">Sterling</option>
              <option value="checkr">Checkr</option>
            </Select>
            <Alert variant="info">The crew member will receive an email to authorize the background check</Alert>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowInitiateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowInitiateModal(false)}>Send Request</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
