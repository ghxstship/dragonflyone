'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { useBudgetCategories, useCreateBudgetCategory, useDeleteBudgetCategory, type BudgetCategory as APIBudgetCategory } from '../../../hooks/useBudgetCategories';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Body,
  useNotifications,
  type ListPageColumn,
  type ListPageAction,
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';
import { createExportHandler } from '@ghxstship/config';

interface BudgetCategory {
  id: string;
  name: string;
  description: string;
  parent_category?: string;
  budget_count: number;
  total_budgeted: number;
  total_actual: number;
  status: string;
}

const DEMO_CATEGORIES: BudgetCategory[] = [
  { id: '1', name: 'Events', description: 'Event production budgets', budget_count: 12, total_budgeted: 500000, total_actual: 425000, status: 'active' },
  { id: '2', name: 'Operations', description: 'Operational expenses', budget_count: 8, total_budgeted: 250000, total_actual: 230000, status: 'active' },
  { id: '3', name: 'Marketing', description: 'Marketing and promotion', budget_count: 6, total_budgeted: 150000, total_actual: 145000, status: 'active' },
  { id: '4', name: 'Technology', description: 'Tech infrastructure', budget_count: 4, total_budgeted: 100000, total_actual: 85000, status: 'active' },
  { id: '5', name: 'Talent', description: 'Artist and performer fees', budget_count: 10, total_budgeted: 350000, total_actual: 340000, status: 'active' },
  { id: '6', name: 'Venue', description: 'Venue rental and setup', budget_count: 5, total_budgeted: 200000, total_actual: 195000, status: 'active' },
];

function normalizeCategory(c: APIBudgetCategory): BudgetCategory {
  return {
    id: c.id,
    name: c.name,
    description: c.description || '',
    budget_count: c.budget_count || 0,
    total_budgeted: c.total_budgeted || 0,
    total_actual: c.total_actual || 0,
    status: c.status || 'active',
  };
}

const formatCurrency = (amount: number) => {
  if (Math.abs(amount) >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (Math.abs(amount) >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
};

const columns: ListPageColumn<BudgetCategory>[] = [
  { key: 'name', label: 'Category', accessor: 'name', sortable: true },
  { key: 'description', label: 'Description', accessor: 'description' },
  { key: 'budget_count', label: 'Budgets', accessor: 'budget_count', sortable: true },
  { key: 'total_budgeted', label: 'Total Budgeted', accessor: (r) => formatCurrency(r.total_budgeted), sortable: true },
  { key: 'total_actual', label: 'Total Actual', accessor: (r) => formatCurrency(r.total_actual), sortable: true },
  { key: 'utilization', label: 'Utilization', accessor: (r) => `${((r.total_actual / r.total_budgeted) * 100).toFixed(0)}%` },
  { key: 'status', label: 'Status', accessor: 'status', render: (v) => <Badge variant={v === 'active' ? 'success' : 'solid'}>{String(v).toUpperCase()}</Badge> },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Category Name', type: 'text', required: true },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'parent_category', label: 'Parent Category', type: 'select', options: [
    { value: '', label: 'None (Top Level)' },
    { value: 'Events', label: 'Events' },
    { value: 'Operations', label: 'Operations' },
  ]},
];

