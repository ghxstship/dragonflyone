'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, Pencil, MapPin, Shield, Plus } from 'lucide-react';
import { CompvssAppLayout } from '../../../components/app-layout';
import { useZones, useCredentialTypes, useCredentialZoneAccess, useUpdateZoneAccess, useCreateZone } from '../../../hooks/useCredentials';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  Grid,
  Stack,
  Body,
  Box,
  Card,
  H3,
  Button,
  Select,
  type ListPageColumn,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';

interface Zone {
  id: string;
  name: string;
  code: string;
  zone_type: string;
  description?: string;
  capacity?: number;
  access_level: number;
  color?: string;
  is_active: boolean;
}

const zoneTypeColors: Record<string, string> = {
  public: '#22c55e',
  vip: '#f59e0b',
  backstage: '#8b5cf6',
  production: '#3b82f6',
  operations: '#6b7280',
  restricted: '#ef4444',
  emergency: '#dc2626',
};

const columns: ListPageColumn<Zone>[] = [
  { 
    key: 'code', 
    label: 'Code', 
    accessor: 'code', 
    sortable: true, 
    width: '100px',
    render: (value, row) => (
      <Badge style={{ backgroundColor: row.color || zoneTypeColors[row.zone_type] || '#666', color: '#fff' }}>
        {String(value)}
      </Badge>
    )
  },
  { key: 'name', label: 'Zone Name', accessor: 'name', sortable: true },
  { 
    key: 'zone_type', 
    label: 'Type', 
    accessor: 'zone_type', 
    sortable: true,
    render: (value) => String(value).replace('_', ' ').toUpperCase()
  },
  { 
    key: 'access_level', 
    label: 'Access Level', 
    accessor: 'access_level', 
    sortable: true,
    render: (value) => `Level ${value}`
  },
  { 
    key: 'capacity', 
    label: 'Capacity', 
    accessor: 'capacity', 
    sortable: true,
    render: (value) => value || 'Unlimited'
  },
  { 
    key: 'is_active', 
    label: 'Status', 
    accessor: 'is_active', 
    render: (value) => (
      <Badge variant={value ? 'success' : 'default'}>
        {value ? 'ACTIVE' : 'INACTIVE'}
      </Badge>
    )
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Zone Name', type: 'text', required: true, placeholder: 'e.g., Main Stage', colSpan: 2 },
  { name: 'code', label: 'Code', type: 'text', required: true, placeholder: 'e.g., MS' },
  { name: 'zone_type', label: 'Zone Type', type: 'select', required: true, options: [
    { value: 'public', label: 'Public' },
    { value: 'vip', label: 'VIP' },
    { value: 'backstage', label: 'Backstage' },
    { value: 'production', label: 'Production' },
    { value: 'operations', label: 'Operations' },
    { value: 'restricted', label: 'Restricted' },
    { value: 'emergency', label: 'Emergency' },
  ]},
  { name: 'access_level', label: 'Access Level (1-10)', type: 'number', required: true, placeholder: '1' },
  { name: 'capacity', label: 'Capacity', type: 'number', placeholder: 'Leave empty for unlimited' },
  { name: 'color', label: 'Zone Color', type: 'color' },
  { name: 'description', label: 'Description', type: 'textarea', colSpan: 2, placeholder: 'Describe this zone...' },
  { name: 'is_active', label: 'Active', type: 'checkbox' },
];

export default function ZonesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedTypeId = searchParams.get('type');
  
  const { data: zones, isLoading, error, refetch } = useZones();
  const { data: credentialTypes } = useCredentialTypes();
  const { data: zoneAccess } = useCredentialZoneAccess(selectedTypeId || '');
  const createMutation = useCreateZone();
  const updateAccessMutation = useUpdateZoneAccess();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accessMatrix, setAccessMatrix] = useState<Record<string, string>>({});

  // Initialize access matrix when zone access data loads
  useState(() => {
    if (zoneAccess) {
      const matrix: Record<string, string> = {};
      zoneAccess.forEach(za => {
        matrix[za.zone_id] = za.access_type;
      });
      setAccessMatrix(matrix);
    }
  });

  const selectedType = credentialTypes?.find(t => t.id === selectedTypeId);

  const rowActions: ListPageAction<Zone>[] = [
    { 
      id: 'view', 
      label: 'View Details', 
      icon: <Eye className="size-4" />, 
      onClick: (row) => { setSelectedZone(row); setDrawerOpen(true); } 
    },
    { 
      id: 'edit', 
      label: 'Edit', 
      icon: <Pencil className="size-4" />, 
      onClick: (row) => { setSelectedZone(row); } 
    },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await createMutation.mutateAsync({
      ...data,
      production_id: productionId || params?.productionId || '', 
    } as Zone);
    setCreateModalOpen(false);
    refetch();
  };

  const handleAccessChange = (zoneId: string, accessType: string) => {
    setAccessMatrix(prev => ({ ...prev, [zoneId]: accessType }));
  };

  const handleSaveAccess = async () => {
    if (!selectedTypeId) return;
    
    const zoneAccess = Object.entries(accessMatrix)
      .filter(([_, accessType]) => accessType !== 'denied')
      .map(([zone_id, access_type]) => ({ zone_id, access_type }));
    
    await updateAccessMutation.mutateAsync({
      credentialTypeId: selectedTypeId,
      zoneAccess,
    });
  };

  const stats = [
    { label: 'Total Zones', value: zones?.length || 0 },
    { label: 'Active', value: zones?.filter(z => z.is_active).length || 0 },
    { label: 'Public', value: zones?.filter(z => z.zone_type === 'public').length || 0 },
    { label: 'Restricted', value: zones?.filter(z => z.zone_type === 'restricted').length || 0 },
  ];

  const detailSections: DetailSection[] = selectedZone ? [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <Grid cols={2} gap={4}>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Code</Body>
            <Badge style={{ backgroundColor: selectedZone.color || zoneTypeColors[selectedZone.zone_type], color: '#fff' }}>
              {selectedZone.code}
            </Badge>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Type</Body>
            <Body>{selectedZone.zone_type.replace('_', ' ').toUpperCase()}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Access Level</Body>
            <Body>Level {selectedZone.access_level}</Body>
          </Stack>
          <Stack gap={1}>
            <Body className="text-body-sm text-grey-500">Capacity</Body>
            <Body>{selectedZone.capacity || 'Unlimited'}</Body>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'description',
      title: 'Description',
      content: <Body>{selectedZone.description || 'No description provided.'}</Body>,
    },
  ] : [];

  return (
    <CompvssAppLayout>
      {selectedTypeId ? (
        // Zone Access Matrix View
        <Box className="min-h-screen bg-grey-50 p-8">
          <Stack gap={6}>
            <Stack direction="horizontal" gap={4} className="items-center justify-between">
              <Stack gap={1}>
                <H3>Zone Access Matrix</H3>
                <Body className="text-grey-600">
                  Configure zone access for: {selectedType?.name || 'Unknown Type'}
                </Body>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                <Button
                  onClick={() => router.push('/credentials/zones')}
                  className="border-2 border-grey-300 bg-white px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveAccess}
                  className="border-2 border-primary bg-primary px-4 py-2 text-white"
                >
                  Save Access
                </Button>
              </Stack>
            </Stack>

            <Card className="border-2 border-grey-200 p-6">
              <Stack gap={4}>
                {zones?.map(zone => (
                  <Box
                    key={zone.id}
                    className="flex items-center justify-between border-b border-grey-100 pb-4 last:border-b-0 last:pb-0"
                  >
                    <Stack direction="horizontal" gap={3} className="items-center">
                      <Badge style={{ backgroundColor: zone.color || zoneTypeColors[zone.zone_type], color: '#fff' }}>
                        {zone.code}
                      </Badge>
                      <Stack gap={0}>
                        <Body className="font-weight-semibold">{zone.name}</Body>
                        <Body className="text-body-sm text-grey-500">Level {zone.access_level}</Body>
                      </Stack>
                    </Stack>
                    <Select
                      value={accessMatrix[zone.id] || 'denied'}
                      onChange={(e) => handleAccessChange(zone.id, e.target.value)}
                      className="w-48 border-2 border-grey-300 px-3 py-2"
                    >
                      <option value="denied">No Access</option>
                      <option value="full">Full Access</option>
                      <option value="escorted">Escorted Only</option>
                      <option value="time_limited">Time Limited</option>
                    </Select>
                  </Box>
                ))}
              </Stack>
            </Card>
          </Stack>
        </Box>
      ) : (
        // Zone List View
        <ListPage<Zone>
          title="Zones"
          subtitle="Manage venue zones and access areas for your production"
          data={zones || []}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          error={error}
          onRetry={refetch}
          searchPlaceholder="Search zones..."
          rowActions={rowActions}
          onRowClick={(row) => { setSelectedZone(row); setDrawerOpen(true); }}
          createLabel="New Zone"
          onCreate={() => setCreateModalOpen(true)}
          stats={stats}
          emptyMessage="No zones configured"
          emptyAction={{ label: 'Create First Zone', onClick: () => setCreateModalOpen(true) }}
          quickActions={[
            { id: 'map', label: 'Zone Map', icon: <MapPin className="size-4" />, onClick: () => {} },
          ]}
        />
      )}

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create Zone"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
        defaultValues={{ is_active: true, access_level: 1, zone_type: 'public' }}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedZone}
        title={(z) => z.name}
        subtitle={(z) => `Code: ${z.code}`}
        sections={detailSections}
      />
    </CompvssAppLayout>
  );
}
