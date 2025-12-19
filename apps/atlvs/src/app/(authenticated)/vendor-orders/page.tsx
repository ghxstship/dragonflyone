'use client';

import { useState } from 'react';
import Image from 'next/image';
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
          <h1 className="text-h2-md font-weight-bold text-foreground">Vendor Orders</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Create and manage orders to vendors with approval workflows
          </p>
        </div>
        <a
          href="/vendor-orders/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Order
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(STATUS_CONFIG).slice(0, 4).map(([status, config]) => {
          const count = data?.orders?.filter((o) => o.status === status).length || 0;
          const StatusIcon = config.icon;
          return (
            <button
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
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
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
          </select>
        </div>
      </div>

      {(!filteredOrders || filteredOrders.length === 0) && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No orders found
          </h3>
          <p className="text-body-sm text-muted-foreground mb-4">
            {statusFilter
              ? `No orders with status "${STATUS_CONFIG[statusFilter as keyof typeof STATUS_CONFIG]?.label}"`
              : 'Create your first vendor order to get started.'}
          </p>
          <a
            href="/vendor-orders/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm"
          >
            <Plus className="h-4 w-4" />
            Create Order
          </a>
        </div>
      )}

      {filteredOrders && filteredOrders.length > 0 && (
        <div className="bg-background border-2 border-border rounded-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Order #
                </th>
                <th className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Vendor
                </th>
                <th className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Event
                </th>
                <th className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Delivery
                </th>
                <th className="text-right px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Total
                </th>
                <th className="text-right px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map((order) => {
                const statusConfig = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
                const StatusIcon = statusConfig.icon;
                return (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <a
                        href={`/vendor-orders/${order.id}`}
                        className="font-weight-medium text-primary hover:underline"
                      >
                        {order.order_number}
                      </a>
                      <div className="text-body-xs text-muted-foreground">
                        {formatDate(order.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
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
                        <span className="font-weight-medium text-foreground">
                          {order.vendor?.name || 'Unknown Vendor'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-body-sm text-muted-foreground">
                      {order.booking?.event_name || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusConfig.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-body-sm text-muted-foreground">
                      {formatDate(order.delivery_date)}
                    </td>
                    <td className="px-4 py-3 text-right font-weight-medium text-foreground">
                      {formatCurrency(order.total)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={`/vendor-orders/${order.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1 text-body-xs border-2 border-border rounded-button hover:bg-muted transition-colors"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
