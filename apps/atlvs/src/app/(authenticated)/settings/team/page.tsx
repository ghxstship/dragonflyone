'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Users, Mail, Shield, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface TeamMember {
  id: string;
  email: string;
  full_name?: string;
  role: 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
  status: 'active' | 'pending' | 'disabled';
  avatar_url?: string;
  last_login_at?: string;
  created_at: string;
}

const ROLES = [
  { id: 'owner', label: 'Owner', description: 'Full access to all settings' },
  { id: 'admin', label: 'Admin', description: 'Manage team and settings' },
  { id: 'manager', label: 'Manager', description: 'Manage bookings and events' },
  { id: 'member', label: 'Member', description: 'View and edit assigned items' },
  { id: 'viewer', label: 'Viewer', description: 'Read-only access' },
];

export default function TeamSettingsPage() {
  const queryClient = useQueryClient();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');

  const { data, isLoading, error } = useQuery({
    queryKey: ['team-members'],
    queryFn: async () => {
      const response = await fetch('/api/team');
      if (!response.ok) {
        return { members: [] };
      }
      return response.json();
    },
  });

  const members: TeamMember[] = data?.members || [];

  const inviteMember = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: string }) => {
      const response = await fetch('/api/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      if (!response.ok) throw new Error('Failed to send invite');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('member');
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const response = await fetch(`/api/team/${memberId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove member');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
  });

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-destructive">Error loading team members. Please try again.</div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-800';
      case 'pending':
        return 'bg-warning-100 text-warning-800';
      case 'disabled':
        return 'bg-ink-100 text-ink-800';
      default:
        return 'bg-ink-100 text-ink-800';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading team...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/settings"
            className="p-2 hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-h2-md font-weight-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6" />
              Team Members
            </h1>
            <p className="text-body-sm text-muted-foreground mt-1">
              Manage your team and their permissions
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span className="text-body-sm font-weight-medium">Invite Member</span>
        </button>
      </div>

      <div className="bg-background border-2 border-border rounded-card overflow-hidden">
        <div className="px-4 py-3 bg-muted/30 border-b border-border">
          <div className="grid grid-cols-12 gap-4 text-body-sm font-weight-medium text-muted-foreground">
            <div className="col-span-4">Member</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-3">Last Active</div>
            <div className="col-span-1"></div>
          </div>
        </div>
        {members.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-body-sm">No team members yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {members.map((member) => (
              <div key={member.id} className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-muted/10">
                <div className="col-span-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-avatar bg-primary/10 flex items-center justify-center text-primary font-weight-medium">
                    {member.full_name?.charAt(0) || member.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-body-sm font-weight-medium text-foreground">
                      {member.full_name || member.email}
                    </p>
                    <p className="text-body-xs text-muted-foreground">{member.email}</p>
                  </div>
                </div>
                <div className="col-span-2">
                  <span className="text-body-sm text-foreground capitalize">{member.role}</span>
                </div>
                <div className="col-span-2">
                  <span className={`px-2 py-0.5 text-body-xs rounded capitalize ${getStatusBadge(member.status)}`}>
                    {member.status}
                  </span>
                </div>
                <div className="col-span-3">
                  <span className="text-body-sm text-muted-foreground">
                    {member.last_login_at ? formatDate(member.last_login_at) : 'Never'}
                  </span>
                </div>
                <div className="col-span-1 flex justify-end">
                  {member.role !== 'owner' && (
                    <button
                      onClick={() => {
                        if (confirm('Remove this team member?')) {
                          removeMember.mutate(member.id);
                        }
                      }}
                      className="p-1.5 hover:bg-destructive/10 rounded-button transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <h2 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Role Permissions
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {ROLES.map((role) => (
            <div key={role.id} className="p-3 bg-muted/30 rounded-card">
              <p className="text-body-sm font-weight-medium text-foreground">{role.label}</p>
              <p className="text-body-xs text-muted-foreground">{role.description}</p>
            </div>
          ))}
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 max-w-md w-full mx-4">
            <h3 className="text-h4-md font-weight-semibold text-foreground mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Invite Team Member
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                inviteMember.mutate({ email: inviteEmail, role: inviteRole });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  placeholder="colleague@company.com"
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-border rounded-button focus:outline-none focus:border-primary"
                >
                  {ROLES.filter((r) => r.id !== 'owner').map((role) => (
                    <option key={role.id} value={role.id}>{role.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteMember.isPending || !inviteEmail}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {inviteMember.isPending ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
