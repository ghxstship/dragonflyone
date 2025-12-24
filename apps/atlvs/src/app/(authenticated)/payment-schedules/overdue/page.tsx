'use client';

import {
  Body,
  Button,
  H1,
  H3,
  Link,
  Text,
} from '@ghxstship/ui';

import { ArrowLeft, AlertTriangle, DollarSign, Send } from 'lucide-react';
import { useUpcomingPayments, useSendPaymentReminder } from '@/hooks/usePaymentSchedules';

export default function OverduePaymentsPage() {
  const { data, isLoading, error } = useUpcomingPayments(undefined, 0);
  const sendReminderMutation = useSendPaymentReminder();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getDaysOverdue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
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
          Failed to load overdue payments.
        </div>
      </div>
    );
  }

  const allMilestones = data?.milestones || [];
  const overdueMilestones = allMilestones.filter(
    (m) => m.status === 'overdue' || new Date(m.due_date) < new Date()
  );
  const totalOverdue = overdueMilestones.reduce((sum, m) => sum + (m.amount - m.paid_amount), 0);

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
          <H1 className="text-h2-md font-weight-bold text-foreground flex items-center gap-3">
            Overdue Payments
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            Payments that are past due and require attention
          </Body>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-background border-2 border-destructive/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <Text className="text-body-sm text-muted-foreground">Overdue Count</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-destructive">{overdueMilestones.length}</Body>
        </div>
        <div className="bg-background border-2 border-destructive/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-destructive" />
            <Text className="text-body-sm text-muted-foreground">Total Overdue</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-destructive">{formatCurrency(totalOverdue)}</Body>
        </div>
      </div>

      {overdueMilestones.length === 0 && (
        <div className="text-center py-12 bg-success/10 rounded-card border-2 border-success">
          <DollarSign className="h-12 w-12 text-success mx-auto mb-4" />
          <H3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No overdue payments
          </H3>
          <Body className="text-body-sm text-muted-foreground">
            All payments are current
          </Body>
        </div>
      )}

      {overdueMilestones.length > 0 && (
        <div className="space-y-4">
          {overdueMilestones
            .sort((a, b) => getDaysOverdue(b.due_date) - getDaysOverdue(a.due_date))
            .map((milestone) => {
              const daysOverdue = getDaysOverdue(milestone.due_date);
              const schedule = milestone.schedule;
              const contactEmail = schedule?.booking?.contact?.email;
              const amountDue = milestone.amount - milestone.paid_amount;

              return (
                <div
                  key={milestone.id}
                  className="bg-background border-2 border-destructive rounded-card p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <H3 className="text-body-lg font-weight-semibold text-foreground">
                          {milestone.milestone_name}
                        </H3>
                        <Text className="px-2 py-1 bg-destructive text-destructive-foreground rounded-badge text-body-xs font-weight-medium">
                          {daysOverdue} days overdue
                        </Text>
                      </div>
                      <Body className="text-body-sm text-muted-foreground">
                        {schedule?.booking?.event_name || schedule?.name || 'Untitled'} •{' '}
                        Was due {new Date(milestone.due_date).toLocaleDateString()}
                      </Body>
                      {contactEmail && (
                        <Body className="text-body-xs text-muted-foreground mt-1">
                          Contact: {contactEmail}
                        </Body>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Body className="text-h4-md font-weight-bold text-destructive">
                          {formatCurrency(amountDue)}
                        </Body>
                        <Body className="text-body-xs text-muted-foreground">
                          of {formatCurrency(milestone.amount)} total
                        </Body>
                      </div>
                      <div className="flex flex-col gap-2">
                        {contactEmail && (
                          <Button
                            onClick={() => handleSendReminder(schedule.id, contactEmail)}
                            disabled={sendReminderMutation.isPending}
                            className="inline-flex items-center gap-2 px-3 py-2 bg-destructive text-destructive-foreground rounded-button text-body-sm font-weight-medium hover:bg-destructive/90 transition-colors disabled:opacity-50"
                          >
                            <Send className="h-4 w-4" />
                            Send Reminder
                          </Button>
                        )}
                        <Link
                          href={`/payment-schedules/${schedule.id}`}
                          className="inline-flex items-center gap-2 px-3 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors text-center justify-center"
                        >
                          View Details
                        </Link>
                      </div>
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
