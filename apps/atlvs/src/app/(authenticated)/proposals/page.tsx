'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, FileText, Eye, Send, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';
import { useProposals } from '@/hooks/useProposals';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground', icon: FileText },
  sent: { label: 'Sent', color: 'bg-primary/20 text-primary', icon: Send },
  viewed: { label: 'Viewed', color: 'bg-warning/20 text-warning', icon: Eye },
  accepted: { label: 'Accepted', color: 'bg-success/20 text-success', icon: CheckCircle },
  declined: { label: 'Declined', color: 'bg-destructive/20 text-destructive', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-muted text-muted-foreground', icon: Clock },
};

export default function ProposalsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, error } = useProposals({ status: statusFilter || undefined });

  const proposals = data?.proposals || [];

  const filteredProposals = searchQuery
    ? proposals.filter(
        (p: { title?: string; client_name?: string; proposal_number?: string }) =>
          p.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.proposal_number?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : proposals;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStats = () => {
    const stats = { total: proposals.length, draft: 0, sent: 0, accepted: 0, declined: 0, totalValue: 0 };
    proposals.forEach((p: { status: string; total_amount?: number }) => {
      if (p.status === 'draft') stats.draft++;
      else if (p.status === 'sent' || p.status === 'viewed') stats.sent++;
      else if (p.status === 'accepted') stats.accepted++;
      else if (p.status === 'declined') stats.declined++;
      if (p.total_amount) stats.totalValue += p.total_amount;
    });
    return stats;
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-card w-1/3" />
          <div className="h-64 bg-muted rounded-card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 text-destructive">
          Failed to load proposals. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground">Proposals</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Create and manage client proposals
          </p>
        </div>
        <Link
          href="/proposals/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Proposal
        </Link>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <p className="text-body-xs text-muted-foreground mb-1">Total Proposals</p>
          <p className="text-h3-md font-weight-bold text-foreground">{stats.total}</p>
        </div>
        <div className="bg-background border-2 border-muted rounded-card p-4">
          <p className="text-body-xs text-muted-foreground mb-1">Drafts</p>
          <p className="text-h3-md font-weight-bold text-muted-foreground">{stats.draft}</p>
        </div>
        <div className="bg-background border-2 border-primary/50 rounded-card p-4">
          <p className="text-body-xs text-muted-foreground mb-1">Sent/Pending</p>
          <p className="text-h3-md font-weight-bold text-primary">{stats.sent}</p>
        </div>
        <div className="bg-background border-2 border-success/50 rounded-card p-4">
          <p className="text-body-xs text-muted-foreground mb-1">Accepted</p>
          <p className="text-h3-md font-weight-bold text-success">{stats.accepted}</p>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <p className="text-body-xs text-muted-foreground mb-1">Total Value</p>
          <p className="text-h3-md font-weight-bold text-foreground">{formatCurrency(stats.totalValue)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search proposals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <Link
          href="/proposals/templates"
          className="px-3 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
        >
          Templates
        </Link>
      </div>

      {filteredProposals.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No proposals found
          </h3>
          <p className="text-body-sm text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search' : 'Create your first proposal'}
          </p>
          <Link
            href="/proposals/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm"
          >
            <Plus className="h-4 w-4" />
            New Proposal
          </Link>
        </div>
      )}

      {filteredProposals.length > 0 && (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => {
            const statusConfig = STATUS_CONFIG[proposal.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.draft;
            const StatusIcon = statusConfig.icon;
            const isExpiringSoon = proposal.valid_until && 
              new Date(proposal.valid_until) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            return (
              <a
                key={proposal.id}
                href={`/proposals/${proposal.id}`}
                className="block bg-background border-2 border-border rounded-card p-6 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-body-xs text-muted-foreground font-mono">
                        {proposal.proposal_number}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusConfig.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.label}
                      </span>
                      {isExpiringSoon && proposal.status !== 'accepted' && proposal.status !== 'declined' && (
                        <span className="px-2 py-1 bg-warning/20 text-warning rounded-badge text-body-xs font-weight-medium">
                          Expires Soon
                        </span>
                      )}
                    </div>
                    <h3 className="text-body-lg font-weight-semibold text-foreground mb-1">
                      {proposal.name || 'Untitled Proposal'}
                    </h3>
                    <p className="text-body-sm text-muted-foreground">
                      {proposal.contact ? `${proposal.contact.first_name} ${proposal.contact.last_name}` : 'No client'} 
                      {proposal.contact?.email && <span className="ml-2 text-body-xs">({proposal.contact.email})</span>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-h4-md font-weight-bold text-foreground">
                      {formatCurrency(proposal.total || 0)}
                    </p>
                    <p className="text-body-xs text-muted-foreground mt-1">
                      {proposal.viewed_at ? (
                        <>Viewed {new Date(proposal.viewed_at).toLocaleDateString()}</>
                      ) : proposal.sent_at ? (
                        <>Sent {new Date(proposal.sent_at).toLocaleDateString()}</>
                      ) : (
                        <>Created {new Date(proposal.created_at).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
