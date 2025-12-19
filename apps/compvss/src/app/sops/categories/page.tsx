'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { CompvssAppLayout } from '../../../components/app-layout';
import { useSOPCategories, useCreateSOPCategory } from '../../../hooks/useSOPs';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Stack,
  Body,
  Box,
  type ListPageColumn,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';

interface SOPCategory {
  id: string;
  production_id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sort_order: number;
  is_active: boolean;
}

const columns: ListPageColumn<SOPCategory>[] = [
  { 
    key: 'name', 
    label: 'Category', 
    accessor: 'name', 
    sortable: true,
    render: (value, row) => (
      <Stack direction="horizontal" gap={2} className="items-center">
        <Box 
          className="flex size-8 items-center justify-center rounded-card"
          style={{ backgroundColor: row.color || '#6b7280' }}
        >
          <FolderOpen className="size-4 text-white" />
        </Box>
        <Body className="font-weight-semibold">{String(value)}</Body>
      </Stack>
    )
  },
  { key: 'description', label: 'Description', accessor: 'description', render: (v: unknown) => (v as string) || '—' },
  { 
    key: 'sort_order', 
    label: 'Order', 
    accessor: 'sort_order', 
    sortable: true,
    width: '80px'
  },
  { 
    key: 'is_active', 
    label: 'Status', 
    accessor: 'is_active', 
    render: (value) => (
      <Badge variant={value ? 'success' : 'solid'}>
        {value ? 'ACTIVE' : 'INACTIVE'}
      </Badge>
    )
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Category Name', type: 'text', required: true, placeholder: 'e.g., Emergency Procedures', colSpan: 2 },
  { name: 'description', label: 'Description', type: 'textarea', colSpan: 2, placeholder: 'Describe this category...' },
  { name: 'color', label: 'Color', type: 'text', placeholder: '#eab308' },
  { name: 'sort_order', label: 'Sort Order', type: 'number', placeholder: '1' },
  { name: 'is_active', label: 'Active', type: 'checkbox' },
];

export default function SOPCategoriesPage() {
  const router = useRouter();
  const { data: categories, isLoading, error, refetch } = useSOPCategories();
  const createMutation = useCreateSOPCategory();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SOPCategory | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<SOPCategory | null>(null);

  const rowActions: ListPageAction<SOPCategory>[] = [
    { 
      id: 'view', 
      label: 'View SOPs', 
      icon: <Eye className="size-4" />, 
      onClick: (row) => router.push(`/sops?category=${row.id}`) 
    },
    { 
      id: 'edit', 
      label: 'Edit', 
      icon: <Pencil className="size-4" />, 
      onClick: (row) => { setSelectedCategory(row); setDrawerOpen(true); } 
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
      name: data.name as string,
      description: data.description as string | undefined,
      icon: data.icon as string | undefined,
      color: data.color as string | undefined,
      sort_order: data.sort_order as number,
      is_active: data.is_active as boolean,
      production_id: productionId || params?.productionId || '', 
    });
    setCreateModalOpen(false);
    refetch();
  };

  const handleDelete = async () => {
    if (categoryToDelete) {
      await fetch(`/api/sops/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
      });
    }
    setDeleteDialogOpen(false);
    setCategoryToDelete(null);
    refetch();
  };

  const stats = [
    { label: 'Total Categories', value: categories?.length || 0 },
    { label: 'Active', value: categories?.filter(c => c.is_active).length || 0 },
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
            <Body size="sm" className=" text-grey-500">Sort Order</Body>
            <Body>{selectedCategory.sort_order}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Status</Body>
            <Badge variant={selectedCategory.is_active ? 'success' : 'solid'}>
              {selectedCategory.is_active ? 'ACTIVE' : 'INACTIVE'}
            </Badge>
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
    <CompvssAppLayout>
      <ListPage<SOPCategory>
        title="SOP Categories"
        subtitle="Organize SOPs into categories for easier navigation"
        data={categories || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search categories..."
        rowActions={rowActions}
        onRowClick={(row) => router.push(`/sops?category=${row.id}`)}
        createLabel="New Category"
        onCreate={() => setCreateModalOpen(true)}
        stats={stats}
        emptyMessage="No categories created yet"
        emptyAction={{ label: 'Create First Category', onClick: () => setCreateModalOpen(true) }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/sops/categories/bulk', {
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
        record={{ is_active: true, sort_order: (categories?.length || 0) + 1, color: '#eab308' }}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedCategory}
        title={(c) => c.name}
        subtitle={() => 'SOP Category'}
        sections={detailSections}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? SOPs in this category will become uncategorized.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteDialogOpen(false); setCategoryToDelete(null); }}
      />
    </CompvssAppLayout>
  );
}
