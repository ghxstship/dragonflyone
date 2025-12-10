"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, BarChart3 } from "lucide-react";
import { AtlvsAppLayout } from "../../components/app-layout";
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
import { getBadgeVariant, createExportHandler, createImportHandler, getImportTemplates } from "@ghxstship/config";
import { useSubsidiariesData, type Subsidiary } from "@/hooks/useSubsidiaries";

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
};
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<Subsidiary>[] = [
  { key: 'name', label: 'Entity Name', accessor: 'name', sortable: true },
  { key: 'entity_type', label: 'Type', accessor: 'entity_type' },
  { key: 'jurisdiction', label: 'Jurisdiction', accessor: 'jurisdiction', sortable: true },
  { key: 'ownership_percentage', label: 'Ownership', accessor: (r) => `${r.ownership_percentage}%`, sortable: true },
  { key: 'incorporation_date', label: 'Incorporated', accessor: (r) => formatDate(r.incorporation_date), sortable: true },
  { key: 'annual_revenue', label: 'Revenue', accessor: (r) => r.annual_revenue ? formatCurrency(r.annual_revenue) : '—', sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }, { value: 'pending', label: 'Pending' }] },
  { key: 'entity_type', label: 'Type', options: [{ value: 'LLC', label: 'LLC' }, { value: 'C-Corp', label: 'C-Corp' }, { value: 'S-Corp', label: 'S-Corp' }] },
];

export default function SubsidiariesPage() {
  const router = useRouter();
  const {
    subsidiaries,
    totalRevenue,
    totalEmployees,
    isLoading: loading,
    error,
    refetch,
  } = useSubsidiariesData();

  const [selectedEntity, setSelectedEntity] = useState<Subsidiary | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeCount = subsidiaries.filter((s: Subsidiary) => s.status === 'active').length;

  const rowActions: ListPageAction<Subsidiary>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedEntity(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/subsidiaries/${r.id}/edit`) },
  ];

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'subsidiaries',
    requiredFields: ['name', 'legal_name', 'entity_type'],
    onImport: async (records) => {
      for (const record of records) {
        await fetch('/api/subsidiaries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
      }
    },
  });

  const importTemplates = getImportTemplates('subsidiaries').length > 0 
    ? getImportTemplates('subsidiaries') 
    : [{ id: 'default', name: 'Subsidiary Import', mapping: { name: 'name', legal_name: 'legal_name', entity_type: 'entity_type', jurisdiction: 'jurisdiction', status: 'status' } }];

  const stats = [
    { label: 'Total Entities', value: subsidiaries.length },
    { label: 'Active', value: activeCount },
    { label: 'Combined Revenue', value: formatCurrency(totalRevenue) },
    { label: 'Total Employees', value: totalEmployees },
  ];

  const detailSections: DetailSection[] = selectedEntity ? [
    { id: 'overview', title: 'Entity Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Name:</strong> {selectedEntity.name}</Body>
        <Body size="sm"><strong>Legal Name:</strong> {selectedEntity.legal_name}</Body>
        <Body size="sm"><strong>Type:</strong> {selectedEntity.entity_type}</Body>
        <Body size="sm"><strong>Jurisdiction:</strong> {selectedEntity.jurisdiction}</Body>
        <Body size="sm"><strong>Ownership:</strong> {selectedEntity.ownership_percentage}%</Body>
        <Body size="sm"><strong>Tax ID:</strong> {selectedEntity.tax_id}</Body>
        <Body size="sm"><strong>Incorporated:</strong> {formatDate(selectedEntity.incorporation_date)}</Body>
        <Body size="sm"><strong>Revenue:</strong> {selectedEntity.annual_revenue ? formatCurrency(selectedEntity.annual_revenue) : '—'}</Body>
        <Body size="sm"><strong>Employees:</strong> {selectedEntity.employee_count || '—'}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedEntity.status}</Body>
        {selectedEntity.registered_agent && <Body size="sm"><strong>Registered Agent:</strong> {selectedEntity.registered_agent}</Body>}
        {selectedEntity.address && <Body size="sm" className="col-span-2"><strong>Address:</strong> {selectedEntity.address}</Body>}
      </Grid>
    )},
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<Subsidiary>
        title="Legal Entities & Subsidiaries"
        subtitle="Manage corporate structure and legal entity documentation"
        data={subsidiaries}
        columns={columns}
        rowKey="id"
        loading={loading}
        error={error ? new Error(error) : undefined}
        onRetry={() => refetch()}
        searchPlaceholder="Search entities..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedEntity(r); setDrawerOpen(true); }}
        createLabel="Add Entity"
        onCreate={() => router.push('/subsidiaries/new')}
        entityType="subsidiaries"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['name', 'legal_name', 'entity_type', 'jurisdiction', 'status']}
        onExport={createExportHandler({
          filename: "subsidiaries",
          getData: () => subsidiaries.map(e => ({
            id: e.id,
            name: e.name,
            type: e.entity_type,
            jurisdiction: e.jurisdiction,
            status: e.status,
            ownership: e.ownership_percentage,
            revenue: e.annual_revenue,
          })),
        })}
        stats={stats}
        emptyMessage="No subsidiaries found"
        emptyAction={{ label: 'Add Entity', onClick: () => router.push('/subsidiaries/new') }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/subsidiaries/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            await refetch();
          }
        }}
        bulkActions={[
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />
      {selectedEntity && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedEntity}
          title={(e) => e.name}
          subtitle={(e) => `${e.entity_type} • ${e.jurisdiction}`}
          sections={detailSections}
          actions={[{ id: 'edit', label: 'Edit Entity', icon: <Pencil className="size-4" /> }, { id: 'orgchart', label: 'Org Chart', icon: <BarChart3 className="size-4" /> }]}
          onAction={(id, e) => { if (id === 'edit') router.push(`/subsidiaries/${e.id}/edit`); setDrawerOpen(false); }}
        />
      )}
    </AtlvsAppLayout>
  );
}
