"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { CompvssAppLayout } from "../../components/app-layout";
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
  Textarea,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";
import { DEMO_PHOTO_SETS } from '../../lib/demo-data';

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

const mockPhotoSets = DEMO_PHOTO_SETS as unknown as PhotoSet[];


const phases = ["Load-In", "Build", "Tech Rehearsal", "Show", "Strike", "Load-Out"];

export default function PhotoDocumentationPage() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { activeTab, setActiveTab, isActive } = useTabState({
    defaultTab: 'all',
    validTabs: ['all', 'pending'],
  });
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
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Photo Documentation"
        subtitle="Phase-by-phase photo and video documentation for all projects"


        primaryAction={{ label: 'Upload Photos', onClick: () => setShowUploadModal(true) }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6}>
              <StatCard value={mockPhotoSets.length.toString()} label="Photo Sets" />
              <StatCard value={totalPhotos.toString()} label="Total Photos" />
              <StatCard value={pendingApproval.toString()} label="Pending Approval" />
              <StatCard value={new Set(mockPhotoSets.map(s => s.projectId)).size.toString()} label="Projects Documented" />
            </Grid>

            <Card className="p-4">
              <Stack gap={3}>
                <Body className="font-display">Production Phases</Body>
                <Grid cols={6} gap={2}>
                  {phases.map((phase) => {
                    const count = mockPhotoSets.filter(s => s.phase === phase).length;
                    return (
                      <Card key={phase} className={`cursor-pointer border-2 p-3 ${selectedPhase === phase ? "border-primary-500" : getPhaseColor(phase)}`} onClick={() => setSelectedPhase(selectedPhase === phase ? "All" : phase)}>
                        <Stack gap={1} className="text-center">
                          <Body className="text-body-sm">{phase}</Body>
                          <Body className="text-body-sm">{count} sets</Body>
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
                  <Tab active={isActive('all')} onClick={() => setActiveTab('all')}>All Sets</Tab>
                  <Tab active={isActive('pending')} onClick={() => setActiveTab('pending')}>Pending Approval</Tab>
                </TabsList>
              </Tabs>
              <Button variant="solid" onClick={() => setShowUploadModal(true)}>Upload Photos</Button>
            </Stack>

            <Grid cols={3} gap={4}>
              {filteredSets
                .filter(s => activeTab === "all" || !s.approved)
                .map((set) => (
                  <Card key={set.id} className="overflow-hidden">
                    <Card className="flex h-32 items-center justify-center">
                      <Stack gap={2} className="text-center">
                        <Body>📷</Body>
                        <Body className="text-body-sm">{set.photoCount} photos</Body>
                      </Stack>
                    </Card>
                    <Stack className="p-4" gap={3}>
                      <Stack direction="horizontal" className="items-start justify-between">
                        <Badge variant="outline">{set.phase}</Badge>
                        {!set.approved && <Badge variant="solid">Pending</Badge>}
                      </Stack>
                      <Stack gap={1}>
                        <Body>{set.projectName}</Body>
                        {set.description && <Body className="text-body-sm">{set.description}</Body>}
                      </Stack>
                      <Stack direction="horizontal" gap={1} className="flex-wrap">
                        {set.tags.slice(0, 3).map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-body-sm">By {set.capturedBy}</Body>
                        <Body className="text-body-sm">{new Date(set.capturedAt).toLocaleDateString()}</Body>
                      </Stack>
                      <Button variant="outline" size="sm" onClick={() => setSelectedSet(set)}>View Set</Button>
                    </Stack>
                  </Card>
                ))}
            </Grid>

            <Grid cols={3} gap={4}>
              <Button variant="outline">Export All</Button>
              <Button variant="outline">Generate Report</Button>
              <Button variant="outline" onClick={() => router.push("/build-strike")}>Back to Build/Strike</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>

      <Modal open={!!selectedSet} onClose={() => setSelectedSet(null)}>
        <ModalHeader><H3>Photo Set Details</H3></ModalHeader>
        <ModalBody>
          {selectedSet && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-start justify-between">
                <Stack gap={1}>
                  <Body className="font-display">{selectedSet.projectName}</Body>
                  <Badge variant="outline">{selectedSet.phase}</Badge>
                </Stack>
                {!selectedSet.approved && <Badge variant="solid">Pending Approval</Badge>}
              </Stack>
              {selectedSet.description && <Body>{selectedSet.description}</Body>}
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="text-body-sm">Photos</Body>
                  <Body>{selectedSet.photoCount}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="text-body-sm">Captured By</Body>
                  <Body>{selectedSet.capturedBy}</Body>
                </Stack>
              </Grid>
              <Stack gap={1}>
                <Body className="text-body-sm">Date</Body>
                <Body>{new Date(selectedSet.capturedAt).toLocaleString()}</Body>
              </Stack>
              <Stack gap={2}>
                <Body className="text-body-sm">Tags</Body>
                <Stack direction="horizontal" gap={2}>{selectedSet.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}</Stack>
              </Stack>
              <Card className="p-4">
                <Grid cols={4} gap={2}>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <Card key={i} className="flex aspect-square items-center justify-center">
                      <Body>📷</Body>
                    </Card>
                  ))}
                </Grid>
                <Body className="mt-2 text-center text-body-sm">+{selectedSet.photoCount - 8} more</Body>
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
            <Select>
              <option value="">Select Project...</option>
              <option value="PROJ-089">Summer Fest 2024</option>
              <option value="PROJ-090">Corporate Gala</option>
            </Select>
            <Select>
              <option value="">Select Phase...</option>
              {phases.map(p => <option key={p} value={p}>{p}</option>)}
            </Select>
            <Textarea placeholder="Description..." rows={2} />
            <Input placeholder="Tags (comma separated)" />
            <Card className="cursor-pointer border-2 border-dashed p-8 text-center">
              <Stack gap={2}>
                <Body className="text-h5-md">📷</Body>
                <Body>Drop photos here or click to upload</Body>
                <Body className="text-body-sm">Supports JPG, PNG, HEIC up to 50MB each</Body>
              </Stack>
            </Card>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowUploadModal(false)}>Upload</Button>
        </ModalFooter>
      </Modal>
    </CompvssAppLayout>
  );
}
