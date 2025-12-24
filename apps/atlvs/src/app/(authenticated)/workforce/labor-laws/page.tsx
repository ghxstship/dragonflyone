'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, ExternalLink, Pencil } from 'lucide-react';
// Layout provided by route group
import {
  ListPage, Badge, DetailDrawer, Grid, Body,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection, } from '@ghxstship/ui';
import { createExportHandler, createImportHandler, getImportTemplates, useLaborLaws, type LaborLaw as APILaborLaw } from '@ghxstship/config';
import { DEMO_STATE_LABOR_LAWS } from '../../../../lib/demo-data';

type StateLaborLaw = APILaborLaw & { [key: string]: unknown };

const getStatusVariant = (status: string): 'solid' | 'outline' | 'ghost' => {
  switch (status) { case 'Active': return 'solid'; case 'Updated': return 'outline'; case 'Pending': return 'ghost'; default: return 'ghost'; }
};

const columns: ListPageColumn<StateLaborLaw>[] = [
  { key: 'state', label: 'State', accessor: (r) => `${r.state} (${r.stateCode})`, sortable: true },
  { key: 'category', label: 'Category', accessor: 'category', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'requirement', label: 'Requirement', accessor: 'requirement', sortable: true },
  { key: 'description', label: 'Description', accessor: 'description' },
  { key: 'lastUpdated', label: 'Last Updated', accessor: 'lastUpdated', sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'state', label: 'State', options: [{ value: 'California', label: 'California' }, { value: 'New York', label: 'New York' }, { value: 'Texas', label: 'Texas' }, { value: 'Illinois', label: 'Illinois' }, { value: 'Nevada', label: 'Nevada' }] },
  { key: 'category', label: 'Category', options: [{ value: 'Meal Breaks', label: 'Meal Breaks' }, { value: 'Rest Breaks', label: 'Rest Breaks' }, { value: 'Overtime', label: 'Overtime' }, { value: 'Spread of Hours', label: 'Spread of Hours' }] },
  { key: 'status', label: 'Status', options: [{ value: 'Active', label: 'Active' }, { value: 'Updated', label: 'Updated' }, { value: 'Pending', label: 'Pending' }] },
];

export default function LaborLawsPage() {
  const router = useRouter();
  const { laws: apiLaws, summary, isLoading, error, deleteLawsAsync, refetch } = useLaborLaws();
  const [selected, setSelected] = useState<StateLaborLaw | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Use API data or fall back to demo data
  const data: StateLaborLaw[] = apiLaws.length > 0 ? (apiLaws as StateLaborLaw[]) : (DEMO_STATE_LABOR_LAWS as StateLaborLaw[]);

  const totalStates = summary?.totalStates || new Set(data.map((l) => l.state)).size;
  const updatedLaws = summary?.updated || data.filter((l) => l.status === 'Updated').length;

  const rowActions: ListPageAction<StateLaborLaw>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'source', label: 'View Source', icon: <ExternalLink className="size-4" />, onClick: (r) => window.open(`https://www.dol.gov/agencies/whd/state/meal-rest-breaks#${r.stateCode}`, '_blank') },
  ];

  const stats = [
    { label: 'States Tracked', value: totalStates },
    { label: 'Total Laws', value: data.length },
    { label: 'Recent Updates', value: updatedLaws },
    { label: 'Active Laws', value: data.filter(l => l.status === 'Active').length },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Law Details', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>State:</strong> {selected.state} ({selected.stateCode})</Body>
        <Body size="sm"><strong>Category:</strong> {selected.category}</Body>
        <Body size="sm"><strong>Requirement:</strong> {selected.requirement}</Body>
        <Body size="sm"><strong>Status:</strong> {selected.status}</Body>
        <Body size="sm"><strong>Effective Date:</strong> {selected.effectiveDate}</Body>
        <Body size="sm"><strong>Last Updated:</strong> {selected.lastUpdated}</Body>
        <Body size="sm" className="col-span-2"><strong>Description:</strong> {selected.description}</Body>
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<StateLaborLaw, 'id'>>({

    entityType: 'labor-laws',

    requiredFields: ['state', 'category', 'requirement'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/labor-laws', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      // Data refreshed after import

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('labor-laws');


  return (
    <>
      <ListPage<StateLaborLaw>
        title="Multi-State Labor Law Management"
        subtitle="Track and comply with labor laws across all operating states"
        data={data}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error as Error | undefined}
        onRetry={() => refetch()}
        searchPlaceholder="Search labor laws..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        entityType="labor-laws"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['state', 'category', 'requirement', 'description', 'lastUpdated', 'status']}
        onExport={createExportHandler({
          filename: "labor-laws",
          getData: () => data.map(l => ({
            id: l.id,
            state: l.state,
            stateCode: l.stateCode,
            category: l.category,
            requirement: l.requirement,
            effectiveDate: l.effectiveDate,
            status: l.status,
          })),
        })}
        exportFormats={["csv", "json"]}
        stats={stats}
        emptyMessage="No labor laws found"
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await deleteLawsAsync(ids);
            refetch();
          }
        }}
        bulkActions={[
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
          title={(r) => r.requirement}
          subtitle={(r) => `${r.state} • ${r.category}`}
          sections={detailSections}
          actions={[{ id: 'source', label: 'View Source', icon: <ExternalLink className="size-4" /> }, { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" /> }]}
          onAction={(id, r) => {
            if (id === 'source') window.open(`https://www.dol.gov/agencies/whd/state/meal-rest-breaks#${r.stateCode}`, '_blank');
            if (id === 'edit') router.push(`/workforce/labor-laws/${r.id}/edit`);
            setDrawerOpen(false);
          }}
        />
      )}
    </>
  );
}
