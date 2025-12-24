"use client";

import { useState, useMemo } from "react";
import { Eye, Zap, Volume2, Lightbulb, Video, Loader2, AlertTriangle } from "lucide-react";
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
  Text,
  type DetailSection,
  type ListPageAction,
  type ListPageColumn,
  type ListPageFilter,
} from '@ghxstship/ui';
import { createExportHandler, useShowCues, type ShowCue as ApiShowCue } from "@ghxstship/config";

interface TechnicalCue {
  id: string;
  number: string;
  name: string;
  department: "lighting" | "audio" | "video" | "pyro" | "automation";
  trigger: string;
  duration: number;
  notes: string;
  status: "ready" | "standby" | "fired" | "skipped";
}

const mapApiCueToTechnical = (cue: ApiShowCue): TechnicalCue => ({
  id: cue.id,
  number: cue.cue_number || `CUE-${cue.id.slice(0, 4)}`,
  name: cue.description || "Untitled Cue",
  department: (cue.cue_type as TechnicalCue["department"]) || "lighting",
  trigger: cue.trigger_time || "Manual",
  duration: 5,
  notes: "",
  status: cue.status === "executed" ? "fired" : cue.status === "standby" ? "standby" : "ready",
});

const getDeptIcon = (dept: TechnicalCue["department"]) => {
  switch (dept) {
    case "lighting": return <Lightbulb className="size-4" />;
    case "audio": return <Volume2 className="size-4" />;
    case "video": return <Video className="size-4" />;
    default: return <Zap className="size-4" />;
  }
};

const getStatusVariant = (status: TechnicalCue["status"]): "solid" | "outline" | "ghost" => {
  switch (status) {
    case "fired": return "ghost";
    case "standby": return "solid";
    default: return "outline";
  }
};

const columns: ListPageColumn<TechnicalCue>[] = [
  { key: "number", label: "Cue #", accessor: "number", sortable: true },
  { key: "name", label: "Name", accessor: "name", sortable: true },
  { key: "department", label: "Department", accessor: "department", render: (v, row) => (
    <div className="flex items-center gap-2">
      {getDeptIcon(row.department)}
      <Text className="capitalize">{String(v)}</Text>
    </div>
  )},
  { key: "trigger", label: "Trigger", accessor: "trigger" },
  { key: "duration", label: "Duration", accessor: (r) => `${r.duration}s` },
  { key: "status", label: "Status", accessor: "status", render: (v) => <Badge variant={getStatusVariant(v as TechnicalCue["status"])} className="capitalize">{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: "department", label: "Department", options: [
    { value: "lighting", label: "Lighting" },
    { value: "audio", label: "Audio" },
    { value: "video", label: "Video" },
    { value: "pyro", label: "Pyro" },
    { value: "automation", label: "Automation" },
  ]},
  { key: "status", label: "Status", options: [
    { value: "ready", label: "Ready" },
    { value: "standby", label: "Standby" },
    { value: "fired", label: "Fired" },
  ]},
];

export default function ShowCuesPage() {
  const { cues: apiCues, isLoading, error, refetch, updateStatus } = useShowCues();
  const [selectedCue, setSelectedCue] = useState<TechnicalCue | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const cues = useMemo(() => apiCues.map(mapApiCueToTechnical), [apiCues]);

  const firedCount = cues.filter((c: TechnicalCue) => c.status === "fired").length;
  const standbyCount = cues.filter((c: TechnicalCue) => c.status === "standby").length;
  const readyCount = cues.filter((c: TechnicalCue) => c.status === "ready").length;

  if (isLoading) {
    return (
      <Stack gap={8}>
        <EnterprisePageHeader title="Show Cues" subtitle="Manage technical cues" showFavorite showSettings />
        <Card inverted className="border-2 border-ink-800 p-12">
          <Stack gap={4} className="items-center justify-center">
            <Loader2 className="size-8 text-primary animate-spin" />
            <Body className="text-grey-400">Loading cues...</Body>
          </Stack>
        </Card>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack gap={8}>
        <EnterprisePageHeader title="Show Cues" subtitle="Manage technical cues" showFavorite showSettings />
        <Card inverted className="border-2 border-error/30 p-8">
          <Stack gap={4} className="items-center justify-center">
            <AlertTriangle className="size-8 text-error" />
            <Body className="text-error">Failed to load cues</Body>
            <Button onClick={() => refetch()} className="px-4 py-2 rounded-button bg-primary text-white">Retry</Button>
          </Stack>
        </Card>
      </Stack>
    );
  }

  const rowActions: ListPageAction<TechnicalCue>[] = [
    { id: "view", label: "View Details", icon: <Eye className="size-4" />, onClick: (r) => { setSelectedCue(r); setDrawerOpen(true); } },
    { id: "fire", label: "Fire Cue", icon: <Zap className="size-4" />, onClick: (r) => updateStatus({ id: r.id, status: "executed" }) },
  ];

  const stats = [
    { label: "Total Cues", value: cues.length },
    { label: "Fired", value: firedCount },
    { label: "Standby", value: standbyCount },
    { label: "Ready", value: readyCount },
  ];

  const detailSections: DetailSection[] = selectedCue ? [
    { id: "overview", title: "Cue Details", content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Cue Number:</strong> {selectedCue.number}</Body>
        <Body size="sm"><strong>Name:</strong> {selectedCue.name}</Body>
        <Body size="sm"><strong>Department:</strong> {selectedCue.department}</Body>
        <Body size="sm"><strong>Trigger:</strong> {selectedCue.trigger}</Body>
        <Body size="sm"><strong>Duration:</strong> {selectedCue.duration}s</Body>
        <Body size="sm"><strong>Status:</strong> {selectedCue.status}</Body>
        {selectedCue.notes && <Body size="sm" className="col-span-2"><strong>Notes:</strong> {selectedCue.notes}</Body>}
      </Grid>
    )},
  ] : [];

  return (
    <>
      <ListPage<TechnicalCue>
        title="Show Cues"
        subtitle="Manage technical cues for lighting, audio, and video"
        data={cues}
        columns={columns}
        rowKey="id"
        searchPlaceholder="Search cues..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedCue(r); setDrawerOpen(true); }}
        entityType="cues"
        onExport={createExportHandler({
          filename: "show-cues",
          getData: () => cues.map((c: TechnicalCue) => ({
            number: c.number,
            name: c.name,
            department: c.department,
            trigger: c.trigger,
            duration: c.duration,
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
        title={(r) => r.name}
        subtitle={(r) => `${r.number} - ${r.department}`}
        sections={detailSections}
      />
    </>
  );
}
