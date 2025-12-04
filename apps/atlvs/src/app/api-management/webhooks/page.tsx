'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, Webhook, Play, ArrowLeft } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { useWebhooks, useCreateWebhook, useUpdateWebhook, useDeleteWebhook, type Webhook as WebhookType } from '../../../hooks/useApiManagement';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Stack,
  Body,
  Button,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';

const eventOptions = [
  { value: 'production.created', label: 'Production Created' },
  { value: 'production.updated', label: 'Production Updated' },
  { value: 'sponsor.created', label: 'Sponsor Created' },
  { value: 'sponsor.payment', label: 'Sponsor Payment' },
  { value: 'task.completed', label: 'Task Completed' },
  { value: 'task.overdue', label: 'Task Overdue' },
  { value: 'permit.approved', label: 'Permit Approved' },
  { value: 'permit.expiring', label: 'Permit Expiring' },
];

const columns: ListPageColumn<WebhookType>[] = [
  { 
    key: 'name', 
    label: 'Name', 
    accessor: 'name', 
    sortable: true,
  },
  { 
    key: 'url', 
    label: 'URL', 
    accessor: 'url', 
    render: (value) => (
      <Body className="max-w-xs truncate text-body-sm">{String(value)}</Body>
    )
  },
  { 
    key: 'events', 
    label: 'Events', 
    accessor: 'events', 
    render: (value) => {
      const events = value as string[];
      return <Body className="text-body-sm">{events?.length || 0} events</Body>;
    }
  },
  { 
    key: 'last_triggered_at', 
    label: 'Last Triggered', 
    accessor: 'last_triggered_at', 
    render: (value) => value ? new Date(String(value)).toLocaleString() : 'Never'
  },
  { 
    key: 'failure_count', 
    label: 'Failures', 
    accessor: 'failure_count', 
    render: (value) => (
      <Badge variant={Number(value) > 0 ? 'warning' : 'default'}>
        {String(value)}
      </Badge>
    )
  },
  { 
    key: 'is_active', 
    label: 'Status', 
    accessor: 'is_active', 
    render: (value) => (
      <Badge variant={value ? 'success' : 'error'}>
        {value ? 'ACTIVE' : 'DISABLED'}
      </Badge>
    )
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Webhook Name', type: 'text', required: true, placeholder: 'e.g., Slack Notifications', colSpan: 2 },
  { name: 'url', label: 'Endpoint URL', type: 'text', required: true, placeholder: 'https://your-endpoint.com/webhook', colSpan: 2 },
  { name: 'events', label: 'Events', type: 'multiselect', required: true, options: eventOptions, colSpan: 2 },
  { name: 'secret', label: 'Secret (optional)', type: 'text', placeholder: 'Signing secret for verification' },
  { name: 'is_active', label: 'Active', type: 'checkbox' },
];

export default function WebhooksPage() {
  const router = useRouter();
  const { data: webhooks, isLoading, error, refetch } = useWebhooks();
  const createMutation = useCreateWebhook();
  const updateMutation = useUpdateWebhook();
  const deleteMutation = useDeleteWebhook();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookType | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [webhookToDelete, setWebhookToDelete] = useState<WebhookType | null>(null);

  const filters: ListPageFilter[] = [
    { 
      key: 'is_active', 
      label: 'Status', 
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Disabled' },
      ]
    },
  ];

  const rowActions: ListPageAction<WebhookType>[] = [
    { 
      id: 'view', 
      label: 'View Details', 
      icon: <Eye className="size-4" />, 
      onClick: (row) => { setSelectedWebhook(row); setDrawerOpen(true); }
    },
    { 
      id: 'edit', 
      label: 'Edit', 
      icon: <Pencil className="size-4" />, 
      onClick: (row) => { setSelectedWebhook(row); setEditModalOpen(true); }
    },
    { 
      id: 'test', 
      label: 'Test', 
      icon: <Play className="size-4" />, 
      onClick: () => { /* TODO: Implement test webhook */ }
    },
    { 
      id: 'delete', 
      label: 'Delete', 
      icon: <Trash2 className="size-4" />, 
      variant: 'danger',
      onClick: (row) => { setWebhookToDelete(row); setDeleteDialogOpen(true); }
    },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await createMutation.mutateAsync({
      production_id: 'current-production-id',
      name: data.name as string,
      url: data.url as string,
      events: data.events as string[],
      secret: data.secret as string | undefined,
      is_active: data.is_active as boolean ?? true,
    });
    setCreateModalOpen(false);
    refetch();
  };

  const handleEdit = async (data: Record<string, unknown>) => {
    if (!selectedWebhook) return;
    await updateMutation.mutateAsync({
      id: selectedWebhook.id,
      name: data.name as string,
      url: data.url as string,
      events: data.events as string[],
      secret: data.secret as string | undefined,
      is_active: data.is_active as boolean,
    });
    setEditModalOpen(false);
    setSelectedWebhook(null);
    refetch();
  };

  const handleDelete = async () => {
    if (webhookToDelete) {
      await deleteMutation.mutateAsync(webhookToDelete.id);
      setDeleteDialogOpen(false);
      setWebhookToDelete(null);
      refetch();
    }
  };

  const pageStats = [
    { label: 'Total Webhooks', value: webhooks?.length || 0 },
    { label: 'Active', value: webhooks?.filter(w => w.is_active).length || 0 },
    { label: 'Failing', value: webhooks?.filter(w => w.failure_count > 0).length || 0 },
  ];

  const detailSections: DetailSection[] = selectedWebhook ? [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <Grid cols={2} gap={4}>
          <Stack gap={1} className="col-span-2">
            <Body className="text-body-sm text-grey-500">Endpoint URL</Body>
            <Body className="break-all font-mono text-body-sm">{selectedWebhook.url}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Status</Body>
            <Badge variant={selectedWebhook.is_active ? 'success' : 'error'}>
              {selectedWebhook.is_active ? 'ACTIVE' : 'DISABLED'}
            </Badge>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Failures</Body>
            <Badge variant={selectedWebhook.failure_count > 0 ? 'warning' : 'default'}>
              {selectedWebhook.failure_count}
            </Badge>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'events',
      title: 'Subscribed Events',
      content: (
        <Stack gap={2} direction="horizontal" className="flex-wrap">
          {selectedWebhook.events?.map((event, index) => (
            <Badge key={index}>{event}</Badge>
          ))}
        </Stack>
      ),
    },
  ] : [];

  return (
    <AtlvsAppLayout>
      <Stack gap={4} className="p-4">
        <Button
          onClick={() => router.push('/api-management')}
          className="flex w-fit items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
        >
          <ArrowLeft className="size-4" />
          Back to API Management
        </Button>
      </Stack>
      
      <ListPage<WebhookType>
        title="Webhooks"
        subtitle="Manage webhook endpoints for event notifications"
        data={webhooks || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search webhooks..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => { setSelectedWebhook(row); setDrawerOpen(true); }}
        createLabel="Add Webhook"
        onCreate={() => setCreateModalOpen(true)}
        stats={pageStats}
        emptyMessage="No webhooks configured yet"
        emptyAction={{ label: 'Add First Webhook', onClick: () => setCreateModalOpen(true) }}
        breadcrumbs={[
          { label: 'ATLVS', href: '/dashboard' }, 
          { label: 'API Management', href: '/api-management' },
          { label: 'Webhooks' }
        ]}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Add Webhook"
        fields={formFields}
        onSubmit={handleCreate}
        size="md"
        defaultValues={{ events: [], is_active: true }}
      />

      <RecordFormModal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setSelectedWebhook(null); }}
        mode="edit"
        title="Edit Webhook"
        fields={formFields}
        onSubmit={handleEdit}
        size="md"
        defaultValues={selectedWebhook ? {
          name: selectedWebhook.name,
          url: selectedWebhook.url,
          events: selectedWebhook.events,
          secret: selectedWebhook.secret,
          is_active: selectedWebhook.is_active,
        } : {}}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedWebhook(null); }}
        record={selectedWebhook}
        title={(w) => w.name}
        subtitle={() => 'Webhook'}
        sections={detailSections}
        onEdit={(w) => { setDrawerOpen(false); setSelectedWebhook(w); setEditModalOpen(true); }}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Webhook"
        message={`Are you sure you want to delete "${webhookToDelete?.name}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteDialogOpen(false); setWebhookToDelete(null); }}
      />
    </AtlvsAppLayout>
  );
}
