'use client';

/**
 * Purchase Orders List Page
 * Uses normalized ListPage template from @ghxstship/ui
 */

import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, CheckCircle, Truck } from 'lucide-react';
import { useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';
import {
  Badge, Body, Box, ListPage, Stack, Text, useNotifications} from '@ghxstship/ui';
import { usePurchaseOrders, useDeletePurchaseOrder, type PurchaseOrder } from '@/hooks/usePurchaseOrders';

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'outline'> = {
  draft: 'outline',
  pending: 'warning',
  approved: 'info',
  ordered: 'info',
  received: 'success',
  cancelled: 'error',
};

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const { addNotification } = useNotifications();
  const canManage = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const { data: purchaseOrders = [], isLoading, error, refetch } = usePurchaseOrders();
  const deleteMutation = useDeletePurchaseOrder();

  const handleDelete = async (po: PurchaseOrder) => {
    if (!confirm(`Delete purchase order "${po.po_number}"?`)) return;
    try {
      await deleteMutation.mutateAsync(po.id);
    } catch (err) {
      addNotification({ type: 'error', title: 'Delete Failed', message: err instanceof Error ? err.message : 'Failed to delete purchase order' });
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (dateStr: string | null | undefined) => dateStr ? new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

  const columns: ListPageColumn<PurchaseOrder>[] = [
    { key: 'po_number', label: 'PO Number', accessor: 'po_number', sortable: true },
    {
      key: 'vendor', label: 'Vendor', accessor: (po) => po.vendor?.name || 'Unknown', sortable: true,
      render: (_, po) => (
        <Box>
          <Text>{po.vendor?.name || 'Unknown'}</Text>
          {po.category && <Body size="sm" className="text-muted-foreground">{po.category}</Body>}
        </Box>
      ),
    },
    {
      key: 'status', label: 'Status', accessor: 'status', sortable: true,
      render: (_, po) => (
        <Badge variant={STATUS_COLORS[po.status] || 'outline'}>
          <Stack direction="horizontal" gap={1} className="items-center">
            {po.status === 'received' && <CheckCircle className="h-3 w-3" />}
            {po.status === 'ordered' && <Truck className="h-3 w-3" />}
            {po.status}
          </Stack>
        </Badge>
      ),
    },
    {
      key: 'total_amount', label: 'Amount', accessor: 'total_amount', sortable: true,
      render: (_, po) => <Text className="font-weight-medium">{formatCurrency(po.total_amount || 0)}</Text>,
    },
    {
      key: 'priority', label: 'Priority', accessor: 'priority', sortable: true,
    },
    {
      key: 'created_at', label: 'Created', accessor: 'created_at', sortable: true,
      render: (_, po) => <Text>{formatDate(po.created_at)}</Text>,
    },
  ];

  const filters: ListPageFilter[] = [
    { key: 'status', label: 'Status', options: [
      { value: 'draft', label: 'Draft' },
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'ordered', label: 'Ordered' },
      { value: 'received', label: 'Received' },
      { value: 'cancelled', label: 'Cancelled' },
    ]},
  ];

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
      showFavorite
      showSettings
    />
  );
}
