"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { CompvssAppLayout } from "../../components/app-layout";
import {
  Container,
  Body,
  Grid,
  Stack,
  StatCard,
  Button,
  Card,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  Badge,
  Input,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";
import { useShowCallCrew } from '../../hooks/useShowCall';


export default function ShowCallPage() {
  const router = useRouter();
  const { data: showCallCrew = [] } = useShowCallCrew();
  
  // URL-synced tab state for deep-linking support
  const { activeTab, setActiveTab, isActive } = useTabState({
    defaultTab: 'all',
    validTabs: ['all', 'present', 'missing', 'pending'],
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const checkedInCount = showCallCrew.filter(c => c.status === "Checked In" || c.status === "On Site").length;
  const lateCount = showCallCrew.filter(c => c.status === "Late").length;
  const noShowCount = showCallCrew.filter(c => c.status === "No Show").length;
  const notDueCount = showCallCrew.filter(c => c.status === "Not Due").length;

  const filteredCrew = showCallCrew.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.role.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "present") return matchesSearch && (c.status === "Checked In" || c.status === "On Site");
    if (activeTab === "missing") return matchesSearch && (c.status === "Late" || c.status === "No Show");
    if (activeTab === "pending") return matchesSearch && c.status === "Not Due";
    return matchesSearch;
  });

  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'ghost' => {
    switch (status) {
      case "Checked In": case "On Site": return "success";
      case "Late": return "warning";
      case "No Show": return "error";
      case "Not Due": return "ghost";
      default: return "ghost";
    }
  };

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Show Call Status"
        subtitle="Real-time crew check-in and attendance tracking"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>
            <Stack direction="horizontal" className="items-start justify-between">
              <Card className="p-4">
                <Stack gap={1} className="text-center">
                  <Body size="sm" className="">Current Time</Body>
                  <Body className="text-h5-md">
                    {currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </Body>
                </Stack>
              </Card>
            </Stack>

            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard value={checkedInCount.toString()} label="Checked In" />
              <StatCard value={lateCount.toString()} label="Late" />
              <StatCard value={noShowCount.toString()} label="No Show" />
              <StatCard value={notDueCount.toString()} label="Not Due Yet" />
            </Grid>

            <Card className="p-4">
              <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
                <Stack gap={1} className="text-center">
                  <Body className="text-h4-md font-display">{checkedInCount}</Body>
                  <Body size="sm" className="">Present</Body>
                </Stack>
                <Stack gap={1} className="text-center">
                  <Body className="text-h4-md font-display">{lateCount}</Body>
                  <Body size="sm" className="">Late</Body>
                </Stack>
                <Stack gap={1} className="text-center">
                  <Body className="text-h4-md font-display">{noShowCount}</Body>
                  <Body size="sm" className="">Missing</Body>
                </Stack>
                <Stack gap={1} className="text-center">
                  <Body className="text-h4-md font-display">{showCallCrew.length}</Body>
                  <Body size="sm" className="">Total Crew</Body>
                </Stack>
              </Grid>
            </Card>

            <Input type="search" placeholder="Search crew..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

            <Tabs>
              <TabsList>
                <Tab active={isActive('all')} onClick={() => setActiveTab('all')}>All ({showCallCrew.length})</Tab>
                <Tab active={isActive('present')} onClick={() => setActiveTab('present')}>Present ({checkedInCount})</Tab>
                <Tab active={isActive('missing')} onClick={() => setActiveTab('missing')}>Missing ({lateCount + noShowCount})</Tab>
                <Tab active={isActive('pending')} onClick={() => setActiveTab('pending')}>Pending ({notDueCount})</Tab>
              </TabsList>

              <TabPanel active={true}>
                <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                  {filteredCrew.map((crew) => (
                    <Card key={crew.id} className="p-4">
                      <Grid cols={3} gap={4} className="items-center">
                        <Stack gap={1}>
                          <Body className="font-display">{crew.name}</Body>
                          <Body size="sm" className="">{crew.role}</Body>
                          <Badge variant="outline">{crew.department}</Badge>
                        </Stack>
                        <Stack gap={1} className="text-center">
                          <Body size="sm" className="">Call Time</Body>
                          <Body>{crew.callTime}</Body>
                          {crew.checkedInAt && (
                            <Body size="sm" className="">In: {crew.checkedInAt}</Body>
                          )}
                        </Stack>
                        <Stack gap={2} className="items-end">
                          <Badge variant={getStatusVariant(crew.status)}>{crew.status}</Badge>
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

            <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
              <Button variant="solid">Manual Check-In</Button>
              <Button variant="outline">Send Reminder</Button>
              <Button variant="outline">Export Report</Button>
              <Button variant="outline" onClick={() => router.push("/stage-management")}>Stage Management</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>
    </CompvssAppLayout>
  );
}
