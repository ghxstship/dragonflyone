"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";

interface Task {
  id: string;
  title: string;
  type: "Follow-up" | "Call" | "Email" | "Meeting" | "Task";
  priority: "High" | "Medium" | "Low";
  dueDate: string;
  dueTime?: string;
  assignedTo: string;
  linkedContact?: string;
  linkedDeal?: string;
  status: "Pending" | "Completed" | "Overdue";
  reminder?: string;
  [key: string]: unknown;
}

const mockTasks: Task[] = [
  { id: "TSK-001", title: "Follow up on proposal", type: "Follow-up", priority: "High", dueDate: "2024-11-25", dueTime: "10:00 AM", assignedTo: "John Smith", linkedContact: "Festival Productions", linkedDeal: "Summer Fest 2025", status: "Pending", reminder: "1 hour before" },
  { id: "TSK-002", title: "Send contract revision", type: "Email", priority: "High", dueDate: "2024-11-25", assignedTo: "John Smith", linkedContact: "Tech Corp", linkedDeal: "Corporate Gala", status: "Pending" },
  { id: "TSK-003", title: "Schedule site visit", type: "Call", priority: "Medium", dueDate: "2024-11-26", assignedTo: "Sarah Johnson", linkedContact: "Grand Arena", status: "Pending", reminder: "1 day before" },
  { id: "TSK-004", title: "Review vendor quotes", type: "Task", priority: "Medium", dueDate: "2024-11-24", assignedTo: "John Smith", status: "Overdue" },
  { id: "TSK-005", title: "Client check-in call", type: "Call", priority: "Low", dueDate: "2024-11-23", assignedTo: "Mike Davis", linkedContact: "Music Festival Inc", status: "Completed" },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "Follow-up": return "🔄";
    case "Call": return "📞";
    case "Email": return "📧";
    case "Meeting": return "👥";
    default: return "✅";
  }
};

const columns: ListPageColumn<Task>[] = [
  { key: 'title', label: 'Task', accessor: (r) => `${getTypeIcon(r.type)} ${r.title}`, sortable: true },
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
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  const pendingCount = tasks.filter(t => t.status === "Pending").length;
  const overdueCount = tasks.filter(t => t.status === "Overdue").length;
  const completedCount = tasks.filter(t => t.status === "Completed").length;

  const rowActions: ListPageAction<Task>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedTask(r); setDrawerOpen(true); } },
    { id: 'complete', label: 'Mark Complete', icon: '✅', onClick: (r) => setTasks(tasks.map(t => t.id === r.id ? { ...t, status: 'Completed' } : t)) },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (r) => { setSelectedTask(r); setEditModalOpen(true); } },
    { id: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', onClick: (r) => { setTaskToDelete(r); setDeleteConfirmOpen(true); } },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    const newTask: Task = {
      id: `TSK-${String(tasks.length + 1).padStart(3, '0')}`,
      title: String(data.title || ''),
      type: data.type as Task['type'],
      priority: data.priority as Task['priority'],
      dueDate: String(data.dueDate || ''),
      dueTime: data.dueTime ? String(data.dueTime) : undefined,
      assignedTo: String(data.assignedTo || ''),
      linkedContact: data.linkedContact ? String(data.linkedContact) : undefined,
      status: 'Pending',
      reminder: data.reminder ? String(data.reminder) : undefined,
    };
    setTasks([...tasks, newTask]);
    setCreateModalOpen(false);
  };

  const handleEdit = async (data: Record<string, unknown>) => {
    if (!selectedTask) return;
    setTasks(tasks.map(t => t.id === selectedTask.id ? { ...t, ...data } as Task : t));
    setEditModalOpen(false);
    setSelectedTask(null);
  };

  const handleDelete = () => {
    if (taskToDelete) {
      setTasks(tasks.filter(t => t.id !== taskToDelete.id));
      setDeleteConfirmOpen(false);
      setTaskToDelete(null);
    }
  };

  const stats = [
    { label: 'Total Tasks', value: tasks.length },
    { label: 'Pending', value: pendingCount },
    { label: 'Overdue', value: overdueCount },
    { label: 'Completed', value: completedCount },
  ];

  const detailSections: DetailSection[] = selectedTask ? [
    { id: 'overview', title: 'Task Details', content: (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div><strong>Title:</strong> {selectedTask.title}</div>
        <div><strong>Type:</strong> {selectedTask.type}</div>
        <div><strong>Priority:</strong> {selectedTask.priority}</div>
        <div><strong>Status:</strong> {selectedTask.status}</div>
        <div><strong>Due:</strong> {selectedTask.dueDate} {selectedTask.dueTime || ''}</div>
        <div><strong>Assigned To:</strong> {selectedTask.assignedTo}</div>
        <div><strong>Contact:</strong> {selectedTask.linkedContact || '—'}</div>
        <div><strong>Deal:</strong> {selectedTask.linkedDeal || '—'}</div>
        <div><strong>Reminder:</strong> {selectedTask.reminder || 'None'}</div>
      </div>
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
        loading={false}
        searchPlaceholder="Search tasks..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedTask(r); setDrawerOpen(true); }}
        createLabel="Create Task"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => console.log('Export tasks')}
        stats={stats}
        emptyMessage="No tasks found"
        emptyAction={{ label: 'Create Task', onClick: () => setCreateModalOpen(true) }}
        header={<Navigation />}
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
          actions={[{ id: 'complete', label: 'Mark Complete', icon: '✅' }]}
          onAction={(id, t) => { if (id === 'complete') setTasks(tasks.map(task => task.id === t.id ? { ...task, status: 'Completed' } : task)); }}
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
