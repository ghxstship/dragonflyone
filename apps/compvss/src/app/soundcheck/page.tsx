"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Table,
  TableHeader,
  TableRow,
  TableCell,
  EnterprisePageHeader,
  MainContent,
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
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Soundcheck Coordination"
        subtitle="Schedule and manage soundcheck and focus time for all artists"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Soundcheck' }]}
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
        primaryAction={{ label: 'Add Soundcheck', onClick: () => setShowAddModal(true) }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6}>
              <StatCard value={completed.toString()} label="Completed" />
              <StatCard value={inProgress ? "1" : "0"} label="In Progress" />
              <StatCard value={remaining.toString()} label="Remaining" />
              <StatCard value={delayed.toString()} label="Delayed" />
            </Grid>

            {inProgress && (
              <Card className="p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" className="items-center justify-between">
                    <Stack gap={1}>
                      <Badge variant="solid">NOW SOUNDCHECKING</Badge>
                      <Body className="text-h5-md font-display">{inProgress.artistName}</Body>
                      <Body className="text-body-sm">{inProgress.stage} • Engineer: {inProgress.engineer}</Body>
                    </Stack>
                    <Stack gap={2} className="text-right">
                      <Body className="text-body-sm">Started: {inProgress.actualStart}</Body>
                      <Body className="text-body-sm">Scheduled End: {inProgress.scheduledEnd}</Body>
                      <Button variant="solid" onClick={() => setSelectedSlot(inProgress)}>Complete Soundcheck</Button>
                    </Stack>
                  </Stack>
                  <Stack gap={2}>
                    <Body className="text-body-sm">Requirements:</Body>
                    <Stack direction="horizontal" gap={2} className="flex-wrap">
                      {inProgress.requirements.map((req, idx) => <Badge key={idx} variant="outline">{req}</Badge>)}
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            )}

            <Stack direction="horizontal" className="items-center justify-between">
              <Tabs>
                <TabsList>
                  <Tab active={activeTab === "schedule"} onClick={() => setActiveTab("schedule")}>Schedule</Tab>
                  <Tab active={activeTab === "by-stage"} onClick={() => setActiveTab("by-stage")}>By Stage</Tab>
                </TabsList>
              </Tabs>
              <Stack direction="horizontal" gap={4}>
                <Select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
                  <option value="All">All Stages</option>
                  <option value="Main Stage">Main Stage</option>
                  <option value="Side Stage">Side Stage</option>
                </Select>
                <Button variant="solid" onClick={() => setShowAddModal(true)}>Add Soundcheck</Button>
              </Stack>
            </Stack>

            <TabPanel active={activeTab === "schedule"}>
              <Stack gap={3}>
                {filteredSoundchecks
                  .sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart))
                  .map((slot) => (
                    <Card key={slot.id} className="p-4">
                      <Grid cols={6} gap={4} className="items-center">
                        <Stack gap={1}>
                          <Body className="font-display">{slot.artistName}</Body>
                          <Badge variant="outline">{slot.stage}</Badge>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-body-sm">Scheduled</Body>
                          <Body>{slot.scheduledStart} - {slot.scheduledEnd}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-body-sm">Actual</Body>
                          <Body>
                            {slot.actualStart || "--:--"} - {slot.actualEnd || "--:--"}
                          </Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-body-sm">Engineer</Body>
                          <Body>{slot.engineer || "-"}</Body>
                        </Stack>
                        <Badge variant={slot.status === "Completed" ? "solid" : "outline"}>{slot.status}</Badge>
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
                  <Card key={stage} className="p-4">
                    <Stack gap={4}>
                      <H3>{stage}</H3>
                      <Stack gap={2}>
                        {mockSoundchecks.filter(s => s.stage === stage).sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart)).map((slot) => (
                          <Card key={slot.id} className="p-3">
                            <Stack direction="horizontal" className="items-center justify-between">
                              <Stack gap={1}>
                                <Body>{slot.artistName}</Body>
                                <Body className="text-body-sm">{slot.scheduledStart} - {slot.scheduledEnd}</Body>
                              </Stack>
                              <Badge variant={slot.status === "Completed" || slot.status === "In Progress" ? "solid" : "outline"}>{slot.status}</Badge>
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
              <Button variant="outline">Export Schedule</Button>
              <Button variant="outline" onClick={() => router.push("/tech-rehearsal")}>Tech Rehearsals</Button>
              <Button variant="outline" onClick={() => router.push("/run-of-show")}>Run of Show</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>

      <Modal open={!!selectedSlot} onClose={() => setSelectedSlot(null)}>
        <ModalHeader><H3>Soundcheck Details</H3></ModalHeader>
        <ModalBody>
          {selectedSlot && (
            <Stack gap={4}>
              <Body className="font-display">{selectedSlot.artistName}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="text-body-sm">Stage</Body>
                  <Body>{selectedSlot.stage}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="text-body-sm">Status</Body>
                  <Badge variant={selectedSlot.status === "Completed" ? "solid" : "outline"}>{selectedSlot.status}</Badge>
                </Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="text-body-sm">Scheduled</Body>
                  <Body>{selectedSlot.scheduledStart} - {selectedSlot.scheduledEnd}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="text-body-sm">Duration</Body>
                  <Body>{selectedSlot.duration} min</Body>
                </Stack>
              </Grid>
              {(selectedSlot.actualStart || selectedSlot.actualEnd) && (
                <Stack gap={1}>
                  <Body className="text-body-sm">Actual</Body>
                  <Body>{selectedSlot.actualStart || "--:--"} - {selectedSlot.actualEnd || "--:--"}</Body>
                </Stack>
              )}
              <Stack gap={1}>
                <Body className="text-body-sm">Engineer</Body>
                <Body>{selectedSlot.engineer || "Not assigned"}</Body>
              </Stack>
              <Stack gap={2}>
                <Body className="text-body-sm">Requirements</Body>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {selectedSlot.requirements.map((req, idx) => <Badge key={idx} variant="outline">{req}</Badge>)}
                </Stack>
              </Stack>
              {selectedSlot.notes && (
                <Stack gap={1}>
                  <Body className="text-body-sm">Notes</Body>
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
            <Grid cols={2} gap={4}>
              <Select>
                <option value="">Stage...</option>
                <option value="Main Stage">Main Stage</option>
                <option value="Side Stage">Side Stage</option>
              </Select>
              <Input type="number" placeholder="Duration (min)" />
            </Grid>
            <Grid cols={2} gap={4}>
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
    </CompvssAppLayout>
  );
}
