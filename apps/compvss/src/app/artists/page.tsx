"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";

interface Artist {
  id: string;
  name: string;
  genre: string;
  type: "Solo" | "Band" | "DJ" | "Orchestra" | "Speaker";
  manager?: string;
  managerEmail?: string;
  managerPhone?: string;
  agent?: string;
  technicalRider: boolean;
  hospitalityRider: boolean;
  inputList: boolean;
  stageplot: boolean;
  lastPerformance?: string;
  upcomingShows: number;
  notes?: string;
  [key: string]: unknown;
}

const mockArtists: Artist[] = [
  { id: "ART-001", name: "The Midnight Collective", genre: "Indie Rock", type: "Band", manager: "Sarah Mitchell", managerEmail: "sarah@mgmt.com", managerPhone: "+1 555-0201", agent: "CAA", technicalRider: true, hospitalityRider: true, inputList: true, stageplot: true, lastPerformance: "2024-10-15", upcomingShows: 3 },
  { id: "ART-002", name: "DJ Phantom", genre: "Electronic", type: "DJ", manager: "Mike Torres", managerEmail: "mike@djmgmt.com", managerPhone: "+1 555-0202", technicalRider: true, hospitalityRider: false, inputList: true, stageplot: false, lastPerformance: "2024-11-10", upcomingShows: 5 },
  { id: "ART-003", name: "Aurora Keys", genre: "Pop", type: "Solo", manager: "Jennifer Lee", managerEmail: "jen@starpower.com", managerPhone: "+1 555-0203", agent: "WME", technicalRider: true, hospitalityRider: true, inputList: true, stageplot: true, upcomingShows: 2 },
  { id: "ART-004", name: "Tampa Symphony", genre: "Classical", type: "Orchestra", manager: "Robert Chen", managerEmail: "rchen@symphony.org", managerPhone: "+1 555-0204", technicalRider: true, hospitalityRider: true, inputList: true, stageplot: true, lastPerformance: "2024-09-20", upcomingShows: 1 },
  { id: "ART-005", name: "Dr. James Wilson", genre: "Keynote", type: "Speaker", manager: "Lisa Park", managerEmail: "lisa@speakers.com", managerPhone: "+1 555-0205", technicalRider: true, hospitalityRider: false, inputList: false, stageplot: false, upcomingShows: 0 },
];

const columns: ListPageColumn<Artist>[] = [
  { key: 'name', label: 'Artist', accessor: 'name', sortable: true },
  { key: 'genre', label: 'Genre', accessor: 'genre' },
  { key: 'type', label: 'Type', accessor: 'type', render: (v) => <Badge variant="outline">{String(v)}</Badge> },
  { key: 'manager', label: 'Manager', accessor: (r) => r.manager || '—' },
  { key: 'documents', label: 'Documents', accessor: (r) => [r.technicalRider && 'Tech', r.inputList && 'Input', r.stageplot && 'Plot'].filter(Boolean).join(', ') || '—' },
  { key: 'upcomingShows', label: 'Upcoming', accessor: 'upcomingShows', sortable: true, render: (v) => <Badge variant={Number(v) > 0 ? 'solid' : 'ghost'}>{String(v)} shows</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'type', label: 'Type', options: [{ value: 'Solo', label: 'Solo Artist' }, { value: 'Band', label: 'Band' }, { value: 'DJ', label: 'DJ' }, { value: 'Orchestra', label: 'Orchestra' }, { value: 'Speaker', label: 'Speaker' }] },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Artist/Performer Name', type: 'text', required: true, colSpan: 2 },
  { name: 'type', label: 'Type', type: 'select', required: true, options: [{ value: 'Solo', label: 'Solo Artist' }, { value: 'Band', label: 'Band' }, { value: 'DJ', label: 'DJ' }, { value: 'Orchestra', label: 'Orchestra' }, { value: 'Speaker', label: 'Speaker' }] },
  { name: 'genre', label: 'Genre', type: 'text', required: true },
  { name: 'manager', label: 'Manager Name', type: 'text' },
  { name: 'agent', label: 'Booking Agent', type: 'text' },
  { name: 'managerEmail', label: 'Manager Email', type: 'email' },
  { name: 'managerPhone', label: 'Manager Phone', type: 'text' },
  { name: 'notes', label: 'Notes', type: 'textarea', colSpan: 2 },
];

