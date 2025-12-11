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
  TabPanel,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Alert,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";

import {
  DEMO_TECH_REHEARSAL_SESSIONS,
  DEMO_REHEARSAL_NOTES,
  type DemoTechRehearsalSession as TechRehearsalSession,
  type DemoRehearsalNote as RehearsalNote,
} from "../../lib/demo-data";

const mockSessions = DEMO_TECH_REHEARSAL_SESSIONS;
const mockNotes = DEMO_REHEARSAL_NOTES;

export default function TechRehearsalPage() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'schedule',
    validTabs: ['schedule', 'notes', 'issues'],
  });
  const [selectedSession, setSelectedSession] = useState<TechRehearsalSession | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const todaySessions = mockSessions.filter(s => s.date === "2024-11-25");
  const inProgressSession = mockSessions.find(s => s.status === "In Progress");
  const unresolvedIssues = mockNotes.filter(n => !n.resolved && n.type === "Issue").length;

  const getStatusVariant = (status: string): 'success' | 'info' | 'warning' | 'error' | 'ghost' => {
    switch (status) {
      case "Completed": return "success";
      case "In Progress": return "info";
      case "Scheduled": return "ghost";
      case "Cancelled": return "error";
      default: return "ghost";
    }
  };

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Technical Rehearsals"
        subtitle="Schedule and manage tech rehearsals, sound checks, and run-throughs"


        primaryAction={{ label: 'Schedule Rehearsal', onClick: () => setShowAddModal(true) }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6}>
              <StatCard label="Today Sessions" value={todaySessions.length.toString()} />
              <StatCard label="In Progress" value={inProgressSession ? "1" : "0"} />
              <StatCard label="Unresolved Issues" value={unresolvedIssues.toString()} />
              <StatCard label="Total Sessions" value={mockSessions.length.toString()} />
            </Grid>

            {inProgressSession && (
              <Alert variant="info">
                Currently in progress: {inProgressSession.name} ({inProgressSession.startTime} - {inProgressSession.endTime})
              </Alert>
            )}

            <Tabs>
              <TabsList>
                <Tab active={isActive('schedule')} onClick={() => setActiveTab('schedule')}>Schedule</Tab>
                <Tab active={isActive('notes')} onClick={() => setActiveTab('notes')}>Rehearsal Notes</Tab>
                <Tab active={isActive('issues')} onClick={() => setActiveTab('issues')}>Issues</Tab>
              </TabsList>

              <TabPanel active={isActive('schedule')}>
                <Stack gap={4}>
                  <Stack direction="horizontal" className="justify-between">
                    <H3>Rehearsal Schedule</H3>
                    <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)}>Add Session</Button>
                  </Stack>
                  {mockSessions.map((session) => (
                    <Card key={session.id}>
                      <Grid cols={6} gap={4} className="items-center">
                        <Stack gap={1}>
                          <Body className="font-display">{session.name}</Body>
                          <Badge variant="outline">{session.type}</Badge>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-body-sm">Date</Body>
                          <Body>{session.date}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-body-sm">Time</Body>
                          <Body>{session.startTime} - {session.endTime}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-body-sm">Departments</Body>
                          <Stack direction="horizontal" gap={1} className="flex-wrap">
                            {session.departments.slice(0, 2).map(d => <Badge key={d} variant="outline">{d}</Badge>)}
                            {session.departments.length > 2 && <Body className="text-body-sm">+{session.departments.length - 2}</Body>}
                          </Stack>
                        </Stack>
                        <Badge variant={getStatusVariant(session.status)}>{session.status}</Badge>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedSession(session)}>Details</Button>
                          {session.status === "In Progress" && (
                            <Button variant="outline" size="sm" onClick={() => { setSelectedSession(session); setShowNoteModal(true); }}>Add Note</Button>
                          )}
                        </Stack>
                      </Grid>
                    </Card>
                  ))}
                </Stack>
              </TabPanel>

              <TabPanel active={isActive('notes')}>
                <Table variant="dark">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockNotes.map((note) => (
                      <TableRow key={note.id}>
                        <TableCell>{note.timestamp}</TableCell>
                        <TableCell><Badge variant="outline">{note.department}</Badge></TableCell>
                        <TableCell><Badge variant={note.type === "Issue" ? "solid" : "outline"}>{note.type}</Badge></TableCell>
                        <TableCell><Body>{note.description}</Body></TableCell>
                        <TableCell><Body>{note.assignedTo || "-"}</Body></TableCell>
                        <TableCell>
                          <Badge variant={note.resolved ? "solid" : "outline"}>
                            {note.resolved ? "Resolved" : "Open"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabPanel>

              <TabPanel active={isActive('issues')}>
                <Stack gap={4}>
                  <H3>Open Issues ({unresolvedIssues})</H3>
                  {mockNotes.filter(n => !n.resolved && n.type === "Issue").map((note) => (
                    <Card key={note.id}>
                      <Grid cols={4} gap={4} className="items-center">
                        <Stack gap={1}>
                          <Badge variant="outline">{note.department}</Badge>
                          <Badge variant="outline">{note.priority}</Badge>
                        </Stack>
                        <Stack gap={1} className="col-span-2">
                          <Body>{note.description}</Body>
                          <Body className="text-body-sm">Logged at {note.timestamp}</Body>
                        </Stack>
                        <Stack gap={2}>
                          <Body className="text-body-sm">Assigned: {note.assignedTo || "Unassigned"}</Body>
                          <Button variant="outline" size="sm">Mark Resolved</Button>
                        </Stack>
                      </Grid>
                    </Card>
                  ))}
                </Stack>
              </TabPanel>
            </Tabs>

            <Grid cols={3} gap={4}>
              <Button variant="solid" onClick={() => setShowAddModal(true)}>Schedule Rehearsal</Button>
              <Button variant="outline">Export Notes</Button>
              <Button variant="outline" onClick={() => router.push("/run-of-show")}>Run of Show</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>

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
            <Grid cols={3} gap={4}>
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
            {selectedSession && <Body className="text-body-sm">{selectedSession.name}</Body>}
            <Grid cols={2} gap={4}>
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
            <Grid cols={2} gap={4}>
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
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Body className="text-body-sm">Type</Body><Badge variant="outline">{selectedSession.type}</Badge></Stack>
                <Stack gap={1}><Body className="text-body-sm">Status</Body><Badge variant={getStatusVariant(selectedSession.status)}>{selectedSession.status}</Badge></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Body className="text-body-sm">Date</Body><Body>{selectedSession.date}</Body></Stack>
                <Stack gap={1}><Body className="text-body-sm">Time</Body><Body>{selectedSession.startTime} - {selectedSession.endTime}</Body></Stack>
              </Grid>
              <Stack gap={1}><Body className="text-body-sm">Location</Body><Body>{selectedSession.location}</Body></Stack>
              <Stack gap={2}>
                <Body className="text-body-sm">Departments</Body>
                <Stack direction="horizontal" gap={2}>{selectedSession.departments.map(d => <Badge key={d} variant="outline">{d}</Badge>)}</Stack>
              </Stack>
              {selectedSession.notes && <Stack gap={1}><Body className="text-body-sm">Notes</Body><Body>{selectedSession.notes}</Body></Stack>}
              <Stack gap={1}><Body className="text-body-sm">Issues Logged</Body><Body>{selectedSession.issues.toString()}</Body></Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedSession(null)}>Close</Button>
          {selectedSession?.status === "Scheduled" && <Button variant="solid">Start Session</Button>}
        </ModalFooter>
      </Modal>
    </CompvssAppLayout>
  );
}
