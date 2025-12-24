"use client";

import { useState, useMemo } from "react";
import { Eye, Clock, Play, CheckCircle, Loader2, AlertTriangle } from "lucide-react";
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
import { createExportHandler, useRunOfShow, type ShowEntry } from "@ghxstship/config";

interface ShowCue {
  id: string;
  time: string;
  duration: number;
  title: string;
  description: string;
  type: "segment" | "transition" | "break" | "technical";
  status: "pending" | "active" | "completed" | "skipped";
  notes: string;
  assignee: string;
}

const mapEntryToCue = (entry: ShowEntry, index: number): ShowCue => ({
  id: entry.id || `cue-${index}`,
  time: entry.time || "00:00",
  duration: entry.duration || 0,
  title: entry.description?.split(" - ")[0] || `Cue ${index + 1}`,
  description: entry.description || "",
  type: (entry.department?.toLowerCase().includes("tech") ? "technical" : "segment") as ShowCue["type"],
  status: "pending",
  notes: entry.notes || "",
  assignee: entry.responsible || entry.department || "TBD",
});

const formatDuration = (min: number) => `${min} min`;

const getStatusVariant = (status: ShowCue["status"]): "solid" | "outline" | "ghost" => {
  switch (status) {
    case "active": return "solid";
    case "completed": return "ghost";
    default: return "outline";
  }
};

const getStatusIcon = (status: ShowCue["status"]) => {
  switch (status) {
    case "active": return <Play className="size-3" />;
    case "completed": return <CheckCircle className="size-3" />;
    default: return <Clock className="size-3" />;
  }
};

const columns: ListPageColumn<ShowCue>[] = [
  { key: "time", label: "Time", accessor: "time", sortable: true },
  { key: "title", label: "Cue", accessor: "title", sortable: true },
  { key: "duration", label: "Duration", accessor: (r) => formatDuration(r.duration) },
  { key: "type", label: "Type", accessor: "type", render: (v) => <Badge variant="outline" className="capitalize">{String(v)}</Badge> },
  { key: "assignee", label: "Assignee", accessor: "assignee" },
  { key: "status", label: "Status", accessor: "status", render: (v) => (
    <Badge variant={getStatusVariant(v as ShowCue["status"])} className="gap-1 capitalize">
      {getStatusIcon(v as ShowCue["status"])}
      {String(v)}
    </Badge>
  )},
];

const filters: ListPageFilter[] = [
  { key: "type", label: "Type", options: [
    { value: "segment", label: "Segment" },
    { value: "transition", label: "Transition" },
    { value: "break", label: "Break" },
    { value: "technical", label: "Technical" },
  ]},
  { key: "status", label: "Status", options: [
    { value: "pending", label: "Pending" },
    { value: "active", label: "Active" },
    { value: "completed", label: "Completed" },
  ]},
];

export default function RunofShowPage() {
  const { shows, isLoading, error, refetch } = useRunOfShow();
  const [selectedCue, setSelectedCue] = useState<ShowCue | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const cues = useMemo(() => {
    const allEntries = shows.flatMap(show => show.entries || []);
    return allEntries.map(mapEntryToCue);
  }, [shows]);

  const completedCount = cues.filter(c => c.status === "completed").length;
  const activeCount = cues.filter(c => c.status === "active").length;
  const totalDuration = cues.reduce((sum, c) => sum + c.duration, 0);

  if (isLoading) {
    return (
      <Stack gap={8}>
        <EnterprisePageHeader title="Run of Show" subtitle="Manage show timeline and cues" showFavorite showSettings />
        <Card inverted className="border-2 border-ink-800 p-12">
          <Stack gap={4} className="items-center justify-center">
            <Loader2 className="size-8 text-primary animate-spin" />
            <Body className="text-grey-400">Loading run of show...</Body>
          </Stack>
        </Card>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack gap={8}>
        <EnterprisePageHeader title="Run of Show" subtitle="Manage show timeline and cues" showFavorite showSettings />
        <Card inverted className="border-2 border-error/30 p-8">
          <Stack gap={4} className="items-center justify-center">
            <AlertTriangle className="size-8 text-error" />
            <Body className="text-error">Failed to load run of show</Body>
            <Button onClick={() => refetch()} className="px-4 py-2 rounded-button bg-primary text-white">Retry</Button>
          </Stack>
        </Card>
      </Stack>
    );
  }

  const rowActions: ListPageAction<ShowCue>[] = [
    { id: "view", label: "View Details", icon: <Eye className="size-4" />, onClick: (r) => { setSelectedCue(r); setDrawerOpen(true); } },
    { id: "start", label: "Start Cue", icon: <Play className="size-4" />, onClick: () => {} },
  ];

  const stats = [
    { label: "Total Cues", value: cues.length },
    { label: "Completed", value: completedCount },
    { label: "Active", value: activeCount },
    { label: "Total Duration", value: `${totalDuration} min` },
  ];

  const detailSections: DetailSection[] = selectedCue ? [
    { id: "overview", title: "Cue Details", content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Time:</strong> {selectedCue.time}</Body>
        <Body size="sm"><strong>Duration:</strong> {formatDuration(selectedCue.duration)}</Body>
        <Body size="sm"><strong>Type:</strong> {selectedCue.type}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedCue.status}</Body>
        <Body size="sm"><strong>Assignee:</strong> {selectedCue.assignee}</Body>
        <Body size="sm" className="col-span-2"><strong>Description:</strong> {selectedCue.description}</Body>
        {selectedCue.notes && <Body size="sm" className="col-span-2"><strong>Notes:</strong> {selectedCue.notes}</Body>}
      </Grid>
    )},
  ] : [];

  return (
    <>
      <ListPage<ShowCue>
        title="Run of Show"
        subtitle="Manage show timeline and cues"
        data={cues}
        columns={columns}
        rowKey="id"
        searchPlaceholder="Search cues..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedCue(r); setDrawerOpen(true); }}
        entityType="run-of-show"
        onExport={createExportHandler({
          filename: "run-of-show",
          getData: () => cues.map(c => ({
            time: c.time,
            title: c.title,
            duration: c.duration,
            type: c.type,
            assignee: c.assignee,
            status: c.status,
          })),
        })}
        stats={stats}
        emptyMessage="No cues found"
        showFavorite
        showSettings
      />
      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedCue}
        title={(r) => r.title}
        subtitle={(r) => `${r.time} - ${formatDuration(r.duration)}`}
        sections={detailSections}
      />
    </>
  );
}
