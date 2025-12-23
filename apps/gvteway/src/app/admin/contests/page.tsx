"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, ClipboardList, Flag, Trophy } from "lucide-react";
// Layout provided by route group
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';

import { useContestsData, type Contest } from '@/hooks/useContests';

const getStatusVariant = (status: string): 'solid' | 'outline' | 'ghost' => {
  switch (status) {
    case "Active": return 'solid';
    case "Ended": return 'ghost';
    case "Draft": return 'outline';
    default: return 'outline';
  }
};

const columns: ListPageColumn<Contest>[] = [
  { key: 'name', label: 'Contest Name', accessor: 'name', sortable: true },
  { key: 'type', label: 'Type', accessor: 'type', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'prize', label: 'Prize', accessor: 'prize' },
  { key: 'prizeValue', label: 'Value', accessor: 'prizeValue', sortable: true, render: (v) => `$${Number(v).toLocaleString()}` },
  { key: 'entries', label: 'Entries', accessor: 'entries', sortable: true, render: (v) => Number(v).toLocaleString() },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={getStatusVariant(String(v))}>{String(v)}</Badge> },
  { key: 'platforms', label: 'Platforms', accessor: (r) => r.platforms.join(', ') },
  { key: 'endDate', label: 'End Date', accessor: 'endDate', sortable: true },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [{ value: 'Active', label: 'Active' }, { value: 'Draft', label: 'Draft' }, { value: 'Ended', label: 'Ended' }] },
  { key: 'type', label: 'Type', options: [{ value: 'Giveaway', label: 'Giveaway' }, { value: 'Photo Contest', label: 'Photo Contest' }, { value: 'Video Contest', label: 'Video Contest' }, { value: 'Hashtag Challenge', label: 'Hashtag Challenge' }, { value: 'Sweepstakes', label: 'Sweepstakes' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Contest Name', type: 'text', required: true, colSpan: 2 },
  { name: 'type', label: 'Contest Type', type: 'select', required: true, options: [{ value: 'Giveaway', label: 'Giveaway' }, { value: 'Photo Contest', label: 'Photo Contest' }, { value: 'Video Contest', label: 'Video Contest' }, { value: 'Hashtag Challenge', label: 'Hashtag Challenge' }, { value: 'Sweepstakes', label: 'Sweepstakes' }] },
  { name: 'eventId', label: 'Link to Event', type: 'select', options: [{ value: 'EVT-001', label: 'Summer Fest 2024' }, { value: 'EVT-002', label: 'Winter Gala' }] },
  { name: 'prize', label: 'Prize Description', type: 'text', required: true, colSpan: 2 },
  { name: 'prizeValue', label: 'Prize Value ($)', type: 'number', required: true },
  { name: 'startDate', label: 'Start Date', type: 'date', required: true },
  { name: 'endDate', label: 'End Date', type: 'date', required: true },
  { name: 'rules', label: 'Contest Rules & Terms', type: 'textarea', colSpan: 2 },
];

export default function ContestsPage() {
  const router = useRouter();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { contests, isLoading, error, refetch } = useContestsData();

  const activeContests = contests.filter(c => c.status === "Active").length;
  const totalEntries = contests.reduce((sum, c) => sum + c.entries, 0);
  const totalPrizeValue = contests.reduce((sum, c) => sum + c.prizeValue, 0);

  const rowActions: ListPageAction<Contest>[] = [
    { id: 'view', label: 'View Details', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedContest(r); setDrawerOpen(true); } },
    { id: 'entries', label: 'View Entries', icon: <ClipboardList className="size-4" />, onClick: (r) => router.push(`/admin/contests/${r.id}/entries`) },
    { id: 'end', label: 'End Contest', icon: <Flag className="size-4" />, onClick: (r) => handleEndContest(r.id) },
  ];

  const handleEndContest = async (contestId: string) => {
    try {
      await fetch(`/api/admin/contests/${contestId}/end`, { method: 'POST' });
      refetch();
    } catch {
      // Error handled silently
    }
  };

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      await fetch('/api/admin/contests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: String(data.name || ''),
          type: data.type,
          eventId: data.eventId ? String(data.eventId) : null,
          prize: String(data.prize || ''),
          prizeValue: Number(data.prizeValue) || 0,
          startDate: String(data.startDate || ''),
          endDate: String(data.endDate || ''),
          rules: data.rules ? String(data.rules) : null,
        }),
      });
      refetch();
      setCreateModalOpen(false);
    } catch {
      // Error handled silently
    }
  };

  const stats = [
    { label: 'Active Contests', value: activeContests },
    { label: 'Total Entries', value: totalEntries.toLocaleString() },
    { label: 'Total Prize Value', value: `$${totalPrizeValue.toLocaleString()}` },
    { label: 'Avg Entries/Contest', value: Math.round(totalEntries / contests.length) },
  ];

  const detailSections: DetailSection[] = selectedContest ? [
    { id: 'overview', title: 'Contest Details', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Name:</strong> {selectedContest.name}</Body>
        <Body size="sm"><strong>Type:</strong> {selectedContest.type}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedContest.status}</Body>
        <Body size="sm"><strong>Event:</strong> {selectedContest.eventName || '—'}</Body>
        <Body size="sm"><strong>Prize:</strong> {selectedContest.prize}</Body>
        <Body size="sm"><strong>Value:</strong> ${selectedContest.prizeValue.toLocaleString()}</Body>
        <Body size="sm"><strong>Entries:</strong> {selectedContest.entries.toLocaleString()}</Body>
        <Body size="sm"><strong>Platforms:</strong> {selectedContest.platforms.join(', ')}</Body>
        <Body size="sm"><strong>Start:</strong> {selectedContest.startDate}</Body>
        <Body size="sm"><strong>End:</strong> {selectedContest.endDate}</Body>
        {selectedContest.winnerName && <Body size="sm" className="col-span-2"><strong>Winner:</strong> {selectedContest.winnerName}</Body>}
      </Grid>
    )},
  ] : [];

  // Import handler for CSV/JSON files

  const handleImport = createImportHandler<Omit<Contest, 'id'>>({

    entityType: 'contests',

    requiredFields: ['name', 'type', 'eventId'],

    onImport: async (records) => {

      for (const record of records) {

        await fetch('/api/contests', {

          method: 'POST',

          headers: { 'Content-Type': 'application/json' },

          body: JSON.stringify({ organization_id: 'default-org', ...record }),

        });

      }

      refetch();

    },

  });


  // Import templates for field mapping

  const importTemplates = getImportTemplates('contests');


  return (
    <>
      <ListPage<Contest>
        title="Contests & Giveaways"
        subtitle="Create and manage social media contests and promotional giveaways"
        data={contests}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={() => refetch()}
        searchPlaceholder="Search contests..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedContest(r); setDrawerOpen(true); }}
        createLabel="Create Contest"
        onCreate={() => setCreateModalOpen(true)}
        entityType="contests"

        onImport={handleImport}

        importTemplates={importTemplates}

        importSampleFields={['name', 'type', 'eventId', 'prize', 'prizeValue', 'startDate', 'endDate']}
        onExport={createExportHandler({
          filename: 'contests',
          getData: () => contests.map(c => ({
            id: c.id,
            name: c.name,
            type: c.type,
            prize: c.prize,
            prize_value: c.prizeValue,
            start_date: c.startDate,
            end_date: c.endDate,
            status: c.status,
            entries: c.entries,
          })),
        })}
        stats={stats}
        emptyMessage="No contests found"
        emptyAction={{ label: 'Create Contest', onClick: () => setCreateModalOpen(true) }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/admin/contests/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          } else if (action === 'end') {
            await fetch('/api/admin/contests/bulk-end', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
          }
        }}
        bulkActions={[
          { id: 'end', label: 'End Selected', variant: 'default' },
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create Contest"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />

      {selectedContest && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedContest}
          title={(c) => c.name}
          subtitle={(c) => `${c.type} • ${c.status}`}
          sections={detailSections}
          actions={[
            { id: 'entries', label: 'View Entries', icon: <ClipboardList className="size-4" /> },
            ...(selectedContest.status === 'Active' ? [{ id: 'end', label: 'End Contest', icon: <Flag className="size-4" /> }] : []),
            ...(selectedContest.status === 'Ended' && !selectedContest.winnerName ? [{ id: 'winner', label: 'Select Winner', icon: <Trophy className="size-4" /> }] : []),
          ]}
          onAction={(id, c) => {
            if (id === 'end') handleEndContest(c.id);
            setDrawerOpen(false);
          }}
        />
      )}
    </>
  );
}
