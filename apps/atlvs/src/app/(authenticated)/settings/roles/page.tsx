'use client';

import {
  Body,
  Button,
  H1,
  H2,
  H3,
  H4,
  Input,
  Label,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Plus, Check, X, Trash2, AlertCircle, Users } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  user_count: number;
  is_system: boolean;
  created_at: string;
}

const PERMISSION_CATEGORIES = [
  {
    name: 'Projects',
    permissions: [
      { id: 'projects.view', name: 'View Projects', description: 'View project details and lists' },
      { id: 'projects.create', name: 'Create Projects', description: 'Create new projects' },
      { id: 'projects.edit', name: 'Edit Projects', description: 'Modify project settings and details' },
      { id: 'projects.delete', name: 'Delete Projects', description: 'Remove projects permanently' },
    ],
  },
  {
    name: 'Team',
    permissions: [
      { id: 'team.view', name: 'View Team', description: 'View team members' },
      { id: 'team.invite', name: 'Invite Members', description: 'Send team invitations' },
      { id: 'team.manage', name: 'Manage Team', description: 'Edit roles and remove members' },
    ],
  },
  {
    name: 'Finance',
    permissions: [
      { id: 'finance.view', name: 'View Finance', description: 'View budgets and reports' },
      { id: 'finance.edit', name: 'Edit Finance', description: 'Modify budgets and expenses' },
      { id: 'finance.approve', name: 'Approve Expenses', description: 'Approve financial transactions' },
    ],
  },
  {
    name: 'Settings',
    permissions: [
      { id: 'settings.view', name: 'View Settings', description: 'View organization settings' },
      { id: 'settings.edit', name: 'Edit Settings', description: 'Modify organization settings' },
      { id: 'settings.billing', name: 'Manage Billing', description: 'Access billing and subscription' },
    ],
  },
];

const DEMO_ROLES: Role[] = [
  {
    id: 'role-owner',
    name: 'Owner',
    description: 'Full access to all features and settings',
    permissions: PERMISSION_CATEGORIES.flatMap((c) => c.permissions.map((p) => p.id)),
    user_count: 1,
    is_system: true,
    created_at: '2024-01-01',
  },
  {
    id: 'role-admin',
    name: 'Admin',
    description: 'Manage team and most settings',
    permissions: ['projects.view', 'projects.create', 'projects.edit', 'team.view', 'team.invite', 'team.manage', 'finance.view', 'settings.view', 'settings.edit'],
    user_count: 3,
    is_system: true,
    created_at: '2024-01-01',
  },
  {
    id: 'role-manager',
    name: 'Manager',
    description: 'Manage projects and view reports',
    permissions: ['projects.view', 'projects.create', 'projects.edit', 'team.view', 'finance.view'],
    user_count: 8,
    is_system: true,
    created_at: '2024-01-01',
  },
  {
    id: 'role-member',
    name: 'Member',
    description: 'View and edit assigned items',
    permissions: ['projects.view', 'team.view'],
    user_count: 24,
    is_system: true,
    created_at: '2024-01-01',
  },
];

