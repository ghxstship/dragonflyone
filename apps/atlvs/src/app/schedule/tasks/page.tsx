'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, CheckCircle, Clock, AlertTriangle, User } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { useTasks, useTaskStats, useCompleteTask } from '../../../hooks/useTasks';
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

interface ScheduleTask {
  id: string;
  title: string;
  description?: string;
  task_type: string;
  priority: string;
  status: string;
  department?: string;
  due_date?: string;
  start_time?: string;
  end_time?: string;
  assignee?: { id: string; first_name: string; last_name: string };
  show?: { id: string; title: string };
}

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  completed: 'success',
  in_progress: 'warning',
  pending: 'default',
  blocked: 'error',
  cancelled: 'error',
};

const priorityColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'default'> = {
  critical: 'error',
  high: 'warning',
  medium: 'info',
  low: 'default',
};

const columns: ListPageColumn<ScheduleTask>[] = [
  { 
    key: 'title', 
    label: 'Task', 
    accessor: 'title', 
    sortable: true,
  },
  { 
    key: 'task_type', 
    label: 'Type', 
    accessor: 'task_type', 
    render: (value) => String(value).replace('_', ' ').toUpperCase()
  },
  { 
    key: 'priority', 
    label: 'Priority', 
    accessor: 'priority', 
    sortable: true,
    render: (value) => (
      <Badge variant={priorityColors[String(value)] || 'default'}>
        {String(value).toUpperCase()}
      </Badge>
    )
  },
  { 
    key: 'assignee', 
    label: 'Assigned To', 
    accessor: (row) => row.assignee ? `${row.assignee.first_name} ${row.assignee.last_name}` : '—',
  },
  { 
    key: 'department', 
    label: 'Department', 
    accessor: 'department', 
    render: (value) => value || '—'
  },
  { 
    key: 'due_date', 
    label: 'Due Date', 
    accessor: 'due_date', 
    sortable: true,
    render: (value) => value ? new Date(String(value)).toLocaleDateString() : '—'
  },
  { 
    key: 'status', 
    label: 'Status', 
    accessor: 'status', 
    sortable: true,
    render: (value) => (
      <Badge variant={statusColors[String(value)] || 'default'}>
        {String(value).replace('_', ' ').toUpperCase()}
      </Badge>
    )
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'title', label: 'Task Title', type: 'text', required: true, placeholder: 'e.g., Set up main stage', colSpan: 2 },
  { name: 'task_type', label: 'Task Type', type: 'select', required: true, options: [
    { value: 'setup', label: 'Setup' },
    { value: 'rehearsal', label: 'Rehearsal' },
    { value: 'performance', label: 'Performance' },
    { value: 'teardown', label: 'Teardown' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'other', label: 'Other' },
  ]},
  { name: 'priority', label: 'Priority', type: 'select', required: true, options: [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ]},
  { name: 'status', label: 'Status', type: 'select', required: true, options: [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'cancelled', label: 'Cancelled' },
  ]},
  { name: 'department', label: 'Department', type: 'text', placeholder: 'e.g., Production' },
  { name: 'due_date', label: 'Due Date', type: 'date' },
  { name: 'start_time', label: 'Start Time', type: 'datetime-local' },
  { name: 'end_time', label: 'End Time', type: 'datetime-local' },
  { name: 'description', label: 'Description', type: 'textarea', colSpan: 2, placeholder: 'Task details...' },
  { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2, placeholder: 'Additional notes...' },
];

