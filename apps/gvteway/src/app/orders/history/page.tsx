'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import {
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  Pagination,
  Kicker,
} from '@ghxstship/ui';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  type: 'ticket' | 'merchandise' | 'addon';
}

interface Order {
  id: string;
  order_number: string;
  event_title: string;
  event_date: string;
  event_venue: string;
  event_image?: string;
  items: OrderItem[];
  subtotal: number;
  fees: number;
  tax: number;
  total: number;
  status: 'completed' | 'pending' | 'cancelled' | 'refunded';
  payment_method: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 10;

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(dateFilter !== 'all' && { period: dateFilter }),
      });

      const response = await fetch(`/api/orders/history?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(search) ||
      order.event_title.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success-500 text-white">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-warning-500 text-white">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-error-500 text-white">Cancelled</Badge>;
      case 'refunded':
        return <Badge className="bg-ink-500 text-white">Refunded</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleViewTickets = (orderId: string) => {
    router.push(`/tickets?order=${orderId}`);
  };

  const handleRequestRefund = async (orderId: string) => {
    if (!confirm('Are you sure you want to request a refund for this order?')) return;
    
    try {
      const response = await fetch(`/api/orders/${orderId}/refund`, {
        method: 'POST',
      });
      if (response.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error('Failed to request refund');
    }
  };

  const handleDownloadReceipt = async (orderId: string) => {
    window.open(`/api/orders/${orderId}/receipt`, '_blank');
  };

  const totalSpent = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

  if (loading) {
    return <GvtewayLoadingLayout text="Loading orders..." />;
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Account</Kicker>
              <H2 size="lg" className="text-white">Order History</H2>
              <Body className="text-on-dark-muted">
                View and manage all your past purchases
              </Body>
            </Stack>

        <Grid cols={4} gap={4} className="mb-8">
          <Card className="p-4">
            <Label className="text-ink-500">Total Orders</Label>
            <H2>{orders.length}</H2>
          </Card>
          <Card className="p-4">
            <Label className="text-ink-500">Completed</Label>
            <H2>{orders.filter(o => o.status === 'completed').length}</H2>
          </Card>
          <Card className="p-4">
            <Label className="text-ink-500">Total Spent</Label>
            <H2>${totalSpent.toFixed(2)}</H2>
          </Card>
          <Card className="p-4">
            <Label className="text-ink-500">This Year</Label>
            <H2>
              {orders.filter(o => 
                new Date(o.created_at).getFullYear() === new Date().getFullYear()
              ).length}
            </H2>
          </Card>
        </Grid>

        <Card className="p-6 mb-8">
          <Grid cols={4} gap={4}>
            <Field label="Search" className="col-span-2">
              <Input
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder="Order number or event name..."
              />
            </Field>

            <Field label="Status">
              <Select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </Select>
            </Field>

            <Field label="Time Period">
              <Select
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
              >
                <option value="all">All Time</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </Select>
            </Field>
          </Grid>
        </Card>

        {paginatedOrders.length > 0 ? (
          <Stack gap={4}>
            {paginatedOrders.map(order => (
              <Card key={order.id} className="overflow-hidden">
                <Stack
                  direction="horizontal"
                  className="p-6 cursor-pointer hover:bg-ink-50"
                  onClick={() => setExpandedOrder(
                    expandedOrder === order.id ? null : order.id
                  )}
                >
                  <Stack className="flex-1" gap={2}>
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <H3>{order.event_title}</H3>
                      {getStatusBadge(order.status)}
                    </Stack>
                    <Body className="text-ink-600">{order.event_date} • {order.event_venue}</Body>
                    <Stack direction="horizontal" gap={4} className="mt-2">
                      <Stack>
                        <Label className="text-ink-500 text-mono-xs">Order #</Label>
                        <Body className="font-mono text-body-sm">{order.order_number}</Body>
                      </Stack>
                      <Stack>
                        <Label className="text-ink-500 text-mono-xs">Date</Label>
                        <Body className="text-body-sm">
                          {new Date(order.created_at).toLocaleDateString()}
                        </Body>
                      </Stack>
                      <Stack>
                        <Label className="text-ink-500 text-mono-xs">Items</Label>
                        <Body className="text-body-sm">{order.items.length}</Body>
                      </Stack>
                    </Stack>
                  </Stack>
                  <Stack className="items-end">
                    <H2>${order.total.toFixed(2)}</H2>
                    <Body className="text-body-sm text-ink-500">{order.payment_method}</Body>
                  </Stack>
                </Stack>

                {expandedOrder === order.id && (
                  <Stack className="border-t border-ink-200 p-6 bg-ink-50">
                    <H3 className="mb-4">ORDER DETAILS</H3>
                    
                    <Stack gap={2} className="mb-4">
                      {order.items.map(item => (
                        <Stack
                          key={item.id}
                          direction="horizontal"
                          className="justify-between py-2 border-b border-ink-200"
                        >
                          <Stack direction="horizontal" gap={2}>
                            <Badge variant="outline" className="text-mono-xs">
                              {item.type}
                            </Badge>
                            <Body>{item.name}</Body>
                            <Body className="text-ink-500">x{item.quantity}</Body>
                          </Stack>
                          <Body className="font-mono">${(item.price * item.quantity).toFixed(2)}</Body>
                        </Stack>
                      ))}
                    </Stack>

                    <Stack gap={1} className="mb-4">
                      <Stack direction="horizontal" className="justify-between">
                        <Body className="text-ink-600">Subtotal</Body>
                        <Body className="font-mono">${order.subtotal.toFixed(2)}</Body>
                      </Stack>
                      <Stack direction="horizontal" className="justify-between">
                        <Body className="text-ink-600">Fees</Body>
                        <Body className="font-mono">${order.fees.toFixed(2)}</Body>
                      </Stack>
                      <Stack direction="horizontal" className="justify-between">
                        <Body className="text-ink-600">Tax</Body>
                        <Body className="font-mono">${order.tax.toFixed(2)}</Body>
                      </Stack>
                      <Stack direction="horizontal" className="justify-between pt-2 border-t border-ink-300">
                        <Body className="font-bold">Total</Body>
                        <Body className="font-mono font-bold">${order.total.toFixed(2)}</Body>
                      </Stack>
                    </Stack>

                    <Stack direction="horizontal" gap={2}>
                      {order.status === 'completed' && (
                        <>
                          <Button variant="solid" onClick={() => handleViewTickets(order.id)}>
                            View Tickets
                          </Button>
                          <Button variant="outline" onClick={() => handleDownloadReceipt(order.id)}>
                            Download Receipt
                          </Button>
                        </>
                      )}
                      {order.status === 'completed' && new Date(order.event_date) > new Date() && (
                        <Button variant="ghost" onClick={() => handleRequestRefund(order.id)}>
                          Request Refund
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                )}
              </Card>
            ))}

            {totalPages > 1 && (
              <Stack className="items-center mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </Stack>
            )}
          </Stack>
        ) : (
          <Card className="p-12 text-center">
            <H3 className="mb-4">NO ORDERS FOUND</H3>
            <Body className="text-ink-600 mb-6">
              {searchTerm || statusFilter !== 'all'
                ? 'No orders match your search criteria.'
                : "You haven't made any purchases yet."}
            </Body>
            <Button variant="solid" onClick={() => router.push('/browse')}>
              Browse Events
            </Button>
          </Card>
        )}
          </Stack>
    </GvtewayAppLayout>
  );
}
