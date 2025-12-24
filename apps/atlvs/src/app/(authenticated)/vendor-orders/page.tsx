'use client';

import {
  Body,
  Button,
  H1,
  H3,
  Input,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Search, Filter, Package, Clock, CheckCircle, XCircle, Send, Eye } from 'lucide-react';
import { useVendorOrders } from '@/hooks/useVendorOrders';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: Clock },
  pending_approval: { label: 'Pending Approval', color: 'bg-warning/20 text-warning', icon: Clock },
  approved: { label: 'Approved', color: 'bg-primary/20 text-primary', icon: CheckCircle },
  sent: { label: 'Sent', color: 'bg-info/20 text-info', icon: Send },
  acknowledged: { label: 'Acknowledged', color: 'bg-info/20 text-info', icon: CheckCircle },
  in_progress: { label: 'In Progress', color: 'bg-primary/20 text-primary', icon: Package },
  completed: { label: 'Completed', color: 'bg-success/20 text-success', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/20 text-destructive', icon: XCircle },
};

export default function VendorOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, error } = useVendorOrders({
    organization_id: 'current',
    status: statusFilter || undefined,
  });

  const filteredOrders = data?.orders?.filter((order) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.order_number?.toLowerCase().includes(query) ||
      order.vendor?.name?.toLowerCase().includes(query) ||
      order.booking?.event_name?.toLowerCase().includes(query)
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-card w-1/3" />
          <div className="h-64 bg-muted rounded-card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 text-destructive">
          Failed to load vendor orders. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H1 className="text-h2-md font-weight-bold text-foreground">Vendor Orders</H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            Create and manage orders to vendors with approval workflows
          </Body>
        </div>
        <Link
          href="/vendor-orders/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Order
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(STATUS_CONFIG).slice(0, 4).map(([status, config]) => {
          const count = data?.orders?.filter((o) => o.status === status).length || 0;
          const StatusIcon = config.icon;
          return (
            <Button
              key={status}
              onClick={() => setStatusFilter(statusFilter === status ? '' : status)}
              className={`p-4 rounded-card border-2 transition-all ${
                statusFilter === status
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-card ${config.color}`}>
                  <StatusIcon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="text-h4-md font-weight-bold text-foreground">{count}</div>
                  <div className="text-body-xs text-muted-foreground">{config.label}</div>
                </div>
              </div>
            </Button>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Statuses</option>
            {Object.entries(STATUS_CONFIG).map(([status, config]) => (
              <option key={status} value={status}>
                {config.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {(!filteredOrders || filteredOrders.length === 0) && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <H3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No orders found
          </H3>
          <Body className="text-body-sm text-muted-foreground mb-4">
            {statusFilter
              ? `No orders with status "${STATUS_CONFIG[statusFilter as keyof typeof STATUS_CONFIG]?.label}"`
              : 'Create your first vendor order to get started.'}
          </Body>
          <Link
            href="/vendor-orders/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm"
          >
            <Plus className="h-4 w-4" />
            Create Order
          </Link>
        </div>
      )}

      {filteredOrders && filteredOrders.length > 0 && (
        <div className="bg-background border-2 border-border rounded-card overflow-hidden">
          <Table className="w-full">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Order #
                </TableHead>
                <TableHead className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Vendor
                </TableHead>
                <TableHead className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Event
                </TableHead>
                <TableHead className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Status
                </TableHead>
                <TableHead className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Delivery
                </TableHead>
                <TableHead className="text-right px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Total
                </TableHead>
                <TableHead className="text-right px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {filteredOrders.map((order) => {
                const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
                const StatusIcon = statusConfig.icon;
                return (
                  <TableRow key={order.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="px-4 py-3">
                      <Link
                        href={`/vendor-orders/${order.id}`}
                        className="font-weight-medium text-primary hover:underline"
                      >
                        {order.order_number}
                      </Link>
                      <div className="text-body-xs text-muted-foreground">
                        {formatDate(order.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {order.vendor?.logo_url ? (
                          <Image
                            src={order.vendor.logo_url}
                            alt=""
                            width={32}
                            height={32}
                            className="rounded-card object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-card bg-muted flex items-center justify-center">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <Text className="font-weight-medium text-foreground">
                          {order.vendor?.name || 'Unknown Vendor'}
                        </Text>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-body-sm text-muted-foreground">
                      {order.booking?.event_name || '-'}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Text className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusConfig.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </Text>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-body-sm text-muted-foreground">
                      {formatDate(order.delivery_date)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right font-weight-medium text-foreground">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <Link
                        href={`/vendor-orders/${order.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 text-body-xs border-2 border-border rounded-button hover:bg-muted transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
