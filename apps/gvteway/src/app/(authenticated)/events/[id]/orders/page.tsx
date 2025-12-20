'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Search, Ticket, DollarSign, User, Mail, MoreVertical, XCircle, RefreshCw } from 'lucide-react';
import { useTicketOrders, useCancelOrder, useRefundOrder } from '@/hooks/useTicketing';
import { Button } from '@ghxstship/ui';

export default function EventOrdersPage() {
  const params = useParams();
  const eventId = params.id as string;

  const { data, isLoading, error, refetch } = useTicketOrders({ event_id: eventId });
  const cancelMutation = useCancelOrder();
  const refundMutation = useRefundOrder();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const orders = data?.orders || [];

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.purchaser_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.purchaser_email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      await cancelMutation.mutateAsync({ orderId });
    } catch (err) {
      console.error('Failed to cancel order:', err);
    }
  };

  const handleRefund = async (orderId: string) => {
    if (!confirm('Are you sure you want to refund this order?')) return;
    try {
      await refundMutation.mutateAsync({ orderId });
    } catch (err) {
      console.error('Failed to refund order:', err);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', color: 'bg-success/20 text-success' };
      case 'pending':
        return { label: 'Pending', color: 'bg-warning/20 text-warning' };
      case 'cancelled':
        return { label: 'Cancelled', color: 'bg-muted text-muted-foreground' };
      case 'refunded':
        return { label: 'Refunded', color: 'bg-destructive/20 text-destructive' };
      default:
        return { label: status, color: 'bg-muted text-muted-foreground' };
    }
  };

  const totalRevenue = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);
  const totalOrders = orders.filter((o) => o.status === 'completed').length;
  const totalTickets = orders
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + o.tickets.reduce((t, ticket) => t + ticket.quantity, 0), 0);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <p className="text-destructive">Failed to load orders</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground">Ticket Orders</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            View and manage ticket purchases
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button font-weight-medium text-body-sm hover:bg-muted transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background border-2 border-primary/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Total Revenue</span>
          </div>
          <p className="text-h3-md font-weight-bold text-primary">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Ticket className="h-5 w-5 text-foreground" />
            <span className="text-body-sm text-muted-foreground">Total Orders</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">{totalOrders}</p>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-5 w-5 text-foreground" />
            <span className="text-body-sm text-muted-foreground">Tickets Sold</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">{totalTickets}</p>
        </div>
      </div>

      <div className="bg-background border-2 border-border rounded-card">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, name, or email..."
              className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <div className="divide-y divide-border">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No orders found
            </div>
          ) : (
            filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              return (
                <div key={order.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-avatar flex items-center justify-center">
                      <Ticket className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-body-sm font-weight-medium text-foreground">
                        {order.order_number}
                      </p>
                      <div className="flex items-center gap-2 text-body-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{order.purchaser_name}</span>
                        <Mail className="h-3 w-3 ml-2" />
                        <span>{order.purchaser_email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-body-lg font-weight-bold text-foreground">{formatCurrency(order.total)}</p>
                      <p className="text-body-xs text-muted-foreground">{order.tickets.reduce((sum, t) => sum + t.quantity, 0)} tickets</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      <p className="text-body-xs text-muted-foreground mt-1">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    {order.status === 'completed' && (
                      <div className="relative group">
                        <Button variant="ghost" size="icon" className="p-2">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <div className="absolute right-0 top-full mt-1 bg-background border-2 border-border rounded-card shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                          <Button
                            variant="ghost"
                            size="sm"
                            fullWidth
                            onClick={() => handleCancel(order.id)}
                            disabled={cancelMutation.isPending}
                            icon={<XCircle className="h-4 w-4" />}
                            iconPosition="left"
                            className="justify-start"
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            fullWidth
                            onClick={() => handleRefund(order.id)}
                            disabled={refundMutation.isPending}
                            icon={<DollarSign className="h-4 w-4" />}
                            iconPosition="left"
                            className="justify-start text-destructive hover:text-destructive"
                          >
                            Refund
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
