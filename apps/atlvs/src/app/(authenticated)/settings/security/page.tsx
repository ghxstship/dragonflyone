'use client';

/**
 * Security Settings Page
 * Uses normalized SettingsPageLayout template from @ghxstship/ui
 */

import { useState } from 'react';
import { Key, Smartphone, Monitor, Clock, AlertTriangle, Check, LogOut, Eye, EyeOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Alert,
  Badge,
  Body,
  Box,
  Button,
  Card,
  EmptyState,
  Form,
  Grid,
  H2,
  Input,
  Label,
  Modal,
  SettingsPageLayout,
  Skeleton,
  Stack,
  Text,
} from '@ghxstship/ui';
import { useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';


interface SecuritySettings {
  two_factor_enabled: boolean;
  two_factor_method?: 'authenticator' | 'sms';
  password_last_changed: string;
  sessions: Array<{
    id: string;
    device: string;
    browser: string;
    location: string;
    ip_address: string;
    last_active: string;
    is_current: boolean;
  }>;
  login_history: Array<{
    id: string;
    date: string;
    device: string;
    location: string;
    status: 'success' | 'failed';
  }>;
}

const DEMO_SECURITY: SecuritySettings = {
  two_factor_enabled: true,
  two_factor_method: 'authenticator',
  password_last_changed: '2024-11-15',
  sessions: [
    { id: 's-001', device: 'MacBook Pro', browser: 'Chrome 120', location: 'Los Angeles, CA', ip_address: '192.168.1.xxx', last_active: '2025-01-13T19:30:00Z', is_current: true },
    { id: 's-002', device: 'iPhone 15', browser: 'Safari', location: 'Los Angeles, CA', ip_address: '192.168.1.xxx', last_active: '2025-01-13T12:00:00Z', is_current: false },
  ],
  login_history: [
    { id: 'l-001', date: '2025-01-13T19:30:00Z', device: 'MacBook Pro', location: 'Los Angeles, CA', status: 'success' },
    { id: 'l-002', date: '2025-01-12T09:15:00Z', device: 'iPhone 15', location: 'Los Angeles, CA', status: 'success' },
    { id: 'l-003', date: '2025-01-11T22:45:00Z', device: 'Unknown Device', location: 'New York, NY', status: 'failed' },
  ],
};

export default function SecuritySettingsPage() {
  const queryClient = useQueryClient();
  const { hasRole } = useAuthContext();
  
  // RBAC: Check if user has admin access
  const canManageSecurity = ATLVS_ADMIN_ROLES.some(role => hasRole(role));
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new_password: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new_password: false, confirm: false });

  const { data, isLoading, error } = useQuery({
    queryKey: ['security-settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings/security');
      if (!response.ok) {
        return DEMO_SECURITY;
      }
      return response.json();
    },
  });

  const settings: SecuritySettings = data || DEMO_SECURITY;

  const updatePassword = useMutation({
    mutationFn: async (passwords: { current: string; new_password: string }) => {
      const response = await fetch('/api/settings/security/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwords),
      });
      if (!response.ok) throw new Error('Failed to update password');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-settings'] });
      setShowPasswordModal(false);
      setPasswordForm({ current: '', new_password: '', confirm: '' });
    },
  });

  const toggle2FA = useMutation({
    mutationFn: async (enabled: boolean) => {
      const response = await fetch('/api/settings/security/2fa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });
      if (!response.ok) throw new Error('Failed to update 2FA');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-settings'] });
      setShow2FAModal(false);
    },
  });

  const revokeSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await fetch(`/api/settings/security/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to revoke session');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-settings'] });
    },
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const daysSincePasswordChange = () => {
    const lastChanged = new Date(settings.password_last_changed);
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (isLoading) {
    return (
      <SettingsPageLayout
        title="Security Settings"
        description="Manage your account security"
        maxWidth="lg"
      >
        <Stack gap={6}>
          <Grid cols={2} gap={6}>
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </Grid>
          <Skeleton className="h-64" />
        </Stack>
      </SettingsPageLayout>
    );
  }

  if (error) {
    return (
      <SettingsPageLayout
        title="Security Settings"
        description="Error"
        maxWidth="lg"
      >
        <EmptyState
          title="Failed to load security settings"
          description="There was an error loading your security settings. Please try again."
          action={{ label: 'Retry', onClick: () => window.location.reload() }}
        />
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      title="Security Settings"
      description="Manage your account security and active sessions"
      maxWidth="lg"
    >
      <Stack gap={6}>
        <Grid cols={2} gap={6}>
              <Card className="p-6">
                <Stack direction="horizontal" className="justify-between mb-4">
                  <H2 className="flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Password
                  </H2>
                  {canManageSecurity && (
                    <Button variant="ghost" onClick={() => setShowPasswordModal(true)}>
                      Change Password
                    </Button>
                  )}
                </Stack>
                <Stack gap={3}>
                  <Box className="flex items-center justify-between p-3 bg-muted/30 rounded-card">
                    <Text size="sm">Last changed</Text>
                    <Text size="sm" className="text-muted-foreground">
                      {formatDate(settings.password_last_changed)}
                    </Text>
                  </Box>
                  {daysSincePasswordChange() > 90 && (
                    <Alert variant="warning">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <AlertTriangle className="h-4 w-4" />
                        <Text size="sm">
                          Your password is {daysSincePasswordChange()} days old. Consider updating it.
                        </Text>
                      </Stack>
                    </Alert>
                  )}
                </Stack>
              </Card>

              <Card className="p-6">
                <Stack direction="horizontal" className="justify-between mb-4">
                  <H2 className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5" />
                    Two-Factor Authentication
                  </H2>
                  {canManageSecurity && (
                    <Button
                      variant={settings.two_factor_enabled ? 'destructive' : 'ghost'}
                      onClick={() => setShow2FAModal(true)}
                    >
                      {settings.two_factor_enabled ? 'Disable' : 'Enable'}
                    </Button>
                  )}
                </Stack>
                <Stack gap={3}>
                  <Box className="flex items-center justify-between p-3 bg-muted/30 rounded-card">
                    <Text size="sm">Status</Text>
                    <Stack direction="horizontal" gap={1} className="items-center">
                      {settings.two_factor_enabled ? (
                        <>
                          <Check className="h-4 w-4 text-success" />
                          <Badge variant="success">Enabled</Badge>
                        </>
                      ) : (
                        <Badge variant="warning">Disabled</Badge>
                      )}
                    </Stack>
                  </Box>
                  {settings.two_factor_enabled && settings.two_factor_method && (
                    <Box className="flex items-center justify-between p-3 bg-muted/30 rounded-card">
                      <Text size="sm">Method</Text>
                      <Text size="sm" className="text-muted-foreground capitalize">
                        {settings.two_factor_method}
                      </Text>
                    </Box>
                  )}
                  {!settings.two_factor_enabled && (
                    <Alert variant="warning">
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <AlertTriangle className="h-4 w-4" />
                        <Text size="sm">Enable 2FA for enhanced account security</Text>
                      </Stack>
                    </Alert>
                  )}
                </Stack>
              </Card>
            </Grid>

            <Card className="p-6">
              <H2 className="mb-4 flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Active Sessions
              </H2>
              <Stack gap={3}>
                {settings.sessions.map((session) => (
                  <Box
                    key={session.id}
                    className={`p-4 rounded-card border-2 ${
                      session.is_current ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack direction="horizontal" gap={4} className="items-center">
                        <Monitor className="h-8 w-8 text-muted-foreground" />
                        <Stack gap={1}>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Body size="sm" className="font-weight-medium">
                              {session.device} - {session.browser}
                            </Body>
                            {session.is_current && <Badge variant="info">Current</Badge>}
                          </Stack>
                          <Body size="xs" className="text-muted-foreground">
                            {session.location} - Last active {formatDate(session.last_active)}
                          </Body>
                        </Stack>
                      </Stack>
                      {!session.is_current && (
                        <Button
                          variant="ghost"
                          onClick={() => revokeSession.mutate(session.id)}
                        >
                          <LogOut className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Card>

            <Card className="p-6">
              <H2 className="mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Login Activity
              </H2>
              <Stack gap={2}>
                {settings.login_history.map((login) => (
                  <Box
                    key={login.id}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-card"
                  >
                    <Stack direction="horizontal" gap={4} className="items-center">
                      <Box className={`w-2 h-2 rounded-avatar ${
                        login.status === 'success' ? 'bg-success' : 'bg-destructive'
                      }`} />
                      <Stack gap={0}>
                        <Body size="sm">{login.device}</Body>
                        <Body size="xs" className="text-muted-foreground">{login.location}</Body>
                      </Stack>
                    </Stack>
                    <Stack gap={0} className="text-right">
                      <Body size="sm" className="text-muted-foreground">{formatDate(login.date)}</Body>
                      <Badge variant={login.status === 'success' ? 'success' : 'error'}>
                        {login.status === 'success' ? 'Successful' : 'Failed'}
                      </Badge>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Card>

            <Modal open={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password">
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (passwordForm.new_password !== passwordForm.confirm) {
                    alert('Passwords do not match');
                    return;
                  }
                  updatePassword.mutate({
                    current: passwordForm.current,
                    new_password: passwordForm.new_password,
                  });
                }}
              >
                <Stack gap={4}>
                  <Stack gap={2}>
                    <Label>Current Password *</Label>
                    <Box className="relative">
                      <Input
                        type={showPasswords.current ? 'text' : 'password'}
                        value={passwordForm.current}
                        onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </Box>
                  </Stack>
                  <Stack gap={2}>
                    <Label>New Password *</Label>
                    <Box className="relative">
                      <Input
                        type={showPasswords.new_password ? 'text' : 'password'}
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                        required
                        minLength={8}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowPasswords({ ...showPasswords, new_password: !showPasswords.new_password })}
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                      >
                        {showPasswords.new_password ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </Box>
                    <Body size="xs" className="text-muted-foreground">Minimum 8 characters</Body>
                  </Stack>
                  <Stack gap={2}>
                    <Label>Confirm New Password *</Label>
                    <Box className="relative">
                      <Input
                        type={showPasswords.confirm ? 'text' : 'password'}
                        value={passwordForm.confirm}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </Box>
                  </Stack>
                  <Stack direction="horizontal" gap={3} className="justify-end pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowPasswordModal(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={updatePassword.isPending}>
                      {updatePassword.isPending ? 'Updating...' : 'Update Password'}
                    </Button>
                  </Stack>
                </Stack>
              </Form>
            </Modal>

            <Modal
              open={show2FAModal}
              onClose={() => setShow2FAModal(false)}
              title={`${settings.two_factor_enabled ? 'Disable' : 'Enable'} Two-Factor Authentication`}
            >
              <Body size="sm" className="text-muted-foreground mb-6">
                {settings.two_factor_enabled
                  ? 'Disabling 2FA will make your account less secure. Are you sure you want to continue?'
                  : 'Enable two-factor authentication to add an extra layer of security to your account.'}
              </Body>
              <Stack direction="horizontal" gap={3} className="justify-end">
                <Button variant="outline" onClick={() => setShow2FAModal(false)}>
                  Cancel
                </Button>
                <Button
                  variant={settings.two_factor_enabled ? 'destructive' : 'solid'}
                  onClick={() => toggle2FA.mutate(!settings.two_factor_enabled)}
                  disabled={toggle2FA.isPending}
                >
                  {toggle2FA.isPending
                    ? 'Processing...'
                    : settings.two_factor_enabled
                    ? 'Disable 2FA'
                    : 'Enable 2FA'}
                </Button>
              </Stack>
            </Modal>
          </Stack>
        </SettingsPageLayout>
  );
}
