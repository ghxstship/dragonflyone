"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  useNotifications,
  Section,
  Container,
  LoadingSpinner,
  EmptyState,
  Stack,
  Grid,
  Card,
  H1,
  H2,
  Body,
  StatCard,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";

interface Expense {
  id: string;
  expense_number: string;
  project_id: string;
  project_name: string;
  crew_member_id: string;
  crew_member_name: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  receipt_url?: string;
  expense_date: string;
  submitted_date: string;
  status: string;
  approved_by?: string;
  approved_date?: string;
  notes?: string;
}

interface ExpenseSummary {
  total_expenses: number;
  pending_count: number;
  approved_count: number;
  rejected_count: number;
  total_amount: number;
  pending_amount: number;
  approved_amount: number;
}

const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const columns: ListPageColumn<Expense>[] = [
  { key: 'expense_number', label: 'Expense #', accessor: 'expense_number', sortable: true },
  { key: 'crew_member_name', label: 'Crew Member', accessor: 'crew_member_name', sortable: true },
  { key: 'project_name', label: 'Project', accessor: 'project_name' },
  { key: 'category', label: 'Category', accessor: 'category', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'amount', label: 'Amount', accessor: (r) => formatCurrency(r.amount), sortable: true },
  { key: 'expense_date', label: 'Date', accessor: (r) => formatDate(r.expense_date), sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={v === 'approved' || v === 'paid' ? 'solid' : v === 'pending' ? 'outline' : 'ghost'}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'pending', label: 'Pending' }, { value: 'approved', label: 'Approved' }, { value: 'rejected', label: 'Rejected' }, { value: 'paid', label: 'Paid' }] },
  { key: 'category', label: 'Category', options: [{ value: 'travel', label: 'Travel' }, { value: 'per-diem', label: 'Per Diem' }, { value: 'equipment', label: 'Equipment' }, { value: 'supplies', label: 'Supplies' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'category', label: 'Category', type: 'select', required: true, options: [{ value: 'travel', label: 'Travel' }, { value: 'per-diem', label: 'Per Diem' }, { value: 'equipment', label: 'Equipment' }, { value: 'supplies', label: 'Supplies' }] },
  { name: 'amount', label: 'Amount', type: 'number', required: true },
  { name: 'expense_date', label: 'Date', type: 'date', required: true },
  { name: 'description', label: 'Description', type: 'textarea', required: true, colSpan: 2 },
];

export default function ExpensesPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/expenses');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setExpenses(data.expenses || []);
      setSummary(data.summary || null);
    } catch { /* mock data fallback */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const rowActions: ListPageAction<Expense>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedExpense(r); setDrawerOpen(true); } },
    { id: 'approve', label: 'Approve', icon: '✅', onClick: async (r) => {
      await fetch(`/api/expenses/${r.id}/approve`, { method: 'POST' });
      addNotification({ type: 'success', title: 'Success', message: 'Expense approved' });
      fetchExpenses();
    }},
    { id: 'reject', label: 'Reject', icon: '❌', variant: 'danger', onClick: async (r) => {
      await fetch(`/api/expenses/${r.id}/reject`, { method: 'POST' });
      addNotification({ type: 'success', title: 'Success', message: 'Expense rejected' });
      fetchExpenses();
    }},
    { id: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', onClick: (r) => { setExpenseToDelete(r); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'approve', label: 'Bulk Approve', icon: '✅' },
    { id: 'export', label: 'Export', icon: '⬇️' },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    console.log('Submit expense:', data);
    setCreateModalOpen(false);
    fetchExpenses();
  };

  const handleDelete = async () => {
    if (expenseToDelete) {
      setExpenses(prev => prev.filter(e => e.id !== expenseToDelete.id));
      setDeleteConfirmOpen(false);
      setExpenseToDelete(null);
    }
  };

  const stats = [
    { label: 'Total Expenses', value: summary?.total_expenses || expenses.length },
    { label: 'Pending Approval', value: summary?.pending_count || 0 },
    { label: 'Pending Amount', value: formatCurrency(summary?.pending_amount || 0) },
    { label: 'Approved Total', value: formatCurrency(summary?.approved_amount || 0) },
  ];

  const detailSections: DetailSection[] = selectedExpense ? [
    { id: 'overview', title: 'Expense Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Expense #:</strong> {selectedExpense.expense_number}</div>
        <div><strong>Status:</strong> {selectedExpense.status}</div>
        <div><strong>Crew Member:</strong> {selectedExpense.crew_member_name}</div>
        <div><strong>Project:</strong> {selectedExpense.project_name}</div>
        <div><strong>Category:</strong> {selectedExpense.category}</div>
        <div><strong>Amount:</strong> {formatCurrency(selectedExpense.amount)}</div>
        <div><strong>Date:</strong> {formatDate(selectedExpense.expense_date)}</div>
        {selectedExpense.approved_by && <div><strong>Approved By:</strong> {selectedExpense.approved_by}</div>}
        {selectedExpense.description && <div className="col-span-2"><strong>Description:</strong> {selectedExpense.description}</div>}
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<Expense>
        title="Production Expenses"
        subtitle="Track and approve crew expenses, per diems, and production costs"
        data={expenses}
        columns={columns}
        rowKey="id"
        loading={loading}
        onRetry={fetchExpenses}
        searchPlaceholder="Search expenses..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={(id, ids) => console.log('Bulk:', id, ids)}
        onRowClick={(r) => { setSelectedExpense(r); setDrawerOpen(true); }}
        createLabel="Submit Expense"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => router.push('/expenses/export')}
        stats={stats}
        emptyMessage="No expenses found"
        emptyAction={{ label: 'Submit Expense', onClick: () => setCreateModalOpen(true) }}
        header={<Navigation />}
      />
      <RecordFormModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} mode="create" title="Submit Expense" fields={formFields} onSubmit={handleCreate} size="lg" />
      <DetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} record={selectedExpense} title={(e) => e.expense_number} subtitle={(e) => e.crew_member_name} sections={detailSections} onEdit={(e) => router.push(`/expenses/${e.id}/edit`)} onDelete={(e) => { setExpenseToDelete(e); setDeleteConfirmOpen(true); setDrawerOpen(false); }} />
      <ConfirmDialog open={deleteConfirmOpen} title="Delete Expense" message={`Delete expense "${expenseToDelete?.expense_number}"?`} variant="danger" confirmLabel="Delete" onConfirm={handleDelete} onCancel={() => { setDeleteConfirmOpen(false); setExpenseToDelete(null); }} />
    </>
  );
}
