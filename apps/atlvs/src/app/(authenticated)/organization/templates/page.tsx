'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, Copy, FileText, Calendar, FileCheck } from 'lucide-react';
import {
  Badge,
  Body,
  Button,
  Card,
  Label,
  ListPage,
  Stack,
  type ListPageAction,
  type ListPageColumn,
  type ListPageFilter,
} from '@ghxstship/ui';
import NextLink from 'next/link';
import { useTemplates, useDeleteTemplate, useCreateTemplate, type Template } from '../../../../hooks/useTemplates';

export const runtime = 'edge';

const templateTypeLabels: Record<string, string> = {
  document: 'Document',
  email: 'Email',
  task: 'Task',
  workflow: 'Workflow',
  proposal: 'Proposal',
  event: 'Event',
  notification: 'Notification',
};

const columns: ListPageColumn<Template>[] = [
  { 
    key: 'name', 
    label: 'Template Name', 
    accessor: 'name', 
    sortable: true 
  },
  { 
    key: 'template_type', 
    label: 'Type', 
    accessor: 'template_type', 
    sortable: true,
    render: (value) => (
      <Badge variant="outline">
        {templateTypeLabels[String(value)] || String(value)}
      </Badge>
    )
  },
  { 
    key: 'category', 
    label: 'Category', 
    accessor: (row) => row.category?.name || 'Uncategorized'
  },
  { 
    key: 'is_active', 
    label: 'Status', 
    accessor: 'is_active', 
    sortable: true,
    render: (value) => (
      <Badge variant={value ? 'solid' : 'outline'}>
        {value ? 'ACTIVE' : 'INACTIVE'}
      </Badge>
    )
  },
  { 
    key: 'is_public', 
    label: 'Visibility', 
    accessor: 'is_public',
    render: (value) => (
      <Badge variant={value ? 'info' : 'ghost'}>
        {value ? 'PUBLIC' : 'ORG ONLY'}
      </Badge>
    )
  },
  { 
    key: 'updated_at', 
    label: 'Last Modified', 
    accessor: 'updated_at', 
    sortable: true,
    render: (value, row) => new Date(String(value || row.created_at)).toLocaleDateString()
  },
];

const filters: ListPageFilter[] = [
  { 
    key: 'template_type', 
    label: 'Type', 
    options: [
      { value: 'document', label: 'Document' },
      { value: 'email', label: 'Email' },
      { value: 'task', label: 'Task' },
      { value: 'workflow', label: 'Workflow' },
      { value: 'proposal', label: 'Proposal' },
      { value: 'event', label: 'Event' },
      { value: 'notification', label: 'Notification' },
    ]
  },
  {
    key: 'is_active',
    label: 'Status',
    options: [
      { value: 'true', label: 'Active' },
      { value: 'false', label: 'Inactive' },
    ]
  },
];

