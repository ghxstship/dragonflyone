"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import { useRisks } from "../../hooks/useRisks";
import {
  ListPage,
  Badge,
  DetailDrawer,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from "@ghxstship/ui";

interface Risk {
  id: string;
  title: string;
  description?: string;
  category: string;
  severity: string;
  status: string;
  owner?: { name: string };
  mitigation_plan?: string;
  [key: string]: unknown;
}

const getSeverityVariant = (severity: string): "solid" | "outline" | "ghost" => {
  switch (severity?.toLowerCase()) {
    case "critical": case "high": return "solid";
    case "medium": return "outline";
    default: return "ghost";
  }
};

const columns: ListPageColumn<Risk>[] = [
  { key: 'id', label: 'ID', accessor: (r) => r.id.substring(0, 12).toUpperCase(), sortable: true },
  { key: 'title', label: 'Risk', accessor: 'title', sortable: true },
  { key: 'category', label: 'Category', accessor: 'category', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'severity', label: 'Severity', accessor: 'severity', sortable: true, render: (v) => <Badge variant={getSeverityVariant(String(v))}>{String(v)}</Badge> },
  { key: 'status', label: 'Status', accessor: 'status' },
  { key: 'owner', label: 'Owner', accessor: (r) => r.owner?.name || 'Unassigned' },
];

const filters: ListPageFilter[] = [
  { key: 'severity', label: 'Severity', options: [{ value: 'critical', label: 'Critical' }, { value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }] },
  { key: 'status', label: 'Status', options: [{ value: 'identified', label: 'Identified' }, { value: 'analyzing', label: 'Analyzing' }, { value: 'mitigating', label: 'Mitigating' }, { value: 'mitigated', label: 'Mitigated' }] },
];

export default function RisksPage() {
  const router = useRouter();
  const { data: risks, isLoading, error, refetch } = useRisks({});
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const riskData = (risks || []) as unknown as Risk[];
  const highSeverity = riskData.filter(r => r.severity === "high" || r.severity === "critical").length;
  const activeRisks = riskData.filter(r => ["identified", "analyzing", "mitigating"].includes(r.status)).length;
  const mitigatedRisks = riskData.filter(r => r.status === "mitigated").length;

  const rowActions: ListPageAction<Risk>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedRisk(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (r) => router.push(`/risks/${r.id}/edit`) },
  ];

  const stats = [
    { label: 'Total Risks', value: riskData.length },
    { label: 'Active', value: activeRisks },
    { label: 'High Severity', value: highSeverity },
    { label: 'Mitigated', value: mitigatedRisks },
  ];

  const detailSections: DetailSection[] = selectedRisk ? [
    { id: 'overview', title: 'Risk Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>ID:</strong> {selectedRisk.id.substring(0, 12).toUpperCase()}</div>
        <div><strong>Title:</strong> {selectedRisk.title}</div>
        <div><strong>Category:</strong> {selectedRisk.category}</div>
        <div><strong>Severity:</strong> {selectedRisk.severity}</div>
        <div><strong>Status:</strong> {selectedRisk.status}</div>
        <div><strong>Owner:</strong> {selectedRisk.owner?.name || 'Unassigned'}</div>
        {selectedRisk.description && <div className="col-span-2"><strong>Description:</strong> {selectedRisk.description}</div>}
        {selectedRisk.mitigation_plan && <div className="col-span-2"><strong>Mitigation Plan:</strong> {selectedRisk.mitigation_plan}</div>}
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<Risk>
        title="Risk Management"
        subtitle="Identify, assess, and mitigate organizational risks"
        data={riskData}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error instanceof Error ? error : undefined}
        onRetry={refetch}
        searchPlaceholder="Search risks..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedRisk(r); setDrawerOpen(true); }}
        createLabel="Report New Risk"
        onCreate={() => router.push('/risks/new')}
        onExport={() => router.push('/risks/export')}
        stats={stats}
        emptyMessage="No risks found"
        emptyAction={{ label: 'Report New Risk', onClick: () => router.push('/risks/new') }}
        header={<Navigation />}
      />
      {selectedRisk && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedRisk}
          title={(r) => r.title}
          subtitle={(r) => `${r.category} • ${r.severity}`}
          sections={detailSections}
          actions={[{ id: 'edit', label: 'Edit Risk', icon: '✏️' }]}
          onAction={(id, r) => { if (id === 'edit') router.push(`/risks/${r.id}/edit`); setDrawerOpen(false); }}
        />
      )}
    </>
  );
}
