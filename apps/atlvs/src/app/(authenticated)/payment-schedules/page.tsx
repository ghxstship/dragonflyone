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
import { Plus, Search, Calendar, DollarSign, Clock, AlertTriangle, CheckCircle, Filter } from 'lucide-react';
import { usePaymentSchedules } from '@/hooks/usePaymentSchedules';

const STATUS_CONFIG = {
  active: { label: 'Active', color: 'bg-success/20 text-success' },
  pending: { label: 'Pending', color: 'bg-warning/20 text-warning' },
  completed: { label: 'Completed', color: 'bg-muted text-muted-foreground' },
  cancelled: { label: 'Cancelled', color: 'bg-destructive/20 text-destructive' },
};

export default function PaymentSchedulesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, error } = usePaymentSchedules();

  const allSchedules = data || [];
  const schedules = statusFilter
    ? allSchedules.filter((s) => s.status === statusFilter)
    : allSchedules;

  const filteredSchedules = searchQuery
    ? schedules.filter(
        (s) =>
          s.booking?.event_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : schedules;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getProgress = (schedule: { total_amount: number; amount_paid: number }) => {
    if (!schedule.total_amount) return 0;
    return Math.round((schedule.amount_paid / schedule.total_amount) * 100);
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
          Failed to load payment schedules. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <H1 className="text-h2-md font-weight-bold text-foreground">Payment Schedules</H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            Manage deposit and milestone payment schedules
          </Body>
        </div>
        <Link
          href="/payment-schedules/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Create Schedule
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by event or client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
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
        </div>
        <Link
          href="/payment-schedules/upcoming"
          className="px-3 py-2 border-2 border-warning text-warning rounded-button text-body-sm font-weight-medium hover:bg-warning/10 transition-colors"
        >
          <Clock className="h-4 w-4 inline mr-1" />
          Upcoming
        </Link>
        <Link
          href="/payment-schedules/overdue"
          className="px-3 py-2 border-2 border-destructive text-destructive rounded-button text-body-sm font-weight-medium hover:bg-destructive/10 transition-colors"
        >
          <AlertTriangle className="h-4 w-4 inline mr-1" />
          Overdue
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-primary" />
            <Text className="text-body-sm text-muted-foreground">Total Schedules</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-foreground">{schedules.length}</Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-success" />
            <Text className="text-body-sm text-muted-foreground">Total Expected</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-success">
            {formatCurrency(schedules.reduce((sum, s) => sum + (s.total_amount || 0), 0))}
          </Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            <Text className="text-body-sm text-muted-foreground">Total Collected</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-primary">
            {formatCurrency(schedules.reduce((sum, s) => sum + (s.amount_paid || 0), 0))}
          </Body>
        </div>
        <div className="bg-background border-2 border-border rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <Text className="text-body-sm text-muted-foreground">Outstanding</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-warning">
            {formatCurrency(schedules.reduce((sum, s) => 
              sum + ((s.total_amount || 0) - (s.amount_paid || 0)), 0))}
          </Body>
        </div>
      </div>

      {filteredSchedules.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <H3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No payment schedules found
          </H3>
          <Body className="text-body-sm text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search' : 'Create your first payment schedule'}
          </Body>
          <Link
            href="/payment-schedules/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm"
          >
            <Plus className="h-4 w-4" />
            Create Schedule
          </Link>
        </div>
      )}

      {filteredSchedules.length > 0 && (
        <div className="space-y-4">
          {filteredSchedules.map((schedule) => {
            const statusConfig = STATUS_CONFIG[schedule.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
            const progress = getProgress(schedule);
            const nextMilestone = schedule.milestones?.find((m) => m.status === 'pending');
            const milestoneName = nextMilestone?.milestone_name;

            return (
              <Link
                key={schedule.id}
                href={`/payment-schedules/${schedule.id}`}
                className="block bg-background border-2 border-border rounded-card p-6 hover:border-primary transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <H3 className="text-body-lg font-weight-semibold text-foreground">
                        {schedule.booking?.event_name || 'Untitled Event'}
                      </H3>
                      <Text className={`px-2 py-1 rounded-badge text-body-xs font-weight-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </Text>
                    </div>
                    <Body className="text-body-sm text-muted-foreground mt-1">
                      {schedule.booking?.contact?.first_name ? `${schedule.booking.contact.first_name} ${schedule.booking.contact.last_name}` : 'No client'} • {schedule.booking?.event_date 
                        ? new Date(schedule.booking.event_date).toLocaleDateString() 
                        : 'No date'}
                    </Body>
                  </div>
                  <div className="text-right">
                    <Body className="text-h4-md font-weight-bold text-foreground">
                      {formatCurrency(schedule.total_amount)}
                    </Body>
                    <Body className="text-body-xs text-muted-foreground">
                      {formatCurrency(schedule.amount_paid)} collected
                    </Body>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <Text className="text-body-xs text-muted-foreground">Payment Progress</Text>
                    <Text className="text-body-xs font-weight-medium">{progress}%</Text>
                  </div>
                  <div className="h-2 bg-muted rounded-badge overflow-hidden">
                    <div
                      className={`h-full ${progress >= 100 ? 'bg-success' : 'bg-primary'}`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>

                {nextMilestone && (
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-warning" />
                      <Text className="text-body-sm text-muted-foreground">
                        Next: {milestoneName}
                      </Text>
                    </div>
                    <div className="text-right">
                      <Text className="text-body-sm font-weight-medium text-foreground">
                        {formatCurrency(nextMilestone.amount)}
                      </Text>
                      <Text className="text-body-xs text-muted-foreground ml-2">
                        due {new Date(nextMilestone.due_date).toLocaleDateString()}
                      </Text>
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
