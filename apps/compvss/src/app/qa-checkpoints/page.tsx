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
  Button,
  Card,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  Alert,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";
import {
  useQACheckpoints,
  type QACheckpoint,
} from '../../hooks/useQACheckpoints';


export default function QACheckpointsPage() {
  const router = useRouter();
  const { data: qaCheckpoints = [] } = useQACheckpoints();
  
  // URL-synced tab state for deep-linking support
  const { activeTab, setActiveTab, isActive } = useTabState({
    defaultTab: 'all',
    validTabs: ['all', 'load-in', 'setup', 'tech-rehearsal', 'show-ready'],
  });
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<QACheckpoint | null>(null);
  const [showSignOffModal, setShowSignOffModal] = useState(false);

  const passedCount = qaCheckpoints.filter(c => c.status === "Passed").length;
  const pendingCount = qaCheckpoints.filter(c => c.status === "Pending").length;
  const failedCount = qaCheckpoints.filter(c => c.status === "Failed").length;
  const criticalPending = qaCheckpoints.filter(c => c.status !== "Passed" && c.items.some(i => i.critical && !i.checked)).length;

  const getStatusVariant = (status: string): 'success' | 'warning' | 'ghost' | 'error' | 'info' => {
    switch (status) {
      case "Passed": return "success";
      case "In Progress": return "warning";
      case "Pending": return "ghost";
      case "Failed": return "error";
      case "Waived": return "info";
      default: return "ghost";
    }
  };

  const filteredCheckpoints = activeTab === "all" ? qaCheckpoints : qaCheckpoints.filter(c => c.phase.toLowerCase().replace(" ", "-") === activeTab);

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="QA Checkpoints"
        subtitle="Quality assurance and sign-off tracking for production phases"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6}>
              <StatCard value={passedCount.toString()} label="Passed" />
              <StatCard value={pendingCount.toString()} label="Pending" />
              <StatCard value={failedCount.toString()} label="Failed" />
              <StatCard value={criticalPending.toString()} label="Critical Pending" />
            </Grid>

            {criticalPending > 0 && (
              <Alert variant="warning">{criticalPending} checkpoint(s) have critical items pending verification</Alert>
            )}

            <Tabs>
              <TabsList>
                <Tab active={isActive('all')} onClick={() => setActiveTab('all')}>All</Tab>
                <Tab active={isActive('load-in')} onClick={() => setActiveTab('load-in')}>Load-In</Tab>
                <Tab active={isActive('setup')} onClick={() => setActiveTab('setup')}>Setup</Tab>
                <Tab active={isActive('tech-rehearsal')} onClick={() => setActiveTab('tech-rehearsal')}>Tech Rehearsal</Tab>
                <Tab active={isActive('show-ready')} onClick={() => setActiveTab('show-ready')}>Show Ready</Tab>
              </TabsList>

              <TabPanel active={true}>
                <Stack gap={4}>
                  {filteredCheckpoints.map((checkpoint) => (
                    <Card key={checkpoint.id} className="p-6">
                      <Grid cols={6} gap={4} className="items-center">
                        <Stack gap={1}>
                          <Body className="font-display">{checkpoint.name}</Body>
                          <Stack direction="horizontal" gap={2}>
                            <Badge variant="outline">{checkpoint.department}</Badge>
                            <Badge variant="outline">{checkpoint.phase}</Badge>
                          </Stack>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className="">Assignee</Body>
                          <Body>{checkpoint.assignee || "Unassigned"}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className="">Items</Body>
                          <Body>{checkpoint.items.filter(i => i.checked).length}/{checkpoint.items.length} complete</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className="">Status</Body>
                          <Badge variant={getStatusVariant(checkpoint.status)}>{checkpoint.status}</Badge>
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
              <Button variant="solid">Add Checkpoint</Button>
              <Button variant="outline">Export Report</Button>
              <Button variant="outline" onClick={() => router.push("/build-strike")}>Build and Strike</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>

      <Modal open={!!selectedCheckpoint && !showSignOffModal} onClose={() => setSelectedCheckpoint(null)}>
        <ModalHeader><H3>Checkpoint Details</H3></ModalHeader>
        <ModalBody>
          {selectedCheckpoint && (
            <Stack gap={4}>
              <Body className="font-display">{selectedCheckpoint.name}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body size="sm" className="">Department</Body>
                  <Badge variant="outline">{selectedCheckpoint.department}</Badge>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">Phase</Body>
                  <Badge variant="outline">{selectedCheckpoint.phase}</Badge>
                </Stack>
              </Grid>
              <Stack gap={2}>
                <Body className="font-display">Checklist Items</Body>
                {selectedCheckpoint.items.map((item) => (
                  <Card key={item.id} className="p-3">
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack direction="horizontal" gap={2}>
                        <Body>{item.checked ? "✓" : "○"}</Body>
                        <Body>{item.description}</Body>
                      </Stack>
                      {item.critical && <Badge variant="solid">Critical</Badge>}
                    </Stack>
                  </Card>
                ))}
              </Stack>
              {selectedCheckpoint.notes && (
                <Stack gap={1}>
                  <Body size="sm" className="">Notes</Body>
                  <Body>{selectedCheckpoint.notes}</Body>
                </Stack>
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
              <Body>{selectedCheckpoint.name}</Body>
              <Alert variant="info">By signing off, you confirm all items have been verified</Alert>
              <Stack gap={2}>
                <Body className="font-display">Your Name</Body>
                <Input placeholder="Enter your name" />
              </Stack>
              <Stack gap={2}>
                <Body className="font-display">Notes (optional)</Body>
                <Input placeholder="Any additional notes" />
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowSignOffModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => { setShowSignOffModal(false); setSelectedCheckpoint(null); }}>Sign Off</Button>
        </ModalFooter>
      </Modal>
    </CompvssAppLayout>
  );
}
