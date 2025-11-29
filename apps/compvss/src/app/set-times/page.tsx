"use client";

import { useState, useEffect } from "react";
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
  Alert,
  PageLayout,
  SectionHeader,
  EnterprisePageHeader,
  MainContent,} from "@ghxstship/ui";

interface SetTime {
  id: string;
  artistName: string;
  stage: string;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  status: "Upcoming" | "On Stage" | "Completed" | "Delayed" | "Cancelled";
  setLength: number;
  changeoverTime: number;
  notes?: string;
}

const mockSetTimes: SetTime[] = [
  { id: "ST-001", artistName: "Opening Act", stage: "Main Stage", scheduledStart: "18:00", scheduledEnd: "18:45", actualStart: "18:02", actualEnd: "18:47", status: "Completed", setLength: 45, changeoverTime: 15 },
  { id: "ST-002", artistName: "Support Band", stage: "Main Stage", scheduledStart: "19:00", scheduledEnd: "19:45", actualStart: "19:05", actualEnd: "19:50", status: "Completed", setLength: 45, changeoverTime: 20 },
  { id: "ST-003", artistName: "Special Guest", stage: "Main Stage", scheduledStart: "20:10", scheduledEnd: "21:00", actualStart: "20:15", status: "On Stage", setLength: 50, changeoverTime: 20 },
  { id: "ST-004", artistName: "Headliner", stage: "Main Stage", scheduledStart: "21:20", scheduledEnd: "23:00", status: "Upcoming", setLength: 100, changeoverTime: 0, notes: "Hard curfew at 23:00" },
  { id: "ST-005", artistName: "DJ Set", stage: "Side Stage", scheduledStart: "17:00", scheduledEnd: "20:00", actualStart: "17:00", actualEnd: "20:05", status: "Completed", setLength: 180, changeoverTime: 0 },
  { id: "ST-006", artistName: "Local Band", stage: "Side Stage", scheduledStart: "20:30", scheduledEnd: "21:30", status: "Upcoming", setLength: 60, changeoverTime: 30 },
];

