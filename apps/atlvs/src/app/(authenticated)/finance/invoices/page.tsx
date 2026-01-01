'use client';

/**
 * Invoices List Page
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
import { useInvoices, useDeleteInvoice, type Invoice } from '@/hooks/useInvoices';

export default function InvoicesPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const toast = useToast();
  const canManage = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const { data: invoices = [], isLoading, error, refetch } = useInvoices();
  const deleteMutation = useDeleteInvoice();

  const handleDelete = async (inv: Invoice) => {
    if (!confirm(`Delete invoice ${inv.invoice_number}?`)) return;
    try {
      await deleteMutation.mutateAsync(inv.id);
    } catch (err) {
      toast.error('Delete Failed', err instanceof Error ? err.message : 'Failed to delete invoice');
    }
  };

  const columns = getEntityColumns<Invoice>('invoices');
  const filters = getEntityFilters('invoices');

  const rowActions: ListPageAction<Invoice>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (inv) => router.push(`/finance/invoices/${inv.id}`) },
    ...(canManage ? [
      { id: 'edit', label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: (inv: Invoice) => router.push(`/finance/invoices/${inv.id}/edit`) },
      { id: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" />, variant: 'danger' as const, onClick: (inv: Invoice) => handleDelete(inv) },
    ] : []),
  ];

  return (
    <ListPage<Invoice>
      title="Invoices"
      subtitle="Manage invoices and accounts receivable"
      data={invoices}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      error={error}
      onRetry={refetch}
      searchPlaceholder="Search invoices..."
      filters={filters}
      rowActions={rowActions}
      onRowClick={(inv) => router.push(`/finance/invoices/${inv.id}`)}
      createLabel="New Invoice"
      onCreate={canManage ? () => router.push('/finance/invoices/new') : undefined}
      emptyMessage="No invoices yet"
      emptyAction={canManage ? { label: 'Create Invoice', onClick: () => router.push('/finance/invoices/new') } : undefined}
      entityType="invoices"
      breadcrumbs={[{ label: 'Finance', href: '/finance' }, { label: 'Invoices' }]}
      enableCapabilityDetection
      onScanAction={(capability, route) => router.push(route)}
      capabilityBasePath=""
      showFavorite
      showSettings
    />
  );
}
