"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, ClipboardList, Pencil, Trash2, Download } from "lucide-react";
// Layout provided by route group
import { useCrew } from "@/hooks/useCrew";
import {
  ListPage, Badge, RecordFormModal, DetailDrawer, ConfirmDialog, Grid, Stack, Body,
  type ListPageAction, type ListPageBulkAction, type DetailSection} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates, useAuthContext, PlatformRole, useEntityConfig } from "@ghxstship/config";

// Roles that can manage crew (COMPVSS has no SUPER_ADMIN, only ADMIN)
const ADMIN_ROLES = [
  PlatformRole.COMPVSS_ADMIN,
  PlatformRole.LEGEND_SUPER_ADMIN,
  PlatformRole.LEGEND_ADMIN,
  PlatformRole.LEGEND_DEVELOPER,
];

interface CrewMember {
  id: string;
  name: string;
  role: string;
  department: string;
  availability: string;
  rate: number;
  rating: number;
  projectsCompleted: number;
  location: string;
  phone: string;
  email: string;
  specialties?: string[];
  certifications?: string[];
}

// SSOT: Columns, filters, and formFields are provided by useEntityConfig

export default function CrewPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const { data: crewData, isLoading, error, refetch } = useCrew();

  // SSOT: Get columns, filters, and formFields from entity registry
  const { columns, filters, formFields } = useEntityConfig<CrewMember>({ entityName: 'crew' });

  // RBAC: Check if user has admin access for manage operations
  const canManageCrew = ADMIN_ROLES.some(role => hasRole(role));
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<CrewMember | null>(null);

  // Map API data to local interface - preserve schema values for filtering
  const crewList: CrewMember[] = (crewData || []).map(c => ({
    id: c.id,
    name: c.full_name,
    role: c.role,
    department: c.department,
    // Keep schema values: 'available' | 'busy' | 'on-leave'
    availability: c.availability,
    rate: c.rate,
    rating: c.rating || 0,
    projectsCompleted: c.projects_completed || 0,
    location: '',
    phone: c.phone || '',
    email: c.email,
    specialties: c.skills,
    certifications: c.certifications,
  }));

  const rowActions: ListPageAction<CrewMember>[] = [
    { id: 'view', label: 'View Profile', icon: <Eye className="size-4" />, onClick: (row: CrewMember) => { setSelectedMember(row); setDrawerOpen(true); } },
    ...(canManageCrew ? [
      { id: 'assign', label: 'Assign to Project', icon: <ClipboardList className="size-4" />, onClick: (row: CrewMember) => router.push(`/crew/assign?member=${row.id}`) },
      { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (row: CrewMember) => router.push(`/crew/${row.id}/edit`) },
      { id: 'delete', label: 'Remove', icon: <Trash2 className="size-4" />, variant: 'danger' as const, onClick: (row: CrewMember) => { setMemberToDelete(row); setDeleteConfirmOpen(true); } },
    ] : []),
  ];

  const bulkActions: ListPageBulkAction[] = [
    ...(canManageCrew ? [
      { id: 'assign', label: 'Assign to Project', icon: <ClipboardList className="size-4" /> },
    ] : []),
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    ...(canManageCrew ? [
      { id: 'remove', label: 'Remove', icon: <Trash2 className="size-4" />, variant: 'danger' as const },
    ] : []),
  ];

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    if (actionId === 'export') {
      const selectedCrew = crewList.filter(c => selectedIds.includes(c.id));
      const csv = [
        ['ID', 'Name', 'Role', 'Department', 'Availability', 'Rate', 'Rating', 'Location'].join(','),
        ...selectedCrew.map(c => [c.id, c.name, c.role, c.department, c.availability, c.rate, c.rating, c.location].join(','))
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'crew-export.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      const response = await fetch('/api/crew', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          // Map frontend field names to API schema
          first_name: (data.name as string)?.split(' ')[0] || '',
          last_name: (data.name as string)?.split(' ').slice(1).join(' ') || '',
          skills: [],
          certifications: [],
          metadata: {},
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create crew member');
      }
      await refetch();
      setCreateModalOpen(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create crew member';
      alert(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (memberToDelete) {
      try {
        const response = await fetch(`/api/crew/${memberToDelete.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to delete crew member');
        }
        await refetch();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete crew member';
        alert(errorMessage);
      }
      setDeleteConfirmOpen(false);
      setMemberToDelete(null);
    }
  };

  // Schema: availability enum 'available' | 'busy' | 'on-leave'
  const availableCount = crewList.filter((c) => c.availability === "available").length;
  const bookedCount = crewList.filter((c) => c.availability === "busy").length;
  const avgRating = crewList.length > 0 
    ? (crewList.reduce((sum, c) => sum + (c.rating || 0), 0) / crewList.length).toFixed(1)
    : '0';

  // Import handler for CSV/JSON files
  const handleImport = createImportHandler<Record<string, unknown>>({
    entityType: 'crew',
    requiredFields: ['name', 'role', 'department'],
    onImport: async (records) => {
      for (const record of records) {
        await fetch('/api/crew', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
      }
    },
  });

  const importTemplates = getImportTemplates('crew').length > 0 
    ? getImportTemplates('crew') 
    : [{ id: 'default', name: 'Crew Import', mapping: { name: 'name', role: 'role', department: 'department', rate: 'rate', email: 'email' } }];

  const stats = [
    { label: 'Total Crew', value: crewList.length },
    { label: 'Available', value: availableCount },
    { label: 'Booked', value: bookedCount },
    { label: 'Avg Rating', value: avgRating },
  ];

  const detailSections: DetailSection[] = selectedMember ? [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
          <Stack gap={1}><Body className="font-display">Role</Body><Body>{selectedMember.role}</Body></Stack>
          <Stack gap={1}><Body className="font-display">Department</Body><Body>{selectedMember.department}</Body></Stack>
          <Stack gap={1}><Body className="font-display">Day Rate</Body><Body>${selectedMember.rate}/day</Body></Stack>
          <Stack gap={1}><Body className="font-display">Rating</Body><Body>{selectedMember.rating}★</Body></Stack>
          <Stack gap={1}><Body className="font-display">Projects</Body><Body>{selectedMember.projectsCompleted}</Body></Stack>
          <Stack gap={1}><Body className="font-display">Location</Body><Body>{selectedMember.location}</Body></Stack>
        </Grid>
      ),
    },
    {
      id: 'contact',
      title: 'Contact',
      content: (
        <Stack gap={2}>
          <Stack gap={1}><Body className="font-display">Phone</Body><Body>{selectedMember.phone}</Body></Stack>
          <Stack gap={1}><Body className="font-display">Email</Body><Body>{selectedMember.email}</Body></Stack>
        </Stack>
      ),
    },
    {
      id: 'skills',
      title: 'Specialties & Certifications',
      content: (
        <Stack gap={4}>
          {selectedMember.specialties && (
            <Stack gap={2}>
              <Body className="font-display">Specialties</Body>
              <Stack direction="horizontal" gap={2} className="flex-wrap">
                {selectedMember.specialties.map((s: string) => (
                  <Badge key={s} variant="outline">{s}</Badge>
                ))}
              </Stack>
            </Stack>
          )}
          {selectedMember.certifications && (
            <Stack gap={2}>
              <Body className="font-display">Certifications</Body>
              <Stack direction="horizontal" gap={2} className="flex-wrap">
                {selectedMember.certifications.map((c: string) => (
                  <Badge key={c}>{c}</Badge>
                ))}
              </Stack>
            </Stack>
          )}
        </Stack>
      ),
    },
  ] : [];

  return (
    <>
      <ListPage<CrewMember>
        title="Crew Directory"
        subtitle="Vetted production professionals and technical specialists"
        data={crewList}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search by name, role, or specialty..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
        onRowClick={(row) => { setSelectedMember(row); setDrawerOpen(true); }}
        createLabel={canManageCrew ? "Add Crew" : undefined}
        onCreate={canManageCrew ? () => setCreateModalOpen(true) : undefined}
        entityType="crew"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['name', 'role', 'department', 'rate', 'email']}
        templateDownloadUrl="/templates/crew-management/crew-roster-template.csv"
        onExport={createExportHandler({
          filename: "crew",
          getData: () => crewList.map(c => ({
            id: c.id,
            name: c.name,
            role: c.role,
            department: c.department,
            availability: c.availability,
            rate: c.rate,
            rating: c.rating,
            location: c.location,
            phone: c.phone,
            email: c.email,
          })),
        })}
        stats={stats}
        emptyMessage="No crew members found"
        emptyAction={canManageCrew ? { label: 'Add Crew Member', onClick: () => setCreateModalOpen(true) } : undefined}
        enableCapabilityDetection
        onScanAction={(capability, route) => router.push(route)}
        capabilityBasePath=""
        showFavorite
        showSettings
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
        title="Add Crew Member"
        fields={formFields}
        onSubmit={handleCreate}
        size="lg"
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedMember}
        title={(m) => m.name}
        subtitle={(m) => `${m.role} • ${m.department}`}
        sections={detailSections}
        onEdit={(m) => router.push(`/crew/${m.id}/edit`)}
        onDelete={(m) => { setMemberToDelete(m); setDeleteConfirmOpen(true); setDrawerOpen(false); }}
        actions={[
          { id: 'assign', label: 'Assign', icon: <ClipboardList className="size-4" />, variant: 'primary' },
        ]}
        onAction={(actionId, member) => {
          if (actionId === 'assign') router.push(`/crew/assign?member=${member.id}`);
        }}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Remove Crew Member"
        message={`Are you sure you want to remove "${memberToDelete?.name}" from the directory?`}
        variant="danger"
        confirmLabel="Remove"
        onConfirm={handleDelete}
        onCancel={() => { setDeleteConfirmOpen(false); setMemberToDelete(null); }}
      />
    </>
  );
}
