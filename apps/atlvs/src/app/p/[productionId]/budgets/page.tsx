"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, StatCard, Badge, Grid, Box, Spinner, EmptyState, RecordFormModal, type FormFieldConfig, useNotifications } from "@ghxstship/ui";
import { DollarSign, Plus, TrendingUp, TrendingDown, PieChart, AlertCircle } from "lucide-react";
import { useBudgets, useCreateBudget } from "../../../../hooks/useBudgets";
import { useProduction } from "../../../../hooks/useProductions";
import { atlvsDemoProductions } from "../../../../data/atlvs";

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  status: string;
}

const demoCategories: BudgetCategory[] = [
  { id: "1", name: "Talent", budgeted: 80000, spent: 75000, status: "on_track" },
  { id: "2", name: "Production", budgeted: 60000, spent: 55000, status: "on_track" },
  { id: "3", name: "Venue", budgeted: 40000, spent: 42000, status: "over_budget" },
  { id: "4", name: "Marketing", budgeted: 30000, spent: 20000, status: "under_budget" },
  { id: "5", name: "Catering", budgeted: 25000, spent: 18000, status: "on_track" },
  { id: "6", name: "Contingency", budgeted: 15000, spent: 5000, status: "under_budget" },
];

const lineItemFields: FormFieldConfig[] = [
  { name: 'name', label: 'Line Item Name', type: 'text', required: true },
  { name: 'category', label: 'Category', type: 'select', required: true, options: [
    { value: 'talent', label: 'Talent' },
    { value: 'production', label: 'Production' },
    { value: 'venue', label: 'Venue' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'catering', label: 'Catering' },
    { value: 'contingency', label: 'Contingency' },
  ]},
  { name: 'budgeted', label: 'Budgeted Amount', type: 'number', required: true },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

export default function ProductionBudgetsPage() {
  const params = useParams();
  const router = useRouter();
  const { addNotification } = useNotifications();
  const productionId = params?.productionId as string;
  
  const { data: apiProduction } = useProduction(productionId);
  const demoProduction = atlvsDemoProductions.find((p) => p.id === productionId);
  const productionName = apiProduction?.title || demoProduction?.name || "Production";

  const { data: apiBudgets, isLoading, error, refetch } = useBudgets({ project_id: productionId });
  const createBudgetMutation = useCreateBudget();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Use API data if available, otherwise demo data
  const categories: BudgetCategory[] = apiBudgets && apiBudgets.length > 0 
    ? apiBudgets.map(b => ({
        id: b.id,
        name: b.name || b.category || 'Uncategorized',
        budgeted: b.budgeted || 0,
        spent: b.actual || 0,
        status: b.status?.replace('-', '_') || 'on_track',
      }))
    : demoCategories;

  const budgetStats = categories.reduce((acc, cat) => ({
    total: acc.total + cat.budgeted,
    spent: acc.spent + cat.spent,
    remaining: acc.remaining + (cat.budgeted - cat.spent),
    variance: acc.variance + (cat.budgeted - cat.spent),
  }), { total: 0, spent: 0, remaining: 0, variance: 0 });

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    on_track: "success", over_budget: "error", under_budget: "info",
  };

  const handleCreateLineItem = async (data: Record<string, unknown>) => {
    try {
      await createBudgetMutation.mutateAsync({
        name: data.name as string,
        category: data.category as string,
        budgeted: data.budgeted as number,
        project_id: productionId,
      });
      setCreateModalOpen(false);
      addNotification({
        type: 'success',
        title: 'Line Item Created',
        message: `Budget line item "${data.name}" has been created.`,
      });
      refetch();
    } catch (err) {
      addNotification({
        type: 'error',
        title: 'Failed to Create Line Item',
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
      });
    }
  };

  if (isLoading) {
    return (
      <Stack className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
        <Body className="text-on-dark-muted">Loading budget...</Body>
      </Stack>
    );
  }

  if (error && categories.length === 0) {
    return (
      <EmptyState
        icon={<AlertCircle size={48} />}
        title="Failed to load budget"
        description={error.message}
        action={{ label: "Retry", onClick: () => refetch() }}
      />
    );
  }

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={productionName}
          title="Budget"
          description="Financial planning and expense tracking"
          colorScheme="on-dark"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="solid" size="sm" onClick={() => setCreateModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            Add Line Item
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/p/${productionId}/scenarios`)}>
            <PieChart size={16} className="mr-2" />
            Scenarios
          </Button>
        </Stack>
      </Stack>

      <Grid cols={1} gap={4} className="sm:grid-cols-4">
        <StatCard label="Total Budget" value={`$${(budgetStats.total / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} inverted />
        <StatCard label="Spent" value={`$${(budgetStats.spent / 1000).toFixed(0)}K`} icon={<TrendingDown size={20} />} inverted />
        <StatCard label="Remaining" value={`$${(budgetStats.remaining / 1000).toFixed(0)}K`} icon={<TrendingUp size={20} />} trend="up" inverted />
        <StatCard label="Variance" value={`$${(budgetStats.variance / 1000).toFixed(0)}K`} icon={<DollarSign size={20} />} trend={budgetStats.variance < 0 ? "down" : "up"} inverted />
      </Grid>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={0}>
            {categories.map((cat, index) => (
              <Box key={cat.id} className={`flex items-center justify-between border-ink-700 p-4 ${index < categories.length - 1 ? "border-b" : ""}`}>
                <Stack gap={1}>
                  <Body className="font-weight-medium text-white">{cat.name}</Body>
                  <Body size="sm" className=" text-on-dark-muted">
                    ${cat.spent.toLocaleString()} of ${cat.budgeted.toLocaleString()}
                  </Body>
                </Stack>
                <Stack direction="horizontal" gap={4} className="items-center">
                  <Box className="h-2 w-32 overflow-hidden rounded bg-ink-800">
                    <Box className={`h-full ${cat.spent > cat.budgeted ? "bg-error" : "bg-success"}`} style={{ width: `${Math.min((cat.spent / cat.budgeted) * 100, 100)}%` }} />
                  </Box>
                  <Badge variant={statusColors[cat.status]}>{cat.status.replace("_", " ").toUpperCase()}</Badge>
                </Stack>
              </Box>
            ))}
          </Stack>
        </CardBody>
      </Card>

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Add Budget Line Item"
        fields={lineItemFields}
        onSubmit={handleCreateLineItem}
        size="md"
      />
    </Stack>
  );
}
