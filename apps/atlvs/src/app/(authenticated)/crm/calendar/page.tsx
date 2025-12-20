'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, X, Link } from 'lucide-react';
import { AtlvsAppLayout } from '../../../../components/app-layout';
import {
  ListPage, Badge, DetailDrawer, RecordFormModal, Grid, Body,
  type ListPageColumn, type ListPageFilter, type ListPageAction, type DetailSection, type FormFieldConfig, } from '@ghxstship/ui';
import { createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';

import {
  DEMO_CRM_CALENDAR_EVENTS,
  type DemoCrmCalendarEvent as CalendarEvent,
} from '../../../../lib/demo-data';

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
  const [data, setData] = useState<CalendarEvent[]>(DEMO_CRM_CALENDAR_EVENTS);
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const todayEvents = data.filter(e => e.date === '2024-11-25').length;
  const meetings = data.filter(e => e.type === 'Meeting').length;

  const rowActions: ListPageAction<CalendarEvent>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelected(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit Event', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/crm/calendar/${r.id}/edit`) },
    { id: 'cancel', label: 'Cancel Event', icon: <X className="size-4" />, onClick: (r) => setData(prev => prev.map(e => e.id === r.id ? { ...e, status: 'Cancelled' as const } : e)) },
  ];

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'calendar',
    requiredFields: ['title', 'type', 'date'],
    onImport: async (records) => {
      for (const record of records) {
        const newEvent: CalendarEvent = {
          id: `EVT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: String(record.title || ''),
          type: (record.type as CalendarEvent['type']) || 'Meeting',
          date: String(record.date || ''),
          time: String(record.time || '9:00 AM'),
          duration: String(record.duration || '30 min'),
          attendees: [],
          status: 'Scheduled',
        };
        setData(prev => [...prev, newEvent]);
      }
    },
  });

  const importTemplates = getImportTemplates('calendar').length > 0 
    ? getImportTemplates('calendar') 
    : [{ id: 'default', name: 'Calendar Import', mapping: { title: 'title', type: 'type', date: 'date', time: 'time', duration: 'duration' } }];

  const stats = [
    { label: "Today's Events", value: todayEvents },
    { label: 'This Week', value: data.length },
    { label: 'Meetings', value: meetings },
    { label: 'Synced Calendars', value: 2 },
  ];

  const handleCreate = async (formData: Record<string, unknown>) => {
    const newEvent: CalendarEvent = {
      id: `EVT-${String(data.length + 1).padStart(3, '0')}`,
      title: String(formData.title || ''),
      type: (formData.type as CalendarEvent['type']) || 'Meeting',
      date: String(formData.date || new Date().toISOString().split('T')[0]),
      time: String(formData.time || '9:00 AM'),
      duration: String(formData.duration || '30 min'),
      attendees: [],
      location: formData.location ? String(formData.location) : undefined,
      status: 'Scheduled',
    };
    setData(prev => [...prev, newEvent]);
    setCreateModalOpen(false);
  };

  const detailSections: DetailSection[] = selected ? [
    { id: 'overview', title: 'Event Details', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Title:</strong> {selected.title}</Body>
        <Body size="sm"><strong>Type:</strong> {selected.type}</Body>
        <Body size="sm"><strong>Date:</strong> {selected.date}</Body>
        <Body size="sm"><strong>Time:</strong> {selected.time}</Body>
        <Body size="sm"><strong>Duration:</strong> {selected.duration}</Body>
        <Body size="sm"><strong>Status:</strong> {selected.status}</Body>
        {selected.location && <Body size="sm"><strong>Location:</strong> {selected.location}</Body>}
        <Body size="sm" className="col-span-2"><strong>Attendees:</strong> {selected.attendees.join(', ')}</Body>
        {selected.linkedContact && <Body size="sm"><strong>Contact:</strong> {selected.linkedContact}</Body>}
        {selected.linkedDeal && <Body size="sm"><strong>Deal:</strong> {selected.linkedDeal}</Body>}
      </Grid>
    )},
  ] : [];

  return (
    <AtlvsAppLayout>
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
        entityType="calendar-events"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['title', 'type', 'date', 'time', 'duration']}
        onExport={createExportHandler({
          filename: "calendar-events",
          getData: () => data.map(e => ({
            id: e.id,
            title: e.title,
            type: e.type,
            date: e.date,
            time: e.time,
            duration: e.duration,
            attendees: e.attendees.join(', '),
            status: e.status,
          })),
        })}
        exportFormats={["csv", "json"]}
        stats={stats}
        emptyMessage="No events scheduled"
        emptyAction={{ label: 'Schedule Meeting', onClick: () => setCreateModalOpen(true) }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            setData(prev => prev.filter(e => !ids.includes(e.id)));
          } else if (action === 'cancel') {
            setData(prev => prev.map(e => ids.includes(e.id) ? { ...e, status: 'Cancelled' as const } : e));
          }
        }}
        bulkActions={[
          { id: 'cancel', label: 'Cancel Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
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
          actions={[{ id: 'edit', label: 'Edit Event', icon: <Pencil className="size-4" /> }, { id: 'join', label: 'Join Meeting', icon: <Link className="size-4" /> }]}
          onAction={(id, r) => {
            if (id === 'edit') router.push(`/crm/calendar/${r.id}/edit`);
            if (id === 'join' && r.location) window.open(r.location, '_blank');
            setDrawerOpen(false);
          }}
        />
      )}
    </AtlvsAppLayout>
  );
}
