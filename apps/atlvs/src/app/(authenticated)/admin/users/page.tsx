"use client";

/**
 * Admin Users Role Management UI
 * Provides UI for managing user roles and permissions
 * Uses DetailPage template for consistent layout
 * 
 * RBAC: Requires ATLVS_ADMIN or LEGEND role
 */

import { useState } from "react";
import { PlatformRole, PLATFORM_ROLE_METADATA, RoleLevel } from "@ghxstship/config/roles";
import { useAuthContext, ATLVS_ADMIN_ROLES } from "@ghxstship/config";
import {
  useUsersQuery,
  useUpdateUserRoles,
  usePermissionAuditLogsQuery,
  type PlatformUser,
} from "@/hooks/useUsersQuery";
import {
  Badge, Body, Button, Card, Grid, Input, Modal, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, DetailPage, Section, SectionHeader, StatCard} from "@ghxstship/ui";
import { Search, Users, Shield, Clock, FileText } from "lucide-react";

interface RoleGroup {
  name: string;
  roles: PlatformRole[];
}

const ROLE_GROUPS: RoleGroup[] = [
  {
    name: "Legend (God Mode)",
    roles: [
      PlatformRole.LEGEND_SUPER_ADMIN,
      PlatformRole.LEGEND_ADMIN,
      PlatformRole.LEGEND_DEVELOPER,
      PlatformRole.LEGEND_COLLABORATOR,
      PlatformRole.LEGEND_SUPPORT,
      PlatformRole.LEGEND_INCOGNITO,
    ],
  },
  {
    name: "ATLVS",
    roles: [
      PlatformRole.ATLVS_SUPER_ADMIN,
      PlatformRole.ATLVS_ADMIN,
      PlatformRole.ATLVS_TEAM_MEMBER,
      PlatformRole.ATLVS_VIEWER,
    ],
  },
  {
    name: "COMPVSS",
    roles: [
      PlatformRole.COMPVSS_ADMIN,
      PlatformRole.COMPVSS_TEAM_MEMBER,
      PlatformRole.COMPVSS_COLLABORATOR,
      PlatformRole.COMPVSS_VIEWER,
    ],
  },
  {
    name: "GVTEWAY",
    roles: [
      PlatformRole.GVTEWAY_ADMIN,
      PlatformRole.GVTEWAY_EXPERIENCE_CREATOR,
      PlatformRole.GVTEWAY_VENUE_MANAGER,
      PlatformRole.GVTEWAY_ARTIST_VERIFIED,
      PlatformRole.GVTEWAY_ARTIST,
      PlatformRole.GVTEWAY_MEMBER_EXTRA,
      PlatformRole.GVTEWAY_MEMBER_PLUS,
      PlatformRole.GVTEWAY_MEMBER,
      PlatformRole.GVTEWAY_MEMBER_GUEST,
      PlatformRole.GVTEWAY_AFFILIATE,
      PlatformRole.GVTEWAY_MODERATOR,
    ],
  },
];

type BadgeVariant = "success" | "warning" | "error" | "info" | "outline";

const LEVEL_BADGE_VARIANTS: Record<RoleLevel, BadgeVariant> = {
  god: "error",
  admin: "error",
  manager: "info",
  member: "success",
  viewer: "outline",
};

