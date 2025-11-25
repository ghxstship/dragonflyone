'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../components/navigation';
import { 
  ListPage, 
  Badge, 
  RecordFormModal, 
  DetailDrawer, 
  ConfirmDialog,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';
import { useProjects, useCreateProject, useDeleteProject } from '@/hooks/useProjects';

interface Project {
  id: string;
  name: string;
  code?: string;
  status: string;
  phase?: string;
  budget?: number;
  client_id?: string;
  manager_id?: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
}

const columns: ListPageColumn<Project>[] = [
  { key: 'code', label: 'Code', accessor: 'code', sortable: true, width: '100px' },
  { key: 'name', label: 'Project Name', accessor: 'name', sortable: true },
  { 
    key: 'status', 
    label: 'Status', 
    accessor: 'status', 
    sortable: true,
    render: (value) => <Badge>{String(value || 'Active').toUpperCase()}</Badge>
  },
  { key: 'phase', label: 'Phase', accessor: 'phase', sortable: true },
  { 
    key: 'budget', 
    label: 'Budget', 
    accessor: 'budget', 
    sortable: true,
    render: (value) => value ? `$${Number(value).toLocaleString()}` : '—'
  },
  {
    key: 'start_date',
    label: 'Start Date',
    accessor: 'start_date',
    sortable: true,
    render: (value) => value ? new Date(String(value)).toLocaleDateString() : '—'
  },
];

const filters: ListPageFilter[] = [
  { 
    key: 'status', 
    label: 'Status', 
    options: [
      { value: 'active', label: 'Active' },
      { value: 'planning', label: 'Planning' },
      { value: 'on_hold', label: 'On Hold' },
      { value: 'completed', label: 'Completed' },
    ]
  },
  {
    key: 'phase',
    label: 'Phase',
    options: [
      { value: 'pre_production', label: 'Pre-Production' },
      { value: 'production', label: 'Production' },
      { value: 'post_production', label: 'Post-Production' },
      { value: 'wrap', label: 'Wrap' },
    ]
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Project Name', type: 'text', required: true, placeholder: 'Enter project name', colSpan: 2 },
  { name: 'code', label: 'Project Code', type: 'text', placeholder: 'e.g., PRJ-001' },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'planning', label: 'Planning' },
    { value: 'active', label: 'Active' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
  ]},
  { name: 'phase', label: 'Phase', type: 'select', options: [
    { value: 'pre_production', label: 'Pre-Production' },
    { value: 'production', label: 'Production' },
    { value: 'post_production', label: 'Post-Production' },
    { value: 'wrap', label: 'Wrap' },
  ]},
  { name: 'budget', label: 'Budget', type: 'number', placeholder: '0.00' },
  { name: 'start_date', label: 'Start Date', type: 'date' },
  { name: 'end_date', label: 'End Date', type: 'date' },
];

export default function ProjectsPage() {
  const router = useRouter();
  const { data: projects, isLoading, error, refetch } = useProjects();
  const createProjectMutation = useCreateProject();
  const deleteProjectMutation = useDeleteProject();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const rowActions: ListPageAction<Project>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (row) => { setSelectedProject(row); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (row) => router.push(`/projects/${row.id}/edit`) },
    { id: 'duplicate', label: 'Duplicate', icon: '📋', onClick: (row) => console.log('Duplicate', row.id) },
    { id: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', onClick: (row) => { setProjectToDelete(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'archive', label: 'Archive', icon: '📦' },
    { id: 'export', label: 'Export', icon: '⬇️' },
    { id: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger' },
  ];

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    console.log('Bulk action:', actionId, selectedIds);
    // Implement bulk actions
  };

  const handleCreate = async (data: Record<string, unknown>) => {
    await createProjectMutation.mutateAsync(data as any);
    setCreateModalOpen(false);
    refetch();
  };

  const handleDelete = async () => {
    if (projectToDelete) {
      await deleteProjectMutation.mutateAsync(projectToDelete.id);
      setDeleteConfirmOpen(false);
      setProjectToDelete(null);
      refetch();
    }
  };

  const stats = [
    { label: 'Total Projects', value: projects?.length || 0 },
    { label: 'Active', value: projects?.filter(p => p.status === 'active').length || 0 },
    { label: 'Planning', value: projects?.filter(p => p.status === 'planning').length || 0 },
    { label: 'Completed', value: projects?.filter(p => p.status === 'completed').length || 0 },
  ];

  const detailSections: DetailSection[] = selectedProject ? [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div><strong>Code:</strong> {selectedProject.code || '—'}</div>
          <div><strong>Status:</strong> {selectedProject.status}</div>
          <div><strong>Phase:</strong> {selectedProject.phase || '—'}</div>
          <div><strong>Budget:</strong> {selectedProject.budget ? `$${selectedProject.budget.toLocaleString()}` : '—'}</div>
        </div>
      ),
    },
    {
      id: 'dates',
      title: 'Timeline',
      content: (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div><strong>Start:</strong> {selectedProject.start_date ? new Date(selectedProject.start_date).toLocaleDateString() : '—'}</div>
          <div><strong>End:</strong> {selectedProject.end_date ? new Date(selectedProject.end_date).toLocaleDateString() : '—'}</div>
        </div>
      ),
    },
  ] : [];

  return (
    <>
      <ListPage<Project>
        title="Projects"
        subtitle="Manage production projects and track progress"
        data={projects || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search projects..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
        onRowClick={(row) => { setSelectedProject(row); setDrawerOpen(true); }}
        createLabel="New Project"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => console.log('Export projects')}
        stats={stats}
        emptyMessage="No projects yet"
        emptyAction={{ label: 'Create Project', onClick: () => setCreateModalOpen(true) }}
        header={<Navigation />}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create Project"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedProject}
        title={(p) => p.name}
        subtitle={(p) => p.code || 'No code'}
        sections={detailSections}
        onEdit={(p) => router.push(`/projects/${p.id}/edit`)}
        onDelete={(p) => { setProjectToDelete(p); setDeleteConfirmOpen(true); setDrawerOpen(false); }}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.name}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setProjectToDelete(null); }}
      />
    </>
  );
}
