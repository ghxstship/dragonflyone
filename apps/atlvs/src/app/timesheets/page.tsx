'use client';

import { useState } from 'react';
import { Eye, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import { useTimesheets, useCreateTimesheet, useDeleteTimesheet, useApproveTimesheet, useRejectTimesheet } from '../../hooks/useTimesheets';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';

interface Timesheet {
  id: string;
  work_date: string;
  clock_in: string;
  clock_out?: string;
  regular_hours: number;
  overtime_hours: number;
  total_hours: number;
  status: string;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
  };
  project?: {
    id: string;
    name: string;
  };
  department?: {
    id: string;
    name: string;
  };
}

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost'> = {
  approved: 'success',
  submitted: 'warning',
  draft: 'ghost',
  rejected: 'error',
};

const columns: ListPageColumn<Timesheet>[] = [
  {
    key: 'employee',
    label: 'Employee',
    accessor: (row) => row.employee ? `${row.employee.first_name} ${row.employee.last_name}` : '—',
    sortable: true,
  },
  {
    key: 'work_date',
    label: 'Date',
    accessor: 'work_date',
    sortable: true,
    render: (value) => value ? new Date(String(value)).toLocaleDateString() : '—',
  },
  {
    key: 'clock_in',
    label: 'Clock In',
    accessor: 'clock_in',
  },
  {
    key: 'clock_out',
    label: 'Clock Out',
    accessor: 'clock_out',
    render: (value) => value || '—',
  },
  {
    key: 'total_hours',
    label: 'Total Hours',
    accessor: 'total_hours',
    sortable: true,
    render: (value) => `${Number(value || 0).toFixed(2)} hrs`,
  },
  {
    key: 'project',
    label: 'Project',
    accessor: (row) => row.project?.name || '—',
  },
  {
    key: 'status',
    label: 'Status',
    accessor: 'status',
    sortable: true,
    render: (value) => (
      <Badge variant={statusColors[String(value)] || 'ghost'}>
        {String(value).toUpperCase()}
      </Badge>
    ),
  },
];

const filters: ListPageFilter[] = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'submitted', label: 'Submitted' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
    ],
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'employee_id', label: 'Employee ID', type: 'text', required: true },
  { name: 'work_date', label: 'Work Date', type: 'date', required: true },
  { name: 'clock_in', label: 'Clock In', type: 'time', required: true },
  { name: 'clock_out', label: 'Clock Out', type: 'time' },
  { name: 'break_minutes', label: 'Break (minutes)', type: 'number' },
  { name: 'project_id', label: 'Project ID', type: 'text' },
  { name: 'task_description', label: 'Task Description', type: 'textarea' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

export default function TimesheetsPage() {
  const { data: timesheets, isLoading, error, refetch } = useTimesheets();
  const createMutation = useCreateTimesheet();
  const deleteMutation = useDeleteTimesheet();
  const approveMutation = useApproveTimesheet();
  const rejectMutation = useRejectTimesheet();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [timesheetToDelete, setTimesheetToDelete] = useState<Timesheet | null>(null);

  const rowActions: ListPageAction<Timesheet>[] = [
    {
      id: 'view',
      label: 'View Details',
      icon: <Eye className="size-4" />,
      onClick: (row) => {
        setSelectedTimesheet(row);
        setDrawerOpen(true);
      },
    },
    {
      id: 'approve',
      label: 'Approve',
      icon: <CheckCircle className="size-4" />,
      onClick: async (row) => {
        await approveMutation.mutateAsync(row.id);
      },
    },
    {
      id: 'reject',
      label: 'Reject',
      icon: <XCircle className="size-4" />,
      variant: 'danger',
      onClick: async (row) => {
        await rejectMutation.mutateAsync({ id: row.id });
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="size-4" />,
      variant: 'danger',
      onClick: (row) => {
        setTimesheetToDelete(row);
        setDeleteConfirmOpen(true);
      },
    },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await createMutation.mutateAsync({
      organization_id: 'default-org',
      employee_id: String(data.employee_id),
      work_date: String(data.work_date),
      clock_in: String(data.clock_in),
      clock_out: data.clock_out ? String(data.clock_out) : undefined,
      break_minutes: Number(data.break_minutes) || 0,
      project_id: data.project_id ? String(data.project_id) : undefined,
      task_description: data.task_description ? String(data.task_description) : undefined,
      notes: data.notes ? String(data.notes) : undefined,
      status: 'draft',
    });
    setCreateModalOpen(false);
  };

  const handleDelete = async () => {
    if (timesheetToDelete) {
      await deleteMutation.mutateAsync(timesheetToDelete.id);
      setDeleteConfirmOpen(false);
      setTimesheetToDelete(null);
    }
  };

  const totalHours = timesheets?.reduce((sum, t) => sum + (t.total_hours || 0), 0) || 0;
  const pendingCount = timesheets?.filter(t => t.status === 'submitted').length || 0;

  const pageStats = [
    { label: 'Total Entries', value: timesheets?.length || 0 },
    { label: 'Total Hours', value: `${totalHours.toFixed(1)} hrs` },
    { label: 'Pending Approval', value: pendingCount },
  ];

  const detailSections: DetailSection[] = selectedTimesheet ? [
    {
      id: 'overview',
      title: 'Timesheet Details',
      content: (
        <Grid cols={2} gap={4}>
          <Body size="sm"><strong>Employee:</strong> {selectedTimesheet.employee ? `${selectedTimesheet.employee.first_name} ${selectedTimesheet.employee.last_name}` : '—'}</Body>
          <Body size="sm"><strong>Date:</strong> {new Date(selectedTimesheet.work_date).toLocaleDateString()}</Body>
          <Body size="sm"><strong>Clock In:</strong> {selectedTimesheet.clock_in}</Body>
          <Body size="sm"><strong>Clock Out:</strong> {selectedTimesheet.clock_out || '—'}</Body>
          <Body size="sm"><strong>Regular Hours:</strong> {selectedTimesheet.regular_hours}</Body>
          <Body size="sm"><strong>Overtime Hours:</strong> {selectedTimesheet.overtime_hours}</Body>
          <Body size="sm"><strong>Total Hours:</strong> {selectedTimesheet.total_hours}</Body>
          <Body size="sm"><strong>Status:</strong> {selectedTimesheet.status}</Body>
        </Grid>
      ),
    },
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<Timesheet>
        title="Timesheets"
        subtitle="Track and manage employee time entries"
        data={timesheets || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search timesheets..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => {
          setSelectedTimesheet(row);
          setDrawerOpen(true);
        }}
        createLabel="Add Entry"
        onCreate={() => setCreateModalOpen(true)}
        stats={pageStats}
        emptyMessage="No timesheets found"
        emptyAction={{ label: 'Add Entry', onClick: () => setCreateModalOpen(true) }}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Timesheet Entry"
        fields={formFields}
        onSubmit={handleCreate}
        submitLabel="Create"
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Timesheet Details"
        sections={detailSections}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Timesheet"
        message="Are you sure you want to delete this timesheet entry? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="danger"
      />
    </AtlvsAppLayout>
  );
}
