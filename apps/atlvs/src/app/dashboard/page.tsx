"use client";

import { useState } from "react";
import { Navigation } from "../../components/navigation";
import { Section, SectionHeader } from "../../components/section";
import { Badge, ProgressBar, StatusBadge, Button, H1, H2, H3, Body, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Container, Stack, Card, StatCard, LoadingSpinner, Grid } from "@ghxstship/ui";
import { useProjects } from "../../hooks/useProjects";

const mockProjects = [
  {
    id: "PRJ-2024-001",
    name: "Ultra Music Festival 2025",
    client: "Ultra Worldwide",
    status: "In Progress",
    budget: 2500000,
    actual: 1847520,
    variance: -26,
    health: "On Track",
    pm: "Sarah Martinez",
    startDate: "2024-10-01",
    endDate: "2025-03-30",
    progress: 68,
  },
  {
    id: "PRJ-2024-002",
    name: "Formula 1 Miami GP",
    client: "Formula One Group",
    status: "Planning",
    budget: 3200000,
    actual: 456000,
    variance: 14,
    health: "At Risk",
    pm: "Michael Chen",
    startDate: "2024-11-15",
    endDate: "2025-05-04",
    progress: 35,
  },
  {
    id: "PRJ-2024-003",
    name: "Art Basel Miami Beach",
    client: "MCH Group",
    status: "Completed",
    budget: 950000,
    actual: 925400,
    variance: 2.6,
    health: "Completed",
    pm: "Elena Rodriguez",
    startDate: "2024-08-01",
    endDate: "2024-12-08",
    progress: 100,
  },
];

const kpis = [
  { label: "Active Projects", value: "12", trend: "+3", up: true },
  { label: "Total Revenue", value: "$8.4M", trend: "+18.2%", up: true },
  { label: "Resource Utilization", value: "87%", trend: "+4%", up: true },
  { label: "Client Satisfaction", value: "9.2/10", trend: "+0.3", up: true },
];