export default function OrganizationTemplatesPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [actionType, setActionType] = useState<'delete' | 'duplicate' | null>(null);
  
  const { data, isLoading } = useTemplates();
  const templates = data?.templates || [];
  
  const deleteTemplate = useDeleteTemplate();
  const createTemplate = useCreateTemplate();

  const handleDeleteConfirm = async () => {
    if (!selectedTemplate) return;
    await deleteTemplate.mutateAsync(selectedTemplate.id);
    setSelectedTemplate(null);
    setActionType(null);
  };

  const handleDuplicateConfirm = async () => {
    if (!selectedTemplate) return;
    await createTemplate.mutateAsync({
      organization_id: selectedTemplate.organization_id,
      category_id: selectedTemplate.category_id,
      name: `${selectedTemplate.name} (Copy)`,
      description: selectedTemplate.description,
      template_type: selectedTemplate.template_type,
      content: selectedTemplate.content,
      is_active: false,
      is_public: false,
      tags: selectedTemplate.tags,
    });
    setSelectedTemplate(null);
    setActionType(null);
  };

  const rowActions: ListPageAction<Template>[] = [
    { 
      id: 'view',
      label: 'View', 
      icon: <Eye className="size-4" />, 
      onClick: (template) => router.push(`/organization/templates/${template.id}`) 
    },
    { 
      id: 'edit',
      label: 'Edit', 
      icon: <Pencil className="size-4" />, 
      onClick: (template) => router.push(`/organization/templates/${template.id}/edit`) 
    },
    { 
      id: 'duplicate',
      label: 'Duplicate', 
      icon: <Copy className="size-4" />, 
      onClick: (template) => {
        setSelectedTemplate(template);
        setActionType('duplicate');
      }
    },
    { 
      id: 'delete',
      label: 'Delete', 
      icon: <Trash2 className="size-4" />, 
      onClick: (template) => {
        setSelectedTemplate(template);
        setActionType('delete');
      },
      variant: 'danger'
    },
  ];

  return (
    <>
      <ListPage
        title="Template Library"
        subtitle="Create and manage templates for your organization"
        data={templates}
        columns={columns}
        filters={filters}
        rowActions={rowActions}
        isLoading={isLoading}
        onCreateNew={() => router.push('/organization/templates/new')}
        createLabel="Create Template"
        searchPlaceholder="Search templates..."
        emptyState={{
          title: 'No Templates Found',
          description: 'Get started by creating your first organization template.',
          action: {
            label: 'Create Template',
            onClick: () => router.push('/organization/templates/new'),
          },
        }}
        headerActions={
          <NextLink href="/templates">
            <Badge variant="outline" className="cursor-pointer hover:bg-ink-800">
              View Public Templates
            </Badge>
          </NextLink>
        }
      />
      
      {/* Quick Links */}
      <Stack gap={4} className="mt-8 grid grid-cols-1 sm:grid-cols-3">
        <NextLink href="/contracts/templates">
          <Card inverted className="p-4 transition-all hover:border-brand-pink">
            <Stack direction="horizontal" gap={3} className="items-center">
              <FileCheck className="size-6 text-brand-pink" />
              <Stack gap={0}>
                <Body className="text-white">Contract Templates</Body>
                <Label size="xs" className="text-on-dark-muted">Manage contract templates</Label>
              </Stack>
            </Stack>
          </Card>
        </NextLink>
        <NextLink href="/proposals/templates">
          <Card inverted className="p-4 transition-all hover:border-brand-pink">
            <Stack direction="horizontal" gap={3} className="items-center">
              <FileText className="size-6 text-brand-pink" />
              <Stack gap={0}>
                <Body className="text-white">Proposal Templates</Body>
                <Label size="xs" className="text-on-dark-muted">Manage proposal templates</Label>
              </Stack>
            </Stack>
          </Card>
        </NextLink>
        <NextLink href="/beos/templates">
          <Card inverted className="p-4 transition-all hover:border-brand-pink">
            <Stack direction="horizontal" gap={3} className="items-center">
              <Calendar className="size-6 text-brand-pink" />
              <Stack gap={0}>
                <Body className="text-white">BEO Templates</Body>
                <Label size="xs" className="text-on-dark-muted">Manage BEO templates</Label>
              </Stack>
            </Stack>
          </Card>
        </NextLink>
      </Stack>

      {/* Delete Confirmation Dialog */}
      {actionType === 'delete' && selectedTemplate && (
        <div className="fixed inset-0 bg-ink-950/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4 p-6">
            <Stack gap={4}>
              <Body size="md" className="font-weight-semibold">Delete Template</Body>
              <Body size="sm" className="text-grey-600">
                Are you sure you want to delete &quot;{selectedTemplate.name}&quot;? This action cannot be undone.
              </Body>
              <Stack direction="horizontal" gap={2} className="justify-end">
                <Button
                  onClick={() => { setSelectedTemplate(null); setActionType(null); }}
                  className="px-4 py-2 text-grey-600 hover:text-grey-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  disabled={deleteTemplate.isPending}
                  className="px-4 py-2 bg-error-600 text-white rounded-button hover:bg-error-700 disabled:opacity-50"
                >
                  {deleteTemplate.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </Stack>
            </Stack>
          </Card>
        </div>
      )}

      {/* Duplicate Confirmation Dialog */}
      {actionType === 'duplicate' && selectedTemplate && (
        <div className="fixed inset-0 bg-ink-950/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4 p-6">
            <Stack gap={4}>
              <Body size="md" className="font-weight-semibold">Duplicate Template</Body>
              <Body size="sm" className="text-grey-600">
                Create a copy of &quot;{selectedTemplate.name}&quot;? The copy will be created as inactive.
              </Body>
              <Stack direction="horizontal" gap={2} className="justify-end">
                <Button
                  onClick={() => { setSelectedTemplate(null); setActionType(null); }}
                  className="px-4 py-2 text-grey-600 hover:text-grey-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDuplicateConfirm}
                  disabled={createTemplate.isPending}
                  className="px-4 py-2 bg-primary-600 text-white rounded-button hover:bg-primary-700 disabled:opacity-50"
                >
                  {createTemplate.isPending ? 'Duplicating...' : 'Duplicate'}
                </Button>
              </Stack>
            </Stack>
          </Card>
        </div>
      )}
    </>
  );
}
