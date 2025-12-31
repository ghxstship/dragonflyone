'use client';

/**
 * Vendor Portal Dashboard
 * 
 * SSOT-compliant: Uses entity registry for status colors.
 */

import { useRouter } from 'next/navigation';
import { 
  Package, FileText, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, ChevronRight, ShoppingCart,
} from 'lucide-react';
import {
  DetailPage, Badge, Body, Button, Card, Grid, Stack, StatCard, Text,
} from '@ghxstship/ui';
import { ORDER_STATUS_COLORS, FINANCIAL_STATUS_COLORS } from '@ghxstship/config';
import { useQuery } from '@tanstack/react-query';

interface VendorStats {
  activeOrders: number;
  pendingInvoices: number;
  totalRevenue: number;
  catalogItems: number;
}

interface Order {
  id: string;
  order_number: string;
  project_name: string;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  due_date: string;
}

const STATUS_COLORS = { ...ORDER_STATUS_COLORS, ...FINANCIAL_STATUS_COLORS };

const DEMO_STATS: VendorStats = {
  activeOrders: 12,
  pendingInvoices: 5,
  totalRevenue: 45680,
  catalogItems: 156,
};

const DEMO_ORDERS: Order[] = [
  { id: '1', order_number: 'PO-2024-001', project_name: 'Summer Festival', total: 12500, status: 'confirmed', created_at: '2024-11-20' },
  { id: '2', order_number: 'PO-2024-002', project_name: 'Concert Series', total: 8750, status: 'pending', created_at: '2024-11-22' },
  { id: '3', order_number: 'PO-2024-003', project_name: 'Corporate Gala', total: 5200, status: 'shipped', created_at: '2024-11-18' },
];

const DEMO_INVOICES: Invoice[] = [
  { id: '1', invoice_number: 'INV-2024-045', amount: 12500, status: 'sent', due_date: '2024-12-15' },
  { id: '2', invoice_number: 'INV-2024-044', amount: 8750, status: 'paid', due_date: '2024-11-30' },
  { id: '3', invoice_number: 'INV-2024-043', amount: 3200, status: 'overdue', due_date: '2024-11-10' },
];

export default function VendorPortalPage() {
  const router = useRouter();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['vendor-portal'],
    queryFn: async () => {
      const response = await fetch('/api/portals/vendor');
      if (!response.ok) {
        return { stats: DEMO_STATS, orders: DEMO_ORDERS, invoices: DEMO_INVOICES };
      }
      const result = await response.json();
      return {
        stats: result.stats || DEMO_STATS,
        orders: result.orders || DEMO_ORDERS,
        invoices: result.invoices || DEMO_INVOICES,
      };
    },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const { stats, orders, invoices } = data || { stats: DEMO_STATS, orders: DEMO_ORDERS, invoices: DEMO_INVOICES };

  return (
    <DetailPage
      header={{
        kicker: "Portals",
        title: "Vendor Portal",
        description: "Manage your orders, invoices, and product catalog",
      }}
      backButton={{ label: "Back to Portals", href: "/portals" }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={() => refetch()}
    >
      <Stack gap={8}>
        {/* Stats */}
        <Grid cols={4} gap={4}>
          <StatCard
            label="Active Orders"
            value={stats.activeOrders.toString()}
            icon={<ShoppingCart className="h-5 w-5" />}
          />
          <StatCard
            label="Pending Invoices"
            value={stats.pendingInvoices.toString()}
            icon={<FileText className="h-5 w-5" />}
          />
          <StatCard
            label="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={<DollarSign className="h-5 w-5" />}
          />
          <StatCard
            label="Catalog Items"
            value={stats.catalogItems.toString()}
            icon={<Package className="h-5 w-5" />}
          />
        </Grid>

        {/* Quick Actions */}
        <Card className="p-6">
          <Stack gap={4}>
            <Text className="text-h4-desktop font-weight-semibold">Quick Actions</Text>
            <Grid cols={4} gap={3}>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => router.push('/portals/vendor/orders')}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                View Orders
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => router.push('/portals/vendor/invoices')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Manage Invoices
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => router.push('/portals/vendor/catalog')}
              >
                <Package className="h-4 w-4 mr-2" />
                Product Catalog
              </Button>
              <Button 
                variant="outline" 
                className="justify-start"
                onClick={() => router.push('/portals/vendor/reports')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </Grid>
          </Stack>
        </Card>

        <Grid cols={2} gap={6}>
          {/* Recent Orders */}
          <Card className="p-6">
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <Text className="text-h4-desktop font-weight-semibold">Recent Orders</Text>
                <Button variant="ghost" size="sm" onClick={() => router.push('/portals/vendor/orders')}>
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Stack>
              {orders.length === 0 ? (
                <Body className="text-muted-foreground">No orders yet</Body>
              ) : (
                <Stack gap={3}>
                  {orders.slice(0, 5).map((order: Order) => (
                    <Stack 
                      key={order.id} 
                      direction="horizontal" 
                      className="items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <Stack gap={1}>
                        <Text className="font-weight-medium">{order.order_number}</Text>
                        <Body size="sm" className="text-muted-foreground">{order.project_name}</Body>
                      </Stack>
                      <Stack gap={1} className="items-end">
                        <Text className="font-weight-medium">{formatCurrency(order.total)}</Text>
                        <Badge variant={STATUS_COLORS[order.status] || 'outline'}>
                          {order.status}
                        </Badge>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Stack>
          </Card>

          {/* Recent Invoices */}
          <Card className="p-6">
            <Stack gap={4}>
              <Stack direction="horizontal" className="items-center justify-between">
                <Text className="text-h4-desktop font-weight-semibold">Recent Invoices</Text>
                <Button variant="ghost" size="sm" onClick={() => router.push('/portals/vendor/invoices')}>
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Stack>
              {invoices.length === 0 ? (
                <Body className="text-muted-foreground">No invoices yet</Body>
              ) : (
                <Stack gap={3}>
                  {invoices.slice(0, 5).map((invoice: Invoice) => (
                    <Stack 
                      key={invoice.id} 
                      direction="horizontal" 
                      className="items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <Stack gap={1}>
                        <Text className="font-weight-medium">{invoice.invoice_number}</Text>
                        <Body size="sm" className="text-muted-foreground">
                          Due: {formatDate(invoice.due_date)}
                        </Body>
                      </Stack>
                      <Stack gap={1} className="items-end">
                        <Text className="font-weight-medium">{formatCurrency(invoice.amount)}</Text>
                        <Badge variant={STATUS_COLORS[invoice.status] || 'outline'}>
                          {invoice.status === 'overdue' && <AlertCircle className="h-3 w-3 mr-1" />}
                          {invoice.status === 'paid' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {invoice.status === 'sent' && <Clock className="h-3 w-3 mr-1" />}
                          {invoice.status}
                        </Badge>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Stack>
          </Card>
        </Grid>
      </Stack>
    </DetailPage>
  );
}
