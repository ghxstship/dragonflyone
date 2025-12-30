'use client';

/**
 * Expenses List Page
 * Uses normalized ListPage template from @ghxstship/ui
 */

import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';
import {
  Badge, Body, Box, ListPage, Stack, Text, useNotifications} from '@ghxstship/ui';
import { useExpenses, useDeleteExpense, type Expense } from '@/hooks/useExpenses';

const STATUS_COLORS: Record<Expense['status'], 'success' | 'warning' | 'error' | 'info' | 'outline'> = {
  draft: 'outline',
  submitted: 'info',
  approved: 'success',
  rejected: 'error',
  paid: 'success',
  reimbursed: 'success',
};

export default function ExpensesPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const { addNotification } = useNotifications();
  const canManage = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const { data: expenses = [], isLoading, error, refetch } = useExpenses({});
  const deleteMutation = useDeleteExpense();

  const handleDelete = async (exp: Expense) => {
    if (!confirm(`Delete expense "${exp.description}"?`)) return;
    try {
      await deleteMutation.mutateAsync(exp.id);
    } catch (err) {
      addNotification({ type: 'error', title: 'Delete Failed', message: err instanceof Error ? err.message : 'Failed to delete expense' });
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (dateStr: string | null | undefined) => dateStr ? new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

  const columns: ListPageColumn<Expense>[] = [
    {
      key: 'description', label: 'Description', accessor: 'description', sortable: true,
      render: (_, exp) => (
        <Box>
          <Text className="font-weight-medium">{exp.description}</Text>
          {exp.vendor_name && <Body size="sm" className="text-muted-foreground">{exp.vendor_name}</Body>}
        </Box>
      ),
    },
    {
      key: 'submitter', label: 'Submitted By', accessor: (exp) => `${exp.submitter?.first_name || ''} ${exp.submitter?.last_name || ''}`.trim() || 'Unknown',
    },
    { key: 'category', label: 'Category', accessor: (exp) => exp.category?.name || 'Uncategorized' },
    {
      key: 'status', label: 'Status', accessor: 'status', sortable: true,
      render: (_, exp) => (
        <Badge variant={STATUS_COLORS[exp.status]}>
          <Stack direction="horizontal" gap={1} className="items-center">
            {exp.status === 'approved' && <CheckCircle className="h-3 w-3" />}
            {exp.status === 'rejected' && <XCircle className="h-3 w-3" />}
            {exp.status}
          </Stack>
        </Badge>
      ),
    },
    {
      key: 'amount', label: 'Amount', accessor: 'amount', sortable: true,
      render: (_, exp) => <Text className="font-weight-medium">{formatCurrency(exp.amount)}</Text>,
    },
    {
      key: 'expense_date', label: 'Date', accessor: 'expense_date', sortable: true,
      render: (_, exp) => <Text>{formatDate(exp.expense_date)}</Text>,
    },
  ];

  const filters: ListPageFilter[] = [
    { key: 'status', label: 'Status', options: [
      { value: 'draft', label: 'Draft' },
      { value: 'submitted', label: 'Submitted' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
      { value: 'paid', label: 'Paid' },
      { value: 'reimbursed', label: 'Reimbursed' },
    ]},
  ];

  const rowActions: ListPageAction<Expense>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (exp) => router.push(`/finance/expenses/${exp.id}`) },
    ...(canManage ? [
      { id: 'edit', label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: (exp: Expense) => router.push(`/finance/expenses/${exp.id}/edit`) },
      { id: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" />, variant: 'danger' as const, onClick: (exp: Expense) => handleDelete(exp) },
    ] : []),
  ];

  return (
    <ListPage<Expense>
      title="Expenses"
      subtitle="Manage expenses and reimbursements"
      data={expenses}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      error={error}
      onRetry={refetch}
      searchPlaceholder="Search expenses..."
      filters={filters}
      rowActions={rowActions}
      onRowClick={(exp) => router.push(`/finance/expenses/${exp.id}`)}
      createLabel="New Expense"
      onCreate={canManage ? () => router.push('/finance/expenses/new') : undefined}
      emptyMessage="No expenses yet"
      emptyAction={canManage ? { label: 'Add Expense', onClick: () => router.push('/finance/expenses/new') } : undefined}
      entityType="expenses"
      breadcrumbs={[{ label: 'Finance', href: '/finance' }, { label: 'Expenses' }]}
      showFavorite
      showSettings
    />
  );
}
