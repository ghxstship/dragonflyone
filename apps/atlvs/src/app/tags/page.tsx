'use client';

import { useState } from 'react';
import { Tag as TagIcon, Pencil, Trash2, Eye } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import { useTags, useCreateTag, useDeleteTag } from '../../hooks/useTags';
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
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';

interface Tag {
  id: string;
  tag_name: string;
  tag_type: string;
  description?: string;
  color_hex?: string;
  created_at: string;
}

const typeColors: Record<string, 'success' | 'warning' | 'info' | 'solid' | 'outline'> = {
  general: 'outline',
  industry: 'info',
  compliance: 'warning',
  feature: 'success',
  category: 'solid',
  priority: 'warning',
};

const columns: ListPageColumn<Tag>[] = [
  {
    key: 'tag_name',
    label: 'Tag Name',
    accessor: 'tag_name',
    sortable: true,
  },
  {
    key: 'tag_type',
    label: 'Type',
    accessor: 'tag_type',
    render: (value) => (
      <Badge variant={typeColors[String(value)] || 'outline'}>
        {String(value).toUpperCase()}
      </Badge>
    ),
  },
  {
    key: 'color',
    label: 'Color',
    accessor: 'color_hex',
    render: (value) => value ? (
      <div className="flex items-center gap-2">
        <div 
          className="size-4 rounded border-2 border-ink-700" 
          style={{ backgroundColor: String(value) }}
        />
        <span className="text-ink-400">{String(value)}</span>
      </div>
    ) : '—',
  },
  {
    key: 'description',
    label: 'Description',
    accessor: 'description',
    render: (value) => value ? String(value).slice(0, 50) + (String(value).length > 50 ? '...' : '') : '—',
  },
  {
    key: 'created_at',
    label: 'Created',
    accessor: 'created_at',
    render: (value) => value ? new Date(String(value)).toLocaleDateString() : '—',
  },
];

const filters: ListPageFilter[] = [
  {
    key: 'tag_type',
    label: 'Type',
    options: [
      { value: 'general', label: 'General' },
      { value: 'industry', label: 'Industry' },
      { value: 'compliance', label: 'Compliance' },
      { value: 'feature', label: 'Feature' },
      { value: 'category', label: 'Category' },
      { value: 'priority', label: 'Priority' },
    ],
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'tag_name', label: 'Tag Name', type: 'text', required: true },
  {
    name: 'tag_type',
    label: 'Type',
    type: 'select',
    required: true,
    options: [
      { value: 'general', label: 'General' },
      { value: 'industry', label: 'Industry' },
      { value: 'compliance', label: 'Compliance' },
      { value: 'feature', label: 'Feature' },
      { value: 'category', label: 'Category' },
      { value: 'priority', label: 'Priority' },
    ],
  },
  { name: 'color_hex', label: 'Color (Hex)', type: 'text', placeholder: '#6366f1' },
  { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
];

export default function TagsPage() {
  const { data: response, isLoading, error, refetch } = useTags();
  const createMutation = useCreateTag();
  const deleteMutation = useDeleteTag();

  const tags = response?.tags || [];
  const summary = response?.summary;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  const rowActions: ListPageAction<Tag>[] = [
    {
      id: 'view',
      label: 'View Details',
      icon: <Eye className="size-4" />,
      onClick: (row) => {
        setSelectedTag(row);
        setDrawerOpen(true);
      },
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Pencil className="size-4" />,
      onClick: (row) => {
        setSelectedTag(row);
        setDrawerOpen(true);
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="size-4" />,
      variant: 'danger',
      onClick: (row) => {
        setTagToDelete(row);
        setDeleteConfirmOpen(true);
      },
    },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await createMutation.mutateAsync({
      tag_name: String(data.tag_name),
      tag_type: (data.tag_type as Tag['tag_type']) || 'general',
      description: data.description ? String(data.description) : undefined,
      color_hex: data.color_hex ? String(data.color_hex) : undefined,
    });
    setCreateModalOpen(false);
    refetch();
  };

  const handleDelete = async () => {
    if (tagToDelete) {
      await deleteMutation.mutateAsync(tagToDelete.id);
      setDeleteConfirmOpen(false);
      setTagToDelete(null);
      refetch();
    }
  };

  const stats = [
    { label: 'Total Tags', value: summary?.total || 0 },
    { label: 'General', value: summary?.by_type?.general || 0 },
    { label: 'Industry', value: summary?.by_type?.industry || 0 },
    { label: 'Feature', value: summary?.by_type?.feature || 0 },
  ];

  const detailSections: DetailSection[] = selectedTag
    ? [
        {
          id: 'overview',
          title: 'Tag Details',
          content: (
            <Grid cols={2} gap={4}>
              <Body size="sm"><strong>Name:</strong> {selectedTag.tag_name}</Body>
              <Body size="sm"><strong>Type:</strong> {selectedTag.tag_type}</Body>
              <Body size="sm"><strong>Color:</strong> {selectedTag.color_hex || '—'}</Body>
              <Body size="sm"><strong>Description:</strong> {selectedTag.description || '—'}</Body>
            </Grid>
          ),
        },
      ]
    : [];

  return (
    <AtlvsAppLayout>
      <ListPage
        title="Tags"
        description="Manage tags and labels for categorization"
        icon={<TagIcon className="size-6" />}
        data={tags}
        columns={columns}
        filters={filters}
        rowActions={rowActions}
        stats={stats}
        loading={isLoading}
        error={error?.message}
        onRefresh={refetch}
        onCreate={() => setCreateModalOpen(true)}
        createLabel="Add Tag"
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Tag"
        fields={formFields}
        onSubmit={handleCreate}
        loading={createMutation.isPending}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={selectedTag?.tag_name || 'Tag Details'}
        sections={detailSections}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Delete Tag"
        message={`Are you sure you want to delete "${tagToDelete?.tag_name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        loading={deleteMutation.isPending}
        variant="danger"
      />
    </AtlvsAppLayout>
  );
}
