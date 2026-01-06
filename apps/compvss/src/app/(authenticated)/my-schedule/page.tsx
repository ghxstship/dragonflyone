"use client";

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ListPage, type ListPageRowAction } from "@ghxstship/ui";
import { createExportHandler, useEntityData, getEntityColumns } from "@ghxstship/config";
import { useMySchedule, type MyScheduleItem } from "@/hooks/useMySchedule";
import { Eye, Clock, CheckCircle } from "lucide-react";

export default function MySchedulePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    items: scheduleItems,
    summary,
    isLoading: loading,
    error,
    refetch,
  } = useMySchedule();

  // Clock-in mutation
  const clockInMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/schedule/${itemId}/clock-in`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to clock in');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-schedule'] });
    },
  });

  // Mark complete mutation
  const completeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const response = await fetch(`/api/schedule/${itemId}/complete`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to mark complete');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-schedule'] });
    },
  });

  // SSOT pattern: Convert data array to entityIds + entitySelector
  const {
    entityIds,
    entityType,
    entitySelector,
  } = useEntityData<MyScheduleItem>({
    entityType: 'schedule',
    data: scheduleItems,
    isLoading: loading,
    error: error || null,
    refetch,
  });

  // Get columns from entity registry (SSOT)
  const entityColumns = getEntityColumns<MyScheduleItem>('schedule');

  const rowActions: ListPageRowAction<MyScheduleItem>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="h-4 w-4" />, onClick: (id, _item) => router.push(`/schedule/${id}`) },
    { id: 'clock-in', label: 'Clock In', icon: <Clock className="h-4 w-4" />, onClick: (id) => clockInMutation.mutate(id), hidden: (item) => item.status !== 'scheduled' },
    { id: 'complete', label: 'Mark Complete', icon: <CheckCircle className="h-4 w-4" />, onClick: (id) => completeMutation.mutate(id), hidden: (item) => item.status !== 'in_progress' },
  ];

  const stats = [
    { label: 'My Shifts', value: summary?.total || 0 },
    { label: 'Today', value: summary?.today || 0 },
    { label: 'This Week', value: summary?.this_week || 0 },
    { label: 'Upcoming', value: summary?.upcoming || 0 },
  ];

  return (
    <ListPage<MyScheduleItem>
      title="My Schedule"
      subtitle="View and manage your assigned shifts and tasks"
      entityType={entityType}
      entityIds={entityIds}
      entitySelector={entitySelector}
      isLoading={loading}
      error={error || null}
      onRetry={refetch}
      searchPlaceholder="Search my schedule..."
      rowActions={rowActions}
      tableConfig={{ columns: entityColumns as unknown[] }}
      onExport={createExportHandler({
        filename: "my-schedule",
        getData: () => scheduleItems.map((item: MyScheduleItem) => ({
          title: item.title,
          date: item.date,
          startTime: item.start_time,
          endTime: item.end_time,
          status: item.status,
          location: item.location,
        })),
      })}
      stats={stats}
      emptyState={{ 
        title: 'No scheduled shifts found',
        action: { label: 'View Available Shifts', onClick: () => router.push('/schedule') }
      }}
      showFavorite
      showSettings
    />
  );
}
