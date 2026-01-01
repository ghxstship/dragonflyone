'use client';

import { useRouter } from 'next/navigation';
import {
  ListPage,
  type ListPageAction} from "@ghxstship/ui";
import { createExportHandler, getEntityColumns, getEntityFilters } from '@ghxstship/config';
import { Eye, Layout } from 'lucide-react';
import { useStages, type Stage } from '@/hooks/useStages';

export default function StageManagementPage() {
  const router = useRouter();
  const { data: stages = [], refetch } = useStages();

  const columns = getEntityColumns<Stage>('stage-management');
  const filters = getEntityFilters('stage-management');

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
      enableCapabilityDetection
      onScanAction={(capability, route) => router.push(route)}
      capabilityBasePath=""
      showFavorite
      showSettings
    />
  );
}