"use client";

import { useParams, useRouter } from "next/navigation";
import {
  SectionHeader,
  Card,
  CardBody,
  Stack,
  Button,
  Badge,
  Body,
  Box,
} from "@ghxstship/ui";
import { CheckSquare, Plus, Filter, Search } from "lucide-react";
import { atlvsDemoProductions } from "../../../../../data/atlvs";

export default function ProductionTasksPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  const tasks = [
    { id: "1", title: "Stage setup walkthrough", dueDate: "2025-06-14", priority: "high", status: "pending", assignee: "John Smith" },
    { id: "2", title: "Audio equipment check", dueDate: "2025-06-14", priority: "critical", status: "in_progress", assignee: "Sarah Jones" },
    { id: "3", title: "Lighting rig inspection", dueDate: "2025-06-15", priority: "high", status: "pending", assignee: "Mike Wilson" },
    { id: "4", title: "Catering coordination", dueDate: "2025-06-15", priority: "medium", status: "completed", assignee: "Emily Brown" },
    { id: "5", title: "Security briefing", dueDate: "2025-06-15", priority: "high", status: "pending", assignee: "Tom Davis" },
    { id: "6", title: "Vendor check-in", dueDate: "2025-06-16", priority: "medium", status: "pending", assignee: "Lisa Chen" },
  ];

  const priorityColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    critical: "error", high: "warning", medium: "info", low: "solid",
  };

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    completed: "success", in_progress: "warning", pending: "solid", blocked: "error",
  };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Tasks"
          description="Manage all tasks for this production"
          colorScheme="on-dark"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="solid" size="sm" onClick={() => router.push(`/p/${productionId}/schedule/tasks/new`)}>
            <Plus size={16} className="mr-2" />
            New Task
          </Button>
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Search size={16} className="mr-2" />
            Search
          </Button>
        </Stack>
      </Stack>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4}>
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex cursor-pointer items-center justify-between rounded border-2 border-ink-700 p-4 transition-all hover:border-ink-600 hover:bg-ink-800/50"
                onClick={() => router.push(`/p/${productionId}/schedule/tasks/${task.id}`)}
              >
                <Stack direction="horizontal" gap={4} className="items-center">
                  <Box className="flex size-10 items-center justify-center rounded bg-ink-800">
                    <CheckSquare size={20} className="text-primary" />
                  </Box>
                  <Stack gap={1}>
                    <Body className="font-weight-medium text-white">{task.title}</Body>
                    <Body size="sm" className=" text-on-dark-muted">
                      Due: {new Date(task.dueDate).toLocaleDateString()} · {task.assignee}
                    </Body>
                  </Stack>
                </Stack>
                <Stack direction="horizontal" gap={2}>
                  <Badge variant={priorityColors[task.priority]}>{task.priority.toUpperCase()}</Badge>
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
