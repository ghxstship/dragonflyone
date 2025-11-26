"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  ListPage,
  Badge,
  DetailDrawer,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from "@ghxstship/ui";
import { getBadgeVariant } from "@ghxstship/config";

interface BoardMeeting {
  id: string;
  title: string;
  meeting_type: string;
  scheduled_date: string;
  location: string;
  status: string;
  attendees: string[];
  agenda_items: string[];
  minutes_url?: string;
  resolutions?: string[];
  [key: string]: unknown;
}

const getStatusVariant = getBadgeVariant;

const columns: ListPageColumn<BoardMeeting>[] = [
  { key: 'title', label: 'Meeting', accessor: 'title', sortable: true },
  { key: 'meeting_type', label: 'Type', accessor: 'meeting_type', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'scheduled_date', label: 'Date', accessor: (r) => new Date(r.scheduled_date).toLocaleDateString(), sortable: true },
  { key: 'location', label: 'Location', accessor: 'location' },
  { key: 'attendees', label: 'Attendees', accessor: (r) => `${r.attendees?.length || 0} members` },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'scheduled', label: 'Scheduled' }, { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' }] },
  { key: 'meeting_type', label: 'Type', options: [{ value: 'board', label: 'Board Meeting' }, { value: 'committee', label: 'Committee' }, { value: 'annual', label: 'Annual Meeting' }] },
];

export default function GovernancePage() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<BoardMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<BoardMeeting | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchGovernanceData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/governance");
      if (!response.ok) throw new Error("Failed to fetch governance data");
      const data = await response.json();
      setMeetings(data.meetings || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGovernanceData();
  }, [fetchGovernanceData]);

  const scheduledCount = meetings.filter(m => m.status === 'scheduled').length;
  const completedCount = meetings.filter(m => m.status === 'completed').length;

  const rowActions: ListPageAction<BoardMeeting>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedMeeting(r); setDrawerOpen(true); } },
    { id: 'minutes', label: 'View Minutes', icon: '📄', onClick: (r) => r.minutes_url && window.open(r.minutes_url, '_blank') },
  ];

  const stats = [
    { label: 'Total Meetings', value: meetings.length },
    { label: 'Scheduled', value: scheduledCount },
    { label: 'Completed', value: completedCount },
    { label: 'Board Members', value: 4 },
  ];

  const detailSections: DetailSection[] = selectedMeeting ? [
    { id: 'overview', title: 'Meeting Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Title:</strong> {selectedMeeting.title}</div>
        <div><strong>Type:</strong> {selectedMeeting.meeting_type}</div>
        <div><strong>Date:</strong> {new Date(selectedMeeting.scheduled_date).toLocaleDateString()}</div>
        <div><strong>Location:</strong> {selectedMeeting.location}</div>
        <div><strong>Status:</strong> {selectedMeeting.status}</div>
        <div><strong>Attendees:</strong> {selectedMeeting.attendees?.length || 0}</div>
        {selectedMeeting.agenda_items?.length > 0 && (
          <div className="col-span-2"><strong>Agenda:</strong> {selectedMeeting.agenda_items.join(', ')}</div>
        )}
        {(selectedMeeting.resolutions?.length ?? 0) > 0 && (
          <div className="col-span-2"><strong>Resolutions:</strong> {selectedMeeting.resolutions?.join(', ')}</div>
        )}
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<BoardMeeting>
        title="Corporate Governance"
        subtitle="Board meetings, corporate policies, and governance documentation"
        data={meetings}
        columns={columns}
        rowKey="id"
        loading={loading}
        error={error ? new Error(error) : undefined}
        onRetry={fetchGovernanceData}
        searchPlaceholder="Search meetings..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedMeeting(r); setDrawerOpen(true); }}
        createLabel="Schedule Meeting"
        onCreate={() => router.push('/governance/meetings/new')}
        onExport={() => console.log('Export')}
        stats={stats}
        emptyMessage="No meetings scheduled"
        emptyAction={{ label: 'Schedule Meeting', onClick: () => router.push('/governance/meetings/new') }}
        header={<Navigation />}
      />

      {selectedMeeting && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedMeeting}
          title={(m) => m.title}
          subtitle={(m) => `${m.meeting_type} • ${new Date(m.scheduled_date).toLocaleDateString()}`}
          sections={detailSections}
          actions={[
            { id: 'edit', label: 'Edit Meeting', icon: '✏️' },
            ...(selectedMeeting.minutes_url ? [{ id: 'minutes', label: 'View Minutes', icon: '📄' }] : []),
          ]}
          onAction={(id, m) => {
            if (id === 'edit') router.push(`/governance/meetings/${m.id}/edit`);
            if (id === 'minutes' && m.minutes_url) window.open(m.minutes_url, '_blank');
            setDrawerOpen(false);
          }}
        />
      )}
    </>
  );
}
