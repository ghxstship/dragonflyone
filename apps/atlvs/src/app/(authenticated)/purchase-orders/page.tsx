'use client';

import { useState } from 'react';
import { Plus, Search, FileText, Clock, CheckCircle, Filter, DollarSign } from 'lucide-react';
import { usePurchaseOrders, PurchaseOrder } from '@/hooks/usePurchaseOrders';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  pending_approval: { label: 'Pending Approval', color: 'bg-warning/20 text-warning' },
  approved: { label: 'Approved', color: 'bg-success/20 text-success' },
  sent: { label: 'Sent', color: 'bg-primary/20 text-primary' },
  acknowledged: { label: 'Acknowledged', color: 'bg-primary/20 text-primary' },
  fulfilled: { label: 'Fulfilled', color: 'bg-success text-success-foreground' },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/20 text-destructive' },
};

export default function PurchaseOrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: purchaseOrders = [], isLoading, error } = usePurchaseOrders({
    status: statusFilter || undefined,
  });

  const filteredPOs = purchaseOrders.filter((po: PurchaseOrder) => {
    const matchesSearch = !searchQuery || 
      po.po_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: purchaseOrders.length,
    pending: purchaseOrders.filter((p: PurchaseOrder) => p.status === 'pending_approval').length,
    approved: purchaseOrders.filter((p: PurchaseOrder) => p.status === 'approved' || p.status === 'sent' || p.status === 'ordered').length,
    fulfilled: purchaseOrders.filter((p: PurchaseOrder) => p.status === 'received' || p.status === 'fulfilled').length,
    totalValue: purchaseOrders.reduce((sum: number, p: PurchaseOrder) => sum + (p.total_amount || 0), 0),
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-card w-1/3" />
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-card" />
            ))}
          </div>
          <div className="h-64 bg-muted rounded-card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 text-destructive">
          Failed to load purchase orders. Please try again.
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground">Purchase Orders</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Manage vendor purchase orders and procurement
          </p>
        </div>
        <a
          href="/purchase-orders/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New PO
        </a>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Total POs</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">{stats.total}</p>
        </div>
        <div className="bg-background border-2 border-warning/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-warning" />
            <span className="text-body-sm text-muted-foreground">Pending</span>
          </div>
          <p className="text-h3-md font-weight-bold text-warning">{stats.pending}</p>
        </div>
        <div className="bg-background border-2 border-primary/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Active</span>
          </div>
          <p className="text-h3-md font-weight-bold text-primary">{stats.approved}</p>
        </div>
        <div className="bg-background border-2 border-success/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <span className="text-body-sm text-muted-foreground">Fulfilled</span>
          </div>
          <p className="text-h3-md font-weight-bold text-success">{stats.fulfilled}</p>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Total Value</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">{formatCurrency(stats.totalValue)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by PO number, vendor, or event..."
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
            <option value="">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {filteredPOs.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No purchase orders found
          </h3>
          <p className="text-body-sm text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search' : 'Create your first purchase order'}
          </p>
          <a
            href="/purchase-orders/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm"
          >
            <Plus className="h-4 w-4" />
            New PO
          </a>
        </div>
      )}

      {filteredPOs.length > 0 && (
        <div className="space-y-4">
          {filteredPOs.map((po: PurchaseOrder) => {
            const statusConfig = STATUS_CONFIG[po.status] || { label: po.status, color: 'bg-muted text-muted-foreground' };

            return (
              <a
                key={po.id}
                href={`/purchase-orders/${po.id}`}
                className="block bg-background border-2 border-border rounded-card p-6 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-body-xs text-muted-foreground font-mono">
                        {po.po_number}
                      </span>
                      <span className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      {po.priority && po.priority !== 'normal' && (
                        <span className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${
                          po.priority === 'urgent' ? 'bg-destructive/20 text-destructive' :
                          po.priority === 'high' ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground'
                        }`}>
                          {po.priority}
                        </span>
                      )}
                    </div>
                    <h3 className="text-body-lg font-weight-semibold text-foreground mb-1">
                      {po.vendor?.name || 'Unknown Vendor'}
                    </h3>
                    <p className="text-body-sm text-muted-foreground">
                      {po.category}
                      {po.description && ` • ${po.description}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-h4-md font-weight-bold text-foreground">
                      {formatCurrency(po.total_amount || 0)}
                    </p>
                    <p className="text-body-xs text-muted-foreground mt-1">
                      {new Date(po.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
