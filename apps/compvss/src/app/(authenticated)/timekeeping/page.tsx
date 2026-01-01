"use client";

import { useRouter } from "next/navigation";
import { useTimekeeping, useApproveTimeEntry } from "@/hooks/useTimekeeping";
import { log, createExportHandler, getEntityColumns, getEntityFilters } from '@ghxstship/config';
import {
  ListPage,
  type ListPageAction} from "@ghxstship/ui";
import { Check } from "lucide-react";

interface TimeEntry {
  id: string;
  user?: { full_name?: string; email?: string };
  project?: { name?: string };
  date: string;
  hours_regular: number;
  hours_overtime: number;
  status: string;
}

export default function TimekeepingPage() {
  const router = useRouter();
  const { data: timeEntries, isLoading, refetch } = useTimekeeping({});
  const approveEntry = useApproveTimeEntry();

  const entries = timeEntries || [];
  const totalRegular = entries.reduce((sum: number, e) => sum + e.hours_regular, 0);
  const totalOvertime = entries.reduce((sum: number, e) => sum + e.hours_overtime, 0);
  const pendingCount = entries.filter(e => e.status === "pending").length;

  const handleApprove = async (id: string) => {
    try {
      await approveEntry.mutateAsync(id);
      refetch();
    } catch (error) {
      log.error('Failed to approve time entry:', error instanceof Error ? error : undefined);
    }
  };

  const columns = getEntityColumns<TimeEntry>('timekeeping');
  const filters = getEntityFilters('timekeeping');

  const rowActions: ListPageAction<TimeEntry>[] = [
    {
      id: 'approve',
      label: 'Approve',
      icon: <Check className="h-4 w-4" />,
      onClick: (entry) => handleApprove(entry.id),
      hidden: (entry) => entry.status !== 'pending',
    },
  ];

  const stats = [
    { label: 'Total Entries', value: entries.length },
    { label: 'Regular Hours', value: totalRegular },
    { label: 'Overtime Hours', value: totalOvertime },
    { label: 'Pending Approval', value: pendingCount },
  ];

  return (
    <ListPage<TimeEntry>
      title="Timekeeping"
      subtitle="Track crew hours, overtime, and timesheet approvals"
      data={entries}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      onRetry={refetch}
      searchPlaceholder="Search crew or project..."
      filters={filters}
      rowActions={rowActions}
      createLabel="Log Time"
      onCreate={() => router.push('/timekeeping/log')}
      entityType="timekeeping"
      onExport={createExportHandler({
        filename: "timesheet",
        getData: () => entries.map(e => ({
          id: e.id,
          crew_member: e.user?.full_name || e.user?.email || 'Unknown',
          project: e.project?.name || 'Unassigned',
          date: e.date,
          hours_regular: e.hours_regular,
          hours_overtime: e.hours_overtime,
          status: e.status,
        })),
      })}
      stats={stats}
      emptyMessage="No time entries found"
      emptyAction={{ label: 'Log Time', onClick: () => router.push('/timekeeping/log') }}
      enableCapabilityDetection
      onScanAction={(capability, route) => router.push(route)}
      capabilityBasePath=""
      showFavorite
      showSettings
    />
  );
}
