'use client';

import {
  Body,
  Button,
  H1,
  H3,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Globe, Check, ExternalLink, Settings, Zap, CreditCard, PieChart, Calendar, Mail, Cloud, Hexagon, MessageSquare, Smartphone, type LucideIcon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ICON_MAP: Record<string, LucideIcon> = {
  CreditCard,
  PieChart,
  Calendar,
  Mail,
  Cloud,
  Hexagon,
  MessageSquare,
  Smartphone,
  Zap,
};

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof ICON_MAP;
  category: 'payments' | 'calendar' | 'crm' | 'marketing' | 'communication';
  is_connected: boolean;
  connected_at?: string;
  settings_url?: string;
}

const INTEGRATIONS: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Accept payments and manage subscriptions',
    icon: 'CreditCard',
    category: 'payments',
    is_connected: false,
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks',
    description: 'Sync invoices and financial data',
    icon: 'PieChart',
    category: 'payments',
    is_connected: false,
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync events and bookings',
    icon: 'Calendar',
    category: 'calendar',
    is_connected: false,
  },
  {
    id: 'outlook',
    name: 'Outlook Calendar',
    description: 'Sync with Microsoft 365',
    icon: 'Mail',
    category: 'calendar',
    is_connected: false,
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Sync contacts and opportunities',
    icon: 'Cloud',
    category: 'crm',
    is_connected: false,
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Marketing automation and CRM',
    icon: 'Hexagon',
    category: 'crm',
    is_connected: false,
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'Email marketing campaigns',
    icon: 'Mail',
    category: 'marketing',
    is_connected: false,
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Team notifications and alerts',
    icon: 'MessageSquare',
    category: 'communication',
    is_connected: false,
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: 'SMS notifications',
    icon: 'Smartphone',
    category: 'communication',
    is_connected: false,
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect with 3000+ apps',
    icon: 'Zap',
    category: 'marketing',
    is_connected: false,
  },
];

const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'payments', name: 'Payments' },
  { id: 'calendar', name: 'Calendar' },
  { id: 'crm', name: 'CRM' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'communication', name: 'Communication' },
];

export default function IntegrationsPage() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['integrations'],
    queryFn: async () => {
      const response = await fetch('/api/settings/integrations');
      if (!response.ok) {
        return { integrations: INTEGRATIONS };
      }
      return response.json();
    },
  });

  const integrations: Integration[] = data?.integrations || INTEGRATIONS;

  const connectIntegration = useMutation({
    mutationFn: async (integrationId: string) => {
      const response = await fetch(`/api/settings/integrations/${integrationId}/connect`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to connect');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  const disconnectIntegration = useMutation({
    mutationFn: async (integrationId: string) => {
      const response = await fetch(`/api/settings/integrations/${integrationId}/disconnect`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to disconnect');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
    },
  });

  const filteredIntegrations = selectedCategory === 'all'
    ? integrations
    : integrations.filter((i) => i.category === selectedCategory);

  const connectedCount = integrations.filter((i) => i.is_connected).length;

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading integrations...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/settings"
          className="p-2 hover:bg-muted rounded-button transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <H1 className="text-h2-md font-weight-bold text-foreground flex items-center gap-2">
            <Globe className="h-6 w-6" />
            Integrations
          </H1>
          <Body className="text-body-sm text-muted-foreground mt-1">
            {connectedCount} of {integrations.length} integrations connected
          </Body>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((category) => (
          <Button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-button text-body-sm whitespace-nowrap transition-colors ${
              selectedCategory === category.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80 text-foreground'
            }`}
          >
            {category.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIntegrations.map((integration) => (
          <div
            key={integration.id}
            className={`bg-background border-2 rounded-card p-4 ${
              integration.is_connected ? 'border-primary' : 'border-border'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {(() => {
                  const IconComponent = ICON_MAP[integration.icon];
                  return IconComponent ? <IconComponent className="h-6 w-6 text-muted-foreground" /> : null;
                })()}
                <div>
                  <H3 className="text-body-md font-weight-semibold text-foreground flex items-center gap-2">
                    {integration.name}
                    {integration.is_connected && (
                      <Check className="h-4 w-4 text-success" />
                    )}
                  </H3>
                  <Body className="text-body-xs text-muted-foreground capitalize">
                    {integration.category}
                  </Body>
                </div>
              </div>
              {integration.is_connected && integration.settings_url && (
                <Link
                  href={integration.settings_url}
                  className="p-1.5 hover:bg-muted rounded-button transition-colors"
                >
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </Link>
              )}
            </div>
            <Body className="text-body-sm text-muted-foreground mb-4">
              {integration.description}
            </Body>
            {integration.is_connected ? (
              <div className="flex items-center justify-between">
                <Text className="text-body-xs text-success flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Connected
                </Text>
                <Button
                  onClick={() => {
                    if (confirm('Disconnect this integration?')) {
                      disconnectIntegration.mutate(integration.id);
                    }
                  }}
                  className="text-body-xs text-destructive hover:underline"
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => connectIntegration.mutate(integration.id)}
                disabled={connectIntegration.isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-border rounded-button hover:bg-muted transition-colors disabled:opacity-50"
              >
                <ExternalLink className="h-4 w-4" />
                <Text className="text-body-sm">Connect</Text>
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="bg-muted/30 border-2 border-dashed border-border rounded-card p-6 text-center">
        <Zap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <H3 className="text-body-md font-weight-semibold text-foreground">Need a custom integration?</H3>
        <Body className="text-body-sm text-muted-foreground mt-1 mb-4">
          Use our API to build custom integrations
        </Body>
        <Link
          href="/settings/api"
          className="text-primary text-body-sm hover:underline"
        >
          View API Documentation
        </Link>
      </div>
    </div>
  );
}
