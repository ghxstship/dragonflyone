"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext, PlatformRole } from '@ghxstship/config';
import { 
  DetailPage, Badge, ProgressBar, StatusBadge, Button, H3, Body, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Stack, Card, StatCard, Grid, Section, SectionHeader} from "@ghxstship/ui";
import { useProjects } from "../../../hooks/useProjects";
import { useActionItems } from "../../../hooks/useActionItems";
import { useUserQuickLinkFavorites } from "../../../hooks/useQuickLinks";
import { useActivityFeed } from "@ghxstship/config/hooks";
import { QuickLinkFormSheet, useQuickLinkForm } from "@ghxstship/config/components";
import { ArrowRight, Link as LinkIcon, Zap, CalendarClock, Users, Trash2 } from "lucide-react";
import type { ActionItem } from "../../../hooks/useActionItems";

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
    borderColor: 'border-border',
    actionColor: 'text-text-secondary',
  },
};

// Display project interface for unified typing
import {
  DEMO_DISPLAY_PROJECTS,
  type DemoDisplayProject as DisplayProject,
} from '@/lib/demo-data';

const defaultKpis = [
  { label: "Active Projects", value: "12", trend: "+3", up: true },
  { label: "Total Revenue", value: "$8.4M", trend: "+18.2%", up: true },
  { label: "Resource Utilization", value: "87%", trend: "+4%", up: true },
  { label: "Client Satisfaction", value: "9.2/10", trend: "+0.3", up: true },
];

// Fallback activity data (used when hook returns no data)
const fallbackActivity = [
  { id: '1', action: "New deal closed", detail: "Rolling Loud Miami - $1.8M contract signed", time: "2 hours ago", user: "Jessica Park" },
  { id: '2', action: "Budget approved", detail: "Ultra 2025 - Additional $250K allocated for production", time: "5 hours ago", user: "Michael Chen" },
  { id: '3', action: "Project milestone reached", detail: "Art Basel - Final settlement completed", time: "1 day ago", user: "Elena Rodriguez" },
  { id: '4', action: "Asset checkout", detail: "Meyer Sound LEO System - checked out for III Points", time: "1 day ago", user: "David Kim" },
  { id: '5', action: "Invoice sent", detail: "Wynwood Life Nov - $45,000 invoice dispatched", time: "2 days ago", user: "Finance Team" },
];

