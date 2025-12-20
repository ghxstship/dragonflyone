'use client';

/**
 * Gap 7 Remediation: Admin Users Role Management UI
 * Provides UI for managing user roles and permissions
 * Uses GHXSTSHIP Design System components
 */

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { PlatformRole, PLATFORM_ROLE_METADATA, RoleLevel } from '@ghxstship/config/roles';
import {
  Button,
  Input,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  H1,
  H2,
  H3,
  Body,
  Label,
  Spinner,
  Container,
  Stack,
  Search,
  Alert,
} from '@ghxstship/ui';

const createClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PlatformUser {
  id: string;
  email: string;
  full_name: string | null;
  platform_roles: string[];
  organization_id: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  is_active: boolean;
}

interface RoleGroup {
  name: string;
  roles: PlatformRole[];
}

const ROLE_GROUPS: RoleGroup[] = [
  {
    name: 'Legend (God Mode)',
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
    name: 'ATLVS',
    roles: [
      PlatformRole.ATLVS_SUPER_ADMIN,
      PlatformRole.ATLVS_ADMIN,
      PlatformRole.ATLVS_TEAM_MEMBER,
      PlatformRole.ATLVS_VIEWER,
    ],
  },
  {
    name: 'COMPVSS',
    roles: [
      PlatformRole.COMPVSS_ADMIN,
      PlatformRole.COMPVSS_TEAM_MEMBER,
      PlatformRole.COMPVSS_COLLABORATOR,
      PlatformRole.COMPVSS_VIEWER,
    ],
  },
  {
    name: 'GVTEWAY',
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

type BadgeVariant = 'solid' | 'outline' | 'ghost' | 'success' | 'warning' | 'error' | 'info' | 'pop';

const LEVEL_BADGE_VARIANTS: Record<RoleLevel, BadgeVariant> = {
  god: 'pop',
  admin: 'error',
  manager: 'info',
  member: 'success',
  viewer: 'ghost',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [auditLogs, setAuditLogs] = useState<Array<{
    id: string;
    action_type: string;
    target_user_email: string;
    performed_by_email: string;
    created_at: string;
  }>>([]);
  const [showAuditLog, setShowAuditLog] = useState(false);

  const supabase = createClient();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('platform_users')
      .select('id, email, full_name, platform_roles, organization_id, created_at, last_sign_in_at, is_active')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setUsers(data || []);
    }

    setLoading(false);
  }, [supabase]);

  const fetchAuditLogs = useCallback(async () => {
    const { data } = await supabase
      .from('permission_audit_log')
      .select('id, action_type, target_user_email, performed_by_email, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      setAuditLogs(data);
    }
  }, [supabase]);

  useEffect(() => {
    fetchUsers();
    fetchAuditLogs();
  }, [fetchUsers, fetchAuditLogs]);

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.email.toLowerCase().includes(query) ||
      (user.full_name && user.full_name.toLowerCase().includes(query))
    );
  });

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
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  const saveRoles = async () => {
    if (!selectedUser) return;

    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('platform_users')
      .update({ platform_roles: selectedRoles })
      .eq('id', selectedUser.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      await fetchUsers();
      await fetchAuditLogs();
      closeEditModal();
    }

    setSaving(false);
  };

  const getRoleBadgeVariant = (role: string): BadgeVariant => {
    const metadata = PLATFORM_ROLE_METADATA[role as PlatformRole];
    if (!metadata) return 'ghost';
    return LEVEL_BADGE_VARIANTS[metadata.level];
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Container className="py-8">
      <Stack gap={6}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <H1>User Management</H1>
          <Button
            variant="outline"
            onClick={() => {
              setShowAuditLog(!showAuditLog);
              if (!showAuditLog) fetchAuditLogs();
            }}
          >
            {showAuditLog ? 'Hide Audit Log' : 'View Audit Log'}
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-muted" />
          <Input
            type="text"
            placeholder="Search users by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            className="pl-12"
          />
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <Card>
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
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Stack gap={1}>
                        <Body className="font-weight-bold">{user.full_name || 'No name'}</Body>
                        <Label className="text-ink-secondary">{user.email}</Label>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {(user.platform_roles || []).slice(0, 3).map((role) => (
                          <Badge
                            key={role}
                            variant={getRoleBadgeVariant(role)}
                            size="sm"
                          >
                            {role.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                        {(user.platform_roles || []).length > 3 && (
                          <Badge variant="ghost" size="sm">
                            +{user.platform_roles.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Body className="text-ink-secondary">
                        {formatDate(user.last_sign_in_at)}
                      </Body>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(user)}
                      >
                        Edit Roles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Audit Log Panel */}
        {showAuditLog && (
          <Card>
            <CardHeader>
              <H2>Permission Audit Log</H2>
            </CardHeader>
            <CardBody className="max-h-96 overflow-y-auto p-0">
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
                        <Label className="text-ink-secondary">
                          {new Date(entry.created_at).toLocaleString()}
                        </Label>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" size="sm">
                          {entry.action_type.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Body className="text-ink-secondary">{entry.target_user_email || '-'}</Body>
                      </TableCell>
                      <TableCell>
                        <Body className="text-ink-secondary">{entry.performed_by_email || '-'}</Body>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        )}
      </Stack>

      {/* Edit Roles Modal */}
      {isEditModalOpen && selectedUser && (
        <Modal open={isEditModalOpen} onClose={closeEditModal} size="lg">
          <ModalHeader>
            <H3>Edit Roles for {selectedUser.email}</H3>
          </ModalHeader>
          
          <ModalBody>
            <Stack gap={6}>
              {ROLE_GROUPS.map((group) => (
                <div key={group.name}>
                  <Label className="uppercase tracking-label mb-3 block">{group.name}</Label>
                  <div className="flex flex-wrap gap-2">
                    {group.roles.map((role) => {
                      const isSelected = selectedRoles.includes(role);
                      return (
                        <Button
                          key={role}
                          variant={isSelected ? 'solid' : 'outline'}
                          size="sm"
                          onClick={() => toggleRole(role)}
                        >
                          {role.replace(/_/g, ' ')}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" onClick={closeEditModal}>
              Cancel
            </Button>
            <Button variant="solid" onClick={saveRoles} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Container>
  );
}
