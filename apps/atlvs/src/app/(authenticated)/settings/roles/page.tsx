"use client";

/**
 * Roles Settings Page
 * Manage roles and permissions
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { Shield, Plus, Edit, Trash2, Check, X, List, Settings } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext, ATLVS_ADMIN_ROLES } from "@ghxstship/config";
import {
  Badge,
  Body,
  Button,
  Card,
  Grid,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  StatCard,
  DetailPage,
  Section,
  SectionHeader,
  useNotifications,
} from "@ghxstship/ui";

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  member_count: number;
  is_system: boolean;
}

const PERMISSIONS = [
  { id: "projects.view", label: "View Projects", category: "Projects" },
  { id: "projects.create", label: "Create Projects", category: "Projects" },
  { id: "projects.edit", label: "Edit Projects", category: "Projects" },
  { id: "projects.delete", label: "Delete Projects", category: "Projects" },
  { id: "team.view", label: "View Team", category: "Team" },
  { id: "team.manage", label: "Manage Team", category: "Team" },
  { id: "billing.view", label: "View Billing", category: "Billing" },
  { id: "billing.manage", label: "Manage Billing", category: "Billing" },
  { id: "settings.view", label: "View Settings", category: "Settings" },
  { id: "settings.manage", label: "Manage Settings", category: "Settings" },
];

const DEMO_ROLES: Role[] = [
  { id: "1", name: "Admin", description: "Full access to all features", permissions: PERMISSIONS.map((p) => p.id), member_count: 2, is_system: true },
  { id: "2", name: "Manager", description: "Can manage projects and team", permissions: ["projects.view", "projects.create", "projects.edit", "team.view", "team.manage", "settings.view"], member_count: 3, is_system: true },
  { id: "3", name: "Member", description: "Can create and edit content", permissions: ["projects.view", "projects.create", "projects.edit", "team.view"], member_count: 8, is_system: true },
  { id: "4", name: "Viewer", description: "Read-only access", permissions: ["projects.view", "team.view"], member_count: 5, is_system: true },
];

export default function RolesSettingsPage() {
  const queryClient = useQueryClient();
  const { hasRole } = useAuthContext();
  const { addNotification } = useNotifications();

  const [showCreate, setShowCreate] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDesc, setNewRoleDesc] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const canManageRoles = ATLVS_ADMIN_ROLES.some((role) => hasRole(role));

  const { data: roles = [], isLoading, error, refetch } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const response = await fetch("/api/settings/roles");
      if (!response.ok) return DEMO_ROLES;
      const data = await response.json();
      return data.roles?.length ? data.roles : DEMO_ROLES;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; permissions: string[] }) => {
      const response = await fetch("/api/settings/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create role");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      addNotification({ type: "success", title: "Created", message: "Role created successfully" });
      setShowCreate(false);
      resetForm();
    },
    onError: () => {
      addNotification({ type: "error", title: "Error", message: "Failed to create role" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const response = await fetch(`/api/settings/roles/${roleId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete role");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      addNotification({ type: "success", title: "Deleted", message: "Role deleted" });
    },
    onError: () => {
      addNotification({ type: "error", title: "Error", message: "Failed to delete role" });
    },
  });

  const resetForm = () => {
    setNewRoleName("");
    setNewRoleDesc("");
    setSelectedPermissions([]);
    setEditingRole(null);
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions((prev) => prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]);
  };

  const stats = {
    total: roles.length,
    system: roles.filter((r: Role) => r.is_system).length,
    custom: roles.filter((r: Role) => !r.is_system).length,
  };

  const permissionsByCategory = PERMISSIONS.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof PERMISSIONS>);

  const tabs = [
    {
      id: "roles",
      label: "Roles",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3 mb-6">
            <StatCard label="Total Roles" value={stats.total.toString()} icon={<Shield className="size-5" />} />
            <StatCard label="System Roles" value={stats.system.toString()} icon={<Shield className="size-5" />} />
            <StatCard label="Custom Roles" value={stats.custom.toString()} icon={<Shield className="size-5" />} />
          </Grid>

          {canManageRoles && (
            <div className="mb-6">
              <Button variant="solid" onClick={() => setShowCreate(true)} icon={<Plus className="size-4" />} iconPosition="left">
                Create Role
              </Button>
            </div>
          )}

          <div className="space-y-4">
            {roles.map((role: Role) => (
              <Card key={role.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Body className="font-weight-medium">{role.name}</Body>
                      {role.is_system && <Badge variant="outline" className="font-weight-normal">System</Badge>}
                    </div>
                    <Body size="sm" className="text-grey-400 mb-3">{role.description}</Body>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 5).map((perm) => (
                        <Badge key={perm} variant="outline" className="font-weight-normal">{PERMISSIONS.find((p) => p.id === perm)?.label || perm}</Badge>
                      ))}
                      {role.permissions.length > 5 && <Badge variant="outline" className="font-weight-normal">+{role.permissions.length - 5} more</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="info">{role.member_count} members</Badge>
                    {canManageRoles && !role.is_system && (
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingRole(role); setNewRoleName(role.name); setNewRoleDesc(role.description); setSelectedPermissions(role.permissions); setShowCreate(true); }} icon={<Edit className="size-4" />} />
                        <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(role.id)} disabled={deleteMutation.isPending} icon={<Trash2 className="size-4 text-error" />} />
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      ),
    },
    {
      id: "permissions",
      label: "Permissions",
      icon: <Settings className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Available Permissions" description="All permissions that can be assigned to roles" />
          <div className="space-y-6 mt-4">
            {Object.entries(permissionsByCategory).map(([category, perms]) => (
              <Card key={category} className="p-4">
                <Body className="font-weight-medium mb-3">{category}</Body>
                <div className="grid grid-cols-2 gap-2">
                  {perms.map((perm) => (
                    <div key={perm.id} className="flex items-center gap-2 p-2 bg-grey-800 rounded">
                      <Check className="size-4 text-success" />
                      <Body size="sm">{perm.label}</Body>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </Section>
      ),
    },
  ];

  return (
    <>
      <DetailPage
        header={{ kicker: "Settings", title: "Roles & Permissions", description: "Manage roles and what they can access" }}
        backButton={{ label: "Settings", href: "/settings" }}
        loading={isLoading}
        error={error instanceof Error ? error : null}
        onRetry={refetch}
        tabs={tabs}
      />

      <Modal open={showCreate} onClose={() => { setShowCreate(false); resetForm(); }} size="lg">
        <ModalHeader><Body className="font-weight-bold font-weight-medium">{editingRole ? "Edit Role" : "Create Role"}</Body></ModalHeader>
        <ModalBody>
          <div className="space-y-4">
            <div>
              <Body size="sm" className="text-grey-400 mb-1">Role Name</Body>
              <Input placeholder="e.g., Project Lead" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} />
            </div>
            <div>
              <Body size="sm" className="text-grey-400 mb-1">Description</Body>
              <Input placeholder="What can this role do?" value={newRoleDesc} onChange={(e) => setNewRoleDesc(e.target.value)} />
            </div>
            <div>
              <Body size="sm" className="text-grey-400 mb-2">Permissions</Body>
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {Object.entries(permissionsByCategory).map(([category, perms]) => (
                  <div key={category}>
                    <Body size="sm" className="font-weight-medium mb-2">{category}</Body>
                    <div className="grid grid-cols-2 gap-2">
                      {perms.map((perm) => (
                        <Button key={perm.id} variant={selectedPermissions.includes(perm.id) ? "solid" : "outline"} size="sm" onClick={() => togglePermission(perm.id)} className="justify-start">
                          {selectedPermissions.includes(perm.id) ? <Check className="size-3 mr-2" /> : <X className="size-3 mr-2 opacity-50" />}
                          {perm.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowCreate(false); resetForm(); }}>Cancel</Button>
          <Button variant="solid" onClick={() => createMutation.mutate({ name: newRoleName, description: newRoleDesc, permissions: selectedPermissions })} disabled={!newRoleName || createMutation.isPending}>
            {createMutation.isPending ? "Saving..." : editingRole ? "Save Changes" : "Create Role"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
