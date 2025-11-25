"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea, Alert,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

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
      case "Completed": return "text-green-400";
      case "In Progress": return "text-blue-400";
      case "Scheduled": return "text-ink-400";
      case "Cancelled": return "text-red-400";
      default: return "text-ink-400";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical": return "text-red-400";
      case "High": return "text-orange-400";
      case "Medium": return "text-yellow-400";
      case "Low": return "text-green-400";
      default: return "text-ink-400";
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Technical Rehearsals</H1>
            <Label className="text-ink-400">Schedule and manage tech rehearsals, sound checks, and run-throughs</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Today Sessions" value={todaySessions.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="In Progress" value={inProgressSession ? 1 : 0} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Unresolved Issues" value={unresolvedIssues} trend={unresolvedIssues > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Sessions" value={mockSessions.length} className="bg-transparent border-2 border-ink-800" />
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
                  <Card key={session.id} className={`border-2 p-4 ${session.status === "In Progress" ? "border-blue-800 bg-blue-900/10" : "border-ink-800 bg-ink-900/50"}`}>
                    <Grid cols={6} gap={4} className="items-center">
                      <Stack gap={1}>
                        <Body className="font-display text-white">{session.name}</Body>
                        <Badge variant="outline">{session.type}</Badge>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Date</Label>
                        <Label className="font-mono text-white">{session.date}</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Time</Label>
                        <Label className="font-mono text-white">{session.startTime} - {session.endTime}</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Departments</Label>
                        <Stack direction="horizontal" gap={1} className="flex-wrap">
                          {session.departments.slice(0, 2).map(d => <Badge key={d} variant="outline">{d}</Badge>)}
                          {session.departments.length > 2 && <Label className="text-ink-500">+{session.departments.length - 2}</Label>}
                        </Stack>
                      </Stack>
                      <Label className={getStatusColor(session.status)}>{session.status}</Label>
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
              <Table className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
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
                      <TableCell className="font-mono text-ink-400">{note.timestamp}</TableCell>
                      <TableCell><Badge variant="outline">{note.department}</Badge></TableCell>
                      <TableCell><Badge variant={note.type === "Issue" ? "solid" : "outline"}>{note.type}</Badge></TableCell>
                      <TableCell><Label className="text-ink-300">{note.description}</Label></TableCell>
                      <TableCell><Label className="text-white">{note.assignedTo || "-"}</Label></TableCell>
                      <TableCell>
                        <Label className={note.resolved ? "text-green-400" : "text-yellow-400"}>
                          {note.resolved ? "Resolved" : "Open"}
                        </Label>
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
                  <Card key={note.id} className="border-2 border-yellow-800 bg-yellow-900/10 p-4">
                    <Grid cols={4} gap={4} className="items-center">
                      <Stack gap={1}>
                        <Badge variant="outline">{note.department}</Badge>
                        <Label className={getPriorityColor(note.priority)}>{note.priority}</Label>
                      </Stack>
                      <Stack gap={1} className="col-span-2">
                        <Body className="text-white">{note.description}</Body>
                        <Label size="xs" className="text-ink-500">Logged at {note.timestamp}</Label>
                      </Stack>
                      <Stack gap={2}>
                        <Label className="text-ink-400">Assigned: {note.assignedTo || "Unassigned"}</Label>
                        <Button variant="outline" size="sm">Mark Resolved</Button>
                      </Stack>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </TabPanel>
          </Tabs>

          <Grid cols={3} gap={4}>
            <Button variant="outlineWhite" onClick={() => setShowAddModal(true)}>Schedule Rehearsal</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Export Notes</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/run-of-show")}>Run of Show</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader><H3>Schedule Rehearsal</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Session Name" className="border-ink-700 bg-black text-white" />
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Rehearsal Type...</option>
              <option value="Full Tech">Full Tech</option>
              <option value="Cue-to-Cue">Cue-to-Cue</option>
              <option value="Dress Rehearsal">Dress Rehearsal</option>
              <option value="Sound Check">Sound Check</option>
              <option value="Focus Call">Focus Call</option>
            </Select>
            <Grid cols={3} gap={4}>
              <Input type="date" className="border-ink-700 bg-black text-white" />
              <Input type="time" placeholder="Start" className="border-ink-700 bg-black text-white" />
              <Input type="time" placeholder="End" className="border-ink-700 bg-black text-white" />
            </Grid>
            <Input placeholder="Location" className="border-ink-700 bg-black text-white" />
            <Textarea placeholder="Notes..." className="border-ink-700 bg-black text-white" rows={2} />
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
            {selectedSession && <Label className="text-ink-400">{selectedSession.name}</Label>}
            <Grid cols={2} gap={4}>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Department...</option>
                <option value="Audio">Audio</option>
                <option value="Lighting">Lighting</option>
                <option value="Video">Video</option>
                <option value="Stage">Stage</option>
              </Select>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Note Type...</option>
                <option value="Issue">Issue</option>
                <option value="Fix">Fix</option>
                <option value="Note">Note</option>
                <option value="Cue Change">Cue Change</option>
              </Select>
            </Grid>
            <Textarea placeholder="Description..." className="border-ink-700 bg-black text-white" rows={3} />
            <Grid cols={2} gap={4}>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Priority...</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </Select>
              <Select className="border-ink-700 bg-black text-white">
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
              <Body className="font-display text-white text-lg">{selectedSession.name}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Type</Label><Badge variant="outline">{selectedSession.type}</Badge></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Status</Label><Label className={getStatusColor(selectedSession.status)}>{selectedSession.status}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Date</Label><Label className="font-mono text-white">{selectedSession.date}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Time</Label><Label className="font-mono text-white">{selectedSession.startTime} - {selectedSession.endTime}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label size="xs" className="text-ink-500">Location</Label><Label className="text-white">{selectedSession.location}</Label></Stack>
              <Stack gap={2}>
                <Label size="xs" className="text-ink-500">Departments</Label>
                <Stack direction="horizontal" gap={2}>{selectedSession.departments.map(d => <Badge key={d} variant="outline">{d}</Badge>)}</Stack>
              </Stack>
              {selectedSession.notes && <Stack gap={1}><Label size="xs" className="text-ink-500">Notes</Label><Body className="text-ink-300">{selectedSession.notes}</Body></Stack>}
              <Stack gap={1}><Label size="xs" className="text-ink-500">Issues Logged</Label><Label className="text-white">{selectedSession.issues}</Label></Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedSession(null)}>Close</Button>
          {selectedSession?.status === "Scheduled" && <Button variant="solid">Start Session</Button>}
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
