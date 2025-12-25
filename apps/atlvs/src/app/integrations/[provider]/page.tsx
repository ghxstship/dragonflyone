'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, RefreshCw, Settings, Zap, Clock, AlertTriangle } from 'lucide-react';
import {
  Body,
  Button,
  H1,
  H2,
  H3,
  Label,
  Select,
  Text,
  Skeleton,
  useNotifications,
} from '@ghxstship/ui';

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

const DEMO_INTEGRATIONS: Record<string, IntegrationConfig> = {
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

async function fetchIntegration(provider: string): Promise<IntegrationConfig | null> {
  const response = await fetch(`/api/integrations/${provider}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch integration');
  }
  return response.json();
}

export default function IntegrationProviderPage() {
  const params = useParams();
  const provider = params?.provider as string ?? '';
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { data: apiIntegration, isLoading, error: fetchError } = useQuery({
    queryKey: ['integration', provider],
    queryFn: () => fetchIntegration(provider),
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/integrations/${provider}/sync`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to sync');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration', provider] });
      addNotification({ type: 'success', title: 'Sync Complete', message: 'Integration data has been synced.' });
    },
    onError: () => {
      addNotification({ type: 'error', title: 'Sync Failed', message: 'Failed to sync integration data.' });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/integrations/${provider}/disconnect`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to disconnect');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integration', provider] });
      addNotification({ type: 'success', title: 'Disconnected', message: 'Integration has been disconnected.' });
    },
    onError: () => {
      addNotification({ type: 'error', title: 'Disconnect Failed', message: 'Failed to disconnect integration.' });
    },
  });

  // Use API data or fall back to demo data
  const integration = apiIntegration !== undefined ? apiIntegration : DEMO_INTEGRATIONS[provider] || null;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="flex-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!integration || fetchError) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-4" />
          <H2 className="text-h3-md font-weight-bold text-foreground mb-2">Integration Not Found</H2>
          <Body className="text-body-sm text-muted-foreground mb-4">
            {fetchError ? `Error: ${fetchError instanceof Error ? fetchError.message : 'Failed to load integration'}` : `The integration "${provider}" could not be found.`}
          </Body>
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

  const handleSync = () => {
    syncMutation.mutate();
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
          <H1 className="text-h2-md font-weight-bold text-foreground">{integration.name}</H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            {integration.description}
          </Body>
        </div>
        <div className="flex items-center gap-2">
          {integration.status === 'connected' ? (
            <Text className="inline-flex items-center gap-2 px-3 py-1.5 bg-success/20 text-success rounded-badge text-body-sm font-weight-medium">
              <CheckCircle className="h-4 w-4" />
              Connected
            </Text>
          ) : integration.status === 'error' ? (
            <Text className="inline-flex items-center gap-2 px-3 py-1.5 bg-destructive/20 text-destructive rounded-badge text-body-sm font-weight-medium">
              <XCircle className="h-4 w-4" />
              Error
            </Text>
          ) : (
            <Text className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted text-muted-foreground rounded-badge text-body-sm font-weight-medium">
              <XCircle className="h-4 w-4" />
              Disconnected
            </Text>
          )}
        </div>
      </div>

      {integration.status === 'connected' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background border-2 border-border rounded-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-primary" />
                <Text className="text-body-sm text-muted-foreground">Last Sync</Text>
              </div>
              <Body className="text-body-lg font-weight-medium text-foreground">
                {integration.last_sync ? formatDate(integration.last_sync) : 'Never'}
              </Body>
            </div>
            <div className="bg-background border-2 border-border rounded-card p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="h-5 w-5 text-primary" />
                  <Text className="text-body-sm text-muted-foreground">Manual Sync</Text>
                </div>
                <Body className="text-body-xs text-muted-foreground">
                  Trigger a full data sync now
                </Body>
              </div>
              <Button
                variant="solid"
                size="sm"
                onClick={handleSync}
                disabled={syncMutation.isPending}
                isLoading={syncMutation.isPending}
                loadingText="Syncing..."
                icon={<RefreshCw className={`h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />}
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
                <H2 className="text-h4-md font-weight-semibold text-foreground">Settings</H2>
              </div>
              <div className="space-y-4">
                {integration.settings.map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <Label className="text-body-sm font-weight-medium text-foreground">
                      {setting.label}
                    </Label>
                    {setting.type === 'toggle' ? (
                      <Button
                        className={`w-12 h-6 rounded-avatar transition-colors ${
                          setting.value ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <div 
                          className={`w-5 h-5 bg-white rounded-avatar shadow transition-transform ${
                            setting.value ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </Button>
                    ) : setting.type === 'select' ? (
                      <Select
                        value={setting.value as string}
                        className="px-3 py-1.5 border-2 border-border rounded-button bg-background text-body-sm"
                      >
                        {setting.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </Select>
                    ) : (
                      <Text className="text-body-sm text-muted-foreground">
                        {setting.value}
                      </Text>
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
                <H2 className="text-h4-md font-weight-semibold text-foreground">Sync Options</H2>
              </div>
              <div className="space-y-3">
                {integration.sync_options.map((option) => (
                  <div key={option.key} className="flex items-center justify-between py-2">
                    <Text className="text-body-sm font-weight-medium text-foreground">
                      {option.label}
                    </Text>
                    <Button
                      className={`w-12 h-6 rounded-avatar transition-colors ${
                        option.enabled ? 'bg-primary' : 'bg-muted'
                      }`}
                    >
                      <div 
                        className={`w-5 h-5 bg-white rounded-avatar shadow transition-transform ${
                          option.enabled ? 'translate-x-6' : 'translate-x-0.5'
                        }`}
                      />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-destructive/5 border-2 border-destructive/20 rounded-card">
            <div>
              <H3 className="text-body-sm font-weight-semibold text-destructive">Disconnect Integration</H3>
              <Body className="text-body-xs text-muted-foreground">
                This will stop all syncing and remove stored credentials
              </Body>
            </div>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => disconnectMutation.mutate()}
              disabled={disconnectMutation.isPending}
            >
              {disconnectMutation.isPending ? 'Disconnecting...' : 'Disconnect'}
            </Button>
          </div>
        </>
      )}

      {integration.status === 'disconnected' && (
        <div className="text-center py-12 bg-muted/30 rounded-card border-2 border-dashed border-border">
          <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <H3 className="text-h4-md font-weight-medium text-foreground mb-2">
            Connect {integration.name}
          </H3>
          <Body className="text-body-sm text-muted-foreground mb-4 max-w-md mx-auto">
            {integration.description}
          </Body>
          <Button variant="solid" size="sm" icon={<Zap className="h-4 w-4" />} iconPosition="left">
            Connect Now
          </Button>
        </div>
      )}
    </div>
  );
}
