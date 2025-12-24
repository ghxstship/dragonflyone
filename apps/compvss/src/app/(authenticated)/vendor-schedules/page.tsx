'use client';

import {
  Body,
  H1,
  H3,
  Input,
  Link,
  Select,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import { Plus, Search, Calendar, Clock, Truck, CheckCircle, AlertCircle, Filter } from 'lucide-react';
import { useVendorSchedules, type VendorSchedule } from '@/hooks/useVendorSchedules';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-warning/20 text-warning' },
  confirmed: { label: 'Confirmed', color: 'bg-success/20 text-success' },
  in_progress: { label: 'In Progress', color: 'bg-primary/20 text-primary' },
  completed: { label: 'Completed', color: 'bg-muted text-muted-foreground' },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/20 text-destructive' },
  no_show: { label: 'No Show', color: 'bg-destructive/20 text-destructive' },
};

const TYPE_CONFIG = {
  load_in: { label: 'Load In', icon: Truck },
  load_out: { label: 'Load Out', icon: Truck },
  setup: { label: 'Setup', icon: Clock },
  breakdown: { label: 'Breakdown', icon: Clock },
  service: { label: 'Service', icon: CheckCircle },
  standby: { label: 'Standby', icon: AlertCircle },
};

export default function VendorSchedulesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split('T')[0]);

  const { data, isLoading, error } = useVendorSchedules({
    status: statusFilter || undefined,
    type: typeFilter || undefined,
    start_date: dateFilter || undefined,
  });

  const schedules = data?.schedules || [];
  const groupedSchedules = data?.grouped || {};

  const filteredSchedules = searchQuery
    ? schedules.filter(
        (s) =>
          s.vendor?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.vendor?.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.booking?.event_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.location?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : schedules;

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
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
          Failed to load vendor schedules. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H1 className="text-h2-md font-weight-bold text-foreground">Vendor Schedules</H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            Coordinate vendor load-in, setup, and service times
          </Body>
        </div>
        <Link
          href="/vendor-schedules/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Schedule
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search vendors, events, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Status</option>
            {Object.entries(STATUS_CONFIG).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Types</option>
            {Object.entries(TYPE_CONFIG).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <Text className="text-body-sm text-muted-foreground">Today</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-foreground">
            {schedules.filter(s => {
              const today = new Date().toISOString().split('T')[0];
              return s.start_time.startsWith(today);
            }).length}
          </Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-warning" />
            <Text className="text-body-sm text-muted-foreground">Pending</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-warning">
            {schedules.filter(s => s.status === 'pending').length}
          </Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <Text className="text-body-sm text-muted-foreground">Confirmed</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-success">
            {schedules.filter(s => s.status === 'confirmed').length}
          </Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <Text className="text-body-sm text-muted-foreground">In Progress</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-foreground">
            {schedules.filter(s => s.status === 'in_progress').length}
          </Body>
        </div>
      </div>

      {filteredSchedules.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <H3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No schedules found
          </H3>
          <Body className="text-body-sm text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search or filters' : 'Add your first vendor schedule'}
          </Body>
          <Link
            href="/vendor-schedules/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm"
          >
            <Plus className="h-4 w-4" />
            Add Schedule
          </Link>
        </div>
      )}

      {filteredSchedules.length > 0 && (
        <div className="space-y-4">
          {Object.entries(groupedSchedules).map(([date, daySchedules]) => (
            <div key={date} className="bg-background border-2 border-border rounded-card overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <H3 className="text-body-sm font-weight-semibold text-foreground">
                  {formatDate(date)}
                </H3>
              </div>
              <div className="divide-y divide-border">
                {(daySchedules as VendorSchedule[]).map((schedule) => {
                  const statusConfig = STATUS_CONFIG[schedule.status];
                  const typeConfig = TYPE_CONFIG[schedule.schedule_type];
                  const TypeIcon = typeConfig?.icon || Clock;

                  return (
                    <Link
                      key={schedule.id}
                      href={`/vendor-schedules/${schedule.id}`}
                      className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-shrink-0 w-20 text-center">
                        <Body className="text-body-sm font-weight-semibold text-foreground">
                          {formatTime(schedule.start_time)}
                        </Body>
                        <Body className="text-body-xs text-muted-foreground">
                          {formatTime(schedule.end_time)}
                        </Body>
                      </div>

                      <div className="flex-shrink-0 p-2 bg-primary/10 rounded-card">
                        <TypeIcon className="h-5 w-5 text-primary" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Body className="text-body-sm font-weight-semibold text-foreground truncate">
                            {schedule.vendor?.company_name || schedule.vendor?.name || 'Unknown Vendor'}
                          </Body>
                          <Text className={`px-2 py-0.5 rounded-badge text-body-xs font-weight-medium ${statusConfig.color}`}>
                            {statusConfig.label}
                          </Text>
                        </div>
                        <Body className="text-body-xs text-muted-foreground truncate">
                          {typeConfig?.label} • {schedule.location || 'No location'}
                          {schedule.booking && ` • ${schedule.booking.event_name || schedule.booking.booking_number}`}
                        </Body>
                      </div>

                      <div className="flex-shrink-0 text-right">
                        {schedule.crew_count > 1 && (
                          <Body className="text-body-xs text-muted-foreground">
                            {schedule.crew_count} crew
                          </Body>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
