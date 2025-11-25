"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, Input,
} from "@ghxstship/ui";

interface CrewMember {
  id: string;
  name: string;
  role: string;
  department: string;
  callTime: string;
  status: "Checked In" | "On Site" | "Late" | "No Show" | "Not Due";
  checkedInAt?: string;
  phone: string;
}

const mockCrew: CrewMember[] = [
  { id: "CRW-001", name: "John Martinez", role: "Production Manager", department: "Production", callTime: "08:00", status: "Checked In", checkedInAt: "07:45", phone: "+1 555-0101" },
  { id: "CRW-002", name: "Sarah Chen", role: "Stage Manager", department: "Stage", callTime: "09:00", status: "Checked In", checkedInAt: "08:55", phone: "+1 555-0102" },
  { id: "CRW-003", name: "Mike Thompson", role: "Technical Director", department: "Technical", callTime: "08:00", status: "Checked In", checkedInAt: "07:50", phone: "+1 555-0103" },
  { id: "CRW-004", name: "Lisa Park", role: "Video Director", department: "Video", callTime: "10:00", status: "On Site", checkedInAt: "09:30", phone: "+1 555-0104" },
  { id: "CRW-005", name: "Tom Wilson", role: "Audio Engineer", department: "Audio", callTime: "09:00", status: "Late", phone: "+1 555-0105" },
  { id: "CRW-006", name: "Emily Davis", role: "Lighting Designer", department: "Lighting", callTime: "10:00", status: "Not Due", phone: "+1 555-0106" },
  { id: "CRW-007", name: "Chris Brown", role: "Rigger", department: "Rigging", callTime: "07:00", status: "Checked In", checkedInAt: "06:45", phone: "+1 555-0107" },
  { id: "CRW-008", name: "Alex Johnson", role: "Stagehand", department: "Stage", callTime: "08:00", status: "No Show", phone: "+1 555-0108" },
];

export default function ShowCallPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const checkedInCount = mockCrew.filter(c => c.status === "Checked In" || c.status === "On Site").length;
  const lateCount = mockCrew.filter(c => c.status === "Late").length;
  const noShowCount = mockCrew.filter(c => c.status === "No Show").length;
  const notDueCount = mockCrew.filter(c => c.status === "Not Due").length;

  const filteredCrew = mockCrew.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.role.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "present") return matchesSearch && (c.status === "Checked In" || c.status === "On Site");
    if (activeTab === "missing") return matchesSearch && (c.status === "Late" || c.status === "No Show");
    if (activeTab === "pending") return matchesSearch && c.status === "Not Due";
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Checked In": case "On Site": return "text-green-400";
      case "Late": return "text-yellow-400";
      case "No Show": return "text-red-400";
      case "Not Due": return "text-ink-400";
      default: return "text-ink-400";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "Checked In": case "On Site": return "border-green-800 bg-green-900/10";
      case "Late": return "border-yellow-800 bg-yellow-900/10";
      case "No Show": return "border-red-800 bg-red-900/10";
      default: return "border-ink-800 bg-ink-900/50";
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack direction="horizontal" className="justify-between items-start">
            <Stack gap={2}>
              <H1>Show Call Status</H1>
              <Label className="text-ink-400">Real-time crew check-in and attendance tracking</Label>
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
            <StatCard label="Checked In" value={checkedInCount} trend="up" className="bg-transparent border-2 border-green-800" />
            <StatCard label="Late" value={lateCount} trend={lateCount > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-yellow-800" />
            <StatCard label="No Show" value={noShowCount} trend={noShowCount > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-red-800" />
            <StatCard label="Not Due Yet" value={notDueCount} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Card className="p-4 border-2 border-ink-800 bg-ink-900/50">
            <Grid cols={4} gap={4}>
              <Stack gap={1} className="text-center">
                <Label className="text-green-400 text-3xl font-mono">{checkedInCount}</Label>
                <Label size="xs" className="text-ink-400">Present</Label>
              </Stack>
              <Stack gap={1} className="text-center">
                <Label className="text-yellow-400 text-3xl font-mono">{lateCount}</Label>
                <Label size="xs" className="text-ink-400">Late</Label>
              </Stack>
              <Stack gap={1} className="text-center">
                <Label className="text-red-400 text-3xl font-mono">{noShowCount}</Label>
                <Label size="xs" className="text-ink-400">Missing</Label>
              </Stack>
              <Stack gap={1} className="text-center">
                <Label className="text-white text-3xl font-mono">{mockCrew.length}</Label>
                <Label size="xs" className="text-ink-400">Total Crew</Label>
              </Stack>
            </Grid>
          </Card>

          <Input type="search" placeholder="Search crew..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-ink-700 bg-black text-white" />

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All ({mockCrew.length})</Tab>
              <Tab active={activeTab === "present"} onClick={() => setActiveTab("present")}>Present ({checkedInCount})</Tab>
              <Tab active={activeTab === "missing"} onClick={() => setActiveTab("missing")}>Missing ({lateCount + noShowCount})</Tab>
              <Tab active={activeTab === "pending"} onClick={() => setActiveTab("pending")}>Pending ({notDueCount})</Tab>
            </TabsList>

            <TabPanel active={true}>
              <Grid cols={2} gap={4}>
                {filteredCrew.map((crew) => (
                  <Card key={crew.id} className={`border-2 p-4 ${getStatusBg(crew.status)}`}>
                    <Grid cols={3} gap={4} className="items-center">
                      <Stack gap={1}>
                        <Body className="font-display text-white">{crew.name}</Body>
                        <Label size="xs" className="text-ink-400">{crew.role}</Label>
                        <Badge variant="outline">{crew.department}</Badge>
                      </Stack>
                      <Stack gap={1} className="text-center">
                        <Label size="xs" className="text-ink-500">Call Time</Label>
                        <Label className="font-mono text-white">{crew.callTime}</Label>
                        {crew.checkedInAt && (
                          <Label size="xs" className="text-green-400">In: {crew.checkedInAt}</Label>
                        )}
                      </Stack>
                      <Stack gap={2} className="items-end">
                        <Label className={`font-bold ${getStatusColor(crew.status)}`}>{crew.status}</Label>
                        {(crew.status === "Late" || crew.status === "No Show") && (
                          <Button variant="outline" size="sm">Contact</Button>
                        )}
                        {crew.status === "Not Due" && (
                          <Button variant="outline" size="sm">Check In</Button>
                        )}
                      </Stack>
                    </Grid>
                  </Card>
                ))}
              </Grid>
            </TabPanel>
          </Tabs>

          <Grid cols={4} gap={4}>
            <Button variant="outlineWhite">Manual Check-In</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Send Reminder</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Export Report</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/stage-management")}>Stage Management</Button>
          </Grid>
        </Stack>
      </Container>
    </UISection>
  );
}