// Roles that can view the executive dashboard (contains sensitive business data)
const VIEW_ROLES = [
  PlatformRole.ATLVS_SUPER_ADMIN,
  PlatformRole.ATLVS_ADMIN,
  PlatformRole.ATLVS_TEAM_MEMBER,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

export default function DashboardPage() {
  const router = useRouter();
  const { hasRole, user } = useAuthContext();
  const [timeRange, setTimeRange] = useState("month");
  
  // RBAC: Check if user can view dashboard
  const canViewDashboard = VIEW_ROLES.some(role => hasRole(role));
  
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects({ status: 'active' });
  const { data: actionItems, isLoading: actionItemsLoading } = useActionItems({ limit: 3 });
  const { data: quickLinks, isLoading: quickLinksLoading } = useUserQuickLinkFavorites(user?.id || '');
  const { data: activityData } = useActivityFeed({ limit: 5 });
  
  // Quick link form state
  const { isOpen: formOpen, currentHref, openForm, closeForm, hasForm } = useQuickLinkForm();

  const isLoading = projectsLoading;

  // Use live activity data or fallback
  const recentActivity = activityData || fallbackActivity;
  
  // Handle quick link click - open form if available, otherwise navigate
  const handleQuickLinkClick = (href: string) => {
    if (!openForm(href)) {
      router.push(href);
    }
  };

  // Use live projects or fall back to mock data
  const displayProjects: DisplayProject[] = (projects as unknown as DisplayProject[]) || DEMO_DISPLAY_PROJECTS;

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

  // RBAC: If user doesn't have permission, show unauthorized message
  if (!canViewDashboard) {
    return (
      <DetailPage
        header={{ title: "Executive Dashboard" }}
        backButton={{ label: "Back to Projects", href: "/projects" }}
      >
        <Stack gap={6} className="items-center justify-center py-20">
          <Card inverted className="max-w-md p-8 text-center">
            <Stack gap={4}>
              <H3 className="text-white">Access Denied</H3>
              <Body className="text-text-secondary">
                You do not have permission to view the executive dashboard.
                This requires ATLVS Team Member or higher role.
              </Body>
              <Body size="xs" className="text-text-disabled">
                Current user: {user?.email || 'Unknown'}
              </Body>
              <Button variant="solid" onClick={() => router.push('/projects')}>
                Go to Projects
              </Button>
            </Stack>
          </Card>
        </Stack>
      </DetailPage>
    );
  }

  return (
    <DetailPage
      header={{
        kicker: "ATLVS",
        title: "Executive Dashboard",
        description: "Real-time status of all projects across GHXSTSHIP verticals",
      }}
      loading={isLoading}
      error={projectsError instanceof Error ? projectsError : null}
      actions={
        <Stack direction="horizontal" gap={2}>
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
      }
    >
      <Stack gap={8}>
        <Grid cols={4} gap={6} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <StatCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              trend={kpi.up ? "up" : "down"}
              trendValue={kpi.trend}
              aria-label={`${kpi.label}: ${kpi.value}, ${kpi.up ? 'up' : 'down'} ${kpi.trend}`}
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
                    <Body size="xs" className="font-mono text-text-disabled">{project.id.substring(0, 12).toUpperCase()}</Body>
                  </TableCell>
                  <TableCell>{project.client_id || 'N/A'}</TableCell>
                  <TableCell>{project.manager_id || 'N/A'}</TableCell>
                  <TableCell className="font-mono text-white">
                    ${((project.budget || 0) / 1000).toFixed(0)}K
                  </TableCell>
                  <TableCell className="font-mono">
                    ${((project.actual_cost || 0) / 1000).toFixed(0)}K
                  </TableCell>
                  <TableCell>
                    <Body className={`font-mono ${(project.actual_cost || 0) > (project.budget || 0) ? "text-error" : "text-success"}`}>
                      {((((project.budget || 0) - (project.actual_cost || 0)) / (project.budget || 1)) * 100).toFixed(1)}%
                    </Body>
                  </TableCell>
                  <TableCell>
                    <Stack gap={1}>
                      <ProgressBar value={project.progress || 0} variant="inverse" size="sm" className="w-24" />
                      <Body size="xs" className="font-mono text-text-secondary">{project.progress}%</Body>
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
              <Card key={activity.id} inverted className="border-2 border-border p-5 transition-colors hover:border-border" role="article" aria-label={`${activity.action}: ${activity.detail}`}>
                <Stack gap={1}>
                  <H3 className="text-white">{activity.action}</H3>
                  <Body size="sm" className="text-text-secondary">{activity.detail}</Body>
                  <Body size="xs" className="mt-2 font-mono uppercase tracking-kicker text-text-disabled">
                    {activity.user} • {activity.time}
                  </Body>
                </Stack>
              </Card>
            ))}
          </Stack>
        </Section>

        <Grid cols={2} gap={6} className="grid-cols-1 lg:grid-cols-2">
          <Section border>
            <SectionHeader 
              kicker="Favorites" 
              title="Quick Links"
            />
            <Stack gap={3}>
              {quickLinksLoading ? (
                <Card inverted className="border-2 border-border p-4">
                  <Body className="text-text-secondary">Loading quick links...</Body>
                </Card>
              ) : quickLinks && quickLinks.length > 0 ? (
                quickLinks.slice(0, 4).map((favorite) => {
                  const link = favorite.quick_link;
                  if (!link) return null;
                  return (
                    <Button
                      key={favorite.id}
                      variant="outline"
                      fullWidth
                      className="justify-start text-left"
                      onClick={() => handleQuickLinkClick(link.href)}
                      icon={hasForm(link.href) ? <Zap className="size-4" /> : <LinkIcon className="size-4" />}
                      iconPosition="left"
                    >
                      {link.name}
                    </Button>
                  );
                })
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    fullWidth
                    className="justify-start text-left"
                    onClick={() => handleQuickLinkClick('/projects/new')}
                    icon={<Zap className="size-4" />}
                    iconPosition="left"
                  >
                    Create New Project
                  </Button>
                  <Button 
                    variant="outline" 
                    fullWidth
                    className="justify-start text-left"
                    onClick={() => handleQuickLinkClick('/expenses/new')}
                    icon={<Zap className="size-4" />}
                    iconPosition="left"
                  >
                    Submit Expense Report
                  </Button>
                  <Button 
                    variant="outline" 
                    fullWidth
                    className="justify-start text-left"
                    onClick={() => handleQuickLinkClick('/assets/availability')}
                    icon={<LinkIcon className="size-4" />}
                    iconPosition="left"
                  >
                    Check Asset Availability
                  </Button>
                  <Button 
                    variant="outline" 
                    fullWidth
                    className="justify-start text-left"
                    onClick={() => handleQuickLinkClick('/reports/financial/new')}
                    icon={<LinkIcon className="size-4" />}
                    iconPosition="left"
                  >
                    Generate Financial Report
                  </Button>
                </>
              )}
              
              {/* View All Links Button */}
              <Button
                variant="outline"
                fullWidth
                onClick={() => router.push('/quick-links')}
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
                <Card inverted className="border-2 border-border p-4">
                  <Body className="text-text-secondary">Loading action items...</Body>
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
                          <Body size="sm" className=" text-white">{item.title}</Body>
                          {item.due_date && (
                            <Body size="xs" className="font-mono text-text-disabled">
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
                              router.push(`/action-items?id=${item.id}`);
                            } else if (quadrant === 'schedule') {
                              router.push(`/schedule?task=${item.id}`);
                            } else if (quadrant === 'delegate') {
                              router.push(`/action-items?delegate=${item.id}`);
                            } else {
                              router.push(`/action-items?archive=${item.id}`);
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
                <Card inverted className="border-2 border-border p-4">
                  <Body className="text-text-secondary">No pending action items</Body>
                </Card>
              )}
              
              {/* View All Action Items Button */}
              <Button
                variant="outline"
                fullWidth
                onClick={() => router.push('/action-items')}
                icon={<ArrowRight className="size-4" />}
                iconPosition="right"
              >
                View All Action Items
              </Button>
            </Stack>
          </Section>
          </Grid>
      </Stack>
      
      {/* Quick Link Form Sheet */}
      {currentHref && (
        <QuickLinkFormSheet
          href={currentHref}
          open={formOpen}
          onClose={closeForm}
        />
      )}
    </DetailPage>
  );
}
