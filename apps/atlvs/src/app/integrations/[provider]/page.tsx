'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, RefreshCw, Settings, Zap, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@ghxstship/ui';

interface IntegrationConfig {
  provider: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  last_sync?: string;
  settings: {
    key: string;
    label: string;
    value: string | boolean;
    type: 'text' | 'toggle' | 'select';
    options?: string[];
  }[];
  sync_options: {
    key: string;
    label: string;
    enabled: boolean;
  }[];
}

const MOCK_INTEGRATIONS: Record<string, IntegrationConfig> = {
  quickbooks: {
    provider: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync invoices, payments, and financial data with QuickBooks Online.',
    status: 'connected',
    last_sync: '2024-01-18T10:30:00',
    settings: [
      { key: 'company_id', label: 'Company ID', value: 'QBO-123456', type: 'text' },
      { key: 'auto_sync', label: 'Auto-sync enabled', value: true, type: 'toggle' },
      { key: 'sync_frequency', label: 'Sync Frequency', value: 'hourly', type: 'select', options: ['realtime', 'hourly', 'daily'] },
    ],
    sync_options: [
      { key: 'invoices', label: 'Invoices', enabled: true },
      { key: 'payments', label: 'Payments', enabled: true },
      { key: 'customers', label: 'Customers', enabled: false },
      { key: 'products', label: 'Products/Services', enabled: false },
    ],
  },
  stripe: {
    provider: 'stripe',
    name: 'Stripe',
    description: 'Process payments and manage subscriptions with Stripe.',
    status: 'connected',
    last_sync: '2024-01-18T11:00:00',
    settings: [
      { key: 'mode', label: 'Mode', value: 'live', type: 'select', options: ['live', 'test'] },
      { key: 'webhook_enabled', label: 'Webhooks enabled', value: true, type: 'toggle' },
    ],
    sync_options: [
      { key: 'payments', label: 'Payments', enabled: true },
      { key: 'customers', label: 'Customers', enabled: true },
      { key: 'subscriptions', label: 'Subscriptions', enabled: true },
    ],
  },
  mailchimp: {
    provider: 'mailchimp',
    name: 'Mailchimp',
    description: 'Sync contacts and automate email marketing campaigns.',
    status: 'disconnected',
    settings: [],
    sync_options: [],
  },
};

export default function IntegrationProviderPage() {
  const params = useParams();
  const provider = params.provider as string;
  const [integration] = useState<IntegrationConfig | null>(MOCK_INTEGRATIONS[provider] || null);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!integration) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
          <h2 className="text-h3-md font-weight-bold text-foreground mb-2">Integration Not Found</h2>
          <p className="text-body-sm text-muted-foreground mb-4">
            The integration &ldquo;{provider}&rdquo; could not be found.
          </p>
          <Link
            href="/integrations"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button text-body-sm font-weight-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Integrations
          </Link>
        </div>
      </div>
    );
  }

  const handleSync = async () => {
    setIsSyncing(true);
    // TODO: Call sync API
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/integrations"
          className="p-2 hover:bg-muted rounded-button transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div className="flex-1">
          <h1 className="text-h2-md font-weight-bold text-foreground">{integration.name}</h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            {integration.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {integration.status === 'connected' ? (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-success/20 text-success rounded-badge text-body-sm font-weight-medium">
              <CheckCircle className="h-4 w-4" />
              Connected
            </span>
          ) : integration.status === 'error' ? (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-destructive/20 text-destructive rounded-badge text-body-sm font-weight-medium">
              <XCircle className="h-4 w-4" />
              Error
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted text-muted-foreground rounded-badge text-body-sm font-weight-medium">
              <XCircle className="h-4 w-4" />
              Disconnected
            </span>
          )}
        </div>
      </div>

      {integration.status === 'connected' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background border-2 border-border rounded-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-primary" />
                <span className="text-body-sm text-muted-foreground">Last Sync</span>
              </div>
              <p className="text-body-lg font-weight-medium text-foreground">
                {integration.last_sync ? formatDate(integration.last_sync) : 'Never'}
              </p>
            </div>
            <div className="bg-background border-2 border-border rounded-card p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  <span className="text-body-sm text-muted-foreground">Manual Sync</span>
                </div>
                <p className="text-body-xs text-muted-foreground">
                  Trigger a full data sync now
                </p>
              </div>
              <Button
                variant="solid"
                size="sm"
                onClick={handleSync}
                disabled={isSyncing}
                isLoading={isSyncing}
                loadingText="Syncing..."
                icon={<RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />}
                iconPosition="left"
              >
                Sync Now
              </Button>
            </div>
          </div>

          {integration.settings.length > 0 && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="h-5 w-5 text-primary" />
                <h2 className="text-h4-md font-weight-semibold text-foreground">Settings</h2>
              </div>
              <div className="space-y-4">
                {integration.settings.map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <label className="text-body-sm font-weight-medium text-foreground">
                      {setting.label}
                    </label>
                    {setting.type === 'toggle' ? (
                      <button
                        className={`w-12 h-6 rounded-avatar transition-colors ${
                          setting.value ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <div 
                          className={`w-5 h-5 bg-white rounded-avatar shadow transition-transform ${
                            setting.value ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    ) : setting.type === 'select' ? (
                      <select
                        value={setting.value as string}
                        className="px-3 py-1.5 border-2 border-border rounded-button bg-background text-body-sm"
                      >
                        {setting.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-body-sm text-muted-foreground">
                        {setting.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {integration.sync_options.length > 0 && (
            <div className="bg-background border-2 border-border rounded-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-primary" />
                <h2 className="text-h4-md font-weight-semibold text-foreground">Sync Options</h2>
              </div>
              <div className="space-y-3">
                {integration.sync_options.map((option) => (
                  <div key={option.key} className="flex items-center justify-between py-2">
                    <span className="text-body-sm font-weight-medium text-foreground">
                      {option.label}
                    </span>
                    <button
                      className={`w-12 h-6 rounded-avatar transition-colors ${
                        option.enabled ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <div 
                        className={`w-5 h-5 bg-white rounded-avatar shadow transition-transform ${
                          option.enabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-destructive/5 border-2 border-destructive/20 rounded-card">
            <div>
              <h3 className="text-body-sm font-weight-semibold text-destructive">Disconnect Integration</h3>
              <p className="text-body-xs text-muted-foreground">
                This will stop all syncing and remove stored credentials
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Disconnect
            </Button>
          </div>
        </>
      )}

      {integration.status === 'disconnected' && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-h4-md font-weight-medium text-foreground mb-2">
            Connect {integration.name}
          </h3>
          <p className="text-body-sm text-muted-foreground mb-4 max-w-md mx-auto">
            {integration.description}
          </p>
          <Button variant="solid" size="sm" icon={<Zap className="h-4 w-4" />} iconPosition="left">
            Connect Now
          </Button>
        </div>
      )}
    </div>
  );
}
