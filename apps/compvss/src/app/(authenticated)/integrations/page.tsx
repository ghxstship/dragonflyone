'use client';

import { useRouter } from 'next/navigation';
import {
  ListPage} from "@ghxstship/ui";
import { createExportHandler, getEntityColumns, getEntityFilters } from '@ghxstship/config';
import { useSyncJobs } from '@/hooks/useIntegrations';

interface SyncJob {
  id: string;
  source_system: string;
  target_system: string;
  status: string;
  created_at: string;
  payload: { action: string };
}

export default function CompvssIntegrationsPage() {
  const router = useRouter();
  const { data: syncJobs = [], isLoading: loading, refetch: fetchSyncJobs } = useSyncJobs();

  const columns = getEntityColumns<SyncJob>('integrations');
  const filters = getEntityFilters('integrations');

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
      enableCapabilityDetection
      onScanAction={(capability, route) => router.push(route)}
      capabilityBasePath=""
      showFavorite
      showSettings
    />
  );
}
