"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter,
} from "@ghxstship/ui";

interface CrewAvailability {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  status: "Available" | "Busy" | "Tentative" | "Unavailable";
  currentProject?: string;
  nextAvailable?: string;
  weekAvailability: boolean[];
}

const mockCrew: CrewAvailability[] = [
  { id: "CRW-001", name: "John Smith", role: "Audio Engineer", department: "Audio", avatar: "JS", status: "Available", weekAvailability: [true, true, true, true, true, false, false] },
  { id: "CRW-002", name: "Sarah Johnson", role: "Lighting Designer", department: "Lighting", avatar: "SJ", status: "Busy", currentProject: "Summer Fest 2024", nextAvailable: "2024-12-01", weekAvailability: [false, false, false, false, false, false, false] },
  { id: "CRW-003", name: "Mike Davis", role: "Stage Manager", department: "Stage", avatar: "MD", status: "Tentative", weekAvailability: [true, true, false, false, true, true, false] },
  { id: "CRW-004", name: "Emily Chen", role: "Video Director", department: "Video", avatar: "EC", status: "Available", weekAvailability: [true, true, true, true, true, true, false] },
  { id: "CRW-005", name: "Robert Wilson", role: "Rigger", department: "Rigging", avatar: "RW", status: "Unavailable", nextAvailable: "2024-12-15", weekAvailability: [false, false, false, false, false, false, false] },
];

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const departments = ["All", "Audio", "Lighting", "Video", "Stage", "Rigging"];

