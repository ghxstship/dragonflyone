'use client';

import {
  Body,
  Button,
  H1,
  H2,
  Input,
  Label,
  Select,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, Send, Mail, DollarSign, Calendar, FileText, Clock, CheckCircle, Download, Printer, AlertTriangle } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { useInvoice, useSendInvoice, useRecordPayment } from '@/hooks/useInvoices';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params.id as string;

  const { data: invoice, isLoading, error } = useInvoice(invoiceId);
  const sendMutation = useSendInvoice();
  const paymentMutation = useRecordPayment();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [paymentReference, setPaymentReference] = useState('');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleSend = async () => {
    try {
      await sendMutation.mutateAsync(invoiceId);
    } catch (err) {
      console.error('Failed to send invoice:', err);
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) return;
    try {
      await paymentMutation.mutateAsync({
        invoice_id: invoiceId,
        amount: parseFloat(paymentAmount),
        payment_method: paymentMethod,
        reference: paymentReference || undefined,
      });
      setShowPaymentModal(false);
      setPaymentAmount('');
      setPaymentReference('');
    } catch (err) {
      console.error('Failed to record payment:', err);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return { label: 'Draft', color: 'bg-muted text-muted-foreground' };
      case 'sent':
        return { label: 'Sent', color: 'bg-primary/20 text-primary' };
      case 'viewed':
        return { label: 'Viewed', color: 'bg-warning/20 text-warning' };
      case 'partial':
        return { label: 'Partially Paid', color: 'bg-warning/20 text-warning' };
      case 'paid':
        return { label: 'Paid', color: 'bg-success/20 text-success' };
      case 'overdue':
        return { label: 'Overdue', color: 'bg-destructive/20 text-destructive' };
      default:
        return { label: status, color: 'bg-muted text-muted-foreground' };
    }
  };

  if (isLoading) {
    return (
      <AtlvsAppLayout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="animate-pulse text-muted-foreground">Loading invoice...</div>
        </div>
      </AtlvsAppLayout>
    );
  }

  if (error || !invoice) {
    return (
      <AtlvsAppLayout>
        <div className="p-6">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <H2 className="text-h3-md font-weight-bold text-foreground mb-2">Invoice Not Found</H2>
            <Body className="text-body-sm text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'The requested invoice could not be found.'}
            </Body>
            <Link
              href="/invoices"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button text-body-sm font-weight-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Invoices
            </Link>
          </div>
        </div>
      </AtlvsAppLayout>
    );
  }

  const statusConfig = getStatusConfig(invoice.status);

  return (
    <AtlvsAppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/invoices"
              className="p-2 hover:bg-muted rounded-button transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <H1 className="text-h2-md font-weight-bold text-foreground">{invoice.invoice_number}</H1>
                <Text className={`px-3 py-1 rounded-badge text-body-sm font-weight-medium ${statusConfig.color}`}>
                  {statusConfig.label}
                </Text>
              </div>
              <Body className="text-body-sm text-muted-foreground mt-1">
                {invoice.client_name}
              </Body>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            {invoice.status === 'draft' && (
              <>
                <Button
                  onClick={() => router.push(`/invoices/${invoiceId}/edit`)}
                  className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={sendMutation.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary text-body-sm font-weight-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {sendMutation.isPending ? 'Sending...' : 'Send Invoice'}
                </Button>
              </>
            )}
            {['sent', 'viewed', 'partial', 'overdue'].includes(invoice.status) && (
              <>
                <Button
                  onClick={handleSend}
                  disabled={sendMutation.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors disabled:opacity-50"
                >
                  <Mail className="h-4 w-4" />
                  Send Reminder
                </Button>
                <Button
                  onClick={() => setShowPaymentModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-button border-2 border-success text-body-sm font-weight-medium hover:bg-success/90 transition-colors"
                >
                  <DollarSign className="h-4 w-4" />
                  Record Payment
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-background border-2 border-border rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-5 w-5 text-primary" />
              <Text className="text-body-sm text-muted-foreground">Total Amount</Text>
            </div>
            <Body className="text-h3-md font-weight-bold text-foreground">
              {formatCurrency(invoice.total_amount)}
            </Body>
          </div>
          <div className="bg-background border-2 border-border rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <Text className="text-body-sm text-muted-foreground">Paid</Text>
            </div>
            <Body className="text-h3-md font-weight-bold text-success">
              {formatCurrency(invoice.amount_paid)}
            </Body>
          </div>
          <div className="bg-background border-2 border-border rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-warning" />
              <Text className="text-body-sm text-muted-foreground">Balance Due</Text>
            </div>
            <Body className="text-h3-md font-weight-bold text-warning">
              {formatCurrency(invoice.amount_due)}
            </Body>
          </div>
          <div className="bg-background border-2 border-border rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-5 w-5 text-primary" />
              <Text className="text-body-sm text-muted-foreground">Due Date</Text>
            </div>
            <Body className="text-body-lg font-weight-medium text-foreground">
              {formatDate(invoice.due_date)}
            </Body>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Bill To</H2>
            <div className="space-y-2">
              <Body className="text-body-lg font-weight-medium text-foreground">{invoice.client_name}</Body>
              {invoice.project_name && (
                <Body className="text-body-sm text-muted-foreground">Project: {invoice.project_name}</Body>
              )}
            </div>
          </div>

          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Invoice Details</H2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Text className="text-body-sm text-muted-foreground">Issue Date</Text>
                <Text className="text-body-sm font-weight-medium text-foreground">{formatDate(invoice.issue_date)}</Text>
              </div>
              <div className="flex justify-between">
                <Text className="text-body-sm text-muted-foreground">Due Date</Text>
                <Text className="text-body-sm font-weight-medium text-foreground">{formatDate(invoice.due_date)}</Text>
              </div>
              <div className="flex justify-between">
                <Text className="text-body-sm text-muted-foreground">Status</Text>
                <Text className={`text-body-sm font-weight-medium ${statusConfig.color.replace('bg-', 'text-').split(' ')[1]}`}>
                  {statusConfig.label}
                </Text>
              </div>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="bg-background border-2 border-border rounded-card p-6">
            <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">Notes</H2>
            <Body className="text-body-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</Body>
          </div>
        )}

        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background border-2 border-border rounded-card p-6 w-full max-w-md">
              <H2 className="text-h4-md font-weight-semibold text-foreground mb-4">
                Record Payment
              </H2>
              <div className="space-y-4 mb-6">
                <div>
                  <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Amount
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder={`Max: ${invoice.amount_due}`}
                      max={invoice.amount_due}
                      step="0.01"
                      className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Payment Method
                  </Label>
                  <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="ach">ACH / Bank Transfer</option>
                    <option value="check">Check</option>
                    <option value="cash">Cash</option>
                    <option value="wire">Wire Transfer</option>
                  </Select>
                </div>
                <div>
                  <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                    Reference (Optional)
                  </Label>
                  <Input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Check #, Transaction ID, etc."
                    className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <Button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRecordPayment}
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || paymentMutation.isPending}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-success text-success-foreground rounded-button border-2 border-success text-body-sm font-weight-medium hover:bg-success/90 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  {paymentMutation.isPending ? 'Recording...' : 'Record Payment'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AtlvsAppLayout>
  );
}
