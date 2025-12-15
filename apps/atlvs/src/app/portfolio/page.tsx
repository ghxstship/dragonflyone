"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Star, FileText, Trash2 } from "lucide-react";
import { AtlvsAppLayout } from "../../components/app-layout";
import {
  ListPage,
  Badge,
  DetailDrawer,
  RecordFormModal,
  ConfirmDialog,
  Grid,
  Stack,
  Body,
  useNotifications,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
  type FormFieldConfig,
} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';
import { usePortfolioItems, useCreatePortfolioItem, useDeletePortfolioItem, useTogglePortfolioItemFeatured, type PortfolioItem } from '@/hooks/usePortfolio';
import { DEMO_PORTFOLIO_PROJECTS } from '../../lib/demo-data';

// Transform demo data to match PortfolioItem schema
const demoPortfolioItems = DEMO_PORTFOLIO_PROJECTS.map(p => ({
  id: p.id,
  portfolio_id: 'demo',
  item_type: p.category || 'project',
  title: p.name,
  description: p.highlights?.join(', ') || '',
  client_name: p.client,
  date_completed: p.date,
  tags: ['Full Production', 'Audio', 'Lighting', 'Video'],
  display_order: 0,
  is_featured: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  // Additional fields for display
  location: p.location,
  metrics: p.metrics,
})) as (PortfolioItem & { location?: string; metrics?: { label: string; value: string }[] })[];


// Extended type for display with extra fields from demo data
type DisplayItem = PortfolioItem & { location?: string; metrics?: { label: string; value: string }[] };

const columns: ListPageColumn<DisplayItem>[] = [
  { key: 'title', label: 'Project', accessor: 'title', sortable: true },
  { key: 'client_name', label: 'Client', accessor: 'client_name', sortable: true },
  { key: 'item_type', label: 'Category', accessor: 'item_type', sortable: true, render: (v) => <Badge variant="outline">{String(v).toUpperCase()}</Badge> },
  { key: 'date_completed', label: 'Date', accessor: (r) => r.date_completed ? new Date(r.date_completed).toLocaleDateString() : '—', sortable: true },
  { key: 'tags', label: 'Services', accessor: (r) => (r.tags || []).slice(0, 2).join(', ') + ((r.tags?.length || 0) > 2 ? ` +${(r.tags?.length || 0) - 2}` : '') },
  { key: 'is_featured', label: 'Featured', accessor: 'is_featured', render: (v) => v ? <Badge variant="solid">FEATURED</Badge> : <Badge variant="ghost">—</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'item_type', label: 'Category', options: [
    { value: 'Festival', label: 'Festival' },
    { value: 'Corporate', label: 'Corporate' },
    { value: 'Tour', label: 'Tour' },
    { value: 'Concert', label: 'Concert' },
    { value: 'Private', label: 'Private' },
  ]},
  { key: 'is_featured', label: 'Featured', options: [
    { value: 'true', label: 'Featured Only' },
    { value: 'false', label: 'Non-Featured' },
  ]},
];

