'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Edit, Users, Trash2, Download } from 'lucide-react';
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
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';
import { createExportHandler } from '@ghxstship/config';
import { useProjects, type Project } from '../../../hooks/useProjects';
// Layout provided by route group

export default function ProjectsPage() {
  const router = useRouter();
  const { data: projects = [], isLoading, error, refetch } = useProjects({});
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const columns: ListPageColumn<Project>[] = [
    { key: 'name', label: 'Name', accessor: 'name', sortable: true },
    { 
      key: 'code', 
      label: 'Code', 
      accessor: 'code',
      render: (value) => <Badge variant="outline">{String(value)}</Badge>
    },
    { 
      key: 'phase', 
      label: 'Phase', 
      accessor: 'phase', 
      sortable: true,
      render: (value) => <Badge variant="solid">{String(value)}</Badge>
    },
    { 
      key: 'status', 
      label: 'Status', 
      accessor: 'status', 
      sortable: true,
      render: (value) => {
        const variant = value === 'active' ? 'success' : value === 'planning' ? 'info' : value === 'completed' ? 'outline' : 'warning';
        return <Badge variant={variant}>{String(value).toUpperCase()}</Badge>;
      }
    },
    { 
      key: 'budget', 
      label: 'Budget', 
      accessor: 'budget', 
      sortable: true,
      render: (value) => `$${Number(value || 0).toLocaleString()}`
    },
    { 
      key: 'crew_count', 
      label: 'Crew', 
      accessor: 'crew_count',
      render: (value) => value ? `${value} assigned` : '-'
    },
    { 
      key: 'start_date', 
      label: 'Start Date', 
      accessor: 'start_date', 
      sortable: true,
      render: (value) => value ? new Date(String(value)).toLocaleDateString() : '-'
    },
    { 
      key: 'event_date', 
      label: 'Event Date', 
      accessor: 'event_date', 
      sortable: true,
      render: (value) => value ? new Date(String(value)).toLocaleDateString() : '-'
    },
  ];

  const filters: ListPageFilter[] = [
    { 
      key: 'status', 
      label: 'Status', 
      options: [
        { value: 'planning', label: 'Planning' },
        { value: 'active', label: 'Active' },
        { value: 'completed', label: 'Completed' },
      ]
    },
    { 
      key: 'phase', 
      label: 'Phase', 
      options: [
        { value: 'pre-production', label: 'Pre-Production' },
        { value: 'production', label: 'Production' },
        { value: 'post-production', label: 'Post-Production' },
      ]
    },
  ];

  const formFields: FormFieldConfig[] = [
    { name: 'name', label: 'Project Name', type: 'text', required: true },
    { name: 'code', label: 'Project Code', type: 'text', required: true },
    { name: 'phase', label: 'Phase', type: 'select', required: true, options: [
      { value: 'pre-production', label: 'Pre-Production' },
      { value: 'production', label: 'Production' },
      { value: 'post-production', label: 'Post-Production' },
    ]},
    { name: 'budget', label: 'Budget ($)', type: 'number' },
    { name: 'start_date', label: 'Start Date', type: 'date' },
    { name: 'event_date', label: 'Event Date', type: 'date' },
    { name: 'description', label: 'Description', type: 'textarea' },
  ];

  const rowActions: ListPageAction<Project>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedProject(row); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Edit className="size-4" />, onClick: (row) => router.push(`/projects/${row.id}`) },
    { id: 'assign', label: 'Assign Crew', icon: <Users className="size-4" />, onClick: (row) => router.push(`/crew/assign?projectId=${row.id}`) },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (row) => { setSelectedProject(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' },
  ];

  const handleCreate = async () => {
    setCreateModalOpen(false);
    refetch();
  };

  const handleDelete = async () => {
    setDeleteConfirmOpen(false);
    setSelectedProject(null);
    refetch();
  };

  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

  const stats = [
    { label: 'Total Projects', value: projects.length },
    { label: 'Total Budget', value: `$${(totalBudget / 1000000).toFixed(1)}M` },
    { label: 'Active Projects', value: projects.filter(p => p.status === 'active').length },
  ];

  const detailSections: DetailSection[] = selectedProject ? [
    {
      id: 'overview',
      title: 'Project Details',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Body size="sm"><strong>Name:</strong> {selectedProject.name}</Body>
          <Body size="sm"><strong>Code:</strong> {selectedProject.code}</Body>
          <Body size="sm"><strong>Phase:</strong> {selectedProject.phase}</Body>
          <Body size="sm"><strong>Status:</strong> {selectedProject.status}</Body>
          <Body size="sm"><strong>Budget:</strong> ${(selectedProject.budget || 0).toLocaleString()}</Body>
          <Body size="sm"><strong>Crew:</strong> {selectedProject.crew_count || 0} assigned</Body>
          <Body size="sm"><strong>Start Date:</strong> {selectedProject.start_date ? new Date(selectedProject.start_date).toLocaleDateString() : '-'}</Body>
          <Body size="sm"><strong>Event Date:</strong> {selectedProject.event_date ? new Date(selectedProject.event_date).toLocaleDateString() : '-'}</Body>
        </Grid>
      ),
    },
  ] : [];

  return (
    <>
      <ListPage<Project>
        title="Projects"
        subtitle="Manage production projects and events"
        data={projects}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search projects..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={async (actionId, selectedIds) => {
          if (actionId === 'export') {
            const selected = projects.filter(p => selectedIds.includes(p.id));
            const csv = [
              ['Name', 'Code', 'Phase', 'Status', 'Budget', 'Crew', 'Start Date', 'Event Date'].join(','),
              ...selected.map(p => [p.name, p.code, p.phase, p.status, p.budget, p.crew_count, p.start_date, p.event_date].join(','))
            ].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'projects-export.csv';
            a.click();
            URL.revokeObjectURL(url);
          }
        }}
        onRowClick={(row) => { setSelectedProject(row); setDrawerOpen(true); }}
        createLabel="New Project"
        onCreate={() => setCreateModalOpen(true)}
        entityType="projects"
        onExport={createExportHandler({
          filename: "projects",
          getData: () => projects.map(p => ({
            name: p.name,
            code: p.code,
            phase: p.phase,
            status: p.status,
            budget: p.budget,
            crew_count: p.crew_count,
            start_date: p.start_date,
            event_date: p.event_date,
          })),
        })}
        stats={stats}
        emptyMessage="No projects found"
        emptyAction={{ label: 'Create Project', onClick: () => setCreateModalOpen(true) }}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="New Project"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedProject}
        title={(p) => p.name}
        subtitle={(p) => `${p.code} • ${p.phase}`}
        sections={detailSections}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone."
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setSelectedProject(null); }}
      />
    </>
  );
}