export default function ScheduleTasksPage() {
  const router = useRouter();
  const { data: tasks, isLoading, error, refetch } = useTasks();
  const { data: stats } = useTaskStats();
  const completeMutation = useCompleteTask();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ScheduleTask | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<ScheduleTask | null>(null);

  const filters: ListPageFilter[] = [
    { 
      key: 'status', 
      label: 'Status', 
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'blocked', label: 'Blocked' },
      ]
    },
    { 
      key: 'priority', 
      label: 'Priority', 
      options: [
        { value: 'critical', label: 'Critical' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
      ]
    },
    { 
      key: 'task_type', 
      label: 'Type', 
      options: [
        { value: 'setup', label: 'Setup' },
        { value: 'rehearsal', label: 'Rehearsal' },
        { value: 'performance', label: 'Performance' },
        { value: 'teardown', label: 'Teardown' },
        { value: 'meeting', label: 'Meeting' },
        { value: 'other', label: 'Other' },
      ]
    },
  ];

  const rowActions: ListPageAction<ScheduleTask>[] = [
    { 
      id: 'view', 
      label: 'View Details', 
      icon: <Eye className="size-4" />, 
      onClick: (row) => router.push(`/schedule/tasks/${row.id}`) 
    },
    { 
      id: 'edit', 
      label: 'Edit', 
      icon: <Pencil className="size-4" />, 
      onClick: (row) => { setSelectedTask(row); setDrawerOpen(true); } 
    },
    { 
      id: 'complete', 
      label: 'Mark Complete', 
      icon: <CheckCircle className="size-4" />, 
      onClick: (row) => { setTaskToComplete(row); setCompleteDialogOpen(true); },
      hidden: (row) => row.status === 'completed' || row.status === 'cancelled'
    },
  ];

  const handleCreate = async (_data: Record<string, unknown>) => {
    Logger.info("Create action triggered");
    setCreateModalOpen(false);
    refetch();
  };

  const handleComplete = async () => {
    if (taskToComplete) {
      await completeMutation.mutateAsync(taskToComplete.id);
      setCompleteDialogOpen(false);
      setTaskToComplete(null);
      refetch();
    }
  };

  const pageStats = [
    { label: 'Total Tasks', value: stats?.total || 0 },
    { label: 'In Progress', value: stats?.inProgress || 0 },
    { label: 'Completed', value: stats?.completed || 0 },
    { label: 'Critical', value: stats?.critical || 0 },
  ];

  const detailSections: DetailSection[] = selectedTask ? [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <Grid cols={2} gap={4}>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Type</Body>
            <Body>{selectedTask.task_type.replace('_', ' ').toUpperCase()}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Priority</Body>
            <Badge variant={priorityColors[selectedTask.priority] || 'default'}>
              {selectedTask.priority.toUpperCase()}
            </Badge>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Status</Body>
            <Badge variant={statusColors[selectedTask.status] || 'default'}>
              {selectedTask.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Department</Body>
            <Body>{selectedTask.department || '—'}</Body>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'assignment',
      title: 'Assignment',
      content: (
        <Grid cols={2} gap={4}>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Assigned To</Body>
            <Body>{selectedTask.assignee ? `${selectedTask.assignee.first_name} ${selectedTask.assignee.last_name}` : 'Unassigned'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Due Date</Body>
            <Body>{selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString() : 'No due date'}</Body>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'description',
      title: 'Description',
      content: <Body>{selectedTask.description || 'No description provided.'}</Body>,
    },
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<ScheduleTask>
        title="Schedule Tasks"
        subtitle="Manage production tasks and assignments"
        data={tasks || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search tasks..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => router.push(`/schedule/tasks/${row.id}`)}
        createLabel="New Task"
        onCreate={() => setCreateModalOpen(true)}
        stats={pageStats}
        emptyMessage="No tasks yet"
        emptyAction={{ label: 'Create First Task', onClick: () => setCreateModalOpen(true) }}
        quickActions={[
          { id: 'contingencies', label: 'Contingencies', icon: <AlertTriangle className="size-4" />, onClick: () => router.push('/schedule/contingencies') },
          { id: 'templates', label: 'Templates', icon: <Clock className="size-4" />, onClick: () => router.push('/schedule/templates') },
        ]}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create Task"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
        defaultValues={{ status: 'pending', priority: 'medium', task_type: 'other' }}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedTask}
        title={(t) => t.title}
        subtitle={(t) => t.task_type.replace('_', ' ').toUpperCase()}
        sections={detailSections}
        onEdit={(t) => router.push(`/schedule/tasks/${t.id}`)}
      />

      <ConfirmDialog
        open={completeDialogOpen}
        title="Complete Task"
        message={`Mark "${taskToComplete?.title}" as completed?`}
        variant="default"
        confirmLabel="Complete"
        onConfirm={handleComplete}
        onCancel={() => { setCompleteDialogOpen(false); setTaskToComplete(null); }}
      />
    </AtlvsAppLayout>
  );
}
