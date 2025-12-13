'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, Building2 } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import { useDepartments, useCreateDepartment, useDeleteDepartment } from '../../hooks/useDepartments';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';

interface Department {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  created_at: string;
}

const columns: ListPageColumn<Department>[] = [
  {
    key: 'code',
    label: 'Code',
    accessor: 'code',
    sortable: true,
  },
  {
    key: 'name',
    label: 'Department Name',
    accessor: 'name',
    sortable: true,
  },
  {
    key: 'created_at',
    label: 'Created',
    accessor: 'created_at',
    render: (value) => value ? new Date(String(value)).toLocaleDateString() : '—',
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'code', label: 'Department Code', type: 'text', required: true },
  { name: 'name', label: 'Department Name', type: 'text', required: true },
];

export default function DepartmentsPage() {
  const router = useRouter();
  const { data: departments, isLoading, error, refetch } = useDepartments();
  const createMutation = useCreateDepartment();
  const deleteMutation = useDeleteDepartment();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);

  const rowActions: ListPageAction<Department>[] = [
    {
      id: 'view',
      label: 'View Details',
      icon: <Eye className="size-4" />,
      onClick: (row) => {
        setSelectedDepartment(row);
        setDrawerOpen(true);
      },
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Pencil className="size-4" />,
      onClick: (row) => router.push(`/departments/${row.id}/edit`),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="size-4" />,
      variant: 'danger',
      onClick: (row) => {
        setDepartmentToDelete(row);
        setDeleteConfirmOpen(true);
      },
    },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await createMutation.mutateAsync({
      organization_id: 'default-org',
      code: String(data.code),
      name: String(data.name),
    });
    setCreateModalOpen(false);
  };

  const handleDelete = async () => {
    if (departmentToDelete) {
      await deleteMutation.mutateAsync(departmentToDelete.id);
      setDeleteConfirmOpen(false);
      setDepartmentToDelete(null);
    }
  };

  const pageStats = [
    { label: 'Total Departments', value: departments?.length || 0 },
  ];

  const detailSections: DetailSection[] = selectedDepartment ? [
    {
      id: 'overview',
      title: 'Department Details',
      content: (
        <Grid cols={2} gap={4}>
          <Body size="sm"><strong>Code:</strong> {selectedDepartment.code}</Body>
          <Body size="sm"><strong>Name:</strong> {selectedDepartment.name}</Body>
          <Body size="sm"><strong>Created:</strong> {new Date(selectedDepartment.created_at).toLocaleDateString()}</Body>
        </Grid>
      ),
    },
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<Department>
        title="Departments"
        subtitle="Manage organizational departments"
        data={departments || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search departments..."
        rowActions={rowActions}
        onRowClick={(row) => {
          setSelectedDepartment(row);
          setDrawerOpen(true);
        }}
        createLabel="Add Department"
        onCreate={() => setCreateModalOpen(true)}
        stats={pageStats}
        emptyMessage="No departments found"
        emptyAction={{ label: 'Add Department', onClick: () => setCreateModalOpen(true) }}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Department"
        fields={formFields}
        onSubmit={handleCreate}
        submitLabel="Create"
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedDepartment?.name || 'Department Details'}
        sections={detailSections}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Department"
        message="Are you sure you want to delete this department? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="danger"
      />
    </AtlvsAppLayout>
  );
}
