"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea, Alert,
} from "@ghxstship/ui";

interface SoundcheckSlot {
  id: string;
  artistName: string;
  stage: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: "Scheduled" | "In Progress" | "Completed" | "Delayed" | "Cancelled";
  duration: number;
  requirements: string[];
  engineer?: string;
  notes?: string;
}

const mockSoundchecks: SoundcheckSlot[] = [
  { id: "SC-001", artistName: "Opening Act", stage: "Main Stage", scheduledStart: "14:00", scheduledEnd: "14:30", actualStart: "14:05", actualEnd: "14:35", status: "Completed", duration: 30, requirements: ["Full band setup", "5 vocal mics", "Drum kit"], engineer: "John Martinez", notes: "Requested extra monitor for drummer" },
  { id: "SC-002", artistName: "Support Band", stage: "Main Stage", scheduledStart: "14:45", scheduledEnd: "15:30", actualStart: "14:50", status: "In Progress", duration: 45, requirements: ["8-piece band", "Brass section", "Keys"], engineer: "John Martinez" },
  { id: "SC-003", artistName: "Special Guest", stage: "Main Stage", scheduledStart: "15:45", scheduledEnd: "16:30", status: "Scheduled", duration: 45, requirements: ["Solo acoustic", "2 guitars", "Piano"], engineer: "Sarah Chen" },
  { id: "SC-004", artistName: "Headliner", stage: "Main Stage", scheduledStart: "16:45", scheduledEnd: "18:00", status: "Scheduled", duration: 75, requirements: ["Full production", "Backing tracks", "In-ear monitors", "Custom console settings"], engineer: "Sarah Chen", notes: "Artist's FOH engineer will be present" },
  { id: "SC-005", artistName: "DJ Set", stage: "Side Stage", scheduledStart: "13:00", scheduledEnd: "13:30", actualStart: "13:00", actualEnd: "13:25", status: "Completed", duration: 30, requirements: ["CDJs", "Mixer", "Laptop input"], engineer: "Mike Thompson" },
  { id: "SC-006", artistName: "Local Band", stage: "Side Stage", scheduledStart: "13:45", scheduledEnd: "14:15", status: "Delayed", duration: 30, requirements: ["4-piece rock", "Backline provided"], engineer: "Mike Thompson", notes: "Delayed due to gear issue" },
];

