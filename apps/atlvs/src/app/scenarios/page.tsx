"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
  ListPage,
  Badge,
  DetailDrawer,
  RecordFormModal,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
  type FormFieldConfig,
} from "@ghxstship/ui";

interface Scenario {
  id: string;
  name: string;
  description: string;
  category: string;
  scenario_type: string;
  revenue_forecast: number;
  cost_forecast: number;
  probability: number;
  impact_level: string;
  assumptions: string[];
  status: string;
  created_at: string;
}

interface ScenarioSummary {
  total: number;
  best_case_revenue: number;
  base_case_revenue: number;
  worst_case_revenue: number;
}

const formatCurrency = (amount: number) => {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
  return `$${amount.toFixed(0)}`;
};

const getImpactVariant = (impact: string): "solid" | "outline" | "ghost" => {
  switch (impact?.toLowerCase()) {
    case "critical":
    case "high":
      return "solid";
    case "medium":
      return "outline";
    default:
      return "ghost";
  }
};

const columns: ListPageColumn<Scenario>[] = [
  { key: 'name', label: 'Scenario', accessor: 'name', sortable: true },
  { key: 'category', label: 'Category', accessor: 'category', sortable: true, render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'scenario_type', label: 'Type', accessor: (r) => r.scenario_type?.replace("_", " ") || '—' },
  { key: 'revenue_forecast', label: 'Revenue', accessor: (r) => formatCurrency(r.revenue_forecast || 0), sortable: true },
  { key: 'probability', label: 'Probability', accessor: (r) => `${r.probability || 0}%`, sortable: true },
  { key: 'impact_level', label: 'Impact', accessor: 'impact_level', sortable: true, render: (v) => <Badge variant={getImpactVariant(String(v))}>{String(v || 'Unknown')}</Badge> },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={v === 'active' ? 'solid' : 'outline'}>{String(v || 'Draft')}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'category', label: 'Category', options: [
    { value: 'financial', label: 'Financial' },
    { value: 'operational', label: 'Operational' },
    { value: 'market', label: 'Market' },
    { value: 'strategic', label: 'Strategic' },
    { value: 'risk', label: 'Risk' },
  ]},
  { key: 'impact_level', label: 'Impact', options: [
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ]},
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Scenario Name', type: 'text', required: true, colSpan: 2 },
  { name: 'category', label: 'Category', type: 'select', required: true, options: [
    { value: 'financial', label: 'Financial' },
    { value: 'operational', label: 'Operational' },
    { value: 'market', label: 'Market' },
    { value: 'strategic', label: 'Strategic' },
    { value: 'risk', label: 'Risk' },
  ]},
  { name: 'scenario_type', label: 'Type', type: 'select', required: true, options: [
    { value: 'best_case', label: 'Best Case' },
    { value: 'base_case', label: 'Base Case' },
    { value: 'worst_case', label: 'Worst Case' },
  ]},
  { name: 'revenue_forecast', label: 'Revenue Forecast', type: 'number', required: true },
  { name: 'cost_forecast', label: 'Cost Forecast', type: 'number' },
  { name: 'probability', label: 'Probability (%)', type: 'number', required: true },
  { name: 'impact_level', label: 'Impact Level', type: 'select', options: [
    { value: 'critical', label: 'Critical' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ]},
  { name: 'description', label: 'Description', type: 'textarea', colSpan: 2 },
];

export default function ScenariosPage() {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [summary, setSummary] = useState<ScenarioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const fetchScenarios = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/scenarios');
      if (!response.ok) throw new Error("Failed to fetch scenarios");
      const data = await response.json();
      setScenarios(data.scenarios || []);
      setSummary(data.summary || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchScenarios();
  }, [fetchScenarios]);

  const rowActions: ListPageAction<Scenario>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedScenario(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (r) => router.push(`/scenarios/${r.id}/edit`) },
    { id: 'compare', label: 'Compare', icon: '📊', onClick: (r) => router.push(`/scenarios/compare?id=${r.id}`) },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setCreateModalOpen(false);
        fetchScenarios();
      }
    } catch (err) {
      console.error('Failed to create scenario:', err);
    }
  };

  const stats = [
    { label: 'Total Scenarios', value: summary?.total || scenarios.length },
    { label: 'Best Case', value: formatCurrency(summary?.best_case_revenue || 0) },
    { label: 'Base Case', value: formatCurrency(summary?.base_case_revenue || 0) },
    { label: 'Worst Case', value: formatCurrency(summary?.worst_case_revenue || 0) },
  ];

  const detailSections: DetailSection[] = selectedScenario ? [
    { id: 'overview', title: 'Scenario Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Name:</strong> {selectedScenario.name}</div>
        <div><strong>Category:</strong> {selectedScenario.category}</div>
        <div><strong>Type:</strong> {selectedScenario.scenario_type?.replace("_", " ")}</div>
        <div><strong>Status:</strong> {selectedScenario.status}</div>
        <div><strong>Revenue Forecast:</strong> {formatCurrency(selectedScenario.revenue_forecast || 0)}</div>
        <div><strong>Cost Forecast:</strong> {formatCurrency(selectedScenario.cost_forecast || 0)}</div>
        <div><strong>Probability:</strong> {selectedScenario.probability}%</div>
        <div><strong>Impact:</strong> {selectedScenario.impact_level}</div>
        {selectedScenario.description && <div className="col-span-2"><strong>Description:</strong> {selectedScenario.description}</div>}
        {selectedScenario.assumptions?.length > 0 && (
          <div className="col-span-2"><strong>Assumptions:</strong> {selectedScenario.assumptions.join(', ')}</div>
        )}
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<Scenario>
        title="Scenario Planning"
        subtitle="Model different business scenarios and outcomes"
        data={scenarios}
        columns={columns}
        rowKey="id"
        loading={loading}
        error={error ? new Error(error) : undefined}
        onRetry={fetchScenarios}
        searchPlaceholder="Search scenarios..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedScenario(r); setDrawerOpen(true); }}
        createLabel="Create Scenario"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => router.push('/scenarios/export')}
        stats={stats}
        emptyMessage="No scenarios found"
        emptyAction={{ label: 'Create Scenario', onClick: () => setCreateModalOpen(true) }}
        header={<CreatorNavigationAuthenticated />}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create Scenario"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />

      {selectedScenario && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedScenario}
          title={(s) => s.name}
          subtitle={(s) => `${s.category} • ${s.scenario_type?.replace("_", " ")}`}
          sections={detailSections}
          onEdit={(s) => router.push(`/scenarios/${s.id}/edit`)}
          actions={[
            { id: 'compare', label: 'Compare', icon: '📊' },
          ]}
          onAction={(id, s) => {
            if (id === 'compare') router.push(`/scenarios/compare?id=${s.id}`);
            setDrawerOpen(false);
          }}
        />
      )}
    </>
  );
}
