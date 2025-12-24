'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Body,
  Button,
  H1,
  H3,
  Input,
  Select,
  Text,
  Skeleton,
  EmptyState,
  useNotifications,
} from '@ghxstship/ui';
import Link from 'next/link';
import { Search, Clock, CheckCircle, XCircle, Filter, User, DollarSign } from 'lucide-react';

interface PendingApproval {
  id: string;
  order_id: string;
  order_number: string;
  vendor_name: string;
  event_name?: string;
  total_amount: number;
  requested_by: string;
  requested_at: string;
  urgency: 'low' | 'medium' | 'high';
  items_count: number;
  notes?: string;
}

const DEMO_APPROVALS: PendingApproval[] = [
  { id: '1', order_id: 'o1', order_number: 'VO-2024-001', vendor_name: 'Elite Catering Co.', event_name: 'Smith Wedding', total_amount: 4500, requested_by: 'John Smith', requested_at: '2024-01-15T10:30:00', urgency: 'high', items_count: 12 },
  { id: '2', order_id: 'o2', order_number: 'VO-2024-002', vendor_name: 'Bloom Florals', total_amount: 2800, requested_by: 'Sarah Johnson', requested_at: '2024-01-16T14:00:00', urgency: 'medium', items_count: 8 },
  { id: '3', order_id: 'o3', order_number: 'VO-2024-003', vendor_name: 'Pro AV Solutions', event_name: 'Corporate Gala', total_amount: 6200, requested_by: 'Mike Davis', requested_at: '2024-01-17T09:15:00', urgency: 'low', items_count: 5 },
];

const URGENCY_CONFIG = {
  low: { label: 'Low', color: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', color: 'bg-warning/20 text-warning' },
  high: { label: 'Urgent', color: 'bg-destructive/20 text-destructive' },
};

async function fetchPendingApprovals(): Promise<PendingApproval[]> {
  const response = await fetch('/api/vendor-orders/approvals');
  if (!response.ok) throw new Error('Failed to fetch pending approvals');
  return response.json();
}

export default function ApprovalsPage() {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('');

  const { data: apiApprovals, isLoading, error } = useQuery({
    queryKey: ['vendor-order-approvals'],
    queryFn: fetchPendingApprovals,
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/vendor-orders/${id}/approve`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to approve order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-order-approvals'] });
      addNotification({ type: 'success', title: 'Order Approved', message: 'Vendor order has been approved.' });
    },
    onError: () => {
      addNotification({ type: 'error', title: 'Approval Failed', message: 'Failed to approve order.' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/vendor-orders/${id}/reject`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to reject order');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-order-approvals'] });
      addNotification({ type: 'success', title: 'Order Rejected', message: 'Vendor order has been rejected.' });
    },
    onError: () => {
      addNotification({ type: 'error', title: 'Rejection Failed', message: 'Failed to reject order.' });
    },
  });

  // Use API data or fall back to demo data
  const approvals = apiApprovals && apiApprovals.length > 0 ? apiApprovals : DEMO_APPROVALS;

  const filteredApprovals = approvals.filter((a) => {
    const matchesSearch = !searchQuery || 
      a.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.event_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUrgency = !urgencyFilter || a.urgency === urgencyFilter;
    return matchesSearch && matchesUrgency;
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
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleApprove = (id: string) => {
    approveMutation.mutate(id);
  };

  const handleReject = (id: string) => {
    rejectMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error && !apiApprovals) {
    return (
      <div className="p-6">
        <EmptyState
          title="Error Loading Approvals"
          description={error instanceof Error ? error.message : 'Failed to load pending approvals'}
          action={{ label: 'Retry', onClick: () => window.location.reload() }}
        />
      </div>
    );
  }

  const totalPending = approvals.length;
  const totalValue = approvals.reduce((sum, a) => sum + a.total_amount, 0);
  const urgentCount = approvals.filter((a) => a.urgency === 'high').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H1 className="text-h2-md font-weight-bold text-foreground">Pending Approvals</H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            Review and approve vendor orders
          </Body>
        </div>
        <Link
          href="/vendor-orders"
          className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
        >
          View All Orders
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background border-2 border-warning/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-warning" />
            <Text className="text-body-sm text-muted-foreground">Pending</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-warning">{totalPending}</Body>
        </div>
        <div className="bg-background border-2 border-destructive/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-destructive" />
            <Text className="text-body-sm text-muted-foreground">Urgent</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-destructive">{urgentCount}</Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <Text className="text-body-sm text-muted-foreground">Total Value</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-foreground">{formatCurrency(totalValue)}</Body>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
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
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Urgency</option>
            {Object.entries(URGENCY_CONFIG).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </div>
      </div>

      {filteredApprovals.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
          <H3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No pending approvals
          </H3>
          <Body className="text-body-sm text-muted-foreground">
            All vendor orders have been processed
          </Body>
        </div>
      )}

      {filteredApprovals.length > 0 && (
        <div className="space-y-4">
          {filteredApprovals.map((approval) => {
            const urgencyConfig = URGENCY_CONFIG[approval.urgency];
            const isProcessing = approveMutation.isPending || rejectMutation.isPending;

            return (
              <div
                key={approval.id}
                className="bg-background border-2 border-border rounded-card p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Link
                        href={`/vendor-orders/${approval.order_id}`}
                        className="text-body-xs text-primary font-mono hover:underline"
                      >
                        {approval.order_number}
                      </Link>
                      <Text className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${urgencyConfig.color}`}>
                        {urgencyConfig.label}
                      </Text>
                    </div>
                    <H3 className="text-body-lg font-weight-semibold text-foreground mb-1">
                      {approval.vendor_name}
                    </H3>
                    <Body className="text-body-sm text-muted-foreground">
                      {approval.items_count} items
                      {approval.event_name && ` for ${approval.event_name}`}
                    </Body>
                    <div className="flex items-center gap-4 mt-2 text-body-xs text-muted-foreground">
                      <Text className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {approval.requested_by}
                      </Text>
                      <Text className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(approval.requested_at)}
                      </Text>
                    </div>
                  </div>
                  <div className="text-right">
                    <Body className="text-h4-md font-weight-bold text-foreground mb-4">
                      {formatCurrency(approval.total_amount)}
                    </Body>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleReject(approval.id)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-destructive text-destructive rounded-button text-body-sm font-weight-medium hover:bg-destructive/10 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => handleApprove(approval.id)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-success text-success-foreground border-2 border-success rounded-button text-body-sm font-weight-medium hover:bg-success/90 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
