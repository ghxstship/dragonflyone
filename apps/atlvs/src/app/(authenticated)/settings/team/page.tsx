"use client";

/**
 * Team Settings Page
 * Invite and manage team members and roles
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { Users, Mail, Shield, Trash2, Edit, Search, List, UserPlus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext, ATLVS_ADMIN_ROLES } from "@ghxstship/config";
import {
  Badge, Body, Button, Card, Grid, Input, Modal, ModalBody, ModalFooter, ModalHeader, Select, StatCard, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, DetailPage, Section, SectionHeader, useToast, Box, Stack } from "@ghxstship/ui";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "pending" | "inactive";
  avatar?: string;
  joined_at: string;
}

const ROLES = ["Admin", "Manager", "Member", "Viewer"];

const DEMO_MEMBERS: TeamMember[] = [
  { id: "1", name: "John Smith", email: "john@example.com", role: "Admin", status: "active", joined_at: "2024-01-15" },
  { id: "2", name: "Sarah Johnson", email: "sarah@example.com", role: "Manager", status: "active", joined_at: "2024-03-20" },
  { id: "3", name: "Mike Wilson", email: "mike@example.com", role: "Member", status: "active", joined_at: "2024-06-10" },
  { id: "4", name: "Emily Brown", email: "emily@example.com", role: "Member", status: "pending", joined_at: "2024-12-01" },
];

export default function TeamSettingsPage() {
  const queryClient = useQueryClient();
  const { hasRole } = useAuthContext();
  const toast = useToast();

  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");

  const canManageTeam = ATLVS_ADMIN_ROLES.some((role) => hasRole(role));

  const { data: members = [], isLoading, error, refetch } = useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const response = await fetch("/api/settings/team");
      if (!response.ok) return DEMO_MEMBERS;
      const data = await response.json();
      return data.members?.length ? data.members : DEMO_MEMBERS;
    },
  });

  const inviteMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const response = await fetch("/api/settings/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      if (!response.ok) throw new Error("Failed to send invite");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Invite Sent", `Invitation sent to ${inviteEmail}`);
      setShowInvite(false);
      setInviteEmail("");
      setInviteRole("Member");
    },
    onError: () => {
      toast.error("Error", "Failed to send invitation");
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const response = await fetch(`/api/settings/team/${memberId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to remove member");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Removed", "Team member removed");
    },
    onError: () => {
      toast.error("Error", "Failed to remove member");
    },
  });

  const filteredMembers = members.filter((m: TeamMember) => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: members.length,
    active: members.filter((m: TeamMember) => m.status === "active").length,
    pending: members.filter((m: TeamMember) => m.status === "pending").length,
  };

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const tabs = [
    {
      id: "members",
      label: "Members",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3 mb-6">
            <StatCard label="Total Members" value={stats.total.toString()} icon={<Users className="size-5" />} />
            <StatCard label="Active" value={stats.active.toString()} icon={<Users className="size-5" />} />
            <StatCard label="Pending Invites" value={stats.pending.toString()} icon={<Mail className="size-5" />} />
          </Grid>

          <Card className="p-4 mb-6">
            <Box className="flex items-center gap-4">
              <Box className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-dark-muted" />
                <Input placeholder="Search members..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </Box>
              {canManageTeam && (
                <Button variant="solid" onClick={() => setShowInvite(true)} icon={<UserPlus className="size-4" />} iconPosition="left">
                  Invite Member
                </Button>
              )}
            </Box>
          </Card>

          {filteredMembers.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="size-12 text-on-dark-disabled mx-auto mb-4" />
              <Body className="font-weight-medium font-weight-medium mb-2">No Team Members</Body>
              <Body className="text-on-dark-muted mb-4">{search ? "No members match your search" : "Invite your first team member"}</Body>
              {canManageTeam && (
                <Button variant="solid" onClick={() => setShowInvite(true)} icon={<UserPlus className="size-4" />} iconPosition="left">
                  Invite Member
                </Button>
              )}
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    {canManageTeam && <TableHead>Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member: TeamMember) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <Box className="flex items-center gap-3">
                          <Box className="size-10 rounded-avatar bg-primary flex items-center justify-center text-white font-weight-medium">
                            {member.name.split(" ").map((n) => n[0]).join("")}
                          </Box>
                          <Box>
                            <Body className="font-weight-medium">{member.name}</Body>
                            <Body size="sm" className="text-on-dark-muted">{member.email}</Body>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell><Badge variant="outline">{member.role}</Badge></TableCell>
                      <TableCell><Badge variant={member.status === "active" ? "success" : member.status === "pending" ? "warning" : "outline"}>{member.status}</Badge></TableCell>
                      <TableCell><Body size="sm">{formatDate(member.joined_at)}</Body></TableCell>
                      {canManageTeam && (
                        <TableCell>
                          <Box className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" icon={<Edit className="size-4" />} />
                            <Button variant="ghost" size="sm" onClick={() => removeMutation.mutate(member.id)} disabled={removeMutation.isPending} icon={<Trash2 className="size-4 text-error" />} />
                          </Box>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </Section>
      ),
    },
    {
      id: "roles",
      label: "Roles",
      icon: <Shield className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Role Permissions" description="Configure what each role can access" />
          <Stack gap={4} className="mt-4">
            {ROLES.map((role) => (
              <Card key={role} className="p-4">
                <Box className="flex justify-between items-center">
                  <Box>
                    <Body className="font-weight-medium">{role}</Body>
                    <Body size="sm" className="text-on-dark-muted">
                      {role === "Admin" && "Full access to all features and settings"}
                      {role === "Manager" && "Can manage projects, team, and view reports"}
                      {role === "Member" && "Can create and edit content, limited settings"}
                      {role === "Viewer" && "Read-only access to content"}
                    </Body>
                  </Box>
                  <Badge variant="outline">{members.filter((m: TeamMember) => m.role === role).length} members</Badge>
                </Box>
              </Card>
            ))}
          </Stack>
        </Section>
      ),
    },
  ];

  return (
    <>
      <DetailPage
        header={{ kicker: "Settings", title: "Team Members", description: "Invite and manage team members and roles" }}
        backButton={{ label: "Settings", href: "/settings" }}
        loading={isLoading}
        error={error instanceof Error ? error : null}
        onRetry={refetch}
        tabs={tabs}
      />

      <Modal open={showInvite} onClose={() => setShowInvite(false)}>
        <ModalHeader><Body className="font-weight-bold font-weight-medium">Invite Team Member</Body></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Box>
              <Body size="sm" className="text-on-dark-muted mb-1">Email Address</Body>
              <Input type="email" placeholder="colleague@example.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
            </Box>
            <Box>
              <Body size="sm" className="text-on-dark-muted mb-1">Role</Body>
              <Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
              </Select>
            </Box>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowInvite(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => inviteMutation.mutate({ email: inviteEmail, role: inviteRole })} disabled={!inviteEmail || inviteMutation.isPending}>
            {inviteMutation.isPending ? "Sending..." : "Send Invite"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
