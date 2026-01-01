'use client';

/**
 * Bills List Page
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
import { useBills, useDeleteBill, type Bill } from '@/hooks/useBills';

export default function BillsPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const toast = useToast();
  const canManage = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const { data, isLoading, error, refetch } = useBills();
  const bills = data?.bills || [];
  const deleteMutation = useDeleteBill();

  const handleDelete = async (bill: Bill) => {
    if (!confirm(`Delete bill "${bill.bill_number}"?`)) return;
    try {
      await deleteMutation.mutateAsync(bill.id);
      toast.success("Bill Deleted", `Bill ${bill.bill_number} has been deleted`);
    } catch (err) {
      toast.error('Delete Failed', err instanceof Error ? err.message : 'Failed to delete bill');
    }
  };

  const columns = getEntityColumns<Bill>('bills');
  const filters = getEntityFilters('bills');

  const rowActions: ListPageAction<Bill>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (bill) => router.push(`/finance/bills/${bill.id}`) },
    ...(canManage ? [
      { id: 'edit', label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: (bill: Bill) => router.push(`/finance/bills/${bill.id}/edit`) },
      { id: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" />, variant: 'danger' as const, onClick: (bill: Bill) => handleDelete(bill) },
    ] : []),
  ];

  return (
    <ListPage<Bill>
      title="Bills"
      subtitle="Manage bills and accounts payable"
      data={bills}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      error={error}
      onRetry={refetch}
      searchPlaceholder="Search bills..."
      filters={filters}
      rowActions={rowActions}
      onRowClick={(bill) => router.push(`/finance/bills/${bill.id}`)}
      createLabel="New Bill"
      onCreate={canManage ? () => router.push('/finance/bills/new') : undefined}
      emptyMessage="No bills yet"
      emptyAction={canManage ? { label: 'Add Bill', onClick: () => router.push('/finance/bills/new') } : undefined}
      entityType="bills"
      breadcrumbs={[{ label: 'Finance', href: '/finance' }, { label: 'Bills' }]}
      enableCapabilityDetection
      onScanAction={(capability, route) => router.push(route)}
      capabilityBasePath=""
      showFavorite
      showSettings
    />
  );
}
