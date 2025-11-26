'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../components/navigation';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';
import { getBadgeVariant } from '@ghxstship/config';

interface Issue {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'safety' | 'logistics' | 'personnel' | 'vendor' | 'other';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'escalated' | 'resolved' | 'closed';
  reported_by: string;
  assigned_to?: string;
  department: string;
  location?: string;
  created_at: string;
  updated_at: string;
  escalation_level: number;
  resolution?: string;
  [key: string]: unknown;
}

const mockIssues: Issue[] = [
  { id: 'ISS-001', title: 'Main PA system feedback', description: 'Intermittent feedback from house left speaker cluster', category: 'technical', priority: 'high', status: 'in_progress', reported_by: 'John Martinez', assigned_to: 'Audio Team', department: 'Audio', location: 'Main Stage', created_at: '2024-11-24T14:30:00Z', updated_at: '2024-11-24T14:45:00Z', escalation_level: 1 },
  { id: 'ISS-002', title: 'Truss motor malfunction', description: 'Motor 3 on downstage truss not responding', category: 'technical', priority: 'critical', status: 'escalated', reported_by: 'Chris Brown', assigned_to: 'Rigging Lead', department: 'Rigging', location: 'Main Stage', created_at: '2024-11-24T13:00:00Z', updated_at: '2024-11-24T14:00:00Z', escalation_level: 2 },
  { id: 'ISS-003', title: 'Catering delivery delayed', description: 'Crew lunch delivery running 45 minutes late', category: 'logistics', priority: 'medium', status: 'open', reported_by: 'Production Office', department: 'Production', created_at: '2024-11-24T11:00:00Z', updated_at: '2024-11-24T11:00:00Z', escalation_level: 0 },
  { id: 'ISS-004', title: 'Missing crew member', description: 'Stagehand Alex Johnson not checked in, no response to calls', category: 'personnel', priority: 'high', status: 'open', reported_by: 'Stage Manager', department: 'Stage', created_at: '2024-11-24T09:00:00Z', updated_at: '2024-11-24T09:30:00Z', escalation_level: 1 },
  { id: 'ISS-005', title: 'Fire exit blocked', description: 'Equipment cases blocking emergency exit door 3', category: 'safety', priority: 'critical', status: 'resolved', reported_by: 'Safety Officer', assigned_to: 'Stagehands', department: 'Safety', location: 'Backstage', created_at: '2024-11-24T10:00:00Z', updated_at: '2024-11-24T10:15:00Z', escalation_level: 0, resolution: 'Cases moved to designated storage area' },
];

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
  const router = useRouter();
  const [issues, setIssues] = useState<Issue[]>(mockIssues);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeIssues = issues.filter(i => ['open', 'in_progress', 'escalated'].includes(i.status));
  const criticalCount = issues.filter(i => i.priority === 'critical' && !['resolved', 'closed'].includes(i.status)).length;
  const escalatedCount = issues.filter(i => i.status === 'escalated').length;

  const rowActions: ListPageAction<Issue>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedIssue(r); setDrawerOpen(true); } },
    { id: 'escalate', label: 'Escalate', icon: '⬆️', onClick: (r) => handleEscalate(r.id) },
    { id: 'resolve', label: 'Resolve', icon: '✅', onClick: (r) => handleResolve(r.id) },
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

  const stats = [
    { label: 'Active Issues', value: activeIssues.length },
    { label: 'Critical', value: criticalCount },
    { label: 'Escalated', value: escalatedCount },
    { label: 'Resolved Today', value: issues.filter(i => i.status === 'resolved').length },
  ];

  const detailSections: DetailSection[] = selectedIssue ? [
    { id: 'overview', title: 'Issue Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Title:</strong> {selectedIssue.title}</div>
        <div><strong>Category:</strong> {selectedIssue.category}</div>
        <div><strong>Priority:</strong> {selectedIssue.priority}</div>
        <div><strong>Status:</strong> {selectedIssue.status.replace('_', ' ')}</div>
        <div><strong>Department:</strong> {selectedIssue.department}</div>
        <div><strong>Location:</strong> {selectedIssue.location || '—'}</div>
        <div><strong>Reported By:</strong> {selectedIssue.reported_by}</div>
        <div><strong>Assigned To:</strong> {selectedIssue.assigned_to || 'Unassigned'}</div>
        <div><strong>Escalation Level:</strong> {selectedIssue.escalation_level}</div>
        <div><strong>Created:</strong> {new Date(selectedIssue.created_at).toLocaleString()}</div>
      </div>
    )},
    { id: 'description', title: 'Description', content: <p>{selectedIssue.description}</p> },
    ...(selectedIssue.resolution ? [{ id: 'resolution', title: 'Resolution', content: <p>{selectedIssue.resolution}</p> }] : []),
  ] : [];

  return (
    <>
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
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No issues found"
        emptyAction={{ label: 'Report Issue', onClick: () => setCreateModalOpen(true) }}
        header={<Navigation />}
      />

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
            { id: 'escalate', label: 'Escalate', icon: '⬆️' },
            { id: 'resolve', label: 'Resolve', icon: '✅' },
          ]}
          onAction={(id, i) => {
            if (id === 'escalate') handleEscalate(i.id);
            if (id === 'resolve') handleResolve(i.id);
            setDrawerOpen(false);
          }}
        />
      )}
    </>
  );
}
