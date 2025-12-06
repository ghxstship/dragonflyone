"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, ClipboardList, Pencil, Trash2, Download } from "lucide-react";
import { CompvssAppLayout } from "../../components/app-layout";
import { useCrew } from "../../hooks/useCrew";
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
  type ListPageFilter,
  type ListPageAction,
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";
import { createExportHandler, createImportHandler, getImportTemplates } from "@ghxstship/config";

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

const mockCrewForFallback = [
  {
    id: "CRW-001",
    name: "Sarah Martinez",
    role: "Production Manager",
    department: "Production",
    specialties: ["Event Coordination", "Budget Management", "Team Leadership"],
    certifications: ["OSHA 30", "First Aid/CPR"],
    availability: "Available",
    rate: 850,
    rating: 4.9,
    projectsCompleted: 47,
    location: "Miami, FL",
    phone: "(305) 555-0123",
    email: "sarah.m@crew.ghxstship.com",
  },
  {
    id: "CRW-002",
    name: "Michael Chen",
    role: "Technical Director",
    department: "Technical",
    specialties: ["Audio Engineering", "System Integration", "Rigging"],
    certifications: ["ETCP Rigging", "OSHA 30", "CTS-D"],
    availability: "Booked",
    rate: 950,
    rating: 4.8,
    projectsCompleted: 52,
    location: "Tampa, FL",
    phone: "(813) 555-0234",
    email: "michael.c@crew.ghxstship.com",
  },
  {
    id: "CRW-003",
    name: "Elena Rodriguez",
    role: "Lighting Designer",
    department: "Lighting",
    specialties: ["Lighting Design", "Programming", "Visualization"],
    certifications: ["ETCP Lighting", "OSHA 10"],
    availability: "Available",
    rate: 750,
    rating: 5.0,
    projectsCompleted: 38,
    location: "Orlando, FL",
    phone: "(407) 555-0345",
    email: "elena.r@crew.ghxstship.com",
  },
  {
    id: "CRW-004",
    name: "David Kim",
    role: "Video Director",
    department: "Video",
    specialties: ["Video Production", "Live Switching", "Content Creation"],
    certifications: ["FCC License", "OSHA 10"],
    availability: "Available",
    rate: 800,
    rating: 4.7,
    projectsCompleted: 41,
    location: "Miami, FL",
    phone: "(305) 555-0456",
    email: "david.k@crew.ghxstship.com",
  },
  {
    id: "CRW-005",
    name: "Jessica Park",
    role: "Stage Manager",
    department: "Production",
    specialties: ["Stage Management", "Cue Calling", "Artist Relations"],
    certifications: ["OSHA 10", "First Aid/CPR"],
    availability: "Booked",
    rate: 650,
    rating: 4.9,
    projectsCompleted: 56,
    location: "Miami, FL",
    phone: "(786) 555-0567",
    email: "jessica.p@crew.ghxstship.com",
  },
];

const columns: ListPageColumn<CrewMember>[] = [
  { key: 'id', label: 'ID', accessor: 'id', sortable: true, width: '100px' },
  { key: 'name', label: 'Name', accessor: 'name', sortable: true },
  { key: 'role', label: 'Role', accessor: 'role', sortable: true },
  { key: 'department', label: 'Department', accessor: 'department', sortable: true },
  { 
    key: 'availability', 
    label: 'Status', 
    accessor: 'availability', 
    sortable: true,
    render: (value) => (
      <Badge variant={value === "Available" ? "solid" : "outline"}>
        {String(value).toUpperCase()}
      </Badge>
    )
  },
  { 
    key: 'rate', 
    label: 'Day Rate', 
    accessor: 'rate', 
    sortable: true,
    render: (value) => `$${Number(value).toLocaleString()}/day`
  },
  { 
    key: 'rating', 
    label: 'Rating', 
    accessor: 'rating', 
    sortable: true,
    render: (value) => `${value}★`
  },
];

const filters: ListPageFilter[] = [
  { 
    key: 'department', 
    label: 'Department', 
    options: [
      { value: 'Production', label: 'Production' },
      { value: 'Technical', label: 'Technical' },
      { value: 'Lighting', label: 'Lighting' },
      { value: 'Video', label: 'Video' },
      { value: 'Audio', label: 'Audio' },
      { value: 'Rigging', label: 'Rigging' },
    ]
  },
  {
    key: 'availability',
    label: 'Availability',
    options: [
      { value: 'Available', label: 'Available' },
      { value: 'Booked', label: 'Booked' },
      { value: 'Unavailable', label: 'Unavailable' },
    ]
  },
];

