"use client";

import { useRouter } from 'next/navigation';
// Layout provided by route group
import {
  ListPage, Body, Badge, Stack, ProgressBar,
  type ListPageColumn, type ListPageFilter, type ListPageAction} from "@ghxstship/ui";
import { createExportHandler } from "@ghxstship/config";
import { useSchedulePageData, type ScheduleItem } from "@/hooks/useSchedule";
import { Eye, Play, CheckCircle } from "lucide-react";

const getStatusVariant = (status: string): 'solid' | 'outline' | 'ghost' => {
  switch (status) {
    case 'completed': return 'solid';
    case 'in_progress': return 'outline';
    default: return 'ghost';
  }
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getProgress = (item: ScheduleItem): number => {
  if (item.status === 'completed') return 100;
  if (item.status === 'in_progress') return 50;
  return 0;
};

export default function SchedulePage() {
  const router = useRouter();
  const {
    items: schedule,
    summary,
    isLoading: loading,
    error,
    refetch,
  } = useSchedulePageData();

  const columns: ListPageColumn<ScheduleItem>[] = [
    {
      key: 'title',
      label: 'Item',
      accessor: 'title',
      sortable: true,
      render: (_value: unknown, item) => (
        <Stack gap={1}>
          <Body className="font-display">{item.title}</Body>
          <Body size="sm" className="text-muted-foreground font-mono">
            {formatTime(item.start_time)} - {formatTime(item.end_time)}
          </Body>
        </Stack>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
      render: (_value: unknown, item) => (
        <Badge variant={getStatusVariant(item.status)}>
          {item.status?.replace('_', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'assignments',
      label: 'Crew',
      accessor: (item) => `${item.assignments?.length || 0} assigned`,
    },
    {
      key: 'progress',
      label: 'Progress',
      accessor: (item) => `${getProgress(item)}%`,
      render: (_value: unknown, item) => (
        <Stack gap={1}>
          <ProgressBar value={getProgress(item)} size="sm" />
          <Body size="sm" className="font-mono">{getProgress(item)}%</Body>
        </Stack>
      ),
    },
  ];

  const filters: ListPageFilter[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
      ],
    },
  ];

  const rowActions: ListPageAction<ScheduleItem>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: () => {} },
    { id: 'start', label: 'Start', icon: <Play className="h-4 w-4" />, onClick: () => {}, hidden: (item) => item.status !== 'scheduled' },
    { id: 'complete', label: 'Complete', icon: <CheckCircle className="h-4 w-4" />, onClick: () => {}, hidden: (item) => item.status !== 'in_progress' },
  ];

  const stats = [
    { label: 'Total Items', value: summary?.total || 0 },
    { label: 'In Progress', value: summary?.by_status?.in_progress || 0 },
    { label: 'Scheduled', value: summary?.by_status?.scheduled || 0 },
    { label: 'Completed', value: summary?.by_status?.completed || 0 },
  ];

  return (
    <ListPage<ScheduleItem>
      title="Production Schedule"
      subtitle="Manage production timeline and crew assignments"
      data={schedule}
      columns={columns}
      rowKey="id"
      loading={loading}
      error={error}
      onRetry={refetch}
      searchPlaceholder="Search schedule..."
      filters={filters}
      rowActions={rowActions}
      entityType="schedule"
      onExport={createExportHandler({
        filename: "schedule",
        getData: () => schedule.map((item: ScheduleItem) => ({
          title: item.title,
          startTime: item.start_time,
          endTime: item.end_time,
          status: item.status,
          assignments: item.assignments?.length || 0,
        })),
      })}
      stats={stats}
      emptyMessage="No schedule items found"
      emptyAction={{ label: 'Add Item', onClick: () => {} }}
      enableCapabilityDetection
      onScanAction={(capability, route) => router.push(route)}
      capabilityBasePath=""
      showFavorite
      showSettings
    />
  );
}
