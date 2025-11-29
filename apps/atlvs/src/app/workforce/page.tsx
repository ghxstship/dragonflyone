'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, ClipboardList, Calendar, Trash2, Download, RefreshCw } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';
import { useEmployees, useCreateEmployee, useDeleteEmployee } from '@/hooks/useEmployees';

interface Employee {
  id: string;
  user_id?: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  position?: string;
  role?: string;
  department?: string;
  department_id?: string;
  employment_type?: 'full-time' | 'part-time' | 'contractor';
  status: string;
  hire_date?: string;
  salary?: number;
  manager_id?: string;
  created_at?: string;
  updated_at?: string;
}

const columns: ListPageColumn<Employee>[] = [
  { key: 'full_name', label: 'Name', accessor: 'full_name', sortable: true },
  { key: 'email', label: 'Email', accessor: 'email', sortable: true },
  { key: 'phone', label: 'Phone', accessor: (r) => r.phone || '—' },
  { key: 'role', label: 'Role', accessor: (r) => r.role || '—', sortable: true },
  { key: 'department', label: 'Department', accessor: (r) => r.department || '—', sortable: true, render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { 
    key: 'status', 
    label: 'Status', 
    accessor: 'status', 
    sortable: true,
    render: (v) => <Badge variant={v === 'active' ? 'solid' : 'outline'}>{String(v || 'active').toUpperCase()}</Badge>
  },
];

const filters: ListPageFilter[] = [
  { 
    key: 'status', 
    label: 'Status', 
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'onleave', label: 'On Leave' },
      { value: 'terminated', label: 'Terminated' },
    ]
  },
  {
    key: 'department',
    label: 'Department',
    options: [
      { value: 'Operations', label: 'Operations' },
      { value: 'Production', label: 'Production' },
      { value: 'Admin', label: 'Admin' },
      { value: 'Tech', label: 'Tech' },
      { value: 'Finance', label: 'Finance' },
    ]
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'full_name', label: 'Full Name', type: 'text', required: true, colSpan: 2 },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'role', label: 'Role', type: 'text', required: true },
  { name: 'department', label: 'Department', type: 'select', required: true, options: [
    { value: 'Operations', label: 'Operations' },
    { value: 'Production', label: 'Production' },
    { value: 'Admin', label: 'Admin' },
    { value: 'Tech', label: 'Tech' },
    { value: 'Finance', label: 'Finance' },
  ]},
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'onleave', label: 'On Leave' },
  ]},
  { name: 'hire_date', label: 'Hire Date', type: 'date' },
];

export default function WorkforcePage() {
  const router = useRouter();
  const { data: employees, isLoading, error, refetch } = useEmployees();
  const createEmployeeMutation = useCreateEmployee();
  const deleteEmployeeMutation = useDeleteEmployee();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const employeeList = (employees || []) as Employee[];

  const rowActions: ListPageAction<Employee>[] = [
    { id: 'view', label: 'View Profile', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedEmployee(row); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (row) => router.push(`/employees/${row.id}/edit`) },
    { id: 'assign', label: 'Assign to Project', icon: <ClipboardList className="size-4" />, onClick: (row) => router.push(`/employees/${row.id}/assign`) },
    { id: 'schedule', label: 'View Schedule', icon: <Calendar className="size-4" />, onClick: (row) => router.push(`/employees/${row.id}/schedule`) },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (row) => { setEmployeeToDelete(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    { id: 'assign', label: 'Bulk Assign', icon: <ClipboardList className="size-4" /> },
    { id: 'status', label: 'Update Status', icon: <RefreshCw className="size-4" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' },
  ];

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    console.log('Bulk action:', actionId, selectedIds);
  };

  const handleCreate = async (data: Record<string, unknown>) => {
    await createEmployeeMutation.mutateAsync(data as Parameters<typeof createEmployeeMutation.mutateAsync>[0]);
    setCreateModalOpen(false);
    refetch();
  };

  const handleDelete = async () => {
    if (employeeToDelete) {
      await deleteEmployeeMutation.mutateAsync(employeeToDelete.id);
      setDeleteConfirmOpen(false);
      setEmployeeToDelete(null);
      refetch();
    }
  };

  const stats = [
    { label: 'Total Employees', value: employeeList.length },
    { label: 'Active', value: employeeList.filter(e => e.status === 'active').length },
    { label: 'Operations', value: employeeList.filter(e => e.department === 'Operations').length },
    { label: 'On Leave', value: employeeList.filter(e => e.status === 'onleave').length },
  ];

  const detailSections: DetailSection[] = selectedEmployee ? [
    {
      id: 'overview',
      title: 'Employee Details',
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div><strong>Name:</strong> {selectedEmployee.full_name}</div>
          <div><strong>Email:</strong> {selectedEmployee.email}</div>
          <div><strong>Phone:</strong> {selectedEmployee.phone || '—'}</div>
          <div><strong>Role:</strong> {selectedEmployee.role || '—'}</div>
          <div><strong>Department:</strong> {selectedEmployee.department || '—'}</div>
          <div><strong>Status:</strong> {selectedEmployee.status}</div>
          <div><strong>Hire Date:</strong> {selectedEmployee.hire_date ? new Date(selectedEmployee.hire_date).toLocaleDateString() : '—'}</div>
        </div>
      ),
    },
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<Employee>
        title="Workforce Management"
        subtitle="Manage employees, schedules, and team assignments"
        data={employeeList}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search employees..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
        onRowClick={(row) => { setSelectedEmployee(row); setDrawerOpen(true); }}
        createLabel="Add Employee"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => console.log('Export employees')}
        stats={stats}
        emptyMessage="No employees found"
        emptyAction={{ label: 'Add Employee', onClick: () => setCreateModalOpen(true) }}
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Workforce' }]}
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
        showFavorite
        showSettings
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Add Employee"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedEmployee}
        title={(e) => e.full_name}
        subtitle={(e) => `${e.role || 'Employee'} • ${e.department || 'Unassigned'}`}
        sections={detailSections}
        onEdit={(e) => router.push(`/employees/${e.id}/edit`)}
        onDelete={(e) => { setEmployeeToDelete(e); setDeleteConfirmOpen(true); setDrawerOpen(false); }}
        actions={[
          { id: 'assign', label: 'Assign to Project', icon: '📋' },
          { id: 'schedule', label: 'View Schedule', icon: '📅' },
        ]}
        onAction={(actionId, employee) => {
          if (actionId === 'assign') router.push(`/employees/${employee.id}/assign`);
          if (actionId === 'schedule') router.push(`/employees/${employee.id}/schedule`);
        }}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Employee"
        message={`Are you sure you want to delete "${employeeToDelete?.full_name}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setEmployeeToDelete(null); }}
      />
    </AtlvsAppLayout>
  );
}
