'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../components/navigation';
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
import { useEmployees } from '../../hooks/useEmployees';

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: string;
  department_id: string;
  department_name?: string;
  status: 'active' | 'on_leave' | 'inactive';
  hire_date: string;
  skills?: string[];
  certifications?: string[];
}

const columns: ListPageColumn<Employee>[] = [
  { key: 'name', label: 'Name', accessor: (row) => `${row.first_name} ${row.last_name}`, sortable: true },
  { key: 'email', label: 'Email', accessor: 'email', sortable: true },
  { key: 'role', label: 'Role', accessor: 'role', sortable: true },
  { key: 'department', label: 'Department', accessor: (row) => row.department_name || row.department_id },
  { 
    key: 'status', 
    label: 'Status', 
    accessor: 'status', 
    sortable: true,
    render: (value) => (
      <Badge variant={value === 'active' ? 'solid' : 'outline'}>
        {String(value).replace('_', ' ').toUpperCase()}
      </Badge>
    )
  },
  { 
    key: 'hire_date', 
    label: 'Hire Date', 
    accessor: 'hire_date', 
    sortable: true,
    render: (value) => new Date(String(value)).toLocaleDateString()
  },
];

const filters: ListPageFilter[] = [
  { 
    key: 'status', 
    label: 'Status', 
    options: [
      { value: 'active', label: 'Active' },
      { value: 'on_leave', label: 'On Leave' },
      { value: 'inactive', label: 'Inactive' },
    ]
  },
  {
    key: 'department_id',
    label: 'Department',
    options: [
      { value: 'design', label: 'Design' },
      { value: 'development', label: 'Development' },
      { value: 'direction', label: 'Direction' },
      { value: 'disruption', label: 'Disruption' },
    ]
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'first_name', label: 'First Name', type: 'text', required: true },
  { name: 'last_name', label: 'Last Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'department_id', label: 'Department', type: 'select', required: true, options: [
    { value: 'design', label: 'Design' },
    { value: 'development', label: 'Development' },
    { value: 'direction', label: 'Direction' },
    { value: 'disruption', label: 'Disruption' },
  ]},
  { name: 'role', label: 'Role', type: 'text', required: true },
  { name: 'hire_date', label: 'Hire Date', type: 'date', required: true },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'active', label: 'Active' },
    { value: 'on_leave', label: 'On Leave' },
    { value: 'inactive', label: 'Inactive' },
  ]},
];

export default function EmployeesPage() {
  const router = useRouter();
  const { data: employees, isLoading, refetch } = useEmployees({});
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  const employeeList = (employees || []) as Employee[];

  const rowActions: ListPageAction<Employee>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (row) => { setSelectedEmployee(row); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (row) => router.push(`/employees/${row.id}/edit`) },
    { id: 'schedule', label: 'View Schedule', icon: '📅', onClick: (row) => router.push(`/employees/${row.id}/schedule`) },
    { id: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', onClick: (row) => { setEmployeeToDelete(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'export', label: 'Export', icon: '⬇️' },
    { id: 'activate', label: 'Set Active', icon: '✅' },
    { id: 'deactivate', label: 'Set Inactive', icon: '⏸️' },
    { id: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger' },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    const response = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      setCreateModalOpen(false);
      refetch();
    }
  };

  const handleDelete = async () => {
    if (employeeToDelete) {
      await fetch(`/api/employees/${employeeToDelete.id}`, { method: 'DELETE' });
      setDeleteConfirmOpen(false);
      setEmployeeToDelete(null);
      refetch();
    }
  };

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    console.log('Bulk action:', actionId, selectedIds);
  };

  const stats = [
    { label: 'Total Employees', value: employeeList.length },
    { label: 'Active', value: employeeList.filter(e => e.status === 'active').length },
    { label: 'On Leave', value: employeeList.filter(e => e.status === 'on_leave').length },
    { label: 'Departments', value: new Set(employeeList.map(e => e.department_id)).size },
  ];

  const detailSections: DetailSection[] = selectedEmployee ? [
    {
      id: 'overview',
      title: 'Employee Information',
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div><strong>Email:</strong> {selectedEmployee.email}</div>
          <div><strong>Phone:</strong> {selectedEmployee.phone || '—'}</div>
          <div><strong>Role:</strong> {selectedEmployee.role}</div>
          <div><strong>Department:</strong> {selectedEmployee.department_name || selectedEmployee.department_id}</div>
          <div><strong>Status:</strong> {selectedEmployee.status.replace('_', ' ')}</div>
          <div><strong>Hire Date:</strong> {new Date(selectedEmployee.hire_date).toLocaleDateString()}</div>
        </div>
      ),
    },
    {
      id: 'skills',
      title: 'Skills & Certifications',
      content: (
        <div>
          <div><strong>Skills:</strong> {selectedEmployee.skills?.join(', ') || 'None listed'}</div>
          <div><strong>Certifications:</strong> {selectedEmployee.certifications?.join(', ') || 'None listed'}</div>
        </div>
      ),
    },
  ] : [];

  return (
    <>
      <ListPage<Employee>
        title="Workforce"
        subtitle="Manage employees, roles, and organizational structure"
        data={employeeList}
        columns={columns}
        rowKey="id"
        loading={isLoading}
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
        header={<CreatorNavigationAuthenticated />}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Add New Employee"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedEmployee}
        title={(e) => `${e.first_name} ${e.last_name}`}
        subtitle={(e) => e.role}
        sections={detailSections}
        onEdit={(e) => router.push(`/employees/${e.id}/edit`)}
        onDelete={(e) => { setEmployeeToDelete(e); setDeleteConfirmOpen(true); setDrawerOpen(false); }}
        actions={[{ id: 'schedule', label: 'View Schedule', icon: '📅' }]}
        onAction={(actionId, emp) => {
          if (actionId === 'schedule') router.push(`/employees/${emp.id}/schedule`);
        }}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Employee"
        message={`Are you sure you want to delete "${employeeToDelete?.first_name} ${employeeToDelete?.last_name}"?`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setEmployeeToDelete(null); }}
      />
    </>
  );
}
