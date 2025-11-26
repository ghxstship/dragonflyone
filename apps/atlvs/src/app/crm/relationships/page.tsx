"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../../components/navigation";
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

interface Stakeholder {
  id: string;
  name: string;
  role: string;
  company: string;
  influence: "High" | "Medium" | "Low";
  sentiment: "Champion" | "Supporter" | "Neutral" | "Skeptic" | "Blocker";
  decisionMaker: boolean;
  [key: string]: unknown;
}

const mockStakeholders: Stakeholder[] = [
  { id: "STK-001", name: "Sarah Johnson", role: "VP Marketing", company: "Acme Corp", influence: "High", sentiment: "Champion", decisionMaker: true },
  { id: "STK-002", name: "John Smith", role: "Director Events", company: "Acme Corp", influence: "Medium", sentiment: "Supporter", decisionMaker: false },
  { id: "STK-003", name: "Robert Brown", role: "CFO", company: "Acme Corp", influence: "High", sentiment: "Neutral", decisionMaker: true },
  { id: "STK-004", name: "Emily Davis", role: "Procurement", company: "Acme Corp", influence: "Low", sentiment: "Skeptic", decisionMaker: false },
];

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
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>(mockStakeholders);
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
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedStakeholder(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (r) => router.push(`/crm/relationships/${r.id}/edit`) },
  ];

  const stats = [
    { label: 'Total Stakeholders', value: stakeholders.length },
    { label: 'Decision Makers', value: stakeholders.filter(s => s.decisionMaker).length },
    { label: 'Champions', value: stakeholders.filter(s => s.sentiment === 'Champion').length },
    { label: 'High Influence', value: stakeholders.filter(s => s.influence === 'High').length },
  ];

  const detailSections: DetailSection[] = selectedStakeholder ? [
    { id: 'overview', title: 'Stakeholder Details', content: (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div><strong>Name:</strong> {selectedStakeholder.name}</div>
        <div><strong>Company:</strong> {selectedStakeholder.company}</div>
        <div><strong>Role:</strong> {selectedStakeholder.role}</div>
        <div><strong>Influence:</strong> {selectedStakeholder.influence}</div>
        <div><strong>Sentiment:</strong> {selectedStakeholder.sentiment}</div>
        <div><strong>Decision Maker:</strong> {selectedStakeholder.decisionMaker ? 'Yes' : 'No'}</div>
      </div>
    )},
  ] : [];

  return (
    <>
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
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No stakeholders found"
        emptyAction={{ label: 'Add Stakeholder', onClick: () => setCreateModalOpen(true) }}
        header={<Navigation />}
      />
      {selectedStakeholder && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedStakeholder}
          title={(s) => s.name}
          subtitle={(s) => `${s.role} • ${s.company}`}
          sections={detailSections}
          actions={[{ id: 'edit', label: 'Edit', icon: '✏️' }]}
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
    </>
  );
}
