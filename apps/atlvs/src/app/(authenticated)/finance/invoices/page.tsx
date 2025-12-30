'use client';

/**
 * Invoices List Page
 * Uses normalized ListPage template from @ghxstship/ui
 */

import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';
import {
  Badge, Body, Box, ListPage, Stack, Text, useNotifications} from '@ghxstship/ui';
import { useInvoices, useDeleteInvoice, type Invoice } from '@/hooks/useInvoices';

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'outline'> = {
  draft: 'outline',
  sent: 'info',
  paid: 'success',
  partial: 'warning',
  overdue: 'error',
  cancelled: 'outline',
};

export default function InvoicesPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const { addNotification } = useNotifications();
  const canManage = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const { data: invoices = [], isLoading, error, refetch } = useInvoices();
  const deleteMutation = useDeleteInvoice();

  const handleDelete = async (inv: Invoice) => {
    if (!confirm(`Delete invoice ${inv.invoice_number}?`)) return;
    try {
      await deleteMutation.mutateAsync(inv.id);
    } catch (err) {
      addNotification({ type: 'error', title: 'Delete Failed', message: err instanceof Error ? err.message : 'Failed to delete invoice' });
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (dateStr: string | null | undefined) => dateStr ? new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

  const columns: ListPageColumn<Invoice>[] = [
    {
      key: 'invoice_number', label: 'Invoice', accessor: 'invoice_number', sortable: true,
      render: (_, inv) => (
        <Box>
          <Text className="font-weight-medium">{inv.invoice_number}</Text>
          {inv.project_name && <Body size="sm" className="text-muted-foreground">{inv.project_name}</Body>}
        </Box>
      ),
    },
    { key: 'client_name', label: 'Client', accessor: 'client_name', sortable: true },
    {
      key: 'status', label: 'Status', accessor: 'status', sortable: true,
      render: (_, inv) => (
        <Badge variant={STATUS_COLORS[inv.status] || 'outline'}>
          <Stack direction="horizontal" gap={1} className="items-center">
            {inv.status === 'paid' && <CheckCircle className="h-3 w-3" />}
            {inv.status === 'overdue' && <AlertCircle className="h-3 w-3" />}
            {inv.status}
          </Stack>
        </Badge>
      ),
    },
    {
      key: 'total_amount', label: 'Amount', accessor: 'total_amount', sortable: true,
      render: (_, inv) => <Text className="font-weight-medium">{formatCurrency(inv.total_amount)}</Text>,
    },
    {
      key: 'amount_due', label: 'Due', accessor: 'amount_due', sortable: true,
      render: (_, inv) => <Text className={inv.amount_due > 0 ? 'text-warning' : 'text-success'}>{formatCurrency(inv.amount_due)}</Text>,
    },
    {
      key: 'due_date', label: 'Due Date', accessor: 'due_date', sortable: true,
      render: (_, inv) => <Text>{formatDate(inv.due_date)}</Text>,
    },
  ];

  const filters: ListPageFilter[] = [
    { key: 'status', label: 'Status', options: [
      { value: 'draft', label: 'Draft' },
      { value: 'sent', label: 'Sent' },
      { value: 'paid', label: 'Paid' },
      { value: 'partial', label: 'Partial' },
      { value: 'overdue', label: 'Overdue' },
    ]},
  ];

  const rowActions: ListPageAction<Invoice>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (inv) => router.push(`/finance/invoices/${inv.id}`) },
    ...(canManage ? [
      { id: 'edit', label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: (inv: Invoice) => router.push(`/finance/invoices/${inv.id}/edit`) },
      { id: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" />, variant: 'danger' as const, onClick: (inv: Invoice) => handleDelete(inv) },
    ] : []),
  ];

  return (
    <ListPage<Invoice>
      title="Invoices"
      subtitle="Manage invoices and accounts receivable"
      data={invoices}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      error={error}
      onRetry={refetch}
      searchPlaceholder="Search invoices..."
      filters={filters}
      rowActions={rowActions}
      onRowClick={(inv) => router.push(`/finance/invoices/${inv.id}`)}
      createLabel="New Invoice"
      onCreate={canManage ? () => router.push('/finance/invoices/new') : undefined}
      emptyMessage="No invoices yet"
      emptyAction={canManage ? { label: 'Create Invoice', onClick: () => router.push('/finance/invoices/new') } : undefined}
      entityType="invoices"
      breadcrumbs={[{ label: 'Finance', href: '/finance' }, { label: 'Invoices' }]}
      showFavorite
      showSettings
    />
  );
}
