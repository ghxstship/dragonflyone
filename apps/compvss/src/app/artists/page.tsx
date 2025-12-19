"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Pencil, Trash2, Check, Circle } from "lucide-react";
import { CompvssAppLayout } from "../../components/app-layout";
import { useArtists, useArtistStats, useCreateArtist, useDeleteArtist } from "../../hooks/useArtists";
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
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
} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates } from "@ghxstship/config";

interface Artist {
  id: string;
  name: string;
  genre: string;
  type: 'Solo' | 'Band' | 'DJ' | 'Orchestra' | 'Speaker';
  manager?: string;
  managerEmail?: string;
  managerPhone?: string;
  agent?: string;
  technicalRider: boolean;
  hospitalityRider: boolean;
  inputList: boolean;
  stageplot: boolean;
  upcomingShows: number;
  notes?: string;
  lastPerformance?: string;
}

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
  const { data: apiArtists, isLoading: loading, refetch } = useArtists();
  const { data: apiStats } = useArtistStats();
  const createArtistMutation = useCreateArtist();
  const deleteArtistMutation = useDeleteArtist();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [artistToDelete, setArtistToDelete] = useState<Artist | null>(null);

  // Map API data to local interface
  const artists: Artist[] = (apiArtists || []).map(a => ({
    id: a.id,
    name: a.name,
    genre: a.genre,
    type: a.type as Artist['type'],
    manager: a.manager,
    managerEmail: a.manager_email,
    managerPhone: a.manager_phone,
    agent: a.agent,
    technicalRider: a.technical_rider,
    hospitalityRider: a.hospitality_rider,
    inputList: a.input_list,
    stageplot: a.stageplot,
    upcomingShows: a.upcoming_shows,
    notes: a.notes,
  }));

  const withRiders = apiStats?.withRiders ?? artists.filter(a => a.technicalRider).length;
  const upcomingTotal = apiStats?.upcomingTotal ?? artists.reduce((sum, a) => sum + a.upcomingShows, 0);

  const rowActions: ListPageAction<Artist>[] = [
    { id: 'view', label: 'View Profile', icon: <Eye className="size-4" />, onClick: (r) => { setSelectedArtist(r); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (r) => router.push(`/artists/${r.id}/edit`) },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (r) => { setArtistToDelete(r); setDeleteConfirmOpen(true); } },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await createArtistMutation.mutateAsync({
      name: String(data.name || ''),
      genre: String(data.genre || ''),
      type: String(data.type || 'Solo') as Artist['type'],
      manager: data.manager ? String(data.manager) : undefined,
      manager_email: data.managerEmail ? String(data.managerEmail) : undefined,
      manager_phone: data.managerPhone ? String(data.managerPhone) : undefined,
      agent: data.agent ? String(data.agent) : undefined,
      notes: data.notes ? String(data.notes) : undefined,
    });
    refetch();
    setCreateModalOpen(false);
  };

  const handleDelete = async () => {
    if (artistToDelete) {
      await deleteArtistMutation.mutateAsync(artistToDelete.id);
      refetch();
      setDeleteConfirmOpen(false);
      setArtistToDelete(null);
    }
  };

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'artists',
    requiredFields: ['name', 'genre', 'type'],
    onImport: async (records) => {
      for (const record of records) {
        await createArtistMutation.mutateAsync({
          name: String(record.name || ''),
          genre: String(record.genre || ''),
          type: String(record.type || 'Solo') as Artist['type'],
          manager: record.manager ? String(record.manager) : undefined,
          manager_email: record.managerEmail ? String(record.managerEmail) : undefined,
          technical_rider: Boolean(record.technicalRider),
          hospitality_rider: Boolean(record.hospitalityRider),
          input_list: Boolean(record.inputList),
          stageplot: Boolean(record.stageplot),
          upcoming_shows: Number(record.upcomingShows) || 0,
        });
      }
      refetch();
    },
  });

  const importTemplates = getImportTemplates('artists').length > 0 
    ? getImportTemplates('artists') 
    : [{ id: 'default', name: 'Artist Import', mapping: { name: 'name', genre: 'genre', type: 'type', manager: 'manager', managerEmail: 'managerEmail' } }];

  const stats = [
    { label: 'Total Artists', value: artists.length },
    { label: 'With Tech Riders', value: withRiders },
    { label: 'Upcoming Shows', value: upcomingTotal },
    { label: 'Active This Month', value: artists.filter(a => a.upcomingShows > 0).length },
  ];

  const detailSections: DetailSection[] = selectedArtist ? [
    { id: 'overview', title: 'Artist Profile', content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Stack gap={1}><Body className="font-display">Name</Body><Body>{selectedArtist.name}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Type</Body><Body>{selectedArtist.type}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Genre</Body><Body>{selectedArtist.genre}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Agent</Body><Body>{selectedArtist.agent || '—'}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Manager</Body><Body>{selectedArtist.manager || '—'}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Email</Body><Body>{selectedArtist.managerEmail || '—'}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Phone</Body><Body>{selectedArtist.managerPhone || '—'}</Body></Stack>
        <Stack gap={1}><Body className="font-display">Upcoming</Body><Body>{selectedArtist.upcomingShows} shows</Body></Stack>
      </Grid>
    )},
    { id: 'documents', title: 'Documents on File', content: (
      <Grid cols={2} gap={2} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body className="flex items-center gap-2">{selectedArtist.technicalRider ? <Check className="size-4" /> : <Circle className="size-4" />} Technical Rider</Body>
        <Body className="flex items-center gap-2">{selectedArtist.hospitalityRider ? <Check className="size-4" /> : <Circle className="size-4" />} Hospitality Rider</Body>
        <Body className="flex items-center gap-2">{selectedArtist.inputList ? <Check className="size-4" /> : <Circle className="size-4" />} Input List</Body>
        <Body className="flex items-center gap-2">{selectedArtist.stageplot ? <Check className="size-4" /> : <Circle className="size-4" />} Stage Plot</Body>
      </Grid>
    )},
  ] : [];

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Artist Management"
        subtitle="Manage artists, riders, and performance requirements"
