"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, Badge, StatCard } from "@ghxstship/ui";
import { Users, Plus, Clock, UserCheck, IdCard } from "lucide-react";
import { compvssDemoProductions } from "../../../../data/compvss";

export default function ProductionCrewPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const production = compvssDemoProductions.find((p) => p.id === productionId);

  const crewStats = { total: 45, confirmed: 38, pending: 5, checkedIn: 0 };

  const crew = [
    { id: "1", name: "John Smith", role: "Production Manager", department: "Production", status: "confirmed" },
    { id: "2", name: "Sarah Jones", role: "Stage Manager", department: "Stage", status: "confirmed" },
    { id: "3", name: "Mike Wilson", role: "FOH Engineer", department: "Audio", status: "confirmed" },
    { id: "4", name: "Emily Brown", role: "Monitor Engineer", department: "Audio", status: "confirmed" },
    { id: "5", name: "Tom Davis", role: "Lighting Director", department: "Lighting", status: "pending" },
    { id: "6", name: "Lisa Chen", role: "Video Director", department: "Video", status: "confirmed" },
  ];

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    confirmed: "success", pending: "warning", declined: "error", checked_in: "info",
  };

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
            {crew.map((member, index) => (
              <div key={member.id} className={`flex cursor-pointer items-center justify-between border-grey-200 p-4 transition-all hover:bg-grey-50 ${index < crew.length - 1 ? "border-b" : ""}`}>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <Box className="flex size-10 items-center justify-center rounded-avatar bg-grey-100">
                    <Users size={20} className="text-primary" />
                  </Box>
                  <Stack gap={1}>
                    <Body className="font-weight-medium">{member.name}</Body>
                    <Body className="text-body-sm text-grey-500">{member.role} · {member.department}</Body>
                  </Stack>
                </Stack>
                <Badge variant={statusColors[member.status]}>{member.status.toUpperCase()}</Badge>
              </div>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
