"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, BarChart3 } from "lucide-react";
import { AtlvsAppLayout } from "../../components/app-layout";
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

interface Subsidiary {
  id: string;
  name: string;
  legal_name: string;
  entity_type: string;
  jurisdiction: string;
  incorporation_date: string;
  tax_id: string;
  parent_entity_id?: string;
  ownership_percentage: number;
  status: string;
  registered_agent?: string;
  primary_contact?: string;
  address?: string;
  annual_revenue?: number;
  employee_count?: number;
  [key: string]: unknown;
}

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
  const [subsidiaries, setSubsidiaries] = useState<Subsidiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<Subsidiary | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchSubsidiaries = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/subsidiaries");
      if (!response.ok) throw new Error("Failed to fetch subsidiaries");
      const data = await response.json();
      setSubsidiaries(data.subsidiaries || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubsidiaries(); }, [fetchSubsidiaries]);

  const activeCount = subsidiaries.filter(s => s.status === 'active').length;
  const totalRevenue = subsidiaries.reduce((sum, s) => sum + (s.annual_revenue || 0), 0);
  const jurisdictions = new Set(subsidiaries.map(s => s.jurisdiction)).size;

  const rowActions: ListPageAction<Subsidiary>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedEntity(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/subsidiaries/${r.id}/edit`) },
  ];

  const stats = [
    { label: 'Total Entities', value: subsidiaries.length },
    { label: 'Active', value: activeCount },
    { label: 'Combined Revenue', value: formatCurrency(totalRevenue) },
    { label: 'Jurisdictions', value: jurisdictions },
  ];

  const detailSections: DetailSection[] = selectedEntity ? [
    { id: 'overview', title: 'Entity Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Name:</strong> {selectedEntity.name}</div>
        <div><strong>Legal Name:</strong> {selectedEntity.legal_name}</div>
        <div><strong>Type:</strong> {selectedEntity.entity_type}</div>
        <div><strong>Jurisdiction:</strong> {selectedEntity.jurisdiction}</div>
        <div><strong>Ownership:</strong> {selectedEntity.ownership_percentage}%</div>
        <div><strong>Tax ID:</strong> {selectedEntity.tax_id}</div>
        <div><strong>Incorporated:</strong> {formatDate(selectedEntity.incorporation_date)}</div>
        <div><strong>Revenue:</strong> {selectedEntity.annual_revenue ? formatCurrency(selectedEntity.annual_revenue) : '—'}</div>
        <div><strong>Employees:</strong> {selectedEntity.employee_count || '—'}</div>
        <div><strong>Status:</strong> {selectedEntity.status}</div>
        {selectedEntity.registered_agent && <div><strong>Registered Agent:</strong> {selectedEntity.registered_agent}</div>}
        {selectedEntity.address && <div className="col-span-2"><strong>Address:</strong> {selectedEntity.address}</div>}
      </div>
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
        onRetry={fetchSubsidiaries}
        searchPlaceholder="Search entities..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedEntity(r); setDrawerOpen(true); }}
        createLabel="Add Entity"
        onCreate={() => router.push('/subsidiaries/new')}
        onExport={() => router.push('/subsidiaries/export')}
        stats={stats}
        emptyMessage="No subsidiaries found"
        emptyAction={{ label: 'Add Entity', onClick: () => router.push('/subsidiaries/new') }}
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Subsidiaries' }]}
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
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
