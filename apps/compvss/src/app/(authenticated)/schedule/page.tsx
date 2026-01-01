"use client";

import { useRouter } from 'next/navigation';
import {
  ListPage,
  type ListPageAction} from "@ghxstship/ui";
import { createExportHandler, getEntityColumns, getEntityFilters } from "@ghxstship/config";
import { useSchedulePageData, type ScheduleItem } from "@/hooks/useSchedule";
import { Eye, Play, CheckCircle } from "lucide-react";

export default function SchedulePage() {
  const router = useRouter();
  const {
    items: schedule,
    summary,
    isLoading: loading,
    error,
    refetch,
  } = useSchedulePageData();

  const columns = getEntityColumns<ScheduleItem>('schedule');
  const filters = getEntityFilters('schedule');

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
