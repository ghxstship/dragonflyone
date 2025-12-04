"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, Badge, StatCard, Grid } from "@ghxstship/ui";
import { Shield, AlertTriangle, Siren, Cloud, FileCheck, FileWarning, Plus } from "lucide-react";
import { compvssDemoProductions } from "../../../../data/compvss";

export default function ProductionSafetyPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const production = compvssDemoProductions.find((p) => p.id === productionId);

  const safetyStats = { incidents: 0, openIssues: 3, permits: 8, riskItems: 5 };

  const recentItems = [
    { id: "1", title: "Fire Safety Inspection", type: "permit", status: "approved", date: "2025-06-10" },
    { id: "2", title: "Crowd Management Plan", type: "plan", status: "approved", date: "2025-06-08" },
    { id: "3", title: "Barrier placement concern", type: "issue", status: "open", date: "2025-06-12" },
    { id: "4", title: "Weather contingency", type: "risk", status: "monitoring", date: "2025-06-11" },
  ];

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    approved: "success", open: "warning", monitoring: "info", resolved: "success",
  };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Safety"
          description="Safety management, incidents, and compliance"
          colorScheme="on-light"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="solid" size="sm">
            <Plus size={16} className="mr-2" />
            Report Incident
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/safety/emergency`)}>
            <Siren size={16} className="mr-2" />
            Emergency Plans
          </Button>
        </Stack>
      </Stack>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Incidents" value={safetyStats.incidents.toString()} icon={<AlertTriangle size={20} />} trend={safetyStats.incidents === 0 ? "up" : "down"} trendValue="No incidents" />
        <StatCard label="Open Issues" value={safetyStats.openIssues.toString()} icon={<Shield size={20} />} trend={safetyStats.openIssues > 0 ? "down" : "up"} />
        <StatCard label="Permits" value={safetyStats.permits.toString()} icon={<FileCheck size={20} />} />
        <StatCard label="Risk Items" value={safetyStats.riskItems.toString()} icon={<FileWarning size={20} />} />
      </div>

      <Grid cols={3} gap={4}>
        <Card variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/safety/incidents`)}>
          <CardBody>
            <Stack gap={4} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded-card bg-grey-100">
                <AlertTriangle size={24} className="text-error" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold">Incidents</Body>
                <Body className="text-body-sm text-grey-500">Report and track</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/safety/weather`)}>
          <CardBody>
            <Stack gap={4} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded-card bg-grey-100">
                <Cloud size={24} className="text-info" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold">Weather</Body>
                <Body className="text-body-sm text-grey-500">Forecasts and alerts</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
        <Card variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/safety/risk-register`)}>
          <CardBody>
            <Stack gap={4} className="items-center text-center">
              <Box className="flex size-12 items-center justify-center rounded-card bg-grey-100">
                <FileWarning size={24} className="text-warning" />
              </Box>
              <Stack gap={1}>
                <Body className="font-weight-bold">Risk Register</Body>
                <Body className="text-body-sm text-grey-500">Risk assessment</Body>
              </Stack>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <Card variant="elevated">
        <CardBody>
          <Stack gap={4}>
            <Body className="font-weight-bold">Recent Activity</Body>
            <Stack gap={0}>
              {recentItems.map((item, index) => (
                <div key={item.id} className={`flex items-center justify-between border-grey-200 p-4 ${index < recentItems.length - 1 ? "border-b" : ""}`}>
                  <Stack gap={1}>
                    <Body className="font-weight-medium">{item.title}</Body>
                    <Body className="text-body-sm text-grey-500">{item.type} · {item.date}</Body>
                  </Stack>
                  <Badge variant={statusColors[item.status]}>{item.status.toUpperCase()}</Badge>
                </div>
              ))}
            </Stack>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
