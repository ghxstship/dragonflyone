'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, Download, Music } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';
import { createExportHandler, createImportHandler, getImportTemplates } from '@ghxstship/config';
import { useArtists, useCreateArtist, useDeleteArtist, type Artist } from '@/hooks/useArtists';

const typeColors: Record<string, 'success' | 'warning' | 'info' | 'solid' | 'outline'> = {
  solo: 'info',
  band: 'success',
  dj: 'warning',
  orchestra: 'solid',
  ensemble: 'outline',
  other: 'outline',
};

const columns: ListPageColumn<Artist>[] = [
  { key: 'name', label: 'Artist Name', accessor: 'name', sortable: true },
  { key: 'artist_type', label: 'Type', accessor: 'artist_type', render: (v) => <Badge variant={typeColors[String(v)] || 'outline'}>{String(v).toUpperCase()}</Badge> },
  { key: 'genres', label: 'Genres', accessor: (r) => r.genres?.join(', ') || '—' },
  { key: 'hometown', label: 'Location', accessor: (r) => r.hometown && r.country ? `${r.hometown}, ${r.country}` : r.hometown || r.country || '—' },
  { key: 'verified', label: 'Verified', accessor: 'verified', render: (v) => v ? <Badge variant="success">Verified</Badge> : <Badge variant="outline">Unverified</Badge> },
  { key: 'status', label: 'Status', accessor: 'status', sortable: true, render: (v) => <Badge variant={v === 'active' ? 'success' : 'outline'}>{String(v).toUpperCase()}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: 'status', label: 'Status', options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
  ]},
  { key: 'artist_type', label: 'Type', options: [
    { value: 'solo', label: 'Solo' },
    { value: 'band', label: 'Band' },
    { value: 'dj', label: 'DJ' },
    { value: 'orchestra', label: 'Orchestra' },
    { value: 'ensemble', label: 'Ensemble' },
  ]},
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Artist Name', type: 'text', required: true, colSpan: 2 },
  { name: 'artist_type', label: 'Type', type: 'select', required: true, options: [
    { value: 'solo', label: 'Solo Artist' },
    { value: 'band', label: 'Band' },
    { value: 'dj', label: 'DJ' },
    { value: 'orchestra', label: 'Orchestra' },
    { value: 'ensemble', label: 'Ensemble' },
    { value: 'other', label: 'Other' },
  ]},
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
  ]},
  { name: 'genres', label: 'Genres (comma-separated)', type: 'text', colSpan: 2 },
  { name: 'hometown', label: 'Hometown', type: 'text' },
  { name: 'country', label: 'Country', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'website', label: 'Website', type: 'text', colSpan: 2 },
  { name: 'bio', label: 'Bio', type: 'textarea', colSpan: 2 },
];

