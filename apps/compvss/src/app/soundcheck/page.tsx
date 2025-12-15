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
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";
import {
  useSoundcheckSlots,
  type SoundcheckSlot,
} from '../../hooks/useSoundcheck';


export default function SoundcheckPage() {
  const router = useRouter();
  const { data: soundcheckSlots = [] } = useSoundcheckSlots();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'schedule',
    validTabs: ['schedule', 'by-stage'],
  });
  const [selectedSlot, setSelectedSlot] = useState<SoundcheckSlot | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [stageFilter, setStageFilter] = useState("All");

  const inProgress = soundcheckSlots.find(s => s.status === "In Progress");
  const completed = soundcheckSlots.filter(s => s.status === "Completed").length;
  const remaining = soundcheckSlots.filter(s => s.status === "Scheduled" || s.status === "Delayed").length;
  const delayed = soundcheckSlots.filter(s => s.status === "Delayed").length;

  const filteredSoundchecks = stageFilter === "All" ? soundcheckSlots : soundcheckSlots.filter(s => s.stage === stageFilter);

  const getStatusVariant = (status: string): 'success' | 'info' | 'warning' | 'error' | 'ghost' => {
    switch (status) {
      case "Completed": return "success";
      case "In Progress": return "info";
      case "Scheduled": return "ghost";
      case "Delayed": return "warning";
      case "Cancelled": return "error";
      default: return "ghost";
    }
  };

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Soundcheck Coordination"
        subtitle="Schedule and manage soundcheck and focus time for all artists"


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
                      <Body size="sm" className="">{inProgress.stage} • Engineer: {inProgress.engineer}</Body>
                    </Stack>
                    <Stack gap={2} className="text-right">
                      <Body size="sm" className="">Started: {inProgress.actualStart}</Body>
                      <Body size="sm" className="">Scheduled End: {inProgress.scheduledEnd}</Body>
                      <Button variant="solid" onClick={() => setSelectedSlot(inProgress)}>Complete Soundcheck</Button>
                    </Stack>
                  </Stack>
                  <Stack gap={2}>
                    <Body size="sm" className="">Requirements:</Body>
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
                  <Tab active={isActive('schedule')} onClick={() => setActiveTab('schedule')}>Schedule</Tab>
                  <Tab active={isActive('by-stage')} onClick={() => setActiveTab('by-stage')}>By Stage</Tab>
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

            <TabPanel active={isActive('schedule')}>
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
                          <Body size="sm" className="">Scheduled</Body>
                          <Body>{slot.scheduledStart} - {slot.scheduledEnd}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className="">Actual</Body>
                          <Body>
                            {slot.actualStart || "--:--"} - {slot.actualEnd || "--:--"}
                          </Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className="">Engineer</Body>
                          <Body>{slot.engineer || "-"}</Body>
                        </Stack>
                        <Badge variant={getStatusVariant(slot.status)}>{slot.status}</Badge>
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

            <TabPanel active={isActive('by-stage')}>
              <Grid cols={2} gap={6}>
                {["Main Stage", "Side Stage"].map((stage) => (
                  <Card key={stage} className="p-4">
                    <Stack gap={4}>
                      <H3>{stage}</H3>
                      <Stack gap={2}>
                        {soundcheckSlots.filter(s => s.stage === stage).sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart)).map((slot) => (
                          <Card key={slot.id} className="p-3">
                            <Stack direction="horizontal" className="items-center justify-between">
                              <Stack gap={1}>
                                <Body>{slot.artistName}</Body>
                                <Body size="sm" className="">{slot.scheduledStart} - {slot.scheduledEnd}</Body>
                              </Stack>
                              <Badge variant={getStatusVariant(slot.status)}>{slot.status}</Badge>
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
                  <Body size="sm" className="">Stage</Body>
                  <Body>{selectedSlot.stage}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">Status</Body>
                  <Badge variant={getStatusVariant(selectedSlot.status)}>{selectedSlot.status}</Badge>
                </Stack>
              </Grid>
              <Grid cols={2} gap={4}>
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
