"use client";

import { useState } from "react";
import { ConsumerNavigationPublic } from "@/components/navigation";
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";

interface Contest {
  id: string;
  name: string;
  type: "Giveaway" | "Photo Contest" | "Video Contest" | "Hashtag Challenge" | "Sweepstakes";
  eventId?: string;
  eventName?: string;
  prize: string;
  prizeValue: number;
  startDate: string;
  endDate: string;
  status: "Draft" | "Active" | "Ended" | "Selecting Winner";
  entries: number;
  platforms: string[];
  rules?: string;
  winnerId?: string;
  winnerName?: string;
  [key: string]: unknown;
}

const mockContests: Contest[] = [
  { id: "CNT-001", name: "Summer Fest VIP Giveaway", type: "Giveaway", eventId: "EVT-001", eventName: "Summer Fest 2024", prize: "2 VIP Tickets + Meet & Greet", prizeValue: 500, startDate: "2024-11-01", endDate: "2024-11-20", status: "Ended", entries: 2450, platforms: ["Instagram", "Twitter"], winnerId: "USR-123", winnerName: "Sarah M." },
  { id: "CNT-002", name: "Best Concert Photo", type: "Photo Contest", eventId: "EVT-001", eventName: "Summer Fest 2024", prize: "Free tickets to next 3 events", prizeValue: 300, startDate: "2024-11-15", endDate: "2024-12-01", status: "Active", entries: 156, platforms: ["Instagram"] },
  { id: "CNT-003", name: "#SummerFestVibes Challenge", type: "Hashtag Challenge", eventId: "EVT-001", eventName: "Summer Fest 2024", prize: "Exclusive Merch Bundle", prizeValue: 150, startDate: "2024-11-10", endDate: "2024-11-25", status: "Active", entries: 892, platforms: ["TikTok", "Instagram"] },
  { id: "CNT-004", name: "Holiday Sweepstakes", type: "Sweepstakes", prize: "Year of Free Concerts", prizeValue: 2000, startDate: "2024-12-01", endDate: "2024-12-25", status: "Draft", entries: 0, platforms: ["Instagram", "Twitter", "Facebook"] },
];

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
  const [contests, setContests] = useState<Contest[]>(mockContests);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const activeContests = contests.filter(c => c.status === "Active").length;
  const totalEntries = contests.reduce((sum, c) => sum + c.entries, 0);
  const totalPrizeValue = contests.reduce((sum, c) => sum + c.prizeValue, 0);

  const rowActions: ListPageAction<Contest>[] = [
    { id: 'view', label: 'View Details', icon: '👁️', onClick: (r) => { setSelectedContest(r); setDrawerOpen(true); } },
    { id: 'entries', label: 'View Entries', icon: '📋', onClick: (r) => console.log('View entries', r.id) },
    { id: 'end', label: 'End Contest', icon: '🏁', onClick: (r) => handleEndContest(r.id) },
  ];

  const handleEndContest = (contestId: string) => {
    setContests(contests.map(c => c.id === contestId ? { ...c, status: 'Ended' as const } : c));
  };

  const handleCreate = async (data: Record<string, unknown>) => {
    const newContest: Contest = {
      id: `CNT-${String(contests.length + 1).padStart(3, '0')}`,
      name: String(data.name || ''),
      type: data.type as Contest['type'],
      eventId: data.eventId ? String(data.eventId) : undefined,
      prize: String(data.prize || ''),
      prizeValue: Number(data.prizeValue) || 0,
      startDate: String(data.startDate || ''),
      endDate: String(data.endDate || ''),
      status: 'Draft',
      entries: 0,
      platforms: ['Instagram'],
      rules: data.rules ? String(data.rules) : undefined,
    };
    setContests([...contests, newContest]);
    setCreateModalOpen(false);
  };

  const stats = [
    { label: 'Active Contests', value: activeContests },
    { label: 'Total Entries', value: totalEntries.toLocaleString() },
    { label: 'Total Prize Value', value: `$${totalPrizeValue.toLocaleString()}` },
    { label: 'Avg Entries/Contest', value: Math.round(totalEntries / contests.length) },
  ];

  const detailSections: DetailSection[] = selectedContest ? [
    { id: 'overview', title: 'Contest Details', content: (
      <div className="grid grid-cols-2 gap-4">
        <div><strong>Name:</strong> {selectedContest.name}</div>
        <div><strong>Type:</strong> {selectedContest.type}</div>
        <div><strong>Status:</strong> {selectedContest.status}</div>
        <div><strong>Event:</strong> {selectedContest.eventName || '—'}</div>
        <div><strong>Prize:</strong> {selectedContest.prize}</div>
        <div><strong>Value:</strong> ${selectedContest.prizeValue.toLocaleString()}</div>
        <div><strong>Entries:</strong> {selectedContest.entries.toLocaleString()}</div>
        <div><strong>Platforms:</strong> {selectedContest.platforms.join(', ')}</div>
        <div><strong>Start:</strong> {selectedContest.startDate}</div>
        <div><strong>End:</strong> {selectedContest.endDate}</div>
        {selectedContest.winnerName && <div className="col-span-2"><strong>Winner:</strong> {selectedContest.winnerName}</div>}
      </div>
    )},
  ] : [];

  const footerContent = (
    <Footer
      logo={<Display size="md">GVTEWAY</Display>}
      copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
    >
      <FooterColumn title="Admin">
        <FooterLink href="/admin/contests">Contests</FooterLink>
        <FooterLink href="/admin/promo-codes">Promo Codes</FooterLink>
      </FooterColumn>
      <FooterColumn title="Legal">
        <FooterLink href="/legal/privacy">Privacy</FooterLink>
        <FooterLink href="/legal/terms">Terms</FooterLink>
      </FooterColumn>
    </Footer>
  );

  return (
    <PageLayout background="black" header={<ConsumerNavigationPublic />} footer={footerContent}>
      <ListPage<Contest>
        title="Contests & Giveaways"
        subtitle="Create and manage social media contests and promotional giveaways"
        data={contests}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search contests..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedContest(r); setDrawerOpen(true); }}
        createLabel="Create Contest"
        onCreate={() => setCreateModalOpen(true)}
        stats={stats}
        emptyMessage="No contests found"
        emptyAction={{ label: 'Create Contest', onClick: () => setCreateModalOpen(true) }}
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
            { id: 'entries', label: 'View Entries', icon: '📋' },
            ...(selectedContest.status === 'Active' ? [{ id: 'end', label: 'End Contest', icon: '🏁' }] : []),
            ...(selectedContest.status === 'Ended' && !selectedContest.winnerName ? [{ id: 'winner', label: 'Select Winner', icon: '🏆' }] : []),
          ]}
          onAction={(id, c) => {
            if (id === 'end') handleEndContest(c.id);
            setDrawerOpen(false);
          }}
        />
      )}
    </PageLayout>
  );
}
