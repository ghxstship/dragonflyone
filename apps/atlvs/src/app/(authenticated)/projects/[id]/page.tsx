"use client";

/**
 * Project Detail Page
 * Shows detailed information about a specific project
 * Uses normalized DetailPage template from @ghxstship/ui
 */

import { useRouter, notFound } from "next/navigation";
import {
  Pencil, Users, FileText, DollarSign, Target, Download} from "lucide-react";
import { useAuthContext, ATLVS_ADMIN_ROLES } from "@ghxstship/config";
import {
  Badge, Body, Button, Card, DetailPage, Grid, StatCard, Section, SectionHeader, ProgressBar, useNotifications} from "@ghxstship/ui";
import { useProjectDetailData } from "@/hooks/useProjectDetail";

const STATUS_COLORS: Record<string, "success" | "warning" | "error" | "info" | "outline"> = {
  "On Track": "success",
  "At Risk": "warning",
  "Off Track": "error",
  active: "success",
  completed: "info",
  cancelled: "error",
};

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const { addNotification } = useNotifications();
  const {
    project,
    isLoading,
    error,
    isNotFound,
    generateReport,
    refetch,
  } = useProjectDetailData(params.id);

  const canManageProject = ATLVS_ADMIN_ROLES.some((role) => hasRole(role));

  if (isNotFound) {
    notFound();
  }

  const handleGenerateReport = async () => {
    try {
      const blob = await generateReport();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `project-${params.id}-report.pdf`;
      a.click();
      addNotification({ type: "success", title: "Success", message: "Report generated" });
    } catch {
      addNotification({ type: "error", title: "Error", message: "Failed to generate report" });
    }
  };

  const budget = project?.budget || 0;
  const actual = project?.actual_cost || 0;
  const variance = budget > 0 ? Math.round(((actual - budget) / budget) * 100) : 0;
  const progress = project?.progress || 0;
  const health = project?.health || (variance > 10 ? "At Risk" : "On Track");

  const milestones = [
    { id: 1, name: "Contract Signed", date: "2024-10-01", status: "Completed", progress: 100 },
    { id: 2, name: "Venue Secured", date: "2024-10-15", status: "Completed", progress: 100 },
    { id: 3, name: "Artist Lineup Confirmed", date: "2024-11-30", status: "Completed", progress: 100 },
    { id: 4, name: "Production Design", date: "2024-12-15", status: "In Progress", progress: 75 },
    { id: 5, name: "Technical Rehearsals", date: "2025-03-15", status: "Pending", progress: 0 },
    { id: 6, name: "Event Execution", date: "2025-03-28", status: "Pending", progress: 0 },
  ];

  const team = [
    { name: "Sarah Martinez", role: "Project Manager", department: "Production" },
    { name: "Michael Chen", role: "Technical Director", department: "Technical" },
    { name: "Elena Rodriguez", role: "Lighting Designer", department: "Lighting" },
    { name: "David Kim", role: "Video Director", department: "Video" },
  ];

  // Define tabs for the detail page
  const tabs: DetailPageTab[] = [
    {
      id: "overview",
      label: "Overview",
      content: project ? (
        <>
          {/* Stats */}
          <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4 mb-6">
            <StatCard label="Budget" value={`$${(budget / 1000).toFixed(0)}K`} />
            <StatCard label="Actual" value={`$${(actual / 1000).toFixed(0)}K`} />
            <StatCard 
              label="Variance" 
              value={`${variance > 0 ? "+" : ""}${variance}%`}
            />
            <StatCard label="Progress" value={`${progress}%`} />
          </Grid>

          {/* Project Details */}
          <Section border className="mb-6">
            <SectionHeader title="Project Details" />
            <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
              <Card inverted className="p-4">
                <Body size="xs" className="text-grey-400 mb-1">Venue</Body>
                <Body className="text-white">{project.venue || "Not specified"}</Body>
              </Card>
              <Card inverted className="p-4">
                <Body size="xs" className="text-grey-400 mb-1">Expected Attendees</Body>
                <Body className="text-white">{(project.expected_attendees || 0).toLocaleString()}</Body>
              </Card>
              <Card inverted className="p-4">
                <Body size="xs" className="text-grey-400 mb-1">Start Date</Body>
                <Body className="text-white">{project.start_date || "TBD"}</Body>
              </Card>
              <Card inverted className="p-4">
                <Body size="xs" className="text-grey-400 mb-1">End Date</Body>
                <Body className="text-white">{project.end_date || "TBD"}</Body>
              </Card>
            </Grid>
          </Section>

          {/* Description */}
          {project.description && (
            <Section border className="mb-6">
              <SectionHeader title="Description" />
              <Card inverted className="p-4">
                <Body className="text-white whitespace-pre-wrap">{project.description}</Body>
              </Card>
            </Section>
          )}

          {/* Overall Progress */}
          <Section border>
            <SectionHeader title="Overall Progress" />
            <Card inverted className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Body className="text-white">Completion</Body>
                <Body className="text-white font-weight-bold">{progress}%</Body>
              </div>
              <ProgressBar value={progress} variant="inverse" />
            </Card>
          </Section>
        </>
      ) : null,
    },
    {
      id: "milestones",
      label: "Milestones",
      icon: <Target className="size-4" />,
      content: (
        <Section border>
          <SectionHeader title="Project Milestones" />
          <div className="space-y-4">
            {milestones.map((milestone) => (
              <Card key={milestone.id} inverted className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <Body className="text-white font-weight-medium">{milestone.name}</Body>
                    <Body size="xs" className="text-grey-400">{milestone.date}</Body>
                  </div>
                  <Badge variant={milestone.status === "Completed" ? "success" : milestone.status === "In Progress" ? "warning" : "outline"}>
                    {milestone.status}
                  </Badge>
                </div>
                <ProgressBar value={milestone.progress} variant="inverse" />
              </Card>
            ))}
          </div>
        </Section>
      ),
    },
    {
      id: "team",
      label: "Team",
      icon: <Users className="size-4" />,
      content: (
        <Section border>
          <SectionHeader title="Project Team" />
          <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2">
            {team.map((member) => (
              <Card key={member.name} inverted className="p-4">
                <Body className="text-white font-weight-medium">{member.name}</Body>
                <Body size="sm" className="text-grey-300">{member.role}</Body>
                <Body size="xs" className="text-grey-400 uppercase tracking-label">{member.department}</Body>
              </Card>
            ))}
          </Grid>
        </Section>
      ),
    },
    {
      id: "budget",
      label: "Budget",
      icon: <DollarSign className="size-4" />,
      content: (
        <Section border>
          <SectionHeader title="Budget Overview" />
          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3 mb-6">
            <Card inverted className="p-4">
              <Body size="xs" className="text-grey-400 mb-1">Total Budget</Body>
              <Body className="text-white text-h4-md font-weight-bold">${(budget / 1000).toFixed(0)}K</Body>
            </Card>
            <Card inverted className="p-4">
              <Body size="xs" className="text-grey-400 mb-1">Spent</Body>
              <Body className="text-white text-h4-md font-weight-bold">${(actual / 1000).toFixed(0)}K</Body>
            </Card>
            <Card inverted className="p-4">
              <Body size="xs" className="text-grey-400 mb-1">Remaining</Body>
              <Body className={`text-h4-md font-weight-bold ${budget - actual >= 0 ? "text-success" : "text-error"}`}>
                ${((budget - actual) / 1000).toFixed(0)}K
              </Body>
            </Card>
          </Grid>
          <Card inverted className="p-6">
            <Body className="text-grey-400">Detailed budget breakdown will be displayed here.</Body>
          </Card>
        </Section>
      ),
    },
    {
      id: "documents",
      label: "Documents",
      icon: <FileText className="size-4" />,
      content: (
        <Section border>
          <SectionHeader title="Project Documents" />
          <Card inverted className="p-6">
            <Body className="text-grey-400">Documents will be displayed here.</Body>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Project",
        title: project?.name || "Project Details",
        description: project?.client?.name || project?.client_name || undefined,
        badge: (
          <Badge variant={STATUS_COLORS[health] || "outline"}>
            {health}
          </Badge>
        ),
      }}
      backButton={{ label: "Back to Projects", href: "/projects" }}
      loading={isLoading}
      error={error ? (typeof error === 'string' ? new Error(error) : error) : null}
      onRetry={refetch}
      notFound={!isLoading && !error && !project && !isNotFound}
      notFoundMessage="The project you're looking for doesn't exist or has been removed."
      tabs={tabs}
      actions={
        <>
          <Button
            variant="outline"
            inverted
            onClick={handleGenerateReport}
            icon={<Download className="size-4" />}
            iconPosition="left"
          >
            Report
          </Button>
          {canManageProject && (
            <Button
              variant="solid"
              onClick={() => router.push(`/projects/${params.id}/edit`)}
              icon={<Pencil className="size-4" />}
              iconPosition="left"
            >
              Edit
            </Button>
          )}
        </>
      }
    />
  );
}
