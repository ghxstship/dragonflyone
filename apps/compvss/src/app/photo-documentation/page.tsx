"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
} from "@ghxstship/ui";

interface PhotoSet {
  id: string;
  phase: "Load-In" | "Build" | "Tech Rehearsal" | "Show" | "Strike" | "Load-Out";
  projectId: string;
  projectName: string;
  capturedAt: string;
  capturedBy: string;
  photoCount: number;
  description?: string;
  tags: string[];
  approved: boolean;
}

interface Photo {
  id: string;
  setId: string;
  filename: string;
  caption?: string;
  location?: string;
  timestamp: string;
}

const mockPhotoSets: PhotoSet[] = [
  { id: "PS-001", phase: "Load-In", projectId: "PROJ-089", projectName: "Summer Fest 2024", capturedAt: "2024-11-20T08:00:00Z", capturedBy: "John Martinez", photoCount: 24, description: "Truck arrival and initial unload", tags: ["staging", "trucks", "crew"], approved: true },
  { id: "PS-002", phase: "Build", projectId: "PROJ-089", projectName: "Summer Fest 2024", capturedAt: "2024-11-21T10:00:00Z", capturedBy: "Sarah Chen", photoCount: 45, description: "Stage construction progress", tags: ["stage", "rigging", "lighting"], approved: true },
  { id: "PS-003", phase: "Build", projectId: "PROJ-089", projectName: "Summer Fest 2024", capturedAt: "2024-11-22T14:00:00Z", capturedBy: "Sarah Chen", photoCount: 32, description: "Audio and video installation", tags: ["audio", "video", "LED"], approved: false },
  { id: "PS-004", phase: "Tech Rehearsal", projectId: "PROJ-089", projectName: "Summer Fest 2024", capturedAt: "2024-11-23T16:00:00Z", capturedBy: "Mike Thompson", photoCount: 18, description: "Lighting focus and programming", tags: ["lighting", "programming"], approved: false },
  { id: "PS-005", phase: "Show", projectId: "PROJ-088", projectName: "Fall Festival", capturedAt: "2024-11-15T20:00:00Z", capturedBy: "Lisa Park", photoCount: 156, description: "Event night documentation", tags: ["performance", "crowd", "production"], approved: true },
  { id: "PS-006", phase: "Strike", projectId: "PROJ-088", projectName: "Fall Festival", capturedAt: "2024-11-16T02:00:00Z", capturedBy: "John Martinez", photoCount: 28, description: "Post-show strike documentation", tags: ["strike", "packout"], approved: true },
];

const phases = ["Load-In", "Build", "Tech Rehearsal", "Show", "Strike", "Load-Out"];

