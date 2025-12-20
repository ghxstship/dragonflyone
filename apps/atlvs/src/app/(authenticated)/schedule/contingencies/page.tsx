'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, CheckCircle, Zap } from 'lucide-react';
import { AtlvsAppLayout } from '../../../../components/app-layout';
import { useContingencies, useContingencyStats, useTriggerContingency, useResolveContingency } from '../../../../hooks/useTasks';
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

interface Contingency {
  id: string;
  title: string;
  description?: string;
  trigger_condition: string;
  response_plan: string;
  category: string;
  severity: string;
  status: string;
  triggered_at?: string;
  resolved_at?: string;
  owner?: { id: string; first_name: string; last_name: string };
  backup_owner?: { id: string; first_name: string; last_name: string };
}

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost'> = {
  resolved: 'success',
  triggered: 'error',
  active: 'info',
  archived: 'default',
};

const severityColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost'> = {
  critical: 'error',
  high: 'warning',
  medium: 'info',
  low: 'default',
};

const categoryLabels: Record<string, string> = {
  weather: 'Weather',
  technical: 'Technical',
  safety: 'Safety',
  medical: 'Medical',
  security: 'Security',
  staffing: 'Staffing',
  vendor: 'Vendor',
  other: 'Other',
};

const columns: ListPageColumn<Contingency>[] = [
  { 
    key: 'title', 
    label: 'Contingency', 
    accessor: 'title', 
    sortable: true,
  },
  { 
    key: 'category', 
    label: 'Category', 
    accessor: 'category', 
    render: (value) => categoryLabels[String(value)] || String(value)
  },
  { 
    key: 'severity', 
    label: 'Severity', 
    accessor: 'severity', 
    sortable: true,
    render: (value) => (
      <Badge variant={severityColors[String(value)] || 'ghost'}>
        {String(value).toUpperCase()}
      </Badge>
    )
  },
  { 
    key: 'owner', 
    label: 'Owner', 
    accessor: (row) => row.owner ? `${row.owner.first_name} ${row.owner.last_name}` : '—',
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
    )
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'title', label: 'Contingency Title', type: 'text', required: true, placeholder: 'e.g., Rain Delay Protocol', colSpan: 2 },
  { name: 'category', label: 'Category', type: 'select', required: true, options: [
    { value: 'weather', label: 'Weather' },
    { value: 'technical', label: 'Technical' },
    { value: 'safety', label: 'Safety' },
    { value: 'medical', label: 'Medical' },
    { value: 'security', label: 'Security' },
    { value: 'staffing', label: 'Staffing' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'other', label: 'Other' },
  ]},
  { name: 'severity', label: 'Severity', type: 'select', required: true, options: [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
  ]},
  { name: 'trigger_condition', label: 'Trigger Condition', type: 'textarea', required: true, colSpan: 2, placeholder: 'When should this contingency be triggered?' },
  { name: 'response_plan', label: 'Response Plan', type: 'textarea', required: true, colSpan: 2, placeholder: 'What actions should be taken?' },
  { name: 'estimated_impact', label: 'Estimated Impact', type: 'textarea', colSpan: 2, placeholder: 'What is the expected impact?' },
];

