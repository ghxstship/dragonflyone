"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3 } from "@ghxstship/ui";
import { ListTodo, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { compvssDemoProductions } from "../../../../../data/compvss";

export default function PunchListPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = compvssDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return <Stack gap={4}><SectionHeader kicker="Punch List" title="Production Not Found" /></Stack>;
  }

  const stats = { total: 32, completed: 24, inProgress: 5, blocked: 3 };

  return (
    <Stack gap={8}>
      <SectionHeader kicker={production.name} title="Punch List" description="Outstanding items requiring completion" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Items" value={stats.total.toString()} icon={<ListTodo size={20} />} />
        <StatCard label="Completed" value={stats.completed.toString()} icon={<CheckCircle size={20} />} trend="up" />
        <StatCard label="In Progress" value={stats.inProgress.toString()} icon={<Clock size={20} />} />
        <StatCard label="Blocked" value={stats.blocked.toString()} icon={<AlertTriangle size={20} />} trend={stats.blocked > 0 ? "down" : "up"} />
      </div>
      <Card variant="elevated"><CardBody><Stack gap={4}><H3>Punch List Items</H3><Body className="text-muted">Punch list items will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
