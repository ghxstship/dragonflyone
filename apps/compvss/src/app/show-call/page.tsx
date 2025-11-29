"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
  Container,
  Body,
  Grid,
  Stack,
  StatCard,
  Button,
  Section,
  Card,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  Badge,
  Input,
  PageLayout,
  SectionHeader,
  EnterprisePageHeader,
  MainContent,} from "@ghxstship/ui";

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
      case "Checked In": case "On Site": return "text-success-400";
      case "Late": return "text-warning-400";
      case "No Show": return "text-error-400";
      case "Not Due": return "text-ink-400";
      default: return "text-ink-400";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "Checked In": case "On Site": return "border-success-800 bg-success-900/10";
      case "Late": return "border-warning-800 bg-warning-900/10";
      case "No Show": return "border-error-800 bg-error-900/10";
      default: return "border-ink-800 bg-ink-900/50";
    }
  };

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <Stack direction="horizontal" className="items-start justify-between">
              <EnterprisePageHeader
        title="Show Call Status"
        subtitle="Real-time crew check-in and attendance tracking"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Show Call' }]}
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
              <StatCard value={checkedInCount.toString()} label="Checked In" />
              <StatCard value={lateCount.toString()} label="Late" />
              <StatCard value={noShowCount.toString()} label="No Show" />
              <StatCard value={notDueCount.toString()} label="Not Due Yet" />
            </Grid>

            <Card className="p-4">
              <Grid cols={4} gap={4}>
                <Stack gap={1} className="text-center">
                  <Body className="text-h4-md font-display">{checkedInCount}</Body>
                  <Body className="text-body-sm">Present</Body>
                </Stack>
                <Stack gap={1} className="text-center">
                  <Body className="text-h4-md font-display">{lateCount}</Body>
                  <Body className="text-body-sm">Late</Body>
                </Stack>
                <Stack gap={1} className="text-center">
                  <Body className="text-h4-md font-display">{noShowCount}</Body>
                  <Body className="text-body-sm">Missing</Body>
                </Stack>
                <Stack gap={1} className="text-center">
                  <Body className="text-h4-md font-display">{mockCrew.length}</Body>
                  <Body className="text-body-sm">Total Crew</Body>
                </Stack>
              </Grid>
            </Card>

            <Input type="search" placeholder="Search crew..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

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
                    <Card key={crew.id} className="p-4">
                      <Grid cols={3} gap={4} className="items-center">
                        <Stack gap={1}>
                          <Body className="font-display">{crew.name}</Body>
                          <Body className="text-body-sm">{crew.role}</Body>
                          <Badge variant="outline">{crew.department}</Badge>
                        </Stack>
                        <Stack gap={1} className="text-center">
                          <Body className="text-body-sm">Call Time</Body>
                          <Body>{crew.callTime}</Body>
                          {crew.checkedInAt && (
                            <Body className="text-body-sm">In: {crew.checkedInAt}</Body>
                          )}
                        </Stack>
                        <Stack gap={2} className="items-end">
                          <Badge variant={crew.status === "Checked In" || crew.status === "On Site" ? "solid" : "outline"}>{crew.status}</Badge>
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
              <Button variant="solid">Manual Check-In</Button>
              <Button variant="outline">Send Reminder</Button>
              <Button variant="outline">Export Report</Button>
              <Button variant="outline" onClick={() => router.push("/stage-management")}>Stage Management</Button>
            </Grid>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
