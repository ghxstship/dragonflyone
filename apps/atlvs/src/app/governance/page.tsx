"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, FileText, Pencil } from "lucide-react";
import { AtlvsAppLayout } from "../../components/app-layout";
import {
  ListPage,
  Badge,
  DetailDrawer,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from "@ghxstship/ui";
import { getBadgeVariant, createExportHandler, createImportHandler, getImportTemplates } from "@ghxstship/config";
import { useGovernanceData, type BoardMeeting } from "@/hooks/useGovernance";

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
  const {
    meetings,
    scheduledCount,
    completedCount,
    isLoading: loading,
    error,
  } = useGovernanceData();

  const [selectedMeeting, setSelectedMeeting] = useState<BoardMeeting | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const rowActions: ListPageAction<BoardMeeting>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedMeeting(r); setDrawerOpen(true); } },
    { id: 'minutes', label: 'View Minutes', icon: <FileText className="size-4" />, onClick: (r) => r.minutes_url && window.open(r.minutes_url, '_blank') },
  ];

  const stats = [
    { label: 'Total Meetings', value: meetings.length },
    { label: 'Scheduled', value: scheduledCount },
    { label: 'Completed', value: completedCount },
    { label: 'Board Members', value: 4 },
  ];

  const detailSections: DetailSection[] = selectedMeeting ? [
    { id: 'overview', title: 'Meeting Details', content: (
      <Grid cols={2} gap={4}>
        <Body size="sm"><strong>Title:</strong> {selectedMeeting.title}</Body>
        <Body size="sm"><strong>Type:</strong> {selectedMeeting.meeting_type}</Body>
        <Body size="sm"><strong>Date:</strong> {new Date(selectedMeeting.scheduled_date).toLocaleDateString()}</Body>
        <Body size="sm"><strong>Location:</strong> {selectedMeeting.location}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedMeeting.status}</Body>
        <Body size="sm"><strong>Attendees:</strong> {selectedMeeting.attendees?.length || 0}</Body>
        {selectedMeeting.agenda_items?.length > 0 && (
          <Body size="sm" className="col-span-2"><strong>Agenda:</strong> {selectedMeeting.agenda_items.join(', ')}</Body>
        )}
        {(selectedMeeting.resolutions?.length ?? 0) > 0 && (
          <Body size="sm" className="col-span-2"><strong>Resolutions:</strong> {selectedMeeting.resolutions?.join(', ')}</Body>
        )}
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<BoardMeeting, 'id'>>({

    entityType: 'governance',

    requiredFields: ['title', 'meeting_type', 'scheduled_date'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/governance', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      refetch();

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('governance');


  return (
    <AtlvsAppLayout>
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
        entityType="governance"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['title', 'meeting_type', 'scheduled_date', 'location', 'attendees', 'status']}
        onExport={createExportHandler({
          filename: "board-meetings",
          getData: () => meetings.map(m => ({
            id: m.id,
            title: m.title,
            date: m.scheduled_date,
            type: m.meeting_type,
            status: m.status,
            attendees: m.attendees,
            location: m.location || '',
          })),
        })}
        stats={stats}
        emptyMessage="No meetings scheduled"
        emptyAction={{ label: 'Schedule Meeting', onClick: () => router.push('/governance/meetings/new') }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/governance/meetings/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            fetchGovernanceData();
          }
        }}
        bulkActions={[
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
        showFavorite
        showSettings
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
            { id: 'edit', label: 'Edit Meeting', icon: <Pencil className="size-4" /> },
            ...(selectedMeeting.minutes_url ? [{ id: 'minutes', label: 'View Minutes', icon: <FileText className="size-4" /> }] : []),
          ]}
          onAction={(id, m) => {
            if (id === 'edit') router.push(`/governance/meetings/${m.id}/edit`);
            if (id === 'minutes' && m.minutes_url) window.open(m.minutes_url, '_blank');
            setDrawerOpen(false);
          }}
        />
      )}
    </AtlvsAppLayout>
  );
}
