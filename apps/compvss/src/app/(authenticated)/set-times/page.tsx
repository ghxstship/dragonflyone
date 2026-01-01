"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ListPage, H3, Body, Grid, Stack, Input, Button, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Alert,
  type ListPageAction} from "@ghxstship/ui";
import { createExportHandler, getEntityColumns, getEntityFilters } from "@ghxstship/config";
import {
  useSetTimes,
  type SetTime,
} from '@/hooks/useSetTimes';
import { Eye, Play, Square } from "lucide-react";

export default function SetTimesPage() {
  const router = useRouter();
  const { data: setTimes = [], refetch } = useSetTimes();
  const [selectedSet, setSelectedSet] = useState<SetTime | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);

  const onStage = setTimes.filter(s => s.status === "On Stage");
  const upcoming = setTimes.filter(s => s.status === "Upcoming");
  const completed = setTimes.filter(s => s.status === "Completed");
  const delayed = setTimes.filter(s => s.status === "Delayed").length;

  const columns = getEntityColumns<SetTime>('set-times');
  const filters = getEntityFilters('set-times');

  const rowActions: ListPageAction<SetTime>[] = [
    { id: 'view', label: 'Details', icon: <Eye className="h-4 w-4" />, onClick: (s) => setSelectedSet(s) },
    { id: 'start', label: 'Start', icon: <Play className="h-4 w-4" />, onClick: (s) => { setSelectedSet(s); setShowStartModal(true); }, hidden: (s) => s.status !== 'Upcoming' },
    { id: 'end', label: 'End', icon: <Square className="h-4 w-4" />, onClick: (s) => { setSelectedSet(s); setShowStartModal(true); }, hidden: (s) => s.status !== 'On Stage' },
  ];

  const stats = [
    { label: 'On Stage Now', value: onStage.length },
    { label: 'Upcoming', value: upcoming.length },
    { label: 'Completed', value: completed.length },
    { label: 'Delayed', value: delayed },
  ];

  return (
    <>
      <ListPage<SetTime>
        title="Set Time Tracking"
        subtitle="Track actual start/end times and monitor schedule variance"
        data={setTimes}
        columns={columns}
        rowKey="id"
        loading={false}
        onRetry={refetch}
        searchPlaceholder="Search sets..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(s) => setSelectedSet(s)}
        createLabel="Add Set"
        onCreate={() => router.push('/set-times/new')}
        entityType="set-times"
        onExport={createExportHandler({
          filename: "set-times",
          getData: () => setTimes.map((s: SetTime) => ({
            artistName: s.artistName,
            stage: s.stage,
            scheduledStart: s.scheduledStart,
            scheduledEnd: s.scheduledEnd,
            actualStart: s.actualStart || '',
            actualEnd: s.actualEnd || '',
            setLength: s.setLength,
            status: s.status,
          })),
        })}
        stats={stats}
        emptyMessage="No sets found"
        emptyAction={{ label: 'Add Set', onClick: () => router.push('/set-times/new') }}
        enableCapabilityDetection
        onScanAction={(capability, route) => router.push(route)}
        capabilityBasePath=""
        showFavorite
        showSettings
      />

      <Modal open={!!selectedSet && !showStartModal} onClose={() => setSelectedSet(null)}>
        <ModalHeader><H3>Set Details</H3></ModalHeader>
        <ModalBody>
          {selectedSet && (
            <Stack gap={4}>
              <Body className="font-display">{selectedSet.artistName}</Body>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Body size="sm" className="">Stage</Body>
                  <Body>{selectedSet.stage}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">Status</Body>
                  <Badge variant={getStatusVariant(selectedSet.status)}>{selectedSet.status}</Badge>
                </Stack>
              </Grid>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Body size="sm" className="">Scheduled</Body>
                  <Body>{selectedSet.scheduledStart} - {selectedSet.scheduledEnd}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">Actual</Body>
                  <Body>{selectedSet.actualStart || "--:--"} - {selectedSet.actualEnd || "--:--"}</Body>
                </Stack>
              </Grid>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Body size="sm" className="">Set Length</Body>
                  <Body>{selectedSet.setLength} min</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">Changeover</Body>
                  <Body>{selectedSet.changeoverTime} min</Body>
                </Stack>
              </Grid>
              {selectedSet.notes && (
                <Stack gap={1}>
                  <Body size="sm" className="">Notes</Body>
                  <Body>{selectedSet.notes}</Body>
                </Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedSet(null)}>Close</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showStartModal} onClose={() => { setShowStartModal(false); setSelectedSet(null); }}>
        <ModalHeader><H3>{selectedSet?.status === "On Stage" ? "End Set" : "Start Set"}</H3></ModalHeader>
        <ModalBody>
          {selectedSet && (
            <Stack gap={4}>
              <Body>{selectedSet.artistName}</Body>
              <Stack gap={2}>
                <Body className="font-display">{selectedSet.status === "On Stage" ? "Actual End Time" : "Actual Start Time"}</Body>
                <Input type="time" defaultValue={new Date().toTimeString().slice(0, 5)} />
              </Stack>
              {selectedSet.status === "Upcoming" && (
                <Alert variant="info">Scheduled start: {selectedSet.scheduledStart}</Alert>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowStartModal(false); setSelectedSet(null); }}>Cancel</Button>
          <Button variant="solid" onClick={() => { setShowStartModal(false); setSelectedSet(null); }}>
            {selectedSet?.status === "On Stage" ? "End Set" : "Start Set"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