export default function ArtistsPage() {
  const router = useRouter();
  const [artists, setArtists] = useState<Artist[]>(mockArtists);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [artistToDelete, setArtistToDelete] = useState<Artist | null>(null);

  const withRiders = artists.filter(a => a.technicalRider).length;
  const upcomingTotal = artists.reduce((sum, a) => sum + a.upcomingShows, 0);

  const rowActions: ListPageAction<Artist>[] = [
    { id: 'view', label: 'View Profile', icon: '👁️', onClick: (r) => { setSelectedArtist(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (r) => router.push(`/artists/${r.id}/edit`) },
    { id: 'delete', label: 'Delete', icon: '🗑️', variant: 'danger', onClick: (r) => { setArtistToDelete(r); setDeleteConfirmOpen(true); } },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    const newArtist: Artist = {
      id: `ART-${String(artists.length + 1).padStart(3, '0')}`,
      name: String(data.name || ''),
      genre: String(data.genre || ''),
      type: data.type as Artist['type'],
      manager: data.manager ? String(data.manager) : undefined,
      managerEmail: data.managerEmail ? String(data.managerEmail) : undefined,
      managerPhone: data.managerPhone ? String(data.managerPhone) : undefined,
      agent: data.agent ? String(data.agent) : undefined,
      technicalRider: false,
      hospitalityRider: false,
      inputList: false,
      stageplot: false,
      upcomingShows: 0,
      notes: data.notes ? String(data.notes) : undefined,
    };
    setArtists([...artists, newArtist]);
    setCreateModalOpen(false);
  };

  const handleDelete = () => {
    if (artistToDelete) {
      setArtists(artists.filter(a => a.id !== artistToDelete.id));
      setDeleteConfirmOpen(false);
      setArtistToDelete(null);
    }
  };

  const stats = [
    { label: 'Total Artists', value: artists.length },
    { label: 'With Tech Riders', value: withRiders },
    { label: 'Upcoming Shows', value: upcomingTotal },
    { label: 'Active This Month', value: artists.filter(a => a.upcomingShows > 0).length },
  ];

  const detailSections: DetailSection[] = selectedArtist ? [
    { id: 'overview', title: 'Artist Profile', content: (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        <div><strong>Name:</strong> {selectedArtist.name}</div>
        <div><strong>Type:</strong> {selectedArtist.type}</div>
        <div><strong>Genre:</strong> {selectedArtist.genre}</div>
        <div><strong>Agent:</strong> {selectedArtist.agent || '—'}</div>
        <div><strong>Manager:</strong> {selectedArtist.manager || '—'}</div>
        <div><strong>Email:</strong> {selectedArtist.managerEmail || '—'}</div>
        <div><strong>Phone:</strong> {selectedArtist.managerPhone || '—'}</div>
        <div><strong>Upcoming:</strong> {selectedArtist.upcomingShows} shows</div>
      </div>
    )},
    { id: 'documents', title: 'Documents on File', content: (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
        <div>{selectedArtist.technicalRider ? '✓' : '○'} Technical Rider</div>
        <div>{selectedArtist.hospitalityRider ? '✓' : '○'} Hospitality Rider</div>
        <div>{selectedArtist.inputList ? '✓' : '○'} Input List</div>
        <div>{selectedArtist.stageplot ? '✓' : '○'} Stage Plot</div>
      </div>
    )},
  ] : [];

  return (
    <>
      <ListPage<Artist>
        title="Artist Database"
        subtitle="Performer profiles, technical requirements, and contact information"
        data={artists}
        columns={columns}
        rowKey="id"
        loading={false}
        searchPlaceholder="Search artists..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedArtist(r); setDrawerOpen(true); }}
        createLabel="Add Artist"
        onCreate={() => setCreateModalOpen(true)}
        onExport={() => console.log('Export artists')}
        stats={stats}
        emptyMessage="No artists found"
        emptyAction={{ label: 'Add Artist', onClick: () => setCreateModalOpen(true) }}
        header={<Navigation />}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Add Artist"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />

      {selectedArtist && (
        <DetailDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          record={selectedArtist}
          title={(a) => a.name}
          subtitle={(a) => `${a.type} • ${a.genre}`}
          sections={detailSections}
          onEdit={(a) => router.push(`/artists/${a.id}/edit`)}
          onDelete={(a) => { setArtistToDelete(a); setDeleteConfirmOpen(true); setDrawerOpen(false); }}
        />
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Artist"
        message={`Are you sure you want to delete "${artistToDelete?.name}"?`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setArtistToDelete(null); }}
      />
    </>
  );
}
