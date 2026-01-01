"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import {
  ListPage, H3, Body, Grid, Stack, Input, Select, Button, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Textarea, Alert,
  type ListPageAction} from "@ghxstship/ui";
import { createExportHandler, getEntityColumns, getEntityFilters } from "@ghxstship/config";
import {
  useTechRehearsalSessions,
  useRehearsalNotes,
  type TechRehearsalSession,
} from "@/hooks/useStages";
import { Eye, Play, FileText } from "lucide-react";

export default function TechRehearsalPage() {
  const router = useRouter();
  const { data: sessions = [], isLoading, refetch } = useTechRehearsalSessions();
  const { data: notes = [] } = useRehearsalNotes();
  const [selectedSession, setSelectedSession] = useState<TechRehearsalSession | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const todaySessions = sessions.filter(s => s.date === today);
  const inProgressSession = sessions.find(s => s.status === "In Progress");
  const unresolvedIssues = notes.filter(n => !n.resolved && n.type === "Issue").length;

  const columns = getEntityColumns<TechRehearsalSession>('tech-rehearsal');
  const filters = getEntityFilters('tech-rehearsal');

  const rowActions: ListPageAction<TechRehearsalSession>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (s) => setSelectedSession(s) },
    { id: 'start', label: 'Start', icon: <Play className="h-4 w-4" />, onClick: () => {}, hidden: (s) => s.status !== 'Scheduled' },
    { id: 'notes', label: 'Add Note', icon: <FileText className="h-4 w-4" />, onClick: (s) => { setSelectedSession(s); setShowNoteModal(true); }, hidden: (s) => s.status !== 'In Progress' },
  ];

  const stats = [
    { label: 'Today Sessions', value: todaySessions.length },
    { label: 'In Progress', value: inProgressSession ? 1 : 0 },
    { label: 'Unresolved Issues', value: unresolvedIssues },
    { label: 'Total Sessions', value: sessions.length },
  ];

  return (
    <>
      {inProgressSession && (
        <Alert variant="info" className="mx-4 mt-4">
          Currently in progress: {inProgressSession.name} ({inProgressSession.startTime} - {inProgressSession.endTime})
        </Alert>
      )}

      <ListPage<TechRehearsalSession>
        title="Technical Rehearsals"
        subtitle="Schedule and manage tech rehearsals, sound checks, and run-throughs"
        data={sessions}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        onRetry={refetch}
        searchPlaceholder="Search sessions..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(s) => setSelectedSession(s)}
        createLabel="Schedule Rehearsal"
        onCreate={() => setShowAddModal(true)}
        entityType="tech-rehearsal"
        onExport={createExportHandler({
          filename: "tech-rehearsals",
          getData: () => sessions.map((s: TechRehearsalSession) => ({
            name: s.name,
            type: s.type,
            date: s.date,
            startTime: s.startTime,
            endTime: s.endTime,
            location: s.location,
            departments: s.departments.join(', '),
            status: s.status,
          })),
        })}
        stats={stats}
        emptyMessage="No rehearsals scheduled"
        emptyAction={{ label: 'Schedule Rehearsal', onClick: () => setShowAddModal(true) }}
        enableCapabilityDetection
        onScanAction={(capability, route) => router.push(route)}
        capabilityBasePath=""
        showFavorite
        showSettings
      />

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader><H3>Schedule Rehearsal</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Session Name" />
            <Select>
              <option value="">Rehearsal Type...</option>
              <option value="Full Tech">Full Tech</option>
              <option value="Cue-to-Cue">Cue-to-Cue</option>
              <option value="Dress Rehearsal">Dress Rehearsal</option>
              <option value="Sound Check">Sound Check</option>
              <option value="Focus Call">Focus Call</option>
            </Select>
            <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
              <Input type="date" />
              <Input type="time" placeholder="Start" />
              <Input type="time" placeholder="End" />
            </Grid>
            <Input placeholder="Location" />
            <Textarea placeholder="Notes..." rows={2} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowAddModal(false)}>Schedule</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showNoteModal} onClose={() => { setShowNoteModal(false); setSelectedSession(null); }}>
        <ModalHeader><H3>Add Rehearsal Note</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            {selectedSession && <Body size="sm" className="">{selectedSession.name}</Body>}
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Select>
                <option value="">Department...</option>
                <option value="Audio">Audio</option>
                <option value="Lighting">Lighting</option>
                <option value="Video">Video</option>
                <option value="Stage">Stage</option>
              </Select>
              <Select>
                <option value="">Note Type...</option>
                <option value="Issue">Issue</option>
                <option value="Fix">Fix</option>
                <option value="Note">Note</option>
                <option value="Cue Change">Cue Change</option>
              </Select>
            </Grid>
            <Textarea placeholder="Description..." rows={3} />
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Select>
                <option value="">Priority...</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </Select>
              <Select>
                <option value="">Assign to...</option>
                <option value="john">John Martinez</option>
                <option value="sarah">Sarah Chen</option>
                <option value="mike">Mike Thompson</option>
              </Select>
            </Grid>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowNoteModal(false); setSelectedSession(null); }}>Cancel</Button>
          <Button variant="solid" onClick={() => { setShowNoteModal(false); setSelectedSession(null); }}>Add Note</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedSession && !showNoteModal} onClose={() => setSelectedSession(null)}>
        <ModalHeader><H3>Session Details</H3></ModalHeader>
        <ModalBody>
          {selectedSession && (
            <Stack gap={4}>
              <Body className="font-display">{selectedSession.name}</Body>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}><Body size="sm" className="">Type</Body><Badge variant="outline">{selectedSession.type}</Badge></Stack>
                <Stack gap={1}><Body size="sm" className="">Status</Body><Badge variant={getStatusVariant(selectedSession.status)}>{selectedSession.status}</Badge></Stack>
              </Grid>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}><Body size="sm" className="">Date</Body><Body>{selectedSession.date}</Body></Stack>
                <Stack gap={1}><Body size="sm" className="">Time</Body><Body>{selectedSession.startTime} - {selectedSession.endTime}</Body></Stack>
              </Grid>
              <Stack gap={1}><Body size="sm" className="">Location</Body><Body>{selectedSession.location}</Body></Stack>
              <Stack gap={2}>
                <Body size="sm" className="">Departments</Body>
                <Stack direction="horizontal" gap={2}>{selectedSession.departments.map(d => <Badge key={d} variant="outline">{d}</Badge>)}</Stack>
              </Stack>
              {selectedSession.notes && <Stack gap={1}><Body size="sm" className="">Notes</Body><Body>{selectedSession.notes}</Body></Stack>}
              <Stack gap={1}><Body size="sm" className="">Issues Logged</Body><Body>{selectedSession.issues.toString()}</Body></Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedSession(null)}>Close</Button>
          {selectedSession?.status === "Scheduled" && <Button variant="solid">Start Session</Button>}
        </ModalFooter>
      </Modal>
    </>
  );
}
