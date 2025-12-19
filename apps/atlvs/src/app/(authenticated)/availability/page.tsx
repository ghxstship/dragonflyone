'use client';

import { useState } from 'react';
import { Calendar, Search, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface SpaceAvailability {
  space_id: string;
  space_name: string;
  available: boolean;
  conflicts?: { type: string; name: string; time?: string }[];
  holds?: { id: string; priority: string; contact_name?: string; expires_at: string }[];
}

export default function AvailabilityPage() {
  const [dateRange, setDateRange] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['availability', dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
      });
      const res = await fetch(`/api/availability?${params}`);
      if (!res.ok) throw new Error('Failed to check availability');
      return res.json();
    },
    enabled: !!dateRange.start_date && !!dateRange.end_date,
  });

  const spaces: SpaceAvailability[] = data?.spaces || [];

  const filteredSpaces = searchQuery
    ? spaces.filter((s) => s.space_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : spaces;

  const availableCount = spaces.filter((s) => s.available).length;
  const unavailableCount = spaces.filter((s) => !s.available).length;
  const heldCount = spaces.filter((s) => s.holds && s.holds.length > 0).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground">Availability Checker</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Check space availability for specific dates
          </p>
        </div>
        <a
          href="/holds/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Hold
        </a>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-body-sm font-weight-medium text-foreground mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange({ ...dateRange, start_date: e.target.value })}
              className="px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-body-sm font-weight-medium text-foreground mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange({ ...dateRange, end_date: e.target.value })}
              className="px-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            Check Availability
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="text-body-sm text-muted-foreground">Total Spaces</span>
          </div>
          <p className="text-h3-md font-weight-bold text-foreground">{spaces.length}</p>
        </div>
        <div className="bg-background border-2 border-success/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <span className="text-body-sm text-muted-foreground">Available</span>
          </div>
          <p className="text-h3-md font-weight-bold text-success">{availableCount}</p>
        </div>
        <div className="bg-background border-2 border-destructive/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-5 w-5 text-destructive" />
            <span className="text-body-sm text-muted-foreground">Booked</span>
          </div>
          <p className="text-h3-md font-weight-bold text-destructive">{unavailableCount}</p>
        </div>
        <div className="bg-background border-2 border-warning/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-warning" />
            <span className="text-body-sm text-muted-foreground">On Hold</span>
          </div>
          <p className="text-h3-md font-weight-bold text-warning">{heldCount}</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Filter spaces..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>

      {isLoading && (
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-muted rounded-card" />
          <div className="h-24 bg-muted rounded-card" />
        </div>
      )}

      {error && (
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 text-destructive">
          Failed to check availability. Please try again.
        </div>
      )}

      {!isLoading && filteredSpaces.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No spaces found
          </h3>
          <p className="text-body-sm text-muted-foreground">
            Select a date range and click Check Availability
          </p>
        </div>
      )}

      {!isLoading && filteredSpaces.length > 0 && (
        <div className="space-y-4">
          {filteredSpaces.map((space) => (
            <div
              key={space.space_id}
              className={`bg-background border-2 rounded-card p-6 ${
                space.available ? 'border-success' : 
                space.holds?.length ? 'border-warning' : 'border-destructive'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-body-lg font-weight-semibold text-foreground">
                      {space.space_name}
                    </h3>
                    {space.available ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-success/20 text-success rounded-badge text-body-xs font-weight-medium">
                        <CheckCircle className="h-3 w-3" />
                        Available
                      </span>
                    ) : space.holds?.length ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-warning/20 text-warning rounded-badge text-body-xs font-weight-medium">
                        <Clock className="h-3 w-3" />
                        On Hold
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-destructive/20 text-destructive rounded-badge text-body-xs font-weight-medium">
                        <XCircle className="h-3 w-3" />
                        Booked
                      </span>
                    )}
                  </div>

                  {space.conflicts && space.conflicts.length > 0 && (
                    <div className="mt-2">
                      <p className="text-body-xs text-muted-foreground mb-1">Conflicts:</p>
                      {space.conflicts.map((conflict, idx) => (
                        <p key={idx} className="text-body-sm text-destructive">
                          {conflict.type}: {conflict.name} {conflict.time && `(${conflict.time})`}
                        </p>
                      ))}
                    </div>
                  )}

                  {space.holds && space.holds.length > 0 && (
                    <div className="mt-2">
                      <p className="text-body-xs text-muted-foreground mb-1">Active holds:</p>
                      {space.holds.map((hold) => (
                        <p key={hold.id} className="text-body-sm text-warning">
                          {hold.priority} hold {hold.contact_name && `by ${hold.contact_name}`} • 
                          Expires {new Date(hold.expires_at).toLocaleString()}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {space.available && (
                  <a
                    href={`/holds/new?space=${space.space_id}&date=${dateRange.start_date}`}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-button text-body-sm font-weight-medium hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Create Hold
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
