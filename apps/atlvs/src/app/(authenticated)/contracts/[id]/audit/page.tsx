'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Shield, FileText, Pen, Eye, Send, XCircle, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface AuditEvent {
  id: string;
  type: 'action' | 'signature';
  action: string;
  details: Record<string, unknown>;
  actor?: {
    id: string;
    full_name: string;
    email: string;
  };
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
}

interface AuditResponse {
  contract_id: string;
  contract_title: string;
  events: AuditEvent[];
  total: number;
}

const ACTION_ICONS: Record<string, typeof FileText> = {
  created: FileText,
  updated: Pen,
  sent: Send,
  viewed: Eye,
  signed: Pen,
  voided: XCircle,
  default: Clock,
};

const ACTION_COLORS: Record<string, string> = {
  created: 'bg-info-100 text-info-600',
  updated: 'bg-warning-100 text-warning-600',
  sent: 'bg-violet-100 text-violet-600',
  viewed: 'bg-ink-100 text-ink-600',
  signed: 'bg-success-100 text-success-600',
  voided: 'bg-error-100 text-error-600',
  default: 'bg-ink-100 text-ink-600',
};

export default function ContractAuditPage() {
  const params = useParams();
  const contractId = params.id as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ['contract-audit', contractId],
    queryFn: async () => {
      const response = await fetch(`/api/contracts/${contractId}/audit`);
      if (!response.ok) {
        throw new Error('Failed to fetch audit trail');
      }
      return response.json() as Promise<AuditResponse>;
    },
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getActionIcon = (action: string) => {
    return ACTION_ICONS[action] || ACTION_ICONS.default;
  };

  const getActionColor = (action: string) => {
    return ACTION_COLORS[action] || ACTION_COLORS.default;
  };

  const formatAction = (action: string) => {
    return action.charAt(0).toUpperCase() + action.slice(1).replace(/_/g, ' ');
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading audit trail...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <p className="text-destructive">Failed to load audit trail</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/contracts/${contractId}`}
          className="p-2 hover:bg-muted rounded-button transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Audit Trail
          </h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            {data?.contract_title}
          </p>
        </div>
      </div>

      <div className="bg-background border-2 border-border rounded-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h4-md font-weight-semibold text-foreground">
            Activity History
          </h2>
          <span className="text-body-sm text-muted-foreground">
            {data?.total || 0} events
          </span>
        </div>

        {!data?.events || data.events.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
            <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-body-sm text-muted-foreground">No audit events recorded</p>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-6">
              {data.events.map((event) => {
                const Icon = getActionIcon(event.action);
                const colorClass = getActionColor(event.action);
                
                return (
                  <div key={event.id} className="relative flex gap-4">
                    <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-avatar ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-body-md font-weight-medium text-foreground">
                            {formatAction(event.action)}
                          </p>
                          {event.actor && (
                            <p className="text-body-sm text-muted-foreground">
                              by {event.actor.full_name || event.actor.email}
                            </p>
                          )}
                          {event.type === 'signature' && event.details && (
                            <p className="text-body-sm text-muted-foreground">
                              Signer: {String(event.details.signer_name || event.details.signer_email)}
                            </p>
                          )}
                        </div>
                        <span className="text-body-xs text-muted-foreground">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                      {event.details && Object.keys(event.details).length > 0 && event.type === 'action' && (
                        <div className="mt-2 p-3 bg-muted/30 rounded-card">
                          <pre className="text-body-xs text-muted-foreground overflow-x-auto">
                            {JSON.stringify(event.details, null, 2)}
                          </pre>
                        </div>
                      )}
                      {event.ip_address && (
                        <p className="text-body-xs text-muted-foreground mt-1">
                          IP: {event.ip_address}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
