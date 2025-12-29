'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, CheckCircle, BookOpen, FolderOpen } from 'lucide-react';
// Layout provided by route group
import { useSOPs, useSOPStats, useSOPCategories } from '../../hooks/useSOPs';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  Grid,
  Stack,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';
import { createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';

interface SOP {
  id: string;
  title: string;
  description?: string;
  version: string;
  status: string;
  effective_date?: string;
  requires_acknowledgment: boolean;
  requires_training: boolean;
  category?: { id: string; name: string; color?: string };
  owner?: { id: string; first_name: string; last_name: string };
}

const statusColors: Record<string, 'success' | 'warning' | 'error' | 'info' | 'ghost'> = {
  approved: 'success',
  review: 'warning',
  draft: 'ghost',
  archived: 'error',
};

const columns: ListPageColumn<SOP>[] = [
  { 
    key: 'title', 
    label: 'Title', 
    accessor: 'title', 
    sortable: true,
  },
  { 
    key: 'category', 
    label: 'Category', 
    accessor: (row) => row.category?.name || '—',
    sortable: true,
    render: (_, row) => row.category ? (
      <Badge color={row.category.color || '#6b7280'}>
        {row.category.name}
      </Badge>
    ) : '—'
  },
  { 
    key: 'version', 
    label: 'Version', 
    accessor: 'version', 
    sortable: true,
    width: '100px',
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
  { 
    key: 'requires_acknowledgment', 
    label: 'Acknowledgment', 
    accessor: 'requires_acknowledgment', 
    render: (value) => value ? (
      <Badge variant="info">Required</Badge>
    ) : '—'
  },
  { 
    key: 'requires_training', 
    label: 'Training', 
    accessor: 'requires_training', 
    render: (value) => value ? (
      <Badge variant="warning">Required</Badge>
    ) : '—'
  },
  {
    key: 'effective_date',
    label: 'Effective',
    accessor: 'effective_date',
    sortable: true,
    render: (value) => value ? new Date(String(value)).toLocaleDateString() : '—'
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'title', label: 'SOP Title', type: 'text', required: true, placeholder: 'e.g., Emergency Evacuation Procedure', colSpan: 2 },
  { name: 'category_id', label: 'Category', type: 'select', required: true, options: [] }, // Populated dynamically
  { name: 'version', label: 'Version', type: 'text', required: true, placeholder: '1.0' },
  { name: 'status', label: 'Status', type: 'select', required: true, options: [
    { value: 'draft', label: 'Draft' },
    { value: 'review', label: 'Under Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'archived', label: 'Archived' },
  ]},
  { name: 'effective_date', label: 'Effective Date', type: 'date' },
  { name: 'description', label: 'Description', type: 'textarea', colSpan: 2, placeholder: 'Describe this SOP...' },
  { name: 'requires_acknowledgment', label: 'Requires Acknowledgment', type: 'checkbox' },
  { name: 'requires_training', label: 'Requires Training', type: 'checkbox' },
  { name: 'training_duration_minutes', label: 'Training Duration (minutes)', type: 'number', placeholder: '30' },
];

export default function SOPsPage() {
  const router = useRouter();
  const { data: sops, isLoading, error, refetch } = useSOPs();
  const { data: stats } = useSOPStats();
  const { data: categories } = useSOPCategories();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedSOP, setSelectedSOP] = useState<SOP | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Update form fields with categories
  const dynamicFormFields = formFields.map(field => {
    if (field.name === 'category_id') {
      return {
        ...field,
        options: categories?.map(c => ({ value: c.id, label: c.name })) || [],
      };
    }
    return field;
  });

  const filters: ListPageFilter[] = [
    { 
      key: 'status', 
      label: 'Status', 
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'review', label: 'Under Review' },
        { value: 'approved', label: 'Approved' },
        { value: 'archived', label: 'Archived' },
      ]
    },
    { 
      key: 'category_id', 
      label: 'Category', 
      options: categories?.map(c => ({ value: c.id, label: c.name })) || []
    },
  ];

  const rowActions: ListPageAction<SOP>[] = [
    { 
      id: 'view', 
      label: 'View SOP', 
      icon: <Eye className="size-4" />, 
      onClick: (row) => router.push(`/sops/${row.id}`) 
    },
    { 
      id: 'edit', 
      label: 'Edit', 
      icon: <Pencil className="size-4" />, 
      onClick: (row) => { setSelectedSOP(row); setDrawerOpen(true); } 
    },
    { 
      id: 'acknowledge', 
      label: 'View Acknowledgments', 
      icon: <CheckCircle className="size-4" />, 
      onClick: (row) => router.push(`/sops/acknowledgments?sop=${row.id}`) 
    },
    { 
      id: 'training', 
      label: 'Training Records', 
      icon: <BookOpen className="size-4" />, 
      onClick: (row) => router.push(`/sops/training?sop=${row.id}`) 
    },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await fetch('/api/sops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setCreateModalOpen(false);
    refetch();
  };

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'sops',
    requiredFields: ['title', 'version'],
    onImport: async (records) => {
      for (const record of records) {
        await fetch('/api/sops', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
      }
      refetch();
    },
  });

  const importTemplates = getImportTemplates('sops').length > 0 
    ? getImportTemplates('sops') 
    : [{ id: 'default', name: 'SOP Import', mapping: { title: 'title', description: 'description', version: 'version', status: 'status' } }];

  const pageStats = [
    { label: 'Total SOPs', value: stats?.total || 0 },
    { label: 'Approved', value: stats?.approved || 0 },
    { label: 'Under Review', value: stats?.review || 0 },
    { label: 'Require Training', value: stats?.requiresTraining || 0 },
  ];

  const detailSections: DetailSection[] = selectedSOP ? [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Category</Body>
            <Body>{selectedSOP.category?.name || '—'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Version</Body>
            <Body>{selectedSOP.version}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Status</Body>
            <Badge variant={statusColors[selectedSOP.status] || 'ghost'}>
              {selectedSOP.status.toUpperCase()}
            </Badge>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Effective Date</Body>
            <Body>{selectedSOP.effective_date ? new Date(selectedSOP.effective_date).toLocaleDateString() : '—'}</Body>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'requirements',
      title: 'Requirements',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Acknowledgment</Body>
            <Body>{selectedSOP.requires_acknowledgment ? 'Required' : 'Not Required'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Training</Body>
            <Body>{selectedSOP.requires_training ? 'Required' : 'Not Required'}</Body>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'description',
      title: 'Description',
      content: <Body>{selectedSOP.description || 'No description provided.'}</Body>,
    },
  ] : [];

  return (
    <>
      <ListPage<SOP>
        title="Standard Operating Procedures"
        subtitle="Manage SOPs, acknowledgments, and training requirements"
        data={sops || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search SOPs..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => router.push(`/sops/${row.id}`)}
        createLabel="New SOP"
        onCreate={() => setCreateModalOpen(true)}
        entityType="sops"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['title', 'description', 'version', 'status']}
        onExport={createExportHandler({
          filename: "sops",
          getData: () => (sops || []).map(s => ({
            id: s.id,
            title: s.title,
            description: s.description || '',
            version: s.version,
            status: s.status,
            effective_date: s.effective_date || '',
            requires_acknowledgment: s.requires_acknowledgment,
            category: s.category?.name || '',
          })),
        })}
        stats={pageStats}
        emptyMessage="No SOPs created yet"
        emptyAction={{ label: 'Create First SOP', onClick: () => setCreateModalOpen(true) }}
        quickActions={[
          { id: 'categories', label: 'Categories', icon: <FolderOpen className="size-4" />, onClick: () => router.push('/sops/categories') },
          { id: 'acknowledgments', label: 'Acknowledgments', icon: <CheckCircle className="size-4" />, onClick: () => router.push('/sops/acknowledgments') },
          { id: 'training', label: 'Training', icon: <BookOpen className="size-4" />, onClick: () => router.push('/sops/training') },
        ]}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/sops/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch();
          } else if (action === 'archive') {
            await fetch('/api/sops/bulk-archive', {
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
        title="Create SOP"
        fields={dynamicFormFields}
        onSubmit={handleCreate}
        size="lg"
        record={{ status: 'draft', version: '1.0', requires_acknowledgment: false, requires_training: false }}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedSOP}
        title={(s) => s.title}
        subtitle={(s) => `Version ${s.version}`}
        sections={detailSections}
        onEdit={(s) => router.push(`/sops/${s.id}`)}
      />
    </>
  );
}
