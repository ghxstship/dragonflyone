"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Badge, Box, Spinner, EmptyState, StatCard, Grid, RecordFormModal, type FormFieldConfig, useNotifications } from "@ghxstship/ui";
import { Receipt, Plus, Filter, DollarSign, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { useExpenses, useExpenseStats, useCreateExpense, useExpenseCategories } from "../../../../hooks/useExpenses";
import { useProduction } from "../../../../hooks/useProductions";
import { atlvsDemoProductions } from "../../../../data/atlvs";

const demoExpenses = [
  { id: "1", description: "Audio Equipment Rental", amount: 5000, category: { name: "Production" }, expense_date: "2025-06-10", status: "approved" as const },
  { id: "2", description: "Catering Deposit", amount: 2500, category: { name: "Catering" }, expense_date: "2025-06-08", status: "approved" as const },
  { id: "3", description: "Security Services", amount: 3000, category: { name: "Security" }, expense_date: "2025-06-12", status: "submitted" as const },
  { id: "4", description: "Stage Lighting", amount: 4500, category: { name: "Production" }, expense_date: "2025-06-11", status: "approved" as const },
  { id: "5", description: "Marketing Materials", amount: 1200, category: { name: "Marketing" }, expense_date: "2025-06-09", status: "submitted" as const },
];

export default function ProductionExpensesPage() {
  const params = useParams();
  const { addNotification } = useNotifications();
  const productionId = params?.productionId as string;
  
  const { data: apiProduction } = useProduction(productionId);
  const demoProduction = atlvsDemoProductions.find((p) => p.id === productionId);
  const productionName = apiProduction?.title || demoProduction?.name || "Production";

  const { data: apiExpenses, isLoading, error, refetch } = useExpenses({ productionId });
  const { data: apiStats } = useExpenseStats(productionId);
  const { data: categories } = useExpenseCategories(productionId);
  const createExpenseMutation = useCreateExpense();

  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Use API data if available, fallback to demo data
  const expenses = apiExpenses && apiExpenses.length > 0 ? apiExpenses : demoExpenses;
  const expenseStats = apiStats || { 
    total: expenses.length, 
    totalAmount: expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    pending: expenses.filter(e => e.status === 'submitted').length,
    approved: expenses.filter(e => e.status === 'approved').length,
  };

  const expenseFields: FormFieldConfig[] = [
    { name: 'description', label: 'Description', type: 'text', required: true },
    { name: 'amount', label: 'Amount', type: 'number', required: true },
    { name: 'category_id', label: 'Category', type: 'select', options: (categories || []).map(c => ({ value: c.id, label: c.name })) },
    { name: 'expense_date', label: 'Date', type: 'date', required: true },
    { name: 'vendor_name', label: 'Vendor', type: 'text' },
    { name: 'notes', label: 'Notes', type: 'textarea' },
  ];

  const handleCreateExpense = async (data: Record<string, unknown>) => {
    try {
      await createExpenseMutation.mutateAsync({
        description: data.description as string,
        amount: data.amount as number,
        category_id: data.category_id as string,
        expense_date: data.expense_date as string,
        vendor_name: data.vendor_name as string,
        notes: data.notes as string,
        production_id: productionId,
        submitted_by: '00000000-0000-0000-0000-000000000000',
        currency: 'USD',
        status: 'draft',
      });
      setCreateModalOpen(false);
      addNotification({ type: 'success', title: 'Expense Submitted', message: 'Your expense has been submitted for approval.' });
      refetch();
    } catch (err) {
      addNotification({ type: 'error', title: 'Failed to Submit Expense', message: err instanceof Error ? err.message : 'An error occurred' });
    }
  };

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    approved: "success", submitted: "warning", pending: "warning", rejected: "error", paid: "info", draft: "solid",
  };

  if (isLoading) {
    return (
      <Stack className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
        <Body className="text-on-dark-muted">Loading expenses...</Body>
      </Stack>
    );
  }

  if (error && expenses.length === 0) {
    return (
      <EmptyState
        icon={<AlertCircle size={48} />}
        title="Failed to load expenses"
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
          title="Expenses"
          description="Track and manage production expenses"
          colorScheme="on-dark"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="solid" size="sm" onClick={() => setCreateModalOpen(true)}>
            <Plus size={16} className="mr-2" />
            Submit Expense
          </Button>
          <Button variant="outline" size="sm">
            <Filter size={16} className="mr-2" />
            Filter
          </Button>
        </Stack>
      </Stack>

      <Grid cols={1} gap={4} className="sm:grid-cols-4">
        <StatCard label="Total Expenses" value={expenseStats.total.toString()} icon={<Receipt size={20} />} inverted />
        <StatCard label="Total Amount" value={`$${(expenseStats.totalAmount / 1000).toFixed(1)}K`} icon={<DollarSign size={20} />} inverted />
        <StatCard label="Pending" value={expenseStats.pending.toString()} icon={<Clock size={20} />} inverted />
        <StatCard label="Approved" value={expenseStats.approved.toString()} icon={<CheckCircle size={20} />} trend="up" inverted />
      </Grid>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={0}>
            {expenses.length === 0 ? (
              <EmptyState
                icon={<Receipt size={48} />}
                title="No expenses yet"
                description="Submit your first expense to get started"
                action={{ label: "Submit Expense", onClick: () => setCreateModalOpen(true) }}
              />
            ) : (
              expenses.map((expense, index) => (
                <Box key={expense.id} className={`flex cursor-pointer items-center justify-between border-ink-700 p-4 transition-all hover:bg-ink-800/50 ${index < expenses.length - 1 ? "border-b" : ""}`}>
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <Receipt size={20} className="text-primary" />
                    <Stack gap={1}>
                      <Body className="font-weight-medium text-white">{expense.description}</Body>
                      <Body size="sm" className=" text-on-dark-muted">{expense.category?.name || 'Uncategorized'} · {expense.expense_date}</Body>
                    </Stack>
                  </Stack>
                  <Stack direction="horizontal" gap={4} className="items-center">
                    <Body className="font-weight-bold text-white">${expense.amount.toLocaleString()}</Body>
                    <Badge variant={statusColors[expense.status]}>{expense.status.toUpperCase()}</Badge>
                  </Stack>
                </Box>
              ))
            )}
          </Stack>
        </CardBody>
      </Card>

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Submit Expense"
        fields={expenseFields}
        onSubmit={handleCreateExpense}
        size="md"
      />
    </Stack>
  );
}
