"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Badge, Spinner, Container, EmptyState } from "@ghxstship/ui";
import { Plus, Phone } from "lucide-react";
import { useProject } from "../../../../../hooks/useProjects";
import { useShowCallCrew } from "../../../../../hooks/useShowCall";

export default function ShowCallPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  
  const { data: production } = useProject(productionId);
  const { data: crewData, isLoading, error } = useShowCallCrew(productionId);

  if (isLoading) {
    return (
      <Container className="flex min-h-[60vh] items-center justify-center">
        <Spinner variant="grey" size="lg" text="Loading show call..." />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <EmptyState
          title="Failed to Load Show Call"
          description={error instanceof Error ? error.message : "An error occurred."}
          action={{ label: "Try Again", onClick: () => window.location.reload() }}
        />
      </Container>
    );
  }

  const showCalls = crewData || [];

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Show Call"
          description="Department call times and crew assignments"
          colorScheme="on-light"
        />
        <Button variant="solid" size="sm">
          <Plus size={16} className="mr-2" />
          Add Department
        </Button>
      </Stack>

      <Card variant="elevated">
        <CardBody>
          <Stack gap={0}>
            {showCalls.length === 0 ? (
              <Body className="p-4 text-grey-500">No crew scheduled yet</Body>
            ) : showCalls.map((member, index) => (
              <div key={member.id} className={`flex items-center justify-between border-grey-200 p-4 ${index < showCalls.length - 1 ? "border-b" : ""}`}>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <Phone size={20} className="text-primary" />
                  <Stack gap={1}>
                    <Body className="font-weight-medium">{member.name}</Body>
                    <Body size="sm" className=" text-grey-500">{member.role} · {member.department}</Body>
                  </Stack>
                </Stack>
                <Stack direction="horizontal" gap={4} className="items-center">
                  <Badge variant={member.status === 'Checked In' || member.status === 'On Site' ? 'success' : member.status === 'Late' || member.status === 'No Show' ? 'error' : 'info'}>{member.status}</Badge>
                  <Badge variant="info">{member.callTime}</Badge>
                </Stack>
              </div>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
