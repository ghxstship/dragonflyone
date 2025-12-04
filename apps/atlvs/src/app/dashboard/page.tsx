"use client";

import { useState } from "react";
import { AtlvsAppLayout, AtlvsLoadingLayout } from "../../components/app-layout";
import { 
  Badge, 
  ProgressBar, 
  StatusBadge, 
  Button, 
  H3, 
  Body, 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell, 
  Stack, 
  Card, 
  StatCard, 
  Grid,
  Section,
  SectionHeader,
  EnterprisePageHeader,
} from "@ghxstship/ui";
import { useProjects } from "../../hooks/useProjects";
import { useActionItems } from "../../hooks/useActionItems";
import { useUserQuickLinkFavorites } from "../../hooks/useQuickLinks";
import { ArrowRight, Star, Link as LinkIcon, Zap, CalendarClock, Users, Trash2 } from "lucide-react";
import type { ActionItem } from "../../hooks/useActionItems";

// Eisenhower Matrix classification
type EisenhowerQuadrant = 'do-first' | 'schedule' | 'delegate' | 'eliminate';

function getEisenhowerQuadrant(item: ActionItem): EisenhowerQuadrant {
  const isUrgent = (() => {
    if (!item.due_date) return false;
    const daysUntilDue = Math.ceil(
      (new Date(item.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilDue <= 3; // Urgent if due within 3 days
  })();
  
  const isImportant = item.priority === 'critical' || item.priority === 'high';
  
  if (isUrgent && isImportant) return 'do-first';
  if (!isUrgent && isImportant) return 'schedule';
  if (isUrgent && !isImportant) return 'delegate';
  return 'eliminate';
}

const eisenhowerConfig: Record<EisenhowerQuadrant, {
  label: string;
  action: string;
  icon: React.ComponentType<{ className?: string }>;
  borderColor: string;
  actionColor: string;
}> = {
  'do-first': {
    label: 'Do First',
    action: 'Do Now',
    icon: Zap,
    borderColor: 'border-error',
    actionColor: 'text-error',
  },
  'schedule': {
    label: 'Schedule',
    action: 'Schedule',
    icon: CalendarClock,
    borderColor: 'border-warning',
    actionColor: 'text-warning',
  },
  'delegate': {
    label: 'Delegate',
    action: 'Delegate',
    icon: Users,
    borderColor: 'border-info',
    actionColor: 'text-info',
  },
  'eliminate': {
    label: 'Eliminate',
    action: 'Remove',
    icon: Trash2,
    borderColor: 'border-grey-600',
    actionColor: 'text-grey-400',
  },
};

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

const defaultKpis = [
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
  const { data: projects, isLoading: projectsLoading } = useProjects({ status: 'active' });
  const { data: actionItems, isLoading: actionItemsLoading } = useActionItems({ limit: 3 });
  const { data: quickLinks, isLoading: quickLinksLoading } = useUserQuickLinkFavorites('demo-user');

  const isLoading = projectsLoading;

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
  ] : defaultKpis;

  if (isLoading) {
    return <AtlvsLoadingLayout text="Loading dashboard..." />;
  }

  return (
    <AtlvsAppLayout>
      <Stack gap={10}>
        <EnterprisePageHeader
          title="Executive Dashboard"
          subtitle="Real-time operations command center"
          showFavorite
          showSettings
          rightContent={
            <Stack direction="horizontal" gap={2}>
              <Button
                onClick={() => setTimeRange("week")}
                variant={timeRange === "week" ? "solid" : "outlineWhite"}
                size="sm"
              >
                Week
              </Button>
              <Button
                onClick={() => setTimeRange("month")}
                variant={timeRange === "month" ? "solid" : "outlineWhite"}
                size="sm"
              >
                Month
              </Button>
              <Button
                onClick={() => setTimeRange("quarter")}
                variant={timeRange === "quarter" ? "solid" : "outlineWhite"}
                size="sm"
              >
                Quarter
              </Button>
            </Stack>
          }
        />

        <Grid cols={4} gap={6}>
          {kpis.map((kpi) => (
            <StatCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              trend={kpi.up ? "up" : "down"}
              trendValue={kpi.trend}
            />
          ))}
        </Grid>

        <Section border>
          <SectionHeader
            kicker="Portfolio Overview"
            title="Active Projects"
            description="Real-time status of all projects across GHXSTSHIP verticals"
          />
          <Table variant="dark">
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
                <TableRow key={project.id}>
                  <TableCell>
                    <H3 className="text-white">{project.name}</H3>
                    <Body size="xs" className="font-mono text-grey-500">{project.id.substring(0, 12).toUpperCase()}</Body>
                  </TableCell>
                  <TableCell>{(project as any).client_id || (project as any).client || 'N/A'}</TableCell>
                  <TableCell>{(project as any).manager_id || (project as any).pm || 'N/A'}</TableCell>
                  <TableCell className="font-mono text-white">
                    ${((project.budget || 0) / 1000).toFixed(0)}K
                  </TableCell>
                  <TableCell className="font-mono">
                    ${(((project as any).actual_cost || (project as any).actual || 0) / 1000).toFixed(0)}K
                  </TableCell>
                  <TableCell>
                    <Body className={`font-mono ${((project as any).actual_cost || (project as any).actual || 0) > (project.budget || 0) ? "text-error" : "text-success"}`}>
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
              <Card key={activity.id} inverted className="border-2 border-grey-700 p-5 transition-colors hover:border-grey-500">
                <Stack gap={1}>
                  <H3 className="text-white">{activity.action}</H3>
                  <Body size="sm" className="text-grey-300">{activity.detail}</Body>
                  <Body size="xs" className="mt-2 font-mono uppercase tracking-kicker text-grey-500">
                    {activity.user} • {activity.time}
                  </Body>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Section>

        <Grid cols={2} gap={6}>
          <Section border>
            <SectionHeader 
              kicker="Favorites" 
              title="Quick Links" 
              icon={<Star className="size-4 fill-warning text-warning" />}
            />
            <Stack gap={3}>
              {quickLinksLoading ? (
                <Card inverted className="border-2 border-grey-700 p-4">
                  <Body className="text-grey-400">Loading quick links...</Body>
                </Card>
              ) : quickLinks && quickLinks.length > 0 ? (
                quickLinks.slice(0, 4).map((favorite) => {
                  const link = favorite.quick_link;
                  if (!link) return null;
                  return (
                    <Button
                      key={favorite.id}
                      variant="outlineWhite"
                      fullWidth
                      className="justify-start text-left"
                      onClick={() => window.location.href = link.href}
                      icon={<LinkIcon className="size-4" />}
                      iconPosition="left"
                    >
                      {link.name}
                    </Button>
                  );
                })
              ) : (
                <>
                  <Button 
                    variant="outlineWhite" 
                    fullWidth
                    className="justify-start text-left"
                    onClick={() => window.location.href = '/projects/new'}
                    icon={<LinkIcon className="size-4" />}
                    iconPosition="left"
                  >
                    Create New Project
                  </Button>
                  <Button 
                    variant="outlineWhite" 
                    fullWidth
                    className="justify-start text-left"
                    onClick={() => window.location.href = '/expenses/new'}
                    icon={<LinkIcon className="size-4" />}
                    iconPosition="left"
                  >
                    Submit Expense Report
                  </Button>
                  <Button 
                    variant="outlineWhite" 
                    fullWidth
                    className="justify-start text-left"
                    onClick={() => window.location.href = '/assets/availability'}
                    icon={<LinkIcon className="size-4" />}
                    iconPosition="left"
                  >
                    Check Asset Availability
                  </Button>
                  <Button 
                    variant="outlineWhite" 
                    fullWidth
                    className="justify-start text-left"
                    onClick={() => window.location.href = '/reports/financial/new'}
                    icon={<LinkIcon className="size-4" />}
                    iconPosition="left"
                  >
                    Generate Financial Report
                  </Button>
                </>
              )}
              
              {/* View All Links Button */}
              <Button
                variant="outlineWhite"
                fullWidth
                onClick={() => window.location.href = '/quick-links'}
                icon={<ArrowRight className="size-4" />}
                iconPosition="right"
              >
                View All Links
              </Button>
            </Stack>
          </Section>

          <Section border>
            <SectionHeader kicker="Eisenhower Matrix" title="Action Items" />
            <Stack gap={3}>
              {actionItemsLoading ? (
                <Card inverted className="border-2 border-grey-700 p-4">
                  <Body className="text-grey-400">Loading action items...</Body>
                </Card>
              ) : actionItems && actionItems.length > 0 ? (
                actionItems.map((item) => {
                  const quadrant = getEisenhowerQuadrant(item);
                  const config = eisenhowerConfig[quadrant];
                  const IconComponent = config.icon;
                  
                  return (
                    <Card 
                      key={`${item.source}-${item.id}`} 
                      inverted 
                      className={`border-2 p-4 ${config.borderColor}`}
                    >
                      <Stack gap={3} direction="horizontal" className="items-start justify-between">
                        <Stack gap={2} className="flex-1">
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Badge variant="outline" className={config.actionColor}>
                              {config.label}
                            </Badge>
                            <StatusBadge 
                              status={item.priority === 'critical' ? 'error' : item.priority === 'high' ? 'warning' : 'info'} 
                              size="sm"
                            >
                              {item.priority === 'critical' ? 'Critical' : item.priority === 'high' ? 'High' : 'Medium'}
                            </StatusBadge>
                          </Stack>
                          <Body className="text-body-sm text-white">{item.title}</Body>
                          {item.due_date && (
                            <Body size="xs" className="font-mono text-grey-500">
                              Due: {new Date(item.due_date).toLocaleDateString()}
                            </Body>
                          )}
                        </Stack>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={config.actionColor}
                          onClick={() => {
                            // Route based on quadrant action
                            if (quadrant === 'do-first') {
                              window.location.href = `/action-items?id=${item.id}`;
                            } else if (quadrant === 'schedule') {
                              window.location.href = `/schedule?task=${item.id}`;
                            } else if (quadrant === 'delegate') {
                              window.location.href = `/action-items?delegate=${item.id}`;
                            } else {
                              window.location.href = `/action-items?archive=${item.id}`;
                            }
                          }}
                          icon={<IconComponent className="size-4" />}
                          iconPosition="left"
                        >
                          {config.action}
                        </Button>
                      </Stack>
                    </Card>
                  );
                })
              ) : (
                <Card inverted className="border-2 border-grey-700 p-4">
                  <Body className="text-grey-400">No pending action items</Body>
                </Card>
              )}
              
              {/* View All Action Items Button */}
              <Button
                variant="outlineWhite"
                fullWidth
                onClick={() => window.location.href = '/action-items'}
                icon={<ArrowRight className="size-4" />}
                iconPosition="right"
              >
                View All Action Items
              </Button>
            </Stack>
          </Section>
          </Grid>
      </Stack>
    </AtlvsAppLayout>
  );
}
