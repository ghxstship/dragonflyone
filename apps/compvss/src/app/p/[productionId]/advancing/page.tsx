"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Badge, StatCard } from "@ghxstship/ui";
import { FastForward, Plus, Clock, CheckCircle, Grid } from "lucide-react";
import { compvssDemoProductions } from "../../../../data/compvss";

export default function ProductionAdvancingPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const production = compvssDemoProductions.find((p) => p.id === productionId);

  const advanceStats = { pending: 8, approved: 15, fulfilled: 12, total: 35 };

  const advances = [
    { id: "1", title: "Backline Equipment", artist: "Headliner", status: "approved", dueDate: "2025-06-14" },
    { id: "2", title: "Dressing Room Requirements", artist: "Support Act", status: "pending", dueDate: "2025-06-13" },
    { id: "3", title: "Catering Rider", artist: "Headliner", status: "fulfilled", dueDate: "2025-06-12" },
    { id: "4", title: "Technical Rider", artist: "Headliner", status: "approved", dueDate: "2025-06-14" },
    { id: "5", title: "Hospitality Requirements", artist: "Support Act", status: "pending", dueDate: "2025-06-13" },
  ];

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    pending: "warning", approved: "info", fulfilled: "success", rejected: "error",
  };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Advancing"
          description="Manage artist advances and rider fulfillment"
          colorScheme="on-light"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="solid" size="sm" onClick={() => router.push(`/p/${productionId}/advancing/new`)}>
            <Plus size={16} className="mr-2" />
            New Request
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/advancing/catalog`)}>
            <Grid size={16} className="mr-2" />
            Catalog
          </Button>
        </Stack>
      </Stack>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Total Requests" value={advanceStats.total.toString()} icon={<FastForward size={20} />} />
        <StatCard label="Pending" value={advanceStats.pending.toString()} icon={<Clock size={20} />} trend={advanceStats.pending > 5 ? "down" : "up"} />
        <StatCard label="Approved" value={advanceStats.approved.toString()} icon={<CheckCircle size={20} />} trend="up" />
        <StatCard label="Fulfilled" value={advanceStats.fulfilled.toString()} icon={<CheckCircle size={20} />} trend="up" />
      </div>

      <Card variant="elevated">
        <CardBody>
          <Stack gap={0}>
            {advances.map((advance, index) => (
              <div key={advance.id} className={`flex cursor-pointer items-center justify-between border-grey-200 p-4 transition-all hover:bg-grey-50 ${index < advances.length - 1 ? "border-b" : ""}`}>
                <Stack direction="horizontal" gap={3} className="items-center">
                  <FastForward size={20} className="text-primary" />
                  <Stack gap={1}>
                    <Body className="font-weight-medium">{advance.title}</Body>
                    <Body className="text-body-sm text-grey-500">{advance.artist} · Due {advance.dueDate}</Body>
                  </Stack>
                </Stack>
                <Badge variant={statusColors[advance.status]}>{advance.status.toUpperCase()}</Badge>
              </div>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
