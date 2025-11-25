"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, ProgressBar,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface Referral {
  id: string;
  candidateName: string;
  position: string;
  referredBy: string;
  referrerDept: string;
  submittedDate: string;
  status: "Pending" | "Interviewing" | "Hired" | "Rejected";
  bonusStatus?: "Pending" | "Paid";
  bonusAmount?: number;
}

const mockReferrals: Referral[] = [
  { id: "REF-001", candidateName: "Alex Thompson", position: "Audio Engineer", referredBy: "John Smith", referrerDept: "Audio", submittedDate: "2024-11-20", status: "Interviewing" },
  { id: "REF-002", candidateName: "Maria Garcia", position: "Lighting Designer", referredBy: "Sarah Johnson", referrerDept: "Lighting", submittedDate: "2024-11-15", status: "Hired", bonusStatus: "Pending", bonusAmount: 2500 },
  { id: "REF-003", candidateName: "James Wilson", position: "Stage Manager", referredBy: "Mike Davis", referrerDept: "Stage", submittedDate: "2024-11-10", status: "Hired", bonusStatus: "Paid", bonusAmount: 2500 },
  { id: "REF-004", candidateName: "Emily Chen", position: "Video Technician", referredBy: "John Smith", referrerDept: "Audio", submittedDate: "2024-11-05", status: "Rejected" },
];

export default function ReferralProgramPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const hiredCount = mockReferrals.filter(r => r.status === "Hired").length;
  const pendingBonuses = mockReferrals.filter(r => r.bonusStatus === "Pending").reduce((s, r) => s + (r.bonusAmount || 0), 0);
  const totalPaid = mockReferrals.filter(r => r.bonusStatus === "Paid").reduce((s, r) => s + (r.bonusAmount || 0), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hired": case "Paid": return "text-green-400";
      case "Interviewing": case "Pending": return "text-yellow-400";
      case "Rejected": return "text-red-400";
      default: return "text-ink-400";
    }
  };

  const filteredReferrals = activeTab === "all" ? mockReferrals : mockReferrals.filter(r => r.status.toLowerCase() === activeTab);

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Referral Program</H1>
            <Label className="text-ink-400">Employee referral tracking and bonus management</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Referrals" value={mockReferrals.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Hired" value={hiredCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Pending Bonuses" value={`$${pendingBonuses.toLocaleString()}`} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Paid" value={`$${totalPaid.toLocaleString()}`} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
            <Stack gap={4}>
              <H3>Referral Bonus Structure</H3>
              <Grid cols={3} gap={4}>
                <Card className="p-4 border border-ink-700 text-center">
                  <Label className="font-mono text-white text-2xl">$2,500</Label>
                  <Label className="text-ink-400">Standard Positions</Label>
                </Card>
                <Card className="p-4 border border-ink-700 text-center">
                  <Label className="font-mono text-white text-2xl">$5,000</Label>
                  <Label className="text-ink-400">Senior/Lead Positions</Label>
                </Card>
                <Card className="p-4 border border-ink-700 text-center">
                  <Label className="font-mono text-white text-2xl">$7,500</Label>
                  <Label className="text-ink-400">Director+ Positions</Label>
                </Card>
              </Grid>
              <Label className="text-ink-500">Bonus paid after 90-day retention period</Label>
            </Stack>
          </Card>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
                <Tab active={activeTab === "interviewing"} onClick={() => setActiveTab("interviewing")}>Interviewing</Tab>
                <Tab active={activeTab === "hired"} onClick={() => setActiveTab("hired")}>Hired</Tab>
              </TabsList>
            </Tabs>
            <Button variant="outlineWhite" onClick={() => setShowSubmitModal(true)}>Submit Referral</Button>
          </Stack>

          <Table className="border-2 border-ink-800">
            <TableHeader>
              <TableRow className="bg-ink-900">
                <TableHead className="text-ink-400">Candidate</TableHead>
                <TableHead className="text-ink-400">Position</TableHead>
                <TableHead className="text-ink-400">Referred By</TableHead>
                <TableHead className="text-ink-400">Date</TableHead>
                <TableHead className="text-ink-400">Status</TableHead>
                <TableHead className="text-ink-400">Bonus</TableHead>
                <TableHead className="text-ink-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReferrals.map((referral) => (
                <TableRow key={referral.id} className="border-ink-800">
                  <TableCell><Label className="text-white">{referral.candidateName}</Label></TableCell>
                  <TableCell><Label className="text-ink-300">{referral.position}</Label></TableCell>
                  <TableCell>
                    <Stack gap={0}>
                      <Label className="text-white">{referral.referredBy}</Label>
                      <Label size="xs" className="text-ink-500">{referral.referrerDept}</Label>
                    </Stack>
                  </TableCell>
                  <TableCell><Label className="text-ink-400">{referral.submittedDate}</Label></TableCell>
                  <TableCell><Label className={getStatusColor(referral.status)}>{referral.status}</Label></TableCell>
                  <TableCell>
                    {referral.bonusAmount ? (
                      <Stack gap={0}>
                        <Label className="font-mono text-white">${referral.bonusAmount.toLocaleString()}</Label>
                        <Label size="xs" className={getStatusColor(referral.bonusStatus || "")}>{referral.bonusStatus}</Label>
                      </Stack>
                    ) : (
                      <Label className="text-ink-500">-</Label>
                    )}
                  </TableCell>
                  <TableCell><Button variant="ghost" size="sm" onClick={() => setSelectedReferral(referral)}>Details</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/workforce")}>Workforce</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/employees")}>Employees</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/")}>Dashboard</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedReferral} onClose={() => setSelectedReferral(null)}>
        <ModalHeader><H3>Referral Details</H3></ModalHeader>
        <ModalBody>
          {selectedReferral && (
            <Stack gap={4}>
              <Body className="text-white">{selectedReferral.candidateName}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Position</Label><Label className="text-white">{selectedReferral.position}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Status</Label><Label className={getStatusColor(selectedReferral.status)}>{selectedReferral.status}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-400">Referred By</Label><Label className="text-white">{selectedReferral.referredBy}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-400">Department</Label><Label className="text-white">{selectedReferral.referrerDept}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label className="text-ink-400">Submitted</Label><Label className="text-white">{selectedReferral.submittedDate}</Label></Stack>
              {selectedReferral.bonusAmount && (
                <Stack gap={1}>
                  <Label className="text-ink-400">Bonus</Label>
                  <Stack direction="horizontal" gap={2}>
                    <Label className="font-mono text-white">${selectedReferral.bonusAmount.toLocaleString()}</Label>
                    <Badge variant={selectedReferral.bonusStatus === "Paid" ? "solid" : "outline"}>{selectedReferral.bonusStatus}</Badge>
                  </Stack>
                </Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedReferral(null)}>Close</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showSubmitModal} onClose={() => setShowSubmitModal(false)}>
        <ModalHeader><H3>Submit Referral</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Candidate Name" className="border-ink-700 bg-black text-white" />
            <Input type="email" placeholder="Candidate Email" className="border-ink-700 bg-black text-white" />
            <Input type="tel" placeholder="Candidate Phone" className="border-ink-700 bg-black text-white" />
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Position...</option>
              <option value="audio">Audio Engineer</option>
              <option value="lighting">Lighting Designer</option>
              <option value="video">Video Technician</option>
              <option value="stage">Stage Manager</option>
            </Select>
            <Input placeholder="How do you know this person?" className="border-ink-700 bg-black text-white" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowSubmitModal(false)}>Submit</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