export default function SoundcheckPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("schedule");
  const [selectedSlot, setSelectedSlot] = useState<SoundcheckSlot | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [stageFilter, setStageFilter] = useState("All");

  const inProgress = mockSoundchecks.find(s => s.status === "In Progress");
  const completed = mockSoundchecks.filter(s => s.status === "Completed").length;
  const remaining = mockSoundchecks.filter(s => s.status === "Scheduled" || s.status === "Delayed").length;
  const delayed = mockSoundchecks.filter(s => s.status === "Delayed").length;

  const filteredSoundchecks = stageFilter === "All" ? mockSoundchecks : mockSoundchecks.filter(s => s.stage === stageFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "text-success-400";
      case "In Progress": return "text-info-400";
      case "Scheduled": return "text-ink-400";
      case "Delayed": return "text-warning-400";
      case "Cancelled": return "text-error-400";
      default: return "text-ink-400";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "In Progress": return "border-info-800 bg-info-900/20";
      case "Delayed": return "border-warning-800 bg-warning-900/20";
      case "Completed": return "border-success-800 bg-success-900/10";
      default: return "border-ink-800 bg-ink-900/50";
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Soundcheck Coordination</H1>
            <Label className="text-ink-400">Schedule and manage soundcheck and focus time for all artists</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Completed" value={completed} trend="up" className="bg-transparent border-2 border-ink-800" />
            <StatCard label="In Progress" value={inProgress ? 1 : 0} className="bg-transparent border-2 border-info-800" />
            <StatCard label="Remaining" value={remaining} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Delayed" value={delayed} trend={delayed > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          {inProgress && (
            <Card className="border-2 border-info-800 bg-info-900/20 p-6">
              <Stack gap={4}>
                <Stack direction="horizontal" className="justify-between items-center">
                  <Stack gap={1}>
                    <Label className="text-info-400">NOW SOUNDCHECKING</Label>
                    <Body className="font-display text-white text-2xl">{inProgress.artistName}</Body>
                    <Label className="text-ink-400">{inProgress.stage} • Engineer: {inProgress.engineer}</Label>
                  </Stack>
                  <Stack gap={2} className="text-right">
                    <Label className="text-ink-400">Started: {inProgress.actualStart}</Label>
                    <Label className="text-ink-400">Scheduled End: {inProgress.scheduledEnd}</Label>
                    <Button variant="solid" onClick={() => setSelectedSlot(inProgress)}>Complete Soundcheck</Button>
                  </Stack>
                </Stack>
                <Stack gap={2}>
                  <Label className="text-ink-400">Requirements:</Label>
                  <Stack direction="horizontal" gap={2} className="flex-wrap">
                    {inProgress.requirements.map((req, idx) => <Badge key={idx} variant="outline">{req}</Badge>)}
                  </Stack>
                </Stack>
              </Stack>
            </Card>
          )}

          <Stack direction="horizontal" className="justify-between items-center">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === "schedule"} onClick={() => setActiveTab("schedule")}>Schedule</Tab>
                <Tab active={activeTab === "by-stage"} onClick={() => setActiveTab("by-stage")}>By Stage</Tab>
              </TabsList>
            </Tabs>
            <Stack direction="horizontal" gap={4}>
              <Select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className="border-ink-700 bg-black text-white">
                <option value="All">All Stages</option>
                <option value="Main Stage">Main Stage</option>
                <option value="Side Stage">Side Stage</option>
              </Select>
              <Button variant="outlineWhite" onClick={() => setShowAddModal(true)}>Add Soundcheck</Button>
            </Stack>
          </Stack>

          <TabPanel active={activeTab === "schedule"}>
            <Stack gap={3}>
              {filteredSoundchecks
                .sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart))
                .map((slot) => (
                  <Card key={slot.id} className={`border-2 p-4 ${getStatusBg(slot.status)}`}>
                    <Grid cols={6} gap={4} className="items-center">
                      <Stack gap={1}>
                        <Body className="font-display text-white">{slot.artistName}</Body>
                        <Badge variant="outline">{slot.stage}</Badge>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Scheduled</Label>
                        <Label className="font-mono text-white">{slot.scheduledStart} - {slot.scheduledEnd}</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Actual</Label>
                        <Label className="font-mono text-white">
                          {slot.actualStart || "--:--"} - {slot.actualEnd || "--:--"}
                        </Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Engineer</Label>
                        <Label className="text-ink-300">{slot.engineer || "-"}</Label>
                      </Stack>
                      <Label className={getStatusColor(slot.status)}>{slot.status}</Label>
                      <Stack direction="horizontal" gap={2}>
                        {slot.status === "Scheduled" && <Button variant="outline" size="sm">Start</Button>}
                        {slot.status === "In Progress" && <Button variant="outline" size="sm">Complete</Button>}
                        <Button variant="ghost" size="sm" onClick={() => setSelectedSlot(slot)}>Details</Button>
                      </Stack>
                    </Grid>
                  </Card>
                ))}
            </Stack>
          </TabPanel>

          <TabPanel active={activeTab === "by-stage"}>
            <Grid cols={2} gap={6}>
              {["Main Stage", "Side Stage"].map((stage) => (
                <Card key={stage} className="border-2 border-ink-800 bg-ink-900/50 p-4">
                  <Stack gap={4}>
                    <H3>{stage}</H3>
                    <Stack gap={2}>
                      {mockSoundchecks.filter(s => s.stage === stage).sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart)).map((slot) => (
                        <Card key={slot.id} className={`p-3 border ${getStatusBg(slot.status)}`}>
                          <Stack direction="horizontal" className="justify-between items-center">
                            <Stack gap={1}>
                              <Label className="text-white">{slot.artistName}</Label>
                              <Label size="xs" className="font-mono text-ink-400">{slot.scheduledStart} - {slot.scheduledEnd}</Label>
                            </Stack>
                            <Label className={getStatusColor(slot.status)}>{slot.status}</Label>
                          </Stack>
                        </Card>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </TabPanel>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400">Export Schedule</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/tech-rehearsal")}>Tech Rehearsals</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/run-of-show")}>Run of Show</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedSlot} onClose={() => setSelectedSlot(null)}>
        <ModalHeader><H3>Soundcheck Details</H3></ModalHeader>
        <ModalBody>
          {selectedSlot && (
            <Stack gap={4}>
              <Body className="font-display text-white text-lg">{selectedSlot.artistName}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Stage</Label><Label className="text-white">{selectedSlot.stage}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Status</Label><Label className={getStatusColor(selectedSlot.status)}>{selectedSlot.status}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Scheduled</Label><Label className="font-mono text-white">{selectedSlot.scheduledStart} - {selectedSlot.scheduledEnd}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Duration</Label><Label className="text-white">{selectedSlot.duration} min</Label></Stack>
              </Grid>
              {(selectedSlot.actualStart || selectedSlot.actualEnd) && (
                <Stack gap={1}><Label size="xs" className="text-ink-500">Actual</Label><Label className="font-mono text-white">{selectedSlot.actualStart || "--:--"} - {selectedSlot.actualEnd || "--:--"}</Label></Stack>
              )}
              <Stack gap={1}><Label size="xs" className="text-ink-500">Engineer</Label><Label className="text-white">{selectedSlot.engineer || "Not assigned"}</Label></Stack>
              <Stack gap={2}>
                <Label size="xs" className="text-ink-500">Requirements</Label>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {selectedSlot.requirements.map((req, idx) => <Badge key={idx} variant="outline">{req}</Badge>)}
                </Stack>
              </Stack>
              {selectedSlot.notes && <Stack gap={1}><Label size="xs" className="text-ink-500">Notes</Label><Body className="text-ink-300">{selectedSlot.notes}</Body></Stack>}
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
            <Input placeholder="Artist Name" className="border-ink-700 bg-black text-white" />
            <Grid cols={2} gap={4}>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Stage...</option>
                <option value="Main Stage">Main Stage</option>
                <option value="Side Stage">Side Stage</option>
              </Select>
              <Input type="number" placeholder="Duration (min)" className="border-ink-700 bg-black text-white" />
            </Grid>
            <Grid cols={2} gap={4}>
              <Stack gap={2}>
                <Label>Start Time</Label>
                <Input type="time" className="border-ink-700 bg-black text-white" />
              </Stack>
              <Stack gap={2}>
                <Label>End Time</Label>
                <Input type="time" className="border-ink-700 bg-black text-white" />
              </Stack>
            </Grid>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Assign Engineer...</option>
              <option value="john">John Martinez</option>
              <option value="sarah">Sarah Chen</option>
              <option value="mike">Mike Thompson</option>
            </Select>
            <Textarea placeholder="Requirements (one per line)..." className="border-ink-700 bg-black text-white" rows={3} />
            <Textarea placeholder="Notes..." className="border-ink-700 bg-black text-white" rows={2} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowAddModal(false)}>Add Soundcheck</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
