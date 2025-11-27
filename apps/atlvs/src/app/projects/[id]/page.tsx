"use client";

import { useState, useEffect } from "react";
import { useRouter, notFound } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../../components/navigation";
import { ProgressBar, Button, Stack, StatusBadge, LoadingSpinner, Container, useNotifications, H1, H2, H3, Body, Label, Card, Grid, Link, Badge, Section } from "@ghxstship/ui";

interface Project {
  id: string;
  name: string;
  client_name?: string;
  client?: { name: string };
  status: string;
  budget: number;
  actual_cost?: number;
  health?: string;
  project_manager?: { full_name: string };
  start_date: string;
  end_date: string;
  progress?: number;
  description?: string;
  venue?: string;
  expected_attendees?: number;
}

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/projects/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Project not found");
          } else {
            throw new Error("Failed to fetch project");
          }
          return;
        }
        const data = await response.json();
        setProject(data.project || data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [params.id]);

  const handleUpdateStatus = async () => {
    router.push(`/projects/${params.id}/edit`);
  };

  const handleAddMilestone = async () => {
    router.push(`/projects/${params.id}/milestones/new`);
  };

  const handleGenerateReport = async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}/report`, { method: "POST" });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `project-${params.id}-report.pdf`;
        a.click();
        addNotification({ type: "success", title: "Success", message: "Report generated" });
      } else {
        addNotification({ type: "error", title: "Error", message: "Failed to generate report" });
      }
    } catch (err) {
      addNotification({ type: "error", title: "Error", message: "Failed to generate report" });
    }
  };

  if (loading) {
    return (
      <Section className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
        <CreatorNavigationAuthenticated />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading project..." />
        </Container>
      </Section>
    );
  }

  if (error || !project) {
    return (
      <Section className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
        <CreatorNavigationAuthenticated />
        <Container className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
          <H2 className="text-white">{error || "Project not found"}</H2>
          <Button variant="outlineWhite" onClick={() => router.push("/projects")}>
            Back to Projects
          </Button>
        </Container>
      </Section>
    );
  }

  const budget = project.budget || 0;
  const actual = project.actual_cost || 0;
  const variance = budget > 0 ? Math.round(((actual - budget) / budget) * 100) : 0;
  const progress = project.progress || 0;
  const health = project.health || (variance > 10 ? "At Risk" : "On Track");

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

  return (
    <Section className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <CreatorNavigationAuthenticated />

      <Container className="relative mx-auto flex max-w-7xl flex-col gap-8 px-6 pb-24 pt-16 lg:px-8">
        <Stack direction="horizontal" className="items-start justify-between">
          <Stack>
            <Stack direction="horizontal" gap={3} className="items-center">
              <Link href="/dashboard" className="text-ink-400 hover:text-white">
                ← Back
              </Link>
              <Badge variant="outline">{project.id}</Badge>
            </Stack>
            <H1 className="mt-4 text-white">{project.name}</H1>
            <Body className="mt-2 font-mono text-body-sm uppercase tracking-widest text-ink-400">{project.client?.name || project.client_name || "—"}</Body>
          </Stack>
          <StatusBadge
            status={
              health === "On Track"
                ? "success"
                : health === "At Risk"
                  ? "warning"
                  : "info"
            }
          >
            {health}
          </StatusBadge>
        </Stack>

        <Grid cols={4} gap={6}>
          <Card className="border-2 border-ink-800 p-6">
            <Label className="font-mono text-mono-xs uppercase tracking-widest text-ink-500">Budget</Label>
            <Body className="mt-3 font-display text-h4-md text-white">${(budget / 1000).toFixed(0)}K</Body>
          </Card>
          <Card className="border-2 border-ink-800 p-6">
            <Label className="font-mono text-mono-xs uppercase tracking-widest text-ink-500">Actual</Label>
            <Body className="mt-3 font-display text-h4-md text-white">${(actual / 1000).toFixed(0)}K</Body>
          </Card>
          <Card className="border-2 border-ink-800 p-6">
            <Label className="font-mono text-mono-xs uppercase tracking-widest text-ink-500">Variance</Label>
            <Body className={`mt-3 font-display text-h4-md ${variance > 0 ? "text-error-400" : "text-success-400"}`}>
              {variance > 0 ? "+" : ""}
              {variance}%
            </Body>
          </Card>
          <Card className="border-2 border-ink-800 p-6">
            <Label className="font-mono text-mono-xs uppercase tracking-widest text-ink-500">Progress</Label>
            <Body className="mt-3 font-display text-h4-md text-white">{progress}%</Body>
          </Card>
        </Grid>

        <Grid cols={3} gap={8}>
          <Stack gap={6} className="md:col-span-2">
            <Section border>
              <H2 className="mb-4 text-white">Project Overview</H2>
              <Stack gap={4} className="text-ink-300">
                <Body>{project.description}</Body>
                <Grid gap={3} className="border-t-2 border-ink-800 pt-4 text-body-sm">
                  <Stack direction="horizontal" className="justify-between">
                    <Label className="text-ink-500">Venue:</Label>
                    <Body className="text-white">{project.venue}</Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Label className="text-ink-500">Expected Attendees:</Label>
                    <Body className="text-white">{(project.expected_attendees || 0).toLocaleString()}</Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Label className="text-ink-500">Start Date:</Label>
                    <Body className="text-white">{project.start_date}</Body>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Label className="text-ink-500">End Date:</Label>
                    <Body className="text-white">{project.end_date}</Body>
                  </Stack>
                </Grid>
              </Stack>
            </Section>

            <Section border>
              <H2 className="mb-4 text-white">Milestones</H2>
              <Stack gap={4}>
                {milestones.map((milestone) => (
                  <Card key={milestone.id} className="border-2 border-ink-800 p-4">
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack>
                        <H3 className="text-white">{milestone.name}</H3>
                        <Body className="mt-1 font-mono text-mono-xs text-ink-500">{milestone.date}</Body>
                      </Stack>
                      <Badge variant="outline">{milestone.status}</Badge>
                    </Stack>
                    <Stack className="mt-3">
                      <ProgressBar value={milestone.progress} variant="inverse" />
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Section>
          </Stack>

          <Stack gap={6}>
            <Section border>
              <H2 className="mb-4 text-white">Team</H2>
              <Stack gap={3}>
                {team.map((member) => (
                  <Card key={member.name} className="border-2 border-ink-800 p-4">
                    <Body className="font-display text-body-md text-white">{member.name}</Body>
                    <Body className="mt-1 text-body-sm text-ink-300">{member.role}</Body>
                    <Label className="mt-1 font-mono text-mono-xs uppercase tracking-widest text-ink-500">
                      {member.department}
                    </Label>
                  </Card>
                ))}
              </Stack>
            </Section>

            <Section border>
              <H2 className="mb-4 text-white">Actions</H2>
              <Stack gap={3}>
                <Button variant="outlineWhite" className="w-full" onClick={handleUpdateStatus}>
                  Update Status
                </Button>
                <Button variant="outline" className="w-full" onClick={handleAddMilestone}>
                  Add Milestone
                </Button>
                <Button variant="outline" className="w-full" onClick={handleGenerateReport}>
                  Generate Report
                </Button>
              </Stack>
            </Section>
          </Stack>
        </Grid>
      </Container>
    </Section>
  );
}
