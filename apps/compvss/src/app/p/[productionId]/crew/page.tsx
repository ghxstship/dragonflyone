"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, Badge, StatCard, Spinner, EmptyState, Container } from "@ghxstship/ui";
import { Users, Plus, Clock, UserCheck, IdCard } from "lucide-react";
import { useProject } from "../../../../hooks/useProjects";
import { useCrew } from "../../../../hooks/useCrew";

export default function ProductionCrewPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  
  // Fetch real data from API
  const { data: production, isLoading: productionLoading } = useProject(productionId);
  const { data: crewData, isLoading: crewLoading } = useCrew();
  
  const isLoading = productionLoading || crewLoading;
  const crew = crewData || [];
  
  // Calculate stats from real data
  const crewStats = { 
    total: crew.length, 
    confirmed: crew.filter(c => c.availability === 'available').length, 
    pending: crew.filter(c => c.availability === 'on-leave').length, 
    checkedIn: crew.filter(c => c.availability === 'busy').length 
  };

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    available: "success", "on-leave": "warning", busy: "info", confirmed: "success", pending: "warning", declined: "error", checked_in: "info",
  };
  
  if (isLoading) {
    return (
      <Container className="flex min-h-[60vh] items-center justify-center">
        <Spinner variant="grey" size="lg" text="Loading crew..." />
      </Container>
    );
  }

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Crew"
          description="Manage crew assignments and check-ins"
          colorScheme="on-light"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="solid" size="sm">
            <Plus size={16} className="mr-2" />
            Add Crew
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/crew/timekeeping`)}>
            <Clock size={16} className="mr-2" />
            Timekeeping
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/credentials`)}>
            <IdCard size={16} className="mr-2" />
            Credentials
          </Button>
        </Stack>
      </Stack>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Total Crew" value={crewStats.total.toString()} icon={<Users size={20} />} />
        <StatCard label="Confirmed" value={crewStats.confirmed.toString()} icon={<UserCheck size={20} />} trend="up" />
        <StatCard label="Pending" value={crewStats.pending.toString()} icon={<Users size={20} />} trend={crewStats.pending > 0 ? "down" : "up"} />
        <StatCard label="Checked In" value={crewStats.checkedIn.toString()} icon={<Clock size={20} />} />
      </div>

      <Card variant="elevated">
        <CardBody>
          <Stack gap={0}>
            {crew.length === 0 ? (
              <EmptyState
                title="No Crew Assigned"
                description="Add crew members to this production"
                action={{ label: "Add Crew", onClick: () => {} }}
              />
            ) : crew.map((member, index) => (
              <div key={member.id} className={`flex cursor-pointer items-center justify-between border-grey-200 p-4 transition-all hover:bg-grey-50 ${index < crew.length - 1 ? "border-b" : ""}`}>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <Box className="flex size-10 items-center justify-center rounded-avatar bg-grey-100">
                    <Users size={20} className="text-primary" />
                  </Box>
                  <Stack gap={1}>
                    <Body className="font-weight-medium">{member.full_name}</Body>
                    <Body size="sm" className=" text-grey-500">{member.role} · {member.department}</Body>
                  </Stack>
                </Stack>
                <Badge variant={statusColors[member.availability] || "info"}>{member.availability.toUpperCase()}</Badge>
              </div>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
