'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Trash2, Key, Copy, ArrowLeft } from 'lucide-react';
import { AtlvsAppLayout } from '../../../components/app-layout';
import { useApiKeys, useCreateApiKey, useRevokeApiKey, type ApiKey } from '../../../hooks/useApiManagement';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Stack,
  Body,
  Button,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';

const permissionOptions = [
  { value: 'read:productions', label: 'Read Productions' },
  { value: 'write:productions', label: 'Write Productions' },
  { value: 'read:sponsors', label: 'Read Sponsors' },
  { value: 'write:sponsors', label: 'Write Sponsors' },
  { value: 'read:schedule', label: 'Read Schedule' },
  { value: 'write:schedule', label: 'Write Schedule' },
  { value: 'read:venues', label: 'Read Venues' },
  { value: 'write:venues', label: 'Write Venues' },
];

const columns: ListPageColumn<ApiKey>[] = [
  { 
    key: 'name', 
    label: 'Name', 
    accessor: 'name', 
    sortable: true,
  },
  { 
    key: 'key_prefix', 
    label: 'Key', 
    accessor: 'key_prefix', 
    render: (value) => (
      <Stack direction="horizontal" gap={2} className="items-center">
        <Body className="font-mono text-body-sm">{String(value)}...</Body>
        <Copy className="size-3 cursor-pointer text-grey-400" />
      </Stack>
    )
  },
  { 
    key: 'permissions', 
    label: 'Permissions', 
    accessor: 'permissions', 
    render: (value) => {
      const perms = value as string[];
      return <Body className="text-body-sm">{perms?.length || 0} permissions</Body>;
    }
  },
  { 
    key: 'last_used_at', 
    label: 'Last Used', 
    accessor: 'last_used_at', 
    render: (value) => value ? new Date(String(value)).toLocaleDateString() : 'Never'
  },
  { 
    key: 'expires_at', 
    label: 'Expires', 
    accessor: 'expires_at', 
    render: (value) => value ? new Date(String(value)).toLocaleDateString() : 'Never'
  },
  { 
    key: 'is_active', 
    label: 'Status', 
    accessor: 'is_active', 
    render: (value) => (
      <Badge variant={value ? 'success' : 'error'}>
        {value ? 'ACTIVE' : 'REVOKED'}
      </Badge>
    )
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Key Name', type: 'text', required: true, placeholder: 'e.g., Production API Key', colSpan: 2 },
  { name: 'permissions', label: 'Permissions', type: 'multiselect', required: true, options: permissionOptions, colSpan: 2 },
  { name: 'rate_limit', label: 'Rate Limit (requests/hour)', type: 'number', placeholder: '1000' },
  { name: 'expires_at', label: 'Expiration Date', type: 'date' },
];

export default function ApiKeysPage() {
  const router = useRouter();
  const { data: apiKeys, isLoading, error, refetch } = useApiKeys();
  const createMutation = useCreateApiKey();
  const revokeMutation = useRevokeApiKey();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null);

  const filters: ListPageFilter[] = [
    { 
      key: 'is_active', 
      label: 'Status', 
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Revoked' },
      ]
    },
  ];

  const rowActions: ListPageAction<ApiKey>[] = [
    { 
      id: 'view', 
      label: 'View Details', 
      icon: <Eye className="size-4" />, 
      onClick: (row) => { setSelectedKey(row); setDrawerOpen(true); }
    },
    { 
      id: 'revoke', 
      label: 'Revoke', 
      icon: <Trash2 className="size-4" />, 
      variant: 'danger',
      onClick: (row) => { setKeyToRevoke(row); setRevokeDialogOpen(true); },
      hidden: (row) => !row.is_active
    },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await createMutation.mutateAsync({
      production_id: 'current-production-id',
      name: data.name as string,
      permissions: data.permissions as string[],
      rate_limit: data.rate_limit as number | undefined,
      expires_at: data.expires_at as string | undefined,
      is_active: true,
      created_by: 'current-user-id',
    });
    setCreateModalOpen(false);
    refetch();
  };

  const handleRevoke = async () => {
    if (keyToRevoke) {
      await revokeMutation.mutateAsync(keyToRevoke.id);
      setRevokeDialogOpen(false);
      setKeyToRevoke(null);
      refetch();
    }
  };

  const pageStats = [
    { label: 'Total Keys', value: apiKeys?.length || 0 },
    { label: 'Active', value: apiKeys?.filter(k => k.is_active).length || 0 },
    { label: 'Revoked', value: apiKeys?.filter(k => !k.is_active).length || 0 },
  ];

  const detailSections: DetailSection[] = selectedKey ? [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <Grid cols={2} gap={4}>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Key Prefix</Body>
            <Body className="font-mono">{selectedKey.key_prefix}...</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Status</Body>
            <Badge variant={selectedKey.is_active ? 'success' : 'error'}>
              {selectedKey.is_active ? 'ACTIVE' : 'REVOKED'}
            </Badge>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Rate Limit</Body>
            <Body>{selectedKey.rate_limit ? `${selectedKey.rate_limit}/hour` : 'Unlimited'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Expires</Body>
            <Body>{selectedKey.expires_at ? new Date(selectedKey.expires_at).toLocaleDateString() : 'Never'}</Body>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'permissions',
      title: 'Permissions',
      content: (
        <Stack gap={2}>
          {selectedKey.permissions?.map((perm, index) => (
            <Badge key={index}>{perm}</Badge>
          ))}
        </Stack>
      ),
    },
  ] : [];

  return (
    <AtlvsAppLayout>
      <Stack gap={4} className="p-4">
        <Button
          onClick={() => router.push('/api-management')}
          className="flex w-fit items-center gap-2 border-2 border-grey-300 bg-white px-4 py-2"
        >
          <ArrowLeft className="size-4" />
          Back to API Management
        </Button>
      </Stack>
      
      <ListPage<ApiKey>
        title="API Keys"
        subtitle="Manage API keys for integrations"
        data={apiKeys || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search keys..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => { setSelectedKey(row); setDrawerOpen(true); }}
        createLabel="Create API Key"
        onCreate={() => setCreateModalOpen(true)}
        stats={pageStats}
        emptyMessage="No API keys created yet"
        emptyAction={{ label: 'Create First Key', onClick: () => setCreateModalOpen(true) }}
        breadcrumbs={[
          { label: 'ATLVS', href: '/dashboard' }, 
          { label: 'API Management', href: '/api-management' },
          { label: 'API Keys' }
        ]}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create API Key"
        fields={formFields}
        onSubmit={handleCreate}
        size="md"
        defaultValues={{ permissions: [] }}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setSelectedKey(null); }}
        record={selectedKey}
        title={(k) => k.name}
        subtitle={(k) => k.key_prefix + '...'}
        sections={detailSections}
      />

      <ConfirmDialog
        open={revokeDialogOpen}
        title="Revoke API Key"
        message={`Are you sure you want to revoke "${keyToRevoke?.name}"? This action cannot be undone and will immediately invalidate the key.`}
        variant="danger"
        confirmLabel="Revoke"
        onConfirm={handleRevoke}
        onCancel={() => { setRevokeDialogOpen(false); setKeyToRevoke(null); }}
      />
    </AtlvsAppLayout>
  );
}