export default function PhotoDocumentationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPhase, setSelectedPhase] = useState("All");
  const [selectedSet, setSelectedSet] = useState<PhotoSet | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const totalPhotos = mockPhotoSets.reduce((sum, s) => sum + s.photoCount, 0);
  const pendingApproval = mockPhotoSets.filter(s => !s.approved).length;

  const filteredSets = selectedPhase === "All" ? mockPhotoSets : mockPhotoSets.filter(s => s.phase === selectedPhase);

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case "Load-In": return "bg-info-900/20 border-info-800";
      case "Build": return "bg-warning-900/20 border-warning-800";
      case "Tech Rehearsal": return "bg-purple-900/20 border-purple-800";
      case "Show": return "bg-success-900/20 border-success-800";
      case "Strike": return "bg-warning-900/20 border-warning-800";
      case "Load-Out": return "bg-error-900/20 border-error-800";
      default: return "bg-ink-900/50 border-ink-800";
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Photo Documentation</H1>
            <Label className="text-ink-400">Phase-by-phase photo and video documentation for all projects</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Photo Sets" value={mockPhotoSets.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Photos" value={totalPhotos} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Pending Approval" value={pendingApproval} trend={pendingApproval > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Projects Documented" value={new Set(mockPhotoSets.map(s => s.projectId)).size} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Card className="border-2 border-ink-800 bg-ink-900/50 p-4">
            <Stack gap={3}>
              <Label className="text-ink-400">Production Phases</Label>
              <Grid cols={6} gap={2}>
                {phases.map((phase) => {
                  const count = mockPhotoSets.filter(s => s.phase === phase).length;
                  return (
                    <Card key={phase} className={`p-3 border-2 cursor-pointer ${selectedPhase === phase ? "border-white" : getPhaseColor(phase)}`} onClick={() => setSelectedPhase(selectedPhase === phase ? "All" : phase)}>
                      <Stack gap={1} className="text-center">
                        <Label className="text-white">{phase}</Label>
                        <Label size="xs" className="text-ink-400">{count} sets</Label>
                      </Stack>
                    </Card>
                  );
                })}
              </Grid>
            </Stack>
          </Card>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All Sets</Tab>
                <Tab active={activeTab === "pending"} onClick={() => setActiveTab("pending")}>Pending Approval</Tab>
              </TabsList>
            </Tabs>
            <Button variant="outlineWhite" onClick={() => setShowUploadModal(true)}>Upload Photos</Button>
          </Stack>

          <Grid cols={3} gap={4}>
            {filteredSets
              .filter(s => activeTab === "all" || !s.approved)
              .map((set) => (
                <Card key={set.id} className={`border-2 overflow-hidden ${getPhaseColor(set.phase)}`}>
                  <Card className="h-32 bg-ink-800 flex items-center justify-center">
                    <Stack gap={2} className="text-center">
                      <Label className="text-ink-400">📷</Label>
                      <Label className="text-white">{set.photoCount} photos</Label>
                    </Stack>
                  </Card>
                  <Stack className="p-4" gap={3}>
                    <Stack direction="horizontal" className="justify-between items-start">
                      <Badge variant="outline">{set.phase}</Badge>
                      {!set.approved && <Badge variant="solid">Pending</Badge>}
                    </Stack>
                    <Stack gap={1}>
                      <Body className="text-white">{set.projectName}</Body>
                      {set.description && <Label size="xs" className="text-ink-400">{set.description}</Label>}
                    </Stack>
                    <Stack direction="horizontal" gap={1} className="flex-wrap">
                      {set.tags.slice(0, 3).map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                    </Stack>
                    <Stack gap={1}>
                      <Label size="xs" className="text-ink-500">By {set.capturedBy}</Label>
                      <Label size="xs" className="text-ink-500">{new Date(set.capturedAt).toLocaleDateString()}</Label>
                    </Stack>
                    <Button variant="outline" size="sm" onClick={() => setSelectedSet(set)}>View Set</Button>
                  </Stack>
                </Card>
              ))}
          </Grid>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400">Export All</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Generate Report</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/build-strike")}>Back to Build/Strike</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedSet} onClose={() => setSelectedSet(null)}>
        <ModalHeader><H3>Photo Set Details</H3></ModalHeader>
        <ModalBody>
          {selectedSet && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between items-start">
                <Stack gap={1}>
                  <Body className="font-display text-white text-body-md">{selectedSet.projectName}</Body>
                  <Badge variant="outline">{selectedSet.phase}</Badge>
                </Stack>
                {!selectedSet.approved && <Badge variant="solid">Pending Approval</Badge>}
              </Stack>
              {selectedSet.description && <Body className="text-ink-300">{selectedSet.description}</Body>}
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Photos</Label><Label className="text-white">{selectedSet.photoCount}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Captured By</Label><Label className="text-white">{selectedSet.capturedBy}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label size="xs" className="text-ink-500">Date</Label><Label className="text-white">{new Date(selectedSet.capturedAt).toLocaleString()}</Label></Stack>
              <Stack gap={2}>
                <Label size="xs" className="text-ink-500">Tags</Label>
                <Stack direction="horizontal" gap={2}>{selectedSet.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}</Stack>
              </Stack>
              <Card className="p-4 bg-ink-800 border border-ink-700">
                <Grid cols={4} gap={2}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <Card key={i} className="aspect-square bg-ink-700 flex items-center justify-center">
                      <Label className="text-ink-500">📷</Label>
                    </Card>
                  ))}
                </Grid>
                <Label className="text-ink-400 text-center mt-2">+{selectedSet.photoCount - 8} more</Label>
              </Card>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedSet(null)}>Close</Button>
          {selectedSet && !selectedSet.approved && <Button variant="solid">Approve Set</Button>}
          <Button variant="outline">Download All</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showUploadModal} onClose={() => setShowUploadModal(false)}>
        <ModalHeader><H3>Upload Photos</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Select Project...</option>
              <option value="PROJ-089">Summer Fest 2024</option>
              <option value="PROJ-090">Corporate Gala</option>
            </Select>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Select Phase...</option>
              {phases.map(p => <option key={p} value={p}>{p}</option>)}
            </Select>
            <Textarea placeholder="Description..." className="border-ink-700 bg-black text-white" rows={2} />
            <Input placeholder="Tags (comma separated)" className="border-ink-700 bg-black text-white" />
            <Card className="p-8 border-2 border-dashed border-ink-700 text-center cursor-pointer">
              <Stack gap={2}>
                <Label className="text-ink-400 text-h5-md">📷</Label>
                <Label className="text-ink-400">Drop photos here or click to upload</Label>
                <Label size="xs" className="text-ink-500">Supports JPG, PNG, HEIC up to 50MB each</Label>
              </Stack>
            </Card>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowUploadModal(false)}>Upload</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
