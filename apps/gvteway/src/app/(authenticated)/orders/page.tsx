'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Ticket, Download, XCircle } from 'lucide-react';
import {
  Body,
  ConfirmDialog,
  DetailDrawer,
  Grid,
  ListPage,
  type DetailSection,
  type ListPageAction,
  type ListPageBulkAction,
} from '@ghxstship/ui';
import { createExportHandler, useEntityConfig } from '@ghxstship/config';
import { useOrders, type Order } from '@/hooks/useOrders';

export default function OrdersPage() {
  const router = useRouter();
  const { data: orders = [], isLoading, error, refetch } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  // SSOT: Get columns and filters from entity registry
  const { columns, filters } = useEntityConfig<Order>({ entityName: 'orders' });

  const rowActions: ListPageAction<Order>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedOrder(row); setDrawerOpen(true); } },
    { id: 'tickets', label: 'View Tickets', icon: <Ticket className="size-4" />, onClick: (row) => router.push(`/tickets?order=${row.id}`), disabled: (row) => row.status !== 'confirmed' },
    { id: 'cancel', label: 'Cancel Order', icon: <XCircle className="size-4" />, variant: 'danger', onClick: (row) => { setSelectedOrder(row); setCancelConfirmOpen(true); }, disabled: (row) => row.status === 'cancelled' || row.status === 'confirmed' },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
  ];

  const handleCancel = async () => {
    if (selectedOrder) {
      try {
        await fetch(`/api/orders/${selectedOrder.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'cancelled' }),
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to cancel order';
        alert(errorMessage);
      }
    }
    setCancelConfirmOpen(false);
    setSelectedOrder(null);
    refetch();
  };

  const totalSpent = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalTickets = orders.reduce((sum, o) => sum + (o.ticket_count || 0), 0);

  const stats = [
    { label: 'Total Orders', value: orders.length },
    { label: 'Total Spent', value: `$${totalSpent.toLocaleString()}` },
    { label: 'Tickets Purchased', value: totalTickets },
  ];

  const detailSections: DetailSection[] = selectedOrder ? [
    {
      id: 'overview',
      title: 'Order Details',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Body size="sm"><strong>Order #:</strong> {selectedOrder.id.slice(0, 8)}</Body>
          <Body size="sm"><strong>Event:</strong> {selectedOrder.gvteway_events?.title || 'Event'}</Body>
          <Body size="sm"><strong>Event Date:</strong> {selectedOrder.gvteway_events?.event_date ? new Date(selectedOrder.gvteway_events.event_date).toLocaleDateString() : 'TBD'}</Body>
          <Body size="sm"><strong>Amount:</strong> ${(selectedOrder.total_amount || 0).toLocaleString()}</Body>
          <Body size="sm"><strong>Tickets:</strong> {selectedOrder.ticket_count || 0}</Body>
          <Body size="sm"><strong>Status:</strong> {selectedOrder.status.toUpperCase()}</Body>
          <Body size="sm"><strong>Ordered:</strong> {new Date(selectedOrder.created_at).toLocaleDateString()}</Body>
        </Grid>
      ),
    },
  ] : [];

  return (
    <>
      <ListPage<Order>
        title="My Orders"
        subtitle="Order history and ticket management"
        data={orders}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search orders..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={async (actionId, selectedIds) => {
          if (actionId === 'export') {
            const selected = orders.filter(o => selectedIds.includes(o.id));
            const csv = [
              ['Order #', 'Event', 'Event Date', 'Amount', 'Tickets', 'Status', 'Ordered'].join(','),
              ...selected.map(o => [o.id.slice(0, 8), o.gvteway_events?.title, o.gvteway_events?.event_date, o.total_amount, o.ticket_count, o.status, o.created_at].join(','))
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'orders-export.csv';
            a.click();
            URL.revokeObjectURL(url);
          }
        }}
        onRowClick={(row) => router.push(`/orders/${row.id}`)}
        entityType="orders"
        onExport={createExportHandler({
          filename: "orders",
          getData: () => orders.map(o => ({
            order_id: o.id.slice(0, 8),
            event: o.gvteway_events?.title,
            event_date: o.gvteway_events?.event_date,
            amount: o.total_amount,
            tickets: o.ticket_count,
            status: o.status,
            ordered: o.created_at,
          })),
        })}
        stats={stats}
        emptyMessage="No orders found"
        emptyAction={{ label: 'Browse Events', onClick: () => router.push('/events') }}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedOrder}
        title={(o) => `Order #${o.id.slice(0, 8)}`}
        subtitle={(o) => o.gvteway_events?.title || 'Event'}
        sections={detailSections}
      />

      <ConfirmDialog
        open={cancelConfirmOpen}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        variant="danger"
        confirmLabel="Cancel Order"
        onConfirm={handleCancel}
        onCancel={() => { setCancelConfirmOpen(false); setSelectedOrder(null); }}
      />
    </>
  );
}
