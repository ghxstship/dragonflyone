"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, BarChart3 } from "lucide-react";
import { AtlvsAppLayout } from "../../components/app-layout";
import {
  ListPage,
  Badge,
  DetailDrawer,
  RecordFormModal,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
  type FormFieldConfig,
} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates, log} from '@ghxstship/config';
import { useScenariosData, type Scenario } from "@/hooks/useScenarios";

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
  const {
    scenarios,
    summary,
    isLoading: loading,
    error,
    createScenario,
    refetch,
  } = useScenariosData();

  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const rowActions: ListPageAction<Scenario>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedScenario(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/scenarios/${r.id}/edit`) },
    { id: 'compare', label: 'Compare', icon: <BarChart3 className="size-4" />, onClick: (r) => router.push(`/scenarios/compare?id=${r.id}`) },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await createScenario(data);
      setCreateModalOpen(false);
    } catch (err) {
      log.error('Failed to create scenario:', err instanceof Error ? err : undefined);
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
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Name:</strong> {selectedScenario.name}</Body>
        <Body size="sm"><strong>Category:</strong> {selectedScenario.category}</Body>
        <Body size="sm"><strong>Type:</strong> {selectedScenario.scenario_type?.replace("_", " ")}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedScenario.status}</Body>
        <Body size="sm"><strong>Revenue Forecast:</strong> {formatCurrency(selectedScenario.revenue_forecast || 0)}</Body>
        <Body size="sm"><strong>Cost Forecast:</strong> {formatCurrency(selectedScenario.cost_forecast || 0)}</Body>
        <Body size="sm"><strong>Probability:</strong> {selectedScenario.probability}%</Body>
        <Body size="sm"><strong>Impact:</strong> {selectedScenario.impact_level}</Body>
        {selectedScenario.description && <Body size="sm" className="col-span-2"><strong>Description:</strong> {selectedScenario.description}</Body>}
        {selectedScenario.assumptions?.length > 0 && (
          <Body size="sm" className="col-span-2"><strong>Assumptions:</strong> {selectedScenario.assumptions.join(', ')}</Body>
        )}
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<Scenario, 'id'>>({

    entityType: 'scenarios',

    requiredFields: ['name', 'category', 'scenario_type'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/scenarios', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      refetch();

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('scenarios');


  return (
    <AtlvsAppLayout>
      <ListPage<Scenario>
        title="Scenario Planning"
        subtitle="Model different business scenarios and outcomes"
        data={scenarios}
        columns={columns}
        rowKey="id"
        loading={loading}
        error={error ? new Error(error) : undefined}
        onRetry={() => refetch()}
        searchPlaceholder="Search scenarios..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedScenario(r); setDrawerOpen(true); }}
        createLabel="Create Scenario"
        onCreate={() => setCreateModalOpen(true)}
        entityType="scenarios"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['name', 'category', 'scenario_type', 'revenue_forecast', 'cost_forecast', 'probability', 'impact_level']}
        onExport={createExportHandler({
          filename: "scenarios",
          getData: () => scenarios.map(s => ({
            id: s.id,
            name: s.name,
            type: s.scenario_type,
            status: s.status,
            revenue_impact: s.revenue_forecast,
            cost_impact: s.cost_forecast,
            probability: s.probability,
          })),
        })}
        stats={stats}
        emptyMessage="No scenarios found"
        emptyAction={{ label: 'Create Scenario', onClick: () => setCreateModalOpen(true) }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/scenarios/bulk', {
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
            { id: 'compare', label: 'Compare', icon: <BarChart3 className="size-4" /> },
          ]}
          onAction={(id, s) => {
            if (id === 'compare') router.push(`/scenarios/compare?id=${s.id}`);
            setDrawerOpen(false);
          }}
        />
      )}
    </AtlvsAppLayout>
  );
}
