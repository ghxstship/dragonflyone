'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, CheckCircle, XCircle } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import { useExpenses, useExpenseStats, useExpenseCategories, useApproveExpense, useRejectExpense } from '../../hooks/useExpenses';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Stack,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';
import { createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';

interface Expense {
  id: string;
  description: string;
  vendor_name?: string;
  amount: number;
  currency: string;
  expense_date: string;
  status: string;
  category?: { id: string; name: string };
  submitter?: { id: string; first_name: string; last_name: string };
}

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'solid'> = {
  paid: 'success',
  reimbursed: 'success',
  approved: 'info',
  submitted: 'warning',
  draft: 'solid',
  rejected: 'error',
};

const columns: ListPageColumn<Expense>[] = [
  { 
    key: 'description', 
    label: 'Description', 
    accessor: 'description', 
    sortable: true,
  },
  { 
    key: 'vendor_name', 
    label: 'Vendor', 
    accessor: 'vendor_name', 
    render: (value: unknown) => (value as string) || '—'
  },
  { 
    key: 'category', 
    label: 'Category', 
    accessor: (row) => row.category?.name || '—',
    render: (_, row) => row.category ? <Badge>{row.category.name}</Badge> : '—'
  },
  { 
    key: 'amount', 
    label: 'Amount', 
    accessor: 'amount', 
    sortable: true,
    render: (value, row) => `${row.currency || '$'}${Number(value || 0).toLocaleString()}`
  },
  { 
    key: 'expense_date', 
    label: 'Date', 
    accessor: 'expense_date', 
    sortable: true,
    render: (value) => new Date(String(value)).toLocaleDateString()
  },
  { 
    key: 'submitter', 
    label: 'Submitted By', 
    accessor: (row) => row.submitter ? `${row.submitter.first_name} ${row.submitter.last_name}` : '—',
  },
  { 
    key: 'status', 
    label: 'Status', 
    accessor: 'status', 
    sortable: true,
    render: (value) => (
      <Badge variant={statusColors[String(value)] || 'solid'}>
        {String(value).toUpperCase()}
      </Badge>
    )
  },
];

export default function ExpensesPage() {
  const router = useRouter();
  const { data: expenses, isLoading, error, refetch } = useExpenses();
  const { data: stats } = useExpenseStats();
  const { data: categories } = useExpenseCategories();
  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [expenseToAction, setExpenseToAction] = useState<Expense | null>(null);

  const formFields: FormFieldConfig[] = [
    { name: 'description', label: 'Description', type: 'text', required: true, placeholder: 'e.g., Equipment rental', colSpan: 2 },
    { name: 'vendor_name', label: 'Vendor', type: 'text', placeholder: 'Vendor name' },
    { name: 'category_id', label: 'Category', type: 'select', options: categories?.map(c => ({ value: c.id, label: c.name })) || [] },
    { name: 'amount', label: 'Amount', type: 'number', required: true, placeholder: '0.00' },
    { name: 'currency', label: 'Currency', type: 'select', options: [
      { value: 'USD', label: 'USD' },
      { value: 'EUR', label: 'EUR' },
      { value: 'GBP', label: 'GBP' },
      { value: 'CAD', label: 'CAD' },
    ]},
    { name: 'expense_date', label: 'Expense Date', type: 'date', required: true },
    { name: 'receipt_url', label: 'Receipt URL', type: 'text', placeholder: 'https://...' },
    { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2, placeholder: 'Additional notes...' },
  ];

  const filters: ListPageFilter[] = [
    { 
      key: 'status', 
      label: 'Status', 
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'submitted', label: 'Submitted' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'paid', label: 'Paid' },
        { value: 'reimbursed', label: 'Reimbursed' },
      ]
    },
    { 
      key: 'category_id', 
      label: 'Category', 
      options: categories?.map(c => ({ value: c.id, label: c.name })) || []
    },
  ];

  const rowActions: ListPageAction<Expense>[] = [
    { 
      id: 'view', 
      label: 'View Details', 
      icon: <Eye className="size-4" />, 
      onClick: (row) => router.push(`/expenses/${row.id}`) 
    },
    { 
      id: 'edit', 
      label: 'Edit', 
      icon: <Pencil className="size-4" />, 
      onClick: (row) => { setSelectedExpense(row); setDrawerOpen(true); }
    },
    { 
      id: 'approve', 
      label: 'Approve', 
      icon: <CheckCircle className="size-4" />, 
      onClick: (row) => { setExpenseToAction(row); setApproveDialogOpen(true); }
    },
    { 
      id: 'reject', 
      label: 'Reject', 
      icon: <XCircle className="size-4" />, 
      variant: 'danger',
      onClick: (row) => { setExpenseToAction(row); setRejectDialogOpen(true); }
    },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setCreateModalOpen(false);
    refetch();
  };

  const handleApprove = async () => {
    if (expenseToAction) {
      await approveMutation.mutateAsync({ id: expenseToAction.id, approverId: user?.id || '' });
      setApproveDialogOpen(false);
      setExpenseToAction(null);
      refetch();
    }
  };

  const handleReject = async () => {
    if (expenseToAction) {
      await rejectMutation.mutateAsync({ id: expenseToAction.id });
      setRejectDialogOpen(false);
      setExpenseToAction(null);
      refetch();
    }
  };

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Omit<Expense, 'id' | 'category' | 'submitter'>>({
    entityType: 'expenses',
    requiredFields: ['description', 'amount', 'expense_date'],
    onImport: async (records) => {
      for (const record of records) {
        await fetch('/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ organization_id: 'default-org', status: 'draft', ...record }),
        });
      }
      refetch();
    },
  });

  // Import templates for field mapping
  const importTemplates = getImportTemplates('expenses');

  const pageStats = [
    { label: 'Total Expenses', value: stats?.total || 0 },
    { label: 'Total Amount', value: `$${(stats?.totalAmount || 0).toLocaleString()}` },
    { label: 'Pending Approval', value: stats?.pending || 0 },
    { label: 'Paid', value: `$${(stats?.paidAmount || 0).toLocaleString()}` },
  ];

  const detailSections: DetailSection[] = selectedExpense ? [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <Grid cols={2} gap={4}>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Vendor</Body>
            <Body>{selectedExpense.vendor_name || '—'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Category</Body>
            <Body>{selectedExpense.category?.name || '—'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Amount</Body>
            <Body>${selectedExpense.amount?.toLocaleString()}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Status</Body>
            <Badge variant={statusColors[selectedExpense.status] || 'solid'}>
              {selectedExpense.status.toUpperCase()}
            </Badge>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'submitter',
      title: 'Submitted By',
      content: (
        <Body>{selectedExpense.submitter ? `${selectedExpense.submitter.first_name} ${selectedExpense.submitter.last_name}` : '—'}</Body>
      ),
    },
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<Expense>
        title="Expenses"
        subtitle="Manage expense submissions and approvals"
        data={expenses || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search expenses..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => router.push(`/expenses/${row.id}`)}
        createLabel="New Expense"
        onCreate={() => setCreateModalOpen(true)}
        entityType="expenses"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['description', 'vendor_name', 'amount', 'currency', 'expense_date', 'category_id', 'notes']}
        onExport={createExportHandler({
          filename: 'expenses',
          getData: () => expenses.map(e => ({
            id: e.id,
            description: e.description,
            vendor: e.vendor_name || '',
            amount: e.amount,
            currency: e.currency,
            date: e.expense_date,
            category: e.category?.name || '',
            status: e.status,
          })),
        })}
        stats={pageStats}
        emptyMessage="No expenses yet"
        emptyAction={{ label: 'Submit First Expense', onClick: () => setCreateModalOpen(true) }}
        onBulkAction={async (action, ids) => {
          if (action === 'approve') {
            for (const id of ids) {
              await approveExpense.mutateAsync(id);
            }
            refetch();
          } else if (action === 'reject') {
            for (const id of ids) {
              await rejectExpense.mutateAsync(id);
            }
            refetch();
          } else if (action === 'delete') {
            await fetch('/api/expenses/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch();
          }
        }}
        bulkActions={[
          { id: 'approve', label: 'Approve Selected', variant: 'default' },
          { id: 'reject', label: 'Reject Selected', variant: 'danger' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Submit Expense"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
        record={{ status: 'draft', currency: 'USD', expense_date: new Date().toISOString().split('T')[0] }}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedExpense}
        title={(e) => e.description}
        subtitle={(e) => `$${e.amount?.toLocaleString()}`}
        sections={detailSections}
        onEdit={(e) => router.push(`/expenses/${e.id}`)}
      />

      <ConfirmDialog
        open={approveDialogOpen}
        title="Approve Expense"
        message={`Approve expense "${expenseToAction?.description}" for $${expenseToAction?.amount?.toLocaleString()}?`}
        variant="info"
        confirmLabel="Approve"
        onConfirm={handleApprove}
        onCancel={() => { setApproveDialogOpen(false); setExpenseToAction(null); }}
      />

      <ConfirmDialog
        open={rejectDialogOpen}
        title="Reject Expense"
        message={`Reject expense "${expenseToAction?.description}"?`}
        variant="danger"
        confirmLabel="Reject"
        onConfirm={handleReject}
        onCancel={() => { setRejectDialogOpen(false); setExpenseToAction(null); }}
      />
    </AtlvsAppLayout>
  );
}
