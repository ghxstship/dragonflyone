'use client';

import { useState } from 'react';
import { Shield, Eye, Pencil, Trash2 } from 'lucide-react';
import { AtlvsAppLayout } from '../../components/app-layout';
import { useRoles, useRoleDefinitions, useAssignRole, useRevokeRole, getRoleLevelColor } from '../../hooks/useRoles';
import {
  ListPage,
  Badge,
  RecordFormModal,
  DetailDrawer,
  ConfirmDialog,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type FormFieldConfig,
  type DetailSection,
} from '@ghxstship/ui';

interface UserRole {
  id: string;
  platform_user_id: string;
  organization_id: string;
  role_code: string;
  created_at: string;
  role?: {
    code: string;
    platform: string;
    description?: string;
    level: string;
    hierarchy_rank: number;
  };
  user?: {
    id: string;
    full_name?: string;
    email: string;
  };
  organization?: {
    id: string;
    name: string;
  };
}

const columns: ListPageColumn<UserRole>[] = [
  {
    key: 'user',
    label: 'User',
    accessor: (row) => row.user?.full_name || row.user?.email || '—',
    sortable: true,
  },
  {
    key: 'role_code',
    label: 'Role',
    accessor: 'role_code',
    render: (value, row) => (
      <Badge variant={getRoleLevelColor(row.role?.level || 'viewer') as 'success' | 'warning' | 'error' | 'info' | 'ghost'}>
        {String(value)}
      </Badge>
    ),
  },
  {
    key: 'level',
    label: 'Level',
    accessor: (row) => row.role?.level || '—',
  },
  {
    key: 'platform',
    label: 'Platform',
    accessor: (row) => row.role?.platform || '—',
  },
  {
    key: 'organization',
    label: 'Organization',
    accessor: (row) => row.organization?.name || '—',
  },
  {
    key: 'created_at',
    label: 'Assigned',
    accessor: 'created_at',
    render: (value) => value ? new Date(String(value)).toLocaleDateString() : '—',
  },
];

const filters: ListPageFilter[] = [
  {
    key: 'platform',
    label: 'Platform',
    options: [
      { value: 'atlvs', label: 'ATLVS' },
      { value: 'compvss', label: 'COMPVSS' },
      { value: 'gvteway', label: 'GVTEWAY' },
      { value: 'legend', label: 'Legend' },
    ],
  },
];

export default function RolesPage() {
  const { data: response, isLoading, error, refetch } = useRoles();
  const { data: roleDefinitions } = useRoleDefinitions();
  const assignMutation = useAssignRole();
  const revokeMutation = useRevokeRole();

  const userRoles = response?.user_roles || [];
  const summary = response?.summary;

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<UserRole | null>(null);

  const formFields: FormFieldConfig[] = [
    { name: 'platform_user_id', label: 'User ID', type: 'text', required: true },
    { name: 'organization_id', label: 'Organization ID', type: 'text', required: true },
    {
      name: 'role_code',
      label: 'Role',
      type: 'select',
      required: true,
      options: roleDefinitions?.map(r => ({ value: r.code, label: `${r.code} (${r.level})` })) || [],
    },
  ];

  const rowActions: ListPageAction<UserRole>[] = [
    {
      id: 'view',
      label: 'View Details',
      icon: <Eye className="size-4" />,
      onClick: (row) => {
        setSelectedRole(row);
        setDrawerOpen(true);
      },
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: <Pencil className="size-4" />,
      onClick: (row) => {
        setSelectedRole(row);
        setDrawerOpen(true);
      },
    },
    {
      id: 'revoke',
      label: 'Revoke',
      icon: <Trash2 className="size-4" />,
      variant: 'danger',
      onClick: (row) => {
        setRoleToDelete(row);
        setDeleteConfirmOpen(true);
      },
    },
  ];

  const handleAssign = async (data: Record<string, unknown>) => {
    await assignMutation.mutateAsync({
      platform_user_id: String(data.platform_user_id),
      organization_id: String(data.organization_id),
      role_code: String(data.role_code),
    });
    setCreateModalOpen(false);
    refetch();
  };

  const handleRevoke = async () => {
    if (roleToDelete) {
      await revokeMutation.mutateAsync(roleToDelete.id);
      setDeleteConfirmOpen(false);
      setRoleToDelete(null);
      refetch();
    }
  };

  const stats = [
    { label: 'Total Assignments', value: summary?.total || 0 },
    { label: 'Unique Roles', value: Object.keys(summary?.by_role || {}).length },
  ];

  const detailSections: DetailSection[] = selectedRole
    ? [
        {
          id: 'overview',
          title: 'Role Assignment Details',
          content: (
            <Grid cols={2} gap={4}>
              <Body size="sm"><strong>User:</strong> {selectedRole.user?.full_name || selectedRole.user?.email || '—'}</Body>
              <Body size="sm"><strong>Role:</strong> {selectedRole.role_code}</Body>
              <Body size="sm"><strong>Level:</strong> {selectedRole.role?.level || '—'}</Body>
              <Body size="sm"><strong>Platform:</strong> {selectedRole.role?.platform || '—'}</Body>
              <Body size="sm"><strong>Organization:</strong> {selectedRole.organization?.name || '—'}</Body>
              <Body size="sm"><strong>Description:</strong> {selectedRole.role?.description || '—'}</Body>
            </Grid>
          ),
        },
      ]
    : [];

  return (
    <AtlvsAppLayout>
      <ListPage
        title="Roles & Permissions"
        description="Manage user role assignments and access control"
        icon={<Shield className="size-6" />}
        data={userRoles}
        columns={columns}
        filters={filters}
        rowActions={rowActions}
        stats={stats}
        loading={isLoading}
        error={error?.message}
        onRefresh={refetch}
        onCreate={() => setCreateModalOpen(true)}
        createLabel="Assign Role"
      />

      <RecordFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Assign Role"
        fields={formFields}
        onSubmit={handleAssign}
        loading={assignMutation.isPending}
      />

      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Role Assignment"
        sections={detailSections}
      />

      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Revoke Role"
        message={`Are you sure you want to revoke the "${roleToDelete?.role_code}" role from this user? This action cannot be undone.`}
        confirmLabel="Revoke"
        onConfirm={handleRevoke}
        loading={revokeMutation.isPending}
        variant="danger"
      />
    </AtlvsAppLayout>
  );
}
