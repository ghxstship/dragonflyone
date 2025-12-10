'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Eye, Pencil, Shield } from 'lucide-react';
import { CompvssAppLayout } from '../../../components/app-layout';
import { useCredentialTypes, useCreateCredentialType, useUpdateCredentialType, type CredentialType } from '../../../hooks/useCredentials';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  Grid,
  Stack,
  Body,
  Box,
  type ListPageColumn,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';
import { createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';


const columns: ListPageColumn<CredentialType>[] = [
  { 
    key: 'code', 
    label: 'Code', 
    accessor: 'code', 
    sortable: true, 
    width: '100px',
    render: (value, row) => (
      <Badge style={{ backgroundColor: row.color, color: '#fff' }}>
        {String(value)}
      </Badge>
    )
  },
  { key: 'name', label: 'Name', accessor: 'name', sortable: true },
  { 
    key: 'access_level', 
    label: 'Access Level', 
    accessor: 'access_level', 
    sortable: true,
    render: (value) => `Level ${value}`
  },
  { 
    key: 'max_issued', 
    label: 'Max Issued', 
    accessor: 'max_issued', 
    sortable: true,
    render: (value) => (value ? String(value) : 'Unlimited')
  },
  { 
    key: 'requires_photo', 
    label: 'Photo Required', 
    accessor: 'requires_photo', 
    render: (value) => value ? 'Yes' : 'No'
  },
  { 
    key: 'requires_background_check', 
    label: 'Background Check', 
    accessor: 'requires_background_check', 
    render: (value) => value ? 'Required' : 'Not Required'
  },
  { 
    key: 'is_active', 
    label: 'Status', 
    accessor: 'is_active', 
    render: (value) => (
      <Badge variant={value ? 'success' : 'ghost'}>
        {value ? 'ACTIVE' : 'INACTIVE'}
      </Badge>
    )
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Type Name', type: 'text', required: true, placeholder: 'e.g., All Access', colSpan: 2 },
  { name: 'code', label: 'Code', type: 'text', required: true, placeholder: 'e.g., AA' },
  { name: 'access_level', label: 'Access Level (1-10)', type: 'number', required: true, placeholder: '1' },
  { name: 'color', label: 'Badge Color', type: 'text', required: true, placeholder: '#eab308' },
  { name: 'max_issued', label: 'Max Credentials', type: 'number', placeholder: 'Leave empty for unlimited' },
  { name: 'description', label: 'Description', type: 'textarea', colSpan: 2, placeholder: 'Describe this credential type...' },
  { name: 'requires_photo', label: 'Requires Photo', type: 'checkbox' },
  { name: 'requires_background_check', label: 'Requires Background Check', type: 'checkbox' },
  { name: 'is_active', label: 'Active', type: 'checkbox' },
];

export default function CredentialTypesPage() {
  const router = useRouter();
  const params = useParams();
  const productionId = params?.productionId as string | undefined;
  const { data: credentialTypes, isLoading, error, refetch } = useCredentialTypes(productionId);
  const createMutation = useCreateCredentialType();
  const updateMutation = useUpdateCredentialType();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<CredentialType | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const rowActions: ListPageAction<CredentialType>[] = [
    { 
      id: 'view', 
      label: 'View Details', 
      icon: <Eye className="size-4" />, 
      onClick: (row) => { setSelectedType(row); setDrawerOpen(true); } 
    },
    { 
      id: 'edit', 
      label: 'Edit', 
      icon: <Pencil className="size-4" />, 
      onClick: (row) => { setSelectedType(row); setEditModalOpen(true); } 
    },
    { 
      id: 'zones', 
      label: 'Configure Zone Access', 
      icon: <Shield className="size-4" />, 
      onClick: (row) => router.push(`/credentials/zones?type=${row.id}`) 
    },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    const createData = {
      name: data.name as string,
      code: data.code as string,
      description: data.description as string | undefined,
      access_level: data.access_level as number,
      color: data.color as string,
      max_issued: data.max_issued as number | undefined,
      requires_photo: data.requires_photo as boolean,
      requires_background_check: data.requires_background_check as boolean,
      is_active: data.is_active as boolean,
      production_id: productionId || '',
      organization_id: '',
    };
    await createMutation.mutateAsync(createData);
    setCreateModalOpen(false);
    refetch();
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (selectedType) {
      await updateMutation.mutateAsync({ id: selectedType.id, ...data } as CredentialType & { id: string });
      setEditModalOpen(false);
      setSelectedType(null);
      refetch();
    }
  };

  const stats = [
    { label: 'Total Types', value: credentialTypes?.length || 0 },
    { label: 'Active', value: credentialTypes?.filter(t => t.is_active).length || 0 },
    { label: 'Require Photo', value: credentialTypes?.filter(t => t.requires_photo).length || 0 },
    { label: 'Require Background Check', value: credentialTypes?.filter(t => t.requires_background_check).length || 0 },
  ];

  const detailSections: DetailSection[] = selectedType ? [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <Grid cols={2} gap={4}>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Code</Body>
            <Box className="inline-flex">
              <Badge style={{ backgroundColor: selectedType.color, color: '#fff' }}>
                {selectedType.code}
              </Badge>
            </Box>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Access Level</Body>
            <Body>Level {selectedType.access_level}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Max Issued</Body>
            <Body>{selectedType.max_issued || 'Unlimited'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Status</Body>
            <Badge variant={selectedType.is_active ? 'success' : 'ghost'}>
              {selectedType.is_active ? 'ACTIVE' : 'INACTIVE'}
            </Badge>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'requirements',
      title: 'Requirements',
      content: (
        <Grid cols={2} gap={4}>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Photo Required</Body>
            <Body>{selectedType.requires_photo ? 'Yes' : 'No'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Background Check</Body>
            <Body>{selectedType.requires_background_check ? 'Required' : 'Not Required'}</Body>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'description',
      title: 'Description',
      content: <Body>{selectedType.description || 'No description provided.'}</Body>,
    },
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<CredentialType, 'id'>>({

    entityType: 'credential-types',

    requiredFields: ['name', 'code', 'access_level'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/credential-types', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      refetch();

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('credential-types');


  return (
    <CompvssAppLayout>
      <ListPage<CredentialType>
        title="Credential Types"
        subtitle="Configure credential types and access levels for your production"
        data={credentialTypes || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search credential types..."
        rowActions={rowActions}
        onRowClick={(row) => { setSelectedType(row); setDrawerOpen(true); }}
        createLabel="New Credential Type"
        onCreate={() => setCreateModalOpen(true)}
        entityType="credential-types"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['name', 'code', 'access_level', 'color', 'max_issued', 'description', 'requires_photo']}
        onExport={createExportHandler({
          filename: "credential-types",
          getData: () => (credentialTypes || []).map(t => ({
            id: t.id,
            name: t.name,
            code: t.code,
            description: t.description || '',
            access_level: t.access_level,
            color: t.color,
            max_issued: t.max_issued || '',
            requires_photo: t.requires_photo,
            requires_background_check: t.requires_background_check,
          })),
        })}
        stats={stats}
        emptyMessage="No credential types configured"
        emptyAction={{ label: 'Create First Type', onClick: () => setCreateModalOpen(true) }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/credentials/types/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch();
          }
        }}
        bulkActions={[
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create Credential Type"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
        record={{ is_active: true, requires_photo: false, requires_background_check: false, access_level: 1, color: '#eab308' }}
      />

      <RecordFormModal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setSelectedType(null); }}
        mode="edit"
        title="Edit Credential Type"
        fields={formFields}
        onSubmit={handleUpdate}
        size="lg"
        record={selectedType ? { ...selectedType } : {}}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedType}
        title={(t) => t.name}
        subtitle={(t) => `Code: ${t.code}`}
        sections={detailSections}
        onEdit={(t) => { setSelectedType(t); setEditModalOpen(true); setDrawerOpen(false); }}
      />
    </CompvssAppLayout>
  );
}
