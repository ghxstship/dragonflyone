'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Layout provided by route group
import {
  ListPage, Badge, Body, Stack,
  type ListPageColumn, type ListPageFilter, type ListPageAction} from "@ghxstship/ui";
import { createExportHandler, useAuthContext, PlatformRole } from '@ghxstship/config';
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

const getStatusVariant = (status: string): 'solid' | 'outline' | 'ghost' => {
  switch (status) {
    case 'complete': return 'solid';
    case 'ready': return 'outline';
    default: return 'ghost';
  }
};

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

  const columns: ListPageColumn<CueItem>[] = [
    {
      key: 'time',
      label: 'Time',
      accessor: 'time',
      sortable: true,
      render: (_value: unknown, c) => <Body className="font-display font-mono">{c.time}</Body>,
    },
    {
      key: 'cue',
      label: 'Cue',
      accessor: 'cue',
      sortable: true,
      render: (_value: unknown, c) => (
        <Stack gap={1}>
          <Body className="font-display">{c.cue}</Body>
          <Body size="sm" className="text-muted-foreground">{c.department}</Body>
        </Stack>
      ),
    },
    { key: 'notes', label: 'Notes', accessor: 'notes' },
    {
      key: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
      render: (_value: unknown, c) => <Badge variant={getStatusVariant(c.status)}>{c.status.toUpperCase()}</Badge>,
    },
  ];

  const filters: ListPageFilter[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'ready', label: 'Ready' },
        { value: 'complete', label: 'Complete' },
      ],
    },
    {
      key: 'department',
      label: 'Department',
      options: [
        { value: 'Audio', label: 'Audio' },
        { value: 'Lighting', label: 'Lighting' },
        { value: 'Video', label: 'Video' },
        { value: 'Stage', label: 'Stage' },
      ],
    },
  ];

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
