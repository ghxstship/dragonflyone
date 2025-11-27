'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../../components/navigation';
import {
  ListPage, Badge, DetailDrawer, RecordFormModal,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection, type FormFieldConfig,
} from '@ghxstship/ui';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'Meeting' | 'Call' | 'Task' | 'Reminder';
  date: string;
  time: string;
  duration: string;
  attendees: string[];
  linkedContact?: string;
  linkedDeal?: string;
  location?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  [key: string]: unknown;
}

const mockData: CalendarEvent[] = [
  { id: 'EVT-001', title: 'Client Discovery Call', type: 'Call', date: '2024-11-25', time: '10:00 AM', duration: '30 min', attendees: ['John Smith', 'Client Rep'], linkedContact: 'Festival Productions', linkedDeal: 'Summer Fest 2025', status: 'Scheduled' },
  { id: 'EVT-002', title: 'Site Visit - Grand Arena', type: 'Meeting', date: '2024-11-25', time: '2:00 PM', duration: '2 hrs', attendees: ['John Smith', 'Sarah Johnson', 'Venue Manager'], linkedContact: 'Grand Arena', location: '123 Arena Blvd', status: 'Scheduled' },
  { id: 'EVT-003', title: 'Proposal Review', type: 'Meeting', date: '2024-11-26', time: '11:00 AM', duration: '1 hr', attendees: ['Sales Team'], linkedDeal: 'Corporate Gala 2024', status: 'Scheduled' },
  { id: 'EVT-004', title: 'Follow-up: Tech Corp', type: 'Task', date: '2024-11-26', time: '3:00 PM', duration: '15 min', attendees: ['John Smith'], linkedContact: 'Tech Corp', status: 'Scheduled' },
];

const getTypeVariant = (type: string): 'solid' | 'outline' | 'ghost' => {
  switch (type) { case 'Meeting': return 'solid'; case 'Call': return 'outline'; case 'Task': return 'outline'; case 'Reminder': return 'ghost'; default: return 'ghost'; }
};

const columns: ListPageColumn<CalendarEvent>[] = [
  { key: 'title', label: 'Event', accessor: 'title', sortable: true },
  { key: 'type', label: 'Type', accessor: 'type', render: (v) => <Badge variant={getTypeVariant(String(v))}>{String(v)}</Badge> },
  { key: 'date', label: 'Date', accessor: 'date', sortable: true },
  { key: 'time', label: 'Time', accessor: 'time' },
  { key: 'duration', label: 'Duration', accessor: 'duration' },
  { key: 'attendees', label: 'Attendees', accessor: (r) => r.attendees.length.toString() },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={v === 'Scheduled' ? 'solid' : v === 'Completed' ? 'outline' : 'ghost'}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'type', label: 'Type', options: [{ value: 'Meeting', label: 'Meeting' }, { value: 'Call', label: 'Call' }, { value: 'Task', label: 'Task' }, { value: 'Reminder', label: 'Reminder' }] },
  { key: 'status', label: 'Status', options: [{ value: 'Scheduled', label: 'Scheduled' }, { value: 'Completed', label: 'Completed' }, { value: 'Cancelled', label: 'Cancelled' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'title', label: 'Event Title', type: 'text', required: true },
  { name: 'type', label: 'Type', type: 'select', required: true, options: [{ value: 'Meeting', label: 'Meeting' }, { value: 'Call', label: 'Call' }, { value: 'Task', label: 'Task' }, { value: 'Reminder', label: 'Reminder' }] },
  { name: 'date', label: 'Date', type: 'date', required: true },
  { name: 'time', label: 'Time', type: 'text', required: true },
  { name: 'duration', label: 'Duration', type: 'select', options: [{ value: '15 min', label: '15 minutes' }, { value: '30 min', label: '30 minutes' }, { value: '1 hr', label: '1 hour' }, { value: '2 hrs', label: '2 hours' }] },
  { name: 'location', label: 'Location', type: 'text' },
];

export default function CalendarIntegrationPage() {
  const router = useRouter();
  const [data] = useState<CalendarEvent[]>(mockData);
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const todayEvents = data.filter(e => e.date === '2024-11-25').length;
  const meetings = data.filter(e => e.type === 'Meeting').length;

  const rowActions: ListPageAction<CalendarEvent>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit Event', icon: '✏️', onClick: (r) => console.log('Edit', r.id) },
    { id: 'cancel', label: 'Cancel Event', icon: '❌', onClick: (r) => console.log('Cancel', r.id) },
  ];

  const stats = [
    { label: "Today's Events", value: todayEvents },
    { label: 'This Week', value: data.length },
    { label: 'Meetings', value: meetings },
    { label: 'Synced Calendars', value: 2 },
  ];

  const handleCreate = async (formData: Record<string, unknown>) => {
    console.log('Create event:', formData);
    setCreateModalOpen(false);
  };

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Event Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Title:</strong> {selected.title}</div>
        <div><strong>Type:</strong> {selected.type}</div>
        <div><strong>Date:</strong> {selected.date}</div>
        <div><strong>Time:</strong> {selected.time}</div>
        <div><strong>Duration:</strong> {selected.duration}</div>
        <div><strong>Status:</strong> {selected.status}</div>
        {selected.location && <div><strong>Location:</strong> {selected.location}</div>}
        <div className="col-span-2"><strong>Attendees:</strong> {selected.attendees.join(', ')}</div>
        {selected.linkedContact && <div><strong>Contact:</strong> {selected.linkedContact}</div>}
        {selected.linkedDeal && <div><strong>Deal:</strong> {selected.linkedDeal}</div>}
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<CalendarEvent>
        title="Calendar Integration"
        subtitle="Sync calendars and schedule meetings with contacts"
        data={data}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search events..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelected(r); setDrawerOpen(true); }}
        createLabel="Schedule Meeting"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No events scheduled"
        emptyAction={{ label: 'Schedule Meeting', onClick: () => setCreateModalOpen(true) }}
        header={<CreatorNavigationAuthenticated />}
      />
      <RecordFormModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} mode="create" title="Schedule Meeting" fields={formFields} onSubmit={handleCreate} />
      {selected && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selected}
          title={(r) => r.title}
          subtitle={(r) => `${r.type} • ${r.date} ${r.time}`}
          sections={detailSections}
          actions={[{ id: 'edit', label: 'Edit Event', icon: '✏️' }, { id: 'join', label: 'Join Meeting', icon: '🔗' }]}
          onAction={(id, r) => { console.log(id, r.id); setDrawerOpen(false); }}
        />
      )}
    </>
  );
}
