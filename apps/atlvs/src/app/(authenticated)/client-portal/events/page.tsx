'use client';

import {
  Body,
  H1,
  H3,
  Input,
  Select,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Calendar, MapPin, Users, Clock, ArrowRight, Filter } from 'lucide-react';
import { useClientPortalEvents } from '@/hooks/useClientPortal';

export default function ClientPortalEventsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // In a real implementation, the token would come from auth context
  const token = typeof window !== 'undefined' ? localStorage.getItem('portal_token') : null;
  const { data, isLoading, error } = useClientPortalEvents(token || undefined);

  const events = data?.events || [];

  const filteredEvents = events.filter((event) => {
    const matchesSearch = 
      event.event_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.booking_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { label: 'Confirmed', color: 'bg-success/20 text-success' };
      case 'pending':
        return { label: 'Pending', color: 'bg-warning/20 text-warning' };
      case 'completed':
        return { label: 'Completed', color: 'bg-muted text-muted-foreground' };
      case 'cancelled':
        return { label: 'Cancelled', color: 'bg-destructive/20 text-destructive' };
      default:
        return { label: status, color: 'bg-muted text-muted-foreground' };
    }
  };

  const upcomingEvents = events.filter((e) => new Date(e.event_date) >= new Date()).length;
  const pastEvents = events.filter((e) => new Date(e.event_date) < new Date()).length;

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <Body className="text-destructive">Failed to load events</Body>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H1 className="text-h2-md font-weight-bold text-foreground">My Events</H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            View and manage your booked events
          </Body>
        </div>
        <Link
          href="/client-portal"
          className="text-body-sm text-primary hover:underline"
        >
          Back to Portal
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <Text className="text-body-sm text-muted-foreground">Total Events</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-foreground">{events.length}</Body>
        </div>
        <div className="bg-background border-2 border-success/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-success" />
            <Text className="text-body-sm text-muted-foreground">Upcoming</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-success">{upcomingEvents}</Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <Text className="text-body-sm text-muted-foreground">Past</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-foreground">{pastEvents}</Body>
        </div>
      </div>

      <div className="bg-background border-2 border-border rounded-card">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search events..."
              className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </Select>
          </div>
        </div>

        <div className="divide-y divide-border">
          {filteredEvents.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No events found
            </div>
          ) : (
            filteredEvents.map((event) => {
              const statusConfig = getStatusConfig(event.status);
              return (
                <div key={event.id} className="p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-card flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <H3 className="text-body-sm font-weight-semibold text-foreground">
                          {event.event_name || event.booking_number}
                        </H3>
                        <Body className="text-body-xs text-muted-foreground mt-1">
                          {event.event_type} • {event.booking_number}
                        </Body>
                        <div className="flex items-center gap-4 mt-2 text-body-xs text-muted-foreground">
                          <Text className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(event.event_date)}
                          </Text>
                          {event.start_time && (
                            <Text className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {event.start_time} - {event.end_time}
                            </Text>
                          )}
                          {event.guest_count_expected && (
                            <Text className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {event.guest_count_expected} guests
                            </Text>
                          )}
                        </div>
                        {event.venue && (
                          <Body className="text-body-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.venue.name}
                          </Body>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Text className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </Text>
                      <Link
                        href={`/client-portal/events/${event.id}`}
                        className="p-2 hover:bg-muted rounded-button transition-colors"
                      >
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
