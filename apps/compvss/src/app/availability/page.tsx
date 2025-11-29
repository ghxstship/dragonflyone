'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { getBadgeVariant } from '@ghxstship/config';

interface AvailabilitySlot {
  id: string;
  user_id: string;
  user_name: string;
  role: string;
  department: string;
  date: string;
  status: 'available' | 'unavailable' | 'tentative' | 'booked';
  start_time?: string;
  end_time?: string;
  notes?: string;
  calendar_source?: 'manual' | 'google' | 'outlook' | 'ical';
  [key: string]: unknown;
}

const mockCrewMembers = [
  { id: 'CREW-001', name: 'John Martinez', role: 'Audio Engineer', department: 'Audio' },
  { id: 'CREW-002', name: 'Sarah Chen', role: 'Lighting Designer', department: 'Lighting' },
  { id: 'CREW-003', name: 'Mike Thompson', role: 'Stage Manager', department: 'Stage' },
  { id: 'CREW-004', name: 'Lisa Park', role: 'Video Director', department: 'Video' },
  { id: 'CREW-005', name: 'Tom Wilson', role: 'Head Rigger', department: 'Rigging' },
];

const generateMockAvailability = (): AvailabilitySlot[] => {
  const slots: AvailabilitySlot[] = [];
  const statuses: AvailabilitySlot['status'][] = ['available', 'unavailable', 'tentative', 'booked'];
  
  mockCrewMembers.forEach(member => {
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      slots.push({
        id: `SLOT-${member.id}-${dateStr}`,
        user_id: member.id,
        user_name: member.name,
        role: member.role,
        department: member.department,
        date: dateStr,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        calendar_source: Math.random() > 0.5 ? 'google' : 'manual',
      });
    }
  });
  
  return slots;
};

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
  const router = useRouter();
  const [availability, setAvailability] = useState<AvailabilitySlot[]>(generateMockAvailability());
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const availableCount = availability.filter(a => a.status === 'available').length;
  const unavailableCount = availability.filter(a => a.status === 'unavailable').length;
  const tentativeCount = availability.filter(a => a.status === 'tentative').length;
  const bookedCount = availability.filter(a => a.status === 'booked').length;

  const handleCreate = async (data: Record<string, unknown>) => {
    const newSlot: AvailabilitySlot = {
      id: `SLOT-${Date.now()}`,
      user_id: 'CREW-001',
      user_name: 'Current User',
      role: 'Staff',
      department: 'General',
      date: String(data.date || new Date().toISOString().split('T')[0]),
      status: (data.status as AvailabilitySlot['status']) || 'available',
      start_time: String(data.start_time || '09:00'),
      end_time: String(data.end_time || '18:00'),
      notes: String(data.notes || ''),
      calendar_source: 'manual',
    };
    setAvailability([...availability, newSlot]);
    setCreateModalOpen(false);
  };

  const rowActions: ListPageAction<AvailabilitySlot>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedSlot(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => { setSelectedSlot(r); setCreateModalOpen(true); } },
  ];

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
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Availability' }]}
        views={[
          { id: 'list', label: 'List', icon: 'list' },
          { id: 'grid', label: 'Grid', icon: 'grid' },
        ]}
        activeView="list"
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
          loading={false}
          searchPlaceholder="Search availability..."
          filters={filters}
          rowActions={rowActions}
          onRowClick={(r) => { setSelectedSlot(r); setDrawerOpen(true); }}
          createLabel="Set Availability"
          onCreate={() => setCreateModalOpen(true)}
          onExport={() => console.log('Export')}
          stats={stats}
          emptyMessage="No availability records"
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
