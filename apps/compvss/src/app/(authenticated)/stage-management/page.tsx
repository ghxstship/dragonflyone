'use client';

import { useRouter } from 'next/navigation';
// Layout provided by route group
import {
  ListPage,
  Badge,
  Body,
  Stack,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
} from '@ghxstship/ui';
import { createExportHandler } from '@ghxstship/config';
import { Eye, Layout } from 'lucide-react';
import { useStages, type Stage } from '@/hooks/useStages';

const getStatusVariant = (status: string): 'solid' | 'outline' | 'ghost' => {
  return status === 'Active' ? 'solid' : 'outline';
};

export default function StageManagementPage() {
  const router = useRouter();
  const { data: stages = [], refetch } = useStages();

  const columns: ListPageColumn<Stage>[] = [
    {
      key: 'name',
      label: 'Stage',
      accessor: 'name',
      sortable: true,
      render: (_, s) => (
        <Stack gap={1}>
          <Body className="font-display">{s.name}</Body>
          <Badge variant="outline">{s.type}</Badge>
        </Stack>
      ),
    },
    { key: 'dimensions', label: 'Dimensions', accessor: 'dimensions' },
    { key: 'capacity', label: 'Capacity', accessor: (s) => s.capacity.toLocaleString(), sortable: true },
    {
      key: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
      render: (_, s) => <Badge variant={getStatusVariant(s.status)}>{s.status}</Badge>,
    },
  ];

  const filters: ListPageFilter[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
      ],
    },
    {
      key: 'type',
      label: 'Type',
      options: [
        { value: 'Main Stage', label: 'Main Stage' },
        { value: 'Side Stage', label: 'Side Stage' },
        { value: 'Outdoor', label: 'Outdoor' },
      ],
    },
  ];

  const rowActions: ListPageAction<Stage>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (s) => router.push(`/stage-management/${s.id}`) },
    { id: 'layout', label: 'Layout', icon: <Layout className="h-4 w-4" />, onClick: (s) => router.push(`/stage-management/${s.id}/layout`) },
  ];

  const stats = [
    { label: 'Total Stages', value: stages.length },
    { label: 'Active Stages', value: stages.filter(s => s.status === 'Active').length },
    { label: 'Equipment Items', value: 93 },
    { label: 'Tech Specs', value: 12 },
  ];

  return (
    <ListPage<Stage>
      title="Stage Management"
      subtitle="Manage stage configurations, layouts, and technical requirements for productions."
      data={stages}
      columns={columns}
      rowKey="id"
      loading={false}
      onRetry={refetch}
      searchPlaceholder="Search stages..."
      filters={filters}
      rowActions={rowActions}
      onRowClick={(s) => router.push(`/stage-management/${s.id}`)}
      entityType="stage-management"
      onExport={createExportHandler({
        filename: "stages",
        getData: () => stages.map((s: Stage) => ({
          name: s.name,
          type: s.type,
          dimensions: s.dimensions,
          capacity: s.capacity,
          status: s.status,
        })),
      })}
      stats={stats}
      emptyMessage="No stages found"
      showFavorite
      showSettings
    />
  );
}