"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Check } from "lucide-react";
// Layout provided by route group
import {
  ListPage, Badge, DetailDrawer, Grid, Body,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection,
} from "@ghxstship/ui";
import { getBadgeVariant, createExportHandler, createImportHandler, getImportTemplates, useDamageReports, type DamageReport } from "@ghxstship/config";
import { DEMO_DAMAGE_REPORTS } from '../../../../lib/demo-data';

const getSeverityVariant = (severity: string): 'solid' | 'outline' | 'ghost' => {
  switch (severity) { case 'Critical': return 'solid'; case 'Major': return 'outline'; case 'Moderate': return 'outline'; case 'Minor': return 'ghost'; default: return 'ghost'; }
};

const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<DamageReport>[] = [
  { key: 'assetName', label: 'Asset', accessor: (r) => `${r.assetName} (${r.assetId})`, sortable: true },
  { key: 'category', label: 'Category', accessor: 'category', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'description', label: 'Description', accessor: (r) => r.description.substring(0, 50) + '...' },
  { key: 'severity', label: 'Severity', accessor: 'severity', sortable: true, render: (v) => <Badge variant={getSeverityVariant(String(v))}>{String(v)}</Badge> },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
  { key: 'estimatedCost', label: 'Est. Cost', accessor: (r) => r.estimatedCost ? `$${r.estimatedCost}` : '-' },
  { key: 'reportedDate', label: 'Reported', accessor: 'reportedDate', sortable: true },
];

const filters: ListPageFilter[] = [
  { key: 'severity', label: 'Severity', options: [{ value: 'Critical', label: 'Critical' }, { value: 'Major', label: 'Major' }, { value: 'Moderate', label: 'Moderate' }, { value: 'Minor', label: 'Minor' }] },
  { key: 'status', label: 'Status', options: [{ value: 'Reported', label: 'Reported' }, { value: 'Under Review', label: 'Under Review' }, { value: 'Repair Scheduled', label: 'Repair Scheduled' }, { value: 'In Repair', label: 'In Repair' }, { value: 'Resolved', label: 'Resolved' }] },
];

export default function DamageReportsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<DamageReport | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Real API integration with demo fallback
  const { reports: apiData, isLoading, error, deleteReportsAsync, resolveReportsAsync, refetch } = useDamageReports();
  const data: DamageReport[] = apiData.length > 0 ? apiData : (DEMO_DAMAGE_REPORTS as DamageReport[]);

  const activeReports = data.filter(r => !["Resolved", "Write-Off"].includes(r.status)).length;
  const criticalCount = data.filter(r => r.severity === "Critical" && r.status !== "Resolved").length;
  const totalEstimatedCost = data.filter(r => r.status !== "Resolved").reduce((sum, r) => sum + (r.estimatedCost || 0), 0);

  const rowActions: ListPageAction<DamageReport>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'update', label: 'Update Status', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/assets/damage-reports/${r.id}/edit`) },
  ];

  const stats = [
    { label: 'Active Reports', value: activeReports },
    { label: 'Critical Issues', value: criticalCount },
    { label: 'Est. Repair Cost', value: `$${totalEstimatedCost.toLocaleString()}` },
    { label: 'Total Reports', value: data.length },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Damage Report Details', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Asset:</strong> {selected.assetName}</Body>
        <Body size="sm"><strong>Category:</strong> {selected.category}</Body>
        <Body size="sm"><strong>Severity:</strong> {selected.severity}</Body>
        <Body size="sm"><strong>Status:</strong> {selected.status}</Body>
        <Body size="sm"><strong>Location:</strong> {selected.location}</Body>
        <Body size="sm"><strong>Reported By:</strong> {selected.reportedBy}</Body>
        <Body size="sm"><strong>Reported Date:</strong> {selected.reportedDate}</Body>
        <Body size="sm"><strong>Est. Cost:</strong> {selected.estimatedCost ? `$${selected.estimatedCost}` : 'N/A'}</Body>
        <Body size="sm" className="col-span-2"><strong>Description:</strong> {selected.description}</Body>
        {selected.repairVendor && <Body size="sm"><strong>Repair Vendor:</strong> {selected.repairVendor}</Body>}
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<DamageReport, 'id'>>({

    entityType: 'damage-reports',

    requiredFields: ['assetName', 'category', 'description'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/damage-reports', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      // Data refreshed after import

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('damage-reports');


  return (
    <>
      <ListPage<DamageReport>
        title="Damage Reports & Repairs"
        subtitle="Track equipment damage, repairs, and insurance claims"
        data={data}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error as Error | undefined}
        searchPlaceholder="Search damage reports..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        entityType="damage-reports"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['assetName', 'category', 'description', 'severity', 'status', 'estimatedCost', 'reportedDate']}
        onExport={createExportHandler({
          filename: "damage-reports",
          getData: () => data.map(d => ({
            id: d.id,
            assetId: d.assetId,
            assetName: d.assetName,
            category: d.category,
            reportedBy: d.reportedBy,
            reportedDate: d.reportedDate,
            severity: d.severity,
            status: d.status,
            description: d.description || '',
          })),
        })}
        stats={stats}
        emptyMessage="No damage reports found"
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await deleteReportsAsync(ids);
            refetch();
          } else if (action === 'resolve') {
            await resolveReportsAsync(ids);
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
      {selected && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selected}
          title={(r) => r.assetName}
          subtitle={(r) => `${r.severity} • ${r.status}`}
          sections={detailSections}
          actions={[{ id: 'update', label: 'Update Status', icon: <Pencil className="size-4" /> }, { id: 'resolve', label: 'Resolve', icon: <Check className="size-4" /> }]}
          onAction={(id, r) => {
            if (id === 'update') router.push(`/assets/damage-reports/${r.id}/edit`);
            if (id === 'resolve') router.push(`/assets/damage-reports/${r.id}/resolve`);
            setDrawerOpen(false);
          }}
        />
      )}
    </>
  );
}
