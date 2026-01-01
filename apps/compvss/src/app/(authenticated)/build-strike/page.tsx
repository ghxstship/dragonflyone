'use client';

import { useRouter } from 'next/navigation';
import {
  ListPage,
  type ListPageAction} from "@ghxstship/ui";
import { createExportHandler, useAuthContext, PlatformRole, getEntityColumns, getEntityFilters } from '@ghxstship/config';
import {
  useBuildStrikeTasks,
  useUpdateBuildStrikeTaskStatus,
  type BuildStrikeTask as Task,
} from '@/hooks/useBuildStrike';
import { Eye, Play, CheckCircle } from 'lucide-react';

const ADMIN_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

export default function BuildStrikePage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const canManageTasks = ADMIN_ROLES.some(role => hasRole(role));
  
  const { data: tasks = [], isLoading, error, refetch } = useBuildStrikeTasks();
  const updateStatusMutation = useUpdateBuildStrikeTaskStatus();

  const columns = getEntityColumns<Task>('build-strike');
  const filters = getEntityFilters('build-strike');

  const updateTaskStatus = async (id: string, status: Task['status']) => {
    await updateStatusMutation.mutateAsync({ id, status });
  };

  const rowActions: ListPageAction<Task>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (t) => router.push(`/build-strike/${t.id}`) },
    ...(canManageTasks ? [
      { id: 'start', label: 'Start', icon: <Play className="h-4 w-4" />, onClick: (t: Task) => updateTaskStatus(t.id, 'in-progress'), hidden: (t: Task) => t.status !== 'pending' },
      { id: 'complete', label: 'Complete', icon: <CheckCircle className="h-4 w-4" />, onClick: (t: Task) => updateTaskStatus(t.id, 'complete'), hidden: (t: Task) => t.status !== 'in-progress' },
    ] : []),
  ];

  const stats = [
    { label: 'Total Tasks', value: tasks.length },
    { label: 'Pending', value: tasks.filter((t: Task) => t.status === 'pending').length },
    { label: 'In Progress', value: tasks.filter((t: Task) => t.status === 'in-progress').length },
    { label: 'Complete', value: tasks.filter((t: Task) => t.status === 'complete').length },
  ];

  return (
    <ListPage<Task>
      title="Build/Strike Schedule"
      subtitle="Manage build and strike tasks"
      data={tasks}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      error={error instanceof Error ? error : undefined}
      onRetry={refetch}
      searchPlaceholder="Search tasks..."
      filters={filters}
      rowActions={rowActions}
      onRowClick={(t) => router.push(`/build-strike/${t.id}`)}
      entityType="build-strike"
      onExport={createExportHandler({
        filename: "build-strike",
        getData: () => tasks.map((t: Task) => ({
          id: t.id,
          task: t.task,
          area: t.area,
          assignedTo: t.assignedTo,
          priority: t.priority,
          status: t.status,
        })),
      })}
      stats={stats}
      emptyMessage="No tasks found"
      enableCapabilityDetection
      onScanAction={(capability, route) => router.push(route)}
      capabilityBasePath=""
      showFavorite
      showSettings
    />
  );
}
