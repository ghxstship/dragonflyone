'use client';

import {
  Badge,
  Body,
  Box,
  Card,
  Container,
  EmptyState,
  EnterprisePageHeader,
  Grid,
  Input,
  MainContent,
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
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, FileText, DollarSign, Clock, AlertTriangle } from 'lucide-react';
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
  const router = useRouter();
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
      <>
        <EnterprisePageHeader title="Vendor Invoices" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container>
            <Stack gap={4}>
              <Grid cols={6} gap={4}>
                {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-20" />)}
              </Grid>
              <Skeleton className="h-64" />
            </Stack>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <EnterprisePageHeader title="Vendor Invoices" subtitle="Error" />
        <MainContent padding="lg">
          <Container>
            <EmptyState
              title="Failed to load vendor invoices"
              description="Please try again."
              action={{ label: 'Retry', onClick: () => window.location.reload() }}
            />
          </Container>
        </MainContent>
      </>
    );
  }

  const aging = data?.aging;

  return (
    <>
      <EnterprisePageHeader
        title="Vendor Invoices"
        subtitle="Manage accounts payable and vendor payments"
        primaryAction={{ label: 'Record Invoice', onClick: () => router.push('/vendor-invoices/new') }}
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={6}>
            {aging && (
              <Grid cols={6} gap={4}>
                <Card className="p-4">
                  <Stack direction="horizontal" gap={2} className="items-center mb-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Text size="xs" className="text-muted-foreground">Current</Text>
                  </Stack>
                  <Body className="font-weight-bold">{formatCurrency(aging.current)}</Body>
                </Card>
                <Card className="p-4">
                  <Text size="xs" className="text-muted-foreground mb-2">1-30 Days</Text>
                  <Body className="font-weight-bold text-warning">{formatCurrency(aging.days_1_30)}</Body>
                </Card>
                <Card className="p-4">
                  <Text size="xs" className="text-muted-foreground mb-2">31-60 Days</Text>
                  <Body className="font-weight-bold text-warning">{formatCurrency(aging.days_31_60)}</Body>
                </Card>
                <Card className="p-4">
                  <Text size="xs" className="text-muted-foreground mb-2">61-90 Days</Text>
                  <Body className="font-weight-bold text-destructive">{formatCurrency(aging.days_61_90)}</Body>
                </Card>
                <Card className="p-4">
                  <Stack direction="horizontal" gap={2} className="items-center mb-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <Text size="xs" className="text-muted-foreground">Over 90</Text>
                  </Stack>
                  <Body className="font-weight-bold text-destructive">{formatCurrency(aging.over_90)}</Body>
                </Card>
                <Card className="p-4 bg-primary/10 border-primary">
                  <Stack direction="horizontal" gap={2} className="items-center mb-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <Text size="xs" className="text-primary font-weight-medium">Total Outstanding</Text>
                  </Stack>
                  <Body className="font-weight-bold text-primary">{formatCurrency(aging.total_outstanding)}</Body>
                </Card>
              </Grid>
            )}

            <Stack direction="horizontal" gap={4} className="flex-wrap items-center">
              <Box className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </Box>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                {Object.entries(STATUS_CONFIG).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
              <Select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)}>
                <option value="">All Payment Status</option>
                {Object.entries(PAYMENT_STATUS_CONFIG).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </Select>
            </Stack>

            {(!filteredInvoices || filteredInvoices.length === 0) ? (
              <EmptyState
                title="No invoices found"
                description="Record your first vendor invoice to start tracking accounts payable."
                icon={<FileText className="h-12 w-12" />}
                action={{ label: 'Record Invoice', onClick: () => router.push('/vendor-invoices/new') }}
              />
            ) : (
              <Card className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Balance Due</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => {
                      const statusConfig = STATUS_CONFIG[invoice.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                      const paymentConfig = PAYMENT_STATUS_CONFIG[invoice.payment_status as keyof typeof PAYMENT_STATUS_CONFIG] || PAYMENT_STATUS_CONFIG.unpaid;
                      const daysUntilDue = getDaysUntilDue(invoice.due_date);
                      const isOverdue = daysUntilDue < 0 && invoice.payment_status !== 'paid';

                      return (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <Link href={`/vendor-invoices/${invoice.id}`} className="hover:underline">
                              <Body className="font-weight-medium">{invoice.invoice_number}</Body>
                              {invoice.vendor_invoice_number && (
                                <Body size="xs" className="text-muted-foreground">Vendor: {invoice.vendor_invoice_number}</Body>
                              )}
                            </Link>
                          </TableCell>
                          <TableCell>{invoice.vendor?.name || 'Unknown'}</TableCell>
                          <TableCell>
                            <Body className={isOverdue ? 'text-destructive font-weight-medium' : ''}>
                              {new Date(invoice.due_date).toLocaleDateString()}
                            </Body>
                            {isOverdue && <Body size="xs" className="text-destructive">{Math.abs(daysUntilDue)} days overdue</Body>}
                          </TableCell>
                          <TableCell className="text-right font-weight-medium">{formatCurrency(invoice.total)}</TableCell>
                          <TableCell className="text-right">
                            <Body className={`font-weight-bold ${paymentConfig.color}`}>{formatCurrency(invoice.amount_due)}</Body>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            )}
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
