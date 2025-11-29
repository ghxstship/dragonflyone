"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
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

interface TrainingProgram {
  id: string;
  title: string;
  description: string;
  category: string;
  duration_hours: number;
  instructor_name: string;
  instructor?: { id: string; full_name: string; email: string };
  capacity: number;
  enrolled_count: number;
  start_date: string;
  end_date: string;
  status: string;
  is_virtual: boolean;
  created_at: string;
  [key: string]: unknown;
}

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
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchTraining = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/training');
      if (!response.ok) throw new Error("Failed to fetch training programs");
      const data = await response.json();
      setPrograms(data.programs || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTraining();
  }, [fetchTraining]);

  const activeCount = programs.filter(p => p.status === 'active').length;
  const totalEnrolled = programs.reduce((sum, p) => sum + (p.enrolled_count || 0), 0);

  const rowActions: ListPageAction<TrainingProgram>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedProgram(r); setDrawerOpen(true); } },
    { id: 'enroll', label: 'Enroll', icon: '📝', onClick: (r) => router.push(`/training/${r.id}/enroll`) },
  ];

  const stats = [
    { label: 'Total Programs', value: programs.length },
    { label: 'Active', value: activeCount },
    { label: 'Total Enrolled', value: totalEnrolled },
    { label: 'Virtual', value: programs.filter(p => p.is_virtual).length },
  ];

  const detailSections: DetailSection[] = selectedProgram ? [
    { id: 'overview', title: 'Program Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Title:</strong> {selectedProgram.title}</div>
        <div><strong>Category:</strong> {selectedProgram.category}</div>
        <div><strong>Duration:</strong> {selectedProgram.duration_hours} hours</div>
        <div><strong>Instructor:</strong> {selectedProgram.instructor?.full_name || selectedProgram.instructor_name || '—'}</div>
        <div><strong>Capacity:</strong> {selectedProgram.capacity}</div>
        <div><strong>Enrolled:</strong> {selectedProgram.enrolled_count || 0}</div>
        <div><strong>Start Date:</strong> {selectedProgram.start_date ? new Date(selectedProgram.start_date).toLocaleDateString() : '—'}</div>
        <div><strong>End Date:</strong> {selectedProgram.end_date ? new Date(selectedProgram.end_date).toLocaleDateString() : '—'}</div>
        <div><strong>Status:</strong> {selectedProgram.status}</div>
        <div><strong>Virtual:</strong> {selectedProgram.is_virtual ? 'Yes' : 'No'}</div>
        {selectedProgram.description && <div className="col-span-2"><strong>Description:</strong> {selectedProgram.description}</div>}
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<TrainingProgram>
        title="Training & Development"
        subtitle="Manage training programs and employee development"
        data={programs}
        columns={columns}
        rowKey="id"
        loading={loading}
        error={error ? new Error(error) : undefined}
        onRetry={fetchTraining}
        searchPlaceholder="Search programs..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedProgram(r); setDrawerOpen(true); }}
        createLabel="Create Program"
        onCreate={() => router.push('/training/new')}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No training programs found"
        emptyAction={{ label: 'Create Program', onClick: () => router.push('/training/new') }}
        header={<CreatorNavigationAuthenticated
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Training' }]}
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
        showFavorite
        showSettings />}
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
            { id: 'enroll', label: 'Enroll Employee', icon: '📝' },
            { id: 'edit', label: 'Edit Program', icon: '✏️' },
          ]}
          onAction={(id, p) => {
            if (id === 'enroll') router.push(`/training/${p.id}/enroll`);
            if (id === 'edit') router.push(`/training/${p.id}/edit`);
            setDrawerOpen(false);
          }}
        />
      )}
    </>
  );
}
