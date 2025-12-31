"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Check, X, Trash2, Download } from "lucide-react";
// Layout provided by route group
import {
  ListPage, Badge, RecordFormModal, DetailDrawer, ConfirmDialog, useToast, Stack, Grid, Body,
  type ListPageAction, type ListPageBulkAction, type DetailSection} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates, useAuthContext, PlatformRole, useEntityConfig } from "@ghxstship/config";

// Roles that can approve/reject/delete expenses
const ADMIN_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];
import { useExpensesData, type Expense } from "@/hooks/useExpenses";

const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

// SSOT: Columns, filters, and formFields are provided by useEntityConfig

export default function ExpensesPage() {
  const router = useRouter();
  const toast = useToast();
  const { hasRole } = useAuthContext();

  // SSOT: Get columns, filters, and formFields from entity registry
  const { columns, filters, formFields } = useEntityConfig<Expense>({ entityName: 'expenses' });
  
  // RBAC: Check if user has admin access for approve/reject/delete operations
  const canManageExpenses = ADMIN_ROLES.some(role => hasRole(role));
  
  const {
    expenses,
    summary,
    isLoading: loading,
    createExpense,
    updateStatus,
    refetch,
  } = useExpensesData();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const rowActions: ListPageAction<Expense>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedExpense(r); setDrawerOpen(true); } },
    // Only show approve/reject/delete for users with admin roles
    ...(canManageExpenses ? [
      { id: 'approve', label: 'Approve', icon: <Check className="size-4" />, onClick: async (r: Expense) => {
        await updateStatus({ id: r.id, status: 'approved' });
        toast.success('Success', 'Expense approved');
      }},
      { id: 'reject', label: 'Reject', icon: <X className="size-4" />, variant: 'danger' as const, onClick: async (r: Expense) => {
        await updateStatus({ id: r.id, status: 'rejected' });
        toast.success('Success', 'Expense rejected');
      }},
      { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' as const, onClick: (r: Expense) => { setExpenseToDelete(r); setDeleteConfirmOpen(true); } },
    ] : []),
  ];

  const bulkActions: ListPageBulkAction[] = [
    // Only show bulk approve for users with admin roles
    ...(canManageExpenses ? [
      { id: 'approve', label: 'Bulk Approve', icon: <Check className="size-4" /> },
    ] : []),
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await createExpense(data);
    setCreateModalOpen(false);
  };

  const handleDelete = async () => {
    if (expenseToDelete) {
      await fetch(`/api/expenses/${expenseToDelete.id}`, { method: 'DELETE' });
      refetch();
      setDeleteConfirmOpen(false);
      setExpenseToDelete(null);
    }
  };

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Omit<Expense, 'id'>>({
    entityType: 'expenses',
    requiredFields: ['expense_number', 'amount', 'category'],
    onImport: async (records) => {
      for (const record of records) {
        await createExpense(record);
      }
    },
  });

  const importTemplates = getImportTemplates('expenses').length > 0 
    ? getImportTemplates('expenses') 
    : [{ id: 'default', name: 'Expense Import', mapping: { expense_number: 'expense_number', amount: 'amount', category: 'category', description: 'description', expense_date: 'expense_date', status: 'status' } }];

  const stats = [
    { label: 'Total Expenses', value: summary?.total_expenses || expenses.length },
    { label: 'Pending Approval', value: summary?.pending_count || 0 },
    { label: 'Pending Amount', value: formatCurrency(summary?.pending_amount || 0) },
    { label: 'Approved Total', value: formatCurrency(summary?.approved_amount || 0) },
  ];

  const detailSections: DetailSection[] = selectedExpense ? [
    { id: 'overview', title: 'Expense Details', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Stack gap={1}><Body className="font-display">Expense #</Body><Body>{selectedExpense.expense_number}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Status</Body><Body>{selectedExpense.status}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Crew Member</Body><Body>{selectedExpense.crew_member_name}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Project</Body><Body>{selectedExpense.project_name}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Category</Body><Body>{selectedExpense.category}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Amount</Body><Body>{formatCurrency(selectedExpense.amount)}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Date</Body><Body>{formatDate(selectedExpense.expense_date)}</Body></Stack>
        {selectedExpense.approved_by && <Stack gap={1}><Body className="font-display">Approved By</Body><Body>{selectedExpense.approved_by}</Body></Stack>}
        {selectedExpense.description && <Stack gap={1} className="col-span-2"><Body className="font-display">Description</Body><Body>{selectedExpense.description}</Body></Stack>}
      </Grid>
    )},
  ] : [];

  return (
    <>
      <ListPage<Expense>
        title="Production Expenses"
        subtitle="Track and approve crew expenses, per diems, and production costs"
        data={expenses}
        columns={columns}
        rowKey="id"
        loading={loading}
        onRetry={() => refetch()}
        searchPlaceholder="Search expenses..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={async (id, ids) => {
          if (id === 'approve') {
            await Promise.all(ids.map(expenseId =>
              fetch(`/api/expenses/${expenseId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' }),
              })
            ));
            await refetch();
          } else if (id === 'export') {
            const selected = expenses.filter((exp: Expense) => ids.includes(exp.id));
            const csv = [
              ['ID', 'Number', 'Project', 'Crew Member', 'Category', 'Amount', 'Status', 'Date'].join(','),
              ...selected.map((exp: Expense) => [exp.id, exp.expense_number, exp.project_name, exp.crew_member_name, exp.category, exp.amount, exp.status, exp.expense_date].join(','))
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'expenses-export.csv';
            a.click();
            URL.revokeObjectURL(url);
          }
        }}
        onRowClick={(r) => { setSelectedExpense(r); setDrawerOpen(true); }}
        createLabel="Submit Expense"
        onCreate={() => setCreateModalOpen(true)}
        entityType="expenses"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['expense_number', 'amount', 'category', 'description', 'expense_date', 'status']}
        templateDownloadUrl="/templates/financial/expense-report-template.csv"
        onExport={createExportHandler({
          filename: "expenses",
          getData: () => expenses.map((exp: Expense) => ({
            id: exp.id,
            expense_number: exp.expense_number,
            project_name: exp.project_name,
            crew_member_name: exp.crew_member_name,
            category: exp.category,
            description: exp.description,
            amount: exp.amount,
            currency: exp.currency,
            expense_date: exp.expense_date,
            submitted_date: exp.submitted_date,
            status: exp.status,
            approved_by: exp.approved_by || '',
            approved_date: exp.approved_date || '',
          })),
        })}
        stats={stats}
        emptyMessage="No expenses found"
        emptyAction={{ label: 'Submit Expense', onClick: () => setCreateModalOpen(true) }}
        enableCapabilityDetection
        onScanAction={(capability, route) => router.push(route)}
        capabilityBasePath=""
        showFavorite
        showSettings
      />
      <RecordFormModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} mode="create" title="Submit Expense" fields={formFields} onSubmit={handleCreate} size="lg" />
      <DetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} record={selectedExpense} title={(e) => e.expense_number} subtitle={(e) => e.crew_member_name} sections={detailSections} onEdit={(e) => router.push(`/expenses/${e.id}/edit`)} onDelete={(e) => { setExpenseToDelete(e); setDeleteConfirmOpen(true); setDrawerOpen(false); }} />
      <ConfirmDialog open={deleteConfirmOpen} title="Delete Expense" message={`Delete expense "${expenseToDelete?.expense_number}"?`} variant="danger" confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => { setDeleteConfirmOpen(false); setExpenseToDelete(null); }} />
    </>
  );
}
