"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import { useCrew } from "../../hooks/useCrew";
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type ListPageBulkAction,
  type FormFieldConfig,
  type DetailSection,
} from "@ghxstship/ui";

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
  const { data: crewData, isLoading } = useCrew();
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<CrewMember | null>(null);

  // Use live data or fallback to mock
  const crewList = crewData || mockCrewForFallback;

  const rowActions: ListPageAction<CrewMember>[] = [
    { id: 'view', label: 'View Profile', icon: '👁️', onClick: (row) => { setSelectedMember(row); setDrawerOpen(true); } },
    { id: 'assign', label: 'Assign to Project', icon: '📋', onClick: (row) => router.push(`/crew/assign?member=${row.id}`) },
    { id: 'edit', label: 'Edit', icon: '✏️', onClick: (row) => router.push(`/crew/${row.id}/edit`) },
    { id: 'delete', label: 'Remove', icon: '🗑️', variant: 'danger', onClick: (row) => { setMemberToDelete(row); setDeleteConfirmOpen(true); } },
  ];

  const bulkActions: ListPageBulkAction[] = [
    { id: 'assign', label: 'Assign to Project', icon: '📋' },
    { id: 'export', label: 'Export', icon: '⬇️' },
    { id: 'remove', label: 'Remove', icon: '🗑️', variant: 'danger' },
  ];

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    console.log('Bulk action:', actionId, selectedIds);
  };

  const handleCreate = async (data: Record<string, unknown>) => {
    console.log('Create crew member:', data);
    setCreateModalOpen(false);
  };

  const handleDelete = async () => {
    if (memberToDelete) {
      console.log('Delete crew member:', memberToDelete.id);
      setDeleteConfirmOpen(false);
      setMemberToDelete(null);
    }
  };

  const availableCount = crewList.filter((c) => c.availability === "Available").length;
  const bookedCount = crewList.filter((c) => c.availability === "Booked").length;
  const avgRating = crewList.length > 0 
    ? (crewList.reduce((sum, c) => sum + (c.rating || 0), 0) / crewList.length).toFixed(1)
    : '0';

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
        <div className="grid grid-cols-2 gap-4">
          <div><strong>Role:</strong> {selectedMember.role}</div>
          <div><strong>Department:</strong> {selectedMember.department}</div>
          <div><strong>Day Rate:</strong> ${selectedMember.rate}/day</div>
          <div><strong>Rating:</strong> {selectedMember.rating}★</div>
          <div><strong>Projects:</strong> {selectedMember.projectsCompleted}</div>
          <div><strong>Location:</strong> {selectedMember.location}</div>
        </div>
      ),
    },
    {
      id: 'contact',
      title: 'Contact',
      content: (
        <div className="grid gap-2">
          <div><strong>Phone:</strong> {selectedMember.phone}</div>
          <div><strong>Email:</strong> {selectedMember.email}</div>
        </div>
      ),
    },
    {
      id: 'skills',
      title: 'Specialties & Certifications',
      content: (
        <div className="grid gap-4">
          {selectedMember.specialties && (
            <div>
              <strong>Specialties:</strong>
              <div className="flex gap-2 flex-wrap mt-2">
                {selectedMember.specialties.map((s: string) => (
                  <Badge key={s} variant="outline">{s}</Badge>
                ))}
              </div>
            </div>
          )}
          {selectedMember.certifications && (
            <div>
              <strong>Certifications:</strong>
              <div className="flex gap-2 flex-wrap mt-2">
                {selectedMember.certifications.map((c: string) => (
                  <Badge key={c}>{c}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
    },
  ] : [];

  return (
    <>
      <ListPage<any>
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
        onExport={() => console.log('Export crew')}
        stats={stats}
        emptyMessage="No crew members found"
        emptyAction={{ label: 'Add Crew Member', onClick: () => setCreateModalOpen(true) }}
        header={<Navigation />}
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
          { id: 'assign', label: 'Assign', icon: '📋', variant: 'primary' },
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
