'use client';

import { useState } from 'react';
import { Plus, Search, FileText, Clock, CheckCircle, Send, Calendar, Filter, Users } from 'lucide-react';
import { useBEOs } from '@/hooks/useBEOs';

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  pending_review: { label: 'Pending Review', color: 'bg-warning/20 text-warning' },
  approved: { label: 'Approved', color: 'bg-success/20 text-success' },
  distributed: { label: 'Distributed', color: 'bg-primary/20 text-primary' },
  executed: { label: 'Executed', color: 'bg-success text-success-foreground' },
  archived: { label: 'Archived', color: 'bg-muted text-muted-foreground' },
};

export default function BEOsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: '',
  });

  const { data, isLoading, error } = useBEOs({
    status: statusFilter || undefined,
    event_date_from: dateRange.from || undefined,
    event_date_to: dateRange.to || undefined,
  });

  const beos = data?.beos || [];

  const filteredBEOs = searchQuery
    ? beos.filter(
        (b) =>
          b.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.beo_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.venue_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : beos;

  const getStats = () => {
    return {
      total: beos.length,
      draft: beos.filter((b) => b.status === 'draft').length,
      pending: beos.filter((b) => b.status === 'pending_review').length,
      approved: beos.filter((b) => b.status === 'approved').length,
      distributed: beos.filter((b) => b.status === 'distributed').length,
    };
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
          Failed to load BEOs. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground">Banquet Event Orders</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Operational documents for production teams
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/beos/templates"
            className="px-4 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
          >
            Templates
          </a>
          <a
            href="/beos/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New BEO
          </a>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Total</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">{stats.total}</p>
        </div>
        <div className="bg-background border-2 border-muted rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span className="text-body-sm text-muted-foreground">Drafts</span>
          </div>
          <p className="text-h3-md font-weight-bold text-muted-foreground">{stats.draft}</p>
        </div>
        <div className="bg-background border-2 border-warning/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-warning" />
            <span className="text-body-sm text-muted-foreground">Pending</span>
          </div>
          <p className="text-h3-md font-weight-bold text-warning">{stats.pending}</p>
        </div>
        <div className="bg-background border-2 border-success/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <span className="text-body-sm text-muted-foreground">Approved</span>
          </div>
          <p className="text-h3-md font-weight-bold text-success">{stats.approved}</p>
        </div>
        <div className="bg-background border-2 border-primary/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Send className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Distributed</span>
          </div>
          <p className="text-h3-md font-weight-bold text-primary">{stats.distributed}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search BEOs..."
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
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="text-muted-foreground">to</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {filteredBEOs.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No BEOs found
          </h3>
          <p className="text-body-sm text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search' : 'Create your first BEO'}
          </p>
          <a
            href="/beos/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm"
          >
            <Plus className="h-4 w-4" />
            New BEO
          </a>
        </div>
      )}

      {filteredBEOs.length > 0 && (
        <div className="space-y-4">
          {filteredBEOs.map((beo) => {
            const statusConfig = STATUS_CONFIG[beo.status];

            return (
              <a
                key={beo.id}
                href={`/beos/${beo.id}`}
                className="block bg-background border-2 border-border rounded-card p-6 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-body-xs text-muted-foreground font-mono">
                        {beo.beo_number}
                      </span>
                      <span className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      <span className="px-2 py-1 bg-muted rounded-badge text-body-xs font-weight-medium">
                        v{beo.version}
                      </span>
                    </div>
                    <h3 className="text-body-lg font-weight-semibold text-foreground mb-1">
                      {beo.name}
                    </h3>
                    <p className="text-body-sm text-muted-foreground">
                      {beo.venue_name}
                      {beo.room_name && ` - ${beo.room_name}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-body-lg font-weight-bold text-foreground">
                      {new Date(beo.event_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                    <div className="flex items-center gap-2 justify-end mt-1">
                      {beo.event_start_time && (
                        <span className="text-body-xs text-muted-foreground">
                          {beo.event_start_time}
                        </span>
                      )}
                      {beo.guest_count && (
                        <span className="inline-flex items-center gap-1 text-body-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          {beo.guest_count}
                        </span>
                      )}
                    </div>
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
