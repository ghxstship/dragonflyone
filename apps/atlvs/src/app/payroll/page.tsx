"use client";

import { useState, useEffect, useCallback } from "react";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  useNotifications,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";

interface PayrollEntry {
  id: string;
  employee_id: string;
  employee_name: string;
  department: string;
  pay_period_start: string;
  pay_period_end: string;
  regular_hours: number;
  overtime_hours: number;
  gross_pay: number;
  deductions: number;
  net_pay: number;
  status: string;
  payment_date?: string;
}

interface PayrollSummary {
  total_employees: number;
  total_gross: number;
  total_deductions: number;
  total_net: number;
  pending_count: number;
  processed_count: number;
}

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
  const { addNotification } = useNotifications();
  const [entries, setEntries] = useState<PayrollEntry[]>([]);
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<PayrollEntry | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchPayroll = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payroll');
      if (!response.ok) throw new Error('Failed to fetch payroll data');
      const data = await response.json();
      setEntries(data.entries || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayroll(); }, [fetchPayroll]);

  const handleProcessPayroll = async () => {
    try {
      const res = await fetch('/api/payroll/process', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ period: 'current' }) });
      if (res.ok) { addNotification({ type: 'success', title: 'Success', message: 'Payroll processed' }); fetchPayroll(); }
      else addNotification({ type: 'error', title: 'Error', message: 'Failed to process' });
    } catch { addNotification({ type: 'error', title: 'Error', message: 'Failed to process' }); }
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
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedEntry(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (r) => console.log('Edit:', r.id) },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    console.log('Create entry:', data);
    setCreateModalOpen(false);
    fetchPayroll();
  };

  const stats = [
    { label: 'Employees', value: summary?.total_employees || entries.length },
    { label: 'Gross Pay', value: formatCurrency(summary?.total_gross || 0) },
    { label: 'Deductions', value: formatCurrency(summary?.total_deductions || 0) },
    { label: 'Net Pay', value: formatCurrency(summary?.total_net || 0) },
  ];

  const detailSections: DetailSection[] = selectedEntry ? [
    { id: 'overview', title: 'Payroll Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Employee:</strong> {selectedEntry.employee_name}</div>
        <div><strong>Department:</strong> {selectedEntry.department}</div>
        <div><strong>Period:</strong> {selectedEntry.pay_period_start} - {selectedEntry.pay_period_end}</div>
        <div><strong>Status:</strong> {selectedEntry.status}</div>
        <div><strong>Regular Hours:</strong> {selectedEntry.regular_hours}</div>
        <div><strong>OT Hours:</strong> {selectedEntry.overtime_hours}</div>
        <div><strong>Gross Pay:</strong> {formatCurrency(selectedEntry.gross_pay)}</div>
        <div><strong>Deductions:</strong> {formatCurrency(selectedEntry.deductions)}</div>
        <div><strong>Net Pay:</strong> {formatCurrency(selectedEntry.net_pay)}</div>
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<PayrollEntry>
        title="Payroll Management"
        subtitle="Process payroll, track hours, and manage employee compensation"
        data={entries}
        columns={columns}
        rowKey="id"
        loading={loading}
        onRetry={fetchPayroll}
        searchPlaceholder="Search employees..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedEntry(r); setDrawerOpen(true); }}
        createLabel="Add Entry"
        onCreate={() => setCreateModalOpen(true)}
        onExport={handleExport}
        stats={stats}
        emptyMessage="No payroll entries found"
        emptyAction={{ label: 'Add Entry', onClick: () => setCreateModalOpen(true) }}
        header={<CreatorNavigationAuthenticated />}
      />
      <RecordFormModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} mode="create" title="Add Payroll Entry" fields={formFields} onSubmit={handleCreate} size="lg" />
      <DetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} record={selectedEntry} title={(e) => e.employee_name} subtitle={(e) => e.department} sections={detailSections} actions={[{ id: 'process', label: 'Process', icon: '✅' }]} onAction={(id) => id === 'process' && handleProcessPayroll()} />
    </>
  );
}
