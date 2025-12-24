'use client';

import {
  Body,
  Button,
  H1,
  H3,
  Link,
  Text,
} from '@ghxstship/ui';

import { ArrowLeft, AlertTriangle, Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useExpiringHolds, useUpdateHold, useReleaseHold, useConvertHold } from '@/hooks/useHolds';

export default function ExpiringHoldsPage() {
  const { data, isLoading, error, refetch } = useExpiringHolds('current', 48);
  const extendMutation = useUpdateHold();
  const releaseMutation = useReleaseHold();
  const convertMutation = useConvertHold();

  const holds = data?.holds || [];
  const expiredCount = data?.expired_count || 0;

  const handleExtend = async (holdId: string, days: number = 2) => {
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + days);
    await extendMutation.mutateAsync({ id: holdId, input: { expires_at: newExpiry.toISOString() } });
  };

  const handleRelease = async (holdId: string) => {
    if (confirm('Release this hold?')) {
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
          Failed to load expiring holds.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/holds"
            className="p-2 border-2 border-border rounded-button hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <H1 className="text-h2-md font-weight-bold text-foreground flex items-center gap-3">
              Expiring Holds
              <AlertTriangle className="h-6 w-6 text-warning" />
            </H1>
            <Body className="text-body-sm text-muted-foreground mt-1">
              Holds expiring in the next 48 hours
            </Body>
          </div>
        </div>
        <Button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 px-3 py-2 border-2 border-border rounded-button text-body-sm font-weight-medium hover:bg-muted transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-background border-2 border-warning/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-warning" />
            <Text className="text-body-sm text-muted-foreground">Expiring Soon</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-warning">{holds.length - expiredCount}</Body>
        </div>
        <div className="bg-background border-2 border-destructive/50 rounded-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <Text className="text-body-sm text-muted-foreground">Already Expired</Text>
          </div>
          <Body className="text-h3-md font-weight-bold text-destructive">{expiredCount}</Body>
        </div>
      </div>

      {holds.length === 0 && (
        <div className="text-center py-12 bg-success/10 rounded-card border-2 border-success">
          <CheckCircle className="h-12 w-12 text-success mx-auto mb-4" />
          <H3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No expiring holds
          </H3>
          <Body className="text-body-sm text-muted-foreground">
            All holds are safe for now
          </Body>
        </div>
      )}

      {holds.length > 0 && (
        <div className="space-y-4">
          {holds.map((hold) => {
            const isExpired = hold.is_expired;
            const contactName = hold.contact
              ? `${hold.contact.first_name} ${hold.contact.last_name}`
              : hold.lead
                ? `${hold.lead.first_name} ${hold.lead.last_name}`
                : 'No contact';

            return (
              <div
                key={hold.id}
                className={`bg-background border-2 rounded-card p-6 ${
                  isExpired ? 'border-destructive' : 'border-warning'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <H3 className="text-body-lg font-weight-semibold text-foreground">
                        {hold.space?.name || 'Unknown Space'}
                      </H3>
                      {isExpired ? (
                        <Text className="px-2 py-1 bg-destructive text-destructive-foreground rounded-badge text-body-xs font-weight-medium">
                          Expired
                        </Text>
                      ) : (
                        <Text className="px-2 py-1 bg-warning/20 text-warning rounded-badge text-body-xs font-weight-medium">
                          {hold.hours_until_expiry}h remaining
                        </Text>
                      )}
                    </div>
                    <Body className="text-body-sm text-muted-foreground">
                      {contactName} • {new Date(hold.hold_date).toLocaleDateString()}
                    </Body>
                    <Body className="text-body-xs text-muted-foreground mt-1">
                      Expires: {new Date(hold.expires_at).toLocaleString()}
                    </Body>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isExpired && (
                      <>
                        <Button
                          onClick={() => handleExtend(hold.id, 2)}
                          disabled={extendMutation.isPending}
                          className="inline-flex items-center gap-2 px-3 py-2 border-2 border-warning text-warning rounded-button text-body-sm font-weight-medium hover:bg-warning/10 transition-colors disabled:opacity-50"
                        >
                          <Clock className="h-4 w-4" />
                          +2 Days
                        </Button>
                        <Button
                          onClick={() => handleConvert(hold.id)}
                          disabled={convertMutation.isPending}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-button text-body-sm font-weight-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Convert
                        </Button>
                      </>
                    )}
                    <Button
                      onClick={() => handleRelease(hold.id)}
                      disabled={releaseMutation.isPending}
                      className="inline-flex items-center gap-2 px-3 py-2 border-2 border-destructive text-destructive rounded-button text-body-sm font-weight-medium hover:bg-destructive/10 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Release
                    </Button>
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