export default function BudgetCategoriesPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const { data: apiCategories, isLoading, error, refetch } = useBudgetCategories();
  const createMutation = useCreateBudgetCategory();
  const deleteMutation = useDeleteBudgetCategory();
  
  // Use API data if available, fallback to demo data
  const categories: BudgetCategory[] = apiCategories && apiCategories.length > 0 
    ? apiCategories.map(normalizeCategory) 
    : DEMO_CATEGORIES;
  
  const [selected, setSelected] = useState<BudgetCategory | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<BudgetCategory | null>(null);

  const totalBudgeted = categories.reduce((sum, c) => sum + c.total_budgeted, 0);
  const totalActual = categories.reduce((sum, c) => sum + c.total_actual, 0);
  const totalBudgets = categories.reduce((sum, c) => sum + c.budget_count, 0);

  const rowActions: ListPageAction<BudgetCategory>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/budgets/categories/${r.id}/edit`) },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (r) => { setCategoryToDelete(r); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'delete', label: 'Delete Selected', icon: <Trash2 className="size-4" />, variant: 'danger' },
  ];

  const stats = [
    { label: 'Total Categories', value: categories.length },
    { label: 'Total Budgets', value: totalBudgets },
    { label: 'Total Budgeted', value: formatCurrency(totalBudgeted) },
    { label: 'Total Actual', value: formatCurrency(totalActual) },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createMutation.mutateAsync({
        organization_id: String(data.organization_id || ''),
        code: String(data.code || data.name || '').toUpperCase().replace(/\s+/g, '_'),
        name: String(data.name || ''),
        description: String(data.description || ''),
      });
      setCreateModalOpen(false);
      addNotification({ type: 'success', title: 'Category Created', message: `Category "${data.name}" has been created.` });
    } catch (err) {
      addNotification({ type: 'error', title: 'Failed to Create Category', message: err instanceof Error ? err.message : 'An unexpected error occurred' });
    }
  };

  const handleDelete = async () => {
    if (categoryToDelete) {
      try {
        await deleteMutation.mutateAsync(categoryToDelete.id);
        setDeleteConfirmOpen(false);
        addNotification({ type: 'success', title: 'Category Deleted', message: `Category "${categoryToDelete.name}" has been deleted.` });
        setCategoryToDelete(null);
      } catch (err) {
        addNotification({ type: 'error', title: 'Failed to Delete Category', message: err instanceof Error ? err.message : 'An unexpected error occurred' });
      }
    }
  };

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    if (actionId === 'delete') {
      for (const id of selectedIds) {
        await deleteMutation.mutateAsync(id);
      }
      refetch();
    }
  };

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Category Details', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Name:</strong> {selected.name}</Body>
        <Body size="sm"><strong>Description:</strong> {selected.description}</Body>
        <Body size="sm"><strong>Budgets:</strong> {selected.budget_count}</Body>
        <Body size="sm"><strong>Total Budgeted:</strong> {formatCurrency(selected.total_budgeted)}</Body>
        <Body size="sm"><strong>Total Actual:</strong> {formatCurrency(selected.total_actual)}</Body>
        <Body size="sm"><strong>Utilization:</strong> {((selected.total_actual / selected.total_budgeted) * 100).toFixed(0)}%</Body>
        <Body size="sm"><strong>Status:</strong> {selected.status.toUpperCase()}</Body>
      </Grid>
    )},
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<BudgetCategory>
        title="Budget Categories"
        subtitle="Organize and manage budget categories"
        data={categories}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search categories..."
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        createLabel="New Category"
        onCreate={() => setCreateModalOpen(true)}
        onExport={createExportHandler({
          filename: "budget-categories",
          getData: () => categories.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description,
            budget_count: c.budget_count,
            total_budgeted: c.total_budgeted,
            total_actual: c.total_actual,
            status: c.status,
          })),
        })}
        exportFormats={["csv", "json"]}
        stats={stats}
        emptyMessage="No categories found"
        emptyAction={{ label: 'Create Category', onClick: () => setCreateModalOpen(true) }}
        showFavorite
        showSettings
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create Budget Category"
        fields={formFields}
        onSubmit={handleCreate}
        size="md"
      />

      {selected && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selected}
          title={(r) => r.name}
          subtitle={(r) => r.description}
          sections={detailSections}
          onEdit={(r) => router.push(`/budgets/categories/${r.id}/edit`)}
          onDelete={(r) => { setCategoryToDelete(r); setDeleteConfirmOpen(true); setDrawerOpen(false); }}
        />
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? This may affect associated budgets.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setCategoryToDelete(null); }}
      />
    </AtlvsAppLayout>
  );
}
