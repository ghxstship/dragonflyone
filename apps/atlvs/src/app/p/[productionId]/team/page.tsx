"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, Grid, Badge, StatCard } from "@ghxstship/ui";
import { Users, Plus, UserCheck, GraduationCap } from "lucide-react";
import { atlvsDemoProductions } from "../../../../data/atlvs";

export default function ProductionTeamPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  const teamStats = { total: 24, confirmed: 20, pending: 4 };

  const team = [
    { id: "1", name: "John Smith", role: "Production Manager", department: "Production", status: "confirmed" },
    { id: "2", name: "Sarah Jones", role: "Stage Manager", department: "Stage", status: "confirmed" },
    { id: "3", name: "Mike Wilson", role: "Audio Engineer", department: "Audio", status: "confirmed" },
    { id: "4", name: "Emily Brown", role: "Lighting Designer", department: "Lighting", status: "pending" },
    { id: "5", name: "Tom Davis", role: "Security Lead", department: "Security", status: "confirmed" },
  ];

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    confirmed: "success", pending: "warning", declined: "error",
  };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Team"
          description="Manage team assignments and availability"
          colorScheme="on-dark"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="solid" size="sm">
            <Plus size={16} className="mr-2" />
            Add Team Member
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/team/assignments`)}>
            <UserCheck size={16} className="mr-2" />
            Assignments
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/team/training`)}>
            <GraduationCap size={16} className="mr-2" />
            Training
          </Button>
        </Stack>
      </Stack>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Team" value={teamStats.total.toString()} icon={<Users size={20} />} inverted />
        <StatCard label="Confirmed" value={teamStats.confirmed.toString()} icon={<UserCheck size={20} />} trend="up" inverted />
        <StatCard label="Pending" value={teamStats.pending.toString()} icon={<Users size={20} />} trend={teamStats.pending > 0 ? "down" : "up"} inverted />
      </div>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={0}>
            {team.map((member, index) => (
              <div key={member.id} className={`flex items-center justify-between border-ink-700 p-4 ${index < team.length - 1 ? "border-b" : ""}`}>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <Box className="flex size-10 items-center justify-center rounded-full bg-ink-800">
                    <Users size={20} className="text-primary" />
                  </Box>
                  <Stack gap={1}>
                    <Body className="font-weight-medium text-white">{member.name}</Body>
                    <Body className="text-body-sm text-on-dark-muted">{member.role} · {member.department}</Body>
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
