'use client';

import { useState } from 'react';
import { Plus, Search, Calendar, Clock, AlertTriangle, CheckCircle, XCircle, Filter, ArrowRight } from 'lucide-react';
import { useHolds, useReleaseHold, useConvertHold } from '@/hooks/useHolds';

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-success/20 text-success' },
  expired: { label: 'Expired', color: 'bg-destructive/20 text-destructive' },
  released: { label: 'Released', color: 'bg-muted text-muted-foreground' },
  converted: { label: 'Converted', color: 'bg-primary/20 text-primary' },
};

const PRIORITY_CONFIG = {
  first_right: { label: 'First Right', color: 'bg-warning text-warning-foreground' },
  standard: { label: 'Standard', color: 'bg-muted text-muted-foreground' },
  low: { label: 'Low', color: 'bg-muted text-muted-foreground' },
};

export default function HoldsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active');

  const { data, isLoading, error } = useHolds({ 
    organization_id: 'current', 
    status: statusFilter || undefined 
  });
  const releaseMutation = useReleaseHold();
  const convertMutation = useConvertHold();

  const holds = data?.holds || [];

  const filteredHolds = searchQuery
    ? holds.filter(
        (h) =>
          h.space?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.contact?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          h.contact?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : holds;

  const getExpiryInfo = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMs < 0) {
      return { text: 'Expired', isExpired: true, isExpiringSoon: false };
    } else if (diffHours < 24) {
      return { text: `${diffHours}h left`, isExpired: false, isExpiringSoon: true };
    } else {
      return { text: `${diffDays}d left`, isExpired: false, isExpiringSoon: diffDays <= 2 };
    }
  };

  const handleRelease = async (holdId: string) => {
    if (confirm('Release this hold? The space will become available for booking.')) {
      await releaseMutation.mutateAsync(holdId);
    }
  };

  const handleConvert = async (holdId: string) => {
    await convertMutation.mutateAsync({ id: holdId, input: {} });
  };

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
          Failed to load holds. Please try again.
        </div>
      </div>
    );
  }

  const activeCount = holds.filter((h) => h.status === 'active').length;
  const expiringCount = holds.filter((h) => {
    if (h.status !== 'active') return false;
    const info = getExpiryInfo(h.expires_at);
    return info.isExpiringSoon;
  }).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground">Space Holds</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Manage temporary space reservations
          </p>
        </div>
        <div className="flex items-center gap-2">
          {expiringCount > 0 && (
            <a
              href="/holds/expiring"
              className="inline-flex items-center gap-2 px-4 py-2 bg-warning/10 text-warning border-2 border-warning rounded-button font-weight-medium text-body-sm hover:bg-warning/20 transition-colors"
            >
              <AlertTriangle className="h-4 w-4" />
              {expiringCount} Expiring
            </a>
          )}
          <a
            href="/holds/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Hold
          </a>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Total Holds</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">{holds.length}</p>
        </div>
        <div className="bg-background border-2 border-success/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <span className="text-body-sm text-muted-foreground">Active</span>
          </div>
          <p className="text-h3-md font-weight-bold text-success">{activeCount}</p>
        </div>
        <div className="bg-background border-2 border-warning/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-warning" />
            <span className="text-body-sm text-muted-foreground">Expiring Soon</span>
          </div>
          <p className="text-h3-md font-weight-bold text-warning">{expiringCount}</p>
        </div>
        <div className="bg-background border-2 border-primary/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <ArrowRight className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Converted</span>
          </div>
          <p className="text-h3-md font-weight-bold text-primary">
            {holds.filter((h) => h.status === 'converted').length}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by space or contact..."
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
        <a
          href="/availability"
          className="px-3 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
        >
          Check Availability
        </a>
      </div>

      {filteredHolds.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No holds found
          </h3>
          <p className="text-body-sm text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search' : 'Create a hold to reserve a space temporarily'}
          </p>
          <a
            href="/holds/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm"
          >
            <Plus className="h-4 w-4" />
            New Hold
          </a>
        </div>
      )}

      {filteredHolds.length > 0 && (
        <div className="space-y-4">
          {filteredHolds.map((hold) => {
            const statusConfig = STATUS_CONFIG[hold.status];
            const priorityConfig = PRIORITY_CONFIG[hold.priority];
            const expiryInfo = getExpiryInfo(hold.expires_at);
            const contactName = hold.contact
              ? `${hold.contact.first_name} ${hold.contact.last_name}`
              : hold.lead
                ? `${hold.lead.first_name} ${hold.lead.last_name}`
                : 'No contact';

            return (
              <div
                key={hold.id}
                className={`bg-background border-2 rounded-card p-6 ${
                  expiryInfo.isExpired ? 'border-destructive' :
                  expiryInfo.isExpiringSoon ? 'border-warning' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-body-lg font-weight-semibold text-foreground">
                        {hold.space?.name || 'Unknown Space'}
                      </h3>
                      <span className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      <span className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${priorityConfig.color}`}>
                        {priorityConfig.label}
                      </span>
                      {hold.status === 'active' && (
                        <span className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${
                          expiryInfo.isExpired ? 'bg-destructive text-destructive-foreground' :
                          expiryInfo.isExpiringSoon ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground'
                        }`}>
                          {expiryInfo.text}
                        </span>
                      )}
                    </div>
                    <p className="text-body-sm text-muted-foreground">
                      {contactName} • {new Date(hold.hold_date).toLocaleDateString()}
                      {hold.start_time && ` • ${hold.start_time}`}
                      {hold.end_time && ` - ${hold.end_time}`}
                    </p>
                    {hold.notes && (
                      <p className="text-body-xs text-muted-foreground mt-2">{hold.notes}</p>
                    )}
                  </div>
                  {hold.status === 'active' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleConvert(hold.id)}
                        disabled={convertMutation.isPending}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-button text-body-sm font-weight-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Convert to Booking
                      </button>
                      <button
                        onClick={() => handleRelease(hold.id)}
                        disabled={releaseMutation.isPending}
                        className="inline-flex items-center gap-2 px-3 py-2 border-2 border-destructive text-destructive rounded-button text-body-sm font-weight-medium hover:bg-destructive/10 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Release
                      </button>
                    </div>
                  )}
                  {hold.status === 'converted' && hold.converted_to_booking_id && (
                    <a
                      href={`/bookings/${hold.converted_to_booking_id}`}
                      className="inline-flex items-center gap-2 px-3 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
                    >
                      View Booking
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
