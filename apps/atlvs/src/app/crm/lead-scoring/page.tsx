'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Target, Mail } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import {
  ListPage, Badge, DetailDrawer, Grid, Body,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection,
} from '@ghxstship/ui';
import { createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';

import {
  DEMO_CRM_LEADS,
  type DemoCrmLead as Lead,
} from '../../../lib/demo-data';

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
};

const getGradeVariant = (grade: string): 'solid' | 'outline' | 'ghost' => {
  switch (grade) { case 'A': return 'solid'; case 'B': return 'outline'; case 'C': return 'outline'; case 'D': return 'ghost'; default: return 'ghost'; }
};

const columns: ListPageColumn<Lead>[] = [
  { key: 'name', label: 'Lead', accessor: (r) => `${r.name} (${r.company})`, sortable: true },
  { key: 'score', label: 'Score', accessor: 'score', sortable: true },
  { key: 'grade', label: 'Grade', accessor: 'grade', sortable: true, render: (v) => <Badge variant={getGradeVariant(String(v))}>{String(v)}</Badge> },
  { key: 'engagementScore', label: 'Engagement', accessor: (r) => `${r.engagementScore}%` },
  { key: 'fitScore', label: 'Fit', accessor: (r) => `${r.fitScore}%` },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'estimatedValue', label: 'Est. Value', accessor: (r) => r.estimatedValue ? formatCurrency(r.estimatedValue) : '—', sortable: true },
];

const filters: ListPageFilter[] = [
  { key: 'grade', label: 'Grade', options: [{ value: 'A', label: 'Grade A (Hot)' }, { value: 'B', label: 'Grade B (Warm)' }, { value: 'C', label: 'Grade C (Cool)' }, { value: 'D', label: 'Grade D (Cold)' }] },
  { key: 'status', label: 'Status', options: [{ value: 'New', label: 'New' }, { value: 'Contacted', label: 'Contacted' }, { value: 'Qualified', label: 'Qualified' }, { value: 'Proposal', label: 'Proposal' }] },
  { key: 'source', label: 'Source', options: [{ value: 'Website', label: 'Website' }, { value: 'Referral', label: 'Referral' }, { value: 'LinkedIn', label: 'LinkedIn' }, { value: 'Trade Show', label: 'Trade Show' }] },
];

export default function LeadScoringPage() {
  const router = useRouter();
  const [data] = useState<Lead[]>(DEMO_CRM_LEADS);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const hotLeads = data.filter(l => l.score >= 80).length;
  const avgScore = Math.round(data.reduce((sum, l) => sum + l.score, 0) / data.length);
  const totalPipeline = data.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

  const rowActions: ListPageAction<Lead>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'convert', label: 'Convert to Deal', icon: <Target className="size-4" />, onClick: (r) => router.push(`/deals/new?lead=${r.id}`) },
    { id: 'email', label: 'Send Email', icon: <Mail className="size-4" />, onClick: (r) => window.location.href = `mailto:${r.email}` },
  ];

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'leads',
    requiredFields: ['name', 'email', 'company'],
    onImport: async (records) => {
      for (const record of records) {
        await fetch('/api/leads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
      }
    },
  });

  const importTemplates = getImportTemplates('leads').length > 0 
    ? getImportTemplates('leads') 
    : [{ id: 'default', name: 'Lead Import', mapping: { name: 'name', email: 'email', company: 'company', source: 'source', score: 'score' } }];

  const stats = [
    { label: 'Hot Leads (80+)', value: hotLeads },
    { label: 'Avg Lead Score', value: avgScore },
    { label: 'Total Leads', value: data.length },
    { label: 'Pipeline Value', value: formatCurrency(totalPipeline) },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Lead Score Breakdown', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Name:</strong> {selected.name}</Body>
        <Body size="sm"><strong>Company:</strong> {selected.company}</Body>
        <Body size="sm"><strong>Email:</strong> {selected.email}</Body>
        <Body size="sm"><strong>Source:</strong> {selected.source}</Body>
        <Body size="sm"><strong>Overall Score:</strong> {selected.score}</Body>
        <Body size="sm"><strong>Grade:</strong> {selected.grade}</Body>
        <Body size="sm"><strong>Engagement:</strong> {selected.engagementScore}%</Body>
        <Body size="sm"><strong>Fit:</strong> {selected.fitScore}%</Body>
        <Body size="sm"><strong>Behavior:</strong> {selected.behaviorScore}%</Body>
        <Body size="sm"><strong>Status:</strong> {selected.status}</Body>
        <Body size="sm"><strong>Est. Value:</strong> {selected.estimatedValue ? formatCurrency(selected.estimatedValue) : '—'}</Body>
        <Body size="sm"><strong>Assigned To:</strong> {selected.assignedTo || '—'}</Body>
        <Body size="sm"><strong>Last Activity:</strong> {selected.lastActivity}</Body>
      </Grid>
    )},
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<Lead>
        title="Lead Scoring & Qualification"
        subtitle="Automated lead scoring, grading, and qualification workflows"
        data={data}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search leads..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        entityType="leads"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['name', 'email', 'company', 'source', 'score']}
        onExport={createExportHandler({
          filename: "leads",
          getData: () => data.map(l => ({
            id: l.id,
            name: l.name,
            company: l.company,
            email: l.email,
            score: l.score,
            status: l.status,
            source: l.source,
            lastActivity: l.lastActivity,
          })),
        })}
        stats={stats}
        emptyMessage="No leads found"
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/crm/leads/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          } else if (action === 'qualify') {
            await fetch('/api/crm/leads/bulk-qualify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          }
        }}
        bulkActions={[
          { id: 'qualify', label: 'Qualify Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />
      {selected && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selected}
          title={(r) => r.name}
          subtitle={(r) => `${r.company} • Grade ${r.grade} • Score: ${r.score}`}
          sections={detailSections}
          actions={[{ id: 'convert', label: 'Convert to Deal', icon: <Target className="size-4" /> }, { id: 'email', label: 'Send Email', icon: <Mail className="size-4" /> }]}
          onAction={(id, r) => { if (id === 'convert') router.push(`/deals/new?lead=${r.id}`); if (id === 'email') window.location.href = `mailto:${r.email}`; setDrawerOpen(false); }}
        />
      )}
    </AtlvsAppLayout>
  );
}