export default function AdminUsersPage() {
  const { user: currentUser, hasRole } = useAuthContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  const hasAdminAccess = ATLVS_ADMIN_ROLES.some((role) => hasRole(role));

  const {
    data: users = [],
    isLoading: loading,
    error: queryError,
    refetch: refetchUsers,
  } = useUsersQuery({ search: searchQuery });

  const { data: auditLogs = [], refetch: refetchAuditLogs } = usePermissionAuditLogsQuery(50);
  const updateRolesMutation = useUpdateUserRoles();

  const error = queryError?.message || updateRolesMutation.error?.message || null;
  const saving = updateRolesMutation.isPending;

  const openEditModal = (user: PlatformUser) => {
    setSelectedUser(user);
    setSelectedRoles(user.platform_roles || []);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedUser(null);
    setSelectedRoles([]);
    setIsEditModalOpen(false);
  };

  const toggleRole = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r: string) => r !== role) : [...prev, role]
    );
  };

  const saveRoles = async () => {
    if (!selectedUser) return;
    updateRolesMutation.mutate(
      { userId: selectedUser.id, roles: selectedRoles, performedByEmail: currentUser?.email },
      {
        onSuccess: () => {
          refetchUsers();
          refetchAuditLogs();
          closeEditModal();
        },
      }
    );
  };

  const getRoleBadgeVariant = (role: string): BadgeVariant => {
    const metadata = PLATFORM_ROLE_METADATA[role as PlatformRole];
    if (!metadata) return "outline";
    return LEVEL_BADGE_VARIANTS[metadata.level];
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Stats
  const totalUsers = users.length;
  const adminCount = users.filter((u) => (u.platform_roles || []).some((r: string) => r.includes("ADMIN"))).length;
  const recentLogins = users.filter((u) => {
    if (!u.last_sign_in_at) return false;
    const lastLogin = new Date(u.last_sign_in_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return lastLogin > weekAgo;
  }).length;

  if (!hasAdminAccess) {
    return (
      <DetailPage
        header={{
          kicker: "Admin",
          title: "User Management",
          description: "Manage user roles and permissions",
        }}
        restricted
        restrictedMessage={`You do not have permission to manage user roles. This page requires ATLVS Admin or Legend role. Current user: ${currentUser?.email || "Unknown"}`}
        backButton={{ label: "Dashboard", href: "/dashboard" }}
      />
    );
  }

  const tabs = [
    {
      id: "users",
      label: "Users",
      icon: <Users className="size-4" />,
      content: (
        <Section>
          <Grid cols={3} gap={4} className="grid-cols-1 lg:grid-cols-3 mb-6">
            <StatCard label="Total Users" value={totalUsers.toString()} icon={<Users className="size-5" />} />
            <StatCard label="Admins" value={adminCount.toString()} icon={<Shield className="size-5" />} />
            <StatCard label="Active This Week" value={recentLogins.toString()} icon={<Clock className="size-5" />} />
          </Grid>

          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-on-dark-muted" />
            <Input
              type="text"
              placeholder="Search users by email or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12"
            />
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="size-12 text-on-dark-disabled mx-auto mb-4" />
              <Body className="text-on-dark-muted">No users found</Body>
            </div>
          ) : (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Last Sign In</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: PlatformUser) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <Body className="font-weight-medium">{user.full_name || "No name"}</Body>
                          <Body size="sm" className="text-on-dark-muted">{user.email}</Body>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {(user.platform_roles || []).slice(0, 3).map((role: string) => (
                            <Badge key={role} variant={getRoleBadgeVariant(role)} size="sm">
                              {role.replace(/_/g, " ")}
                            </Badge>
                          ))}
                          {(user.platform_roles || []).length > 3 && (
                            <Badge variant="outline" size="sm">+{user.platform_roles.length - 3} more</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Body size="sm" className="text-on-dark-muted">{formatDate(user.last_sign_in_at)}</Body>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => openEditModal(user)}>Edit Roles</Button>
                      </TableCell>
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
      id: "audit",
      label: "Audit Log",
      icon: <FileText className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Permission Audit Log" description="Track all role changes" />
          {auditLogs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="size-12 text-on-dark-disabled mx-auto mb-4" />
              <Body className="text-on-dark-muted">No audit logs found</Body>
            </div>
          ) : (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target User</TableHead>
                    <TableHead>Performed By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <Body size="sm" className="text-on-dark-muted">{new Date(entry.created_at).toLocaleString()}</Body>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" size="sm">{entry.action_type.replace(/_/g, " ")}</Badge>
                      </TableCell>
                      <TableCell>
                        <Body size="sm" className="text-on-dark-muted">{entry.target_user_email || "-"}</Body>
                      </TableCell>
                      <TableCell>
                        <Body size="sm" className="text-on-dark-muted">{entry.performed_by_email || "-"}</Body>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </Section>
      ),
    },
  ];

  return (
    <>
      <DetailPage
        header={{
          kicker: "Admin",
          title: "User Management",
          description: "Manage user roles and permissions across the platform",
        }}
        loading={loading}
        error={error ? new Error(error) : null}
        onRetry={refetchUsers}
        tabs={tabs}
        activeTabIndex={activeTab}
        onTabChange={(index) => {
          setActiveTab(index);
          if (index === 1) refetchAuditLogs();
        }}
        backButton={{ label: "Admin", href: "/admin" }}
      />

      <Modal open={isEditModalOpen} onClose={closeEditModal} title={`Edit Roles for ${selectedUser?.email || ""}`}>
        {selectedUser && (
          <div className="space-y-6">
            {ROLE_GROUPS.map((group) => (
              <div key={group.name}>
                <Body size="sm" className="text-on-dark-muted uppercase tracking-label mb-3">{group.name}</Body>
                <div className="flex flex-wrap gap-2">
                  {group.roles.map((role) => {
                    const isSelected = selectedRoles.includes(role);
                    return (
                      <Button
                        key={role}
                        variant={isSelected ? "solid" : "outline"}
                        size="sm"
                        onClick={() => toggleRole(role)}
                      >
                        {role.replace(/_/g, " ")}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="flex gap-4">
              <Button variant="outline" onClick={closeEditModal}>Cancel</Button>
              <Button variant="solid" onClick={saveRoles} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
