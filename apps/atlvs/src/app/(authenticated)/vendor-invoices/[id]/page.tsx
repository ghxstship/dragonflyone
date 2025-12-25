'use client';

import {
  Alert,
  Badge,
  Body,
  Box,
  Button,
  Card,
  Container,
  EmptyState,
  EnterprisePageHeader,
  Form,
  Grid,
  H2,
  Input,
  Label,
  MainContent,
  Modal,
  Select,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import { FileText, CheckCircle, AlertTriangle, CreditCard, Trash2 } from 'lucide-react';
import { useVendorInvoice, useApproveVendorInvoice, useRecordPayment, useDeleteVendorInvoice } from '@/hooks/useVendorInvoices';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' }> = {
  draft: { label: 'Draft', variant: 'info' },
  pending: { label: 'Pending Approval', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  disputed: { label: 'Disputed', variant: 'error' },
  paid: { label: 'Paid', variant: 'success' },
  partial: { label: 'Partial Payment', variant: 'info' },
  cancelled: { label: 'Cancelled', variant: 'info' },
  void: { label: 'Void', variant: 'info' },
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
      <>
        <EnterprisePageHeader title="Vendor Invoice" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Stack gap={6}>
              <Skeleton className="h-8 w-1/3" />
              <Grid cols={3} gap={6}>
                <Box className="col-span-2"><Skeleton className="h-64" /></Box>
                <Skeleton className="h-64" />
              </Grid>
            </Stack>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error || !invoice) {
    return (
      <>
        <EnterprisePageHeader title="Vendor Invoice" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Invoice not found"
              description="The invoice you're looking for doesn't exist or has been removed."
              action={{ label: 'Back to Invoices', onClick: () => router.push('/vendor-invoices') }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  const statusConfig = STATUS_CONFIG[invoice.status] || STATUS_CONFIG.pending;
  const daysUntilDue = getDaysUntilDue(invoice.due_date);
  const isOverdue = daysUntilDue < 0 && invoice.payment_status !== 'paid';

  return (
    <>
      <EnterprisePageHeader
        title={invoice.invoice_number}
        subtitle={`${invoice.vendor?.name || 'Unknown Vendor'}${invoice.vendor_invoice_number ? ` • Vendor Invoice: ${invoice.vendor_invoice_number}` : ''}`}
      />
      <Box className="px-6 py-3 border-b border-border flex items-center justify-between">
        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        <Stack direction="horizontal" gap={2}>
          {invoice.status === 'pending' && (
            <Button variant="outline" onClick={handleApprove} disabled={approveMutation.isPending}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          )}
          {invoice.status === 'approved' && invoice.amount_due > 0 && (
            <Button onClick={() => setShowPaymentModal(true)}>
              <CreditCard className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          )}
          <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </Stack>
      </Box>
      <MainContent padding="lg">
        <Container>

          <Grid cols={3} gap={6}>
            <Stack gap={6} className="col-span-2">
              <Card className="p-6">
                <H2 className="mb-4">Line Items</H2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.line_items?.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                        <TableCell className="text-right font-weight-medium">{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Box className="border-t border-border mt-4 pt-4">
                  <Stack gap={2}>
                    <Stack direction="horizontal" className="justify-between">
                      <Text size="sm" className="text-muted-foreground">Subtotal</Text>
                      <Text size="sm">{formatCurrency(invoice.subtotal)}</Text>
                    </Stack>
                    {invoice.tax_amount > 0 && (
                      <Stack direction="horizontal" className="justify-between">
                        <Text size="sm" className="text-muted-foreground">Tax</Text>
                        <Text size="sm">{formatCurrency(invoice.tax_amount)}</Text>
                      </Stack>
                    )}
                    {invoice.discount_amount > 0 && (
                      <Stack direction="horizontal" className="justify-between">
                        <Text size="sm" className="text-muted-foreground">Discount</Text>
                        <Text size="sm" className="text-success">-{formatCurrency(invoice.discount_amount)}</Text>
                      </Stack>
                    )}
                    <Box className="pt-2 border-t border-border">
                      <Stack direction="horizontal" className="justify-between">
                        <Text className="font-weight-bold">Total</Text>
                        <Text className="text-h4-md font-weight-bold">{formatCurrency(invoice.total)}</Text>
                      </Stack>
                    </Box>
                  </Stack>
                </Box>
              </Card>

              {invoice.notes && (
                <Card className="p-6">
                  <H2 className="mb-4">Notes</H2>
                  <Body size="sm">{invoice.notes}</Body>
                </Card>
              )}
            </Stack>

            <Stack gap={6}>
              <Card className="p-6">
                <H2 className="mb-4">Payment Status</H2>
                <Stack gap={4}>
                  <Stack direction="horizontal" className="justify-between">
                    <Text size="sm" className="text-muted-foreground">Total</Text>
                    <Text size="sm" className="font-weight-medium">{formatCurrency(invoice.total)}</Text>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between">
                    <Text size="sm" className="text-muted-foreground">Paid</Text>
                    <Text size="sm" className="font-weight-medium text-success">{formatCurrency(invoice.amount_paid)}</Text>
                  </Stack>
                  <Box className="pt-2 border-t border-border">
                    <Stack direction="horizontal" className="justify-between">
                      <Text size="sm" className="font-weight-semibold">Balance Due</Text>
                      <Text className={`text-h4-md font-weight-bold ${invoice.amount_due > 0 ? 'text-destructive' : 'text-success'}`}>
                        {formatCurrency(invoice.amount_due)}
                      </Text>
                    </Stack>
                  </Box>
                </Stack>
              </Card>

              <Card className="p-6">
                <H2 className="mb-4">Details</H2>
                <Stack gap={3}>
                  <Stack gap={1}>
                    <Body size="xs" className="text-muted-foreground">Invoice Date</Body>
                    <Body size="sm" className="font-weight-medium">
                      {new Date(invoice.invoice_date).toLocaleDateString()}
                    </Body>
                  </Stack>
                  <Stack gap={1}>
                    <Body size="xs" className="text-muted-foreground">Due Date</Body>
                    <Body size="sm" className={`font-weight-medium ${isOverdue ? 'text-destructive' : ''}`}>
                      {new Date(invoice.due_date).toLocaleDateString()}
                      {isOverdue && <Text size="xs" className="ml-2">({Math.abs(daysUntilDue)} days overdue)</Text>}
                    </Body>
                  </Stack>
                  {invoice.payment_terms && (
                    <Stack gap={1}>
                      <Body size="xs" className="text-muted-foreground">Payment Terms</Body>
                      <Body size="sm" className="font-weight-medium">{invoice.payment_terms}</Body>
                    </Stack>
                  )}
                  {invoice.purchase_order && (
                    <Stack gap={1}>
                      <Body size="xs" className="text-muted-foreground">Purchase Order</Body>
                      <Link href={`/purchase-orders/${invoice.purchase_order.id}`} className="text-primary hover:underline">
                        <Text size="sm" className="font-weight-medium">{invoice.purchase_order.po_number}</Text>
                      </Link>
                    </Stack>
                  )}
                </Stack>
              </Card>

              {isOverdue && (
                <Alert variant="error">
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <AlertTriangle className="h-5 w-5" />
                    <Text className="font-weight-semibold">Overdue</Text>
                  </Stack>
                  <Body size="sm" className="mt-1">
                    This invoice is {Math.abs(daysUntilDue)} days past due.
                  </Body>
                </Alert>
              )}
            </Stack>
          </Grid>

          <Modal open={showPaymentModal} onClose={() => setShowPaymentModal(false)} title="Record Payment">
            <Form onSubmit={handleRecordPayment}>
              <Stack gap={4}>
                <Stack gap={2}>
                  <Label>Amount *</Label>
                  <Box className="relative">
                    <Text className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</Text>
                    <Input
                      type="number"
                      step="0.01"
                      max={invoice.amount_due}
                      placeholder={invoice.amount_due.toFixed(2)}
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                      className="pl-8"
                      required
                    />
                  </Box>
                </Stack>
                <Stack gap={2}>
                  <Label>Payment Method</Label>
                  <Select
                    value={paymentData.payment_method}
                    onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                  >
                    <option value="check">Check</option>
                    <option value="ach">ACH</option>
                    <option value="wire">Wire Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="cash">Cash</option>
                  </Select>
                </Stack>
                <Stack gap={2}>
                  <Label>Reference Number</Label>
                  <Input
                    type="text"
                    placeholder="Check # or transaction ID"
                    value={paymentData.reference_number}
                    onChange={(e) => setPaymentData({ ...paymentData, reference_number: e.target.value })}
                  />
                </Stack>
                <Stack gap={2}>
                  <Label>Payment Date</Label>
                  <Input
                    type="date"
                    value={paymentData.payment_date}
                    onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
                    required
                  />
                </Stack>
                <Stack direction="horizontal" gap={3} className="justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowPaymentModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={paymentMutation.isPending}>
                    {paymentMutation.isPending ? 'Recording...' : 'Record Payment'}
                  </Button>
                </Stack>
              </Stack>
            </Form>
          </Modal>
        </Container>
      </MainContent>
    </>
  );
}
