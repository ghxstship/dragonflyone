'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import {
  ListPage, Badge, DetailDrawer, Grid, Body,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection, } from '@ghxstship/ui';
import { createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';

import {
  DEMO_UNION_RULES,
  type DemoUnionRule as UnionRule,
} from '../../../lib/demo-data';

const getStatusVariant = (status: string): 'solid' | 'outline' | 'ghost' => {
  switch (status) { case 'Active': return 'solid'; case 'Pending': return 'outline'; case 'Expired': return 'ghost'; default: return 'ghost'; }
};

const columns: ListPageColumn<UnionRule>[] = [
  { key: 'union', label: 'Union', accessor: 'union', sortable: true, render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'category', label: 'Category', accessor: 'category', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'rule', label: 'Rule', accessor: 'rule', sortable: true },
  { key: 'description', label: 'Description', accessor: 'description' },
  { key: 'penalty', label: 'Penalty', accessor: (r) => r.penaltyAmount ? `$${r.penaltyAmount} (${r.penaltyType})` : '-' },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'union', label: 'Union', options: [{ value: 'IATSE Local 1', label: 'IATSE Local 1' }, { value: 'IBEW Local 3', label: 'IBEW Local 3' }, { value: 'Teamsters Local 817', label: 'Teamsters Local 817' }] },
  { key: 'category', label: 'Category', options: [{ value: 'Work Hours', label: 'Work Hours' }, { value: 'Meal Breaks', label: 'Meal Breaks' }, { value: 'Turnaround', label: 'Turnaround' }, { value: 'Overtime', label: 'Overtime' }, { value: 'Travel', label: 'Travel' }] },
  { key: 'status', label: 'Status', options: [{ value: 'Active', label: 'Active' }, { value: 'Pending', label: 'Pending' }, { value: 'Expired', label: 'Expired' }] },
];

export default function UnionRulesPage() {
  const router = useRouter();
  const [data] = useState<UnionRule[]>(DEMO_UNION_RULES);
  const [selected, setSelected] = useState<UnionRule | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeRules = data.filter((r) => r.status === 'Active').length;
  const totalPenalties = data.filter((r) => r.penaltyAmount).reduce((sum, r) => sum + (r.penaltyAmount || 0), 0);

  const rowActions: ListPageAction<UnionRule>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit Rule', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/workforce/union-rules/${r.id}/edit`) },
  ];

  const stats = [
    { label: 'Active Rules', value: activeRules },
    { label: 'Total Rules', value: data.length },
    { label: 'Unions', value: new Set(data.map(r => r.union)).size },
    { label: 'Total Penalties', value: `$${totalPenalties}` },
  ];

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Rule Details', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Union:</strong> {selected.union}</Body>
        <Body size="sm"><strong>Category:</strong> {selected.category}</Body>
        <Body size="sm"><strong>Rule:</strong> {selected.rule}</Body>
        <Body size="sm"><strong>Status:</strong> {selected.status}</Body>
        <Body size="sm"><strong>Effective Date:</strong> {selected.effectiveDate}</Body>
        <Body size="sm"><strong>Penalty:</strong> {selected.penaltyAmount ? `$${selected.penaltyAmount} (${selected.penaltyType})` : 'N/A'}</Body>
        <Body size="sm" className="col-span-2"><strong>Description:</strong> {selected.description}</Body>
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<UnionRule, 'id'>>({

    entityType: 'union-rules',

    requiredFields: ['union', 'category', 'rule'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/union-rules', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      // Data refreshed after import

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('union-rules');


  return (
    <AtlvsAppLayout>
      <ListPage<UnionRule>
        title="Union Rules & Compliance"
        subtitle="Track union rules, agreements, and compliance across all projects"
        data={data}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search union rules..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        entityType="union-rules"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['union', 'category', 'rule', 'description', 'penalty', 'status']}
        onExport={createExportHandler({
          filename: "union-rules",
          getData: () => data.map(r => ({
            id: r.id,
            union: r.union,
            category: r.category,
            rule: r.rule,
            effectiveDate: r.effectiveDate,
            status: r.status,
            penaltyType: r.penaltyType || '',
          })),
        })}
        exportFormats={["csv", "json"]}
        stats={stats}
        emptyMessage="No union rules found"
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/workforce/union-rules/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
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
          title={(r) => r.rule}
          subtitle={(r) => `${r.union} • ${r.category}`}
          sections={detailSections}
          actions={[{ id: 'edit', label: 'Edit Rule', icon: <Pencil className="size-4" /> }, { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" /> }]}
          onAction={(id, r) => {
            if (id === 'edit') router.push(`/workforce/union-rules/${r.id}/edit`);
            if (id === 'delete') fetch(`/api/workforce/union-rules/${r.id}`, { method: 'DELETE' });
            setDrawerOpen(false);
          }}
        />
      )}
    </AtlvsAppLayout>
  );
}
