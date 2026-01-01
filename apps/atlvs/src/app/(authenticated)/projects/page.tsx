'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, ClipboardList, Trash2, Archive, Download } from 'lucide-react';
// Layout provided by route group
import { 
  ListPage, RecordFormModal, DetailDrawer, ConfirmDialog, Grid, Body,
  type ListPageAction, type ListPageBulkAction, type DetailSection} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates, useAuthContext, ATLVS_ADMIN_ROLES, useEntityConfig } from '@ghxstship/config';
import { useProjects, useCreateProject, useDeleteProject } from '@/hooks/useProjects';

// Roles that can create/edit/delete projects

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

// SSOT: Columns, filters, and formFields are provided by useEntityConfig

export default function ProjectsPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const { data: projects, isLoading, error, refetch } = useProjects();
  const createProjectMutation = useCreateProject();
  const deleteProjectMutation = useDeleteProject();

  // SSOT: Get columns, filters, and formFields from entity registry
  const { columns, filters, formFields } = useEntityConfig<Project>({ entityName: 'projects' });
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // RBAC: Check if user has admin access for create/edit/delete operations
  const canManageProjects = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  // Build row actions based on user permissions
  const rowActions: ListPageAction<Project>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (row: Project) => { setSelectedProject(row); setDrawerOpen(true); } },
    // Only show edit/duplicate/delete for users with admin roles
    ...(canManageProjects ? [
      { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (row: Project) => router.push(`/projects/${row.id}/edit`) },
      { id: 'duplicate', label: 'Duplicate', icon: <ClipboardList className="size-4" />, onClick: async (row: Project) => {
        await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...row, id: undefined, name: `${row.name} (Copy)`, code: `${row.code}-COPY` }),
        });
        refetch();
      }},
      { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' as const, onClick: (row: Project) => { setProjectToDelete(row); setDeleteConfirmOpen(true); } },
    ] : []),
  ];

  // Build bulk actions based on user permissions
  const bulkActions: ListPageBulkAction[] = [
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    // Only show archive/delete for users with admin roles
    ...(canManageProjects ? [
      { id: 'archive', label: 'Archive', icon: <Archive className="size-4" /> },
      { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' as const },
    ] : []),
  ];

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    if (actionId === 'archive') {
      await Promise.all(selectedIds.map(id =>
        fetch(`/api/projects/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'archived' }),
        })
      ));
      refetch();
    } else if (actionId === 'export') {
      const selected = (projects || []).filter(p => selectedIds.includes(p.id));
      const csv = [
        ['ID', 'Name', 'Status', 'Budget', 'Start', 'End'].join(','),
        ...selected.map(p => [p.id, p.name, p.status, p.budget || '', p.start_date || '', p.end_date || ''].join(','))
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'projects-export.csv';
      a.click();
      URL.revokeObjectURL(url);
    } else if (actionId === 'delete') {
      await Promise.all(selectedIds.map(id => fetch(`/api/projects/${id}`, { method: 'DELETE' })));
      refetch();
    }
  };

  const handleCreate = async (data: Record<string, unknown>) => {
    // Generate a project code if not provided
    const projectCode = data.code 
      ? String(data.code) 
      : `PRJ-${Date.now().toString(36).toUpperCase()}`;
    
    await createProjectMutation.mutateAsync({
      code: projectCode,
      name: String(data.name || ''),
      organization_id: '', // Will be set by RLS policy based on user's org
      status: (data.status as 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled') || 'planning',
      budget: data.budget ? Number(data.budget) : undefined,
      start_date: String(data.start_date || new Date().toISOString()),
      end_date: data.end_date ? String(data.end_date) : undefined,
      client_id: data.client_id ? String(data.client_id) : undefined,
      manager_id: data.manager_id ? String(data.manager_id) : undefined,
      description: data.description ? String(data.description) : undefined,
    });
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

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Omit<Project, 'id'>>({
    entityType: 'projects',
    requiredFields: ['name'],
    onImport: async (records) => {
      for (const record of records) {
        await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
      }
      refetch();
    },
  });

  const importTemplates = getImportTemplates('projects').length > 0 
    ? getImportTemplates('projects') 
    : [{ id: 'default', name: 'Project Import', mapping: { name: 'name', code: 'code', status: 'status', budget: 'budget', start_date: 'start_date', end_date: 'end_date' } }];

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
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Body size="sm"><strong>Code:</strong> {selectedProject.code || '—'}</Body>
          <Body size="sm"><strong>Status:</strong> {selectedProject.status}</Body>
          <Body size="sm"><strong>Phase:</strong> {selectedProject.phase || '—'}</Body>
          <Body size="sm"><strong>Budget:</strong> {selectedProject.budget ? `$${selectedProject.budget.toLocaleString()}` : '—'}</Body>
        </Grid>
      ),
    },
    {
      id: 'dates',
      title: 'Timeline',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Body size="sm"><strong>Start:</strong> {selectedProject.start_date ? new Date(selectedProject.start_date).toLocaleDateString() : '—'}</Body>
          <Body size="sm"><strong>End:</strong> {selectedProject.end_date ? new Date(selectedProject.end_date).toLocaleDateString() : '—'}</Body>
        </Grid>
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
        onCreate={canManageProjects ? () => setCreateModalOpen(true) : undefined}
        entityType="projects"
        onImport={canManageProjects ? handleImport : undefined}
        importTemplates={importTemplates}
        importSampleFields={['name', 'code', 'status', 'budget', 'start_date', 'end_date']}
        templateDownloadUrl="/templates/production-planning/event-timeline-template.csv"
        onExport={createExportHandler({
          filename: "projects",
          getData: () => (projects || []).map(p => ({
            id: p.id,
            name: p.name,
            status: p.status,
            budget: p.budget || '',
            start_date: p.start_date || '',
            end_date: p.end_date || '',
          })),
        })}
        stats={stats}
        emptyMessage="No projects yet"
        emptyAction={canManageProjects ? { label: 'Create Project', onClick: () => setCreateModalOpen(true) } : undefined}
enableCapabilityDetection
        onScanAction={(capability, route) => router.push(route)}
        capabilityBasePath=""
        showFavorite
        showSettings
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
