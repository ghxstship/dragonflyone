'use client';

import {
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
  H3,
  Input,
  Label,
  MainContent,
  Modal,
  Select,
  Skeleton,
  Stack,
  Text,
} from '@ghxstship/ui';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, Building2, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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
  const router = useRouter();
  const queryClient = useQueryClient();
  const paymentId = params?.id as string;
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

  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'completed': return 'success';
      case 'failed':
      case 'cancelled': return 'error';
      case 'pending':
      case 'processing': return 'warning';
      case 'refunded': return 'info';
      default: return 'info';
    }
  };

  if (isLoading) {
    return (
      <>
        <EnterprisePageHeader title="Payment Details" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Grid cols={3} gap={6}>
              <Box className="col-span-2"><Skeleton className="h-64" /></Box>
              <Skeleton className="h-64" />
            </Grid>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error || !payment) {
    return (
      <>
        <EnterprisePageHeader title="Payment Details" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Payment not found"
              description="The payment you're looking for doesn't exist or has been removed."
              action={{ label: 'Back to Payments', onClick: () => router.push('/payments') }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  const totalRefunded = payment.refunds.reduce((sum, r) => sum + r.amount, 0);
  const canRefund = payment.status === 'completed' && totalRefunded < payment.amount;

  return (
    <>
      <EnterprisePageHeader
        title="Payment Details"
        subtitle={payment.reference_number || payment.id}
      />
      <Box className="px-6 py-3 border-b border-border flex items-center justify-end">
        {canRefund && (
          <Button
            variant="destructive"
            onClick={() => {
              setRefundAmount((payment.amount - totalRefunded).toString());
              setShowRefundModal(true);
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Issue Refund
          </Button>
        )}
      </Box>
      <MainContent padding="lg">
        <Container>
          <Grid cols={3} gap={6}>
            <Stack gap={6} className="col-span-2">
              <Card className="p-6">
                <Stack direction="horizontal" className="justify-between mb-6">
                  <Stack direction="horizontal" gap={3} className="items-center">
                    {getStatusIcon(payment.status)}
                    <Stack gap={0}>
                      <H2>{formatCurrency(payment.amount)}</H2>
                      <Body size="sm" className="text-muted-foreground">
                        {formatDate(payment.payment_date)}
                      </Body>
                    </Stack>
                  </Stack>
                  <Badge variant={getStatusVariant(payment.status)}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Badge>
                </Stack>

                <Grid cols={2} gap={4}>
                  <Stack gap={1}>
                    <Body size="xs" className="text-muted-foreground uppercase">Payment Method</Body>
                    <Stack direction="horizontal" gap={2} className="items-center">
                      {payment.payment_method === 'card' ? (
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      )}
                      <Text className="capitalize">{payment.payment_method}</Text>
                    </Stack>
                  </Stack>
                  <Stack gap={1}>
                    <Body size="xs" className="text-muted-foreground uppercase">Reference</Body>
                    <Body className="font-mono">{payment.reference_number || '-'}</Body>
                  </Stack>
                </Grid>

                {payment.notes && (
                  <Box className="mt-4 pt-4 border-t border-border">
                    <Body size="xs" className="text-muted-foreground uppercase mb-1">Notes</Body>
                    <Body>{payment.notes}</Body>
                  </Box>
                )}
              </Card>

              {payment.refunds.length > 0 && (
                <Card className="p-6">
                  <H3 className="mb-4">Refunds</H3>
                  <Stack gap={3}>
                    {payment.refunds.map((refund) => (
                      <Box key={refund.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-card">
                        <Stack gap={0}>
                          <Body className="font-weight-medium">{formatCurrency(refund.amount)}</Body>
                          <Body size="xs" className="text-muted-foreground">{formatDate(refund.created_at)}</Body>
                        </Stack>
                        <Badge variant={getStatusVariant(refund.status)}>{refund.status}</Badge>
                      </Box>
                    ))}
                  </Stack>
                  <Box className="mt-4 pt-4 border-t border-border">
                    <Stack direction="horizontal" className="justify-between">
                      <Text size="sm" className="text-muted-foreground">Total Refunded</Text>
                      <Text className="font-weight-semibold">{formatCurrency(totalRefunded)}</Text>
                    </Stack>
                  </Box>
                </Card>
              )}
            </Stack>

            <Stack gap={6}>
              {payment.invoice && (
                <Card className="p-6">
                  <H3 className="mb-4">Linked Invoice</H3>
                  <Link href={`/invoices/${payment.invoice.id}`}>
                    <Box className="p-3 bg-muted/30 rounded-card hover:bg-muted/50 transition-colors">
                      <Body className="font-weight-medium">#{payment.invoice.invoice_number}</Body>
                      <Body size="sm" className="text-muted-foreground">
                        {formatCurrency(payment.invoice.total_amount)}
                      </Body>
                    </Box>
                  </Link>
                </Card>
              )}

              {payment.contact && (
                <Card className="p-6">
                  <H3 className="mb-4">Customer</H3>
                  <Body className="font-weight-medium">
                    {payment.contact.first_name} {payment.contact.last_name}
                  </Body>
                  <Body size="sm" className="text-muted-foreground">{payment.contact.email}</Body>
                </Card>
              )}
            </Stack>
          </Grid>

          <Modal open={showRefundModal} onClose={() => setShowRefundModal(false)} title="Issue Refund">
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                refundMutation.mutate();
              }}
            >
              <Stack gap={4}>
                <Stack gap={2}>
                  <Label>Refund Amount *</Label>
                  <Box className="relative">
                    <Text className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</Text>
                    <Input
                      type="number"
                      step="0.01"
                      max={payment.amount - totalRefunded}
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      required
                      className="pl-8"
                    />
                  </Box>
                  <Body size="xs" className="text-muted-foreground">
                    Max: {formatCurrency(payment.amount - totalRefunded)}
                  </Body>
                </Stack>
                <Stack gap={2}>
                  <Label>Reason *</Label>
                  <Select
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                  >
                    <option value="requested_by_customer">Requested by customer</option>
                    <option value="duplicate">Duplicate payment</option>
                    <option value="fraudulent">Fraudulent</option>
                    <option value="other">Other</option>
                  </Select>
                </Stack>
                <Stack direction="horizontal" gap={3} className="justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowRefundModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="destructive" disabled={refundMutation.isPending}>
                    {refundMutation.isPending ? 'Processing...' : 'Issue Refund'}
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
