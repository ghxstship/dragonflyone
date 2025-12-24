"use client";

import { useState, useMemo } from "react";
import { Eye, Loader2, AlertTriangle } from "lucide-react";
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
import { createExportHandler, useSetTimes, type SetTime as ApiSetTime } from "@ghxstship/config";

interface SetTime {
  id: string;
  artist: string;
  stage: string;
  start_time: string;
  end_time: string;
  duration: number;
  genre: string;
  status: "confirmed" | "tentative" | "cancelled";
  notes: string;
}

const mapApiToSetTime = (apiSet: ApiSetTime): SetTime => {
  const start = apiSet.start_time ? new Date(apiSet.start_time) : new Date();
  const end = apiSet.end_time ? new Date(apiSet.end_time) : new Date();
  const duration = Math.round((end.getTime() - start.getTime()) / 60000);
  return {
    id: apiSet.id,
    artist: apiSet.artist_name || "TBD",
    stage: apiSet.stage || "Main Stage",
    start_time: start.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
    end_time: end.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
    duration: duration > 0 ? duration : 60,
    genre: "Live",
    status: apiSet.status === "confirmed" ? "confirmed" : apiSet.status === "cancelled" ? "cancelled" : "tentative",
    notes: "",
  };
};

const getStatusVariant = (status: SetTime["status"]): "solid" | "outline" | "ghost" => {
  switch (status) {
    case "confirmed": return "solid";
    case "tentative": return "outline";
    case "cancelled": return "ghost";
  }
};

const columns: ListPageColumn<SetTime>[] = [
  { key: "artist", label: "Artist", accessor: "artist", sortable: true },
  { key: "stage", label: "Stage", accessor: "stage", sortable: true },
  { key: "start_time", label: "Start", accessor: "start_time", sortable: true },
  { key: "end_time", label: "End", accessor: "end_time" },
  { key: "duration", label: "Duration", accessor: (r) => `${r.duration} min` },
  { key: "genre", label: "Genre", accessor: "genre", render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: "status", label: "Status", accessor: "status", render: (v) => <Badge variant={getStatusVariant(v as SetTime["status"])} className="capitalize">{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: "stage", label: "Stage", options: [
    { value: "Main Stage", label: "Main Stage" },
    { value: "Dance Tent", label: "Dance Tent" },
    { value: "Intimate Stage", label: "Intimate Stage" },
    { value: "Lounge", label: "Lounge" },
  ]},
  { key: "status", label: "Status", options: [
    { value: "confirmed", label: "Confirmed" },
    { value: "tentative", label: "Tentative" },
    { value: "cancelled", label: "Cancelled" },
  ]},
];

export default function SetTimesPage() {
  const { setTimes: apiSetTimes, isLoading, error, refetch } = useSetTimes();
  const [selectedSet, setSelectedSet] = useState<SetTime | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const setTimes = useMemo(() => apiSetTimes.map(mapApiToSetTime), [apiSetTimes]);

  const confirmedCount = setTimes.filter((s: SetTime) => s.status === "confirmed").length;
  const totalDuration = setTimes.reduce((sum: number, s: SetTime) => sum + s.duration, 0);

  if (isLoading) {
    return (
      <Stack gap={8}>
        <EnterprisePageHeader title="Set Times" subtitle="Manage artist performance schedules" showFavorite showSettings />
        <Card inverted className="border-2 border-ink-800 p-12">
          <Stack gap={4} className="items-center justify-center">
            <Loader2 className="size-8 text-primary animate-spin" />
            <Body className="text-grey-400">Loading set times...</Body>
          </Stack>
        </Card>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack gap={8}>
        <EnterprisePageHeader title="Set Times" subtitle="Manage artist performance schedules" showFavorite showSettings />
        <Card inverted className="border-2 border-error/30 p-8">
          <Stack gap={4} className="items-center justify-center">
            <AlertTriangle className="size-8 text-error" />
            <Body className="text-error">Failed to load set times</Body>
            <Button onClick={() => refetch()} className="px-4 py-2 rounded-button bg-primary text-white">Retry</Button>
          </Stack>
        </Card>
      </Stack>
    );
  }

  const rowActions: ListPageAction<SetTime>[] = [
    { id: "view", label: "View Details", icon: <Eye className="size-4" />, onClick: (r) => { setSelectedSet(r); setDrawerOpen(true); } },
  ];

  const stats = [
    { label: "Total Sets", value: setTimes.length },
    { label: "Confirmed", value: confirmedCount },
    { label: "Total Duration", value: `${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m` },
    { label: "Stages", value: new Set(setTimes.map((s: SetTime) => s.stage)).size },
  ];

  const detailSections: DetailSection[] = selectedSet ? [
    { id: "overview", title: "Set Details", content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Artist:</strong> {selectedSet.artist}</Body>
        <Body size="sm"><strong>Stage:</strong> {selectedSet.stage}</Body>
        <Body size="sm"><strong>Time:</strong> {selectedSet.start_time} - {selectedSet.end_time}</Body>
        <Body size="sm"><strong>Duration:</strong> {selectedSet.duration} min</Body>
        <Body size="sm"><strong>Genre:</strong> {selectedSet.genre}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedSet.status}</Body>
        {selectedSet.notes && <Body size="sm" className="col-span-2"><strong>Notes:</strong> {selectedSet.notes}</Body>}
      </Grid>
    )},
  ] : [];

  return (
    <>
      <ListPage<SetTime>
        title="Set Times"
        subtitle="Manage artist performance schedules"
        data={setTimes}
        columns={columns}
        rowKey="id"
        searchPlaceholder="Search artists..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedSet(r); setDrawerOpen(true); }}
        entityType="set-times"
        onExport={createExportHandler({
          filename: "set-times",
          getData: () => setTimes.map((s: SetTime) => ({
            artist: s.artist,
            stage: s.stage,
            start_time: s.start_time,
            end_time: s.end_time,
            duration: s.duration,
            genre: s.genre,
            status: s.status,
          })),
        })}
        stats={stats}
        emptyMessage="No set times found"
        showFavorite
        showSettings
      />
      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedSet}
        title={(r) => r.artist}
        subtitle={(r) => `${r.stage} - ${r.start_time}`}
        sections={detailSections}
      />
    </>
  );
}
