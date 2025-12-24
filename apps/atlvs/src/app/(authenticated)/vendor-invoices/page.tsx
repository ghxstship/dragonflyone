'use client';

import {
  Body,
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
          <H1 className="text-h2-md font-weight-bold text-foreground">Vendor Invoices</H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            Manage accounts payable and vendor payments
          </Body>
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
              <Text className="text-body-xs text-muted-foreground">Current</Text>
            </div>
            <Body className="text-h4-md font-weight-bold text-foreground">{formatCurrency(aging.current)}</Body>
          </div>
          <div className="bg-background border-2 border-border rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Text className="text-body-xs text-muted-foreground">1-30 Days</Text>
            </div>
            <Body className="text-h4-md font-weight-bold text-warning">{formatCurrency(aging.days_1_30)}</Body>
          </div>
          <div className="bg-background border-2 border-border rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Text className="text-body-xs text-muted-foreground">31-60 Days</Text>
            </div>
            <Body className="text-h4-md font-weight-bold text-warning">{formatCurrency(aging.days_31_60)}</Body>
          </div>
          <div className="bg-background border-2 border-border rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Text className="text-body-xs text-muted-foreground">61-90 Days</Text>
            </div>
            <Body className="text-h4-md font-weight-bold text-destructive">{formatCurrency(aging.days_61_90)}</Body>
          </div>
          <div className="bg-background border-2 border-border rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <Text className="text-body-xs text-muted-foreground">Over 90</Text>
            </div>
            <Body className="text-h4-md font-weight-bold text-destructive">{formatCurrency(aging.over_90)}</Body>
          </div>
          <div className="bg-primary/10 border-2 border-primary rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <Text className="text-body-xs text-primary font-weight-medium">Total Outstanding</Text>
            </div>
            <Body className="text-h4-md font-weight-bold text-primary">{formatCurrency(aging.total_outstanding)}</Body>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search invoices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>

        <Select
          value={paymentStatusFilter}
          onChange={(e) => setPaymentStatusFilter(e.target.value)}
          className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Payment Status</option>
          {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>
      </div>

      {(!filteredInvoices || filteredInvoices.length === 0) && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <H3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No invoices found
          </H3>
          <Body className="text-body-sm text-muted-foreground mb-4">
            Record your first vendor invoice to start tracking accounts payable.
          </Body>
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
          <Table className="w-full">
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Invoice
                </TableHead>
                <TableHead className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Vendor
                </TableHead>
                <TableHead className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Due Date
                </TableHead>
                <TableHead className="text-right px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Total
                </TableHead>
                <TableHead className="text-right px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Balance Due
                </TableHead>
                <TableHead className="text-center px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border">
              {filteredInvoices.map((invoice) => {
                const statusConfig = STATUS_CONFIG[invoice.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                const paymentConfig = PAYMENT_STATUS_CONFIG[invoice.payment_status as keyof typeof PAYMENT_STATUS_CONFIG] || PAYMENT_STATUS_CONFIG.unpaid;
                const daysUntilDue = getDaysUntilDue(invoice.due_date);
                const isOverdue = daysUntilDue < 0 && invoice.payment_status !== 'paid';

                return (
                  <TableRow key={invoice.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="px-4 py-3">
                      <Link href={`/vendor-invoices/${invoice.id}`} className="hover:underline">
                        <Body className="font-weight-medium text-foreground">{invoice.invoice_number}</Body>
                        {invoice.vendor_invoice_number && (
                          <Body className="text-body-xs text-muted-foreground">
                            Vendor: {invoice.vendor_invoice_number}
                          </Body>
                        )}
                      </Link>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Body className="text-body-sm text-foreground">{invoice.vendor?.name || 'Unknown'}</Body>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Body className={`text-body-sm ${isOverdue ? 'text-destructive font-weight-medium' : 'text-foreground'}`}>
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </Body>
                      {isOverdue && (
                        <Body className="text-body-xs text-destructive">
                          {Math.abs(daysUntilDue)} days overdue
                        </Body>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <Body className="text-body-sm font-weight-medium">{formatCurrency(invoice.total)}</Body>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <Body className={`text-body-sm font-weight-bold ${paymentConfig.color}`}>
                        {formatCurrency(invoice.amount_due)}
                      </Body>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <Text className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </Text>
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
