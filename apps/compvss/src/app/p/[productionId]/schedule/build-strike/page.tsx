"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Badge } from "@ghxstship/ui";
import { Plus, Hammer, CheckCircle } from "lucide-react";
import { compvssDemoProductions } from "../../../../../data/compvss";

export default function BuildStrikePage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = compvssDemoProductions.find((p) => p.id === productionId);

  const tasks = [
    { id: "1", task: "Unload trucks", phase: "build", duration: "2 hrs", status: "completed" },
    { id: "2", task: "Stage deck assembly", phase: "build", duration: "3 hrs", status: "completed" },
    { id: "3", task: "Truss rigging", phase: "build", duration: "4 hrs", status: "in_progress" },
    { id: "4", task: "Audio system hang", phase: "build", duration: "2 hrs", status: "pending" },
    { id: "5", task: "Lighting focus", phase: "build", duration: "3 hrs", status: "pending" },
    { id: "6", task: "Video wall assembly", phase: "build", duration: "2 hrs", status: "pending" },
    { id: "7", task: "Strike lighting", phase: "strike", duration: "2 hrs", status: "pending" },
    { id: "8", task: "Strike audio", phase: "strike", duration: "2 hrs", status: "pending" },
    { id: "9", task: "Load trucks", phase: "strike", duration: "3 hrs", status: "pending" },
  ];

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
