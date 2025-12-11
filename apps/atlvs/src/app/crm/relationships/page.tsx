"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil } from "lucide-react";
import { AtlvsAppLayout } from "../../../components/app-layout";
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
import { createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';
import {
  DEMO_STAKEHOLDERS,
  type DemoStakeholder as Stakeholder,
} from '../../../lib/demo-data';

const getSentimentVariant = (sentiment: string): "solid" | "outline" | "ghost" => {
  switch (sentiment) {
    case "Champion": return "solid";
    case "Supporter": case "Neutral": return "outline";
    default: return "ghost";
  }
};

const columns: ListPageColumn<Stakeholder>[] = [
  { key: 'name', label: 'Stakeholder', accessor: 'name', sortable: true },
  { key: 'company', label: 'Company', accessor: 'company' },
  { key: 'role', label: 'Role', accessor: 'role' },
  { key: 'influence', label: 'Influence', accessor: 'influence', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'sentiment', label: 'Sentiment', accessor: 'sentiment', sortable: true, render: (v) => <Badge variant={getSentimentVariant(String(v))}>{String(v)}</Badge> },
  { key: 'decisionMaker', label: 'Decision Maker', accessor: (r) => r.decisionMaker ? 'Yes' : 'No' },
];

const filters: ListPageFilter[] = [
  { key: 'influence', label: 'Influence', options: [{ value: 'High', label: 'High' }, { value: 'Medium', label: 'Medium' }, { value: 'Low', label: 'Low' }] },
  { key: 'sentiment', label: 'Sentiment', options: [{ value: 'Champion', label: 'Champion' }, { value: 'Supporter', label: 'Supporter' }, { value: 'Neutral', label: 'Neutral' }, { value: 'Skeptic', label: 'Skeptic' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'company', label: 'Company', type: 'text', required: true },
  { name: 'role', label: 'Role', type: 'text', required: true },
  { name: 'influence', label: 'Influence', type: 'select', options: [{ value: 'High', label: 'High' }, { value: 'Medium', label: 'Medium' }, { value: 'Low', label: 'Low' }] },
  { name: 'sentiment', label: 'Sentiment', type: 'select', options: [{ value: 'Champion', label: 'Champion' }, { value: 'Supporter', label: 'Supporter' }, { value: 'Neutral', label: 'Neutral' }] },
];

export default function RelationshipsPage() {
  const router = useRouter();
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(DEMO_STAKEHOLDERS);
  const [selectedStakeholder, setSelectedStakeholder] = useState<Stakeholder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleCreate = async (data: Record<string, unknown>) => {
    const newStakeholder: Stakeholder = {
      id: `STK-${Date.now()}`,
      name: String(data.name),
      company: String(data.company),
      role: String(data.role),
      influence: (data.influence as Stakeholder['influence']) || 'Medium',
      sentiment: (data.sentiment as Stakeholder['sentiment']) || 'Neutral',
      decisionMaker: false,
    };
    setStakeholders([...stakeholders, newStakeholder]);
    setCreateModalOpen(false);
  };

  const rowActions: ListPageAction<Stakeholder>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedStakeholder(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/crm/relationships/${r.id}/edit`) },
  ];

  const stats = [
    { label: 'Total Stakeholders', value: stakeholders.length },
    { label: 'Decision Makers', value: stakeholders.filter(s => s.decisionMaker).length },
    { label: 'Champions', value: stakeholders.filter(s => s.sentiment === 'Champion').length },
    { label: 'High Influence', value: stakeholders.filter(s => s.influence === 'High').length },
  ];

  const detailSections: DetailSection[] = selectedStakeholder ? [
    { id: 'overview', title: 'Stakeholder Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Name:</strong> {selectedStakeholder.name}</Body>
        <Body size="sm"><strong>Company:</strong> {selectedStakeholder.company}</Body>
        <Body size="sm"><strong>Role:</strong> {selectedStakeholder.role}</Body>
        <Body size="sm"><strong>Influence:</strong> {selectedStakeholder.influence}</Body>
        <Body size="sm"><strong>Sentiment:</strong> {selectedStakeholder.sentiment}</Body>
        <Body size="sm"><strong>Decision Maker:</strong> {selectedStakeholder.decisionMaker ? 'Yes' : 'No'}</Body>
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<Stakeholder, 'id'>>({

    entityType: 'stakeholders',

    requiredFields: ['name', 'company', 'role'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/stakeholders', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      // Data will be refreshed on next page load

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('stakeholders');


  return (
    <AtlvsAppLayout>
      <ListPage<Stakeholder>
        title="Relationship Mapping"
        subtitle="Visualize and manage stakeholder relationships"
        data={stakeholders}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search stakeholders..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedStakeholder(r); setDrawerOpen(true); }}
        createLabel="Add Stakeholder"
        onCreate={() => setCreateModalOpen(true)}
        entityType="stakeholders"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['name', 'company', 'role', 'influence', 'sentiment', 'stakeholders', 'decisionMaker']}
        onExport={createExportHandler({
          filename: "stakeholders",
          getData: () => stakeholders.map(s => ({
            id: s.id,
            name: s.name,
            role: s.role,
            company: s.company,
            email: s.email,
            phone: s.phone || '',
            influence: s.influence,
            sentiment: s.sentiment,
          })),
        })}
        stats={stats}
        emptyMessage="No stakeholders found"
        emptyAction={{ label: 'Add Stakeholder', onClick: () => setCreateModalOpen(true) }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            setStakeholders(prev => prev.filter(s => !ids.includes(s.id)));
          }
        }}
        bulkActions={[
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />
      {selectedStakeholder && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedStakeholder}
          title={(s) => s.name}
          subtitle={(s) => `${s.role} • ${s.company}`}
          sections={detailSections}
          actions={[{ id: 'edit', label: 'Edit', icon: <Pencil className="size-4" /> }]}
          onAction={(id, s) => { if (id === 'edit') router.push(`/crm/relationships/${s.id}/edit`); setDrawerOpen(false); }}
        />
      )}
      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Stakeholder"
        fields={formFields}
        onSubmit={handleCreate}
        mode="create"
      />
    </AtlvsAppLayout>
  );
}