const formFields: FormFieldConfig[] = [
  { name: 'name', label: 'Full Name', type: 'text', required: true, colSpan: 2 },
  { name: 'role', label: 'Role', type: 'text', required: true },
  { name: 'department', label: 'Department', type: 'select', required: true, options: [
    { value: 'Production', label: 'Production' },
    { value: 'Technical', label: 'Technical' },
    { value: 'Lighting', label: 'Lighting' },
    { value: 'Video', label: 'Video' },
    { value: 'Audio', label: 'Audio' },
    { value: 'Rigging', label: 'Rigging' },
  ]},
  { name: 'rate', label: 'Day Rate ($)', type: 'number', required: true },
  { name: 'availability', label: 'Availability', type: 'select', options: [
    { value: 'Available', label: 'Available' },
    { value: 'Booked', label: 'Booked' },
    { value: 'Unavailable', label: 'Unavailable' },
  ]},
  { name: 'location', label: 'Location', type: 'text' },
  { name: 'phone', label: 'Phone', type: 'text' },
  { name: 'email', label: 'Email', type: 'email', colSpan: 2 },
];

export default function CrewPage() {
  const router = useRouter();
  const { data: crewData, isLoading, refetch } = useCrew();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<CrewMember | null>(null);

  // Map API data to local interface or fallback to mock
  const crewList: CrewMember[] = crewData 
    ? crewData.map(c => ({
        id: c.id,
        name: c.full_name,
        role: c.role,
        department: c.department,
        availability: c.availability === 'available' ? 'Available' : c.availability === 'busy' ? 'Booked' : 'Unavailable',
        rate: c.rate,
        rating: c.rating || 0,
        projectsCompleted: c.projects_completed || 0,
        location: '',
        phone: c.phone || '',
        email: c.email,
        specialties: c.skills,
        certifications: c.certifications,
      }))
    : mockCrewForFallback;

  const rowActions: ListPageAction<CrewMember>[] = [
    { id: 'view', label: 'View Profile', icon: <Eye className="size-4" />, onClick: (row) => { setSelectedMember(row); setDrawerOpen(true); } },
    { id: 'assign', label: 'Assign to Project', icon: <ClipboardList className="size-4" />, onClick: (row) => router.push(`/crew/assign?member=${row.id}`) },
    { id: 'edit', label: 'Edit', icon: <Pencil className="size-4" />, onClick: (row) => router.push(`/crew/${row.id}/edit`) },
    { id: 'delete', label: 'Remove', icon: <Trash2 className="size-4" />, variant: 'danger', onClick: (row) => { setMemberToDelete(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'assign', label: 'Assign to Project', icon: <ClipboardList className="size-4" /> },
    { id: 'export', label: 'Export', icon: <Download className="size-4" /> },
    { id: 'remove', label: 'Remove', icon: <Trash2 className="size-4" />, variant: 'danger' },
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

  const handleCreate = async (_data: Record<string, unknown>) => {
    // In production, this would call the API to create the crew member
    // For now, just refetch to get any new data
    await refetch();
    setCreateModalOpen(false);
  };

  const handleDelete = async () => {
    if (memberToDelete) {
      // In production, this would call the API to delete the crew member
      await refetch();
      setDeleteConfirmOpen(false);
      setMemberToDelete(null);
    }
  };

  const availableCount = crewList.filter((c) => c.availability === "Available").length;
  const bookedCount = crewList.filter((c) => c.availability === "Booked").length;
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
        <Grid cols={2} gap={4}>
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
    <CompvssAppLayout>
      <ListPage<CrewMember>
        title="Crew Directory"
        subtitle="Vetted production professionals and technical specialists"
        data={crewList}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        searchPlaceholder="Search by name, role, or specialty..."
        filters={filters}
        rowActions={rowActions}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
        onRowClick={(row) => { setSelectedMember(row); setDrawerOpen(true); }}
        createLabel="Add Crew"
        onCreate={() => setCreateModalOpen(true)}
        entityType="crew"
        onImport={handleImport}
        importTemplates={importTemplates}
        importSampleFields={['name', 'role', 'department', 'rate', 'email']}
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
        emptyAction={{ label: 'Add Crew Member', onClick: () => setCreateModalOpen(true) }}
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
    </CompvssAppLayout>
  );
}
