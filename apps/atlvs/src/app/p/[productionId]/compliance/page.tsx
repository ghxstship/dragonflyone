"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, Badge, StatCard, Grid } from "@ghxstship/ui";
import { Shield, Plus, FileCheck, AlertTriangle, CheckCircle } from "lucide-react";
import { atlvsDemoProductions } from "../../../../data/atlvs";

export default function ProductionCompliancePage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  const complianceStats = { total: 12, completed: 9, pending: 2, overdue: 1 };

  const items = [
    { id: "1", name: "Venue Permit", category: "Permits", dueDate: "2025-06-10", status: "completed" },
    { id: "2", name: "Fire Safety Inspection", category: "Safety", dueDate: "2025-06-12", status: "completed" },
    { id: "3", name: "Insurance Certificate", category: "Insurance", dueDate: "2025-06-14", status: "pending" },
    { id: "4", name: "Noise Permit", category: "Permits", dueDate: "2025-06-08", status: "overdue" },
    { id: "5", name: "Health & Safety Plan", category: "Safety", dueDate: "2025-06-15", status: "completed" },
  ];

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    completed: "success", pending: "warning", overdue: "error",
  };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Compliance"
          description="Permits, licenses, and regulatory requirements"
          colorScheme="on-dark"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="solid" size="sm">
            <Plus size={16} className="mr-2" />
            Add Requirement
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/compliance/permits`)}>
            Permits
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/compliance/insurance`)}>
            Insurance
          </Button>
        </Stack>
      </Stack>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Total Requirements" value={complianceStats.total.toString()} icon={<Shield size={20} />} inverted />
        <StatCard label="Completed" value={complianceStats.completed.toString()} icon={<CheckCircle size={20} />} trend="up" inverted />
        <StatCard label="Pending" value={complianceStats.pending.toString()} icon={<FileCheck size={20} />} inverted />
        <StatCard label="Overdue" value={complianceStats.overdue.toString()} icon={<AlertTriangle size={20} />} trend={complianceStats.overdue > 0 ? "down" : "up"} inverted />
      </div>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={0}>
            {items.map((item, index) => (
              <div key={item.id} className={`flex cursor-pointer items-center justify-between border-ink-700 p-4 transition-all hover:bg-ink-800/50 ${index < items.length - 1 ? "border-b" : ""}`}>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <Box className="flex size-10 items-center justify-center rounded bg-ink-800">
                    <Shield size={20} className="text-primary" />
                  </Box>
                  <Stack gap={1}>
                    <Body className="font-weight-medium text-white">{item.name}</Body>
                    <Body className="text-body-sm text-on-dark-muted">{item.category} · Due {item.dueDate}</Body>
                  </Stack>
                </Stack>
                <Badge variant={statusColors[item.status]}>{item.status.toUpperCase()}</Badge>
              </div>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
