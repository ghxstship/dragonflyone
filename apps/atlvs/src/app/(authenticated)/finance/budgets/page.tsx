'use client';

/**
 * Budgets List Page
 * 
 * SSOT-compliant: Uses entity registry for columns, filters, status colors.
 * All UI configuration comes from @ghxstship/config/entity-registry.
 */

import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { 
  useAuthContext, 
  ATLVS_ADMIN_ROLES,
  BUDGET_STATUS_COLORS,
  formatCurrency,
  formatDate,
} from '@ghxstship/config';
import {
  Badge, ListPage, Text, useToast,
  type ListPageColumn, type ListPageFilter, type ListPageAction,
} from "@ghxstship/ui";
import { useBudgets, useDeleteBudget, type Budget } from '@/hooks/useBudgets';

export default function BudgetsPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const toast = useToast();
  const canManage = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const { data: budgets = [], isLoading, error, refetch } = useBudgets();
  const deleteMutation = useDeleteBudget();

  const handleDelete = async (budget: Budget) => {
    if (!confirm(`Delete budget "${budget.name}"?`)) return;
    try {
      await deleteMutation.mutateAsync(budget.id);
    } catch (err) {
      toast.error('Delete Failed', err instanceof Error ? err.message : 'Failed to delete budget');
    }
  };

  const columns: ListPageColumn<Budget>[] = [
    { key: 'name', label: 'Budget', accessor: 'name', sortable: true },
    { key: 'fiscal_year', label: 'Fiscal Year', accessor: (b) => b.fiscal_year?.toString() || 'N/A', sortable: true },
    {
      key: 'status', label: 'Status', accessor: 'status', sortable: true,
      render: (value: unknown) => <Badge variant={BUDGET_STATUS_COLORS[String(value) || ''] || 'outline'}>{String(value) || 'draft'}</Badge>,
    },
    {
      key: 'total_amount', label: 'Total Amount', accessor: 'total_amount', sortable: true,
      render: (value: unknown) => <Text className="font-weight-medium">{formatCurrency(Number(value) || 0)}</Text>,
    },
    {
      key: 'period', label: 'Period', accessor: (b) => `${formatDate(b.start_date || '')} - ${formatDate(b.end_date || '')}`,
    },
    {
      key: 'currency', label: 'Currency', accessor: (b) => b.currency || 'USD',
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
      enableCapabilityDetection
      onScanAction={(capability, route) => router.push(route)}
      capabilityBasePath=""
      showFavorite
      showSettings
    />
  );
}
