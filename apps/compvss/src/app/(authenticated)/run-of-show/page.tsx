'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ListPage,
  type ListPageAction} from "@ghxstship/ui";
import { createExportHandler, useAuthContext, PlatformRole, getEntityColumns, getEntityFilters } from '@ghxstship/config';
import { useSchedule } from '@/hooks/useSchedule';
import {
  useCues,
  useUpdateCueStatus,
  type CueItem,
} from '@/hooks/useRunOfShow';
import { Eye, Play, CheckCircle } from 'lucide-react';

const ADMIN_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

export default function RunOfShowPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const canManageCues = ADMIN_ROLES.some(role => hasRole(role));
  
  const { isLoading } = useSchedule();
  const { data: cues = [], refetch } = useCues();
  const updateCueStatusMutation = useUpdateCueStatus();
  const [currentTime] = useState('19:58');

  const updateCueStatus = (id: string, status: CueItem['status']) => {
    updateCueStatusMutation.mutate({ id, status });
  };

  const columns = getEntityColumns<CueItem>('run-of-show');
  const filters = getEntityFilters('run-of-show');

  const rowActions: ListPageAction<CueItem>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (c) => router.push(`/run-of-show/cues/${c.id}`) },
    { id: 'ready', label: 'Ready', icon: <Play className="h-4 w-4" />, onClick: (c) => updateCueStatus(c.id, 'ready'), hidden: (c) => !canManageCues || c.status !== 'pending' },
    { id: 'go', label: 'GO', icon: <CheckCircle className="h-4 w-4" />, onClick: (c) => updateCueStatus(c.id, 'complete'), hidden: (c) => !canManageCues || c.status !== 'ready' },
  ];

  const stats = [
    { label: 'Total Cues', value: cues.length },
    { label: 'Pending', value: cues.filter(c => c.status === 'pending').length },
    { label: 'Ready', value: cues.filter(c => c.status === 'ready').length },
    { label: 'Complete', value: cues.filter(c => c.status === 'complete').length },
  ];

  return (
    <ListPage<CueItem>
      title="Run of Show"
      subtitle={`Current Time: ${currentTime}`}
      data={cues}
      columns={columns}
      rowKey="id"
      loading={isLoading}
      onRetry={refetch}
      searchPlaceholder="Search cues..."
      filters={filters}
      rowActions={rowActions}
      onRowClick={(c) => router.push(`/run-of-show/cues/${c.id}`)}
      createLabel={canManageCues ? "Add Cue" : undefined}
      onCreate={canManageCues ? () => router.push('/run-of-show/cues/new') : undefined}
      entityType="run-of-show"
      onExport={createExportHandler({
        filename: "run-of-show",
        getData: () => cues.map((c: CueItem) => ({
          time: c.time,
          cue: c.cue,
          department: c.department,
          notes: c.notes,
          status: c.status,
        })),
      })}
      stats={stats}
      emptyMessage="No cues found"
      emptyAction={canManageCues ? { label: 'Add Cue', onClick: () => router.push('/run-of-show/cues/new') } : undefined}
      enableCapabilityDetection
      onScanAction={(capability, route) => router.push(route)}
      capabilityBasePath=""
      showFavorite
      showSettings
    />
  );
}
