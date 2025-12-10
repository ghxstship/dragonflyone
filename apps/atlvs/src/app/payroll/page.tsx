"use client";

import { useState } from "react";
import { Eye, Pencil, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { AtlvsAppLayout } from "../../components/app-layout";
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  useNotifications,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";
import { createImportHandler, getImportTemplates } from '@ghxstship/config';
import { usePayrollData, type PayrollEntry } from "@/hooks/usePayroll";

const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

const columns: ListPageColumn<PayrollEntry>[] = [
  { key: 'employee_name', label: 'Employee', accessor: 'employee_name', sortable: true },
  { key: 'department', label: 'Department', accessor: 'department', sortable: true },
  { key: 'regular_hours', label: 'Regular Hours', accessor: (r) => String(r.regular_hours), sortable: true },
  { key: 'overtime_hours', label: 'OT Hours', accessor: (r) => String(r.overtime_hours), sortable: true },
  { key: 'gross_pay', label: 'Gross Pay', accessor: (r) => formatCurrency(r.gross_pay), sortable: true },
  { key: 'deductions', label: 'Deductions', accessor: (r) => formatCurrency(r.deductions) },
  { key: 'net_pay', label: 'Net Pay', accessor: (r) => formatCurrency(r.net_pay), sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => {
    const variant = v === 'paid' ? 'solid' : v === 'pending' ? 'outline' : 'ghost';
    return <Badge variant={variant}>{String(v)}</Badge>;
  }},
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'pending', label: 'Pending' }, { value: 'processing', label: 'Processing' }, { value: 'paid', label: 'Paid' }] },
  { key: 'department', label: 'Department', options: [{ value: 'production', label: 'Production' }, { value: 'admin', label: 'Admin' }, { value: 'tech', label: 'Tech' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'employee_id', label: 'Employee', type: 'select', required: true, options: [] },
  { name: 'regular_hours', label: 'Regular Hours', type: 'number', required: true },
  { name: 'overtime_hours', label: 'Overtime Hours', type: 'number' },
  { name: 'pay_period_start', label: 'Period Start', type: 'date', required: true },
  { name: 'pay_period_end', label: 'Period End', type: 'date', required: true },
];

export default function PayrollPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const {
    entries,
    summary,
    isLoading: loading,
    error,
    createEntry,
    processPayroll,
    refetch,
  } = usePayrollData();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<PayrollEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleProcessPayroll = async () => {
    try {
      await processPayroll('current');
      addNotification({ type: 'success', title: 'Success', message: 'Payroll processed' });
    } catch {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to process' });
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch('/api/payroll/export?period=current');
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'payroll-export.csv';
        a.click();
        addNotification({ type: 'success', title: 'Success', message: 'Payroll exported' });
      }
    } catch { addNotification({ type: 'error', title: 'Error', message: 'Failed to export' }); }
  };

  const rowActions: ListPageAction<PayrollEntry>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedEntry(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/payroll/${r.id}/edit`) },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createEntry(data);
      addNotification({ type: 'success', title: 'Success', message: 'Payroll entry created' });
      setCreateModalOpen(false);
    } catch {
      addNotification({ type: 'error', title: 'Error', message: 'Failed to create entry' });
    }
  };

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Omit<PayrollEntry, 'id'>>({ 
    entityType: 'payroll',
    requiredFields: ['employee_id', 'regular_hours', 'pay_period_start', 'pay_period_end'],
    onImport: async (records) => {
      for (const record of records) {
        await createEntry({ organization_id: 'default-org', status: 'pending', ...record });
      }
      refetch();
    },
  });

  // Import templates for field mapping
  const importTemplates = getImportTemplates('payroll');

  const stats = [
    { label: 'Employees', value: summary?.total_employees || entries.length },
    { label: 'Gross Pay', value: formatCurrency(summary?.total_gross || 0) },
    { label: 'Deductions', value: formatCurrency(summary?.total_deductions || 0) },
    { label: 'Net Pay', value: formatCurrency(summary?.total_net || 0) },
  ];

  const detailSections: DetailSection[] = selectedEntry ? [
    { id: 'overview', title: 'Payroll Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Employee:</strong> {selectedEntry.employee_name}</Body>
        <Body size="sm"><strong>Department:</strong> {selectedEntry.department}</Body>
        <Body size="sm"><strong>Period:</strong> {selectedEntry.pay_period_start} - {selectedEntry.pay_period_end}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedEntry.status}</Body>
        <Body size="sm"><strong>Regular Hours:</strong> {selectedEntry.regular_hours}</Body>
        <Body size="sm"><strong>OT Hours:</strong> {selectedEntry.overtime_hours}</Body>
        <Body size="sm"><strong>Gross Pay:</strong> {formatCurrency(selectedEntry.gross_pay)}</Body>
        <Body size="sm"><strong>Deductions:</strong> {formatCurrency(selectedEntry.deductions)}</Body>
        <Body size="sm"><strong>Net Pay:</strong> {formatCurrency(selectedEntry.net_pay)}</Body>
      </Grid>
    )},
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<PayrollEntry>
        title="Payroll Management"
        subtitle="Process payroll, track hours, and manage employee compensation"
        data={entries}
        columns={columns}
        rowKey="id"
        loading={loading}
        error={error}
        onRetry={() => refetch()}
        searchPlaceholder="Search employees..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedEntry(r); setDrawerOpen(true); }}
        createLabel="Add Entry"
        onCreate={() => setCreateModalOpen(true)}
        entityType="payroll"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['employee_id', 'employee_name', 'department', 'regular_hours', 'overtime_hours', 'pay_period_start', 'pay_period_end']}
        onExport={handleExport}
        stats={stats}
        emptyMessage="No payroll entries found"
        emptyAction={{ label: 'Add Entry', onClick: () => setCreateModalOpen(true) }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/payroll/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            await refetch();
          } else if (action === 'approve') {
            await fetch('/api/payroll/bulk-approve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            await refetch();
          }
        }}
        bulkActions={[
          { id: 'approve', label: 'Approve Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />
      <RecordFormModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} mode="create" title="Add Payroll Entry" fields={formFields} onSubmit={handleCreate} size="lg" />
      <DetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} record={selectedEntry} title={(e) => e.employee_name} subtitle={(e) => e.department} sections={detailSections} actions={[{ id: 'process', label: 'Process', icon: <Check className="size-4" /> }]} onAction={(id) => id === 'process' && handleProcessPayroll()} />
    </AtlvsAppLayout>
  );
}
