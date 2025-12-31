'use client';

import {
  Badge,
  ListPage,
  Text,
  useToast,
  type ListPageColumn,
  type ListPageAction,
} from '@ghxstship/ui';
import { Eye, Download } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useRouter } from 'next/navigation';

interface DisplayOrder {
  id: string;
  date: string;
  eventName: string;
  ticketCount: number;
  total: number;
  status: string;
}

export default function AccountOrdersPage() {
  const router = useRouter();
  const toast = useToast();
  const { data: ordersData, isLoading, error, refetch } = useOrders();
  
  const orders: DisplayOrder[] = (ordersData || []).map(order => ({
    id: order.id,
    date: new Date(order.created_at).toLocaleDateString(),
    eventName: order.gvteway_events?.title || 'Event',
    ticketCount: order.ticket_count || 1,
    total: order.total_amount,
    status: order.status === 'confirmed' ? 'completed' : order.status,
  }));

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;

  const handleDownloadReceipt = async (order: DisplayOrder) => {
    try {
      const { PDFGenerator } = await import('@ghxstship/config/pdf-generator');
      const generator = new PDFGenerator({
        title: 'Order Receipt',
        subtitle: `Order #${order.id.slice(0, 8).toUpperCase()}`,
        includeTimestamp: true,
        includePageNumbers: false,
      });

      generator.addHeading('Order Details', 2);
      generator.addKeyValuePairs([
        { label: 'Order ID', value: order.id.slice(0, 8).toUpperCase() },
        { label: 'Date', value: order.date },
        { label: 'Event', value: order.eventName },
        { label: 'Tickets', value: String(order.ticketCount) },
        { label: 'Status', value: order.status.charAt(0).toUpperCase() + order.status.slice(1) },
      ]);

      generator.addSpacer(10);
      generator.addHeading('Payment Summary', 2);
      generator.addKeyValuePairs([
        { label: 'Subtotal', value: formatCurrency(order.total) },
        { label: 'Fees', value: formatCurrency(0) },
        { label: 'Total Paid', value: formatCurrency(order.total) },
      ]);

      generator.addSpacer(20);
      generator.addParagraph('Thank you for your purchase! If you have any questions about your order, please contact support@gvteway.com');

      generator.download(`receipt-${order.id.slice(0, 8)}.pdf`);
      toast.success('Receipt Downloaded', 'Your receipt has been downloaded');
    } catch (err) {
      toast.error('Download Failed', err instanceof Error ? err.message : 'Failed to generate receipt');
    }
  };

  const columns: ListPageColumn<DisplayOrder>[] = [
    { key: 'id', label: 'Order ID', accessor: 'id', sortable: true },
    { key: 'date', label: 'Date', accessor: 'date', sortable: true },
    { key: 'eventName', label: 'Event', accessor: 'eventName', sortable: true },
    { key: 'ticketCount', label: 'Tickets', accessor: 'ticketCount' },
    {
      key: 'total', label: 'Total', accessor: 'total', sortable: true,
      render: (_value: unknown, order) => <Text className="text-right">{formatCurrency(order.total)}</Text>,
    },
    {
      key: 'status', label: 'Status', accessor: 'status', sortable: true,
      render: (_value: unknown, order) => (
        <Badge variant={order.status === 'completed' ? 'success' : order.status === 'pending' ? 'warning' : 'error'}>
          {order.status}
        </Badge>
      ),
    },
  ];

  const rowActions: ListPageAction<DisplayOrder>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (order) => router.push(`/account/orders/${order.id}`) },
    { id: 'download', label: 'Download Receipt', icon: <Download className="h-4 w-4" />, onClick: (order) => handleDownloadReceipt(order) },
  ];

  return (
    <ListPage<DisplayOrder>
      title="Order History"
      subtitle="View your past orders and receipts"
      data={orders}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      error={error}
      onRetry={refetch}
      searchPlaceholder="Search orders..."
      rowActions={rowActions}
      onRowClick={(order) => router.push(`/account/orders/${order.id}`)}
      emptyMessage="No orders yet"
      emptyAction={{ label: 'Browse Events', onClick: () => router.push('/browse') }}
      entityType="orders"
      breadcrumbs={[{ label: 'Account', href: '/account' }, { label: 'Orders' }]}
      enableCapabilityDetection
      onScanAction={(capability, route) => router.push(route)}
      capabilityBasePath=""
      showFavorite
      showSettings
    />
  );
}
