"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel,
  Modal, ModalHeader, ModalBody, ModalFooter, Badge, Alert, Checkbox,
} from "@ghxstship/ui";

interface QACheckpoint {
  id: string;
  name: string;
  department: "Audio" | "Lighting" | "Video" | "Staging" | "Rigging" | "Safety";
  phase: "Load-In" | "Setup" | "Tech Rehearsal" | "Show Ready" | "Strike";
  status: "Pending" | "In Progress" | "Passed" | "Failed" | "Waived";
  assignee?: string;
  completedAt?: string;
  completedBy?: string;
  notes?: string;
  items: { id: string; description: string; checked: boolean; critical: boolean }[];
}

const mockCheckpoints: QACheckpoint[] = [
  {
    id: "QA-001", name: "Audio System Check", department: "Audio", phase: "Setup", status: "Passed",
    assignee: "John Martinez", completedAt: "2024-11-24T14:30:00Z", completedBy: "John Martinez",
    items: [
      { id: "A1", description: "All speakers powered and receiving signal", checked: true, critical: true },
      { id: "A2", description: "Console patched correctly", checked: true, critical: true },
      { id: "A3", description: "Wireless frequencies scanned and clear", checked: true, critical: false },
      { id: "A4", description: "Backup systems tested", checked: true, critical: false },
    ]
  },
  {
    id: "QA-002", name: "Lighting Focus", department: "Lighting", phase: "Setup", status: "In Progress",
    assignee: "Sarah Chen",
    items: [
      { id: "L1", description: "All fixtures addressed and responding", checked: true, critical: true },
      { id: "L2", description: "Focus positions verified", checked: false, critical: true },
      { id: "L3", description: "Color and gobo inventory confirmed", checked: true, critical: false },
      { id: "L4", description: "Backup lamps available", checked: false, critical: false },
    ]
  },
  {
    id: "QA-003", name: "Rigging Safety Inspection", department: "Rigging", phase: "Load-In", status: "Passed",
    assignee: "Mike Thompson", completedAt: "2024-11-24T10:00:00Z", completedBy: "Mike Thompson",
    notes: "All points within load limits",
    items: [
      { id: "R1", description: "Point loads verified against venue specs", checked: true, critical: true },
      { id: "R2", description: "Safety cables installed on all fixtures", checked: true, critical: true },
      { id: "R3", description: "Motor controllers tested", checked: true, critical: true },
      { id: "R4", description: "Emergency stop tested", checked: true, critical: true },
    ]
  },
  {
    id: "QA-004", name: "Video System Check", department: "Video", phase: "Tech Rehearsal", status: "Pending",
    assignee: "Lisa Park",
    items: [
      { id: "V1", description: "All screens displaying correctly", checked: false, critical: true },
      { id: "V2", description: "Content loaded and tested", checked: false, critical: true },
      { id: "V3", description: "Camera feeds verified", checked: false, critical: false },
      { id: "V4", description: "Backup playback system ready", checked: false, critical: false },
    ]
  },
  {
    id: "QA-005", name: "Stage Safety Walk", department: "Safety", phase: "Show Ready", status: "Pending",
    items: [
      { id: "S1", description: "Fire extinguishers accessible", checked: false, critical: true },
      { id: "S2", description: "Emergency exits clear and marked", checked: false, critical: true },
      { id: "S3", description: "First aid kit stocked", checked: false, critical: true },
      { id: "S4", description: "Trip hazards addressed", checked: false, critical: false },
    ]
  },
];

