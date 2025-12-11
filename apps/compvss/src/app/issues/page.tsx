'use client';

import { useState } from 'react';
import { Eye, ArrowUp, Check } from 'lucide-react';
import { CompvssAppLayout } from '../../components/app-layout';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  Grid,
  Stack,
  Body,
  EnterprisePageHeader,
  MainContent,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';
import { getBadgeVariant, createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';

import {
  DEMO_ISSUES,
  type DemoIssue as Issue,
} from '../../lib/demo-data';

const getPriorityVariant = (priority: string): 'solid' | 'outline' | 'ghost' => {
  switch (priority) {
    case 'critical': case 'high': return 'solid';
    case 'medium': return 'outline';
    default: return 'ghost';
  }
};

const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<Issue>[] = [
  { key: 'title', label: 'Issue', accessor: 'title', sortable: true },
  { key: 'category', label: 'Category', accessor: 'category', render: (v) => <Badge variant="outline">{String(v).toUpperCase()}</Badge> },
  { key: 'priority', label: 'Priority', accessor: 'priority', sortable: true, render: (v) => <Badge variant={getPriorityVariant(String(v))}>{String(v).toUpperCase()}</Badge> },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v).replace('_', ' ').toUpperCase()}</Badge> },
  { key: 'department', label: 'Department', accessor: 'department' },
  { key: 'reported_by', label: 'Reported By', accessor: 'reported_by' },
  { key: 'created_at', label: 'Created', accessor: (r) => new Date(r.created_at).toLocaleTimeString(), sortable: true },
];

const filters: ListPageFilter[] = [
  { key: 'priority', label: 'Priority', options: [{ value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }] },
  { key: 'category', label: 'Category', options: [{ value: 'technical', label: 'Technical' }, { value: 'safety', label: 'Safety' }, { value: 'logistics', label: 'Logistics' }, { value: 'personnel', label: 'Personnel' }, { value: 'vendor', label: 'Vendor' }] },
  { key: 'status', label: 'Status', options: [{ value: 'open', label: 'Open' }, { value: 'in_progress', label: 'In Progress' }, { value: 'escalated', label: 'Escalated' }, { value: 'resolved', label: 'Resolved' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'title', label: 'Issue Title', type: 'text', required: true, colSpan: 2 },
  { name: 'description', label: 'Description', type: 'textarea', required: true, colSpan: 2 },
  { name: 'category', label: 'Category', type: 'select', required: true, options: [{ value: 'technical', label: 'Technical' }, { value: 'safety', label: 'Safety' }, { value: 'logistics', label: 'Logistics' }, { value: 'personnel', label: 'Personnel' }, { value: 'vendor', label: 'Vendor' }, { value: 'other', label: 'Other' }] },
  { name: 'priority', label: 'Priority', type: 'select', required: true, options: [{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'critical', label: 'Critical' }] },
  { name: 'department', label: 'Department', type: 'text', required: true },
  { name: 'location', label: 'Location', type: 'text' },
];

export default function IssuesPage() {
  const [issues, setIssues] = useState<Issue[]>(DEMO_ISSUES);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeIssues = issues.filter(i => ['open', 'in_progress', 'escalated'].includes(i.status));
  const criticalCount = issues.filter(i => i.priority === 'critical' && !['resolved', 'closed'].includes(i.status)).length;
  const escalatedCount = issues.filter(i => i.status === 'escalated').length;

  const rowActions: ListPageAction<Issue>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedIssue(r); setDrawerOpen(true); } },
    { id: 'escalate', label: 'Escalate', icon: <ArrowUp className="size-4" />, onClick: (r) => handleEscalate(r.id) },
    { id: 'resolve', label: 'Resolve', icon: <Check className="size-4" />, onClick: (r) => handleResolve(r.id) },
  ];

  const handleEscalate = (issueId: string) => {
    setIssues(issues.map(i => i.id === issueId ? { ...i, status: 'escalated' as const, escalation_level: i.escalation_level + 1, updated_at: new Date().toISOString() } : i));
  };

  const handleResolve = (issueId: string) => {
    setIssues(issues.map(i => i.id === issueId ? { ...i, status: 'resolved' as const, updated_at: new Date().toISOString() } : i));
  };

  const handleCreate = async (data: Record<string, unknown>) => {
    const issue: Issue = {
      id: `ISS-${String(issues.length + 1).padStart(3, '0')}`,
      title: String(data.title || ''),
      description: String(data.description || ''),
      category: data.category as Issue['category'],
      priority: data.priority as Issue['priority'],
      status: 'open',
      reported_by: 'Current User',
      department: String(data.department || ''),
      location: data.location ? String(data.location) : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      escalation_level: 0,
    };
    setIssues([issue, ...issues]);
    setCreateModalOpen(false);
  };

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'issues',
    requiredFields: ['title', 'category', 'priority'],
    onImport: async (records) => {
      for (const record of records) {
        const issue: Issue = {
          id: `ISS-${String(issues.length + 1).padStart(3, '0')}`,
          title: String(record.title || ''),
          description: String(record.description || ''),
          category: record.category as Issue['category'],
          priority: record.priority as Issue['priority'],
          status: 'open',
          reported_by: String(record.reported_by || 'Import'),
          department: String(record.department || ''),
          location: record.location ? String(record.location) : undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          escalation_level: 0,
        };
        setIssues(prev => [issue, ...prev]);
      }
    },
  });

  const importTemplates = getImportTemplates('issues').length > 0 
    ? getImportTemplates('issues') 
    : [{ id: 'default', name: 'Issue Import', mapping: { title: 'title', description: 'description', category: 'category', priority: 'priority', department: 'department' } }];

  const stats = [
    { label: 'Active Issues', value: activeIssues.length },
    { label: 'Critical', value: criticalCount },
    { label: 'Escalated', value: escalatedCount },
    { label: 'Resolved Today', value: issues.filter(i => i.status === 'resolved').length },
  ];

  const detailSections: DetailSection[] = selectedIssue ? [
    { id: 'overview', title: 'Issue Details', content: (
      <Grid cols={2} gap={4}>
        <Stack gap={1}><Body className="font-display">Title</Body><Body>{selectedIssue.title}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Category</Body><Body>{selectedIssue.category}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Priority</Body><Body>{selectedIssue.priority}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Status</Body><Body>{selectedIssue.status.replace('_', ' ')}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Department</Body><Body>{selectedIssue.department}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Location</Body><Body>{selectedIssue.location || '—'}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Reported By</Body><Body>{selectedIssue.reported_by}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Assigned To</Body><Body>{selectedIssue.assigned_to || 'Unassigned'}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Escalation Level</Body><Body>{selectedIssue.escalation_level}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Created</Body><Body>{new Date(selectedIssue.created_at).toLocaleString()}</Body></Stack>
      </Grid>
    )},
    { id: 'description', title: 'Description', content: <Body>{selectedIssue.description}</Body> },
    ...(selectedIssue.resolution ? [{ id: 'resolution', title: 'Resolution', content: <Body>{selectedIssue.resolution}</Body> }] : []),
  ] : [];

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Live Issue Tracking"
        subtitle="Real-time issue management and escalation"
