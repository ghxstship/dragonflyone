'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, Copy, FileText, Calendar, FileCheck } from 'lucide-react';
import {
  ListPage,
  Badge,
  Stack,
  Body,
  Card,
  Label,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
} from '@ghxstship/ui';
import NextLink from 'next/link';
import { useTemplates, type Template } from '../../../../hooks/useTemplates';

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
  
  const { data, isLoading, refetch } = useTemplates();
  const templates = data?.templates || [];

  const rowActions: ListPageAction<Template>[] = [
    { 
      label: 'View', 
      icon: <Eye className="size-4" />, 
      onClick: (template) => router.push(`/organization/templates/${template.id}`) 
    },
    { 
      label: 'Edit', 
      icon: <Pencil className="size-4" />, 
      onClick: (template) => router.push(`/organization/templates/${template.id}/edit`) 
    },
    { 
      label: 'Duplicate', 
      icon: <Copy className="size-4" />, 
      onClick: (template) => setSelectedTemplate(template) 
    },
    { 
      label: 'Delete', 
      icon: <Trash2 className="size-4" />, 
      onClick: (template) => setSelectedTemplate(template),
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
    </>
  );
}
