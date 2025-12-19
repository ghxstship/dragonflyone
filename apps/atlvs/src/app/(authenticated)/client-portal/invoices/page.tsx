'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, DollarSign, FileText, CreditCard, CheckCircle, Clock, AlertTriangle, Download } from 'lucide-react';
import { useClientPortalInvoices } from '@/hooks/useClientPortal';

export default function ClientPortalInvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const token = typeof window !== 'undefined' ? localStorage.getItem('portal_token') : null;
  const { data, isLoading, error } = useClientPortalInvoices(token || undefined);

  const invoices = data?.invoices || [];
  const summary = data?.summary || { total_invoices: 0, total_due: 0, overdue: 0 };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch = invoice.invoice_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
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
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid':
        return { label: 'Paid', color: 'bg-success/20 text-success', icon: CheckCircle };
      case 'pending':
      case 'sent':
        return { label: 'Pending', color: 'bg-warning/20 text-warning', icon: Clock };
      case 'overdue':
        return { label: 'Overdue', color: 'bg-destructive/20 text-destructive', icon: AlertTriangle };
      case 'partial':
        return { label: 'Partial', color: 'bg-primary/20 text-primary', icon: DollarSign };
      default:
        return { label: status, color: 'bg-muted text-muted-foreground', icon: FileText };
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading invoices...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <p className="text-destructive">Failed to load invoices</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground">Invoices</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            View and pay your invoices
          </p>
        </div>
        <Link
          href="/client-portal"
          className="text-body-sm text-primary hover:underline"
        >
          Back to Portal
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Total Invoices</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">{summary.total_invoices}</p>
        </div>
        <div className="bg-background border-2 border-warning/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-warning" />
            <span className="text-body-sm text-muted-foreground">Total Due</span>
          </div>
          <p className="text-h3-md font-weight-bold text-warning">{formatCurrency(summary.total_due)}</p>
        </div>
        <div className="bg-background border-2 border-destructive/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="text-body-sm text-muted-foreground">Overdue</span>
          </div>
          <p className="text-h3-md font-weight-bold text-destructive">{summary.overdue}</p>
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
              placeholder="Search invoices..."
              className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="partial">Partial</option>
          </select>
        </div>

        <div className="divide-y divide-border">
          {filteredInvoices.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No invoices found
            </div>
          ) : (
            filteredInvoices.map((invoice) => {
              const statusConfig = getStatusConfig(invoice.status);
              const StatusIcon = statusConfig.icon;
              const isPending = invoice.status !== 'paid';
              return (
                <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-card flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-body-sm font-weight-medium text-foreground">
                        {invoice.invoice_number}
                      </p>
                      <p className="text-body-xs text-muted-foreground">
                        {invoice.booking?.event_name || invoice.booking?.booking_number || 'Invoice'}
                      </p>
                      <p className="text-body-xs text-muted-foreground mt-1">
                        Issued: {formatDate(invoice.issued_at)}
                        {invoice.due_date && ` • Due: ${formatDate(invoice.due_date)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-body-lg font-weight-bold text-foreground">
                        {formatCurrency(invoice.total)}
                      </p>
                      {invoice.balance_due > 0 && (
                        <p className="text-body-xs text-warning">
                          Balance: {formatCurrency(invoice.balance_due)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <StatusIcon className={`h-4 w-4 ${statusConfig.color.split(' ')[1]}`} />
                      <span className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-muted rounded-button transition-colors">
                        <Download className="h-4 w-4 text-muted-foreground" />
                      </button>
                      {isPending && (
                        <button className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-button text-body-xs font-weight-medium hover:bg-primary/90 transition-colors">
                          <CreditCard className="h-3 w-3" />
                          Pay Now
                        </button>
                      )}
                    </div>
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
