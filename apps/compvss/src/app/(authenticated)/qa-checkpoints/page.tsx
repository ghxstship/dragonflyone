"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ListPage, H3, Body, Grid, Stack, Input, Button, Card, Modal, ModalHeader, ModalBody, ModalFooter, Badge, Alert,
  type ListPageAction} from "@ghxstship/ui";
import { createExportHandler, getEntityColumns, getEntityFilters } from "@ghxstship/config";
import {
  useQACheckpoints,
  type QACheckpoint,
} from '@/hooks/useQACheckpoints';
import { Eye, CheckCircle } from "lucide-react";

export default function QACheckpointsPage() {
  const router = useRouter();
  const { data: qaCheckpoints = [], refetch } = useQACheckpoints();
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<QACheckpoint | null>(null);
  const [showSignOffModal, setShowSignOffModal] = useState(false);

  const passedCount = qaCheckpoints.filter(c => c.status === "Passed").length;
  const pendingCount = qaCheckpoints.filter(c => c.status === "Pending").length;
  const failedCount = qaCheckpoints.filter(c => c.status === "Failed").length;
  const criticalPending = qaCheckpoints.filter(c => c.status !== "Passed" && c.items.some(i => i.critical && !i.checked)).length;

  const columns = getEntityColumns<QACheckpoint>('qa-checkpoints');
  const filters = getEntityFilters('qa-checkpoints');

  const rowActions: ListPageAction<QACheckpoint>[] = [
    { id: 'view', label: 'Details', icon: <Eye className="h-4 w-4" />, onClick: (c) => setSelectedCheckpoint(c) },
    { id: 'signoff', label: 'Sign Off', icon: <CheckCircle className="h-4 w-4" />, onClick: (c) => { setSelectedCheckpoint(c); setShowSignOffModal(true); }, hidden: (c) => c.status === 'Passed' },
  ];

  const stats = [
    { label: 'Passed', value: passedCount },
    { label: 'Pending', value: pendingCount },
    { label: 'Failed', value: failedCount },
    { label: 'Critical Pending', value: criticalPending },
  ];

  return (
    <>
      <ListPage<QACheckpoint>
        title="QA Checkpoints"
        subtitle="Quality assurance and sign-off tracking for production phases"
        data={qaCheckpoints}
        columns={columns}
        rowKey="id"
        loading={false}
        onRetry={refetch}
        searchPlaceholder="Search checkpoints..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(c) => setSelectedCheckpoint(c)}
        createLabel="Add Checkpoint"
        onCreate={() => router.push('/qa-checkpoints/new')}
        entityType="qa-checkpoints"
        onExport={createExportHandler({
          filename: "qa-checkpoints",
          getData: () => qaCheckpoints.map((c: QACheckpoint) => ({
            name: c.name,
            department: c.department,
            phase: c.phase,
            assignee: c.assignee || '',
            items_completed: c.items.filter(i => i.checked).length,
            items_total: c.items.length,
            status: c.status,
          })),
        })}
        stats={stats}
        emptyMessage="No checkpoints found"
        emptyAction={{ label: 'Add Checkpoint', onClick: () => router.push('/qa-checkpoints/new') }}
        enableCapabilityDetection
        onScanAction={(capability, route) => router.push(route)}
        capabilityBasePath=""
        showFavorite
        showSettings
      />

      <Modal open={!!selectedCheckpoint && !showSignOffModal} onClose={() => setSelectedCheckpoint(null)}>
        <ModalHeader><H3>Checkpoint Details</H3></ModalHeader>
        <ModalBody>
          {selectedCheckpoint && (
            <Stack gap={4}>
              <Body className="font-display">{selectedCheckpoint.name}</Body>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
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
    </>
  );
}
