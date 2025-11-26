"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Alert,
} from "@ghxstship/ui";

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
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack direction="horizontal" className="justify-between items-start">
            <Stack gap={2}>
              <H1>Set Time Tracking</H1>
              <Label className="text-ink-400">Track actual start/end times and monitor schedule variance</Label>
            </Stack>
            <Card className="p-4 bg-ink-800 border border-ink-700">
              <Stack gap={1} className="text-center">
                <Label size="xs" className="text-ink-500">Current Time</Label>
                <Label className="font-mono text-white text-2xl">
                  {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </Label>
              </Stack>
            </Card>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="On Stage Now" value={onStage.length} className="bg-transparent border-2 border-info-800" />
            <StatCard label="Upcoming" value={upcoming.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Completed" value={completed.length} trend="up" className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Delayed" value={delayed} trend={delayed > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          {onStage.length > 0 && (
            <Card className="border-2 border-info-800 bg-info-900/20 p-6">
              <Stack gap={4}>
                <Stack direction="horizontal" className="justify-between items-center">
                  <Stack gap={1}>
                    <Label className="text-info-400">NOW ON STAGE</Label>
                    <Body className="font-display text-white text-2xl">{onStage[0].artistName}</Body>
                    <Label className="text-ink-400">{onStage[0].stage}</Label>
                  </Stack>
                  <Stack gap={2} className="text-right">
                    <Label className="text-ink-400">Started: {onStage[0].actualStart}</Label>
                    <Label className="text-ink-400">Scheduled End: {onStage[0].scheduledEnd}</Label>
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
                  <Card key={set.id} className={`border-2 p-4 ${getStatusBg(set.status)}`}>
                    <Grid cols={6} gap={4} className="items-center">
                      <Stack gap={1}>
                        <Body className="font-display text-white">{set.artistName}</Body>
                        <Badge variant="outline">{set.stage}</Badge>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Scheduled</Label>
                        <Label className="font-mono text-white">{set.scheduledStart} - {set.scheduledEnd}</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Actual</Label>
                        <Label className="font-mono text-white">
                          {set.actualStart || "--:--"} - {set.actualEnd || "--:--"}
                        </Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Set Length</Label>
                        <Label className="text-ink-300">{set.setLength} min</Label>
                      </Stack>
                      <Label className={getStatusColor(set.status)}>{set.status}</Label>
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
                  <Card key={stage} className="border-2 border-ink-800 bg-ink-900/50 p-4">
                    <Stack gap={4}>
                      <H3>{stage}</H3>
                      <Stack gap={2}>
                        {mockSetTimes.filter(s => s.stage === stage).sort((a, b) => a.scheduledStart.localeCompare(b.scheduledStart)).map((set) => (
                          <Card key={set.id} className={`p-3 border ${set.status === "On Stage" ? "border-info-800 bg-info-900/10" : "border-ink-700 bg-ink-800"}`}>
                            <Stack direction="horizontal" className="justify-between items-center">
                              <Stack gap={1}>
                                <Label className="text-white">{set.artistName}</Label>
                                <Label size="xs" className="font-mono text-ink-400">{set.scheduledStart} - {set.scheduledEnd}</Label>
                              </Stack>
                              <Label className={getStatusColor(set.status)}>{set.status}</Label>
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
              <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={4}>
                  <H3>Schedule Variance Report</H3>
                  <Stack gap={2}>
                    {mockSetTimes.filter(s => s.actualStart).map((set) => {
                      const startVar = calculateVariance(set.scheduledStart, set.actualStart);
                      const endVar = set.actualEnd ? calculateVariance(set.scheduledEnd, set.actualEnd) : null;
                      return (
                        <Card key={set.id} className="p-3 bg-ink-800 border border-ink-700">
                          <Grid cols={4} gap={4} className="items-center">
                            <Label className="text-white">{set.artistName}</Label>
                            <Stack gap={1}>
                              <Label size="xs" className="text-ink-500">Start Variance</Label>
                              <Label className={startVar && startVar > 0 ? "text-warning-400" : startVar && startVar < 0 ? "text-success-400" : "text-ink-300"}>
                                {startVar !== null ? (startVar > 0 ? `+${startVar}` : startVar) : "--"} min
                              </Label>
                            </Stack>
                            <Stack gap={1}>
                              <Label size="xs" className="text-ink-500">End Variance</Label>
                              <Label className={endVar && endVar > 0 ? "text-warning-400" : endVar && endVar < 0 ? "text-success-400" : "text-ink-300"}>
                                {endVar !== null ? (endVar > 0 ? `+${endVar}` : endVar) : "--"} min
                              </Label>
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
            <Button variant="outlineWhite">Add Set</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Export Report</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/run-of-show")}>Run of Show</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedSet && !showStartModal} onClose={() => setSelectedSet(null)}>
        <ModalHeader><H3>Set Details</H3></ModalHeader>
        <ModalBody>
          {selectedSet && (
            <Stack gap={4}>
              <Body className="font-display text-white text-lg">{selectedSet.artistName}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Stage</Label><Label className="text-white">{selectedSet.stage}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Status</Label><Label className={getStatusColor(selectedSet.status)}>{selectedSet.status}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Scheduled</Label><Label className="font-mono text-white">{selectedSet.scheduledStart} - {selectedSet.scheduledEnd}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Actual</Label><Label className="font-mono text-white">{selectedSet.actualStart || "--:--"} - {selectedSet.actualEnd || "--:--"}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Set Length</Label><Label className="text-white">{selectedSet.setLength} min</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Changeover</Label><Label className="text-white">{selectedSet.changeoverTime} min</Label></Stack>
              </Grid>
              {selectedSet.notes && <Stack gap={1}><Label size="xs" className="text-ink-500">Notes</Label><Body className="text-ink-300">{selectedSet.notes}</Body></Stack>}
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
              <Body className="text-white">{selectedSet.artistName}</Body>
              <Stack gap={2}>
                <Label>{selectedSet.status === "On Stage" ? "Actual End Time" : "Actual Start Time"}</Label>
                <Input type="time" defaultValue={currentTime.toTimeString().slice(0, 5)} className="border-ink-700 bg-black text-white" />
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
    </UISection>
  );
}
