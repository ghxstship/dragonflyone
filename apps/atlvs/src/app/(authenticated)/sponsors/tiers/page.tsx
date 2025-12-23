'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, Pencil, Trash2, Users } from 'lucide-react';
// Layout provided by route group
import { useSponsorTiers, useCreateSponsorTier, useUpdateSponsorTier, useDeleteSponsorTier, useSponsors } from '../../../../hooks/useSponsors';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Stack,
  Body,
  type ListPageColumn,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';

interface SponsorTier {
  id: string;
  name: string;
  level: number;
  price: number;
  description?: string;
  benefits: string[];
  max_sponsors?: number;
  logo_placement?: string;
  is_active: boolean;
}

const columns: ListPageColumn<SponsorTier>[] = [
  { 
    key: 'level', 
    label: 'Level', 
    accessor: 'level', 
    sortable: true,
    width: '80px',
  },
  { 
    key: 'name', 
    label: 'Tier Name', 
    accessor: 'name', 
    sortable: true,
  },
  { 
    key: 'price', 
    label: 'Price', 
    accessor: 'price', 
    sortable: true,
    render: (value) => `$${Number(value || 0).toLocaleString()}`
  },
  { 
    key: 'max_sponsors', 
    label: 'Max Sponsors', 
    accessor: 'max_sponsors', 
    render: (value) => value ? String(value) : 'Unlimited'
  },
  { 
    key: 'benefits', 
    label: 'Benefits', 
    accessor: 'benefits', 
    render: (value) => Array.isArray(value) ? `${value.length} benefits` : '0 benefits'
  },
  { 
    key: 'is_active', 
    label: 'Status', 
    accessor: 'is_active', 
    render: (value) => (
      <Badge variant={value ? 'success' : 'ghost'}>
        {value ? 'ACTIVE' : 'INACTIVE'}
      </Badge>
    )
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Tier Name', type: 'text', required: true, placeholder: 'e.g., Presenting Sponsor', colSpan: 2 },
  { name: 'level', label: 'Level (1-10)', type: 'number', required: true, placeholder: '1' },
  { name: 'price', label: 'Price', type: 'number', required: true, placeholder: '0.00' },
  { name: 'max_sponsors', label: 'Max Sponsors', type: 'number', placeholder: 'Leave empty for unlimited' },
  { name: 'logo_placement', label: 'Logo Placement', type: 'text', placeholder: 'e.g., Main stage, all materials' },
  { name: 'description', label: 'Description', type: 'textarea', colSpan: 2, placeholder: 'Describe this tier...' },
  { name: 'is_active', label: 'Active', type: 'checkbox' },
];

export default function SponsorTiersPage() {
  const router = useRouter();
  const { data: tiers, isLoading, error, refetch } = useSponsorTiers();
  const { data: sponsors } = useSponsors();
  const createMutation = useCreateSponsorTier();
  const updateMutation = useUpdateSponsorTier();
  const deleteMutation = useDeleteSponsorTier();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SponsorTier | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tierToDelete, setTierToDelete] = useState<SponsorTier | null>(null);

  // Count sponsors per tier
  const sponsorCounts = tiers?.reduce((acc, tier) => {
    acc[tier.id] = sponsors?.filter(s => s.sponsor_tier_id === tier.id).length || 0;
    return acc;
  }, {} as Record<string, number>) || {};

  const rowActions: ListPageAction<SponsorTier>[] = [
    { 
      id: 'view', 
      label: 'View Details', 
      icon: <Eye className="size-4" />, 
      onClick: (row) => { setSelectedTier(row); setDrawerOpen(true); } 
    },
    { 
      id: 'edit', 
      label: 'Edit', 
      icon: <Pencil className="size-4" />, 
      onClick: (row) => { setSelectedTier(row); setEditModalOpen(true); } 
    },
    { 
      id: 'sponsors', 
      label: 'View Sponsors', 
      icon: <Users className="size-4" />, 
      onClick: (row) => router.push(`/sponsors?tier=${row.id}`) 
    },
    { 
      id: 'delete', 
      label: 'Delete', 
      icon: <Trash2 className="size-4" />, 
      variant: 'danger',
      onClick: (row) => { 
        if ((sponsorCounts[row.id] || 0) === 0) {
          setTierToDelete(row); 
          setDeleteDialogOpen(true); 
        }
      }
    },
  ];

  const handleCreate = async (data: Record<string, unknown>) => {
    await createMutation.mutateAsync(data as unknown as Parameters<typeof createMutation.mutateAsync>[0]);
    setCreateModalOpen(false);
    refetch();
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (selectedTier) {
      await updateMutation.mutateAsync({ id: selectedTier.id, ...data } as SponsorTier & { id: string });
      setEditModalOpen(false);
      setSelectedTier(null);
      refetch();
    }
  };

  const handleDelete = async () => {
    if (tierToDelete) {
      await deleteMutation.mutateAsync(tierToDelete.id);
      refetch();
    }
    setDeleteDialogOpen(false);
    setTierToDelete(null);
  };

  const stats = [
    { label: 'Total Tiers', value: tiers?.length || 0 },
    { label: 'Active', value: tiers?.filter(t => t.is_active).length || 0 },
    { label: 'Total Value', value: `$${(tiers?.reduce((sum, t) => sum + (t.price || 0), 0) || 0).toLocaleString()}` },
  ];

  const detailSections: DetailSection[] = selectedTier ? [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Level</Body>
            <Body>{selectedTier.level}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Price</Body>
            <Body>${selectedTier.price?.toLocaleString()}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Max Sponsors</Body>
            <Body>{selectedTier.max_sponsors || 'Unlimited'}</Body>
          </Stack>
          <Stack gap={1}>
            <Body size="sm" className=" text-grey-500">Current Sponsors</Body>
            <Body>{sponsorCounts[selectedTier.id] || 0}</Body>
          </Stack>
        </Grid>
      ),
    },
    {
      id: 'benefits',
      title: 'Benefits',
      content: selectedTier.benefits && selectedTier.benefits.length > 0 ? (
        <Stack gap={2}>
          {selectedTier.benefits.map((benefit, index) => (
            <Body key={index}>- {benefit}</Body>
          ))}
        </Stack>
      ) : (
        <Body className="text-grey-500">No benefits defined.</Body>
      ),
    },
    {
      id: 'description',
      title: 'Description',
      content: <Body>{selectedTier.description || 'No description provided.'}</Body>,
    },
  ] : [];

  return (
    <>
      <ListPage<SponsorTier>
        title="Sponsor Tiers"
        subtitle="Configure sponsorship tiers and pricing"
        data={tiers || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search tiers..."
        rowActions={rowActions}
        onRowClick={(row) => { setSelectedTier(row); setDrawerOpen(true); }}
        createLabel="New Tier"
        onCreate={() => setCreateModalOpen(true)}
        stats={stats}
        emptyMessage="No sponsor tiers configured"
        emptyAction={{ label: 'Create First Tier', onClick: () => setCreateModalOpen(true) }}
        onBulkAction={async (action, ids) => {
          if (action === 'delete') {
            await fetch('/api/sponsors/tiers/bulk', {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids }),
            });
            refetch();
          }
        }}
        bulkActions={[
          { id: 'delete', label: 'Delete Selected', variant: 'danger' },
        ]}
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Create Sponsor Tier"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
        record={{ is_active: true, level: (tiers?.length || 0) + 1, price: 0 }}
      />

      <RecordFormModal
        open={editModalOpen}
        onClose={() => { setEditModalOpen(false); setSelectedTier(null); }}
        mode="edit"
        title="Edit Sponsor Tier"
        fields={formFields}
        onSubmit={handleUpdate}
        size="lg"
        record={(selectedTier as unknown) as Record<string, unknown> | undefined}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedTier}
        title={(t) => t.name}
        subtitle={(t) => `Level ${t.level} - $${t.price?.toLocaleString()}`}
        sections={detailSections}
        onEdit={(t) => { setSelectedTier(t); setEditModalOpen(true); setDrawerOpen(false); }}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Tier"
        message={`Are you sure you want to delete "${tierToDelete?.name}"? This action cannot be undone.`}
        variant="danger"
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteDialogOpen(false); setTierToDelete(null); }}
      />
    </>
  );
}
