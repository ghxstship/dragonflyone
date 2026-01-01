"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Mail, Phone, MoreHorizontal } from "lucide-react";
import {
  ListPage, DetailDrawer, Grid, Body,
  type ListPageAction, type DetailSection} from "@ghxstship/ui";
import { createExportHandler, useAuthContext, ATLVS_ADMIN_ROLES, getEntityColumns, getEntityFilters } from "@ghxstship/config";
import { useTeamMembers, type TeamMember as APITeamMember } from "@/hooks/useTeamManagement";

// Demo data for fallback when API returns empty
const DEMO_TEAM_MEMBERS: DisplayTeamMember[] = [
  { id: "1", name: "Sarah Johnson", email: "sarah@example.com", phone: "+1 555-0101", role: "Production Manager", department: "Operations", status: "active", avatar_url: null, hire_date: "2023-01-15", skills: ["Project Management", "Budgeting"] },
  { id: "2", name: "Mike Chen", email: "mike@example.com", phone: "+1 555-0102", role: "Technical Director", department: "Technical", status: "active", avatar_url: null, hire_date: "2022-06-01", skills: ["AV Systems", "Lighting"] },
  { id: "3", name: "Emily Davis", email: "emily@example.com", phone: "+1 555-0103", role: "Event Coordinator", department: "Events", status: "active", avatar_url: null, hire_date: "2023-03-20", skills: ["Logistics", "Vendor Management"] },
  { id: "4", name: "James Wilson", email: "james@example.com", phone: null, role: "Stage Manager", department: "Production", status: "on_leave", avatar_url: null, hire_date: "2021-09-10", skills: ["Stage Management", "Crew Coordination"] },
  { id: "5", name: "Lisa Brown", email: "lisa@example.com", phone: "+1 555-0105", role: "Account Manager", department: "Sales", status: "active", avatar_url: null, hire_date: "2024-01-08", skills: ["Client Relations", "Sales"] },
];

interface DisplayTeamMember {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  department: string;
  status: "active" | "inactive" | "on_leave";
  avatar_url: string | null;
  hire_date: string;
  skills: string[];
}

// Normalize API team member to display format
function normalizeTeamMember(m: APITeamMember): DisplayTeamMember {
  const statusMap: Record<string, "active" | "inactive" | "on_leave"> = {
    active: "active",
    inactive: "inactive",
    invited: "inactive",
    suspended: "inactive",
  };
  return {
    id: m.id,
    name: m.name,
    email: m.email,
    phone: m.phone || null,
    role: m.title || m.role,
    department: m.department || "General",
    status: statusMap[m.status] || "active",
    avatar_url: m.avatar_url || null,
    hire_date: m.joined_at || m.invited_at || new Date().toISOString(),
    skills: m.permissions || [],
  };
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const columns = getEntityColumns<DisplayTeamMember>('team');
const filters = getEntityFilters('team');

export default function TeamPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const [selectedMember, setSelectedMember] = useState<DisplayTeamMember | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // RBAC: Check if user has admin access for create/edit/delete operations
  const canManageTeam = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  // Real API integration with demo fallback
  const { data: apiData, isLoading, error, refetch } = useTeamMembers();
  const apiMembers = apiData?.members || [];
  const teamMembers: DisplayTeamMember[] = apiMembers.length > 0 
    ? apiMembers.map(normalizeTeamMember) 
    : DEMO_TEAM_MEMBERS;

  const activeCount = teamMembers.filter(m => m.status === "active").length;
  const onLeaveCount = teamMembers.filter(m => m.status === "on_leave").length;

  const rowActions: ListPageAction<DisplayTeamMember>[] = [
    { id: "view", label: "View Profile", icon: <Eye className="size-4" />, onClick: (r) => { setSelectedMember(r); setDrawerOpen(true); } },
    { id: "email", label: "Send Email", icon: <Mail className="size-4" />, onClick: (r) => window.open(`mailto:${r.email}`) },
    { id: "more", label: "More Actions", icon: <MoreHorizontal className="size-4" />, onClick: (r) => router.push(`/employees/${r.id}`) },
  ];

  const stats = [
    { label: "Total Members", value: teamMembers.length },
    { label: "Active", value: activeCount },
    { label: "On Leave", value: onLeaveCount },
    { label: "Departments", value: new Set(teamMembers.map(m => m.department)).size },
  ];

  const detailSections: DetailSection[] = selectedMember ? [
    { id: "overview", title: "Member Details", content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Name:</strong> {selectedMember.name}</Body>
        <Body size="sm"><strong>Role:</strong> {selectedMember.role}</Body>
        <Body size="sm"><strong>Department:</strong> {selectedMember.department}</Body>
        <Body size="sm"><strong>Status:</strong> {selectedMember.status}</Body>
        <Body size="sm"><strong>Email:</strong> {selectedMember.email}</Body>
        <Body size="sm"><strong>Phone:</strong> {selectedMember.phone || "—"}</Body>
        <Body size="sm"><strong>Hire Date:</strong> {formatDate(selectedMember.hire_date)}</Body>
        <Body size="sm"><strong>Skills:</strong> {selectedMember.skills.join(", ")}</Body>
      </Grid>
    )},
  ] : [];

  return (
    <>
      <ListPage<DisplayTeamMember>
        title="Team"
        subtitle="Manage team members and roles"
        data={teamMembers}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        error={error}
        onRetry={refetch}
        searchPlaceholder="Search team members..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedMember(r); setDrawerOpen(true); }}
        entityType="team"
        createLabel={canManageTeam ? "Add Member" : undefined}
        onCreate={canManageTeam ? () => router.push('/team/new') : undefined}
        onExport={createExportHandler({
          filename: "team-members",
          getData: () => teamMembers.map(m => ({
            name: m.name,
            email: m.email,
            phone: m.phone || "",
            role: m.role,
            department: m.department,
            status: m.status,
            hire_date: m.hire_date,
          })),
        })}
        stats={stats}
        emptyMessage="No team members found"
        emptyAction={canManageTeam ? { label: "Add Member", onClick: () => router.push('/team/new') } : undefined}
        enableCapabilityDetection
        onScanAction={(capability, route) => router.push(route)}
        capabilityBasePath=""
        showFavorite
        showSettings
      />
      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedMember}
        title={(r) => r.name}
        subtitle={(r) => r.role}
        sections={detailSections}
        actions={[
          { id: "email", label: "Send Email", icon: <Mail className="size-4" /> },
          { id: "call", label: "Call", icon: <Phone className="size-4" /> },
        ]}
        onAction={(id, r) => {
          if (id === "email") window.open(`mailto:${r.email}`);
          if (id === "call" && r.phone) window.open(`tel:${r.phone}`);
          setDrawerOpen(false);
        }}
      />
    </>
  );
}
