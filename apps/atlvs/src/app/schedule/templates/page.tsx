'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, Copy, Clock, CheckSquare } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { 
  useTaskTemplates, 
  useCreateTaskTemplate, 
  useUpdateTaskTemplate, 
  useDeleteTaskTemplate,
  type TaskTemplate 
} from '../../../hooks/useTasks';
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

const taskTypeLabels: Record<string, string> = {
  setup: 'Setup',
  rehearsal: 'Rehearsal',
  performance: 'Performance',
  teardown: 'Teardown',
  meeting: 'Meeting',
  other: 'Other',
};

const priorityColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost'> = {
  critical: 'error',
  high: 'warning',
  medium: 'info',
  low: 'default',
};

const columns: ListPageColumn<TaskTemplate>[] = [
  { 
    key: 'name', 
    label: 'Template Name', 
    accessor: 'name', 
    sortable: true,
  },
  { 
    key: 'task_type', 
    label: 'Type', 
    accessor: 'task_type', 
    render: (value) => taskTypeLabels[String(value)] || String(value)
  },
  { 
    key: 'default_priority', 
    label: 'Default Priority', 
    accessor: 'default_priority', 
    sortable: true,
    render: (value) => (
      <Badge variant={priorityColors[String(value)] || 'ghost'}>
        {String(value).toUpperCase()}
      </Badge>
    )
  },
  { 
    key: 'department', 
    label: 'Department', 
    accessor: 'department', 
    render: (value) => value || '—'
  },
  { 
    key: 'default_duration_hours', 
    label: 'Duration', 
    accessor: 'default_duration_hours', 
    render: (value) => value ? `${value}h` : '—'
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
  { name: 'name', label: 'Template Name', type: 'text', required: true, placeholder: 'e.g., Stage Setup Checklist', colSpan: 2 },
  { name: 'task_type', label: 'Task Type', type: 'select', required: true, options: [
    { value: 'setup', label: 'Setup' },
    { value: 'rehearsal', label: 'Rehearsal' },
    { value: 'performance', label: 'Performance' },
    { value: 'teardown', label: 'Teardown' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'other', label: 'Other' },
  ]},
  { name: 'default_priority', label: 'Default Priority', type: 'select', required: true, options: [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ]},
  { name: 'department', label: 'Department', type: 'text', placeholder: 'e.g., Production' },
  { name: 'default_duration_hours', label: 'Default Duration (hours)', type: 'number', placeholder: 'e.g., 4' },
  { name: 'description', label: 'Description', type: 'textarea', colSpan: 2, placeholder: 'Template description...' },
  { name: 'is_active', label: 'Active', type: 'checkbox' },
];

export default function TaskTemplatesPage() {
  const router = useRouter();
  const { data: templates, isLoading, error, refetch } = useTaskTemplates();
  const createMutation = useCreateTaskTemplate();
  const updateMutation = useUpdateTaskTemplate();
  const deleteMutation = useDeleteTaskTemplate();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<TaskTemplate | null>(null);

  const filters: ListPageFilter[] = [
    { 
      key: 'task_type', 
      label: 'Type', 
      options: Object.entries(taskTypeLabels).map(([value, label]) => ({ value, label }))
    },
    { 
      key: 'default_priority', 
      label: 'Priority', 
      options: [
        { value: 'critical', label: 'Critical' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
      ]
    },
    { 
      key: 'is_active', 
      label: 'Status', 
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ]
    },
  ];

  const rowActions: ListPageAction<TaskTemplate>[] = [
    { 
      id: 'view', 
      label: 'View Details', 
      icon: <Eye className="size-4" />, 
      onClick: (row) => { setSelectedTemplate(row); setDrawerOpen(true); }
    },
    { 
      id: 'edit', 
      label: 'Edit', 
      icon: <Pencil className="size-4" />, 
      onClick: (row) => { setSelectedTemplate(row); setEditModalOpen(true); }
    },
    { 
      id: 'duplicate', 
      label: 'Duplicate', 
      icon: <Copy className="size-4" />, 
      onClick: async (row) => {
        await createMutation.mutateAsync({
          name: `${row.name} (Copy)`,
          description: row.description,
          task_type: row.task_type,
          default_priority: row.default_priority,
          default_duration_hours: row.default_duration_hours,
          department: row.department,
          checklist: row.checklist,
          dependencies_template: row.dependencies_template,
          is_active: false,
        });
        refetch();
      }
    },
    { 
      id: 'delete', 
      label: 'Delete', 
      icon: <Trash2 className="size-4" />, 
      variant: 'danger',
      onClick: (row) => { setTemplateToDelete(row); setDeleteDialogOpen(true); }
    },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await createMutation.mutateAsync({
      name: data.name as string,
      description: data.description as string | undefined,
      task_type: data.task_type as TaskTemplate['task_type'],
      default_priority: data.default_priority as TaskTemplate['default_priority'],
      default_duration_hours: data.default_duration_hours as number | undefined,
      department: data.department as string | undefined,
      is_active: data.is_active as boolean ?? true,
    });
    setCreateModalOpen(false);
    refetch();
  };

  const handleEdit = async (data: Record<string, unknown>) => {
    if (!selectedTemplate) return;
    await updateMutation.mutateAsync({
      id: selectedTemplate.id,
      name: data.name as string,
      description: data.description as string | undefined,
      task_type: data.task_type as TaskTemplate['task_type'],
      default_priority: data.default_priority as TaskTemplate['default_priority'],
      default_duration_hours: data.default_duration_hours as number | undefined,
      department: data.department as string | undefined,
      is_active: data.is_active as boolean,
    });
    setEditModalOpen(false);
    setSelectedTemplate(null);
    refetch();
  };

  const handleDelete = async () => {
    if (templateToDelete) {
      await deleteMutation.mutateAsync(templateToDelete.id);
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
      refetch();
    }
  };

  const activeCount = templates?.filter(t => t.is_active).length || 0;
  const pageStats = [
    { label: 'Total Templates', value: templates?.length || 0 },
    { label: 'Active', value: activeCount },
    { label: 'Setup Templates', value: templates?.filter(t => t.task_type === 'setup').length || 0 },
    { label: 'Teardown Templates', value: templates?.filter(t => t.task_type === 'teardown').length || 0 },
  ];

  const detailSections: DetailSection[] = selectedTemplate ? [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <Grid cols={2} gap={4}>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Type</Body>
            <Body>{taskTypeLabels[selectedTemplate.task_type] || selectedTemplate.task_type}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Default Priority</Body>
            <Badge variant={priorityColors[selectedTemplate.default_priority] || 'ghost'}>
              {selectedTemplate.default_priority.toUpperCase()}
            </Badge>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Department</Body>
            <Body>{selectedTemplate.department || 'Not specified'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Duration</Body>
            <Body>{selectedTemplate.default_duration_hours ? `${selectedTemplate.default_duration_hours} hours` : 'Not specified'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Status</Body>
            <Badge variant={selectedTemplate.is_active ? 'success' : 'ghost'}>
              {selectedTemplate.is_active ? 'ACTIVE' : 'INACTIVE'}
            </Badge>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'description',
      title: 'Description',
      content: <Body>{selectedTemplate.description || 'No description provided.'}</Body>,
    },
    ...(selectedTemplate.checklist && selectedTemplate.checklist.length > 0 ? [{
      id: 'checklist',
      title: 'Checklist Items',
      content: (
        <Stack gap={2}>
          {selectedTemplate.checklist.map((item, index) => (
            <Stack key={index} direction="horizontal" gap={2} className="items-center">
              <CheckSquare className="size-4 text-grey-400" />
              <Body>{item}</Body>
            </Stack>
          ))}
        </Stack>
      ),
    }] : []),
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<TaskTemplate>
        title="Task Templates"
        subtitle="Reusable templates for common production tasks"
        data={templates || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search templates..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => { setSelectedTemplate(row); setDrawerOpen(true); }}
        createLabel="New Template"
        onCreate={() => setCreateModalOpen(true)}
        stats={pageStats}
        emptyMessage="No task templates yet"
        emptyAction={{ label: 'Create First Template', onClick: () => setCreateModalOpen(true) }}
        quickActions={[
          { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="size-4" />, onClick: () => router.push('/schedule/tasks') },
          { id: 'contingencies', label: 'Contingencies', icon: <Clock className="size-4" />, onClick: () => router.push('/schedule/contingencies') },
        ]}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/schedule/templates/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch();
          } else if (action === 'archive') {
            await fetch('/api/schedule/templates/bulk-archive', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch();
          }
        }}
        bulkActions={[
          { id: 'archive', label: 'Archive Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create Task Template"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
        record={{ is_active: true, default_priority: 'medium', task_type: 'other' }}
      />

      <RecordFormModal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setSelectedTemplate(null); }}
        mode="edit"
        title="Edit Task Template"
        fields={formFields}
        onSubmit={handleEdit}
        size="lg"
        record={selectedTemplate ? {
          name: selectedTemplate.name,
          description: selectedTemplate.description,
          task_type: selectedTemplate.task_type,
          default_priority: selectedTemplate.default_priority,
          default_duration_hours: selectedTemplate.default_duration_hours,
          department: selectedTemplate.department,
          is_active: selectedTemplate.is_active,
        } : {}}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedTemplate(null); }}
        record={selectedTemplate}
        title={(t) => t.name}
        subtitle={(t) => taskTypeLabels[t.task_type] || t.task_type}
        sections={detailSections}
        onEdit={(t) => { setDrawerOpen(false); setSelectedTemplate(t); setEditModalOpen(true); }}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Template"
        message={`Are you sure you want to delete "${templateToDelete?.name}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteDialogOpen(false); setTemplateToDelete(null); }}
      />
    </AtlvsAppLayout>
  );
}
