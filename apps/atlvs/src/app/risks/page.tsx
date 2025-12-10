"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil } from "lucide-react";
import { AtlvsAppLayout } from "../../components/app-layout";
import { useRisks } from "../../hooks/useRisks";
import {
  ListPage,
  Badge,
  DetailDrawer,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates, createImportHandler, getImportTemplates } from '@ghxstship/config';

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
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedRisk(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/risks/${r.id}/edit`) },
  ];

  const stats = [
    { label: 'Total Risks', value: riskData.length },
    { label: 'Active', value: activeRisks },
    { label: 'High Severity', value: highSeverity },
    { label: 'Mitigated', value: mitigatedRisks },
  ];

  const detailSections: DetailSection[] = selectedRisk ? [
    { id: 'overview', title: 'Risk Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>ID:</strong> {selectedRisk.id.substring(0, 12).toUpperCase()}</Body>
        <Body size="sm"><strong>Title:</strong> {selectedRisk.title}</Body>
        <Body size="sm"><strong>Category:</strong> {selectedRisk.category}</Body>
        <Body size="sm"><strong>Severity:</strong> {selectedRisk.severity}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedRisk.status}</Body>
        <Body size="sm"><strong>Owner:</strong> {selectedRisk.owner?.name || 'Unassigned'}</Body>
        {selectedRisk.description && <Body size="sm" className="col-span-2"><strong>Description:</strong> {selectedRisk.description}</Body>}
        {selectedRisk.mitigation_plan && <Body size="sm" className="col-span-2"><strong>Mitigation Plan:</strong> {selectedRisk.mitigation_plan}</Body>}
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<Risk, 'id'>>({

    entityType: 'risks',

    requiredFields: ['risks', 'title', 'category'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/risks', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      refetch();

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('risks');


  return (
    <AtlvsAppLayout>
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
        entityType="risks"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['risks', 'title', 'category', 'severity', 'status', 'owner']}
        onExport={createExportHandler({
          filename: "risks",
          getData: () => (risks || []).map(r => ({
            id: r.id,
            title: r.title,
            category: r.category,
            severity: r.severity,
            probability: r.probability,
            status: r.status,
            owner: r.owner || '',
          })),
        })}
        stats={stats}
        emptyMessage="No risks found"
        emptyAction={{ label: 'Report New Risk', onClick: () => router.push('/risks/new') }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/risks/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch();
          } else if (action === 'resolve') {
            await fetch('/api/risks/bulk-resolve', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch();
          }
        }}
        bulkActions={[
          { id: 'resolve', label: 'Resolve Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />
      {selectedRisk && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedRisk}
          title={(r) => r.title}
          subtitle={(r) => `${r.category} • ${r.severity}`}
          sections={detailSections}
          actions={[{ id: 'edit', label: 'Edit Risk', icon: <Pencil className="size-4" /> }]}
          onAction={(id, r) => { if (id === 'edit') router.push(`/risks/${r.id}/edit`); setDrawerOpen(false); }}
        />
      )}
    </AtlvsAppLayout>
  );
}
