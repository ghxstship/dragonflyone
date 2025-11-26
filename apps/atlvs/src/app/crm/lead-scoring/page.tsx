'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../../components/navigation';
import {
  ListPage, Badge, DetailDrawer,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection,
} from '@ghxstship/ui';

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  source: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  status: 'New' | 'Contacted' | 'Qualified' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost';
  lastActivity: string;
  engagementScore: number;
  fitScore: number;
  behaviorScore: number;
  assignedTo?: string;
  estimatedValue?: number;
  [key: string]: unknown;
}

const mockData: Lead[] = [
  { id: 'LEAD-001', name: 'Sarah Mitchell', company: 'TechCorp Events', email: 'sarah@techcorp.com', source: 'Website', score: 92, grade: 'A', status: 'Qualified', lastActivity: '2024-11-24', engagementScore: 85, fitScore: 95, behaviorScore: 90, assignedTo: 'John Smith', estimatedValue: 125000 },
  { id: 'LEAD-002', name: 'Michael Chen', company: 'Festival Productions', email: 'mchen@festprod.com', source: 'Referral', score: 78, grade: 'B', status: 'Proposal', lastActivity: '2024-11-23', engagementScore: 70, fitScore: 85, behaviorScore: 75, assignedTo: 'Jane Doe', estimatedValue: 85000 },
  { id: 'LEAD-003', name: 'Emily Rodriguez', company: 'Corporate Events Inc', email: 'emily@corpevents.com', source: 'Trade Show', score: 65, grade: 'B', status: 'Contacted', lastActivity: '2024-11-22', engagementScore: 60, fitScore: 70, behaviorScore: 65, estimatedValue: 45000 },
  { id: 'LEAD-004', name: 'David Park', company: 'StartUp Ventures', email: 'dpark@startup.io', source: 'LinkedIn', score: 45, grade: 'C', status: 'New', lastActivity: '2024-11-24', engagementScore: 40, fitScore: 50, behaviorScore: 45, estimatedValue: 25000 },
  { id: 'LEAD-005', name: 'Lisa Thompson', company: 'Local Business', email: 'lisa@local.com', source: 'Cold Outreach', score: 28, grade: 'D', status: 'Contacted', lastActivity: '2024-11-20', engagementScore: 25, fitScore: 30, behaviorScore: 30, estimatedValue: 10000 },
];

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
  const [data] = useState<Lead[]>(mockData);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const hotLeads = data.filter(l => l.score >= 80).length;
  const avgScore = Math.round(data.reduce((sum, l) => sum + l.score, 0) / data.length);
  const totalPipeline = data.reduce((sum, l) => sum + (l.estimatedValue || 0), 0);

  const rowActions: ListPageAction<Lead>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'convert', label: 'Convert to Deal', icon: '🎯', onClick: (r) => router.push(`/deals/new?lead=${r.id}`) },
    { id: 'email', label: 'Send Email', icon: '✉️', onClick: (r) => window.location.href = `mailto:${r.email}` },
  ];

  const stats = [
    { label: 'Hot Leads (80+)', value: hotLeads },
    { label: 'Avg Lead Score', value: avgScore },
    { label: 'Total Leads', value: data.length },
    { label: 'Pipeline Value', value: formatCurrency(totalPipeline) },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Lead Score Breakdown', content: (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div><strong>Name:</strong> {selected.name}</div>
        <div><strong>Company:</strong> {selected.company}</div>
        <div><strong>Email:</strong> {selected.email}</div>
        <div><strong>Source:</strong> {selected.source}</div>
        <div><strong>Overall Score:</strong> {selected.score}</div>
        <div><strong>Grade:</strong> {selected.grade}</div>
        <div><strong>Engagement:</strong> {selected.engagementScore}%</div>
        <div><strong>Fit:</strong> {selected.fitScore}%</div>
        <div><strong>Behavior:</strong> {selected.behaviorScore}%</div>
        <div><strong>Status:</strong> {selected.status}</div>
        <div><strong>Est. Value:</strong> {selected.estimatedValue ? formatCurrency(selected.estimatedValue) : '—'}</div>
        <div><strong>Assigned To:</strong> {selected.assignedTo || '—'}</div>
        <div><strong>Last Activity:</strong> {selected.lastActivity}</div>
      </div>
    )},
  ] : [];

  return (
    <>
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
        onExport={() => console.log('Export leads')}
        stats={stats}
        emptyMessage="No leads found"
        header={<Navigation />}
      />
      {selected && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selected}
          title={(r) => r.name}
          subtitle={(r) => `${r.company} • Grade ${r.grade} • Score: ${r.score}`}
          sections={detailSections}
          actions={[{ id: 'convert', label: 'Convert to Deal', icon: '🎯' }, { id: 'email', label: 'Send Email', icon: '✉️' }]}
          onAction={(id, r) => { if (id === 'convert') router.push(`/deals/new?lead=${r.id}`); if (id === 'email') window.location.href = `mailto:${r.email}`; setDrawerOpen(false); }}
        />
      )}
    </>
  );
}
