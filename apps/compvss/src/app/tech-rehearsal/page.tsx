"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
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
  Section,
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
  PageLayout,
  SectionHeader,
  EnterprisePageHeader,
  MainContent,} from "@ghxstship/ui";

interface TechRehearsalSession {
  id: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  type: "Full Tech" | "Cue-to-Cue" | "Dress Rehearsal" | "Sound Check" | "Focus Call";
  status: "Scheduled" | "In Progress" | "Completed" | "Cancelled";
  location: string;
  departments: string[];
  notes?: string;
  issues: number;
}

interface RehearsalNote {
  id: string;
  sessionId: string;
  timestamp: string;
  department: string;
  type: "Issue" | "Fix" | "Note" | "Cue Change";
  description: string;
  assignedTo?: string;
  resolved: boolean;
  priority: "Low" | "Medium" | "High" | "Critical";
}

const mockSessions: TechRehearsalSession[] = [
  { id: "TR-001", name: "Full Tech Run", date: "2024-11-24", startTime: "14:00", endTime: "22:00", type: "Full Tech", status: "Completed", location: "Main Stage", departments: ["Audio", "Lighting", "Video", "Stage"], notes: "Full run-through with all elements", issues: 8 },
  { id: "TR-002", name: "Cue-to-Cue", date: "2024-11-25", startTime: "10:00", endTime: "14:00", type: "Cue-to-Cue", status: "In Progress", location: "Main Stage", departments: ["Lighting", "Video"], issues: 3 },
  { id: "TR-003", name: "Sound Check - Headliner", date: "2024-11-25", startTime: "15:00", endTime: "17:00", type: "Sound Check", status: "Scheduled", location: "Main Stage", departments: ["Audio"], issues: 0 },
  { id: "TR-004", name: "Dress Rehearsal", date: "2024-11-25", startTime: "18:00", endTime: "21:00", type: "Dress Rehearsal", status: "Scheduled", location: "Main Stage", departments: ["Audio", "Lighting", "Video", "Stage", "Wardrobe"], issues: 0 },
  { id: "TR-005", name: "Focus Call", date: "2024-11-24", startTime: "10:00", endTime: "13:00", type: "Focus Call", status: "Completed", location: "Main Stage", departments: ["Lighting"], issues: 2 },
];

const mockNotes: RehearsalNote[] = [
  { id: "RN-001", sessionId: "TR-001", timestamp: "14:32", department: "Lighting", type: "Issue", description: "Gobo rotation on SL key light is reversed", assignedTo: "Sarah Chen", resolved: true, priority: "Medium" },
  { id: "RN-002", sessionId: "TR-001", timestamp: "15:15", department: "Audio", type: "Issue", description: "Feedback on vocal mic during chorus", assignedTo: "John Martinez", resolved: true, priority: "High" },
  { id: "RN-003", sessionId: "TR-001", timestamp: "16:45", department: "Video", type: "Cue Change", description: "Add 2-second delay to video cue 23", resolved: true, priority: "Low" },
  { id: "RN-004", sessionId: "TR-002", timestamp: "10:20", department: "Lighting", type: "Issue", description: "Cue 45 timing needs adjustment - too fast", assignedTo: "Sarah Chen", resolved: false, priority: "Medium" },
  { id: "RN-005", sessionId: "TR-002", timestamp: "11:05", department: "Video", type: "Note", description: "Client requested brighter logo on intro", resolved: false, priority: "Low" },
];

export default function TechRehearsalPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("schedule");
  const [selectedSession, setSelectedSession] = useState<TechRehearsalSession | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const todaySessions = mockSessions.filter(s => s.date === "2024-11-25");
  const inProgressSession = mockSessions.find(s => s.status === "In Progress");
  const unresolvedIssues = mockNotes.filter(n => !n.resolved && n.type === "Issue").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "text-success-400";
      case "In Progress": return "text-info-400";
      case "Scheduled": return "text-ink-400";
      case "Cancelled": return "text-error-400";
      default: return "text-ink-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "text-error-400";
      case "High": return "text-warning-400";
      case "Medium": return "text-warning-400";
      case "Low": return "text-success-400";
      default: return "text-ink-400";
    }
  };

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <EnterprisePageHeader
        title="Technical Rehearsals"
        subtitle="Schedule and manage tech rehearsals, sound checks, and run-throughs"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Tech Rehearsal' }]}
        views={[
          { id: 'default', label: 'Default', icon: 'grid' },
        ]}
        activeView="default"
        showFavorite
        showSettings
      />

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
                <Tab active={activeTab === "schedule"} onClick={() => setActiveTab("schedule")}>Schedule</Tab>
                <Tab active={activeTab === "notes"} onClick={() => setActiveTab("notes")}>Rehearsal Notes</Tab>
                <Tab active={activeTab === "issues"} onClick={() => setActiveTab("issues")}>Issues</Tab>
              </TabsList>

              <TabPanel active={activeTab === "schedule"}>
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
                        <Badge variant={session.status === "Completed" ? "solid" : "outline"}>{session.status}</Badge>
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

              <TabPanel active={activeTab === "notes"}>
                <Table>
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

              <TabPanel active={activeTab === "issues"}>
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
      </Section>

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
                <Stack gap={1}><Body className="text-body-sm">Status</Body><Badge variant={selectedSession.status === "Completed" ? "solid" : "outline"}>{selectedSession.status}</Badge></Stack>
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
    </PageLayout>
  );
}
