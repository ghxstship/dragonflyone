'use client';

import { useState } from 'react';
import { Eye, Pencil, Calendar } from 'lucide-react';
import { CompvssAppLayout } from '../../components/app-layout';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  Grid,
  Stack,
  Body,
  EnterprisePageHeader,
  MainContent,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';
import { getBadgeVariant, createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';

import {
  useAvailability,
  useCreateAvailability,
  useDeleteAvailability,
  useBulkUpdateAvailability,
  type AvailabilitySlot,
} from '../../hooks/useAvailability';
import { useAuthContext } from '@ghxstship/config';

const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<AvailabilitySlot>[] = [
  { key: 'user_name', label: 'Crew Member', accessor: 'user_name', sortable: true },
  { key: 'role', label: 'Role', accessor: 'role' },
  { key: 'department', label: 'Department', accessor: 'department', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'date', label: 'Date', accessor: (r) => new Date(r.date).toLocaleDateString(), sortable: true },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v).toUpperCase()}</Badge> },
  { key: 'start_time', label: 'Start', accessor: (r) => r.start_time || '-' },
  { key: 'end_time', label: 'End', accessor: (r) => r.end_time || '-' },
  { key: 'calendar_source', label: 'Source', accessor: 'calendar_source', render: (v) => v === 'google' ? 'Google' : 'Manual' },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'available', label: 'Available' }, { value: 'unavailable', label: 'Unavailable' }, { value: 'tentative', label: 'Tentative' }, { value: 'booked', label: 'Booked' }] },
  { key: 'department', label: 'Department', options: [{ value: 'Audio', label: 'Audio' }, { value: 'Lighting', label: 'Lighting' }, { value: 'Stage', label: 'Stage' }, { value: 'Video', label: 'Video' }, { value: 'Rigging', label: 'Rigging' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'date', label: 'Date', type: 'date', required: true },
  { name: 'status', label: 'Status', type: 'select', required: true, options: [{ value: 'available', label: 'Available' }, { value: 'unavailable', label: 'Unavailable' }, { value: 'tentative', label: 'Tentative' }] },
  { name: 'start_time', label: 'Start Time', type: 'text', placeholder: '09:00' },
  { name: 'end_time', label: 'End Time', type: 'text', placeholder: '18:00' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

export default function AvailabilityPage() {
  const { user } = useAuthContext();
  const { data: availability = [], isLoading, refetch } = useAvailability();
  const createMutation = useCreateAvailability();
  const deleteMutation = useDeleteAvailability();
  const bulkUpdateMutation = useBulkUpdateAvailability();
  
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const availableCount = availability.filter(a => a.status === 'available').length;
  const unavailableCount = availability.filter(a => a.status === 'unavailable').length;
  const tentativeCount = availability.filter(a => a.status === 'tentative').length;
  const bookedCount = availability.filter(a => a.status === 'booked').length;

  const handleCreate = async (data: Record<string, unknown>) => {
    if (!user?.id) return;
    
    await createMutation.mutateAsync({
      crew_member_id: user.id,
      availability_type: String(data.status || 'available'),
      start_date: String(data.date || new Date().toISOString().split('T')[0]),
      start_time: data.start_time ? String(data.start_time) : undefined,
      end_time: data.end_time ? String(data.end_time) : undefined,
      notes: data.notes ? String(data.notes) : undefined,
    });
    refetch();
    setCreateModalOpen(false);
  };

  const rowActions: ListPageAction<AvailabilitySlot>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedSlot(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => { setSelectedSlot(r); setCreateModalOpen(true); } },
  ];

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'availability',
    requiredFields: ['crew_member_id', 'date', 'status'],
    onImport: async (records) => {
      for (const record of records) {
        await createMutation.mutateAsync({
          crew_member_id: String(record.crew_member_id || record.user_id || ''),
          availability_type: String(record.status || 'available'),
          start_date: String(record.date || ''),
          start_time: record.start_time ? String(record.start_time) : undefined,
          end_time: record.end_time ? String(record.end_time) : undefined,
          notes: record.notes ? String(record.notes) : undefined,
        });
      }
      refetch();
    },
  });

  const importTemplates = getImportTemplates('availability').length > 0 
    ? getImportTemplates('availability') 
    : [{ id: 'default', name: 'Availability Import', mapping: { user_name: 'user_name', date: 'date', status: 'status', start_time: 'start_time', end_time: 'end_time' } }];

  const stats = [
    { label: 'Available', value: availableCount },
    { label: 'Unavailable', value: unavailableCount },
    { label: 'Tentative', value: tentativeCount },
    { label: 'Booked', value: bookedCount },
  ];

  const detailSections: DetailSection[] = selectedSlot ? [
    { id: 'details', title: 'Availability Details', content: (
      <Grid cols={2} gap={4}>
        <Stack gap={1}><Body className="font-display">Crew Member</Body><Body>{selectedSlot.user_name}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Role</Body><Body>{selectedSlot.role}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Department</Body><Body>{selectedSlot.department}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Date</Body><Body>{new Date(selectedSlot.date).toLocaleDateString()}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Status</Body><Body>{selectedSlot.status}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Start Time</Body><Body>{selectedSlot.start_time || '-'}</Body></Stack>
        <Stack gap={1}><Body className="font-display">End Time</Body><Body>{selectedSlot.end_time || '-'}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Source</Body><Body className="flex items-center gap-2">{selectedSlot.calendar_source === 'google' ? <><Calendar className="size-4" /> Google</> : <><Pencil className="size-4" /> Manual</>}</Body></Stack>
        {selectedSlot.notes && <Stack gap={1} className="col-span-2"><Body className="font-display">Notes</Body><Body>{selectedSlot.notes}</Body></Stack>}
      </Grid>
    )},
  ] : [];

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Availability"
        subtitle="Crew availability and calendar integration"
primaryAction={{ label: 'Set Availability', onClick: () => setCreateModalOpen(true) }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <ListPage<AvailabilitySlot>
          title="Availability"
          subtitle="Crew availability and calendar integration"
          data={availability}
          columns={columns}
          rowKey="id"
          loading={isLoading}
          searchPlaceholder="Search availability..."
          filters={filters}
          rowActions={rowActions}
          onRowClick={(r) => { setSelectedSlot(r); setDrawerOpen(true); }}
          createLabel="Set Availability"
          onCreate={() => setCreateModalOpen(true)}
          entityType="availability"
          onImport={handleImport}
          importTemplates={importTemplates}
          importSampleFields={['user_name', 'date', 'status', 'start_time', 'end_time']}
          onExport={createExportHandler({
            filename: "availability",
            getData: () => availability.map(s => ({
              id: s.id,
              user_name: s.user_name,
              role: s.role,
              department: s.department,
              date: s.date,
              status: s.status,
              start_time: s.start_time || '',
              end_time: s.end_time || '',
              notes: s.notes || '',
              calendar_source: s.calendar_source || '',
            })),
          })}
          stats={stats}
          emptyMessage="No availability records"
          onBulkAction={async (action, ids) => {
            if (action === 'delete') {
              for (const id of ids) {
                await deleteMutation.mutateAsync(id);
              }
              refetch();
            } else if (action === 'book') {
              await bulkUpdateMutation.mutateAsync({ ids, status: 'booked' });
              refetch();
            }
          }}
          bulkActions={[
            { id: 'book', label: 'Book Selected', variant: 'default' },
            { id: 'delete', label: 'Delete Selected', variant: 'danger' },
          ]}
        />
      </MainContent>

      <RecordFormModal
        open={createModalOpen}
        onClose={() => { setCreateModalOpen(false); setSelectedSlot(null); }}
        title={selectedSlot ? 'Edit Availability' : 'Set Availability'}
        mode={selectedSlot ? 'edit' : 'create'}
        fields={formFields}
        onSubmit={handleCreate}
      />

      {selectedSlot && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedSlot}
          title={(s) => s.user_name}
          subtitle={(s) => `${s.role} • ${s.department}`}
          sections={detailSections}
          actions={[
            { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" /> },
          ]}
          onAction={(id, s) => {
            if (id === 'edit') { setSelectedSlot(s); setCreateModalOpen(true); }
            setDrawerOpen(false);
          }}
        />
      )}
    </CompvssAppLayout>
  );
}
