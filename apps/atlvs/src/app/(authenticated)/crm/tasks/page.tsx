"use client";

import { useState } from "react";

import { Eye, Check, Pencil, Trash2, RefreshCw, Phone, Mail, Users } from "lucide-react";
// Layout provided by route group
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
  } from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates, useCrmTasks, type CrmTask } from "@ghxstship/config";

import { DEMO_CRM_TASKS } from '../../../../lib/demo-data';

type Task = CrmTask & { [key: string]: unknown };

const TypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "Follow-up": return <RefreshCw className="size-4 inline mr-1" />;
    case "Call": return <Phone className="size-4 inline mr-1" />;
    case "Email": return <Mail className="size-4 inline mr-1" />;
    case "Meeting": return <Users className="size-4 inline mr-1" />;
    default: return <Check className="size-4 inline mr-1" />;
  }
};

const columns: ListPageColumn<Task>[] = [
  { key: 'title', label: 'Task', accessor: 'title', sortable: true, render: (v, r) => <><TypeIcon type={r.type} />{String(v)}</> },
  { key: 'type', label: 'Type', accessor: 'type', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'priority', label: 'Priority', accessor: 'priority', sortable: true, render: (v) => <Badge variant={v === 'High' ? 'solid' : v === 'Medium' ? 'outline' : 'ghost'}>{String(v)}</Badge> },
  { key: 'dueDate', label: 'Due', accessor: (r) => `${r.dueDate}${r.dueTime ? ` ${r.dueTime}` : ''}`, sortable: true },
  { key: 'assignedTo', label: 'Assigned To', accessor: 'assignedTo' },
  { key: 'linkedContact', label: 'Contact', accessor: (r) => r.linkedContact || '—' },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={v === 'Completed' ? 'solid' : v === 'Overdue' ? 'solid' : 'outline'}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'Pending', label: 'Pending' }, { value: 'Completed', label: 'Completed' }, { value: 'Overdue', label: 'Overdue' }] },
  { key: 'priority', label: 'Priority', options: [{ value: 'High', label: 'High' }, { value: 'Medium', label: 'Medium' }, { value: 'Low', label: 'Low' }] },
  { key: 'type', label: 'Type', options: [{ value: 'Follow-up', label: 'Follow-up' }, { value: 'Call', label: 'Call' }, { value: 'Email', label: 'Email' }, { value: 'Meeting', label: 'Meeting' }, { value: 'Task', label: 'Task' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'title', label: 'Task Title', type: 'text', required: true, colSpan: 2 },
  { name: 'type', label: 'Type', type: 'select', required: true, options: [{ value: 'Follow-up', label: 'Follow-up' }, { value: 'Call', label: 'Call' }, { value: 'Email', label: 'Email' }, { value: 'Meeting', label: 'Meeting' }, { value: 'Task', label: 'Task' }] },
  { name: 'priority', label: 'Priority', type: 'select', required: true, options: [{ value: 'High', label: 'High' }, { value: 'Medium', label: 'Medium' }, { value: 'Low', label: 'Low' }] },
  { name: 'dueDate', label: 'Due Date', type: 'date', required: true },
  { name: 'dueTime', label: 'Due Time', type: 'text' },
  { name: 'assignedTo', label: 'Assigned To', type: 'text', required: true },
  { name: 'linkedContact', label: 'Linked Contact', type: 'text' },
  { name: 'reminder', label: 'Reminder', type: 'select', options: [{ value: '15min', label: '15 minutes before' }, { value: '1hour', label: '1 hour before' }, { value: '1day', label: '1 day before' }] },
];

export default function TasksPage() {
  const { tasks: apiTasks, summary, isLoading, error, createTaskAsync, updateTaskAsync, deleteTasksAsync, refetch } = useCrmTasks();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // Use API data or fall back to demo data
  const tasks: Task[] = apiTasks.length > 0 ? (apiTasks as Task[]) : (DEMO_CRM_TASKS as Task[]);

  const pendingCount = summary?.pending || tasks.filter(t => t.status === "Pending").length;
  const overdueCount = summary?.overdue || tasks.filter(t => t.status === "Overdue").length;
  const completedCount = summary?.completed || tasks.filter(t => t.status === "Completed").length;

  const handleMarkComplete = async (r: Task) => {
    try {
      await updateTaskAsync({ id: r.id, data: { status: 'Completed' } });
      refetch();
    } catch (err) {
      console.error('Failed to mark task complete:', err);
    }
  };

  const rowActions: ListPageAction<Task>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedTask(r); setDrawerOpen(true); } },
    { id: 'complete', label: 'Mark Complete', icon: <Check className="size-4" />, onClick: handleMarkComplete },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => { setSelectedTask(r); setEditModalOpen(true); } },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (r) => { setTaskToDelete(r); setDeleteConfirmOpen(true); } },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createTaskAsync({
        title: String(data.title || ''),
        type: data.type as Task['type'],
        priority: data.priority as Task['priority'],
        dueDate: String(data.dueDate || ''),
        dueTime: data.dueTime ? String(data.dueTime) : undefined,
        assignedTo: String(data.assignedTo || ''),
        linkedContact: data.linkedContact ? String(data.linkedContact) : undefined,
        status: 'Pending',
        reminder: data.reminder ? String(data.reminder) : undefined,
      });
      refetch();
      setCreateModalOpen(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleEdit = async (data: Record<string, unknown>) => {
    if (!selectedTask) return;
    try {
      await updateTaskAsync({ id: selectedTask.id, data });
      refetch();
      setEditModalOpen(false);
      setSelectedTask(null);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleDelete = async () => {
    if (taskToDelete) {
      try {
        await deleteTasksAsync([taskToDelete.id]);
        refetch();
        setDeleteConfirmOpen(false);
        setTaskToDelete(null);
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'tasks',
    requiredFields: ['title', 'type', 'priority'],
    onImport: async (records) => {
      for (const record of records) {
        await createTaskAsync({
          title: String(record.title || ''),
          type: record.type as Task['type'],
          priority: record.priority as Task['priority'],
          dueDate: String(record.dueDate || ''),
          assignedTo: String(record.assignedTo || ''),
          status: 'Pending',
        });
      }
      refetch();
    },
  });

  const importTemplates = getImportTemplates('tasks').length > 0 
    ? getImportTemplates('tasks') 
    : [{ id: 'default', name: 'Task Import', mapping: { title: 'title', type: 'type', priority: 'priority', dueDate: 'dueDate', assignedTo: 'assignedTo' } }];

  const stats = [
    { label: 'Total Tasks', value: tasks.length },
    { label: 'Pending', value: pendingCount },
    { label: 'Overdue', value: overdueCount },
    { label: 'Completed', value: completedCount },
  ];

  const detailSections: DetailSection[] = selectedTask ? [
    { id: 'overview', title: 'Task Details', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Title:</strong> {selectedTask.title}</Body>
        <Body size="sm"><strong>Type:</strong> {selectedTask.type}</Body>
        <Body size="sm"><strong>Priority:</strong> {selectedTask.priority}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedTask.status}</Body>
        <Body size="sm"><strong>Due:</strong> {selectedTask.dueDate} {selectedTask.dueTime || ''}</Body>
        <Body size="sm"><strong>Assigned To:</strong> {selectedTask.assignedTo}</Body>
        <Body size="sm"><strong>Contact:</strong> {selectedTask.linkedContact || '—'}</Body>
        <Body size="sm"><strong>Deal:</strong> {selectedTask.linkedDeal || '—'}</Body>
        <Body size="sm"><strong>Reminder:</strong> {selectedTask.reminder || 'None'}</Body>
      </Grid>
    )},
  ] : [];

  return (
    <>
      <ListPage<Task>
        title="Tasks & Follow-ups"
        subtitle="Manage tasks and automated reminders"
        data={tasks}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error as Error | undefined}
        onRetry={() => refetch()}
        searchPlaceholder="Search tasks..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedTask(r); setDrawerOpen(true); }}
        createLabel="Create Task"
        onCreate={() => setCreateModalOpen(true)}
        entityType="tasks"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['title', 'type', 'priority', 'dueDate', 'assignedTo']}
        onExport={createExportHandler({
          filename: "tasks",
          getData: () => tasks.map(t => ({
            id: t.id,
            title: t.title,
            type: t.type,
            priority: t.priority,
            dueDate: t.dueDate,
            status: t.status,
            assignedTo: t.assignedTo || '',
            linkedContact: t.linkedContact || '',
          })),
        })}
        exportFormats={["csv", "json"]}
        stats={stats}
        emptyMessage="No tasks found"
        emptyAction={{ label: 'Create Task', onClick: () => setCreateModalOpen(true) }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await deleteTasksAsync(ids);
            refetch();
          } else if (action === 'complete') {
            for (const id of ids) {
              await updateTaskAsync({ id, data: { status: 'Completed' } });
            }
            refetch();
          }
        }}
        bulkActions={[
          { id: 'complete', label: 'Complete Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create Task"
        fields={formFields}
        onSubmit={handleCreate}
      />

      {selectedTask && (
        <RecordFormModal
          open={editModalOpen}
          onClose={() => { setEditModalOpen(false); setSelectedTask(null); }}
          mode="edit"
          title="Edit Task"
          fields={formFields}
          record={selectedTask}
          onSubmit={handleEdit}
        />
      )}

      {selectedTask && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedTask}
          title={(t) => t.title}
          subtitle={(t) => `${t.type} - ${t.priority} Priority`}
          sections={detailSections}
          onEdit={(t) => { setSelectedTask(t); setEditModalOpen(true); setDrawerOpen(false); }}
          onDelete={(t) => { setTaskToDelete(t); setDeleteConfirmOpen(true); setDrawerOpen(false); }}
          actions={[{ id: 'complete', label: 'Mark Complete', icon: <Check className="size-4" /> }]}
          onAction={async (id, t) => { if (id === 'complete') { await updateTaskAsync({ id: t.id, data: { status: 'Completed' } }); refetch(); } }}
        />
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"?`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setTaskToDelete(null); }}
      />
    </>
  );
}
