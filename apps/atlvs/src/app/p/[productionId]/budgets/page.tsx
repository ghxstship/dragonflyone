"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, StatCard, Badge } from "@ghxstship/ui";
import { DollarSign, Plus, TrendingUp, TrendingDown, PieChart } from "lucide-react";
import { atlvsDemoProductions } from "../../../../data/atlvs";

export default function ProductionBudgetsPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  const budgetStats = { total: 250000, spent: 175000, remaining: 75000, variance: -5000 };

  const categories = [
    { id: "1", name: "Talent", budgeted: 80000, spent: 75000, status: "on_track" },
    { id: "2", name: "Production", budgeted: 60000, spent: 55000, status: "on_track" },
    { id: "3", name: "Venue", budgeted: 40000, spent: 42000, status: "over_budget" },
    { id: "4", name: "Marketing", budgeted: 30000, spent: 20000, status: "under_budget" },
    { id: "5", name: "Catering", budgeted: 25000, spent: 18000, status: "on_track" },
    { id: "6", name: "Contingency", budgeted: 15000, spent: 5000, status: "under_budget" },
  ];

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    on_track: "success", over_budget: "error", under_budget: "info",
  };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Budget"
          description="Financial planning and expense tracking"
          colorScheme="on-dark"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="solid" size="sm">
            <Plus size={16} className="mr-2" />
            Add Line Item
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/scenarios`)}>
            <PieChart size={16} className="mr-2" />
            Scenarios
          </Button>
        </Stack>
      </Stack>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <StatCard label="Total Budget" value={`$${(budgetStats.total / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} inverted />
        <StatCard label="Spent" value={`$${(budgetStats.spent / 1000).toFixed(0)}K`} icon={<TrendingDown size={20} />} inverted />
        <StatCard label="Remaining" value={`$${(budgetStats.remaining / 1000).toFixed(0)}K`} icon={<TrendingUp size={20} />} trend="up" inverted />
        <StatCard label="Variance" value={`$${(budgetStats.variance / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} trend={budgetStats.variance < 0 ? "down" : "up"} inverted />
      </div>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={0}>
            {categories.map((cat, index) => (
              <div key={cat.id} className={`flex items-center justify-between border-ink-700 p-4 ${index < categories.length - 1 ? "border-b" : ""}`}>
                <Stack gap={1}>
                  <Body className="font-weight-medium text-white">{cat.name}</Body>
                  <Body className="text-body-sm text-on-dark-muted">
                    ${cat.spent.toLocaleString()} of ${cat.budgeted.toLocaleString()}
                  </Body>
                </Stack>
                <Stack direction="horizontal" gap={4} className="items-center">
                  <div className="h-2 w-32 overflow-hidden rounded bg-ink-800">
                    <div className={`h-full ${cat.spent > cat.budgeted ? "bg-error" : "bg-success"}`} style={{ width: `${Math.min((cat.spent / cat.budgeted) * 100, 100)}%` }} />
                  </div>
                  <Badge variant={statusColors[cat.status]}>{cat.status.replace("_", " ").toUpperCase()}</Badge>
                </Stack>
              </div>
            ))}
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
