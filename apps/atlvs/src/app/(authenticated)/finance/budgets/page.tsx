'use client';

/**
 * Budgets List Page
 * Uses normalized ListPage template from @ghxstship/ui
 */

import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';
import {
  Badge,
  Box,
  ListPage,
  Text,
  useNotifications,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
} from '@ghxstship/ui';
import { useBudgets, useDeleteBudget, type Budget } from '@/hooks/useBudgets';

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'outline'> = {
  draft: 'outline',
  active: 'success',
  closed: 'info',
  over_budget: 'error',
};

export default function BudgetsPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const { addNotification } = useNotifications();
  const canManage = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const { data: budgets = [], isLoading, error, refetch } = useBudgets();
  const deleteMutation = useDeleteBudget();

  const handleDelete = async (budget: Budget) => {
    if (!confirm(`Delete budget "${budget.name}"?`)) return;
    try {
      await deleteMutation.mutateAsync(budget.id);
    } catch (err) {
      addNotification({ type: 'error', title: 'Delete Failed', message: err instanceof Error ? err.message : 'Failed to delete budget' });
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const getUtilization = (budget: Budget) => budget.budgeted ? Math.round(((budget.actual || 0) / budget.budgeted) * 100) : 0;
  const getVarianceColor = (budget: Budget) => {
    const variance = (budget.budgeted || 0) - (budget.actual || 0);
    if (variance < 0) return 'text-error';
    if (variance < (budget.budgeted || 0) * 0.1) return 'text-warning';
    return 'text-success';
  };

  const columns: ListPageColumn<Budget>[] = [
    { key: 'name', label: 'Budget', accessor: 'name', sortable: true },
    { key: 'category', label: 'Category', accessor: (b) => b.category || 'N/A' },
    {
      key: 'status', label: 'Status', accessor: 'status', sortable: true,
      render: (_, budget) => <Badge variant={STATUS_COLORS[budget.status || ''] || 'outline'}>{budget.status || 'draft'}</Badge>,
    },
    {
      key: 'budgeted', label: 'Budgeted', accessor: 'budgeted', sortable: true,
      render: (_, budget) => <Text className="font-weight-medium">{formatCurrency(budget.budgeted || 0)}</Text>,
    },
    {
      key: 'actual', label: 'Spent', accessor: 'actual', sortable: true,
      render: (_, budget) => <Text className={getVarianceColor(budget)}>{formatCurrency(budget.actual || 0)}</Text>,
    },
    {
      key: 'utilization', label: 'Utilization', accessor: (b) => getUtilization(b),
      render: (_, budget) => {
        const utilization = getUtilization(budget);
        return (
          <Box className="flex items-center gap-2">
            {utilization > 100 ? <TrendingDown className="h-4 w-4 text-error" /> : <TrendingUp className="h-4 w-4 text-success" />}
            <Text className={utilization > 100 ? 'text-error' : utilization > 90 ? 'text-warning' : ''}>{utilization}%</Text>
          </Box>
        );
      },
    },
  ];

  const filters: ListPageFilter[] = [
    { key: 'status', label: 'Status', options: [
      { value: 'draft', label: 'Draft' },
      { value: 'active', label: 'Active' },
      { value: 'closed', label: 'Closed' },
    ]},
  ];

  const rowActions: ListPageAction<Budget>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (b) => router.push(`/finance/budgets/${b.id}`) },
    ...(canManage ? [
      { id: 'edit', label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: (b: Budget) => router.push(`/finance/budgets/${b.id}/edit`) },
      { id: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" />, variant: 'danger' as const, onClick: (b: Budget) => handleDelete(b) },
    ] : []),
  ];

  return (
    <ListPage<Budget>
      title="Budgets"
      subtitle="Manage budgets and track spending"
      data={budgets}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      error={error}
      onRetry={refetch}
      searchPlaceholder="Search budgets..."
      filters={filters}
      rowActions={rowActions}
      onRowClick={(b) => router.push(`/finance/budgets/${b.id}`)}
      createLabel="New Budget"
      onCreate={canManage ? () => router.push('/finance/budgets/new') : undefined}
      emptyMessage="No budgets yet"
      emptyAction={canManage ? { label: 'Create Budget', onClick: () => router.push('/finance/budgets/new') } : undefined}
      entityType="budgets"
      breadcrumbs={[{ label: 'Finance', href: '/finance' }, { label: 'Budgets' }]}
      showFavorite
      showSettings
    />
  );
}
