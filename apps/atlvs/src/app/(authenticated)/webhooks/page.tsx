'use client';

import { useState } from 'react';
import { Plus, Search, Webhook, Trash2, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useWebhooks, useDeleteWebhook, useTestWebhook } from '@/hooks/useWebhooks';


const EVENT_TYPES = [
  'booking.created',
  'booking.updated',
  'booking.cancelled',
  'invoice.created',
  'invoice.paid',
  'payment.received',
  'vendor_order.created',
  'vendor_order.approved',
];

export default function WebhooksPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error } = useWebhooks('current', true);
  const deleteMutation = useDeleteWebhook();
  const testMutation = useTestWebhook();

  const filteredWebhooks = data?.webhooks?.filter((webhook) => {
    return (
      !searchQuery ||
      webhook.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      webhook.url?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Delete webhook "${name}"? This action cannot be undone.`)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleTest = async (id: string) => {
    await testMutation.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-card w-1/3" />
          <div className="h-48 bg-muted rounded-card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 text-destructive">
          Failed to load webhooks. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground">Webhooks</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            Configure outgoing webhooks to integrate with external systems
          </p>
        </div>
        <a
          href="/webhooks/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Webhook
        </a>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search webhooks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {(!filteredWebhooks || filteredWebhooks.length === 0) && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <Webhook className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No webhooks configured
          </h3>
          <p className="text-body-sm text-muted-foreground mb-4">
            Create webhooks to send data to external systems when events occur.
          </p>
          <a
            href="/webhooks/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm"
          >
            <Plus className="h-4 w-4" />
            Create First Webhook
          </a>
        </div>
      )}

      {filteredWebhooks && filteredWebhooks.length > 0 && (
        <div className="bg-background border-2 border-border rounded-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Webhook
                </th>
                <th className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Events
                </th>
                <th className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Last Triggered
                </th>
                <th className="text-right px-4 py-3 text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredWebhooks.map((webhook) => {
                const isActive = webhook.is_active;
                const hasFailed = webhook.failure_count > 0;
                return (
                  <tr key={webhook.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-weight-medium text-foreground">{webhook.name}</p>
                        <p className="text-body-xs text-muted-foreground truncate max-w-xs">
                          {webhook.url}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {webhook.events?.slice(0, 2).map((event) => (
                          <span
                            key={event}
                            className="px-2 py-0.5 bg-muted rounded-badge text-body-xs"
                          >
                            {event}
                          </span>
                        ))}
                        {webhook.events && webhook.events.length > 2 && (
                          <span className="px-2 py-0.5 bg-muted rounded-badge text-body-xs">
                            +{webhook.events.length - 2} more
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-badge text-body-xs font-weight-medium ${isActive ? (hasFailed ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success') : 'bg-muted text-muted-foreground'}`}>
                        {isActive ? (hasFailed ? <Clock className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />) : <XCircle className="h-3 w-3" />}
                        {isActive ? (hasFailed ? 'Failing' : 'Active') : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-body-sm text-muted-foreground">
                      {webhook.last_triggered_at
                        ? new Date(webhook.last_triggered_at).toLocaleString()
                        : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleTest(webhook.id)}
                          disabled={testMutation.isPending}
                          className="p-2 border-2 border-border rounded-button hover:bg-muted transition-colors disabled:opacity-50"
                          title="Test webhook"
                        >
                          <RefreshCw className={`h-4 w-4 ${testMutation.isPending ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleDelete(webhook.id, webhook.name)}
                          disabled={deleteMutation.isPending}
                          className="p-2 border-2 border-destructive text-destructive rounded-button hover:bg-destructive/10 transition-colors disabled:opacity-50"
                          title="Delete webhook"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="bg-muted/30 border-2 border-border rounded-card p-6">
        <h2 className="text-h4-md font-weight-semibold text-foreground mb-4">Supported Events</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {EVENT_TYPES.map((event) => (
            <span key={event} className="px-3 py-2 bg-background border-2 border-border rounded-button text-body-sm">
              {event}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
