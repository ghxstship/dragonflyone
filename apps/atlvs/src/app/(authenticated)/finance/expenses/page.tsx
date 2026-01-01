'use client';

/**
 * Expenses List Page
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
import { useExpenses, useDeleteExpense, type Expense } from '@/hooks/useExpenses';

export default function ExpensesPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const toast = useToast();
  const canManage = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const { data: expenses = [], isLoading, error, refetch } = useExpenses({});
  const deleteMutation = useDeleteExpense();

  const handleDelete = async (exp: Expense) => {
    if (!confirm(`Delete expense "${exp.description}"?`)) return;
    try {
      await deleteMutation.mutateAsync(exp.id);
    } catch (err) {
      toast.error('Delete Failed', err instanceof Error ? err.message : 'Failed to delete expense');
    }
  };

  const columns = getEntityColumns<Expense>('expenses');
  const filters = getEntityFilters('expenses');

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
      enableCapabilityDetection
      onScanAction={(capability, route) => router.push(route)}
      capabilityBasePath=""
      showFavorite
      showSettings
    />
  );
}