primaryAction={{ label: 'Report Issue', onClick: () => setCreateModalOpen(true) }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <ListPage<Issue>
          title="Live Issue Tracking"
          subtitle="Real-time issue management and escalation"
          data={issues}
          columns={columns}
          rowKey="id"
          loading={false}
          searchPlaceholder="Search issues..."
          filters={filters}
          rowActions={rowActions}
          onRowClick={(r) => { setSelectedIssue(r); setDrawerOpen(true); }}
          createLabel="Report Issue"
          onCreate={() => setCreateModalOpen(true)}
          entityType="issues"
          onImport={handleImport}
          importTemplates={importTemplates}
          importSampleFields={['title', 'description', 'category', 'priority', 'department']}
          onExport={createExportHandler({
            filename: "issues",
            getData: () => issues.map(i => ({
              id: i.id,
              title: i.title,
              category: i.category,
              priority: i.priority,
              status: i.status,
              reported_by: i.reported_by,
              department: i.department,
              location: i.location || '',
              created_at: i.created_at,
            })),
          })}
          stats={stats}
          emptyMessage="No issues found"
          emptyAction={{ label: 'Report Issue', onClick: () => setCreateModalOpen(true) }}
          onBulkAction={async (action, ids) => {
            if (action === 'delete') {
              await fetch('/api/issues/bulk', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
              });
            } else if (action === 'resolve') {
              await fetch('/api/issues/bulk-resolve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
              });
            }
          }}
          bulkActions={[
            { id: 'resolve', label: 'Resolve Selected', variant: 'default' },
            { id: 'delete', label: 'Delete Selected', variant: 'danger' },
          ]}
        />
      </MainContent>

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Report Issue"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />

      {selectedIssue && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedIssue}
          title={(i) => i.title}
          subtitle={(i) => `${i.category} • ${i.priority} priority`}
          sections={detailSections}
          actions={[
            { id: 'escalate', label: 'Escalate', icon: <ArrowUp className="size-4" /> },
            { id: 'resolve', label: 'Resolve', icon: <Check className="size-4" /> },
          ]}
          onAction={(id, i) => {
            if (id === 'escalate') handleEscalate(i.id);
            if (id === 'resolve') handleResolve(i.id);
            setDrawerOpen(false);
          }}
        />
      )}
    </CompvssAppLayout>
  );
}
