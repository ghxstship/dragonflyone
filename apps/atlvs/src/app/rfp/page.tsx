"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  ListPage,
  Badge,
  DetailDrawer,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from "@ghxstship/ui";
import { getBadgeVariant } from "@ghxstship/config";

interface RFP {
  id: string;
  title: string;
  description: string;
  project_type: string;
  budget_min: number;
  budget_max: number;
  status: string;
  deadline: string;
  submission_deadline: string;
  responses?: { count: number }[];
  created_by_user?: { id: string; full_name: string; email: string };
  created_at: string;
  [key: string]: unknown;
}

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
};
const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<RFP>[] = [
  { key: 'title', label: 'Title', accessor: 'title', sortable: true },
  { key: 'project_type', label: 'Type', accessor: 'project_type', render: (v) => <Badge variant="ghost">{String(v) || 'General'}</Badge> },
  { key: 'budget', label: 'Budget Range', accessor: (r) => r.budget_min && r.budget_max ? `${formatCurrency(r.budget_min)} - ${formatCurrency(r.budget_max)}` : r.budget_max ? formatCurrency(r.budget_max) : '—' },
  { key: 'responses', label: 'Responses', accessor: (r) => r.responses?.[0]?.count || 0, sortable: true },
  { key: 'submission_deadline', label: 'Deadline', accessor: (r) => r.submission_deadline ? new Date(r.submission_deadline).toLocaleDateString() : '—', sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'draft', label: 'Draft' }, { value: 'open', label: 'Open' }, { value: 'evaluation', label: 'Evaluation' }, { value: 'awarded', label: 'Awarded' }, { value: 'closed', label: 'Closed' }] },
];

export default function RFPPage() {
  const router = useRouter();
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRfp, setSelectedRfp] = useState<RFP | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchRFPs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rfp');
      if (!response.ok) throw new Error("Failed to fetch RFPs");
      const data = await response.json();
      setRfps(data.rfps || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRFPs(); }, [fetchRFPs]);

  const totalBudget = rfps.reduce((sum, r) => sum + (Number(r.budget_max) || 0), 0);
  const openCount = rfps.filter(r => r.status === "open" || r.status === "draft").length;
  const totalResponses = rfps.reduce((sum, r) => sum + (r.responses?.[0]?.count || 0), 0);

  const rowActions: ListPageAction<RFP>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedRfp(r); setDrawerOpen(true); } },
    { id: 'publish', label: 'Publish', icon: '📤', onClick: async (r) => { await fetch(`/api/rfp/${r.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'open' }) }); fetchRFPs(); } },
  ];

  const stats = [
    { label: 'Total RFPs', value: rfps.length },
    { label: 'Open', value: openCount },
    { label: 'Total Budget', value: formatCurrency(totalBudget) },
    { label: 'Responses', value: totalResponses },
  ];

  const detailSections: DetailSection[] = selectedRfp ? [
    { id: 'overview', title: 'RFP Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Title:</strong> {selectedRfp.title}</div>
        <div><strong>Type:</strong> {selectedRfp.project_type || 'General'}</div>
        <div><strong>Budget:</strong> {selectedRfp.budget_min && selectedRfp.budget_max ? `${formatCurrency(selectedRfp.budget_min)} - ${formatCurrency(selectedRfp.budget_max)}` : '—'}</div>
        <div><strong>Responses:</strong> {selectedRfp.responses?.[0]?.count || 0}</div>
        <div><strong>Deadline:</strong> {selectedRfp.submission_deadline ? new Date(selectedRfp.submission_deadline).toLocaleDateString() : '—'}</div>
        <div><strong>Status:</strong> {selectedRfp.status}</div>
        <div><strong>Created By:</strong> {selectedRfp.created_by_user?.full_name || '—'}</div>
        <div><strong>Created:</strong> {new Date(selectedRfp.created_at).toLocaleDateString()}</div>
        {selectedRfp.description && <div className="col-span-2"><strong>Description:</strong> {selectedRfp.description}</div>}
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<RFP>
        title="RFP Management"
        subtitle="Create and manage requests for proposals"
        data={rfps}
        columns={columns}
        rowKey="id"
        loading={loading}
        error={error ? new Error(error) : undefined}
        onRetry={fetchRFPs}
        searchPlaceholder="Search RFPs..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedRfp(r); setDrawerOpen(true); }}
        createLabel="Create RFP"
        onCreate={() => router.push('/rfp/new')}
        onExport={() => router.push('/rfp/templates')}
        stats={stats}
        emptyMessage="No RFPs found"
        emptyAction={{ label: 'Create RFP', onClick: () => router.push('/rfp/new') }}
        header={<Navigation />}
      />
      {selectedRfp && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedRfp}
          title={(r) => r.title}
          subtitle={(r) => `${r.project_type || 'General'} • ${r.status}`}
          sections={detailSections}
          actions={[{ id: 'edit', label: 'Edit RFP', icon: '✏️' }, { id: 'publish', label: 'Publish', icon: '📤' }]}
          onAction={(id, r) => { if (id === 'edit') router.push(`/rfp/${r.id}`); setDrawerOpen(false); }}
        />
      )}
    </>
  );
}
