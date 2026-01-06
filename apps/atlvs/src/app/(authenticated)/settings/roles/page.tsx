"use client";

/**
 * Roles Settings Page
 * Manage roles and permissions
 * Uses DetailPage template for consistent layout
 */

import { useState, useCallback } from "react";
import { Shield, Plus, Edit, Trash2, Check, X, List, Settings } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthContext, ATLVS_ADMIN_ROLES } from "@ghxstship/config";
import {
  Badge, Body, Button, Card, Grid, Input, Modal, ModalBody, ModalFooter, ModalHeader, StatCard, DetailPage, Section, SectionHeader, useToast, Box, Stack } from "@ghxstship/ui";

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
  const toast = useToast();

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
      toast.success("Created", "Role created successfully");
      setShowCreate(false);
      resetForm();
    },
    onError: () => {
      toast.error("Error", "Failed to create role");
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
      toast.success("Deleted", "Role deleted");
    },
    onError: () => {
      toast.error("Error", "Failed to delete role");
    },
  });

  const resetForm = () => {
    setNewRoleName("");
    setNewRoleDesc("");
    setSelectedPermissions([]);
    setEditingRole(null);
  };

  // Extract inline functions to useCallback for better performance with memoized children
  const handleShowCreate = useCallback(() => setShowCreate(true), []);
  const handleCloseCreateModal = useCallback(() => {
    setShowCreate(false);
    resetForm();
  }, []);
  const handleCreateRole = useCallback(() => {
    createMutation.mutate({ name: newRoleName, description: newRoleDesc, permissions: selectedPermissions });
  }, [createMutation, newRoleName, newRoleDesc, selectedPermissions]);

  const handleEditRole = useCallback((role: Role) => {
    setEditingRole(role);
    setNewRoleName(role.name);
    setNewRoleDesc(role.description);
    setSelectedPermissions(role.permissions);
    setShowCreate(true);
  }, []);

  const handleDeleteRole = useCallback((roleId: string) => {
    deleteMutation.mutate(roleId);
  }, [deleteMutation]);

  const handleTogglePermission = useCallback((permId: string) => {
    setSelectedPermissions((prev) => prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId]);
  }, []);

  const handleRoleNameChange = useCallback((value: string) => {
    setNewRoleName(value);
  }, []);

  const handleRoleDescChange = useCallback((value: string) => {
    setNewRoleDesc(value);
  }, []);

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
            <Box className="mb-6">
              <Button variant="solid" onClick={handleShowCreate} icon={<Plus className="size-4" />} iconPosition="left">
                Create Role
              </Button>
            </Box>
          )}

          <Stack gap={4}>
            {roles.map((role: Role) => (
              <Card key={role.id} className="p-4">
                <Box className="flex justify-between items-start">
                  <Box className="flex-1">
                    <Box className="flex items-center gap-2 mb-1">
                      <Body className="font-weight-medium">{role.name}</Body>
                      {role.is_system && <Badge variant="outline" className="font-weight-normal">System</Badge>}
                    </Box>
                    <Body size="sm" className="text-text-muted mb-3">{role.description}</Body>
                    <Box className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 5).map((perm) => (
                        <Badge key={perm} variant="outline" className="font-weight-normal">{PERMISSIONS.find((p) => p.id === perm)?.label || perm}</Badge>
                      ))}
                      {role.permissions.length > 5 && <Badge variant="outline" className="font-weight-normal">+{role.permissions.length - 5} more</Badge>}
                    </Box>
                  </Box>
                  <Box className="flex items-center gap-4">
                    <Badge variant="info">{role.member_count} members</Badge>
                    {canManageRoles && !role.is_system && (
                      <Box className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEditRole(role)} icon={<Edit className="size-4" />} aria-label={`Edit ${role.name} role`} />
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteRole(role.id)} disabled={deleteMutation.isPending} icon={<Trash2 className="size-4 text-error" />} aria-label={`Delete ${role.name} role`} />
                      </Box>
                    )}
                  </Box>
                </Box>
              </Card>
            ))}
          </Stack>
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
          <Stack gap={6} className="mt-4">
            {Object.entries(permissionsByCategory).map(([category, perms]) => (
              <Card key={category} className="p-4">
                <Body className="font-weight-medium mb-3">{category}</Body>
                <Grid cols={2} gap={2}>
                  {perms.map((perm) => (
                    <Box key={perm.id} className="flex items-center gap-2 p-2 bg-surface-elevated rounded">
                      <Check className="size-4 text-success" />
                      <Body size="sm">{perm.label}</Body>
                    </Box>
                  ))}
                </Grid>
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
        header={{ kicker: "Settings", title: "Roles & Permissions", description: "Manage roles and what they can access" }}
        backButton={{ label: "Settings", href: "/settings" }}
        isLoading={isLoading}
        error={error instanceof Error ? error : null}
        onRetry={refetch}
        tabs={tabs}
      />

      <Modal open={showCreate} onClose={handleCloseCreateModal} size="lg">
        <ModalHeader><Body className="font-weight-bold font-weight-medium">{editingRole ? "Edit Role" : "Create Role"}</Body></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Box>
              <Body size="sm" className="text-text-muted mb-1">Role Name</Body>
              <Input placeholder="e.g., Project Lead" value={newRoleName} onChange={(e) => handleRoleNameChange(e.target.value)} />
            </Box>
            <Box>
              <Body size="sm" className="text-text-muted mb-1">Description</Body>
              <Input placeholder="What can this role do?" value={newRoleDesc} onChange={(e) => handleRoleDescChange(e.target.value)} />
            </Box>
            <Box>
              <Body size="sm" className="text-text-muted mb-2">Permissions</Body>
              <Stack gap={4} className="max-h-64 overflow-y-auto">
                {Object.entries(permissionsByCategory).map(([category, perms]) => (
                  <Box key={category}>
                    <Body size="sm" className="font-weight-medium mb-2">{category}</Body>
                    <Grid cols={2} gap={2}>
                      {perms.map((perm) => (
                        <Button key={perm.id} variant={selectedPermissions.includes(perm.id) ? "solid" : "outline"} size="sm" onClick={() => handleTogglePermission(perm.id)} className="justify-start">
                          {selectedPermissions.includes(perm.id) ? <Check className="size-3 mr-2" /> : <X className="size-3 mr-2 opacity-50" />}
                          {perm.label}
                        </Button>
                      ))}
                    </Grid>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={handleCloseCreateModal}>Cancel</Button>
          <Button variant="solid" onClick={handleCreateRole} disabled={!newRoleName || createMutation.isPending}>
            {createMutation.isPending ? "Saving..." : editingRole ? "Save Changes" : "Create Role"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
