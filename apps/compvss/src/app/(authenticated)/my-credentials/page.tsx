"use client";

import { useRouter } from 'next/navigation';
import { ListPage, type ListPageRowAction } from "@ghxstship/ui";
import { createExportHandler, useEntityData, getEntityColumns } from "@ghxstship/config";
import { useMyCredentials, type MyCredentialItem } from "@/hooks/useMyCredentials";
import { Eye, Download, QrCode, RefreshCw } from "lucide-react";

export default function MyCredentialsPage() {
  const router = useRouter();
  const {
    items: credentials,
    summary,
    isLoading: loading,
    error,
    refetch,
  } = useMyCredentials();

  // SSOT pattern: Convert data array to entityIds + entitySelector
  const {
    entityIds,
    entityType,
    entitySelector,
  } = useEntityData<MyCredentialItem>({
    entityType: 'credentials',
    data: credentials,
    isLoading: loading,
    error: error || null,
    refetch,
  });

  // Get columns from entity registry (SSOT)
  const entityColumns = getEntityColumns<MyCredentialItem>('credentials');

  const rowActions: ListPageRowAction<MyCredentialItem>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (id, _item) => router.push(`/credentials/${id}`) },
    { id: 'download', label: 'Download', icon: <Download className="h-4 w-4" />, onClick: () => {} },
    { id: 'qr', label: 'Show QR', icon: <QrCode className="h-4 w-4" />, onClick: () => {} },
    { id: 'renew', label: 'Request Renewal', icon: <RefreshCw className="h-4 w-4" />, onClick: () => {}, hidden: (item) => item.status !== 'expiring_soon' },
  ];

  const stats = [
    { label: 'Total Credentials', value: summary?.total || 0 },
    { label: 'Active', value: summary?.active || 0 },
    { label: 'Expiring Soon', value: summary?.expiring_soon || 0 },
    { label: 'Expired', value: summary?.expired || 0 },
  ];

  return (
    <ListPage<MyCredentialItem>
      title="My Credentials"
      subtitle="View and manage your access credentials and badges"
      entityType={entityType}
      entityIds={entityIds}
      entitySelector={entitySelector}
      isLoading={loading}
      error={error || null}
      onRetry={refetch}
      searchPlaceholder="Search credentials..."
      rowActions={rowActions}
      tableConfig={{ columns: entityColumns as unknown[] }}
      onExport={createExportHandler({
        filename: "my-credentials",
        getData: () => credentials.map((item: MyCredentialItem) => ({
          name: item.name,
          type: item.type,
          zone: item.zone,
          validFrom: item.valid_from,
          validUntil: item.valid_until,
          status: item.status,
        })),
      })}
      stats={stats}
      emptyState={{ 
        title: 'No credentials assigned',
        action: { label: 'Request Credential', onClick: () => router.push('/credentials/request') }
      }}
      showFavorite
      showSettings
    />
  );
}