const recentActivity = [
  { id: 1, action: "New deal closed", detail: "Rolling Loud Miami - $1.8M contract signed", time: "2 hours ago", user: "Jessica Park" },
  { id: 2, action: "Budget approved", detail: "Ultra 2025 - Additional $250K allocated for production", time: "5 hours ago", user: "Michael Chen" },
  { id: 3, action: "Project milestone reached", detail: "Art Basel - Final settlement completed", time: "1 day ago", user: "Elena Rodriguez" },
  { id: 4, action: "Asset checkout", detail: "Meyer Sound LEO System - checked out for III Points", time: "1 day ago", user: "David Kim" },
  { id: 5, action: "Invoice sent", detail: "Wynwood Life Nov - $45,000 invoice dispatched", time: "2 days ago", user: "Finance Team" },
];

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("month");
  const { data: projects, isLoading } = useProjects({ status: 'active' });

  // Use live projects or fall back to mock data
  const displayProjects = projects || mockProjects;

  // Calculate KPIs from real data
  const kpisData = projects ? {
    activeProjects: projects.length,
    totalRevenue: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
    utilization: 87, // Would come from a separate query
    satisfaction: 9.2 // Would come from feedback system
  } : null;

  const kpis = kpisData ? [
    { label: "Active Projects", value: kpisData.activeProjects.toString(), trend: "+3", up: true },
    { label: "Total Revenue", value: `$${(kpisData.totalRevenue / 1000000).toFixed(1)}M`, trend: "+18.2%", up: true },
    { label: "Resource Utilization", value: `${kpisData.utilization}%`, trend: "+4%", up: true },
    { label: "Client Satisfaction", value: `${kpisData.satisfaction}/10`, trend: "+0.3", up: true },
  ] : [
    { label: "Active Projects", value: "12", trend: "+3", up: true },
    { label: "Total Revenue", value: "$8.4M", trend: "+18.2%", up: true },
    { label: "Resource Utilization", value: "87%", trend: "+4%", up: true },
    { label: "Client Satisfaction", value: "9.2/10", trend: "+0.3", up: true },
  ];

  if (isLoading) {
    return (
      <Section className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </Container>
      </Section>
    );
  }

  return (
    <Section className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />

      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={6} direction="horizontal" className="flex-col md:flex-row md:items-center md:justify-between">
            <Stack gap={2}>
              <H1>Executive Dashboard</H1>
              <Body className="text-ink-400 font-mono text-sm uppercase tracking-wider">
                Real-time operations command center
              </Body>
            </Stack>
            <Stack direction="horizontal" gap={3}>
              <Button
                onClick={() => setTimeRange("week")}
                variant={timeRange === "week" ? "solid" : "outline"}
                size="sm"
              >
                Week
              </Button>
              <Button
                onClick={() => setTimeRange("month")}
                variant={timeRange === "month" ? "solid" : "outline"}
                size="sm"
              >
                Month
              </Button>
              <Button
                onClick={() => setTimeRange("quarter")}
                variant={timeRange === "quarter" ? "solid" : "outline"}
                size="sm"
              >
                Quarter
              </Button>
            </Stack>
          </Stack>

        <Section border={false} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <StatCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              trend={kpi.up ? "up" : "down"}
              trendValue={kpi.trend}
              className="bg-transparent border-2 border-ink-800"
            />
          ))}
        </Section>

        <Section border>
          <SectionHeader
            kicker="Portfolio Overview"
            title="Active Projects"
            description="Real-time status of all projects across GHXSTSHIP verticals"
          />
          <Table variant="bordered" className="bg-ink-900">
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>PM</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Actual</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Health</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayProjects.map((project) => (
                <TableRow key={project.id} className="hover:bg-ink-900/30">
                  <TableCell>
                    <H3 className="text-white">{project.name}</H3>
                    <Body size="xs" className="font-mono text-ink-500">{project.id.substring(0, 12).toUpperCase()}</Body>
                  </TableCell>
                  <TableCell className="text-ink-300">{(project as any).client_id || (project as any).client || 'N/A'}</TableCell>
                  <TableCell className="text-ink-300">{(project as any).manager_id || (project as any).pm || 'N/A'}</TableCell>
                  <TableCell className="font-mono text-white">
                    ${((project.budget || 0) / 1000).toFixed(0)}K
                  </TableCell>
                  <TableCell className="font-mono text-ink-300">
                    ${(((project as any).actual_cost || (project as any).actual || 0) / 1000).toFixed(0)}K
                  </TableCell>
                  <TableCell>
                    <Body className={`font-mono ${((project as any).actual_cost || (project as any).actual || 0) > (project.budget || 0) ? "text-error-400" : "text-success-400"}`}>
                      {((((project.budget || 0) - ((project as any).actual_cost || (project as any).actual || 0)) / (project.budget || 1)) * 100).toFixed(1)}%
                    </Body>
                  </TableCell>
                  <TableCell>
                    <Stack gap={1}>
                      <ProgressBar value={project.progress || 0} variant="inverse" size="sm" className="w-24" />
                      <Body size="xs" className="font-mono text-grey-400">{project.progress}%</Body>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Badge variant="solid">
                      {project.health}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Section>

        <Section border>
          <SectionHeader
            kicker="Activity Feed"
            title="Recent Activity"
            description="Latest updates across all business operations"
          />
          <Stack gap={3}>
            {recentActivity.map((activity) => (
              <Card key={activity.id} className="border-2 border-ink-800 p-5 hover:border-ink-600 transition-colors">
                <Stack gap={1}>
                  <H3 className="text-white">{activity.action}</H3>
                  <Body size="sm" className="text-ink-300">{activity.detail}</Body>
                  <Body size="xs" className="font-mono text-ink-500 uppercase tracking-wider mt-2">
                    {activity.user} • {activity.time}
                  </Body>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Section>

        <Grid cols={2} gap={6}>
          <Section border>
            <SectionHeader kicker="Quick Actions" title="Common Tasks" />
            <Stack gap={3}>
              <Button 
                variant="outlineWhite" 
                className="w-full justify-start text-left"
                onClick={() => window.location.href = '/projects'}
              >
                Create New Project
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-left border-grey-700 text-grey-400 hover:border-white hover:text-white"
                onClick={() => window.location.href = '/finance'}
              >
                Submit Expense Report
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-left border-grey-700 text-grey-400 hover:border-white hover:text-white"
                onClick={() => window.location.href = '/assets'}
              >
                Check Asset Availability
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start text-left border-grey-700 text-grey-400 hover:border-white hover:text-white"
                onClick={() => window.location.href = '/reports'}
              >
                Generate Financial Report
              </Button>
            </Stack>
          </Section>

          <Section border>
            <SectionHeader kicker="Alerts" title="Action Items" />
            <Stack gap={3}>
              <Card className="border-2 border-black p-4">
                <StatusBadge status="error" size="sm" className="mb-2">High Priority</StatusBadge>
                <Body className="mt-2 text-sm text-white">Budget approval needed for F1 Miami GP expansion</Body>
              </Card>
              <Card className="border-2 border-grey-700 p-4">
                <StatusBadge status="warning" size="sm" className="mb-2">Medium Priority</StatusBadge>
                <Body className="mt-2 text-sm text-white">3 asset maintenance schedules due this week</Body>
              </Card>
              <Card className="border-2 border-ink-700 p-4">
                <Body className="font-mono text-xs uppercase tracking-wider text-ink-400">Info</Body>
                <Body className="mt-2 text-sm text-ink-200">Monthly financial reports ready for review</Body>
              </Card>
            </Stack>
          </Section>
        </Grid>
        </Stack>
      </Container>
    </Section>
  );
}
