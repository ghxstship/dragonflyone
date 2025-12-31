'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, Play } from 'lucide-react';
import { useWorkflows, useCreateWorkflow, useDeleteWorkflow, useToggleWorkflow } from '../../../hooks/useWorkflows';
import {
  ListPage, Badge, RecordFormModal, DetailDrawer, ConfirmDialog, Grid, Body,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type FormFieldConfig, type DetailSection} from "@ghxstship/ui";
import { useAuthContext, PlatformRole } from '@ghxstship/config';

const ADMIN_ROLES = [
  PlatformRole.ATLVS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

interface Workflow {
  id: string;
  name: string;
  description?: string;
  trigger_type: string;
  enabled: boolean;
  created_at: string;
  created_by_user?: {
    id: string;
    full_name?: string;
    email: string;
  };
  executions?: { count: number }[];
}

const triggerColors: Record<string, 'success' | 'warning' | 'info' | 'solid' | 'outline'> = {
  manual: 'outline',
  schedule: 'info',
  event: 'warning',
  webhook: 'solid',
};

const triggerLabels: Record<string, string> = {
  manual: 'Manual',
  schedule: 'Scheduled',
  event: 'Event-based',
  webhook: 'Webhook',
};

const columns: ListPageColumn<Workflow>[] = [
  {
    key: 'name',
    label: 'Workflow Name',
    accessor: 'name',
    sortable: true,
  },
  {
    key: 'trigger_type',
    label: 'Trigger',
    accessor: 'trigger_type',
    render: (value: unknown) => (
      <Badge variant={triggerColors[String(value)] || 'outline'}>
        {triggerLabels[String(value)] || String(value)}
      </Badge>
    ),
  },
  {
    key: 'enabled',
    label: 'Status',
    accessor: 'enabled',
    render: (value: unknown) => (
      <Badge variant={value ? 'success' : 'ghost'}>
        {value ? 'Enabled' : 'Disabled'}
      </Badge>
    ),
  },
  {
    key: 'executions',
    label: 'Executions',
    accessor: (row) => row.executions?.[0]?.count || 0,
  },
  {
    key: 'created_by',
    label: 'Created By',
    accessor: (row) => row.created_by_user?.full_name || row.created_by_user?.email || '—',
  },
  {
    key: 'created_at',
    label: 'Created',
    accessor: 'created_at',
    sortable: true,
    render: (value: unknown) => value ? new Date(String(value)).toLocaleDateString() : '—',
  },
];

const filters: ListPageFilter[] = [
  {
    key: 'status',
    label: 'Status',
    options: [
      { value: 'enabled', label: 'Enabled' },
      { value: 'disabled', label: 'Disabled' },
    ],
  },
  {
    key: 'trigger_type',
    label: 'Trigger Type',
    options: [
      { value: 'manual', label: 'Manual' },
      { value: 'schedule', label: 'Scheduled' },
      { value: 'event', label: 'Event-based' },
      { value: 'webhook', label: 'Webhook' },
    ],
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Workflow Name', type: 'text', required: true, colSpan: 2 },
  { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
  {
    name: 'trigger_type',
    label: 'Trigger Type',
    type: 'select',
    required: true,
    options: [
      { value: 'manual', label: 'Manual' },
      { value: 'schedule', label: 'Scheduled' },
      { value: 'event', label: 'Event-based' },
      { value: 'webhook', label: 'Webhook' },
    ],
  },
  { name: 'enabled', label: 'Enabled', type: 'checkbox' },
];

export default function WorkflowsPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  
  // RBAC: Check if user has admin access
  const canManageWorkflows = ADMIN_ROLES.some(role => hasRole(role));
  
  const { data: workflows, isLoading, error, refetch } = useWorkflows();
  const createMutation = useCreateWorkflow();
  const deleteMutation = useDeleteWorkflow();
  const toggleMutation = useToggleWorkflow();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<Workflow | null>(null);

  const rowActions: ListPageAction<Workflow>[] = [
    {
      id: 'view',
      label: 'View Details',
      icon: <Eye className="size-4" />,
      onClick: (row) => {
        setSelectedWorkflow(row);
        setDrawerOpen(true);
      },
    },
    {
      id: 'toggle',
      label: 'Toggle Status',
      icon: <Play className="size-4" />,
      onClick: async (row) => {
        await toggleMutation.mutateAsync({ id: row.id, enabled: !row.enabled });
        refetch();
      },
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Pencil className="size-4" />,
      onClick: (row) => router.push(`/workflows/${row.id}/edit`),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="size-4" />,
      variant: 'danger',
      onClick: (row) => {
        setWorkflowToDelete(row);
        setDeleteConfirmOpen(true);
      },
    },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await createMutation.mutateAsync({
      name: String(data.name),
      description: data.description ? String(data.description) : undefined,
      trigger_type: String(data.trigger_type) as 'manual' | 'schedule' | 'event' | 'webhook',
      enabled: Boolean(data.enabled ?? true),
      actions: [],
    });
    setCreateModalOpen(false);
    refetch();
  };

  const handleDelete = async () => {
    if (workflowToDelete) {
      await deleteMutation.mutateAsync(workflowToDelete.id);
      setDeleteConfirmOpen(false);
      setWorkflowToDelete(null);
      refetch();
    }
  };

  const stats = [
    { label: 'Total Workflows', value: workflows?.length || 0 },
    { label: 'Enabled', value: workflows?.filter(w => w.enabled).length || 0 },
    { label: 'Scheduled', value: workflows?.filter(w => w.trigger_type === 'schedule').length || 0 },
    { label: 'Event-based', value: workflows?.filter(w => w.trigger_type === 'event').length || 0 },
  ];

  const detailSections: DetailSection[] = selectedWorkflow
    ? [
        {
          id: 'overview',
          title: 'Workflow Details',
          content: (
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Body size="sm"><strong>Name:</strong> {selectedWorkflow.name}</Body>
              <Body size="sm"><strong>Trigger:</strong> {triggerLabels[selectedWorkflow.trigger_type] || selectedWorkflow.trigger_type}</Body>
              <Body size="sm"><strong>Status:</strong> {selectedWorkflow.enabled ? 'Enabled' : 'Disabled'}</Body>
              <Body size="sm"><strong>Executions:</strong> {selectedWorkflow.executions?.[0]?.count || 0}</Body>
              <Body size="sm"><strong>Created By:</strong> {selectedWorkflow.created_by_user?.full_name || selectedWorkflow.created_by_user?.email || '—'}</Body>
              <Body size="sm"><strong>Description:</strong> {selectedWorkflow.description || '—'}</Body>
            </Grid>
          ),
        },
      ]
    : [];

  return (
    <>
      <ListPage<Workflow>
        title="Workflows"
        subtitle="Manage automation workflows and triggers"
        data={workflows || []}
        columns={columns}
        rowKey="id"
        filters={filters}
        rowActions={rowActions}
        stats={stats}
        loading={isLoading}
        error={error instanceof Error ? error : error ? new Error(String(error)) : undefined}
        onRetry={refetch}
        onCreate={canManageWorkflows ? () => setCreateModalOpen(true) : undefined}
        createLabel="Create Workflow"
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create Workflow"
        fields={formFields}
        onSubmit={handleCreate}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedWorkflow}
        title={(w) => w?.name || 'Workflow Details'}
        sections={detailSections}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onCancel={() => setDeleteConfirmOpen(false)}
        title="Delete Workflow"
        message={`Are you sure you want to delete "${workflowToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="danger"
      />
    </>
  );
}
