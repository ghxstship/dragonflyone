'use client';

/**
 * Bills List Page
 * Uses normalized ListPage template from @ghxstship/ui
 */

import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';
import {
  Badge, Body, Box, ListPage, Stack, Text, useNotifications} from '@ghxstship/ui';
import { useBills, useDeleteBill, type Bill } from '@/hooks/useBills';

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'outline'> = {
  draft: 'outline',
  pending: 'warning',
  approved: 'info',
  paid: 'success',
  partial: 'warning',
  cancelled: 'outline',
};

export default function BillsPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const { addNotification } = useNotifications();
  const canManage = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  const { data, isLoading, error, refetch } = useBills();
  const bills = data?.bills || [];
  const deleteMutation = useDeleteBill();

  const handleDelete = async (bill: Bill) => {
    if (!confirm(`Delete bill "${bill.bill_number}"?`)) return;
    try {
      await deleteMutation.mutateAsync(bill.id);
      addNotification({ type: 'success', title: 'Bill Deleted', message: `Bill ${bill.bill_number} has been deleted` });
    } catch (err) {
      addNotification({ type: 'error', title: 'Delete Failed', message: err instanceof Error ? err.message : 'Failed to delete bill' });
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (dateStr: string | null | undefined) => dateStr ? new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A';

  const columns: ListPageColumn<Bill>[] = [
    {
      key: 'bill_number', label: 'Bill', accessor: 'bill_number', sortable: true,
      render: (_, bill) => (
        <Box>
          <Text className="font-weight-medium">{bill.bill_number}</Text>
          {bill.project?.name && <Body size="sm" className="text-muted-foreground">{bill.project.name}</Body>}
        </Box>
      ),
    },
    { key: 'vendor', label: 'Vendor', accessor: (bill) => bill.vendor?.name || 'Unknown', sortable: true },
    {
      key: 'status', label: 'Status', accessor: 'status', sortable: true,
      render: (_, bill) => (
        <Badge variant={STATUS_COLORS[bill.status] || 'outline'}>
          <Stack direction="horizontal" gap={1} className="items-center">
            {bill.status === 'paid' && <CheckCircle className="h-3 w-3" />}
            {bill.status === 'partial' && <AlertCircle className="h-3 w-3" />}
            {bill.status}
          </Stack>
        </Badge>
      ),
    },
    {
      key: 'amount', label: 'Amount', accessor: 'amount', sortable: true,
      render: (_, bill) => <Text className="font-weight-medium">{formatCurrency(bill.amount || 0)}</Text>,
    },
    {
      key: 'amount_due', label: 'Due', accessor: (bill) => bill.amount - bill.amount_paid,
      render: (_, bill) => {
        const amountDue = bill.amount - bill.amount_paid;
        return <Text className={amountDue > 0 ? 'text-warning' : 'text-success'}>{formatCurrency(amountDue)}</Text>;
      },
    },
    {
      key: 'due_date', label: 'Due Date', accessor: 'due_date', sortable: true,
      render: (_, bill) => <Text>{formatDate(bill.due_date)}</Text>,
    },
  ];

  const filters: ListPageFilter[] = [
    { key: 'status', label: 'Status', options: [
      { value: 'draft', label: 'Draft' },
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'paid', label: 'Paid' },
      { value: 'overdue', label: 'Overdue' },
    ]},
  ];

  const rowActions: ListPageAction<Bill>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (bill) => router.push(`/finance/bills/${bill.id}`) },
    ...(canManage ? [
      { id: 'edit', label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: (bill: Bill) => router.push(`/finance/bills/${bill.id}/edit`) },
      { id: 'delete', label: 'Delete', icon: <Trash2 className="h-4 w-4" />, variant: 'danger' as const, onClick: (bill: Bill) => handleDelete(bill) },
    ] : []),
  ];

  return (
    <ListPage<Bill>
      title="Bills"
      subtitle="Manage bills and accounts payable"
      data={bills}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      error={error}
      onRetry={refetch}
      searchPlaceholder="Search bills..."
      filters={filters}
      rowActions={rowActions}
      onRowClick={(bill) => router.push(`/finance/bills/${bill.id}`)}
      createLabel="New Bill"
      onCreate={canManage ? () => router.push('/finance/bills/new') : undefined}
      emptyMessage="No bills yet"
      emptyAction={canManage ? { label: 'Add Bill', onClick: () => router.push('/finance/bills/new') } : undefined}
      entityType="bills"
      breadcrumbs={[{ label: 'Finance', href: '/finance' }, { label: 'Bills' }]}
      showFavorite
      showSettings
    />
  );
}
