"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Badge, Spinner, Container, EmptyState } from "@ghxstship/ui";
import { Clock, Plus, Users } from "lucide-react";
import { useProject } from "../../../../../hooks/useProjects";
import { useTimekeeping } from "../../../../../hooks/useTimekeeping";

export default function TimekeepingPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const { data: production } = useProject(productionId);
  const { data: timekeepingData, isLoading, error } = useTimekeeping();
  
  const timeEntries = timekeepingData?.entries || [];

  if (isLoading) {
    return <Container className="flex min-h-[60vh] items-center justify-center"><Spinner variant="grey" size="lg" text="Loading..." /></Container>;
  }

  if (error) {
    return <Container><EmptyState title="Failed to Load" description="Unable to load timekeeping data." action={{ label: "Try Again", onClick: () => window.location.reload() }} /></Container>;
  }

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    approved: "success", pending: "warning", active: "info",
  };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Timekeeping"
          description="Track crew hours and attendance"
          colorScheme="on-light"
        />
        <Button variant="solid" size="sm">
          <Plus size={16} className="mr-2" />
          Manual Entry
        </Button>
      </Stack>

      <Card variant="elevated">
        <CardBody>
          <Stack gap={0}>
            {timeEntries.map((entry, index) => (
              <div key={entry.id} className={`flex items-center justify-between border-grey-200 p-4 ${index < timeEntries.length - 1 ? "border-b" : ""}`}>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <Users size={20} className="text-primary" />
                  <Stack gap={1}>
                    <Body className="font-weight-medium">{entry.name}</Body>
                    <Body size="sm" className=" text-grey-500">
                      {entry.clockIn} - {entry.clockOut}
                    </Body>
                  </Stack>
                </Stack>
                <Stack direction="horizontal" gap={4} className="items-center">
                  <Stack direction="horizontal" gap={1} className="items-center">
                    <Clock size={14} className="text-grey-400" />
                    <Body className="font-weight-bold">{entry.hours}h</Body>
                  </Stack>
                  <Badge variant={statusColors[entry.status]}>{entry.status.toUpperCase()}</Badge>
                </Stack>
              </div>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
