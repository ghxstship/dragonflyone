'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Key, Mail, Download, Trash2 } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
  type ListPageBulkAction,
} from '@ghxstship/ui';
import { getBadgeVariant, createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';
import { useStakeholdersData, type Stakeholder } from '@/hooks/useStakeholders';

const getPermissionVariant = (level: string): 'solid' | 'outline' | 'ghost' => {
  switch (level) {
    case 'admin': return 'solid';
    case 'edit': return 'solid';
    case 'comment': return 'outline';
    default: return 'ghost';
  }
};

const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<Stakeholder>[] = [
  { key: 'name', label: 'Name', accessor: 'name', sortable: true },
  { key: 'organization', label: 'Organization', accessor: 'organization' },
  { key: 'role', label: 'Role', accessor: 'role' },
  { key: 'permission_level', label: 'Access', accessor: 'permission_level', render: (v) => <Badge variant={getPermissionVariant(String(v))}>{String(v).toUpperCase()}</Badge> },
  { key: 'projects', label: 'Projects', accessor: (r) => r.projects?.length || 0 },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
  { key: 'last_activity', label: 'Last Active', accessor: (r) => r.last_activity ? new Date(r.last_activity).toLocaleDateString() : 'Never' },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'active', label: 'Active' }, { value: 'invited', label: 'Invited' }, { value: 'inactive', label: 'Inactive' }] },
  { key: 'permission_level', label: 'Access', options: [{ value: 'view', label: 'View' }, { value: 'comment', label: 'Comment' }, { value: 'edit', label: 'Edit' }, { value: 'admin', label: 'Admin' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'text', required: true },
  { name: 'organization', label: 'Organization', type: 'text' },
  { name: 'role', label: 'Role', type: 'text', placeholder: 'e.g., Client, Partner, Investor' },
  { name: 'permission_level', label: 'Permission Level', type: 'select', options: [{ value: 'view', label: 'View Only' }, { value: 'comment', label: 'Can Comment' }, { value: 'edit', label: 'Can Edit' }, { value: 'admin', label: 'Admin' }] },
];

export default function StakeholdersPage() {
  const router = useRouter();
  const {
    stakeholders,
    activeCount,
    isLoading: loading,
    error,
    createStakeholder,
    refetch,
  } = useStakeholdersData();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createStakeholder(data);
      setCreateModalOpen(false);
    } catch {
      // Error handled in hook
    }
  };

  const invitedCount = stakeholders.filter((s: Stakeholder) => s.status === 'invited').length;

  const rowActions: ListPageAction<Stakeholder>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedStakeholder(r); setDrawerOpen(true); } },
    { id: 'manage', label: 'Manage Access', icon: <Key className="size-4" />, onClick: (r) => router.push(`/stakeholders/${r.id}/access`) },
  ];

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'stakeholders',
    requiredFields: ['name', 'email'],
    onImport: async (records) => {
      for (const record of records) {
        await createStakeholder(record);
      }
      refetch();
    },
  });

  const importTemplates = getImportTemplates('stakeholders').length > 0 
    ? getImportTemplates('stakeholders') 
    : [{ id: 'default', name: 'Stakeholder Import', mapping: { name: 'name', email: 'email', role: 'role', organization: 'organization', permission_level: 'permission_level' } }];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    { id: 'email', label: 'Send Email', icon: <Mail className="size-4" /> },
    { id: 'delete', label: 'Remove', icon: <Trash2 className="size-4" />, variant: 'danger' },
  ];

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    if (actionId === 'delete') {
      setStakeholders(prev => prev.filter(s => !selectedIds.includes(s.id)));
    } else if (actionId === 'email') {
      const emails = stakeholders.filter(s => selectedIds.includes(s.id)).map(s => s.email).join(',');
      window.location.href = `mailto:${emails}`;
    }
  };

  const stats = [
    { label: 'Total Stakeholders', value: stakeholders.length },
    { label: 'Active', value: activeCount },
    { label: 'Pending Invites', value: invitedCount },
    { label: 'Projects', value: new Set(stakeholders.flatMap(s => s.projects)).size },
  ];

  const detailSections: DetailSection[] = selectedStakeholder ? [
    { id: 'overview', title: 'Stakeholder Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Name:</strong> {selectedStakeholder.name}</Body>
        <Body size="sm"><strong>Email:</strong> {selectedStakeholder.email}</Body>
        <Body size="sm"><strong>Organization:</strong> {selectedStakeholder.organization}</Body>
        <Body size="sm"><strong>Role:</strong> {selectedStakeholder.role}</Body>
        <Body size="sm"><strong>Access Level:</strong> {selectedStakeholder.permission_level}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedStakeholder.status}</Body>
        <Body size="sm"><strong>Projects:</strong> {selectedStakeholder.projects?.length || 0}</Body>
        <Body size="sm"><strong>Last Active:</strong> {selectedStakeholder.last_activity ? new Date(selectedStakeholder.last_activity).toLocaleDateString() : 'Never'}</Body>
      </Grid>
    )},
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<Stakeholder>
        title="Stakeholder Hub"
        subtitle="Manage stakeholder access and communications"
        data={stakeholders}
        columns={columns}
        rowKey="id"
        loading={loading}
        error={error ? new Error(error) : undefined}
        onRetry={fetchData}
        searchPlaceholder="Search stakeholders..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
        onRowClick={(r) => { setSelectedStakeholder(r); setDrawerOpen(true); }}
        createLabel="Invite Stakeholder"
        onCreate={() => setCreateModalOpen(true)}
        entityType="stakeholders"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['name', 'email', 'role', 'organization', 'permission_level']}
        onExport={createExportHandler({
          filename: "stakeholders",
          getData: () => stakeholders.map(s => ({
            id: s.id,
            name: s.name,
            email: s.email,
            role: s.role,
            organization: s.organization || '',
            status: s.status,
            projects: s.projects?.join(', ') || '',
          })),
        })}
        exportFormats={["csv", "json"]}
        stats={stats}
        emptyMessage="No stakeholders found"
        emptyAction={{ label: 'Invite Stakeholder', onClick: () => setCreateModalOpen(true) }}
showFavorite
        showSettings
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Invite Stakeholder"
        mode="create"
        fields={formFields}
        onSubmit={handleCreate}
      />

      {selectedStakeholder && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedStakeholder}
          title={(s) => s.name}
          subtitle={(s) => `${s.organization} • ${s.role}`}
          sections={detailSections}
          actions={[
            { id: 'manage', label: 'Manage Access', icon: <Key className="size-4" /> },
            { id: 'message', label: 'Send Message', icon: <Mail className="size-4" /> },
          ]}
          onAction={(id, s) => {
            if (id === 'manage') router.push(`/stakeholders/${s.id}/access`);
            if (id === 'message') window.location.href = `mailto:${s.email}`;
            setDrawerOpen(false);
          }}
        />
      )}
    </AtlvsAppLayout>
  );
}
