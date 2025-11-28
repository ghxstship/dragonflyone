"use client";

import { useState } from "react";
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

interface KeyResult {
  kr: string;
  progress: number;
}

interface OKR {
  id: string;
  objective: string;
  owner: string;
  progress: number;
  keyResults: KeyResult[];
}

const mockOKRs: OKR[] = [
  { id: "OKR-Q4-001", objective: "Scale Production Capacity 50%", owner: "Operations", progress: 65, keyResults: [
    { kr: "Hire 15 new crew members", progress: 80 },
    { kr: "Acquire $2M in new equipment", progress: 60 },
    { kr: "Open second warehouse facility", progress: 45 },
  ]},
  { id: "OKR-Q4-002", objective: "Increase Revenue to $15M", owner: "Business Dev", progress: 70, keyResults: [
    { kr: "Close 8 new festival contracts", progress: 75 },
    { kr: "Expand into 3 new markets", progress: 66 },
    { kr: "Achieve 95% client retention", progress: 100 },
  ]},
  { id: "OKR-Q4-003", objective: "Enhance Operational Excellence", owner: "COO", progress: 55, keyResults: [
    { kr: "Reduce setup time by 25%", progress: 40 },
    { kr: "Achieve 99% on-time delivery", progress: 85 },
    { kr: "Zero safety incidents", progress: 100 },
  ]},
];

const getProgressVariant = (progress: number): 'solid' | 'outline' | 'ghost' => {
  if (progress >= 70) return 'solid';
  if (progress >= 50) return 'outline';
  return 'ghost';
};

const columns: ListPageColumn<OKR>[] = [
  { key: 'id', label: 'ID', accessor: 'id', sortable: true },
  { key: 'objective', label: 'Objective', accessor: 'objective', sortable: true },
  { key: 'owner', label: 'Owner', accessor: 'owner', sortable: true, render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'keyResults', label: 'Key Results', accessor: (r) => `${r.keyResults.length} KRs` },
  { key: 'progress', label: 'Progress', accessor: (r) => `${r.progress}%`, sortable: true, render: (v, r) => <Badge variant={getProgressVariant(r.progress)}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'owner', label: 'Owner', options: [
    { value: 'Operations', label: 'Operations' },
    { value: 'Business Dev', label: 'Business Dev' },
    { value: 'COO', label: 'COO' },
  ]},
];

const formFields: FormFieldConfig[] = [
  { name: 'objective', label: 'Objective', type: 'text', required: true },
  { name: 'owner', label: 'Owner', type: 'select', required: true, options: [
    { value: 'Operations', label: 'Operations' },
    { value: 'Business Dev', label: 'Business Dev' },
    { value: 'COO', label: 'COO' },
  ]},
];

export default function OKRsPage() {
  const router = useRouter();
  const [okrs] = useState<OKR[]>(mockOKRs);
  const [selectedOKR, setSelectedOKR] = useState<OKR | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const avgProgress = Math.round(okrs.reduce((sum, o) => sum + o.progress, 0) / okrs.length);
  const onTrackCount = okrs.filter(o => o.progress >= 70).length;
  const atRiskCount = okrs.filter(o => o.progress < 50).length;

  const rowActions: ListPageAction<OKR>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedOKR(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (r) => router.push(`/okrs/${r.id}/edit`) },
  ];

  const stats = [
    { label: 'Active OKRs', value: okrs.length },
    { label: 'Avg Progress', value: `${avgProgress}%` },
    { label: 'On Track', value: onTrackCount },
    { label: 'At Risk', value: atRiskCount },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    console.log('Create OKR:', data);
    setCreateModalOpen(false);
  };

  const detailSections: DetailSection[] = selectedOKR ? [
    { id: 'overview', title: 'OKR Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>ID:</strong> {selectedOKR.id}</div>
        <div><strong>Owner:</strong> {selectedOKR.owner}</div>
        <div className="col-span-2"><strong>Objective:</strong> {selectedOKR.objective}</div>
        <div><strong>Progress:</strong> {selectedOKR.progress}%</div>
        <div><strong>Status:</strong> {selectedOKR.progress >= 70 ? 'On Track' : selectedOKR.progress >= 50 ? 'In Progress' : 'At Risk'}</div>
      </div>
    )},
    { id: 'keyResults', title: 'Key Results', content: (
      <div className="space-y-3">
        {selectedOKR.keyResults.map((kr, idx) => (
          <div key={idx} className="flex items-center justify-between border-l-2 border-grey-300 py-2 pl-4">
            <span>{kr.kr}</span>
            <Badge variant={getProgressVariant(kr.progress)}>{kr.progress}%</Badge>
          </div>
        ))}
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<OKR>
        title="OKRs & Strategic Goals"
        subtitle="Track objectives and key results across the organization"
        data={okrs}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search OKRs..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedOKR(r); setDrawerOpen(true); }}
        createLabel="Create New OKR"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => router.push('/okrs/export')}
        stats={stats}
        emptyMessage="No OKRs found"
        emptyAction={{ label: 'Create OKR', onClick: () => setCreateModalOpen(true) }}
        header={<CreatorNavigationAuthenticated />}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create New OKR"
        fields={formFields}
        onSubmit={handleCreate}
      />

      {selectedOKR && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedOKR}
          title={(o) => o.objective}
          subtitle={(o) => `${o.owner} • ${o.progress}% Complete`}
          sections={detailSections}
          onEdit={(o) => router.push(`/okrs/${o.id}/edit`)}
        />
      )}
    </>
  );
}
