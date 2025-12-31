'use client';

/**
 * Invoice Detail Page
 * Uses DetailPage template for consistent layout with tabs
 */

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Edit2, Send, Mail, DollarSign, Calendar, FileText, Clock, CheckCircle, Download, Printer, CreditCard} from 'lucide-react';
import {
  DetailPage, Stack, Grid, Card, Section, SectionHeader, StatCard, Badge, Button, Body, H3, Label, Input, Select, useNotifications, Box} from '@ghxstship/ui';
import { useInvoice, useSendInvoice, useRecordPayment } from '@/hooks/useInvoices';

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

const getStatusVariant = (status: string): 'solid' | 'outline' => {
  return status === 'paid' ? 'solid' : 'outline';
};

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addNotification } = useNotifications();
  const invoiceId = params.id as string;

  const { data: invoice, isLoading, error, refetch } = useInvoice(invoiceId);
  const sendMutation = useSendInvoice();
  const paymentMutation = useRecordPayment();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [paymentReference, setPaymentReference] = useState('');

  const handleSend = async () => {
    try {
      await sendMutation.mutateAsync(invoiceId);
      addNotification({ type: 'success', title: 'Invoice Sent', message: 'Invoice has been sent to the client' });
    } catch {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to send invoice' });
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
      addNotification({ type: 'success', title: 'Payment Recorded', message: 'Payment has been recorded successfully' });
    } catch {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to record payment' });
    }
  };

  const renderDetailsContent = () => {
    if (!invoice) return null;
    
    return (
      <Stack gap={6}>
        <Grid cols={4} gap={4} className="grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Amount"
            value={formatCurrency(invoice.total_amount)}
            icon={<FileText className="size-5" />}
          />
          <StatCard
            label="Amount Paid"
            value={formatCurrency(invoice.amount_paid)}
            icon={<CheckCircle className="size-5" />}
            trend="up"
          />
          <StatCard
            label="Balance Due"
            value={formatCurrency(invoice.amount_due)}
            icon={<Clock className="size-5" />}
            trend={invoice.amount_due > 0 ? 'down' : undefined}
          />
          <StatCard
            label="Due Date"
            value={formatDate(invoice.due_date)}
            icon={<Calendar className="size-5" />}
          />
        </Grid>

        <Grid cols={2} gap={6} className="grid-cols-1 lg:grid-cols-2">
          <Section border>
            <SectionHeader title="Bill To" />
            <Stack gap={3}>
              <Body className="text-white">{invoice.client_name}</Body>
              {invoice.project_name && (
                <Body size="sm" className="text-on-dark-secondary">Project: {invoice.project_name}</Body>
              )}
            </Stack>
          </Section>

          <Section border>
            <SectionHeader title="Invoice Details" />
            <Stack gap={3}>
              <Stack direction="horizontal" className="justify-between">
                <Body size="sm" className="text-on-dark-muted">Issue Date</Body>
                <Body size="sm" className="text-white">{formatDate(invoice.issue_date)}</Body>
              </Stack>
              <Stack direction="horizontal" className="justify-between">
                <Body size="sm" className="text-on-dark-muted">Due Date</Body>
                <Body size="sm" className="text-white">{formatDate(invoice.due_date)}</Body>
              </Stack>
              <Stack direction="horizontal" className="justify-between">
                <Body size="sm" className="text-on-dark-muted">Payment Terms</Body>
                <Body size="sm" className="text-white">Net 30</Body>
              </Stack>
            </Stack>
          </Section>
        </Grid>

        {invoice.notes && (
          <Section border>
            <SectionHeader title="Notes" />
            <Body size="sm" className="whitespace-pre-wrap text-on-dark-secondary">{invoice.notes}</Body>
          </Section>
        )}
      </Stack>
    );
  };

  const renderPaymentsContent = () => {
    if (!invoice) return null;

    return (
      <Stack gap={6}>
        <Section border>
          <SectionHeader 
            title="Payment History" 
            description="All payments recorded for this invoice"
          />
          {invoice.amount_paid > 0 ? (
            <Stack gap={3}>
              <Card inverted className="border-2 border-ink-800 p-4">
                <Stack direction="horizontal" className="items-center justify-between">
                  <Stack gap={1}>
                    <Body className="text-white">Payment Received</Body>
                    <Body size="xs" className="text-on-dark-disabled">Credit Card</Body>
                  </Stack>
                  <Body className="font-mono text-success">{formatCurrency(invoice.amount_paid)}</Body>
                </Stack>
              </Card>
            </Stack>
          ) : (
            <Card inverted className="border-2 border-ink-800 p-8 text-center">
              <Stack gap={3} className="items-center">
                <CreditCard className="size-8 text-on-dark-disabled" />
                <Body className="text-on-dark-muted">No payments recorded yet</Body>
                <Button 
                  variant="solid" 
                  size="sm"
                  onClick={() => setShowPaymentModal(true)}
                  icon={<DollarSign className="size-4" />}
                  iconPosition="left"
                >
                  Record Payment
                </Button>
              </Stack>
            </Card>
          )}
        </Section>
      </Stack>
    );
  };

  const renderActivityContent = () => {
    if (!invoice) return null;

    return (
      <Stack gap={6}>
        <Section border>
          <SectionHeader 
            title="Activity Log" 
            description="Timeline of all invoice activity"
          />
          <Stack gap={3}>
            <Card inverted className="border-2 border-ink-800 p-4">
              <Stack direction="horizontal" className="items-start gap-4">
                <FileText className="mt-1 size-4 text-primary" />
                <Stack gap={1} className="flex-1">
                  <Body size="sm" className="text-white">Invoice Created</Body>
                  <Body size="xs" className="text-on-dark-disabled">{formatDate(invoice.issue_date)}</Body>
                </Stack>
              </Stack>
            </Card>
            {invoice.status !== 'draft' && (
              <Card inverted className="border-2 border-ink-800 p-4">
                <Stack direction="horizontal" className="items-start gap-4">
                  <Send className="mt-1 size-4 text-info" />
                  <Stack gap={1} className="flex-1">
                    <Body size="sm" className="text-white">Invoice Sent</Body>
                    <Body size="xs" className="text-on-dark-disabled">Sent to {invoice.client_name}</Body>
                  </Stack>
                </Stack>
              </Card>
            )}
            {invoice.amount_paid > 0 && (
              <Card inverted className="border-2 border-ink-800 p-4">
                <Stack direction="horizontal" className="items-start gap-4">
                  <CheckCircle className="mt-1 size-4 text-success" />
                  <Stack gap={1} className="flex-1">
                    <Body size="sm" className="text-white">Payment Received</Body>
                    <Body size="xs" className="text-on-dark-disabled">{formatCurrency(invoice.amount_paid)}</Body>
                  </Stack>
                </Stack>
              </Card>
            )}
          </Stack>
        </Section>
      </Stack>
    );
  };

  const tabs = [
    { id: 'details', label: 'Details', content: renderDetailsContent() },
    { id: 'payments', label: 'Payments', content: renderPaymentsContent() },
    { id: 'activity', label: 'Activity', content: renderActivityContent() },
  ];

  return (
    <>
      <DetailPage
        header={{
          kicker: 'Invoice',
          title: invoice?.invoice_number || 'Loading...',
          description: invoice?.client_name,
          badge: invoice ? (
            <Badge variant={getStatusVariant(invoice.status)}>
              {invoice.status.toUpperCase()}
            </Badge>
          ) : undefined,
        }}
        backButton={{ label: 'Back to Invoices', href: '/invoices' }}
        loading={isLoading}
        error={error instanceof Error ? error : null}
        onRetry={() => refetch()}
        tabs={tabs}
        actions={
          invoice && (
            <Stack direction="horizontal" gap={2}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                icon={<Printer className="size-4" />}
                iconPosition="left"
              >
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Download className="size-4" />}
                iconPosition="left"
              >
                Download
              </Button>
              {invoice.status === 'draft' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/invoices/${invoiceId}/edit`)}
                    icon={<Edit2 className="size-4" />}
                    iconPosition="left"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="solid"
                    size="sm"
                    onClick={handleSend}
                    disabled={sendMutation.isPending}
                    icon={<Send className="size-4" />}
                    iconPosition="left"
                  >
                    {sendMutation.isPending ? 'Sending...' : 'Send Invoice'}
                  </Button>
                </>
              )}
              {['sent', 'viewed', 'partial', 'overdue'].includes(invoice.status) && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSend}
                    disabled={sendMutation.isPending}
                    icon={<Mail className="size-4" />}
                    iconPosition="left"
                  >
                    Send Reminder
                  </Button>
                  <Button
                    variant="solid"
                    size="sm"
                    onClick={() => setShowPaymentModal(true)}
                    icon={<DollarSign className="size-4" />}
                    iconPosition="left"
                  >
                    Record Payment
                  </Button>
                </>
              )}
            </Stack>
          )
        }
      />
      

      {showPaymentModal && invoice && (
        <Box className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card inverted className="w-full max-w-md border-2 border-ink-700 p-6">
            <Stack gap={6}>
              <H3 className="text-white">Record Payment</H3>
              
              <Stack gap={4}>
                <Stack gap={2}>
                  <Label>Amount</Label>
                  <Box className="relative">
                    <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-dark-disabled" />
                    <Input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder={`Max: ${invoice.amount_due}`}
                      max={invoice.amount_due}
                      step="0.01"
                      className="pl-10"
                    />
                  </Box>
                </Stack>
                
                <Stack gap={2}>
                  <Label>Payment Method</Label>
                  <Select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="ach">ACH / Bank Transfer</option>
                    <option value="check">Check</option>
                    <option value="cash">Cash</option>
                    <option value="wire">Wire Transfer</option>
                  </Select>
                </Stack>
                
                <Stack gap={2}>
                  <Label>Reference (Optional)</Label>
                  <Input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="Check #, Transaction ID, etc."
                  />
                </Stack>
              </Stack>
              
              <Stack direction="horizontal" gap={3} className="justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="solid"
                  onClick={handleRecordPayment}
                  disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || paymentMutation.isPending}
                  icon={<CheckCircle className="size-4" />}
                  iconPosition="left"
                >
                  {paymentMutation.isPending ? 'Recording...' : 'Record Payment'}
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Box>
      )}
    </>
  );
}
