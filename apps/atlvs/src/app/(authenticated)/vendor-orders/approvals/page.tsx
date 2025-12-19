'use client';

import { useState } from 'react';
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

const MOCK_APPROVALS: PendingApproval[] = [
  { id: '1', order_id: 'o1', order_number: 'VO-2024-001', vendor_name: 'Elite Catering Co.', event_name: 'Smith Wedding', total_amount: 4500, requested_by: 'John Smith', requested_at: '2024-01-15T10:30:00', urgency: 'high', items_count: 12 },
  { id: '2', order_id: 'o2', order_number: 'VO-2024-002', vendor_name: 'Bloom Florals', total_amount: 2800, requested_by: 'Sarah Johnson', requested_at: '2024-01-16T14:00:00', urgency: 'medium', items_count: 8 },
  { id: '3', order_id: 'o3', order_number: 'VO-2024-003', vendor_name: 'Pro AV Solutions', event_name: 'Corporate Gala', total_amount: 6200, requested_by: 'Mike Davis', requested_at: '2024-01-17T09:15:00', urgency: 'low', items_count: 5 },
];

const URGENCY_CONFIG = {
  low: { label: 'Low', color: 'bg-muted text-muted-foreground' },
  medium: { label: 'Medium', color: 'bg-warning/20 text-warning' },
  high: { label: 'Urgent', color: 'bg-destructive/20 text-destructive' },
};

export default function ApprovalsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('');
  const [approvals] = useState<PendingApproval[]>(MOCK_APPROVALS);
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    // TODO: Call approve API
    setTimeout(() => setProcessingId(null), 1000);
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    // TODO: Call reject API
    setTimeout(() => setProcessingId(null), 1000);
  };

  const totalPending = approvals.length;
  const totalValue = approvals.reduce((sum, a) => sum + a.total_amount, 0);
  const urgentCount = approvals.filter((a) => a.urgency === 'high').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground">Pending Approvals</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Review and approve vendor orders
          </p>
        </div>
        <a
          href="/vendor-orders"
          className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
        >
          View All Orders
        </a>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background border-2 border-warning/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-warning" />
            <span className="text-body-sm text-muted-foreground">Pending</span>
          </div>
          <p className="text-h3-md font-weight-bold text-warning">{totalPending}</p>
        </div>
        <div className="bg-background border-2 border-destructive/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-destructive" />
            <span className="text-body-sm text-muted-foreground">Urgent</span>
          </div>
          <p className="text-h3-md font-weight-bold text-destructive">{urgentCount}</p>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Total Value</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">{formatCurrency(totalValue)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
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
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Urgency</option>
            {Object.entries(URGENCY_CONFIG).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredApprovals.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
          <h3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No pending approvals
          </h3>
          <p className="text-body-sm text-muted-foreground">
            All vendor orders have been processed
          </p>
        </div>
      )}

      {filteredApprovals.length > 0 && (
        <div className="space-y-4">
          {filteredApprovals.map((approval) => {
            const urgencyConfig = URGENCY_CONFIG[approval.urgency];
            const isProcessing = processingId === approval.id;

            return (
              <div
                key={approval.id}
                className="bg-background border-2 border-border rounded-card p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <a
                        href={`/vendor-orders/${approval.order_id}`}
                        className="text-body-xs text-primary font-mono hover:underline"
                      >
                        {approval.order_number}
                      </a>
                      <span className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${urgencyConfig.color}`}>
                        {urgencyConfig.label}
                      </span>
                    </div>
                    <h3 className="text-body-lg font-weight-semibold text-foreground mb-1">
                      {approval.vendor_name}
                    </h3>
                    <p className="text-body-sm text-muted-foreground">
                      {approval.items_count} items
                      {approval.event_name && ` for ${approval.event_name}`}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-body-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {approval.requested_by}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(approval.requested_at)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-h4-md font-weight-bold text-foreground mb-4">
                      {formatCurrency(approval.total_amount)}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReject(approval.id)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-destructive text-destructive rounded-button text-body-sm font-weight-medium hover:bg-destructive/10 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(approval.id)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-success text-success-foreground border-2 border-success rounded-button text-body-sm font-weight-medium hover:bg-success/90 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </button>
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