primaryAction={{ label: 'Add Artist', onClick: () => setCreateModalOpen(true) }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <ListPage<Artist>
          title="Artist Management"
          subtitle="Manage artists, riders, and performance requirements"
          data={artists}
          columns={columns}
          rowKey="id"
          loading={loading}
          searchPlaceholder="Search artists..."
          filters={filters}
          rowActions={rowActions}
          onRowClick={(r) => { setSelectedArtist(r); setDrawerOpen(true); }}
          createLabel="Add Artist"
          onCreate={() => setCreateModalOpen(true)}
          entityType="artists"
          onImport={handleImport}
          importTemplates={importTemplates}
          importSampleFields={['name', 'genre', 'type', 'manager', 'managerEmail']}
          onExport={createExportHandler({
            filename: "artists",
            getData: () => artists.map(a => ({
              id: a.id,
              name: a.name,
              genre: a.genre,
              type: a.type,
              manager: a.manager || '',
              managerEmail: a.managerEmail || '',
              managerPhone: a.managerPhone || '',
              agent: a.agent || '',
              documents: [a.technicalRider && 'Tech', a.inputList && 'Input', a.stageplot && 'Plot'].filter(Boolean).join(', '),
              upcomingShows: a.upcomingShows,
            })),
          })}
          stats={stats}
          emptyMessage="No artists found"
          emptyAction={{ label: 'Add Artist', onClick: () => setCreateModalOpen(true) }}
          onBulkAction={async (action, ids) => {
            if (action === 'delete') {
              await fetch('/api/artists/bulk', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
              });
            } else if (action === 'archive') {
              await fetch('/api/artists/bulk-archive', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
              });
            }
          }}
          bulkActions={[
            { id: 'archive', label: 'Archive Selected', variant: 'default' },
            { id: 'delete', label: 'Delete Selected', variant: 'danger' },
          ]}
        />
      </MainContent>

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
    </CompvssAppLayout>
  );
}
