"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Badge, Body, Box } from "@ghxstship/ui";
import { Plus, Shield } from "lucide-react";
import { atlvsDemoProductions } from "../../../../../data/atlvs";

export default function ProductionContingenciesPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  const contingencies = [
    { id: "1", title: "Weather backup plan", category: "weather", severity: "high", status: "active" },
    { id: "2", title: "Power failure protocol", category: "technical", severity: "critical", status: "active" },
    { id: "3", title: "Medical emergency response", category: "safety", severity: "critical", status: "active" },
    { id: "4", title: "Vendor no-show backup", category: "logistics", severity: "medium", status: "active" },
  ];

  const severityColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    critical: "error", high: "warning", medium: "info", low: "solid",
  };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Contingencies"
          description="Backup plans and emergency protocols"
          colorScheme="on-dark"
        />
        <Button variant="solid" size="sm" onClick={() => router.push(`/p/${productionId}/schedule/contingencies/new`)}>
          <Plus size={16} className="mr-2" />
          New Contingency
        </Button>
      </Stack>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4}>
            {contingencies.map((item) => (
              <div
                key={item.id}
                className="flex cursor-pointer items-center justify-between rounded border-2 border-ink-700 p-4 transition-all hover:border-ink-600 hover:bg-ink-800/50"
                onClick={() => router.push(`/p/${productionId}/schedule/contingencies/${item.id}`)}
              >
                <Stack direction="horizontal" gap={4} className="items-center">
                  <Box className="flex size-10 items-center justify-center rounded bg-ink-800">
                    <Shield size={20} className="text-warning" />
                  </Box>
                  <Stack gap={1}>
                    <Body className="font-weight-medium text-white">{item.title}</Body>
                    <Body className="text-body-sm text-on-dark-muted">{item.category}</Body>
                  </Stack>
                </Stack>
                <Badge variant={severityColors[item.severity]}>{item.severity.toUpperCase()}</Badge>
              </div>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
