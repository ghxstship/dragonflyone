'use client';

import { useState } from 'react';
import { ArrowLeft, FileText, CheckCircle, AlertTriangle, CreditCard, Trash2 } from 'lucide-react';
import { useVendorInvoice, useApproveVendorInvoice, useRecordPayment, useDeleteVendorInvoice } from '@/hooks/useVendorInvoices';
import { useRouter } from 'next/navigation';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  pending: { label: 'Pending Approval', color: 'bg-warning/20 text-warning' },
  approved: { label: 'Approved', color: 'bg-success/20 text-success' },
  disputed: { label: 'Disputed', color: 'bg-destructive/20 text-destructive' },
  paid: { label: 'Paid', color: 'bg-success/20 text-success' },
  partial: { label: 'Partial Payment', color: 'bg-primary/20 text-primary' },
  cancelled: { label: 'Cancelled', color: 'bg-muted text-muted-foreground' },
  void: { label: 'Void', color: 'bg-muted text-muted-foreground' },
};

export default function VendorInvoiceDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const { data, isLoading, error } = useVendorInvoice(id);
  const approveMutation = useApproveVendorInvoice();
  const paymentMutation = useRecordPayment();
  const deleteMutation = useDeleteVendorInvoice();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: 'check',
    reference_number: '',
    payment_date: new Date().toISOString().split('T')[0],
  });

  const invoice = data?.invoice;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleApprove = async () => {
    if (confirm('Approve this invoice for payment?')) {
      await approveMutation.mutateAsync(id);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    await paymentMutation.mutateAsync({
      invoice_id: id,
      amount: parseFloat(paymentData.amount),
      payment_method: paymentData.payment_method,
      reference_number: paymentData.reference_number || undefined,
      payment_date: paymentData.payment_date,
    });
    setShowPaymentModal(false);
    setPaymentData({
      amount: '',
      payment_method: 'check',
      reference_number: '',
      payment_date: new Date().toISOString().split('T')[0],
    });
  };

  const handleDelete = async () => {
    if (confirm(`Delete invoice "${invoice?.invoice_number}"? This action cannot be undone.`)) {
      await deleteMutation.mutateAsync(id);
      router.push('/vendor-invoices');
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
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

  if (error || !invoice) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 text-destructive">
          Failed to load invoice. The invoice may not exist.
        </div>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[invoice.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  const daysUntilDue = getDaysUntilDue(invoice.due_date);
  const isOverdue = daysUntilDue < 0 && invoice.payment_status !== 'paid';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/vendor-invoices"
            className="p-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </a>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-card">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-h2-md font-weight-bold text-foreground">{invoice.invoice_number}</h1>
                <span className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusConfig.color}`}>
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-body-sm text-muted-foreground">
                {invoice.vendor?.name || 'Unknown Vendor'}
                {invoice.vendor_invoice_number && ` • Vendor Invoice: ${invoice.vendor_invoice_number}`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {invoice.status === 'pending' && (
            <button
              onClick={handleApprove}
              disabled={approveMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-button border-2 border-success font-weight-medium text-body-sm hover:bg-success/90 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </button>
          )}
          {invoice.status === 'approved' && invoice.amount_due > 0 && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              Record Payment
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="inline-flex items-center gap-2 px-4 py-2 border-2 border-destructive text-destructive rounded-button text-body-sm font-weight-medium hover:bg-destructive/10 transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Line Items</h2>
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-2 text-body-xs font-weight-medium text-muted-foreground">Description</th>
                  <th className="text-center py-2 text-body-xs font-weight-medium text-muted-foreground">Qty</th>
                  <th className="text-right py-2 text-body-xs font-weight-medium text-muted-foreground">Unit Price</th>
                  <th className="text-right py-2 text-body-xs font-weight-medium text-muted-foreground">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {invoice.line_items?.map((item, index) => (
                  <tr key={index}>
                    <td className="py-3 text-body-sm">{item.description}</td>
                    <td className="py-3 text-body-sm text-center">{item.quantity}</td>
                    <td className="py-3 text-body-sm text-right">{formatCurrency(item.unit_price)}</td>
                    <td className="py-3 text-body-sm text-right font-weight-medium">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-border mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-body-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              {invoice.tax_amount > 0 && (
                <div className="flex justify-between text-body-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(invoice.tax_amount)}</span>
                </div>
              )}
              {invoice.discount_amount > 0 && (
                <div className="flex justify-between text-body-sm">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="text-success">-{formatCurrency(invoice.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-body-lg font-weight-bold pt-2 border-t border-border">
                <span>Total</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Notes</h2>
              <p className="text-body-sm text-foreground">{invoice.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Payment Status</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-muted-foreground">Total</span>
                <span className="text-body-sm font-weight-medium">{formatCurrency(invoice.total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body-sm text-muted-foreground">Paid</span>
                <span className="text-body-sm font-weight-medium text-success">{formatCurrency(invoice.amount_paid)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-body-sm font-weight-semibold">Balance Due</span>
                <span className={`text-h4-md font-weight-bold ${invoice.amount_due > 0 ? 'text-destructive' : 'text-success'}`}>
                  {formatCurrency(invoice.amount_due)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Details</h2>
            <div className="space-y-3">
              <div>
                <p className="text-body-xs text-muted-foreground">Invoice Date</p>
                <p className="text-body-sm font-weight-medium">
                  {new Date(invoice.invoice_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-body-xs text-muted-foreground">Due Date</p>
                <p className={`text-body-sm font-weight-medium ${isOverdue ? 'text-destructive' : ''}`}>
                  {new Date(invoice.due_date).toLocaleDateString()}
                  {isOverdue && (
                    <span className="ml-2 text-body-xs">({Math.abs(daysUntilDue)} days overdue)</span>
                  )}
                </p>
              </div>
              {invoice.payment_terms && (
                <div>
                  <p className="text-body-xs text-muted-foreground">Payment Terms</p>
                  <p className="text-body-sm font-weight-medium">{invoice.payment_terms}</p>
                </div>
              )}
              {invoice.purchase_order && (
                <div>
                  <p className="text-body-xs text-muted-foreground">Purchase Order</p>
                  <a href={`/purchase-orders/${invoice.purchase_order.id}`} className="text-body-sm font-weight-medium text-primary hover:underline">
                    {invoice.purchase_order.po_number}
                  </a>
                </div>
              )}
            </div>
          </div>

          {isOverdue && (
            <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-weight-semibold">Overdue</span>
              </div>
              <p className="text-body-sm text-destructive mt-1">
                This invoice is {Math.abs(daysUntilDue)} days past due.
              </p>
            </div>
          )}
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 w-full max-w-md">
            <h2 className="text-h3-md font-weight-bold text-foreground mb-4">Record Payment</h2>
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number"
                    step="0.01"
                    max={invoice.amount_due}
                    placeholder={invoice.amount_due.toFixed(2)}
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                    className="w-full pl-8 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Payment Method
                </label>
                <select
                  value={paymentData.payment_method}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="check">Check</option>
                  <option value="ach">ACH</option>
                  <option value="wire">Wire Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Reference Number
                </label>
                <input
                  type="text"
                  placeholder="Check # or transaction ID"
                  value={paymentData.reference_number}
                  onChange={(e) => setPaymentData({ ...paymentData, reference_number: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={paymentData.payment_date}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentMutation.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {paymentMutation.isPending ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
