'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, FolderOpen, DollarSign } from 'lucide-react';
// Layout provided by route group
import { useExpenseCategories, useCreateExpenseCategory, useUpdateExpenseCategory, type ExpenseCategory } from '../../../../hooks/useExpenses';
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

const columns: ListPageColumn<ExpenseCategory>[] = [
  { 
    key: 'name', 
    label: 'Category', 
    accessor: 'name', 
    sortable: true,
    render: (value) => (
      <Stack direction="horizontal" gap={2} className="items-center">
        <FolderOpen className="size-4 text-grey-400" />
        <Body>{String(value)}</Body>
      </Stack>
    )
  },
  { 
    key: 'description', 
    label: 'Description', 
    accessor: 'description', 
    render: (value) => value || '—'
  },
  { 
    key: 'budget_amount', 
    label: 'Budget', 
    accessor: 'budget_amount', 
    sortable: true,
    render: (value) => value ? `$${Number(value).toLocaleString()}` : '—'
  },
  { 
    key: 'is_active', 
    label: 'Status', 
    accessor: 'is_active', 
    render: (value) => (
      <Badge variant={value ? 'success' : 'ghost'}>
        {value ? 'ACTIVE' : 'INACTIVE'}
      </Badge>
    )
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Category Name', type: 'text', required: true, placeholder: 'e.g., Equipment', colSpan: 2 },
  { name: 'description', label: 'Description', type: 'textarea', colSpan: 2, placeholder: 'Category description...' },
  { name: 'budget_amount', label: 'Budget Amount', type: 'number', placeholder: '0.00' },
  { name: 'is_active', label: 'Active', type: 'checkbox' },
];

export default function ExpenseCategoriesPage() {
  const router = useRouter();
  const { data: categories, isLoading, error, refetch } = useExpenseCategories();
  const createMutation = useCreateExpenseCategory();
  const updateMutation = useUpdateExpenseCategory();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ExpenseCategory | null>(null);

  const filters: ListPageFilter[] = [
    { 
      key: 'is_active', 
      label: 'Status', 
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ]
    },
  ];

  const rowActions: ListPageAction<ExpenseCategory>[] = [
    { 
      id: 'view', 
      label: 'View Details', 
      icon: <Eye className="size-4" />, 
      onClick: (row) => { setSelectedCategory(row); setDrawerOpen(true); }
    },
    { 
      id: 'edit', 
      label: 'Edit', 
      icon: <Pencil className="size-4" />, 
      onClick: (row) => { setSelectedCategory(row); setEditModalOpen(true); }
    },
    { 
      id: 'expenses', 
      label: 'View Expenses', 
      icon: <DollarSign className="size-4" />, 
      onClick: (row) => router.push(`/expenses?category=${row.id}`)
    },
    { 
      id: 'delete', 
      label: 'Delete', 
      icon: <Trash2 className="size-4" />, 
      variant: 'danger',
      onClick: (row) => { setCategoryToDelete(row); setDeleteDialogOpen(true); }
    },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await createMutation.mutateAsync({
      production_id: productionId || params?.productionId || '', 
      name: data.name as string,
      description: data.description as string | undefined,
      budget_amount: data.budget_amount as number | undefined,
      is_active: data.is_active as boolean ?? true,
    });
    setCreateModalOpen(false);
    refetch();
  };

  const handleEdit = async (data: Record<string, unknown>) => {
    if (!selectedCategory) return;
    await updateMutation.mutateAsync({
      id: selectedCategory.id,
      name: data.name as string,
      description: data.description as string | undefined,
      budget_amount: data.budget_amount as number | undefined,
      is_active: data.is_active as boolean,
    });
    setEditModalOpen(false);
    setSelectedCategory(null);
    refetch();
  };

  const handleDelete = async () => {
    if (categoryToDelete) {
      await fetch(`/api/expense-categories/${categoryToDelete.id}`, { method: 'DELETE' });
    }
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
    refetch();
  };

  const totalBudget = categories?.reduce((sum, c) => sum + (c.budget_amount || 0), 0) || 0;
  const pageStats = [
    { label: 'Total Categories', value: categories?.length || 0 },
    { label: 'Active', value: categories?.filter(c => c.is_active).length || 0 },
    { label: 'Total Budget', value: `$${totalBudget.toLocaleString()}` },
  ];

  const detailSections: DetailSection[] = selectedCategory ? [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Name</Body>
            <Body>{selectedCategory.name}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Status</Body>
            <Badge variant={selectedCategory.is_active ? 'success' : 'ghost'}>
              {selectedCategory.is_active ? 'ACTIVE' : 'INACTIVE'}
            </Badge>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Budget</Body>
            <Body>{selectedCategory.budget_amount ? `$${selectedCategory.budget_amount.toLocaleString()}` : 'Not set'}</Body>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'description',
      title: 'Description',
      content: <Body>{selectedCategory.description || 'No description provided.'}</Body>,
    },
  ] : [];

  return (
    <>
      <ListPage<ExpenseCategory>
        title="Expense Categories"
        subtitle="Manage expense categories and budgets"
        data={categories || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search categories..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => { setSelectedCategory(row); setDrawerOpen(true); }}
        createLabel="New Category"
        onCreate={() => setCreateModalOpen(true)}
        stats={pageStats}
        emptyMessage="No expense categories yet"
        emptyAction={{ label: 'Create First Category', onClick: () => setCreateModalOpen(true) }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/expense-categories/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch();
          }
        }}
        bulkActions={[
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create Category"
        fields={formFields}
        onSubmit={handleCreate}
        size="md"
        record={{ is_active: true }}
      />

      <RecordFormModal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setSelectedCategory(null); }}
        mode="edit"
        title="Edit Category"
        fields={formFields}
        onSubmit={handleEdit}
        size="md"
        record={selectedCategory ? {
          name: selectedCategory.name,
          description: selectedCategory.description,
          budget_amount: selectedCategory.budget_amount,
          is_active: selectedCategory.is_active,
        } : {}}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedCategory(null); }}
        record={selectedCategory}
        title={(c) => c.name}
        subtitle={() => 'Expense Category'}
        sections={detailSections}
        onEdit={(c) => { setDrawerOpen(false); setSelectedCategory(c); setEditModalOpen(true); }}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteDialogOpen(false); setCategoryToDelete(null); }}
      />
    </>
  );
}
