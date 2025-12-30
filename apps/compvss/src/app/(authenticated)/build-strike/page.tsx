'use client';

import { useRouter } from 'next/navigation';
// Layout provided by route group
import {
  ListPage, Body, Badge, Stack} from '@ghxstship/ui';
import { createExportHandler, useAuthContext, PlatformRole } from '@ghxstship/config';
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

const getStatusVariant = (status: string): 'solid' | 'outline' | 'ghost' => {
  switch (status) {
    case 'complete': return 'solid';
    case 'in-progress': return 'outline';
    default: return 'ghost';
  }
};

export default function BuildStrikePage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const canManageTasks = ADMIN_ROLES.some(role => hasRole(role));
  
  const { data: tasks = [], isLoading, error, refetch } = useBuildStrikeTasks();
  const updateStatusMutation = useUpdateBuildStrikeTaskStatus();

  const updateTaskStatus = async (id: string, status: Task['status']) => {
    await updateStatusMutation.mutateAsync({ id, status });
  };

  const columns: ListPageColumn<Task>[] = [
    {
      key: 'task',
      label: 'Task',
      accessor: 'task',
      sortable: true,
      render: (_, t) => (
        <Stack gap={1}>
          <Body className="font-display">{t.task}</Body>
          <Body size="sm" className="text-muted-foreground">{t.area} • {t.assignedTo}</Body>
        </Stack>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      accessor: 'priority',
      sortable: true,
      render: (_, t) => <Badge variant={t.priority === 'high' ? 'solid' : 'outline'}>{t.priority.toUpperCase()}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
      render: (_, t) => <Badge variant={getStatusVariant(t.status)}>{t.status.toUpperCase()}</Badge>,
    },
    { key: 'area', label: 'Area', accessor: 'area', sortable: true },
    { key: 'assignedTo', label: 'Assigned To', accessor: 'assignedTo' },
  ];

  const filters: ListPageFilter[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'in-progress', label: 'In Progress' },
        { value: 'complete', label: 'Complete' },
      ],
    },
    {
      key: 'priority',
      label: 'Priority',
      options: [
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
      ],
    },
  ];

  const rowActions: ListPageAction<Task>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (t) => router.push(`/build-strike/${t.id}`) },
    { id: 'start', label: 'Start', icon: <Play className="h-4 w-4" />, onClick: (t) => updateTaskStatus(t.id, 'in-progress'), hidden: (t) => !canManageTasks || t.status !== 'pending' },
    { id: 'complete', label: 'Complete', icon: <CheckCircle className="h-4 w-4" />, onClick: (t) => updateTaskStatus(t.id, 'complete'), hidden: (t) => !canManageTasks || t.status !== 'in-progress' },
  ];

  const stats = [
    { label: 'Complete', value: tasks.filter(t => t.status === 'complete').length },
    { label: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length },
    { label: 'Pending', value: tasks.filter(t => t.status === 'pending').length },
  ];

  return (
    <ListPage<Task>
      title="Build & Strike"
      subtitle="Build Progress: 45%"
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
      createLabel={canManageTasks ? "Add Task" : undefined}
      onCreate={canManageTasks ? () => router.push('/build-strike/new') : undefined}
      entityType="build-strike"
      onExport={createExportHandler({
        filename: "build-strike-tasks",
        getData: () => tasks.map((t: Task) => ({
          task: t.task,
          area: t.area,
          assignedTo: t.assignedTo,
          priority: t.priority,
          status: t.status,
        })),
      })}
      stats={stats}
      emptyMessage="No tasks found"
      emptyAction={canManageTasks ? { label: 'Add Task', onClick: () => router.push('/build-strike/new') } : undefined}
      showFavorite
      showSettings
    />
  );
}
