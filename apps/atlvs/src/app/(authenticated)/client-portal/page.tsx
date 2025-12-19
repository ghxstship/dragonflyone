'use client';

import { useState } from 'react';
import { Search, Users, Calendar, Clock, Mail, ExternalLink } from 'lucide-react';
import { useClientPortalAccess, useSendPortalInvite } from '@/hooks/useClientPortal';

interface PortalAccess {
  id: string;
  client_name: string;
  client_email: string;
  status: 'active' | 'pending' | 'expired';
  last_login?: string;
  events_count: number;
  created_at: string;
}

export default function ClientPortalPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const { data, isLoading, error } = useClientPortalAccess();
  const sendInvite = useSendPortalInvite();

  const accesses: PortalAccess[] = data?.accesses || [];

  const filteredAccesses = accesses.filter((access) =>
    access.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    access.client_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleSendInvite = async () => {
    if (!inviteEmail) return;
    try {
      await sendInvite.mutateAsync({ email: inviteEmail });
      setInviteEmail('');
      setShowInviteModal(false);
    } catch (err) {
      console.error('Failed to send invite:', err);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { label: 'Active', color: 'bg-success/20 text-success' };
      case 'pending':
        return { label: 'Pending', color: 'bg-warning/20 text-warning' };
      case 'expired':
        return { label: 'Expired', color: 'bg-muted text-muted-foreground' };
      default:
        return { label: status, color: 'bg-muted text-muted-foreground' };
    }
  };

  const activeCount = accesses.filter((a) => a.status === 'active').length;
  const pendingCount = accesses.filter((a) => a.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading client portal...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <p className="text-destructive">Failed to load client portal access</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground">Client Portal</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Manage client access to their self-service portal
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
        >
          <Mail className="h-4 w-4" />
          Send Invite
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Total Clients</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">{accesses.length}</p>
        </div>
        <div className="bg-background border-2 border-success/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-success" />
            <span className="text-body-sm text-muted-foreground">Active</span>
          </div>
          <p className="text-h3-md font-weight-bold text-success">{activeCount}</p>
        </div>
        <div className="bg-background border-2 border-warning/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-warning" />
            <span className="text-body-sm text-muted-foreground">Pending</span>
          </div>
          <p className="text-h3-md font-weight-bold text-warning">{pendingCount}</p>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Total Events</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">
            {accesses.reduce((sum, a) => sum + a.events_count, 0)}
          </p>
        </div>
      </div>

      <div className="bg-background border-2 border-border rounded-card">
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients..."
              className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="divide-y divide-border">
          {filteredAccesses.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No client portal access found
            </div>
          ) : (
            filteredAccesses.map((access) => {
              const statusConfig = getStatusConfig(access.status);
              return (
                <div key={access.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-avatar flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-body-sm font-weight-medium text-foreground">{access.client_name}</p>
                      <p className="text-body-xs text-muted-foreground">{access.client_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-body-lg font-weight-bold text-foreground">{access.events_count}</p>
                      <p className="text-body-xs text-muted-foreground">Events</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      {access.last_login && (
                        <p className="text-body-xs text-muted-foreground mt-1">
                          Last login: {formatDate(access.last_login)}
                        </p>
                      )}
                    </div>
                    <button className="p-2 hover:bg-muted rounded-button transition-colors">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border-2 border-border rounded-card p-6 w-full max-w-md">
            <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">
              Send Portal Invite
            </h2>
            <p className="text-body-sm text-muted-foreground mb-4">
              Send an invitation to a client to access their self-service portal.
            </p>
            <div className="mb-6">
              <label className="block text-body-sm font-weight-medium text-foreground mb-1">
                Client Email
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="client@example.com"
                className="w-full px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowInviteModal(false)}
                className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendInvite}
                disabled={!inviteEmail || sendInvite.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary text-body-sm font-weight-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <Mail className="h-4 w-4" />
                {sendInvite.isPending ? 'Sending...' : 'Send Invite'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