export default function RolePermissionsPage() {
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '', permissions: [] as string[] });

  const { data, isLoading, error } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await fetch('/api/settings/roles');
      if (!response.ok) {
        return { roles: DEMO_ROLES };
      }
      return response.json();
    },
  });

  const roles: Role[] = data?.roles || DEMO_ROLES;

  const createRole = useMutation({
    mutationFn: async (role: { name: string; description: string; permissions: string[] }) => {
      const response = await fetch('/api/settings/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(role),
      });
      if (!response.ok) throw new Error('Failed to create role');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setShowCreateModal(false);
      setNewRole({ name: '', description: '', permissions: [] });
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ roleId, permissions }: { roleId: string; permissions: string[] }) => {
      const response = await fetch(`/api/settings/roles/${roleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions }),
      });
      if (!response.ok) throw new Error('Failed to update role');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  const deleteRole = useMutation({
    mutationFn: async (roleId: string) => {
      const response = await fetch(`/api/settings/roles/${roleId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete role');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setSelectedRole(null);
    },
  });

  const togglePermission = (permissionId: string) => {
    if (!selectedRole || selectedRole.is_system) return;
    
    const newPermissions = selectedRole.permissions.includes(permissionId)
      ? selectedRole.permissions.filter((p) => p !== permissionId)
      : [...selectedRole.permissions, permissionId];
    
    setSelectedRole({ ...selectedRole, permissions: newPermissions });
    updateRole.mutate({ roleId: selectedRole.id, permissions: newPermissions });
  };

  const toggleNewRolePermission = (permissionId: string) => {
    setNewRole((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p) => p !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading roles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <Text className="text-destructive">Failed to load roles</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <H1 className="text-h2-md font-weight-bold text-foreground flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Roles & Permissions
            </H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              Manage roles and configure access permissions
            </Body>
          </div>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <Text className="text-body-sm font-weight-medium">Create Role</Text>
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="space-y-3">
          <H2 className="text-h4-md font-weight-semibold text-foreground">Roles ({roles.length})</H2>
          {roles.map((role) => (
            <Button
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`w-full text-left p-4 rounded-card border-2 transition-colors ${
                selectedRole?.id === role.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Text className="text-body-md font-weight-medium text-foreground">{role.name}</Text>
                {role.is_system && (
                  <Text className="text-body-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    System
                  </Text>
                )}
              </div>
              <Body className="text-body-sm text-muted-foreground mb-2">{role.description}</Body>
              <div className="flex items-center gap-1 text-body-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                {role.user_count} users
              </div>
            </Button>
          ))}
        </div>

        {/* Permissions Panel */}
        <div className="col-span-2">
          {selectedRole ? (
            <div className="bg-background border-2 border-border rounded-card">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div>
                  <H2 className="text-h4-md font-weight-semibold text-foreground">
                    {selectedRole.name} Permissions
                  </H2>
                  <Body className="text-body-sm text-muted-foreground">{selectedRole.description}</Body>
                </div>
                {!selectedRole.is_system && (
                  <Button
                    onClick={() => {
                      if (confirm('Delete this role? Users will need to be reassigned.')) {
                        deleteRole.mutate(selectedRole.id);
                      }
                    }}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-button transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="p-4 space-y-6">
                {selectedRole.is_system && (
                  <div className="bg-muted/30 border-2 border-dashed border-border rounded-card p-3 text-body-sm text-muted-foreground">
                    System roles cannot be modified. Create a custom role to customize permissions.
                  </div>
                )}
                {PERMISSION_CATEGORIES.map((category) => (
                  <div key={category.name}>
                    <H3 className="text-body-md font-weight-semibold text-foreground mb-3">
                      {category.name}
                    </H3>
                    <div className="space-y-2">
                      {category.permissions.map((permission) => {
                        const isEnabled = selectedRole.permissions.includes(permission.id);
                        return (
                          <Button
                            key={permission.id}
                            onClick={() => togglePermission(permission.id)}
                            disabled={selectedRole.is_system}
                            className={`w-full flex items-center justify-between p-3 rounded-card border-2 transition-colors ${
                              isEnabled
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-muted-foreground'
                            } ${selectedRole.is_system ? 'cursor-not-allowed opacity-60' : ''}`}
                          >
                            <div className="text-left">
                              <Body className="text-body-sm font-weight-medium text-foreground">
                                {permission.name}
                              </Body>
                              <Body className="text-body-xs text-muted-foreground">
                                {permission.description}
                              </Body>
                            </div>
                            {isEnabled ? (
                              <Check className="h-5 w-5 text-primary" />
                            ) : (
                              <X className="h-5 w-5 text-muted-foreground" />
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-muted/30 border-2 border-dashed border-border rounded-card p-12 flex flex-col items-center justify-center text-center">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <Body className="text-body-md text-muted-foreground">
                Select a role to view and manage its permissions
              </Body>
            </div>
          )}
        </div>
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <H3 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create Custom Role
            </H3>
            <div className="space-y-4">
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Role Name *
                </Label>
                <Input
                  type="text"
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="e.g., Project Coordinator"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Description
                </Label>
                <Input
                  type="text"
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Brief description of this role"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <Label className="block text-body-sm font-weight-medium text-foreground mb-2">
                  Permissions
                </Label>
                <div className="space-y-4 max-h-64 overflow-y-auto border-2 border-border rounded-card p-4">
                  {PERMISSION_CATEGORIES.map((category) => (
                    <div key={category.name}>
                      <H4 className="text-body-sm font-weight-semibold text-foreground mb-2">
                        {category.name}
                      </H4>
                      <div className="grid grid-cols-2 gap-2">
                        {category.permissions.map((permission) => (
                          <Label
                            key={permission.id}
                            className="flex items-center gap-2 p-2 hover:bg-muted/30 rounded cursor-pointer"
                          >
                            <Input
                              type="checkbox"
                              checked={newRole.permissions.includes(permission.id)}
                              onChange={() => toggleNewRolePermission(permission.id)}
                              className="rounded border-border"
                            />
                            <Text className="text-body-sm text-foreground">{permission.name}</Text>
                          </Label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <Button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => createRole.mutate(newRole)}
                  disabled={!newRole.name || createRole.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {createRole.isPending ? 'Creating...' : 'Create Role'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
