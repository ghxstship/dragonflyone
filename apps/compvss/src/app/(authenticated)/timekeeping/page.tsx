"use client";

import { useRouter } from "next/navigation";
// Layout provided by route group
import { useTimekeeping, useApproveTimeEntry } from "@/hooks/useTimekeeping";
import { log, createExportHandler } from '@ghxstship/config';
import {
  ListPage,
  Badge,
  Text,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
} from "@ghxstship/ui";
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

  const columns: ListPageColumn<TimeEntry>[] = [
    {
      key: 'id',
      label: 'ID',
      accessor: (e) => e.id.substring(0, 8).toUpperCase(),
      render: (_, e) => <Text className="font-mono">{e.id.substring(0, 8).toUpperCase()}</Text>,
    },
    {
      key: 'user',
      label: 'Crew Member',
      accessor: (e) => e.user?.full_name || e.user?.email || 'Unknown',
      sortable: true,
    },
    {
      key: 'project',
      label: 'Project',
      accessor: (e) => e.project?.name || 'Unassigned',
      sortable: true,
    },
    {
      key: 'date',
      label: 'Date',
      accessor: 'date',
      sortable: true,
      render: (_, e) => <Text className="font-mono">{new Date(e.date).toLocaleDateString()}</Text>,
    },
    {
      key: 'hours_regular',
      label: 'Regular',
      accessor: 'hours_regular',
      render: (_, e) => <Text className="font-mono">{e.hours_regular}h</Text>,
    },
    {
      key: 'hours_overtime',
      label: 'Overtime',
      accessor: 'hours_overtime',
      render: (_, e) => <Text className="font-mono">{e.hours_overtime}h</Text>,
    },
    {
      key: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
      render: (_, e) => <Badge variant={e.status === "approved" ? "solid" : "outline"}>{e.status}</Badge>,
    },
  ];

  const filters: ListPageFilter[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
      ],
    },
  ];

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
      showFavorite
      showSettings
    />
  );
}
