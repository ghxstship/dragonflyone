"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, FileEdit, Pencil } from "lucide-react";
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
import { useTrainingData, type TrainingProgram } from "@/hooks/useTraining";

const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<TrainingProgram>[] = [
  { key: 'title', label: 'Program', accessor: 'title', sortable: true },
  { key: 'category', label: 'Category', accessor: 'category', render: (v) => <Badge variant="ghost">{String(v).replace("_", " ")}</Badge> },
  { key: 'duration_hours', label: 'Duration', accessor: (r) => `${r.duration_hours} hours`, sortable: true },
  { key: 'instructor', label: 'Instructor', accessor: (r) => r.instructor?.full_name || r.instructor_name || '—' },
  { key: 'enrolled', label: 'Enrolled', accessor: (r) => `${r.enrolled_count || 0}/${r.capacity}` },
  { key: 'start_date', label: 'Start Date', accessor: (r) => r.start_date ? new Date(r.start_date).toLocaleDateString() : '—', sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'active', label: 'Active' }, { value: 'draft', label: 'Draft' }, { value: 'full', label: 'Full' }, { value: 'completed', label: 'Completed' }] },
  { key: 'category', label: 'Category', options: [{ value: 'safety', label: 'Safety' }, { value: 'management', label: 'Management' }, { value: 'compliance', label: 'Compliance' }, { value: 'technical', label: 'Technical' }, { value: 'soft_skills', label: 'Soft Skills' }, { value: 'certification', label: 'Certification' }] },
];

export default function TrainingPage() {
  const router = useRouter();
  const {
    programs,
    activeCount,
    totalEnrolled,
    totalCapacity,
    isLoading: loading,
    error,
    refetch,
  } = useTrainingData();

  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const rowActions: ListPageAction<TrainingProgram>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedProgram(r); setDrawerOpen(true); } },
    { id: 'enroll', label: 'Enroll', icon: <FileEdit className="size-4" />, onClick: (r) => router.push(`/training/${r.id}/enroll`) },
  ];

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'training',
    requiredFields: ['title', 'category'],
    onImport: async (records) => {
      for (const record of records) {
        await fetch('/api/training', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
      }
      refetch();
    },
  });

  const importTemplates = getImportTemplates('training').length > 0 
    ? getImportTemplates('training') 
    : [{ id: 'default', name: 'Training Import', mapping: { title: 'title', category: 'category', duration_hours: 'duration_hours', instructor_name: 'instructor_name', capacity: 'capacity' } }];

  const stats = [
    { label: 'Total Programs', value: programs.length },
    { label: 'Active', value: activeCount },
    { label: 'Enrolled', value: `${totalEnrolled}/${totalCapacity}` },
    { label: 'Virtual', value: programs.filter((p: TrainingProgram) => p.is_virtual).length },
  ];

  const detailSections: DetailSection[] = selectedProgram ? [
    { id: 'overview', title: 'Program Details', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Title:</strong> {selectedProgram.title}</Body>
        <Body size="sm"><strong>Category:</strong> {selectedProgram.category}</Body>
        <Body size="sm"><strong>Duration:</strong> {selectedProgram.duration_hours} hours</Body>
        <Body size="sm"><strong>Instructor:</strong> {selectedProgram.instructor?.full_name || selectedProgram.instructor_name || '—'}</Body>
        <Body size="sm"><strong>Capacity:</strong> {selectedProgram.capacity}</Body>
        <Body size="sm"><strong>Enrolled:</strong> {selectedProgram.enrolled_count || 0}</Body>
        <Body size="sm"><strong>Start Date:</strong> {selectedProgram.start_date ? new Date(selectedProgram.start_date).toLocaleDateString() : '—'}</Body>
        <Body size="sm"><strong>End Date:</strong> {selectedProgram.end_date ? new Date(selectedProgram.end_date).toLocaleDateString() : '—'}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedProgram.status}</Body>
        <Body size="sm"><strong>Virtual:</strong> {selectedProgram.is_virtual ? 'Yes' : 'No'}</Body>
        {selectedProgram.description && <Body size="sm" className="col-span-2"><strong>Description:</strong> {selectedProgram.description}</Body>}
      </Grid>
    )},
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<TrainingProgram>
        title="Training & Development"
        subtitle="Manage training programs and employee development"
        data={programs}
        columns={columns}
        rowKey="id"
        loading={loading}
        error={error instanceof Error ? error : error ? new Error(String(error)) : undefined}
        onRetry={() => refetch()}
        searchPlaceholder="Search programs..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedProgram(r); setDrawerOpen(true); }}
        createLabel="Create Program"
        onCreate={() => router.push('/training/new')}
        entityType="training"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['title', 'category', 'duration_hours', 'instructor_name', 'capacity']}
        onExport={createExportHandler({
          filename: "training-programs",
          getData: () => programs.map(p => ({
            id: p.id,
            title: p.title,
            category: p.category,
            duration_hours: p.duration_hours,
            instructor: p.instructor_name,
            capacity: p.capacity,
            enrolled: p.enrolled_count,
            start_date: p.start_date,
            end_date: p.end_date,
            status: p.status,
          })),
        })}
        stats={stats}
        emptyMessage="No training programs found"
        emptyAction={{ label: 'Create Program', onClick: () => router.push('/training/new') }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/training/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch();
          } else if (action === 'archive') {
            await fetch('/api/training/bulk-archive', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch();
          }
        }}
        bulkActions={[
          { id: 'archive', label: 'Archive Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
      />

      {selectedProgram && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedProgram}
          title={(p) => p.title}
          subtitle={(p) => `${p.category} • ${p.duration_hours} hours`}
          sections={detailSections}
          actions={[
            { id: 'enroll', label: 'Enroll Employee', icon: <FileEdit className="size-4" /> },
            { id: 'edit', label: 'Edit Program', icon: <Pencil className="size-4" /> },
          ]}
          onAction={(id, p) => {
            if (id === 'enroll') router.push(`/training/${p.id}/enroll`);
            if (id === 'edit') router.push(`/training/${p.id}/edit`);
            setDrawerOpen(false);
          }}
        />
      )}
    </AtlvsAppLayout>
  );
}