const formFields: FormFieldConfig[] = [
  { name: 'title', label: 'Project Title', type: 'text', required: true, colSpan: 2 },
  { name: 'client_name', label: 'Client', type: 'text', required: true },
  { name: 'item_type', label: 'Category', type: 'select', required: true, options: [
    { value: 'Festival', label: 'Festival' },
    { value: 'Corporate', label: 'Corporate' },
    { value: 'Tour', label: 'Tour' },
    { value: 'Concert', label: 'Concert' },
    { value: 'Private', label: 'Private' },
  ]},
  { name: 'date_completed', label: 'Date Completed', type: 'date' },
  { name: 'is_featured', label: 'Featured', type: 'checkbox' },
  { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
];

export default function PortfolioPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const { data: portfolioData, isLoading, error, refetch } = usePortfolioItems();
  const createMutation = useCreatePortfolioItem();
  const deleteMutation = useDeletePortfolioItem();
  const toggleFeaturedMutation = useTogglePortfolioItemFeatured();

  // Fallback to demo data if API returns empty
  const projects: DisplayItem[] = (portfolioData && portfolioData.length > 0) 
    ? portfolioData as DisplayItem[]
    : demoPortfolioItems;

  const [selectedProject, setSelectedProject] = useState<DisplayItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<DisplayItem | null>(null);

  const featuredCount = projects.filter(p => p.is_featured).length;

  const rowActions: ListPageAction<DisplayItem>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedProject(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/portfolio/${r.id}/edit`) },
    { id: 'feature', label: 'Toggle Featured', icon: <Star className="size-4" />, onClick: async (r) => {
      try {
        await toggleFeaturedMutation.mutateAsync({ id: r.id, is_featured: !r.is_featured });
        addNotification({ type: 'success', title: 'Updated', message: `Project ${r.is_featured ? 'unfeatured' : 'featured'}.` });
      } catch (err) {
        addNotification({ type: 'error', title: 'Error', message: err instanceof Error ? err.message : 'Failed to update' });
      }
    }},
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (r) => { setProjectToDelete(r); setDeleteConfirmOpen(true); } },
  ];

  const stats = [
    { label: 'Total Projects', value: projects.length },
    { label: 'Featured', value: featuredCount },
    { label: 'Total Attendance', value: '600K+' },
    { label: 'Client Satisfaction', value: '98%' },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createMutation.mutateAsync({
        portfolio_id: String(data.portfolio_id || 'default'),
        item_type: String(data.item_type || 'project'),
        title: String(data.title || ''),
        description: data.description ? String(data.description) : undefined,
        client_name: data.client_name ? String(data.client_name) : undefined,
        date_completed: data.date_completed ? String(data.date_completed) : undefined,
        is_featured: Boolean(data.is_featured),
      });
      setCreateModalOpen(false);
      addNotification({ type: 'success', title: 'Project Created', message: 'Portfolio project has been created.' });
    } catch (err) {
      addNotification({ type: 'error', title: 'Error', message: err instanceof Error ? err.message : 'Failed to create project' });
    }
  };

  const handleDelete = async () => {
    if (projectToDelete) {
      try {
        await deleteMutation.mutateAsync(projectToDelete.id);
        setDeleteConfirmOpen(false);
        setProjectToDelete(null);
        addNotification({ type: 'success', title: 'Project Deleted', message: 'Portfolio project has been deleted.' });
      } catch (err) {
        addNotification({ type: 'error', title: 'Error', message: err instanceof Error ? err.message : 'Failed to delete project' });
      }
    }
  };

  const detailSections: DetailSection[] = selectedProject ? [
    { id: 'overview', title: 'Project Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Title:</strong> {selectedProject.title}</Body>
        <Body size="sm"><strong>Client:</strong> {selectedProject.client_name || '—'}</Body>
        <Body size="sm"><strong>Category:</strong> {selectedProject.item_type}</Body>
        <Body size="sm"><strong>Date:</strong> {selectedProject.date_completed ? new Date(selectedProject.date_completed).toLocaleDateString() : '—'}</Body>
        <Body size="sm"><strong>Featured:</strong> {selectedProject.is_featured ? 'Yes' : 'No'}</Body>
        {selectedProject.description && <Body size="sm" className="col-span-2"><strong>Description:</strong> {selectedProject.description}</Body>}
        {selectedProject.tags && <Body size="sm" className="col-span-2"><strong>Services:</strong> {selectedProject.tags.join(', ')}</Body>}
      </Grid>
    )},
    ...(selectedProject.metrics ? [{ id: 'metrics', title: 'Key Metrics', content: (
      <Grid cols={3} gap={4}>
        {selectedProject.metrics.map((m: { label: string; value: string }, idx: number) => (
          <Stack key={idx} className="text-center">
            <Body className="font-mono text-body-lg">{m.value}</Body>
            <Body size="sm" className="text-grey-400">{m.label}</Body>
          </Stack>
        ))}
      </Grid>
    )}] : []),
  ] : [];

  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'portfolio',
    requiredFields: ['title', 'item_type'],
    onImport: async (records) => {
      for (const record of records) {
        await fetch('/api/portfolio-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ portfolio_id: 'default', ...record }),
        });
      }
      refetch();
    },
  });

  const importTemplates = getImportTemplates('portfolio');

  return (
    <AtlvsAppLayout>
      <ListPage<DisplayItem>
        title="Portfolio"
        subtitle="Showcasing our past work and successful productions"
        data={projects}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error ? new Error(error.message) : undefined}
        searchPlaceholder="Search projects..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedProject(r); setDrawerOpen(true); }}
        createLabel="Add Project"
        onCreate={() => setCreateModalOpen(true)}
        entityType="portfolio"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['title', 'item_type', 'client_name', 'date_completed']}
        onExport={createExportHandler({
          filename: "portfolio",
          getData: () => projects.map(p => ({
            id: p.id,
            title: p.title,
            client: p.client_name || '',
            category: p.item_type,
            date: p.date_completed || '',
            featured: p.is_featured,
            tags: (p.tags || []).join(', '),
          })),
        })}
        exportFormats={["csv", "json"]}
        stats={stats}
        emptyMessage="No portfolio projects found"
        emptyAction={{ label: 'Add Project', onClick: () => setCreateModalOpen(true) }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            for (const id of ids) {
              await deleteMutation.mutateAsync(id);
            }
          } else if (action === 'feature') {
            for (const id of ids) {
              await toggleFeaturedMutation.mutateAsync({ id, is_featured: true });
            }
          }
        }}
        bulkActions={[
          { id: 'feature', label: 'Feature Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Add Portfolio Project"
        fields={formFields}
        onSubmit={handleCreate}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setProjectToDelete(null); }}
      />

      {selectedProject && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedProject}
          title={(p) => p.title}
          subtitle={(p) => `${p.client_name || 'Unknown'} • ${p.item_type}`}
          sections={detailSections}
          onEdit={(p) => router.push(`/portfolio/${p.id}/edit`)}
          actions={[
            { id: 'feature', label: selectedProject.is_featured ? 'Remove Featured' : 'Mark Featured', icon: <Star className="size-4" /> },
            { id: 'pdf', label: 'Download PDF', icon: <FileText className="size-4" /> },
          ]}
          onAction={async (id, p) => {
            if (id === 'feature') {
              await toggleFeaturedMutation.mutateAsync({ id: p.id, is_featured: !p.is_featured });
            }
            if (id === 'pdf') window.open(`/api/portfolio/${p.id}/pdf`, '_blank');
            setDrawerOpen(false);
          }}
        />
      )}
    </AtlvsAppLayout>
  );
}
