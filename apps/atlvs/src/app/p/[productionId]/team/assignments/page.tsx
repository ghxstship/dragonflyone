"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Badge } from "@ghxstship/ui";
import { Plus, UserCheck } from "lucide-react";
import { atlvsDemoProductions } from "../../../../../data/atlvs";

export default function TeamAssignmentsPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  const assignments = [
    { id: "1", task: "Stage Setup", assignee: "John Smith", date: "2025-06-14", status: "assigned" },
    { id: "2", task: "Sound Check", assignee: "Mike Wilson", date: "2025-06-14", status: "in_progress" },
    { id: "3", task: "Lighting Setup", assignee: "Emily Brown", date: "2025-06-14", status: "pending" },
    { id: "4", task: "Security Briefing", assignee: "Tom Davis", date: "2025-06-15", status: "assigned" },
  ];

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    assigned: "info", in_progress: "warning", completed: "success", pending: "solid",
  };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Team Assignments"
          description="Task and role assignments for team members"
          colorScheme="on-dark"
        />
        <Button variant="solid" size="sm">
          <Plus size={16} className="mr-2" />
          New Assignment
        </Button>
      </Stack>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={0}>
            {assignments.map((item, index) => (
              <div key={item.id} className={`flex items-center justify-between border-ink-700 p-4 ${index < assignments.length - 1 ? "border-b" : ""}`}>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <UserCheck size={20} className="text-primary" />
                  <Stack gap={1}>
                    <Body className="font-weight-medium text-white">{item.task}</Body>
                    <Body className="text-body-sm text-on-dark-muted">{item.assignee} · {item.date}</Body>
                  </Stack>
                </Stack>
                <Badge variant={statusColors[item.status]}>{item.status.replace("_", " ").toUpperCase()}</Badge>
              </div>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