export default function AvailabilityPage() {
  const router = useRouter();
  const [selectedCrew, setSelectedCrew] = useState<CrewAvailability | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filteredCrew = mockCrew.filter(c => {
    const matchesDept = departmentFilter === "All" || c.department === departmentFilter;
    const matchesStatus = statusFilter === "All" || c.status === statusFilter;
    return matchesDept && matchesStatus;
  });

  const availableCount = mockCrew.filter(c => c.status === "Available").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Available": return "bg-green-500";
      case "Busy": return "bg-red-500";
      case "Tentative": return "bg-yellow-500";
      case "Unavailable": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "Available": return "text-green-400";
      case "Busy": return "text-red-400";
      case "Tentative": return "text-yellow-400";
      case "Unavailable": return "text-gray-400";
      default: return "text-gray-400";
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Availability Calendar</H1>
            <Label className="text-ink-400">Crew availability integration with calendars</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Crew" value={mockCrew.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Available Now" value={availableCount} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="On Projects" value={mockCrew.filter(c => c.status === "Busy").length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Tentative" value={mockCrew.filter(c => c.status === "Tentative").length} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Stack direction="horizontal" gap={4}>
              <Select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="border-ink-700 bg-black text-white">
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border-ink-700 bg-black text-white">
                <option value="All">All Status</option>
                <option value="Available">Available</option>
                <option value="Busy">Busy</option>
                <option value="Tentative">Tentative</option>
                <option value="Unavailable">Unavailable</option>
              </Select>
            </Stack>
            <Stack direction="horizontal" gap={2}>
              <Button variant="outline" className="border-ink-700">Sync Calendars</Button>
              <Button variant="outlineWhite">Request Availability</Button>
            </Stack>
          </Stack>

          <Card className="border-2 border-ink-800 bg-ink-900/50 overflow-hidden">
            <Grid cols={4} gap={0}>
              <Card className="p-3 border-r border-b border-ink-800 bg-ink-800">
                <Label className="text-ink-400">Crew Member</Label>
              </Card>
              <Card className="p-3 border-r border-b border-ink-800 bg-ink-800">
                <Label className="text-ink-400">Status</Label>
              </Card>
              <Card className="p-3 border-r border-b border-ink-800 bg-ink-800 col-span-2">
                <Grid cols={6} gap={2}>
                  {weekDays.slice(0, 6).map((day) => (
                    <Label key={day} className="text-ink-400 text-center">{day}</Label>
                  ))}
                </Grid>
              </Card>
              {filteredCrew.map((crew) => (
                <Stack key={crew.id} className="contents">
                  <Card className="p-3 border-r border-b border-ink-800">
                    <Stack direction="horizontal" gap={3} className="cursor-pointer" onClick={() => setSelectedCrew(crew)}>
                      <Card className="w-10 h-10 bg-ink-700 rounded-full flex items-center justify-center relative">
                        <Label>{crew.avatar}</Label>
                        <Card className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-ink-900 ${getStatusColor(crew.status)}`} />
                      </Card>
                      <Stack gap={0}>
                        <Label className="text-white">{crew.name}</Label>
                        <Label size="xs" className="text-ink-500">{crew.role}</Label>
                      </Stack>
                    </Stack>
                  </Card>
                  <Card className="p-3 border-r border-b border-ink-800">
                    <Stack gap={1}>
                      <Label className={getStatusTextColor(crew.status)}>{crew.status}</Label>
                      {crew.currentProject && <Label size="xs" className="text-ink-500">{crew.currentProject}</Label>}
                      {crew.nextAvailable && <Label size="xs" className="text-ink-500">Back: {crew.nextAvailable}</Label>}
                    </Stack>
                  </Card>
                  <Card className="p-3 border-b border-ink-800 col-span-2">
                    <Grid cols={6} gap={2}>
                      {crew.weekAvailability.slice(0, 6).map((available, idx) => (
                        <Card key={idx} className={`h-8 rounded flex items-center justify-center ${available ? "bg-green-900/30 border border-green-800" : "bg-ink-800 border border-ink-700"}`}>
                          <Label size="xs" className={available ? "text-green-400" : "text-ink-500"}>
                            {available ? "✓" : "—"}
                          </Label>
                        </Card>
                      ))}
                    </Grid>
                  </Card>
                </Stack>
              ))}
            </Grid>
          </Card>

          <Card className="border-2 border-ink-800 bg-ink-900/50 p-4">
            <Stack direction="horizontal" gap={6} className="justify-center">
              <Stack direction="horizontal" gap={2}>
                <Card className="w-4 h-4 bg-green-500 rounded" />
                <Label className="text-ink-400">Available</Label>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Card className="w-4 h-4 bg-yellow-500 rounded" />
                <Label className="text-ink-400">Tentative</Label>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Card className="w-4 h-4 bg-red-500 rounded" />
                <Label className="text-ink-400">Busy</Label>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Card className="w-4 h-4 bg-gray-500 rounded" />
                <Label className="text-ink-400">Unavailable</Label>
              </Stack>
            </Stack>
          </Card>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/directory")}>Directory</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/crew")}>Crew</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/")}>Dashboard</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedCrew} onClose={() => setSelectedCrew(null)}>
        <ModalHeader><H3>{selectedCrew?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedCrew && (
            <Stack gap={4}>
              <Card className="w-16 h-16 bg-ink-700 rounded-full flex items-center justify-center mx-auto">
                <Label className="text-xl">{selectedCrew.avatar}</Label>
              </Card>
              <Stack gap={1} className="text-center">
                <Label className="text-ink-400">{selectedCrew.role}</Label>
                <Badge variant="outline">{selectedCrew.department}</Badge>
              </Stack>
              <Stack gap={1}>
                <Label className="text-ink-400">Current Status</Label>
                <Label className={getStatusTextColor(selectedCrew.status)}>{selectedCrew.status}</Label>
              </Stack>
              {selectedCrew.currentProject && (
                <Stack gap={1}><Label className="text-ink-400">Current Project</Label><Label className="text-white">{selectedCrew.currentProject}</Label></Stack>
              )}
              {selectedCrew.nextAvailable && (
                <Stack gap={1}><Label className="text-ink-400">Next Available</Label><Label className="text-white">{selectedCrew.nextAvailable}</Label></Stack>
              )}
              <Stack gap={2}>
                <Label className="text-ink-400">This Week</Label>
                <Grid cols={6} gap={2}>
                  {weekDays.slice(0, 6).map((day, idx) => (
                    <Stack key={day} gap={1} className="text-center">
                      <Label size="xs" className="text-ink-500">{day}</Label>
                      <Card className={`h-8 rounded flex items-center justify-center ${selectedCrew.weekAvailability[idx] ? "bg-green-900/30 border border-green-800" : "bg-ink-800 border border-ink-700"}`}>
                        <Label size="xs" className={selectedCrew.weekAvailability[idx] ? "text-green-400" : "text-ink-500"}>
                          {selectedCrew.weekAvailability[idx] ? "✓" : "—"}
                        </Label>
                      </Card>
                    </Stack>
                  ))}
                </Grid>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedCrew(null)}>Close</Button>
          <Button variant="outline">View Calendar</Button>
          <Button variant="solid">Book Crew</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
