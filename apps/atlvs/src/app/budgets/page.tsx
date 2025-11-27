'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../components/navigation';
import {
  ListPage, Badge, DetailDrawer, RecordFormModal,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection, type FormFieldConfig,
} from '@ghxstship/ui';
import { getBadgeVariant } from '@ghxstship/config';
import { useBudgets } from '@/hooks/useBudgets';

interface Budget {
  id: string;
  name: string;
  category: string;
  budgeted: number;
  actual: number;
  variance: number;
  status: 'on-track' | 'over' | 'under';
  period?: string;
  [key: string]: unknown;
}

const mockBudgets: Budget[] = [
  { id: '1', name: 'Ultra Music Festival 2025', category: 'Events', budgeted: 2500000, actual: 2350000, variance: 150000, status: 'on-track' },
  { id: '2', name: 'Operations & Overhead', category: 'Operations', budgeted: 450000, actual: 475000, variance: -25000, status: 'over' },
  { id: '3', name: 'Marketing & Sales', category: 'Marketing', budgeted: 320000, actual: 298000, variance: 22000, status: 'on-track' },
  { id: '4', name: 'Technology & Infrastructure', category: 'Technology', budgeted: 180000, actual: 195000, variance: -15000, status: 'over' },
];

const formatCurrency = (amount: number) => {
  if (Math.abs(amount) >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
};

const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<Budget>[] = [
  { key: 'name', label: 'Budget', accessor: 'name', sortable: true },
  { key: 'category', label: 'Category', accessor: 'category', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'budgeted', label: 'Budgeted', accessor: (r) => formatCurrency(r.budgeted), sortable: true },
  { key: 'actual', label: 'Actual', accessor: (r) => formatCurrency(r.actual), sortable: true },
  { key: 'variance', label: 'Variance', accessor: (r) => `${r.variance >= 0 ? '+' : ''}${formatCurrency(r.variance)}`, sortable: true },
  { key: 'utilization', label: 'Utilization', accessor: (r) => `${((r.actual / r.budgeted) * 100).toFixed(0)}%` },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v).replace('-', ' ').toUpperCase()}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'on-track', label: 'On Track' }, { value: 'over', label: 'Over Budget' }, { value: 'under', label: 'Under Budget' }] },
  { key: 'category', label: 'Category', options: [{ value: 'Events', label: 'Events' }, { value: 'Operations', label: 'Operations' }, { value: 'Marketing', label: 'Marketing' }, { value: 'Technology', label: 'Technology' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Budget Name', type: 'text', required: true },
  { name: 'category', label: 'Category', type: 'select', required: true, options: [{ value: 'Events', label: 'Events' }, { value: 'Operations', label: 'Operations' }, { value: 'Marketing', label: 'Marketing' }, { value: 'Technology', label: 'Technology' }] },
  { name: 'budgeted', label: 'Budgeted Amount', type: 'number', required: true },
  { name: 'period', label: 'Period', type: 'select', options: [{ value: '2024-q4', label: 'Q4 2024' }, { value: '2024-q3', label: 'Q3 2024' }, { value: '2024-annual', label: 'Annual 2024' }] },
];

export default function BudgetsPage() {
  const router = useRouter();
  const { data: budgetsData, isLoading } = useBudgets({ period: '2024-q4' });
  const budgets = (budgetsData || mockBudgets) as Budget[];
  
  const [selected, setSelected] = useState<Budget | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.budgeted, 0);
  const totalActual = budgets.reduce((sum, b) => sum + (b.actual || 0), 0);
  const totalVariance = totalBudgeted - totalActual;
  const overBudgetCount = budgets.filter(b => b.status === 'over').length;

  const rowActions: ListPageAction<Budget>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Adjust Budget', icon: '✏️', onClick: (r) => router.push(`/budgets/${r.id}/edit`) },
  ];

  const stats = [
    { label: 'Total Budgeted', value: formatCurrency(totalBudgeted) },
    { label: 'Total Actual', value: formatCurrency(totalActual) },
    { label: 'Variance', value: formatCurrency(totalVariance) },
    { label: 'Over Budget', value: overBudgetCount },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    console.log('Create budget:', data);
    setCreateModalOpen(false);
  };

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Budget Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Name:</strong> {selected.name}</div>
        <div><strong>Category:</strong> {selected.category}</div>
        <div><strong>Budgeted:</strong> {formatCurrency(selected.budgeted)}</div>
        <div><strong>Actual:</strong> {formatCurrency(selected.actual)}</div>
        <div><strong>Variance:</strong> {selected.variance >= 0 ? '+' : ''}{formatCurrency(selected.variance)}</div>
        <div><strong>Utilization:</strong> {((selected.actual / selected.budgeted) * 100).toFixed(0)}%</div>
        <div><strong>Status:</strong> {selected.status.replace('-', ' ').toUpperCase()}</div>
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<Budget>
        title="Budget Management"
        subtitle="Track and analyze financial performance across all budgets"
        data={budgets}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        searchPlaceholder="Search budgets..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        createLabel="New Budget"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => console.log('Export budgets')}
        stats={stats}
        emptyMessage="No budgets found"
        emptyAction={{ label: 'Create Budget', onClick: () => setCreateModalOpen(true) }}
        header={<CreatorNavigationAuthenticated />}
      />
      <RecordFormModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} mode="create" title="Create Budget" fields={formFields} onSubmit={handleCreate} size="lg" />
      {selected && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selected}
          title={(r) => r.name}
          subtitle={(r) => `${r.category} • ${r.status.replace('-', ' ').toUpperCase()}`}
          sections={detailSections}
          actions={[{ id: 'edit', label: 'Adjust Budget', icon: '✏️' }, { id: 'forecast', label: 'View Forecast', icon: '📊' }]}
          onAction={(id, r) => { if (id === 'edit') router.push(`/budgets/${r.id}/edit`); setDrawerOpen(false); }}
        />
      )}
    </>
  );
}
