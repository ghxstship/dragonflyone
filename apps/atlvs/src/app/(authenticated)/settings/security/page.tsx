'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, Key, Smartphone, Monitor, Clock, AlertTriangle, Check, LogOut, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading security settings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-destructive" />
          <span className="text-destructive">Failed to load security settings</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/settings"
          className="p-2 hover:bg-muted rounded-button transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Security Settings
          </h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Manage your account security and active sessions
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Password Section */}
        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h4-md font-weight-semibold text-foreground flex items-center gap-2">
              <Key className="h-5 w-5" />
              Password
            </h2>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-3 py-1.5 text-body-sm text-primary hover:bg-primary/10 rounded-button transition-colors"
            >
              Change Password
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-card">
              <span className="text-body-sm text-foreground">Last changed</span>
              <span className="text-body-sm text-muted-foreground">
                {formatDate(settings.password_last_changed)}
              </span>
            </div>
            {daysSincePasswordChange() > 90 && (
              <div className="flex items-center gap-2 p-3 bg-warning/10 border-2 border-warning rounded-card">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-body-sm text-warning">
                  Your password is {daysSincePasswordChange()} days old. Consider updating it.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 2FA Section */}
        <div className="bg-background border-2 border-border rounded-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h4-md font-weight-semibold text-foreground flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Two-Factor Authentication
            </h2>
            <button
              onClick={() => setShow2FAModal(true)}
              className={`px-3 py-1.5 text-body-sm rounded-button transition-colors ${
                settings.two_factor_enabled
                  ? 'text-destructive hover:bg-destructive/10'
                  : 'text-primary hover:bg-primary/10'
              }`}
            >
              {settings.two_factor_enabled ? 'Disable' : 'Enable'}
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-card">
              <span className="text-body-sm text-foreground">Status</span>
              <span className={`flex items-center gap-1 text-body-sm ${
                settings.two_factor_enabled ? 'text-success' : 'text-muted-foreground'
              }`}>
                {settings.two_factor_enabled ? (
                  <>
                    <Check className="h-4 w-4" />
                    Enabled
                  </>
                ) : (
                  'Disabled'
                )}
              </span>
            </div>
            {settings.two_factor_enabled && settings.two_factor_method && (
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-card">
                <span className="text-body-sm text-foreground">Method</span>
                <span className="text-body-sm text-muted-foreground capitalize">
                  {settings.two_factor_method}
                </span>
              </div>
            )}
            {!settings.two_factor_enabled && (
              <div className="flex items-center gap-2 p-3 bg-warning/10 border-2 border-warning rounded-card">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span className="text-body-sm text-warning">
                  Enable 2FA for enhanced account security
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-background border-2 border-border rounded-card p-6">
        <h2 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          Active Sessions
        </h2>
        <div className="space-y-3">
          {settings.sessions.map((session) => (
            <div
              key={session.id}
              className={`p-4 rounded-card border-2 ${
                session.is_current ? 'border-primary bg-primary/5' : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Monitor className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="text-body-sm font-weight-medium text-foreground flex items-center gap-2">
                      {session.device} • {session.browser}
                      {session.is_current && (
                        <span className="text-body-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </p>
                    <p className="text-body-xs text-muted-foreground">
                      {session.location} • Last active {formatDate(session.last_active)}
                    </p>
                  </div>
                </div>
                {!session.is_current && (
                  <button
                    onClick={() => revokeSession.mutate(session.id)}
                    className="p-2 text-destructive hover:bg-destructive/10 rounded-button transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Login History */}
      <div className="bg-background border-2 border-border rounded-card p-6">
        <h2 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Login Activity
        </h2>
        <div className="space-y-2">
          {settings.login_history.map((login) => (
            <div
              key={login.id}
              className="flex items-center justify-between p-3 bg-muted/30 rounded-card"
            >
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-avatar ${
                  login.status === 'success' ? 'bg-success' : 'bg-destructive'
                }`} />
                <div>
                  <p className="text-body-sm text-foreground">{login.device}</p>
                  <p className="text-body-xs text-muted-foreground">{login.location}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-body-sm text-muted-foreground">{formatDate(login.date)}</p>
                <p className={`text-body-xs ${
                  login.status === 'success' ? 'text-success' : 'text-destructive'
                }`}>
                  {login.status === 'success' ? 'Successful' : 'Failed'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-md w-full mx-4">
            <h3 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
              <Key className="h-5 w-5" />
              Change Password
            </h3>
            <form
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
              className="space-y-4"
            >
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    required
                    className="w-full px-4 py-2 pr-10 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new_password ? 'text' : 'password'}
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    required
                    minLength={8}
                    className="w-full px-4 py-2 pr-10 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new_password: !showPasswords.new_password })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPasswords.new_password ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-body-xs text-muted-foreground mt-1">Minimum 8 characters</p>
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    required
                    className="w-full px-4 py-2 pr-10 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatePassword.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {updatePassword.isPending ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2FA Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-md w-full mx-4">
            <h3 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              {settings.two_factor_enabled ? 'Disable' : 'Enable'} Two-Factor Authentication
            </h3>
            <p className="text-body-sm text-muted-foreground mb-6">
              {settings.two_factor_enabled
                ? 'Disabling 2FA will make your account less secure. Are you sure you want to continue?'
                : 'Enable two-factor authentication to add an extra layer of security to your account.'}
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShow2FAModal(false)}
                className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => toggle2FA.mutate(!settings.two_factor_enabled)}
                disabled={toggle2FA.isPending}
                className={`px-4 py-2 rounded-button transition-colors disabled:opacity-50 ${
                  settings.two_factor_enabled
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                {toggle2FA.isPending
                  ? 'Processing...'
                  : settings.two_factor_enabled
                  ? 'Disable 2FA'
                  : 'Enable 2FA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
