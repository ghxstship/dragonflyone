"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Badge, Spinner, Container, EmptyState } from "@ghxstship/ui";
import { Plus, Clock } from "lucide-react";
import { useProject } from "../../../../../hooks/useProjects";
import { useCues } from "../../../../../hooks/useRunOfShow";

export default function RunOfShowPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  
  const { data: production } = useProject(productionId);
  const { data: cues, isLoading, error } = useCues(productionId);

  const typeColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    setup: "solid", technical: "info", break: "warning", event: "success", performance: "error", pending: "warning", ready: "info", complete: "success",
  };

  if (isLoading) {
    return (
      <Container className="flex min-h-[60vh] items-center justify-center">
        <Spinner variant="grey" size="lg" text="Loading run of show..." />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <EmptyState
          title="Failed to Load Run of Show"
          description={error instanceof Error ? error.message : "An error occurred."}
          action={{ label: "Try Again", onClick: () => window.location.reload() }}
        />
      </Container>
    );
  }

  const runOfShow = cues || [];

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Run of Show"
          description="Complete production timeline"
          colorScheme="on-light"
        />
        <Button variant="solid" size="sm">
          <Plus size={16} className="mr-2" />
          Add Item
        </Button>
      </Stack>

      <Card variant="elevated">
        <CardBody>
          <Stack gap={0}>
            {runOfShow.length === 0 ? (
              <Body className="p-4 text-grey-500">No cues scheduled yet</Body>
            ) : runOfShow.map((cueItem, index) => (
              <div key={cueItem.id} className={`flex items-center gap-4 border-grey-200 p-4 ${index < runOfShow.length - 1 ? "border-b" : ""}`}>
                <div className="flex w-20 items-center gap-2">
                  <Clock size={14} className="text-grey-400" />
                  <Body className="font-weight-bold">{cueItem.time}</Body>
                </div>
                <div className="flex-1">
                  <Body className="font-weight-medium">{cueItem.cue}</Body>
                  {cueItem.notes && <Body size="sm" className="text-grey-500">{cueItem.notes}</Body>}
                </div>
                <Body size="sm" className=" text-grey-500">{cueItem.department}</Body>
                <Badge variant={typeColors[cueItem.status]}>{cueItem.status.toUpperCase()}</Badge>
              </div>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
