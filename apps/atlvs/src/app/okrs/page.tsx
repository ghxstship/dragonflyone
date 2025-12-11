"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil } from "lucide-react";
import { AtlvsAppLayout } from "../../components/app-layout";
import {
  ListPage,
  Badge,
  DetailDrawer,
  RecordFormModal,
  Grid,
  Stack,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
  type FormFieldConfig,
} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates } from "@ghxstship/config";

import {
  DEMO_OKRS_LIST,
  type DemoOKRItem as OKR,
} from "../../lib/demo-data";

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
  const [okrs, setOkrs] = useState<OKR[]>(DEMO_OKRS_LIST);
  const [selectedOKR, setSelectedOKR] = useState<OKR | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const avgProgress = Math.round(okrs.reduce((sum, o) => sum + o.progress, 0) / okrs.length);
  const onTrackCount = okrs.filter(o => o.progress >= 70).length;
  const atRiskCount = okrs.filter(o => o.progress < 50).length;

  const rowActions: ListPageAction<OKR>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedOKR(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/okrs/${r.id}/edit`) },
  ];

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'okrs',
    requiredFields: ['objective', 'owner'],
    onImport: async (records) => {
      for (const record of records) {
        const newOKR: OKR = {
          id: `OKR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          objective: String(record.objective || ''),
          owner: String(record.owner || ''),
          keyResults: [],
          progress: Number(record.progress) || 0,
        };
        setOkrs(prev => [...prev, newOKR]);
      }
    },
  });

  const importTemplates = getImportTemplates('okrs').length > 0 
    ? getImportTemplates('okrs') 
    : [{ id: 'default', name: 'OKR Import', mapping: { objective: 'objective', owner: 'owner', progress: 'progress' } }];

  const stats = [
    { label: 'Active OKRs', value: okrs.length },
    { label: 'Avg Progress', value: `${avgProgress}%` },
    { label: 'On Track', value: onTrackCount },
    { label: 'At Risk', value: atRiskCount },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    const newOKR: OKR = {
      id: `OKR-${String(okrs.length + 1).padStart(3, '0')}`,
      objective: String(data.objective || ''),
      owner: String(data.owner || ''),
      keyResults: [],
      progress: 0,
    };
    setOkrs(prev => [...prev, newOKR]);
    setCreateModalOpen(false);
  };

  const detailSections: DetailSection[] = selectedOKR ? [
    { id: 'overview', title: 'OKR Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>ID:</strong> {selectedOKR.id}</Body>
        <Body size="sm"><strong>Owner:</strong> {selectedOKR.owner}</Body>
        <Body size="sm" className="col-span-2"><strong>Objective:</strong> {selectedOKR.objective}</Body>
        <Body size="sm"><strong>Progress:</strong> {selectedOKR.progress}%</Body>
        <Body size="sm"><strong>Status:</strong> {selectedOKR.progress >= 70 ? 'On Track' : selectedOKR.progress >= 50 ? 'In Progress' : 'At Risk'}</Body>
      </Grid>
    )},
    { id: 'keyResults', title: 'Key Results', content: (
      <Stack gap={3}>
        {selectedOKR.keyResults.map((kr, idx) => (
          <Stack key={idx} direction="horizontal" className="items-center justify-between border-l-2 border-grey-300 py-2 pl-4">
            <Body size="sm">{kr.kr}</Body>
            <Badge variant={getProgressVariant(kr.progress)}>{kr.progress}%</Badge>
          </Stack>
        ))}
      </Stack>
    )},
  ] : [];

  return (
    <AtlvsAppLayout>
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
        entityType="okrs"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['objective', 'owner', 'progress']}
        onExport={createExportHandler({
          filename: "okrs",
          getData: () => okrs.map(o => ({
            id: o.id,
            title: o.objective,
            owner: o.owner,
            period: '',
            progress: o.progress,
            status: o.progress >= 70 ? 'On Track' : o.progress >= 50 ? 'In Progress' : 'At Risk',
            keyResults: o.keyResults?.length || 0,
          })),
        })}
        stats={stats}
        emptyMessage="No OKRs found"
        emptyAction={{ label: 'Create OKR', onClick: () => setCreateModalOpen(true) }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            setOkrs(prev => prev.filter(o => !ids.includes(o.id)));
          } else if (action === 'archive') {
            await fetch('/api/okrs/bulk-archive', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          }
        }}
        bulkActions={[
          { id: 'archive', label: 'Archive Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
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
    </AtlvsAppLayout>
  );
}
