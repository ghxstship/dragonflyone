'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, FileText, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { useVendorInvoices } from '@/hooks/useVendorInvoices';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  pending: { label: 'Pending', color: 'bg-warning/20 text-warning' },
  approved: { label: 'Approved', color: 'bg-success/20 text-success' },
  disputed: { label: 'Disputed', color: 'bg-destructive/20 text-destructive' },
  paid: { label: 'Paid', color: 'bg-success/20 text-success' },
  partial: { label: 'Partial', color: 'bg-primary/20 text-primary' },
  cancelled: { label: 'Cancelled', color: 'bg-muted text-muted-foreground' },
  void: { label: 'Void', color: 'bg-muted text-muted-foreground' },
};

const PAYMENT_STATUS_CONFIG = {
  unpaid: { label: 'Unpaid', color: 'text-destructive' },
  partial: { label: 'Partial', color: 'text-warning' },
  paid: { label: 'Paid', color: 'text-success' },
  overpaid: { label: 'Overpaid', color: 'text-primary' },
};

export default function VendorInvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');

  const { data, isLoading, error } = useVendorInvoices({
    status: statusFilter || undefined,
    payment_status: paymentStatusFilter || undefined,
  });

  const filteredInvoices = data?.invoices?.filter((invoice) => {
    return (
      !searchQuery ||
      invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.vendor_invoice_number?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-card w-1/3" />
          <div className="h-48 bg-muted rounded-card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 text-destructive">
          Failed to load vendor invoices. Please try again.
        </div>
      </div>
    );
  }

  const aging = data?.aging;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground">Vendor Invoices</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Manage accounts payable and vendor payments
          </p>
        </div>
        <Link
          href="/vendor-invoices/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Record Invoice
        </Link>
      </div>

      {aging && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-background border-2 border-border rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-body-xs text-muted-foreground">Current</span>
            </div>
            <p className="text-h4-md font-weight-bold text-foreground">{formatCurrency(aging.current)}</p>
          </div>
          <div className="bg-background border-2 border-border rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-body-xs text-muted-foreground">1-30 Days</span>
            </div>
            <p className="text-h4-md font-weight-bold text-warning">{formatCurrency(aging.days_1_30)}</p>
          </div>
          <div className="bg-background border-2 border-border rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-body-xs text-muted-foreground">31-60 Days</span>
            </div>
            <p className="text-h4-md font-weight-bold text-warning">{formatCurrency(aging.days_31_60)}</p>
          </div>
          <div className="bg-background border-2 border-border rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-body-xs text-muted-foreground">61-90 Days</span>
            </div>
            <p className="text-h4-md font-weight-bold text-destructive">{formatCurrency(aging.days_61_90)}</p>
          </div>
          <div className="bg-background border-2 border-border rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <span className="text-body-xs text-muted-foreground">Over 90</span>
            </div>
            <p className="text-h4-md font-weight-bold text-destructive">{formatCurrency(aging.over_90)}</p>
          </div>
          <div className="bg-primary/10 border-2 border-primary rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-body-xs text-primary font-weight-medium">Total Outstanding</span>
            </div>
            <p className="text-h4-md font-weight-bold text-primary">{formatCurrency(aging.total_outstanding)}</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <select
          value={paymentStatusFilter}
          onChange={(e) => setPaymentStatusFilter(e.target.value)}
          className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Payment Status</option>
          {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {(!filteredInvoices || filteredInvoices.length === 0) && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No invoices found
          </h3>
          <p className="text-body-sm text-muted-foreground mb-4">
            Record your first vendor invoice to start tracking accounts payable.
          </p>
          <Link
            href="/vendor-invoices/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm"
          >
            <Plus className="h-4 w-4" />
            Record Invoice
          </Link>
        </div>
      )}

      {filteredInvoices && filteredInvoices.length > 0 && (
        <div className="bg-background border-2 border-border rounded-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Invoice
                </th>
                <th className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Vendor
                </th>
                <th className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Due Date
                </th>
                <th className="text-right px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Total
                </th>
                <th className="text-right px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Balance Due
                </th>
                <th className="text-center px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredInvoices.map((invoice) => {
                const statusConfig = STATUS_CONFIG[invoice.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                const paymentConfig = PAYMENT_STATUS_CONFIG[invoice.payment_status as keyof typeof PAYMENT_STATUS_CONFIG] || PAYMENT_STATUS_CONFIG.unpaid;
                const daysUntilDue = getDaysUntilDue(invoice.due_date);
                const isOverdue = daysUntilDue < 0 && invoice.payment_status !== 'paid';

                return (
                  <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <a href={`/vendor-invoices/${invoice.id}`} className="hover:underline">
                        <p className="font-weight-medium text-foreground">{invoice.invoice_number}</p>
                        {invoice.vendor_invoice_number && (
                          <p className="text-body-xs text-muted-foreground">
                            Vendor: {invoice.vendor_invoice_number}
                          </p>
                        )}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-body-sm text-foreground">{invoice.vendor?.name || 'Unknown'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className={`text-body-sm ${isOverdue ? 'text-destructive font-weight-medium' : 'text-foreground'}`}>
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </p>
                      {isOverdue && (
                        <p className="text-body-xs text-destructive">
                          {Math.abs(daysUntilDue)} days overdue
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-body-sm font-weight-medium">{formatCurrency(invoice.total)}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className={`text-body-sm font-weight-bold ${paymentConfig.color}`}>
                        {formatCurrency(invoice.amount_due)}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
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
