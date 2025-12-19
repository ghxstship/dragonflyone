"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Badge, Spinner, Container, EmptyState } from "@ghxstship/ui";
import { Plus, Hammer, CheckCircle } from "lucide-react";
import { useProject } from "../../../../../hooks/useProjects";
import { useBuildStrikeTasks } from "../../../../../hooks/useBuildStrike";

export default function BuildStrikePage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const { data: production } = useProject(productionId);
  const { data: tasksData, isLoading, error } = useBuildStrikeTasks(productionId);
  
  const tasks = tasksData || [];

  if (isLoading) {
    return <Container className="flex min-h-[60vh] items-center justify-center"><Spinner variant="grey" size="lg" text="Loading..." /></Container>;
  }

  if (error) {
    return <Container><EmptyState title="Failed to Load" description="Unable to load build/strike tasks." action={{ label: "Try Again", onClick: () => window.location.reload() }} /></Container>;
  }

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    completed: "success", in_progress: "warning", pending: "solid",
  };

  const phaseColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    build: "info", strike: "error",
  };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Build / Strike"
          description="Setup and teardown task management"
          colorScheme="on-light"
        />
        <Button variant="solid" size="sm">
          <Plus size={16} className="mr-2" />
          Add Task
        </Button>
      </Stack>

      <Card variant="elevated">
        <CardBody>
          <Stack gap={0}>
            {tasks.map((task, index) => (
              <div key={task.id} className={`flex items-center justify-between border-grey-200 p-4 ${index < tasks.length - 1 ? "border-b" : ""}`}>
                <Stack direction="horizontal" gap={3} className="items-center">
                  {task.status === "completed" ? (
                    <CheckCircle size={20} className="text-success" />
                  ) : (
                    <Hammer size={20} className="text-primary" />
                  )}
                  <Stack gap={1}>
                    <Body className="font-weight-medium">{task.task}</Body>
                    <Body size="sm" className=" text-grey-500">{task.duration}</Body>
                  </Stack>
                </Stack>
                <Stack direction="horizontal" gap={2}>
                  <Badge variant={phaseColors[task.phase]}>{task.phase.toUpperCase()}</Badge>
                  <Badge variant={statusColors[task.status]}>{task.status.replace("_", " ").toUpperCase()}</Badge>
                </Stack>
              </div>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
