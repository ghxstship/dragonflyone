'use client';

/**
 * Orders Page
 * 
 * SSOT-compliant: Uses entity registry for status colors and formatters.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, Download } from 'lucide-react';
import {
  ListPage, Badge, RecordFormModal, DetailDrawer, ConfirmDialog, Grid, Body, useToast,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type ListPageBulkAction, type FormFieldConfig, type DetailSection,
} from "@ghxstship/ui";
import { 
  createExportHandler, 
  useAuthContext, 
  PlatformRole,
  ORDER_STATUS_COLORS,
  PAYMENT_STATUS_COLORS,
  formatCurrency,
} from '@ghxstship/config';
import { useOrders, useCreateOrder, useDeleteOrder, type Order } from '@/hooks/useOrders';

const ADMIN_ROLES = [
  PlatformRole.ATLVS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

const statusColors = ORDER_STATUS_COLORS;
const paymentColors = PAYMENT_STATUS_COLORS;

const columns: ListPageColumn<Order>[] = [
  { key: 'order_number', label: 'Order #', accessor: 'order_number', sortable: true },
  { key: 'customer', label: 'Customer', accessor: (r) => r.billing_name || r.platform_users?.full_name || r.billing_email || '—' },
  { key: 'event', label: 'Event', accessor: (r) => r.events?.name || '—' },
  { key: 'total', label: 'Total', accessor: (r) => formatCurrency(r.total_amount, r.currency), sortable: true },
  { key: 'payment_status', label: 'Payment', accessor: 'payment_status', render: (v: unknown) => <Badge variant={paymentColors[String(v)] || 'outline'}>{String(v).toUpperCase()}</Badge> },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v: unknown) => <Badge variant={statusColors[String(v)] || 'outline'}>{String(v).toUpperCase()}</Badge> },
  { key: 'created_at', label: 'Date', accessor: (r) => new Date(r.created_at).toLocaleDateString() },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'refunded', label: 'Refunded' },
  ]},
  { key: 'payment_status', label: 'Payment', options: [
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' },
  ]},
];

const formFields: FormFieldConfig[] = [
  { name: 'order_number', label: 'Order Number', type: 'text', required: true },
  { name: 'event_id', label: 'Event ID', type: 'text' },
  { name: 'billing_name', label: 'Customer Name', type: 'text', required: true },
  { name: 'billing_email', label: 'Email', type: 'email', required: true },
  { name: 'billing_phone', label: 'Phone', type: 'text' },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
  ]},
  { name: 'subtotal', label: 'Subtotal', type: 'number', required: true },
  { name: 'tax', label: 'Tax', type: 'number' },
  { name: 'fees', label: 'Fees', type: 'number' },
  { name: 'total_amount', label: 'Total', type: 'number', required: true },
  { name: 'payment_method', label: 'Payment Method', type: 'select', options: [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash' },
  ]},
  { name: 'payment_status', label: 'Payment Status', type: 'select', options: [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' },
  ]},
  { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
];

export default function OrdersPage() {
  const router = useRouter();
  const toast = useToast();
  const { hasRole } = useAuthContext();
  
  // RBAC: Check if user has admin access
  const canManageOrders = ADMIN_ROLES.some(role => hasRole(role));
  
  const { data: orders, isLoading, error, refetch } = useOrders();
  const createMutation = useCreateOrder();
  const deleteMutation = useDeleteOrder();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  const orderList = (orders || []) as Order[];

  const totalRevenue = orderList.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const paidCount = orderList.filter(o => o.payment_status === 'paid').length;

  const stats = [
    { label: 'Total Orders', value: orderList.length },
    { label: 'Paid', value: paidCount },
    { label: 'Pending', value: orderList.filter(o => o.status === 'pending').length },
    { label: 'Revenue', value: formatCurrency(totalRevenue) },
  ];

  const rowActions: ListPageAction<Order>[] = [
    { id: 'view', label: 'View', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedOrder(row); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (row) => router.push(`/orders/${row.id}/edit`) },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (row) => { setOrderToDelete(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createMutation.mutateAsync({
        organization_id: String(data.organization_id || ''),
        order_number: String(data.order_number || `ORD-${Date.now()}`),
        event_id: data.event_id ? String(data.event_id) : undefined,
        billing_name: String(data.billing_name || ''),
        billing_email: String(data.billing_email || ''),
        billing_phone: data.billing_phone ? String(data.billing_phone) : undefined,
        status: String(data.status || 'pending'),
        subtotal: Number(data.subtotal || 0),
        tax: Number(data.tax || 0),
        fees: Number(data.fees || 0),
        total_amount: Number(data.total_amount || 0),
        payment_method: data.payment_method ? String(data.payment_method) : undefined,
        payment_status: String(data.payment_status || 'pending'),
        notes: data.notes ? String(data.notes) : undefined,
      });
      setCreateModalOpen(false);
      toast.success("Order Created", `Order "${data.order_number}" has been created.`);
    } catch (err) {
      toast.error('Failed to Create Order', err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  };

  const handleDelete = async () => {
    if (orderToDelete) {
      try {
        await deleteMutation.mutateAsync(orderToDelete.id);
        setDeleteConfirmOpen(false);
        toast.success("Order Deleted", `Order "${orderToDelete.order_number}" has been deleted.`);
        setOrderToDelete(null);
      } catch (err) {
        toast.error('Failed to Delete Order', err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    }
  };

  const detailSections: DetailSection[] = selectedOrder ? [
    {
      id: 'overview',
      title: 'Order Details',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Body size="sm"><strong>Order #:</strong> {selectedOrder.order_number}</Body>
          <Body size="sm"><strong>Status:</strong> <Badge variant={statusColors[selectedOrder.status]}>{selectedOrder.status.toUpperCase()}</Badge></Body>
          <Body size="sm"><strong>Customer:</strong> {selectedOrder.billing_name || '—'}</Body>
          <Body size="sm"><strong>Email:</strong> {selectedOrder.billing_email || '—'}</Body>
          <Body size="sm"><strong>Phone:</strong> {selectedOrder.billing_phone || '—'}</Body>
          <Body size="sm"><strong>Event:</strong> {selectedOrder.events?.name || '—'}</Body>
          <Body size="sm"><strong>Subtotal:</strong> {formatCurrency(selectedOrder.subtotal, selectedOrder.currency)}</Body>
          <Body size="sm"><strong>Tax:</strong> {formatCurrency(selectedOrder.tax, selectedOrder.currency)}</Body>
          <Body size="sm"><strong>Fees:</strong> {formatCurrency(selectedOrder.fees, selectedOrder.currency)}</Body>
          <Body size="sm"><strong>Total:</strong> {formatCurrency(selectedOrder.total_amount, selectedOrder.currency)}</Body>
          <Body size="sm"><strong>Payment:</strong> <Badge variant={paymentColors[selectedOrder.payment_status]}>{selectedOrder.payment_status.toUpperCase()}</Badge></Body>
          <Body size="sm"><strong>Method:</strong> {selectedOrder.payment_method || '—'}</Body>
          {selectedOrder.notes && <Body size="sm" className="col-span-2"><strong>Notes:</strong> {selectedOrder.notes}</Body>}
        </Grid>
      ),
    },
  ] : [];

  return (
    <>
      <ListPage<Order>
        title="Order Management"
        subtitle="Manage ticket orders and transactions"
        data={orderList}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search orders..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => { setSelectedOrder(row); setDrawerOpen(true); }}
        createLabel="Create Order"
        onCreate={canManageOrders ? () => setCreateModalOpen(true) : undefined}
        onExport={createExportHandler({
          filename: 'orders',
          getData: () => orderList.map(o => ({
            order_number: o.order_number,
            customer: o.billing_name,
            email: o.billing_email,
            total: o.total_amount,
            status: o.status,
            payment_status: o.payment_status,
            date: o.created_at,
          })),
        })}
        stats={stats}
        emptyMessage="No orders yet"
        emptyAction={canManageOrders ? { label: 'Create First Order', onClick: () => setCreateModalOpen(true) } : undefined}
        bulkActions={bulkActions}
      />
      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create Order"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />
      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedOrder}
        title={(order) => `Order ${order.order_number}`}
        subtitle={(order) => formatCurrency(order.total_amount, order.currency)}
        sections={detailSections}
        onEdit={(order) => router.push(`/orders/${order.id}/edit`)}
        onDelete={(order) => { setOrderToDelete(order); setDeleteConfirmOpen(true); setDrawerOpen(false); }}
      />
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Order"
        message={`Delete order "${orderToDelete?.order_number}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setOrderToDelete(null); }}
      />
    </>
  );
}
