'use client';

// Layout provided by route group
import {
  ListPage, Badge, Text} from '@ghxstship/ui';
import { createExportHandler } from '@ghxstship/config';
import { useSyncJobs } from '@/hooks/useIntegrations';

interface SyncJob {
  id: string;
  source_system: string;
  target_system: string;
  status: string;
  created_at: string;
  payload: { action: string };
}

const getStatusVariant = (status: string): 'solid' | 'outline' | 'ghost' => {
  switch (status) {
    case 'synced': return 'solid';
    case 'pending': return 'outline';
    default: return 'ghost';
  }
};

export default function CompvssIntegrationsPage() {
  const { data: syncJobs = [], isLoading: loading, refetch: fetchSyncJobs } = useSyncJobs();

  const columns: ListPageColumn<SyncJob>[] = [
    {
      key: 'source_system',
      label: 'Source',
      accessor: 'source_system',
      sortable: true,
      render: (_, job) => <Text className="font-weight-semibold">{job.source_system.toUpperCase()}</Text>,
    },
    {
      key: 'target_system',
      label: 'Target',
      accessor: 'target_system',
      sortable: true,
      render: (_, job) => <Text>{job.target_system.toUpperCase()}</Text>,
    },
    {
      key: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
      render: (_, job) => <Badge variant={getStatusVariant(job.status)}>{job.status.toUpperCase()}</Badge>,
    },
    {
      key: 'created_at',
      label: 'Created',
      accessor: 'created_at',
      sortable: true,
      render: (_, job) => <Text size="sm">{new Date(job.created_at).toLocaleString()}</Text>,
    },
    {
      key: 'action',
      label: 'Action',
      accessor: (job) => job.payload.action,
      render: (_, job) => <Text className="font-mono">{job.payload.action}</Text>,
    },
  ];

  const filters: ListPageFilter[] = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'synced', label: 'Synced' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' },
      ],
    },
    {
      key: 'source_system',
      label: 'Source',
      options: [
        { value: 'atlvs', label: 'ATLVS' },
        { value: 'compvss', label: 'COMPVSS' },
        { value: 'gvteway', label: 'GVTEWAY' },
      ],
    },
  ];

  const stats = [
    { label: 'Projects from ATLVS', value: 24 },
    { label: 'Events to GVTEWAY', value: 18 },
    { label: 'Asset Allocations', value: 142 },
    { label: 'Total Sync Jobs', value: syncJobs.length },
  ];

  return (
    <ListPage<SyncJob>
      title="Platform Integrations"
      subtitle="Monitor cross-platform data synchronization and manage production workflows"
      data={syncJobs}
      columns={columns}
      rowKey="id"
      loading={loading}
      onRetry={fetchSyncJobs}
      searchPlaceholder="Search sync jobs..."
      filters={filters}
      entityType="integrations"
      onExport={createExportHandler({
        filename: "sync-jobs",
        getData: () => syncJobs.map((job: SyncJob) => ({
          source: job.source_system,
          target: job.target_system,
          status: job.status,
          created_at: job.created_at,
          action: job.payload.action,
        })),
      })}
      stats={stats}
      emptyMessage="No sync jobs found"
      showFavorite
      showSettings
    />
  );
}