export default function SetTimesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("timeline");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedSet, setSelectedSet] = useState<SetTime | null>(null);
  const [showStartModal, setShowStartModal] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const onStage = mockSetTimes.filter(s => s.status === "On Stage");
  const upcoming = mockSetTimes.filter(s => s.status === "Upcoming");
  const completed = mockSetTimes.filter(s => s.status === "Completed");
  const delayed = mockSetTimes.filter(s => s.status === "Delayed").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "text-success-400";
      case "On Stage": return "text-info-400";
      case "Upcoming": return "text-ink-400";
      case "Delayed": return "text-warning-400";
      case "Cancelled": return "text-error-400";
      default: return "text-ink-400";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "On Stage": return "border-info-800 bg-info-900/20";
      case "Delayed": return "border-warning-800 bg-warning-900/20";
      default: return "border-ink-800 bg-ink-900/50";
    }
  };

  const calculateVariance = (scheduled: string, actual?: string) => {
    if (!actual) return null;
    const [schedH, schedM] = scheduled.split(":").map(Number);
    const [actH, actM] = actual.split(":").map(Number);
    const diff = (actH * 60 + actM) - (schedH * 60 + schedM);
    return diff;
  };

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <Stack direction="horizontal" className="items-start justify-between">
              <EnterprisePageHeader
        title="Set Time Tracking"
        subtitle="Track actual start/end times and monitor schedule variance"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Set Times' }]}
        views={[
          { id: 'default', label: 'Default', icon: 'grid' },
        ]}
        activeView="default"
        showFavorite
        showSettings
      />
              <Card className="p-4">
                <Stack gap={1} className="text-center">
                  <Body className="text-body-sm">Current Time</Body>
                  <Body className="text-h5-md">
                    {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </Body>
                </Stack>
              </Card>
            </Stack>

            <Grid cols={4} gap={6}>
              <StatCard value={onStage.length.toString()} label="On Stage Now" />
              <StatCard value={upcoming.length.toString()} label="Upcoming" />
              <StatCard value={completed.length.toString()} label="Completed" />
              <StatCard value={delayed.toString()} label="Delayed" />
            </Grid>

            {onStage.length > 0 && (
              <Card className="p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" className="items-center justify-between">
                    <Stack gap={1}>
                      <Badge variant="solid">NOW ON STAGE</Badge>
                      <Body className="text-h5-md font-display">{onStage[0].artistName}</Body>
                      <Body className="text-body-sm">{onStage[0].stage}</Body>
                    </Stack>
                    <Stack gap={2} className="text-right">
                      <Body className="text-body-sm">Started: {onStage[0].actualStart}</Body>
                      <Body className="text-body-sm">Scheduled End: {onStage[0].scheduledEnd}</Body>
                      <Button variant="solid" onClick={() => { setSelectedSet(onStage[0]); setShowStartModal(true); }}>End Set</Button>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            )}

            <Tabs>
              <TabsList>
                <Tab active={activeTab === "timeline"} onClick={() => setActiveTab("timeline")}>Timeline</Tab>
                <Tab active={activeTab === "by-stage"} onClick={() => setActiveTab("by-stage")}>By Stage</Tab>
                <Tab active={activeTab === "variance"} onClick={() => setActiveTab("variance")}>Variance Report</Tab>
              </TabsList>

              <TabPanel active={activeTab === "timeline"}>
                <Stack gap={3}>
                  {mockSetTimes.sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart)).map((set) => (
                    <Card key={set.id} className="p-4">
                      <Grid cols={6} gap={4} className="items-center">
                        <Stack gap={1}>
                          <Body className="font-display">{set.artistName}</Body>
                          <Badge variant="outline">{set.stage}</Badge>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-body-sm">Scheduled</Body>
                          <Body>{set.scheduledStart} - {set.scheduledEnd}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-body-sm">Actual</Body>
                          <Body>
                            {set.actualStart || "--:--"} - {set.actualEnd || "--:--"}
                          </Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-body-sm">Set Length</Body>
                          <Body>{set.setLength} min</Body>
                        </Stack>
                        <Badge variant={set.status === "Completed" ? "solid" : "outline"}>{set.status}</Badge>
                        <Stack direction="horizontal" gap={2}>
                          {set.status === "Upcoming" && (
                            <Button variant="outline" size="sm" onClick={() => { setSelectedSet(set); setShowStartModal(true); }}>Start</Button>
                          )}
                          {set.status === "On Stage" && (
                            <Button variant="outline" size="sm" onClick={() => { setSelectedSet(set); setShowStartModal(true); }}>End</Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => setSelectedSet(set)}>Details</Button>
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
                          {mockSetTimes.filter(s => s.stage === stage).sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart)).map((set) => (
                            <Card key={set.id} className="p-3">
                              <Stack direction="horizontal" className="items-center justify-between">
                                <Stack gap={1}>
                                  <Body>{set.artistName}</Body>
                                  <Body className="text-body-sm">{set.scheduledStart} - {set.scheduledEnd}</Body>
                                </Stack>
                                <Badge variant={set.status === "On Stage" ? "solid" : "outline"}>{set.status}</Badge>
                              </Stack>
                            </Card>
                          ))}
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </TabPanel>

              <TabPanel active={activeTab === "variance"}>
                <Card className="p-6">
                  <Stack gap={4}>
                    <H3>Schedule Variance Report</H3>
                    <Stack gap={2}>
                      {mockSetTimes.filter(s => s.actualStart).map((set) => {
                        const startVar = calculateVariance(set.scheduledStart, set.actualStart);
                        const endVar = set.actualEnd ? calculateVariance(set.scheduledEnd, set.actualEnd) : null;
                        return (
                          <Card key={set.id} className="p-3">
                            <Grid cols={4} gap={4} className="items-center">
                              <Body>{set.artistName}</Body>
                              <Stack gap={1}>
                                <Body className="text-body-sm">Start Variance</Body>
                                <Body>
                                  {startVar !== null ? (startVar > 0 ? `+${startVar}` : startVar) : "--"} min
                                </Body>
                              </Stack>
                              <Stack gap={1}>
                                <Body className="text-body-sm">End Variance</Body>
                                <Body>
                                  {endVar !== null ? (endVar > 0 ? `+${endVar}` : endVar) : "--"} min
                                </Body>
                              </Stack>
                              <Badge variant={set.status === "Completed" ? "solid" : "outline"}>{set.status}</Badge>
                            </Grid>
                          </Card>
                        );
                      })}
                    </Stack>
                  </Stack>
                </Card>
              </TabPanel>
            </Tabs>

            <Grid cols={3} gap={4}>
              <Button variant="solid">Add Set</Button>
              <Button variant="outline">Export Report</Button>
              <Button variant="outline" onClick={() => router.push("/run-of-show")}>Run of Show</Button>
            </Grid>
          </Stack>
        </Container>
      </Section>

      <Modal open={!!selectedSet && !showStartModal} onClose={() => setSelectedSet(null)}>
        <ModalHeader><H3>Set Details</H3></ModalHeader>
        <ModalBody>
          {selectedSet && (
            <Stack gap={4}>
              <Body className="font-display">{selectedSet.artistName}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="text-body-sm">Stage</Body>
                  <Body>{selectedSet.stage}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="text-body-sm">Status</Body>
                  <Badge variant="outline">{selectedSet.status}</Badge>
                </Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="text-body-sm">Scheduled</Body>
                  <Body>{selectedSet.scheduledStart} - {selectedSet.scheduledEnd}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="text-body-sm">Actual</Body>
                  <Body>{selectedSet.actualStart || "--:--"} - {selectedSet.actualEnd || "--:--"}</Body>
                </Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="text-body-sm">Set Length</Body>
                  <Body>{selectedSet.setLength} min</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="text-body-sm">Changeover</Body>
                  <Body>{selectedSet.changeoverTime} min</Body>
                </Stack>
              </Grid>
              {selectedSet.notes && (
                <Stack gap={1}>
                  <Body className="text-body-sm">Notes</Body>
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
                <Input type="time" defaultValue={currentTime.toTimeString().slice(0, 5)} />
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
    </PageLayout>
  );
}