export default function ArtistsPage() {
  const router = useRouter();
  const { data: artists, isLoading, error, refetch } = useArtists();
  const createMutation = useCreateArtist();
  const deleteMutation = useDeleteArtist();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [artistToDelete, setArtistToDelete] = useState<Artist | null>(null);

  const artistList = (artists || []) as Artist[];

  const stats = [
    { label: 'Total Artists', value: artistList.length },
    { label: 'Bands', value: artistList.filter(a => a.artist_type === 'band').length },
    { label: 'Solo', value: artistList.filter(a => a.artist_type === 'solo').length },
    { label: 'Verified', value: artistList.filter(a => a.verified).length },
  ];

  const rowActions: ListPageAction<Artist>[] = [
    { id: 'view', label: 'View', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedArtist(row); setDrawerOpen(true); } },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (row) => router.push(`/artists/${row.id}/edit`) },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (row) => { setArtistToDelete(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    { id: 'delete', label: 'Delete', icon: <Trash2 className="size-4" />, variant: 'danger' },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      const genres = typeof data.genres === 'string' 
        ? data.genres.split(',').map(g => g.trim()).filter(Boolean)
        : [];
      
      await createMutation.mutateAsync({
        organization_id: String(data.organization_id || ''),
        name: String(data.name || ''),
        artist_type: String(data.artist_type || 'band'),
        genres,
        bio: String(data.bio || ''),
        hometown: String(data.hometown || ''),
        country: String(data.country || ''),
        email: String(data.email || ''),
        phone: String(data.phone || ''),
        website: String(data.website || ''),
      });
      setCreateModalOpen(false);
    } catch (err) {
      console.error('Failed to create artist:', err);
    }
  };

  const handleDelete = async () => {
    if (artistToDelete) {
      try {
        await deleteMutation.mutateAsync(artistToDelete.id);
        setDeleteConfirmOpen(false);
        setArtistToDelete(null);
      } catch (err) {
        console.error('Failed to delete artist:', err);
      }
    }
  };

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    if (actionId === 'delete') {
      for (const id of selectedIds) {
        await deleteMutation.mutateAsync(id);
      }
      refetch();
    }
  };

  const detailSections: DetailSection[] = selectedArtist ? [
    {
      id: 'overview',
      title: 'Artist Details',
      content: (
        <Grid cols={2} gap={4}>
          <Body size="sm"><strong>Name:</strong> {selectedArtist.name}</Body>
          <Body size="sm"><strong>Type:</strong> {selectedArtist.artist_type}</Body>
          <Body size="sm"><strong>Genres:</strong> {selectedArtist.genres?.join(', ') || '—'}</Body>
          <Body size="sm"><strong>Location:</strong> {selectedArtist.hometown || '—'}, {selectedArtist.country || '—'}</Body>
          <Body size="sm"><strong>Email:</strong> {selectedArtist.email || '—'}</Body>
          <Body size="sm"><strong>Phone:</strong> {selectedArtist.phone || '—'}</Body>
          <Body size="sm"><strong>Website:</strong> {selectedArtist.website || '—'}</Body>
          <Body size="sm"><strong>Verified:</strong> {selectedArtist.verified ? 'Yes' : 'No'}</Body>
          {selectedArtist.bio && <Body size="sm" className="col-span-2"><strong>Bio:</strong> {selectedArtist.bio}</Body>}
        </Grid>
      ),
    },
  ] : [];

  return (
    <AtlvsAppLayout>
      <ListPage<Artist>
        title="Artists & Performers"
        subtitle="Manage artists, bands, and performers"
        data={artistList}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search artists..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(row) => { setSelectedArtist(row); setDrawerOpen(true); }}
        createLabel="Add Artist"
        onCreate={() => setCreateModalOpen(true)}
        entityType="artists"
        onImport={createImportHandler({
          entityType: 'artists',
          requiredFields: ['name'],
          onImport: async (records) => {
            for (const record of records) {
              await fetch('/api/artists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(record),
              });
            }
            refetch();
          },
        })}
        importTemplates={getImportTemplates('artists').length > 0 ? getImportTemplates('artists') : [{ id: 'default', name: 'Artist Import', mapping: { name: 'name', artist_type: 'artist_type', genres: 'genres' } }]}
        importSampleFields={['name', 'artist_type', 'genres', 'hometown', 'country']}
        onExport={createExportHandler({
          filename: 'artists',
          getData: () => artistList.map(a => ({
            id: a.id,
            name: a.name,
            type: a.artist_type,
            genres: a.genres?.join(', '),
            hometown: a.hometown,
            country: a.country,
            status: a.status,
          })),
        })}
        stats={stats}
        emptyMessage="No artists yet"
        emptyAction={{ label: 'Add First Artist', onClick: () => setCreateModalOpen(true) }}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
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
      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedArtist}
        title={(artist) => artist.name}
        subtitle={(artist) => artist.artist_type}
        sections={detailSections}
        onEdit={(artist) => router.push(`/artists/${artist.id}/edit`)}
        onDelete={(artist) => { setArtistToDelete(artist); setDeleteConfirmOpen(true); setDrawerOpen(false); }}
      />
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Artist"
        message={`Delete artist "${artistToDelete?.name}"?`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setArtistToDelete(null); }}
      />
    </AtlvsAppLayout>
  );
}