export default function ContingenciesPage() {
  const router = useRouter();
  const { data: contingencies, isLoading, error, refetch } = useContingencies();
  const { data: stats } = useContingencyStats();
  const triggerMutation = useTriggerContingency();
  const resolveMutation = useResolveContingency();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedContingency, setSelectedContingency] = useState<Contingency | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [triggerDialogOpen, setTriggerDialogOpen] = useState(false);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [contingencyToAction, setContingencyToAction] = useState<Contingency | null>(null);

  const filters: ListPageFilter[] = [
    { 
      key: 'status', 
      label: 'Status', 
      options: [
        { value: 'active', label: 'Active' },
        { value: 'triggered', label: 'Triggered' },
        { value: 'resolved', label: 'Resolved' },
        { value: 'archived', label: 'Archived' },
      ]
    },
    { 
      key: 'severity', 
      label: 'Severity', 
      options: [
        { value: 'critical', label: 'Critical' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
      ]
    },
    { 
      key: 'category', 
      label: 'Category', 
      options: Object.entries(categoryLabels).map(([value, label]) => ({ value, label }))
    },
  ];

  const rowActions: ListPageAction<Contingency>[] = [
    { 
      id: 'view', 
      label: 'View Details', 
      icon: <Eye className="size-4" />, 
      onClick: (row) => router.push(`/schedule/contingencies/${row.id}`) 
    },
    { 
      id: 'edit', 
      label: 'Edit', 
      icon: <Pencil className="size-4" />, 
      onClick: (row) => { setSelectedContingency(row); setDrawerOpen(true); } 
    },
    { 
      id: 'trigger', 
      label: 'Trigger', 
      icon: <Zap className="size-4" />, 
      variant: 'danger',
      onClick: (row) => { setContingencyToAction(row); setTriggerDialogOpen(true); },
      hidden: (row) => row.status !== 'active'
    },
    { 
      id: 'resolve', 
      label: 'Resolve', 
      icon: <CheckCircle className="size-4" />, 
      onClick: (row) => { setContingencyToAction(row); setResolveDialogOpen(true); },
      hidden: (row) => row.status !== 'triggered'
    },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await fetch('/api/schedule/contingencies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setCreateModalOpen(false);
    refetch();
  };

  const handleTrigger = async () => {
    if (contingencyToAction) {
      await triggerMutation.mutateAsync(contingencyToAction.id);
      setTriggerDialogOpen(false);
      setContingencyToAction(null);
      refetch();
    }
  };

  const handleResolve = async () => {
    if (contingencyToAction) {
      await resolveMutation.mutateAsync(contingencyToAction.id);
      setResolveDialogOpen(false);
      setContingencyToAction(null);
      refetch();
    }
  };

  const pageStats = [
    { label: 'Total Plans', value: stats?.total || 0 },
    { label: 'Active', value: stats?.active || 0 },
    { label: 'Triggered', value: stats?.triggered || 0 },
    { label: 'Critical', value: stats?.critical || 0 },
  ];

  const detailSections: DetailSection[] = selectedContingency ? [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Category</Body>
            <Body>{categoryLabels[selectedContingency.category] || selectedContingency.category}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Severity</Body>
            <Badge variant={severityColors[selectedContingency.severity] || 'ghost'}>
              {selectedContingency.severity.toUpperCase()}
            </Badge>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Status</Body>
            <Badge variant={statusColors[selectedContingency.status] || 'ghost'}>
              {selectedContingency.status.toUpperCase()}
            </Badge>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Owner</Body>
            <Body>{selectedContingency.owner ? `${selectedContingency.owner.first_name} ${selectedContingency.owner.last_name}` : 'Unassigned'}</Body>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'trigger',
      title: 'Trigger Condition',
      content: <Body>{selectedContingency.trigger_condition}</Body>,
    },
    {
      id: 'response',
      title: 'Response Plan',
      content: <Body>{selectedContingency.response_plan}</Body>,
    },
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<Contingency>
        title="Contingency Plans"
        subtitle="Manage emergency and backup plans"
        data={contingencies || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search contingencies..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => router.push(`/schedule/contingencies/${row.id}`)}
        createLabel="New Contingency"
        onCreate={() => setCreateModalOpen(true)}
        stats={pageStats}
        emptyMessage="No contingency plans yet"
        emptyAction={{ label: 'Create First Plan', onClick: () => setCreateModalOpen(true) }}
        quickActions={[
          { id: 'tasks', label: 'Tasks', icon: <CheckCircle className="size-4" />, onClick: () => router.push('/schedule/tasks') },
        ]}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/schedule/contingencies/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch();
          } else if (action === 'archive') {
            await fetch('/api/schedule/contingencies/bulk-archive', {
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
        title="Create Contingency Plan"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
        record={{ status: 'active', severity: 'medium', category: 'other' }}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedContingency}
        title={(c) => c.title}
        subtitle={(c) => categoryLabels[c.category] || c.category}
        sections={detailSections}
        onEdit={(c) => router.push(`/schedule/contingencies/${c.id}`)}
      />

      <ConfirmDialog
        open={triggerDialogOpen}
        title="Trigger Contingency"
        message={`Are you sure you want to trigger "${contingencyToAction?.title}"? This will notify all relevant parties and initiate the response plan.`}
        variant="danger"
        confirmLabel="Trigger"
        onConfirm={handleTrigger}
        onCancel={() => { setTriggerDialogOpen(false); setContingencyToAction(null); }}
      />

      <ConfirmDialog
        open={resolveDialogOpen}
        title="Resolve Contingency"
        message={`Mark "${contingencyToAction?.title}" as resolved?`}
        variant="default"
        confirmLabel="Resolve"
        onConfirm={handleResolve}
        onCancel={() => { setResolveDialogOpen(false); setContingencyToAction(null); }}
      />
    </AtlvsAppLayout>
  );
}
