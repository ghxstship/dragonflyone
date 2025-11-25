"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  Container,
  H1,
  H2,
  H3,
  Body,
  Label,
  Grid,
  Stack,
  StatCard,
  Input,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  EmptyState,
  Section as UISection,
  Card,
  CardHeader,
  CardBody,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  Alert,
} from "@ghxstship/ui";

interface Performer {
  id: string;
  name: string;
  type: "Artist" | "Band" | "DJ" | "Speaker" | "Host";
  setTime: string;
  setDuration: number;
  status: "Checked In" | "On Deck" | "On Stage" | "Completed" | "Not Arrived";
  dressingRoom?: string;
  technicalRider?: boolean;
  hospitalityRider?: boolean;
  notes?: string;
  contactPerson?: string;
  contactPhone?: string;
}

interface StageArea {
  id: string;
  name: string;
  type: "Main Stage" | "Secondary Stage" | "Green Room" | "Dressing Room" | "Backstage";
  status: "Available" | "Occupied" | "Setup" | "Changeover";
  currentOccupant?: string;
  capacity?: number;
}

interface Cue {
  id: string;
  number: string;
  description: string;
  department: "Lighting" | "Audio" | "Video" | "Stage" | "Pyro" | "All";
  status: "Standby" | "Go" | "Complete" | "Hold";
  timestamp?: string;
  notes?: string;
}

const mockPerformers: Performer[] = [
  {
    id: "PERF-001",
    name: "The Midnight Collective",
    type: "Band",
    setTime: "20:00",
    setDuration: 90,
    status: "Checked In",
    dressingRoom: "DR-1",
    technicalRider: true,
    hospitalityRider: true,
    contactPerson: "Sarah Mitchell",
    contactPhone: "+1 555-0123",
    notes: "Requires 15 min soundcheck before set",
  },
  {
    id: "PERF-002",
    name: "DJ Phantom",
    type: "DJ",
    setTime: "22:00",
    setDuration: 60,
    status: "On Deck",
    dressingRoom: "DR-2",
    technicalRider: true,
    hospitalityRider: false,
    contactPerson: "Mike Torres",
    contactPhone: "+1 555-0456",
  },
  {
    id: "PERF-003",
    name: "Aurora Keys",
    type: "Artist",
    setTime: "23:30",
    setDuration: 75,
    status: "Not Arrived",
    dressingRoom: "DR-3",
    technicalRider: true,
    hospitalityRider: true,
    notes: "VIP guest list: 8 people",
  },
  {
    id: "PERF-004",
    name: "Opening Ceremony Host",
    type: "Host",
    setTime: "19:30",
    setDuration: 15,
    status: "Completed",
    notes: "Script approved",
  },
];

const mockStageAreas: StageArea[] = [
  { id: "SA-001", name: "Main Stage", type: "Main Stage", status: "Occupied", currentOccupant: "The Midnight Collective" },
  { id: "SA-002", name: "DJ Booth", type: "Secondary Stage", status: "Setup", currentOccupant: "DJ Phantom (prep)" },
  { id: "SA-003", name: "Green Room A", type: "Green Room", status: "Occupied", currentOccupant: "Aurora Keys", capacity: 15 },
  { id: "SA-004", name: "Dressing Room 1", type: "Dressing Room", status: "Available", capacity: 6 },
  { id: "SA-005", name: "Dressing Room 2", type: "Dressing Room", status: "Occupied", currentOccupant: "DJ Phantom", capacity: 4 },
  { id: "SA-006", name: "Backstage Left", type: "Backstage", status: "Available" },
  { id: "SA-007", name: "Backstage Right", type: "Backstage", status: "Changeover" },
];

const mockCues: Cue[] = [
  { id: "CUE-001", number: "LX-15", description: "House lights to 50%", department: "Lighting", status: "Complete", timestamp: "19:28" },
  { id: "CUE-002", number: "LX-16", description: "Stage wash - blue", department: "Lighting", status: "Complete", timestamp: "19:30" },
  { id: "CUE-003", number: "SND-08", description: "Walk-in music fade", department: "Audio", status: "Complete", timestamp: "19:30" },
  { id: "CUE-004", number: "VID-03", description: "Opening video roll", department: "Video", status: "Complete", timestamp: "19:31" },
  { id: "CUE-005", number: "LX-17", description: "Full stage lights", department: "Lighting", status: "Go", timestamp: "20:00" },
  { id: "CUE-006", number: "SND-09", description: "Band intro music", department: "Audio", status: "Standby" },
  { id: "CUE-007", number: "PYRO-01", description: "Opening pyro burst", department: "Pyro", status: "Standby", notes: "Safety check complete" },
];

