"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../../components/navigation";
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  StatCard,
  Select,
  Button,
  Section,
  Card,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  PageLayout,
  SectionHeader,
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

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <SectionHeader
              kicker="COMPVSS"
              title="Availability Calendar"
              description="Crew availability integration with calendars"
              colorScheme="on-light"
              gap="lg"
            />

            <Grid cols={4} gap={6}>
              <StatCard value={mockCrew.length.toString()} label="Total Crew" />
              <StatCard value={availableCount.toString()} label="Available Now" />
              <StatCard value={mockCrew.filter(c => c.status === "Busy").length.toString()} label="On Projects" />
              <StatCard value={mockCrew.filter(c => c.status === "Tentative").length.toString()} label="Tentative" />
            </Grid>

            <Stack direction="horizontal" className="justify-between">
              <Stack direction="horizontal" gap={4}>
                <Select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </Select>
                <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="All">All Status</option>
                  <option value="Available">Available</option>
                  <option value="Busy">Busy</option>
                  <option value="Tentative">Tentative</option>
                  <option value="Unavailable">Unavailable</option>
                </Select>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Button variant="outline">Sync Calendars</Button>
                <Button variant="solid">Request Availability</Button>
              </Stack>
            </Stack>

            <Card className="overflow-hidden">
              <Grid cols={4} gap={0}>
                <Card className="border-b border-r p-3">
                  <Body className="font-display">Crew Member</Body>
                </Card>
                <Card className="border-b border-r p-3">
                  <Body className="font-display">Status</Body>
                </Card>
                <Card className="col-span-2 border-b p-3">
                  <Grid cols={6} gap={2}>
                    {weekDays.slice(0, 6).map((day) => (
                      <Body key={day} className="text-center text-body-sm">{day}</Body>
                    ))}
                  </Grid>
                </Card>
                {filteredCrew.map((crew) => (
                  <Stack key={crew.id} className="contents">
                    <Card className="border-b border-r p-3">
                      <Stack direction="horizontal" gap={3} className="cursor-pointer" onClick={() => setSelectedCrew(crew)}>
                        <Card className="flex size-10 items-center justify-center rounded-avatar">
                          <Body className="text-body-sm">{crew.avatar}</Body>
                        </Card>
                        <Stack gap={0}>
                          <Body>{crew.name}</Body>
                          <Body className="text-body-sm">{crew.role}</Body>
                        </Stack>
                      </Stack>
                    </Card>
                    <Card className="border-b border-r p-3">
                      <Stack gap={1}>
                        <Badge variant={crew.status === "Available" ? "solid" : "outline"}>{crew.status}</Badge>
                        {crew.currentProject && <Body className="text-body-sm">{crew.currentProject}</Body>}
                        {crew.nextAvailable && <Body className="text-body-sm">Back: {crew.nextAvailable}</Body>}
                      </Stack>
                    </Card>
                    <Card className="col-span-2 border-b p-3">
                      <Grid cols={6} gap={2}>
                        {crew.weekAvailability.slice(0, 6).map((available, idx) => (
                          <Card key={idx} className="flex h-8 items-center justify-center rounded-card">
                            <Body className="text-body-sm">{available ? "✓" : "—"}</Body>
                          </Card>
                        ))}
                      </Grid>
                    </Card>
                  </Stack>
                ))}
              </Grid>
            </Card>

            <Card className="p-4">
              <Stack direction="horizontal" gap={6} className="justify-center">
                <Stack direction="horizontal" gap={2}>
                  <Card className="size-4 rounded-card bg-success-500" />
                  <Body className="text-body-sm">Available</Body>
                </Stack>
                <Stack direction="horizontal" gap={2}>
                  <Card className="size-4 rounded-card bg-warning-500" />
                  <Body className="text-body-sm">Tentative</Body>
                </Stack>
                <Stack direction="horizontal" gap={2}>
                  <Card className="size-4 rounded-card bg-error-500" />
                  <Body className="text-body-sm">Busy</Body>
                </Stack>
                <Stack direction="horizontal" gap={2}>
                  <Card className="size-4 rounded-card bg-ink-500" />
                  <Body className="text-body-sm">Unavailable</Body>
                </Stack>
              </Stack>
            </Card>

            <Grid cols={3} gap={4}>
              <Button variant="outline" onClick={() => router.push("/directory")}>Directory</Button>
              <Button variant="outline" onClick={() => router.push("/crew")}>Crew</Button>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>Dashboard</Button>
            </Grid>
          </Stack>
        </Container>
      </Section>

      <Modal open={!!selectedCrew} onClose={() => setSelectedCrew(null)}>
        <ModalHeader><H3>{selectedCrew?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedCrew && (
            <Stack gap={4}>
              <Card className="mx-auto flex size-16 items-center justify-center rounded-avatar">
                <Body className="text-h6-md">{selectedCrew.avatar}</Body>
              </Card>
              <Stack gap={1} className="text-center">
                <Body>{selectedCrew.role}</Body>
                <Badge variant="outline">{selectedCrew.department}</Badge>
              </Stack>
              <Stack gap={1}>
                <Body className="font-display">Current Status</Body>
                <Badge variant={selectedCrew.status === "Available" ? "solid" : "outline"}>{selectedCrew.status}</Badge>
              </Stack>
              {selectedCrew.currentProject && (
                <Stack gap={1}>
                  <Body className="font-display">Current Project</Body>
                  <Body>{selectedCrew.currentProject}</Body>
                </Stack>
              )}
              {selectedCrew.nextAvailable && (
                <Stack gap={1}>
                  <Body className="font-display">Next Available</Body>
                  <Body>{selectedCrew.nextAvailable}</Body>
                </Stack>
              )}
              <Stack gap={2}>
                <Body className="font-display">This Week</Body>
                <Grid cols={6} gap={2}>
                  {weekDays.slice(0, 6).map((day, idx) => (
                    <Stack key={day} gap={1} className="text-center">
                      <Body className="text-body-sm">{day}</Body>
                      <Card className="flex h-8 items-center justify-center rounded-card">
                        <Body className="text-body-sm">{selectedCrew.weekAvailability[idx] ? "✓" : "—"}</Body>
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
    </PageLayout>
  );
}
