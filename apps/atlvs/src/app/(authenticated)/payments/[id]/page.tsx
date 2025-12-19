'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CreditCard, Building2, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

interface PaymentDetail {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  payment_method: string;
  payment_date: string;
  reference_number?: string;
  notes?: string;
  invoice?: {
    id: string;
    invoice_number: string;
    total_amount: number;
  };
  contact?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  refunds: Array<{
    id: string;
    amount: number;
    status: string;
    created_at: string;
  }>;
  created_at: string;
}

export default function PaymentDetailPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const paymentId = params.id as string;
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('requested_by_customer');

  const { data: payment, isLoading, error } = useQuery({
    queryKey: ['payment', paymentId],
    queryFn: async () => {
      const response = await fetch(`/api/payments/${paymentId}`);
      if (!response.ok) throw new Error('Failed to fetch payment');
      const data = await response.json();
      return data.payment as PaymentDetail;
    },
  });

  const refundMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/payments/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: paymentId,
          amount: parseFloat(refundAmount),
          reason: refundReason,
        }),
      });
      if (!response.ok) throw new Error('Failed to process refund');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment', paymentId] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      setShowRefundModal(false);
    },
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
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success-600" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-error-600" />;
      case 'pending':
      case 'processing':
        return <Clock className="h-5 w-5 text-warning-600" />;
      case 'refunded':
        return <RefreshCw className="h-5 w-5 text-info-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-ink-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800';
      case 'failed':
      case 'cancelled':
        return 'bg-error-100 text-error-800';
      case 'pending':
      case 'processing':
        return 'bg-warning-100 text-warning-800';
      case 'refunded':
        return 'bg-info-100 text-info-800';
      default:
        return 'bg-ink-100 text-ink-800';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading payment...</div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <p className="text-destructive">Failed to load payment details</p>
        </div>
      </div>
    );
  }

  const totalRefunded = payment.refunds.reduce((sum, r) => sum + r.amount, 0);
  const canRefund = payment.status === 'completed' && totalRefunded < payment.amount;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/payments"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-h2-md font-weight-bold text-foreground">Payment Details</h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              {payment.reference_number || payment.id}
            </p>
          </div>
        </div>
        {canRefund && (
          <button
            onClick={() => {
              setRefundAmount((payment.amount - totalRefunded).toString());
              setShowRefundModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 border-2 border-destructive text-destructive rounded-button hover:bg-destructive/10 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="text-body-sm font-weight-medium">Issue Refund</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {getStatusIcon(payment.status)}
                <div>
                  <h2 className="text-h3-md font-weight-bold text-foreground">
                    {formatCurrency(payment.amount)}
                  </h2>
                  <p className="text-body-sm text-muted-foreground">
                    {formatDate(payment.payment_date)}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-avatar text-body-sm font-weight-medium ${getStatusColor(payment.status)}`}>
                {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-body-xs text-muted-foreground uppercase tracking-label mb-1">Payment Method</p>
                <div className="flex items-center gap-2">
                  {payment.payment_method === 'card' ? (
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-body-md text-foreground capitalize">{payment.payment_method}</span>
                </div>
              </div>
              <div>
                <p className="text-body-xs text-muted-foreground uppercase tracking-label mb-1">Reference</p>
                <p className="text-body-md text-foreground font-mono">{payment.reference_number || '-'}</p>
              </div>
            </div>

            {payment.notes && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-body-xs text-muted-foreground uppercase tracking-label mb-1">Notes</p>
                <p className="text-body-md text-foreground">{payment.notes}</p>
              </div>
            )}
          </div>

          {payment.refunds.length > 0 && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <h3 className="text-body-md font-weight-semibold text-foreground mb-4">Refunds</h3>
              <div className="space-y-3">
                {payment.refunds.map((refund) => (
                  <div key={refund.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-card">
                    <div>
                      <p className="text-body-md font-weight-medium text-foreground">
                        {formatCurrency(refund.amount)}
                      </p>
                      <p className="text-body-xs text-muted-foreground">
                        {formatDate(refund.created_at)}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-avatar text-body-xs font-weight-medium ${getStatusColor(refund.status)}`}>
                      {refund.status}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border flex justify-between">
                <span className="text-body-sm text-muted-foreground">Total Refunded</span>
                <span className="text-body-md font-weight-semibold text-foreground">{formatCurrency(totalRefunded)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {payment.invoice && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <h3 className="text-body-md font-weight-semibold text-foreground mb-4">Linked Invoice</h3>
              <Link
                href={`/invoices/${payment.invoice.id}`}
                className="block p-3 bg-muted/30 rounded-card hover:bg-muted/50 transition-colors"
              >
                <p className="text-body-md font-weight-medium text-foreground">
                  #{payment.invoice.invoice_number}
                </p>
                <p className="text-body-sm text-muted-foreground">
                  {formatCurrency(payment.invoice.total_amount)}
                </p>
              </Link>
            </div>
          )}

          {payment.contact && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <h3 className="text-body-md font-weight-semibold text-foreground mb-4">Customer</h3>
              <p className="text-body-md font-weight-medium text-foreground">
                {payment.contact.first_name} {payment.contact.last_name}
              </p>
              <p className="text-body-sm text-muted-foreground">{payment.contact.email}</p>
            </div>
          )}
        </div>
      </div>

      {showRefundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-md w-full mx-4">
            <h3 className="text-h4-md font-weight-semibold text-foreground mb-4">Issue Refund</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                refundMutation.mutate();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Refund Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    type="number"
                    step="0.01"
                    max={payment.amount - totalRefunded}
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    required
                    className="w-full pl-8 pr-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                </div>
                <p className="text-body-xs text-muted-foreground mt-1">
                  Max: {formatCurrency(payment.amount - totalRefunded)}
                </p>
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Reason *
                </label>
                <select
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                >
                  <option value="requested_by_customer">Requested by customer</option>
                  <option value="duplicate">Duplicate payment</option>
                  <option value="fraudulent">Fraudulent</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refundMutation.isPending}
                  className="px-4 py-2 bg-destructive text-destructive-foreground rounded-button hover:bg-destructive/90 transition-colors disabled:opacity-50"
                >
                  {refundMutation.isPending ? 'Processing...' : 'Issue Refund'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