export default function QACheckpointsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<QACheckpoint | null>(null);
  const [showSignOffModal, setShowSignOffModal] = useState(false);

  const passedCount = mockCheckpoints.filter(c => c.status === "Passed").length;
  const pendingCount = mockCheckpoints.filter(c => c.status === "Pending").length;
  const failedCount = mockCheckpoints.filter(c => c.status === "Failed").length;
  const criticalPending = mockCheckpoints.filter(c => c.status !== "Passed" && c.items.some(i => i.critical && !i.checked)).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Passed": return "text-success-400";
      case "In Progress": return "text-warning-400";
      case "Pending": return "text-ink-400";
      case "Failed": return "text-error-400";
      case "Waived": return "text-info-400";
      default: return "text-ink-400";
    }
  };

  const filteredCheckpoints = activeTab === "all" ? mockCheckpoints : mockCheckpoints.filter(c => c.phase.toLowerCase().replace(" ", "-") === activeTab);

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>QA Checkpoints</H1>
            <Label className="text-ink-400">Quality assurance and sign-off tracking for production phases</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Passed" value={passedCount} trend="up" className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Pending" value={pendingCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Failed" value={failedCount} trend={failedCount > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Critical Pending" value={criticalPending} trend={criticalPending > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          {criticalPending > 0 && (
            <Alert variant="warning">{criticalPending} checkpoint(s) have critical items pending verification</Alert>
          )}

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
              <Tab active={activeTab === "load-in"} onClick={() => setActiveTab("load-in")}>Load-In</Tab>
              <Tab active={activeTab === "setup"} onClick={() => setActiveTab("setup")}>Setup</Tab>
              <Tab active={activeTab === "tech-rehearsal"} onClick={() => setActiveTab("tech-rehearsal")}>Tech Rehearsal</Tab>
              <Tab active={activeTab === "show-ready"} onClick={() => setActiveTab("show-ready")}>Show Ready</Tab>
            </TabsList>

            <TabPanel active={true}>
              <Stack gap={4}>
                {filteredCheckpoints.map((checkpoint) => (
                  <Card key={checkpoint.id} className={`border-2 p-6 ${checkpoint.status === "Failed" ? "border-error-800 bg-error-900/10" : "border-ink-800 bg-ink-900/50"}`}>
                    <Grid cols={6} gap={4} className="items-center">
                      <Stack gap={1}>
                        <Body className="font-display text-white">{checkpoint.name}</Body>
                        <Stack direction="horizontal" gap={2}>
                          <Badge variant="outline">{checkpoint.department}</Badge>
                          <Badge variant="outline">{checkpoint.phase}</Badge>
                        </Stack>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Assignee</Label>
                        <Label className="text-white">{checkpoint.assignee || "Unassigned"}</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Items</Label>
                        <Label className="text-white">{checkpoint.items.filter(i => i.checked).length}/{checkpoint.items.length} complete</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Status</Label>
                        <Label className={getStatusColor(checkpoint.status)}>{checkpoint.status}</Label>
                      </Stack>
                      <Stack direction="horizontal" gap={2} className="justify-end">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedCheckpoint(checkpoint)}>Details</Button>
                        {checkpoint.status !== "Passed" && (
                          <Button variant="outline" size="sm" onClick={() => { setSelectedCheckpoint(checkpoint); setShowSignOffModal(true); }}>Sign Off</Button>
                        )}
                      </Stack>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </TabPanel>
          </Tabs>

          <Grid cols={3} gap={4}>
            <Button variant="outlineWhite">Add Checkpoint</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Export Report</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/build-strike")}>Build and Strike</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedCheckpoint && !showSignOffModal} onClose={() => setSelectedCheckpoint(null)}>
        <ModalHeader><H3>Checkpoint Details</H3></ModalHeader>
        <ModalBody>
          {selectedCheckpoint && (
            <Stack gap={4}>
              <Body className="font-display text-white text-lg">{selectedCheckpoint.name}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Department</Label><Badge variant="outline">{selectedCheckpoint.department}</Badge></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Phase</Label><Badge variant="outline">{selectedCheckpoint.phase}</Badge></Stack>
              </Grid>
              <Stack gap={2}>
                <Label className="text-ink-400">Checklist Items</Label>
                {selectedCheckpoint.items.map((item) => (
                  <Card key={item.id} className={`p-3 border ${item.checked ? "border-success-800 bg-success-900/10" : "border-ink-700"}`}>
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack direction="horizontal" gap={2}>
                        <Label className={item.checked ? "text-success-400" : "text-white"}>{item.checked ? "✓" : "○"}</Label>
                        <Label className={item.checked ? "text-ink-400" : "text-white"}>{item.description}</Label>
                      </Stack>
                      {item.critical && <Badge variant="solid">Critical</Badge>}
                    </Stack>
                  </Card>
                ))}
              </Stack>
              {selectedCheckpoint.notes && (
                <Stack gap={1}><Label size="xs" className="text-ink-500">Notes</Label><Body className="text-ink-300">{selectedCheckpoint.notes}</Body></Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedCheckpoint(null)}>Close</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showSignOffModal} onClose={() => setShowSignOffModal(false)}>
        <ModalHeader><H3>Sign Off Checkpoint</H3></ModalHeader>
        <ModalBody>
          {selectedCheckpoint && (
            <Stack gap={4}>
              <Body className="text-white">{selectedCheckpoint.name}</Body>
              <Alert variant="info">By signing off, you confirm all items have been verified</Alert>
              <Stack gap={2}>
                <Label>Your Name</Label>
                <Input placeholder="Enter your name" className="border-ink-700 bg-black text-white" />
              </Stack>
              <Stack gap={2}>
                <Label>Notes (optional)</Label>
                <Input placeholder="Any additional notes" className="border-ink-700 bg-black text-white" />
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowSignOffModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => { setShowSignOffModal(false); setSelectedCheckpoint(null); }}>Sign Off</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
