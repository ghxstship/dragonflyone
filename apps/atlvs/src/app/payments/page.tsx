'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Trash2, CheckCircle } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import { usePayments, usePaymentStats, useCreatePayment, useUpdatePayment, useDeletePayment } from '../../hooks/usePayments';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  payment_method: string;
  status: string;
  payment_date: string;
  reference_number?: string;
  notes?: string;
  invoice?: {
    id: string;
    invoice_number: string;
    total_amount: number;
  };
}

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost'> = {
  completed: 'success',
  processing: 'warning',
  pending: 'info',
  failed: 'error',
  refunded: 'ghost',
  cancelled: 'ghost',
};

const methodLabels: Record<string, string> = {
  card: 'Credit Card',
  bank: 'Bank Transfer',
  check: 'Check',
  wire: 'Wire Transfer',
  cash: 'Cash',
  wallet: 'Digital Wallet',
  crypto: 'Cryptocurrency',
};

const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

const columns: ListPageColumn<Payment>[] = [
  {
    key: 'invoice',
    label: 'Invoice',
    accessor: (row) => row.invoice?.invoice_number || 'N/A',
  },
  {
    key: 'amount',
    label: 'Amount',
    accessor: 'amount',
    sortable: true,
    render: (value, row) => formatCurrency(Number(value) || 0, row.currency),
  },
  {
    key: 'payment_method',
    label: 'Method',
    accessor: 'payment_method',
    render: (value) => methodLabels[String(value)] || String(value),
  },
  {
    key: 'status',
    label: 'Status',
    accessor: 'status',
    sortable: true,
    render: (value) => (
      <Badge variant={statusColors[String(value)] || 'ghost'}>
        {String(value).charAt(0).toUpperCase() + String(value).slice(1)}
      </Badge>
    ),
  },
  {
    key: 'payment_date',
    label: 'Date',
    accessor: 'payment_date',
    sortable: true,
    render: (value) => value ? new Date(String(value)).toLocaleDateString() : '—',
  },
  {
    key: 'reference_number',
    label: 'Reference',
    accessor: 'reference_number',
    render: (value) => value || '—',
  },
];

const filters: ListPageFilter[] = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'processing', label: 'Processing' },
      { value: 'completed', label: 'Completed' },
      { value: 'failed', label: 'Failed' },
      { value: 'refunded', label: 'Refunded' },
    ],
  },
  {
    key: 'payment_method',
    label: 'Method',
    options: [
      { value: 'card', label: 'Credit Card' },
      { value: 'bank', label: 'Bank Transfer' },
      { value: 'check', label: 'Check' },
      { value: 'wire', label: 'Wire Transfer' },
      { value: 'cash', label: 'Cash' },
    ],
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'amount', label: 'Amount', type: 'number', required: true },
  { name: 'currency', label: 'Currency', type: 'select', required: true, options: [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
  ]},
  { name: 'payment_method', label: 'Payment Method', type: 'select', required: true, options: [
    { value: 'card', label: 'Credit Card' },
    { value: 'bank', label: 'Bank Transfer' },
    { value: 'check', label: 'Check' },
    { value: 'wire', label: 'Wire Transfer' },
    { value: 'cash', label: 'Cash' },
  ]},
  { name: 'payment_date', label: 'Payment Date', type: 'date', required: true },
  { name: 'reference_number', label: 'Reference Number', type: 'text' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

export default function PaymentsPage() {
  const router = useRouter();
  const { data: paymentsData, isLoading, error, refetch } = usePayments();
  const { data: stats } = usePaymentStats();
  const createMutation = useCreatePayment();
  const updateMutation = useUpdatePayment();
  const deleteMutation = useDeletePayment();

  const payments = paymentsData?.payments || [];

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  const rowActions: ListPageAction<Payment>[] = [
    {
      id: 'view',
      label: 'View Details',
      icon: <Eye className="size-4" />,
      onClick: (row) => {
        router.push(`/payments/${row.id}`);
      },
    },
    {
      id: 'complete',
      label: 'Mark Complete',
      icon: <CheckCircle className="size-4" />,
      onClick: async (row) => {
        await updateMutation.mutateAsync({ id: row.id, status: 'completed' });
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="size-4" />,
      variant: 'danger',
      onClick: (row) => {
        setPaymentToDelete(row);
        setDeleteConfirmOpen(true);
      },
    },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await createMutation.mutateAsync({
      amount: Number(data.amount),
      currency: String(data.currency || 'USD'),
      payment_method: data.payment_method as Payment['payment_method'],
      status: 'pending',
      payment_date: String(data.payment_date),
      reference_number: data.reference_number ? String(data.reference_number) : undefined,
      notes: data.notes ? String(data.notes) : undefined,
    });
    setCreateModalOpen(false);
  };

  const handleDelete = async () => {
    if (paymentToDelete) {
      await deleteMutation.mutateAsync(paymentToDelete.id);
      setDeleteConfirmOpen(false);
      setPaymentToDelete(null);
    }
  };

  const pageStats = [
    { label: 'Total Payments', value: stats?.total || 0 },
    { label: 'Total Amount', value: formatCurrency(stats?.total_amount || 0) },
    { label: 'Completed', value: stats?.by_status?.completed || 0 },
    { label: 'Pending', value: stats?.by_status?.pending || 0 },
  ];

  const detailSections: DetailSection[] = selectedPayment ? [
    {
      id: 'overview',
      title: 'Payment Details',
      content: (
        <Grid cols={2} gap={4}>
          <Body size="sm"><strong>Amount:</strong> {formatCurrency(selectedPayment.amount, selectedPayment.currency)}</Body>
          <Body size="sm"><strong>Method:</strong> {methodLabels[selectedPayment.payment_method] || selectedPayment.payment_method}</Body>
          <Body size="sm"><strong>Status:</strong> {selectedPayment.status}</Body>
          <Body size="sm"><strong>Date:</strong> {new Date(selectedPayment.payment_date).toLocaleDateString()}</Body>
          <Body size="sm"><strong>Reference:</strong> {selectedPayment.reference_number || '—'}</Body>
          <Body size="sm"><strong>Invoice:</strong> {selectedPayment.invoice?.invoice_number || '—'}</Body>
        </Grid>
      ),
    },
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<Payment>
        title="Payments"
        subtitle="Track and manage all payment transactions"
        data={payments}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search payments..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => {
          setSelectedPayment(row);
          setDrawerOpen(true);
        }}
        createLabel="Record Payment"
        onCreate={() => setCreateModalOpen(true)}
        stats={pageStats}
        emptyMessage="No payments found"
        emptyAction={{ label: 'Record Payment', onClick: () => setCreateModalOpen(true) }}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Record Payment"
        fields={formFields}
        onSubmit={handleCreate}
        submitLabel="Record"
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedPayment ? `Payment - ${formatCurrency(selectedPayment.amount)}` : 'Payment Details'}
        sections={detailSections}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Payment"
        message="Are you sure you want to delete this payment record? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="danger"
      />
    </AtlvsAppLayout>
  );
}
