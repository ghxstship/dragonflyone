'use client';

/**
 * Budgets List Page
 * 
 * SSOT-compliant: Uses entity registry for columns and filters.
 */

import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { 
  useAuthContext, 
  ATLVS_ADMIN_ROLES,
  getEntityColumns,
  getEntityFilters,
} from '@ghxstship/config';
import {
  ListPage, useToast,
  type ListPageAction,
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

  const columns = getEntityColumns<Budget>('budgets');
  const filters = getEntityFilters('budgets');

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
