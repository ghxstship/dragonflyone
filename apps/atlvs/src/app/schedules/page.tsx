'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, Download } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
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
  type ListPageFilter,
  type ListPageAction,
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';
import { createExportHandler } from '@ghxstship/config';
import { useSchedules, useCreateSchedule, useDeleteSchedule, type Schedule } from '@/hooks/useSchedules';

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'outline'> = {
  draft: 'outline',
  published: 'info',
  in_progress: 'warning',
  completed: 'success',
  cancelled: 'error',
};

const typeColors: Record<string, 'success' | 'warning' | 'info' | 'solid' | 'outline'> = {
  production: 'solid',
  rehearsal: 'info',
  load_in: 'warning',
  load_out: 'warning',
  show: 'success',
  meeting: 'outline',
  other: 'outline',
};

const columns: ListPageColumn<Schedule>[] = [
  { key: 'name', label: 'Schedule Name', accessor: 'name', sortable: true },
  { key: 'schedule_type', label: 'Type', accessor: 'schedule_type', render: (v) => <Badge variant={typeColors[String(v)] || 'outline'}>{String(v).replace('_', ' ').toUpperCase()}</Badge> },
  { key: 'start_date', label: 'Start Date', accessor: 'start_date', sortable: true },
  { key: 'end_date', label: 'End Date', accessor: (r) => r.end_date || '—' },
  { key: 'location', label: 'Location', accessor: (r) => r.location || '—' },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={statusColors[String(v)] || 'outline'}>{String(v).replace('_', ' ').toUpperCase()}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ]},
  { key: 'schedule_type', label: 'Type', options: [
    { value: 'production', label: 'Production' },
    { value: 'rehearsal', label: 'Rehearsal' },
    { value: 'load_in', label: 'Load In' },
    { value: 'load_out', label: 'Load Out' },
    { value: 'show', label: 'Show' },
    { value: 'meeting', label: 'Meeting' },
  ]},
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Schedule Name', type: 'text', required: true, colSpan: 2 },
  { name: 'schedule_type', label: 'Type', type: 'select', required: true, options: [
    { value: 'production', label: 'Production' },
    { value: 'rehearsal', label: 'Rehearsal' },
    { value: 'load_in', label: 'Load In' },
    { value: 'load_out', label: 'Load Out' },
    { value: 'show', label: 'Show' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'other', label: 'Other' },
  ]},
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ]},
  { name: 'start_date', label: 'Start Date', type: 'date', required: true },
  { name: 'end_date', label: 'End Date', type: 'date' },
  { name: 'start_time', label: 'Start Time', type: 'text', placeholder: 'HH:MM' },
  { name: 'end_time', label: 'End Time', type: 'text', placeholder: 'HH:MM' },
  { name: 'location', label: 'Location', type: 'text', colSpan: 2 },
  { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
  { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
];

export default function SchedulesPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const { data: schedules, isLoading, error, refetch } = useSchedules();
  const createMutation = useCreateSchedule();
  const deleteMutation = useDeleteSchedule();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null);

  const scheduleList = (schedules || []) as Schedule[];

  const stats = [
    { label: 'Total Schedules', value: scheduleList.length },
    { label: 'Published', value: scheduleList.filter(s => s.status === 'published').length },
    { label: 'In Progress', value: scheduleList.filter(s => s.status === 'in_progress').length },
    { label: 'Completed', value: scheduleList.filter(s => s.status === 'completed').length },
  ];

  const rowActions: ListPageAction<Schedule>[] = [
    { id: 'view', label: 'View', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedSchedule(row); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (row) => router.push(`/schedules/${row.id}/edit`) },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (row) => { setScheduleToDelete(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createMutation.mutateAsync({
        organization_id: String(data.organization_id || ''),
        name: String(data.name || ''),
        schedule_type: String(data.schedule_type || 'production'),
        start_date: String(data.start_date || ''),
        end_date: data.end_date ? String(data.end_date) : undefined,
        start_time: data.start_time ? String(data.start_time) : undefined,
        end_time: data.end_time ? String(data.end_time) : undefined,
        location: data.location ? String(data.location) : undefined,
        description: data.description ? String(data.description) : undefined,
        status: String(data.status || 'draft'),
        notes: data.notes ? String(data.notes) : undefined,
      });
      setCreateModalOpen(false);
      addNotification({ type: 'success', title: 'Schedule Created', message: `Schedule "${data.name}" has been created.` });
    } catch (err) {
      addNotification({ type: 'error', title: 'Failed to Create Schedule', message: err instanceof Error ? err.message : 'An unexpected error occurred' });
    }
  };

  const handleDelete = async () => {
    if (scheduleToDelete) {
      try {
        await deleteMutation.mutateAsync(scheduleToDelete.id);
        setDeleteConfirmOpen(false);
        addNotification({ type: 'success', title: 'Schedule Deleted', message: `Schedule "${scheduleToDelete.name}" has been deleted.` });
        setScheduleToDelete(null);
      } catch (err) {
        addNotification({ type: 'error', title: 'Failed to Delete Schedule', message: err instanceof Error ? err.message : 'An unexpected error occurred' });
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

  const detailSections: DetailSection[] = selectedSchedule ? [
    {
      id: 'overview',
      title: 'Schedule Details',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Body size="sm"><strong>Name:</strong> {selectedSchedule.name}</Body>
          <Body size="sm"><strong>Type:</strong> <Badge variant={typeColors[selectedSchedule.schedule_type]}>{selectedSchedule.schedule_type.replace('_', ' ').toUpperCase()}</Badge></Body>
          <Body size="sm"><strong>Status:</strong> <Badge variant={statusColors[selectedSchedule.status]}>{selectedSchedule.status.replace('_', ' ').toUpperCase()}</Badge></Body>
          <Body size="sm"><strong>Location:</strong> {selectedSchedule.location || '—'}</Body>
          <Body size="sm"><strong>Start Date:</strong> {selectedSchedule.start_date}</Body>
          <Body size="sm"><strong>End Date:</strong> {selectedSchedule.end_date || '—'}</Body>
          <Body size="sm"><strong>Start Time:</strong> {selectedSchedule.start_time || '—'}</Body>
          <Body size="sm"><strong>End Time:</strong> {selectedSchedule.end_time || '—'}</Body>
          {selectedSchedule.description && <Body size="sm" className="col-span-2"><strong>Description:</strong> {selectedSchedule.description}</Body>}
          {selectedSchedule.notes && <Body size="sm" className="col-span-2"><strong>Notes:</strong> {selectedSchedule.notes}</Body>}
        </Grid>
      ),
    },
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<Schedule>
        title="Schedule Management"
        subtitle="Manage production schedules and timelines"
        data={scheduleList}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search schedules..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => { setSelectedSchedule(row); setDrawerOpen(true); }}
        createLabel="Create Schedule"
        onCreate={() => setCreateModalOpen(true)}
        onExport={createExportHandler({
          filename: 'schedules',
          getData: () => scheduleList.map(s => ({
            name: s.name,
            type: s.schedule_type,
            start_date: s.start_date,
            end_date: s.end_date,
            location: s.location,
            status: s.status,
          })),
        })}
        stats={stats}
        emptyMessage="No schedules yet"
        emptyAction={{ label: 'Create First Schedule', onClick: () => setCreateModalOpen(true) }}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
      />
      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create Schedule"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />
      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedSchedule}
        title={(schedule) => schedule.name}
        subtitle={(schedule) => schedule.schedule_type.replace('_', ' ')}
        sections={detailSections}
        onEdit={(schedule) => router.push(`/schedules/${schedule.id}/edit`)}
        onDelete={(schedule) => { setScheduleToDelete(schedule); setDeleteConfirmOpen(true); setDrawerOpen(false); }}
      />
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Schedule"
        message={`Delete schedule "${scheduleToDelete?.name}"?`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setScheduleToDelete(null); }}
      />
    </AtlvsAppLayout>
  );
}