export default function StageManagementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("performers");
  const [selectedPerformer, setSelectedPerformer] = useState<Performer | null>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showCueModal, setShowCueModal] = useState(false);
  const [selectedCue, setSelectedCue] = useState<Cue | null>(null);

  const checkedInCount = mockPerformers.filter((p) => p.status === "Checked In" || p.status === "On Deck" || p.status === "On Stage").length;
  const notArrivedCount = mockPerformers.filter((p) => p.status === "Not Arrived").length;
  const availableRooms = mockStageAreas.filter((a) => a.status === "Available").length;
  const pendingCues = mockCues.filter((c) => c.status === "Standby").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Checked In":
      case "Available":
      case "Complete":
        return "text-green-400";
      case "On Deck":
      case "Setup":
      case "Standby":
        return "text-yellow-400";
      case "On Stage":
      case "Occupied":
      case "Go":
        return "text-blue-400";
      case "Not Arrived":
      case "Hold":
        return "text-red-400";
      case "Completed":
      case "Changeover":
        return "text-ink-400";
      default:
        return "text-ink-400";
    }
  };

  const handleCueAction = (cue: Cue, action: "go" | "hold" | "complete") => {
    // In real implementation, this would update the cue status
    console.log(`Cue ${cue.number}: ${action}`);
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />

      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Stage Management Console</H1>
            <Label className="text-ink-400">
              Performer tracking, cue calling, and backstage coordination
            </Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard
              label="Checked In"
              value={`${checkedInCount}/${mockPerformers.length}`}
              className="bg-transparent border-2 border-ink-800"
            />
            <StatCard
              label="Not Arrived"
              value={notArrivedCount}
              trend={notArrivedCount > 0 ? "down" : "neutral"}
              className="bg-transparent border-2 border-ink-800"
            />
            <StatCard
              label="Available Rooms"
              value={availableRooms}
              className="bg-transparent border-2 border-ink-800"
            />
            <StatCard
              label="Pending Cues"
              value={pendingCues}
              className="bg-transparent border-2 border-ink-800"
            />
          </Grid>

          {notArrivedCount > 0 && (
            <Alert variant="warning">
              {notArrivedCount} performer(s) have not yet arrived. Check-in deadline approaching.
            </Alert>
          )}

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "performers"} onClick={() => setActiveTab("performers")}>Performers</Tab>
              <Tab active={activeTab === "areas"} onClick={() => setActiveTab("areas")}>Stage Areas</Tab>
              <Tab active={activeTab === "cues"} onClick={() => setActiveTab("cues")}>Cue Sheet</Tab>
              <Tab active={activeTab === "timeline"} onClick={() => setActiveTab("timeline")}>Timeline</Tab>
            </TabsList>

            <TabPanel active={activeTab === "performers"}>
              <Table className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead>Performer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Set Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Dressing Room</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPerformers.map((performer) => (
                    <TableRow key={performer.id}>
                      <TableCell>
                        <Stack gap={1}>
                          <Body className="font-display text-white">{performer.name}</Body>
                          {performer.contactPerson && (
                            <Label size="xs" className="text-ink-500">Contact: {performer.contactPerson}</Label>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{performer.type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-white">{performer.setTime}</TableCell>
                      <TableCell className="text-ink-300">{performer.setDuration} min</TableCell>
                      <TableCell className="text-ink-300">{performer.dressingRoom || "-"}</TableCell>
                      <TableCell>
                        <Label className={getStatusColor(performer.status)}>{performer.status}</Label>
                      </TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={2}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedPerformer(performer)}
                          >
                            Details
                          </Button>
                          {performer.status === "Not Arrived" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedPerformer(performer);
                                setShowCheckInModal(true);
                              }}
                            >
                              Check In
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>

            <TabPanel active={activeTab === "areas"}>
              <Grid cols={3} gap={6}>
                {mockStageAreas.map((area) => (
                  <Card key={area.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                    <Stack gap={4}>
                      <Stack gap={1}>
                        <H3>{area.name}</H3>
                        <Badge variant="outline">{area.type}</Badge>
                      </Stack>
                      
                      <Grid cols={2} gap={4}>
                        <Stack gap={1}>
                          <Label size="xs" className="text-ink-500">Status</Label>
                          <Label className={getStatusColor(area.status)}>{area.status}</Label>
                        </Stack>
                        {area.capacity && (
                          <Stack gap={1}>
                            <Label size="xs" className="text-ink-500">Capacity</Label>
                            <Label className="text-white">{area.capacity}</Label>
                          </Stack>
                        )}
                      </Grid>

                      {area.currentOccupant && (
                        <Stack gap={1}>
                          <Label size="xs" className="text-ink-500">Current Occupant</Label>
                          <Label className="text-white">{area.currentOccupant}</Label>
                        </Stack>
                      )}

                      <Button variant="outline" size="sm" className="w-full">
                        {area.status === "Available" ? "Assign" : "Update Status"}
                      </Button>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "cues"}>
              <Stack gap={4}>
                <Card className="border-2 border-green-800 bg-green-900/20 p-4">
                  <Stack direction="horizontal" className="justify-between items-center">
                    <Stack gap={1}>
                      <Label className="text-green-400">CURRENT CUE</Label>
                      <H2 className="text-white">LX-17 - Full stage lights</H2>
                    </Stack>
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="outline" onClick={() => handleCueAction(mockCues[4], "hold")}>
                        HOLD
                      </Button>
                      <Button variant="solid" onClick={() => handleCueAction(mockCues[4], "complete")}>
                        COMPLETE
                      </Button>
                    </Stack>
                  </Stack>
                </Card>

                <Table className="border-2 border-ink-800">
                  <TableHeader>
                    <TableRow className="bg-ink-900">
                      <TableHead>Cue #</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockCues.map((cue) => (
                      <TableRow key={cue.id} className={cue.status === "Go" ? "bg-green-900/20" : ""}>
                        <TableCell className="font-mono text-white">{cue.number}</TableCell>
                        <TableCell>
                          <Stack gap={1}>
                            <Label className="text-white">{cue.description}</Label>
                            {cue.notes && (
                              <Label size="xs" className="text-ink-500">{cue.notes}</Label>
                            )}
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{cue.department}</Badge>
                        </TableCell>
                        <TableCell>
                          <Label className={getStatusColor(cue.status)}>{cue.status}</Label>
                        </TableCell>
                        <TableCell className="font-mono text-ink-400">{cue.timestamp || "-"}</TableCell>
                        <TableCell>
                          {cue.status === "Standby" && (
                            <Button
                              variant="solid"
                              size="sm"
                              onClick={() => handleCueAction(cue, "go")}
                            >
                              GO
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "timeline"}>
              <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={6}>
                  <H3>Show Timeline</H3>
                  <Stack gap={4}>
                    {mockPerformers
                      .sort((a, b) => a.setTime.localeCompare(b.setTime))
                      .map((performer, index) => (
                        <Card key={performer.id} className="p-4 bg-ink-800 border border-ink-700">
                          <Grid cols={4} gap={4}>
                            <Stack gap={1}>
                              <Label size="xs" className="text-ink-500">Time</Label>
                              <Label className="font-mono text-white text-lg">{performer.setTime}</Label>
                            </Stack>
                            <Stack gap={1} className="col-span-2">
                              <Label size="xs" className="text-ink-500">Performer</Label>
                              <Label className="text-white font-display">{performer.name}</Label>
                              <Label size="xs" className="text-ink-400">{performer.setDuration} minutes</Label>
                            </Stack>
                            <Stack gap={1} className="text-right">
                              <Label size="xs" className="text-ink-500">Status</Label>
                              <Label className={getStatusColor(performer.status)}>{performer.status}</Label>
                            </Stack>
                          </Grid>
                        </Card>
                      ))}
                  </Stack>
                </Stack>
              </Card>
            </TabPanel>
          </Tabs>

          <Grid cols={4} gap={4}>
            <Button variant="outlineWhite" onClick={() => router.push("/run-of-show")}>
              Run of Show
            </Button>
            <Button variant="outline" className="border-ink-700 text-ink-400 hover:border-white hover:text-white">
              Print Call Sheet
            </Button>
            <Button variant="outline" className="border-ink-700 text-ink-400 hover:border-white hover:text-white">
              Broadcast Message
            </Button>
            <Button variant="outline" className="border-ink-700 text-ink-400 hover:border-white hover:text-white" onClick={() => router.push("/dashboard")}>
              Back to Dashboard
            </Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedPerformer && !showCheckInModal} onClose={() => setSelectedPerformer(null)}>
        <ModalHeader>
          <H3>Performer Details</H3>
        </ModalHeader>
        <ModalBody>
          {selectedPerformer && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Label size="xs" className="text-ink-500">Name</Label>
                <Body className="text-white font-display text-lg">{selectedPerformer.name}</Body>
              </Stack>

              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Type</Label>
                  <Badge variant="outline">{selectedPerformer.type}</Badge>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Status</Label>
                  <Label className={getStatusColor(selectedPerformer.status)}>{selectedPerformer.status}</Label>
                </Stack>
              </Grid>

              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Set Time</Label>
                  <Label className="font-mono text-white">{selectedPerformer.setTime}</Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Duration</Label>
                  <Label className="text-white">{selectedPerformer.setDuration} minutes</Label>
                </Stack>
              </Grid>

              {selectedPerformer.dressingRoom && (
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Dressing Room</Label>
                  <Label className="text-white">{selectedPerformer.dressingRoom}</Label>
                </Stack>
              )}

              {selectedPerformer.contactPerson && (
                <Grid cols={2} gap={4}>
                  <Stack gap={1}>
                    <Label size="xs" className="text-ink-500">Contact Person</Label>
                    <Label className="text-white">{selectedPerformer.contactPerson}</Label>
                  </Stack>
                  <Stack gap={1}>
                    <Label size="xs" className="text-ink-500">Phone</Label>
                    <Label className="font-mono text-white">{selectedPerformer.contactPhone}</Label>
                  </Stack>
                </Grid>
              )}

              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Technical Rider</Label>
                  <Label className={selectedPerformer.technicalRider ? "text-green-400" : "text-ink-500"}>
                    {selectedPerformer.technicalRider ? "Received" : "Not Received"}
                  </Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Hospitality Rider</Label>
                  <Label className={selectedPerformer.hospitalityRider ? "text-green-400" : "text-ink-500"}>
                    {selectedPerformer.hospitalityRider ? "Received" : "Not Received"}
                  </Label>
                </Stack>
              </Grid>

              {selectedPerformer.notes && (
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Notes</Label>
                  <Body className="text-ink-300">{selectedPerformer.notes}</Body>
                </Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedPerformer(null)}>
            Close
          </Button>
          <Button variant="solid">
            Update Status
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={showCheckInModal} onClose={() => setShowCheckInModal(false)}>
        <ModalHeader>
          <H3>Check In Performer</H3>
        </ModalHeader>
        <ModalBody>
          {selectedPerformer && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Label size="xs" className="text-ink-500">Performer</Label>
                <Body className="text-white font-display">{selectedPerformer.name}</Body>
              </Stack>

              <Stack gap={2}>
                <Label>Assign Dressing Room</Label>
                <Select className="border-ink-700 bg-black text-white">
                  <option value="">Select room...</option>
                  {mockStageAreas
                    .filter((a) => a.type === "Dressing Room" && a.status === "Available")
                    .map((room) => (
                      <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                </Select>
              </Stack>

              <Stack gap={2}>
                <Label>Check-in Notes</Label>
                <Input
                  placeholder="Any notes about the check-in..."
                  className="border-ink-700 bg-black text-white"
                />
              </Stack>

              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Technical Rider</Label>
                  <Label className={selectedPerformer.technicalRider ? "text-green-400" : "text-yellow-400"}>
                    {selectedPerformer.technicalRider ? "✓ Received" : "⚠ Pending"}
                  </Label>
                </Stack>
                <Stack gap={1}>
                  <Label size="xs" className="text-ink-500">Hospitality Rider</Label>
                  <Label className={selectedPerformer.hospitalityRider ? "text-green-400" : "text-yellow-400"}>
                    {selectedPerformer.hospitalityRider ? "✓ Received" : "⚠ Pending"}
                  </Label>
                </Stack>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCheckInModal(false)}>
            Cancel
          </Button>
          <Button variant="solid" onClick={() => setShowCheckInModal(false)}>
            Complete Check-In
          </Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
