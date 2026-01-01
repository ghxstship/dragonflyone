'use client';

/**
 * Purchase Orders List Page
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
import { usePurchaseOrders, useDeletePurchaseOrder, type PurchaseOrder } from '@/hooks/usePurchaseOrders';

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const toast = useToast();
  const canManage = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const { data: purchaseOrders = [], isLoading, error, refetch } = usePurchaseOrders();
  const deleteMutation = useDeletePurchaseOrder();

  const handleDelete = async (po: PurchaseOrder) => {
    if (!confirm(`Delete purchase order "${po.po_number}"?`)) return;
    try {
      await deleteMutation.mutateAsync(po.id);
    } catch (err) {
      toast.error('Delete Failed', err instanceof Error ? err.message : 'Failed to delete purchase order');
    }
  };

  const columns = getEntityColumns<PurchaseOrder>('purchase-orders');
  const filters = getEntityFilters('purchase-orders');

  const rowActions: ListPageAction<PurchaseOrder>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (po) => router.push(`/finance/purchase-orders/${po.id}`) },
    ...(canManage ? [
      { id: 'edit', label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: (po: PurchaseOrder) => router.push(`/finance/purchase-orders/${po.id}/edit`) },
      { id: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" />, variant: 'danger' as const, onClick: (po: PurchaseOrder) => handleDelete(po) },
    ] : []),
  ];

  return (
    <ListPage<PurchaseOrder>
      title="Purchase Orders"
      subtitle="Manage purchase orders and procurement"
      data={purchaseOrders}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      error={error}
      onRetry={refetch}
      searchPlaceholder="Search purchase orders..."
      filters={filters}
      rowActions={rowActions}
      onRowClick={(po) => router.push(`/finance/purchase-orders/${po.id}`)}
      createLabel="New Purchase Order"
      onCreate={canManage ? () => router.push('/finance/purchase-orders/new') : undefined}
      emptyMessage="No purchase orders yet"
      emptyAction={canManage ? { label: 'Create PO', onClick: () => router.push('/finance/purchase-orders/new') } : undefined}
      entityType="purchase-orders"
      breadcrumbs={[{ label: 'Finance', href: '/finance' }, { label: 'Purchase Orders' }]}
      enableCapabilityDetection
      onScanAction={(capability, route) => router.push(route)}
      capabilityBasePath=""
      showFavorite
      showSettings
    />
  );
}
