"use client";

import { useState, useMemo } from "react";
import { Eye, BookOpen, CheckCircle, Clock, Loader2, AlertTriangle } from "lucide-react";
import {
  Badge,
  Body,
  Button,
  Card,
  DetailDrawer,
  EnterprisePageHeader,
  Grid,
  ListPage,
  Stack,
  type DetailSection,
  type ListPageAction,
  type ListPageColumn,
  type ListPageFilter,
} from '@ghxstship/ui';
import { createExportHandler, useTraining, type TrainingProgram } from "@ghxstship/config";

interface Training {
  id: string;
  title: string;
  category: "safety" | "technical" | "compliance" | "soft_skills" | "certification" | "management";
  instructor: string;
  start_date: string;
  end_date: string | null;
  duration: number;
  status: "draft" | "active" | "completed" | "cancelled";
  enrolled_count: number;
  capacity: number;
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const mapProgramToTraining = (program: TrainingProgram): Training => ({
  id: program.id,
  title: program.title,
  category: program.category as Training["category"],
  instructor: program.instructor_name || "TBD",
  start_date: program.start_date || "",
  end_date: program.end_date || null,
  duration: program.duration_hours * 60,
  status: program.status,
  enrolled_count: program.enrolled_count || 0,
  capacity: program.capacity,
});

const getStatusVariant = (status: Training["status"]): "solid" | "outline" | "ghost" => {
  switch (status) {
    case "completed": return "solid";
    case "active": return "outline";
    case "cancelled": return "ghost";
    default: return "outline";
  }
};

const getStatusIcon = (status: Training["status"]) => {
  switch (status) {
    case "completed": return <CheckCircle className="size-3" />;
    case "active": return <Clock className="size-3" />;
    default: return <BookOpen className="size-3" />;
  }
};

const columns: ListPageColumn<Training>[] = [
  { key: "title", label: "Training", accessor: "title", sortable: true },
  { key: "category", label: "Category", accessor: "category", render: (v) => <Badge variant="outline" className="capitalize">{String(v).replace("_", " ")}</Badge> },
  { key: "instructor", label: "Instructor", accessor: "instructor", sortable: true },
  { key: "duration", label: "Duration", accessor: (r) => `${r.duration} min` },
  { key: "start_date", label: "Start Date", accessor: (r) => formatDate(r.start_date), sortable: true },
  { key: "enrolled", label: "Enrolled", accessor: (r) => `${r.enrolled_count}/${r.capacity}` },
  { key: "status", label: "Status", accessor: "status", render: (v) => (
    <Badge variant={getStatusVariant(v as Training["status"])} className="gap-1 capitalize">
      {getStatusIcon(v as Training["status"])}
      {String(v).replace("_", " ")}
    </Badge>
  )},
];

const filters: ListPageFilter[] = [
  { key: "category", label: "Category", options: [
    { value: "safety", label: "Safety" },
    { value: "technical", label: "Technical" },
    { value: "compliance", label: "Compliance" },
    { value: "soft_skills", label: "Soft Skills" },
    { value: "certification", label: "Certification" },
    { value: "management", label: "Management" },
  ]},
  { key: "status", label: "Status", options: [
    { value: "draft", label: "Draft" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ]},
];

export default function TeamTrainingPage() {
  const { programs, isLoading, error, refetch } = useTraining();
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const trainings: Training[] = useMemo(() => programs.map(mapProgramToTraining), [programs]);

  const completedCount = trainings.filter((t: Training) => t.status === "completed").length;
  const activeCount = trainings.filter((t: Training) => t.status === "active").length;
  const totalEnrolled = trainings.reduce((sum: number, t: Training) => sum + t.enrolled_count, 0);

  const rowActions: ListPageAction<Training>[] = [
    { id: "view", label: "View Details", icon: <Eye className="size-4" />, onClick: (r) => { setSelectedTraining(r); setDrawerOpen(true); } },
  ];

  const stats = [
    { label: "Total Programs", value: trainings.length },
    { label: "Active", value: activeCount },
    { label: "Completed", value: completedCount },
    { label: "Total Enrolled", value: totalEnrolled },
  ];

  const detailSections: DetailSection[] = selectedTraining ? [
    { id: "overview", title: "Training Details", content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Title:</strong> {selectedTraining.title}</Body>
        <Body size="sm"><strong>Category:</strong> {selectedTraining.category.replace("_", " ")}</Body>
        <Body size="sm"><strong>Instructor:</strong> {selectedTraining.instructor}</Body>
        <Body size="sm"><strong>Duration:</strong> {selectedTraining.duration} min</Body>
        <Body size="sm"><strong>Start Date:</strong> {formatDate(selectedTraining.start_date)}</Body>
        <Body size="sm"><strong>End Date:</strong> {selectedTraining.end_date ? formatDate(selectedTraining.end_date) : "Ongoing"}</Body>
        <Body size="sm"><strong>Enrollment:</strong> {selectedTraining.enrolled_count}/{selectedTraining.capacity}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedTraining.status.replace("_", " ")}</Body>
      </Grid>
    )},
  ] : [];

  if (isLoading) {
    return (
      <Stack gap={8}>
        <EnterprisePageHeader title="Team Training" subtitle="Track and manage team training programs" showFavorite showSettings />
        <Card inverted className="border-2 border-ink-800 p-12">
          <Stack gap={4} className="items-center justify-center">
            <Loader2 className="size-8 text-primary animate-spin" />
            <Body className="text-grey-400">Loading training programs...</Body>
          </Stack>
        </Card>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack gap={8}>
        <EnterprisePageHeader title="Team Training" subtitle="Track and manage team training programs" showFavorite showSettings />
        <Card inverted className="border-2 border-error/30 p-8">
          <Stack gap={4} className="items-center justify-center">
            <AlertTriangle className="size-8 text-error" />
            <Body className="text-error">Failed to load training programs</Body>
            <Button onClick={() => refetch()} className="px-4 py-2 rounded-button bg-primary text-white">Retry</Button>
          </Stack>
        </Card>
      </Stack>
    );
  }

  return (
    <>
      <ListPage<Training>
        title="Team Training"
        subtitle="Track and manage team training programs"
        data={trainings}
        columns={columns}
        rowKey="id"
        searchPlaceholder="Search trainings..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedTraining(r); setDrawerOpen(true); }}
        entityType="training"
        onExport={createExportHandler({
          filename: "team-training",
          getData: () => trainings.map((t: Training) => ({
            title: t.title,
            category: t.category,
            instructor: t.instructor,
            duration: t.duration,
            start_date: t.start_date,
            end_date: t.end_date || "",
            enrolled: `${t.enrolled_count}/${t.capacity}`,
            status: t.status,
          })),
        })}
        stats={stats}
        emptyMessage="No training programs found"
        showFavorite
        showSettings
      />
      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedTraining}
        title={(r) => r.title}
        subtitle={(r) => `${r.category.replace("_", " ")} - ${r.instructor}`}
        sections={detailSections}
      />
    </>
  );
}
