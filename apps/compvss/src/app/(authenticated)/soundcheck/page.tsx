"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import {
  ListPage, H3, Body, Grid, Stack, Input, Select, Button, Card, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
  type ListPageAction} from "@ghxstship/ui";
import { createExportHandler, getEntityColumns, getEntityFilters } from "@ghxstship/config";
import {
  useSoundcheckSlots,
  type SoundcheckSlot,
} from '@/hooks/useSoundcheck';
import { Eye, Play, CheckCircle } from "lucide-react";

export default function SoundcheckPage() {
  const router = useRouter();
  const { data: soundcheckSlots = [], refetch } = useSoundcheckSlots();
  const [selectedSlot, setSelectedSlot] = useState<SoundcheckSlot | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const inProgress = soundcheckSlots.find(s => s.status === "In Progress");
  const completed = soundcheckSlots.filter(s => s.status === "Completed").length;
  const remaining = soundcheckSlots.filter(s => s.status === "Scheduled" || s.status === "Delayed").length;
  const delayed = soundcheckSlots.filter(s => s.status === "Delayed").length;

  const columns = getEntityColumns<SoundcheckSlot>('soundcheck');
  const filters = getEntityFilters('soundcheck');

  const rowActions: ListPageAction<SoundcheckSlot>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (s) => setSelectedSlot(s) },
    { id: 'start', label: 'Start', icon: <Play className="h-4 w-4" />, onClick: () => {}, hidden: (s) => s.status !== 'Scheduled' },
    { id: 'complete', label: 'Complete', icon: <CheckCircle className="h-4 w-4" />, onClick: () => {}, hidden: (s) => s.status !== 'In Progress' },
  ];

  const stats = [
    { label: 'Completed', value: completed },
    { label: 'In Progress', value: inProgress ? 1 : 0 },
    { label: 'Remaining', value: remaining },
    { label: 'Delayed', value: delayed },
  ];

  return (
    <>
      {inProgress && (
        <Card className="mx-4 mt-4 p-6">
          <Stack gap={4}>
            <Stack direction="horizontal" className="items-center justify-between">
              <Stack gap={1}>
                <Badge variant="solid">NOW SOUNDCHECKING</Badge>
                <Body className="text-h5-md font-display">{inProgress.artistName}</Body>
                <Body size="sm">{inProgress.stage} • Engineer: {inProgress.engineer}</Body>
              </Stack>
              <Stack gap={2} className="text-right">
                <Body size="sm">Started: {inProgress.actualStart}</Body>
                <Body size="sm">Scheduled End: {inProgress.scheduledEnd}</Body>
                <Button variant="solid" onClick={() => setSelectedSlot(inProgress)}>Complete Soundcheck</Button>
              </Stack>
            </Stack>
            <Stack gap={2}>
              <Body size="sm">Requirements:</Body>
              <Stack direction="horizontal" gap={2} className="flex-wrap">
                {inProgress.requirements.map((req, idx) => <Badge key={idx} variant="outline">{req}</Badge>)}
              </Stack>
            </Stack>
          </Stack>
        </Card>
      )}

      <ListPage<SoundcheckSlot>
        title="Soundcheck Coordination"
        subtitle="Schedule and manage soundcheck and focus time for all artists"
        data={soundcheckSlots}
        columns={columns}
        rowKey="id"
        loading={false}
        onRetry={refetch}
        searchPlaceholder="Search soundchecks..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(s) => setSelectedSlot(s)}
        createLabel="Add Soundcheck"
        onCreate={() => setShowAddModal(true)}
        entityType="soundcheck"
        onExport={createExportHandler({
          filename: "soundchecks",
          getData: () => soundcheckSlots.map((s: SoundcheckSlot) => ({
            artistName: s.artistName,
            stage: s.stage,
            scheduledStart: s.scheduledStart,
            scheduledEnd: s.scheduledEnd,
            actualStart: s.actualStart || '',
            actualEnd: s.actualEnd || '',
            engineer: s.engineer || '',
            status: s.status,
          })),
        })}
        stats={stats}
        emptyMessage="No soundchecks scheduled"
        emptyAction={{ label: 'Add Soundcheck', onClick: () => setShowAddModal(true) }}
        enableCapabilityDetection
        onScanAction={(capability, route) => router.push(route)}
        capabilityBasePath=""
        showFavorite
        showSettings
      />

      <Modal open={!!selectedSlot} onClose={() => setSelectedSlot(null)}>
        <ModalHeader><H3>Soundcheck Details</H3></ModalHeader>
        <ModalBody>
          {selectedSlot && (
            <Stack gap={4}>
              <Body className="font-display">{selectedSlot.artistName}</Body>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Body size="sm" className="">Stage</Body>
                  <Body>{selectedSlot.stage}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">Status</Body>
                  <Badge variant={getStatusVariant(selectedSlot.status)}>{selectedSlot.status}</Badge>
                </Stack>
              </Grid>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Body size="sm" className="">Scheduled</Body>
                  <Body>{selectedSlot.scheduledStart} - {selectedSlot.scheduledEnd}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">Duration</Body>
                  <Body>{selectedSlot.duration} min</Body>
                </Stack>
              </Grid>
              {(selectedSlot.actualStart || selectedSlot.actualEnd) && (
                <Stack gap={1}>
                  <Body size="sm" className="">Actual</Body>
                  <Body>{selectedSlot.actualStart || "--:--"} - {selectedSlot.actualEnd || "--:--"}</Body>
                </Stack>
              )}
              <Stack gap={1}>
                <Body size="sm" className="">Engineer</Body>
                <Body>{selectedSlot.engineer || "Not assigned"}</Body>
              </Stack>
              <Stack gap={2}>
                <Body size="sm" className="">Requirements</Body>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {selectedSlot.requirements.map((req, idx) => <Badge key={idx} variant="outline">{req}</Badge>)}
                </Stack>
              </Stack>
              {selectedSlot.notes && (
                <Stack gap={1}>
                  <Body size="sm" className="">Notes</Body>
                  <Body>{selectedSlot.notes}</Body>
                </Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedSlot(null)}>Close</Button>
          {selectedSlot?.status === "Scheduled" && <Button variant="solid">Start Soundcheck</Button>}
          {selectedSlot?.status === "In Progress" && <Button variant="solid">Complete Soundcheck</Button>}
        </ModalFooter>
      </Modal>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader><H3>Add Soundcheck</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Artist Name" />
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Select>
                <option value="">Stage...</option>
                <option value="Main Stage">Main Stage</option>
                <option value="Side Stage">Side Stage</option>
              </Select>
              <Input type="number" placeholder="Duration (min)" />
            </Grid>
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Stack gap={2}>
                <Body className="font-display">Start Time</Body>
                <Input type="time" />
              </Stack>
              <Stack gap={2}>
                <Body className="font-display">End Time</Body>
                <Input type="time" />
              </Stack>
            </Grid>
            <Select>
              <option value="">Assign Engineer...</option>
              <option value="john">John Martinez</option>
              <option value="sarah">Sarah Chen</option>
              <option value="mike">Mike Thompson</option>
            </Select>
            <Textarea placeholder="Requirements (one per line)..." rows={3} />
            <Textarea placeholder="Notes..." rows={2} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowAddModal(false)}>Add Soundcheck</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
