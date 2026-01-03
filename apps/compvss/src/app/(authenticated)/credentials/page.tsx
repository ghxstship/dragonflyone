'use client';

/**
 * Credentials Page
 * 
 * SSOT-compliant: Uses entity registry for status colors.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Ban, CheckCircle, Download, UserPlus } from 'lucide-react';
import { useCredentials, useCredentialStats, useRevokeCredential, useSuspendCredential, useReactivateCredential } from '@/hooks/useCredentials';
import { 
  useAuthContext,
  createExportHandler, 
  createImportHandler, 
  getImportTemplates,
  CREDENTIAL_STATUS_COLORS,
  useEntityConfig,
} from '@ghxstship/config';
import {
  ListPage, Badge, DetailDrawer, ConfirmDialog, Grid, Stack, Body,
  type ListPageAction, type ListPageBulkAction, type DetailSection,
} from "@ghxstship/ui";

interface Credential {
  id: string;
  badge_number: string;
  status: string;
  issued_at?: string;
  expires_at?: string;
  credential_type?: { id: string; name: string; code: string; color: string; access_level: number };
  contact?: { id: string; first_name: string; last_name: string; email: string; phone?: string };
}

const statusColors = CREDENTIAL_STATUS_COLORS;

// SSOT: Columns and filters are provided by useEntityConfig

export default function CredentialsPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { data: credentials, isLoading, error, refetch } = useCredentials();
  const { data: stats } = useCredentialStats();
  const revokeMutation = useRevokeCredential();
  const suspendMutation = useSuspendCredential();
  const reactivateMutation = useReactivateCredential();

  // SSOT: Get columns and filters from entity registry
  const { columns, filters } = useEntityConfig<Credential>({ entityName: 'credentials' });
  
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [credentialToRevoke, setCredentialToRevoke] = useState<Credential | null>(null);

  const rowActions: ListPageAction<Credential>[] = [
    { 
      id: 'view', 
      label: 'View Details', 
      icon: <Eye className="size-4" />, 
      onClick: (row) => { setSelectedCredential(row); setDrawerOpen(true); } 
    },
    { 
      id: 'edit', 
      label: 'Edit', 
      icon: <Pencil className="size-4" />, 
      onClick: (row) => router.push(`/credentials/${row.id}`) 
    },
    { 
      id: 'suspend', 
      label: 'Suspend', 
      icon: <Ban className="size-4" />, 
      onClick: async (row) => {
        await suspendMutation.mutateAsync({ id: row.id });
        refetch();
      },
      hidden: (row) => row.status !== 'active'
    },
    { 
      id: 'reactivate', 
      label: 'Reactivate', 
      icon: <CheckCircle className="size-4" />, 
      onClick: async (row) => {
        await reactivateMutation.mutateAsync(row.id);
        refetch();
      },
      hidden: (row) => row.status !== 'suspended'
    },
    { 
      id: 'revoke', 
      label: 'Revoke', 
      icon: <Ban className="size-4" />, 
      variant: 'danger',
      onClick: (row) => { setCredentialToRevoke(row); setRevokeDialogOpen(true); },
      hidden: (row) => row.status === 'revoked'
    },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'suspend', label: 'Suspend Selected', icon: <Ban className="size-4" /> },
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    { id: 'revoke', label: 'Revoke Selected', icon: <Ban className="size-4" />, variant: 'danger' },
  ];

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    if (actionId === 'suspend') {
      await Promise.all(selectedIds.map(id => suspendMutation.mutateAsync({ id })));
      refetch();
    }
  };

  const handleRevoke = async () => {
    if (credentialToRevoke) {
      await revokeMutation.mutateAsync({ 
        id: credentialToRevoke.id, 
        reason: 'Revoked by administrator',
        revokedBy: user?.id || '' 
      });
      setRevokeDialogOpen(false);
      setCredentialToRevoke(null);
      refetch();
    }
  };

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'credentials',
    requiredFields: ['badge_number'],
    onImport: async (records) => {
      for (const record of records) {
        await fetch('/api/credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
      }
      refetch();
    },
  });

  const importTemplates = getImportTemplates('credentials').length > 0 
    ? getImportTemplates('credentials') 
    : [{ id: 'default', name: 'Credential Import', mapping: { badge_number: 'badge_number', status: 'status', expires_at: 'expires_at' } }];

  const pageStats = [
    { label: 'Total Credentials', value: stats?.total || 0 },
    { label: 'Active', value: stats?.active || 0 },
    { label: 'Pending', value: stats?.pending || 0 },
    { label: 'Suspended', value: stats?.suspended || 0 },
  ];

  const detailSections: DetailSection[] = selectedCredential ? [
    {
      id: 'holder',
      title: 'Credential Holder',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Stack gap={1}>
            <Body className="text-text-disabled">Name</Body>
            <Body>{selectedCredential.contact ? `${selectedCredential.contact.first_name} ${selectedCredential.contact.last_name}` : '—'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-text-disabled">Email</Body>
            <Body>{selectedCredential.contact?.email || '—'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-text-disabled">Phone</Body>
            <Body>{selectedCredential.contact?.phone || '—'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-text-disabled">Badge Number</Body>
            <Body className="font-mono">{selectedCredential.badge_number}</Body>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'access',
      title: 'Access Information',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Stack gap={1}>
            <Body className="text-text-disabled">Credential Type</Body>
            <Body>{selectedCredential.credential_type?.name || '—'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-text-disabled">Access Level</Body>
            <Body>Level {selectedCredential.credential_type?.access_level || 0}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-text-disabled">Status</Body>
            <Badge variant={statusColors[selectedCredential.status] || 'ghost'}>
              {selectedCredential.status.toUpperCase()}
            </Badge>
          </Stack>
          <Stack gap={1}>
            <Body className="text-text-disabled">Expires</Body>
            <Body>{selectedCredential.expires_at ? new Date(selectedCredential.expires_at).toLocaleDateString() : 'Never'}</Body>
          </Stack>
        </Grid>
      ),
    },
  ] : [];

  return (
    <>
      <ListPage<Credential>
        title="Credentials"
        subtitle="Manage access credentials and badges for production staff and guests"
        data={credentials || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search by badge number or name..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
        onRowClick={(row) => { setSelectedCredential(row); setDrawerOpen(true); }}
        createLabel="Issue Credential"
        onCreate={() => router.push('/credentials/issue')}
        entityType="credentials"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['badge_number', 'status', 'expires_at']}
        templateDownloadUrl="/templates/imports/workforce-certifications-import.csv"
        onExport={createExportHandler({
          filename: "credentials",
          getData: () => (credentials || []).map(c => ({
            id: c.id,
            badge_number: c.badge_number,
            status: c.status,
            issued_at: c.issued_at || '',
            expires_at: c.expires_at || '',
            credential_type: c.credential_type?.name || '',
            contact_name: c.contact ? `${c.contact.first_name} ${c.contact.last_name}` : '',
            contact_email: c.contact?.email || '',
          })),
        })}
        stats={pageStats}
        emptyMessage="No credentials issued yet"
        emptyAction={{ label: 'Issue First Credential', onClick: () => router.push('/credentials/issue') }}
enableCapabilityDetection
        onScanAction={(capability, route) => router.push(route)}
        capabilityBasePath=""
        quickActions={[
          { id: 'types', label: 'Manage Types', icon: <Pencil className="size-4" />, onClick: () => router.push('/credentials/types') },
          { id: 'zones', label: 'Zone Access', icon: <UserPlus className="size-4" />, onClick: () => router.push('/credentials/zones') },
        ]}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedCredential}
        title={(c) => c.badge_number}
        subtitle={(c) => c.credential_type?.name || 'Unknown Type'}
        sections={detailSections}
        onEdit={(c) => router.push(`/credentials/${c.id}`)}
      />

      <ConfirmDialog
        open={revokeDialogOpen}
        title="Revoke Credential"
        message={`Are you sure you want to revoke credential "${credentialToRevoke?.badge_number}"? This action cannot be undone and the holder will lose all access.`}
        variant="danger"
        confirmLabel="Revoke"
        onConfirm={handleRevoke}
        onCancel={() => { setRevokeDialogOpen(false); setCredentialToRevoke(null); }}
      />
    </>
  );
}
