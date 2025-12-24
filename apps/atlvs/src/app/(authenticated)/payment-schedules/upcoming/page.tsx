'use client';

import {
  Body,
  Button,
  H1,
  H3,
  Link,
  Text,
} from '@ghxstship/ui';

import { ArrowLeft, Clock, DollarSign, AlertTriangle, Send } from 'lucide-react';
import { useUpcomingPayments, useSendPaymentReminder } from '@/hooks/usePaymentSchedules';

export default function UpcomingPaymentsPage() {
  const { data, isLoading, error } = useUpcomingPayments(undefined, 30);
  const sendReminderMutation = useSendPaymentReminder();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleSendReminder = async (scheduleId: string, email: string) => {
    await sendReminderMutation.mutateAsync({
      id: scheduleId,
      recipient_email: email,
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
          Failed to load upcoming payments.
        </div>
      </div>
    );
  }

  const milestones = data?.milestones || [];
  const summary = data?.summary;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/payment-schedules"
          className="p-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <H1 className="text-h2-md font-weight-bold text-foreground">Upcoming Payments</H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            Payments due in the next 30 days
          </Body>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-background border-2 border-border rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-primary" />
              <Text className="text-body-sm text-muted-foreground">Total Due</Text>
            </div>
            <Body className="text-h3-md font-weight-bold text-foreground">{summary.total_milestones}</Body>
          </div>
          <div className="bg-background border-2 border-border rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-success" />
              <Text className="text-body-sm text-muted-foreground">Amount Due</Text>
            </div>
            <Body className="text-h3-md font-weight-bold text-success">
              {formatCurrency(summary.total_amount_due)}
            </Body>
          </div>
          <div className="bg-background border-2 border-warning/50 rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-warning" />
              <Text className="text-body-sm text-muted-foreground">Due This Week</Text>
            </div>
            <Body className="text-h3-md font-weight-bold text-warning">{summary.due_this_week}</Body>
          </div>
          <div className="bg-background border-2 border-destructive/50 rounded-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <Text className="text-body-sm text-muted-foreground">Overdue</Text>
            </div>
            <Body className="text-h3-md font-weight-bold text-destructive">{summary.overdue}</Body>
          </div>
        </div>
      )}

      {milestones.length === 0 && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <H3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No upcoming payments
          </H3>
          <Body className="text-body-sm text-muted-foreground">
            All payments are up to date
          </Body>
        </div>
      )}

      {milestones.length > 0 && (
        <div className="space-y-4">
          {milestones.map((milestone) => {
            const daysUntil = getDaysUntilDue(milestone.due_date);
            const isOverdue = daysUntil < 0;
            const isDueSoon = daysUntil >= 0 && daysUntil <= 7;
            const schedule = milestone.schedule;
            const contactEmail = schedule?.booking?.contact?.email;

            return (
              <div
                key={milestone.id}
                className={`bg-background border-2 rounded-card p-6 ${
                  isOverdue ? 'border-destructive' : isDueSoon ? 'border-warning' : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <H3 className="text-body-lg font-weight-semibold text-foreground">
                        {milestone.milestone_name}
                      </H3>
                      {isOverdue && (
                        <Text className="px-2 py-1 bg-destructive text-destructive-foreground rounded-badge text-body-xs font-weight-medium">
                          {Math.abs(daysUntil)} days overdue
                        </Text>
                      )}
                      {isDueSoon && !isOverdue && (
                        <Text className="px-2 py-1 bg-warning/20 text-warning rounded-badge text-body-xs font-weight-medium">
                          Due in {daysUntil} days
                        </Text>
                      )}
                    </div>
                    <Body className="text-body-sm text-muted-foreground">
                      {schedule?.booking?.event_name || schedule?.name || 'Untitled'} •{' '}
                      Due {new Date(milestone.due_date).toLocaleDateString()}
                    </Body>
                    {contactEmail && (
                      <Body className="text-body-xs text-muted-foreground mt-1">
                        Contact: {contactEmail}
                      </Body>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Body className="text-h4-md font-weight-bold text-foreground">
                        {formatCurrency(milestone.amount)}
                      </Body>
                      {milestone.paid_amount > 0 && (
                        <Body className="text-body-xs text-success">
                          {formatCurrency(milestone.paid_amount)} paid
                        </Body>
                      )}
                    </div>
                    {contactEmail && (
                      <Button
                        onClick={() => handleSendReminder(schedule.id, contactEmail)}
                        disabled={sendReminderMutation.isPending}
                        className="inline-flex items-center gap-2 px-3 py-2 border-2 border-primary text-primary rounded-button text-body-sm font-weight-medium hover:bg-primary/10 transition-colors disabled:opacity-50"
                      >
                        <Send className="h-4 w-4" />
                        Remind
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
