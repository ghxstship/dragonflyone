'use client';

import {
  Body,
  Box,
  Button,
  Card,
  Container,
  EnterprisePageHeader,
  Grid,
  H3,
  MainContent,
  Skeleton,
  Stack,
  Text,
} from '@ghxstship/ui';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ExternalLink, Settings, Zap, CreditCard, PieChart, Calendar, Mail, Cloud, Hexagon, MessageSquare, Smartphone, type LucideIcon } from 'lucide-react';
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
      <>
        <EnterprisePageHeader title="Integrations" subtitle="Loading..." />
        <MainContent padding="lg">
          <Container size="lg">
            <Grid cols={2} gap={4}>
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </Grid>
          </Container>
        </MainContent>
      </>
    );
  }

  return (
    <>
      <EnterprisePageHeader
        title="Integrations"
        subtitle={`${connectedCount} of ${integrations.length} integrations connected`}
      />
      <MainContent padding="lg">
        <Container size="lg">
          <Stack gap={6}>
            <Stack direction="horizontal" gap={2} className="overflow-x-auto pb-2">
              {CATEGORIES.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'solid' : 'outline'}
                  onClick={() => setSelectedCategory(category.id)}
                  size="sm"
                >
                  {category.name}
                </Button>
              ))}
            </Stack>

            <Grid cols={2} gap={4}>
              {filteredIntegrations.map((integration) => (
                <Card
                  key={integration.id}
                  className={`p-4 ${integration.is_connected ? 'border-primary' : ''}`}
                >
                  <Stack direction="horizontal" className="justify-between mb-3">
                    <Stack direction="horizontal" gap={3} className="items-center">
                      {(() => {
                        const IconComponent = ICON_MAP[integration.icon];
                        return IconComponent ? <IconComponent className="h-6 w-6 text-muted-foreground" /> : null;
                      })()}
                      <Stack gap={0}>
                        <Stack direction="horizontal" gap={2} className="items-center">
                          <H3>{integration.name}</H3>
                          {integration.is_connected && (
                            <Check className="h-4 w-4 text-success" />
                          )}
                        </Stack>
                        <Body size="xs" className="text-muted-foreground capitalize">
                          {integration.category}
                        </Body>
                      </Stack>
                    </Stack>
                    {integration.is_connected && integration.settings_url && (
                      <Link href={integration.settings_url}>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </Stack>
                  <Body size="sm" className="text-muted-foreground mb-4">
                    {integration.description}
                  </Body>
                  {integration.is_connected ? (
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Text size="xs" className="text-success flex items-center gap-1">
                        <Zap className="h-3 w-3" />
                        Connected
                      </Text>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm('Disconnect this integration?')) {
                            disconnectIntegration.mutate(integration.id);
                          }
                        }}
                        className="text-destructive"
                      >
                        Disconnect
                      </Button>
                    </Stack>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => connectIntegration.mutate(integration.id)}
                      disabled={connectIntegration.isPending}
                      className="w-full"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Connect
                    </Button>
                  )}
                </Card>
              ))}
            </Grid>

            <Box className="bg-muted/30 border-2 border-dashed border-border rounded-card p-6 text-center">
              <Zap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <H3>Need a custom integration?</H3>
              <Body size="sm" className="text-muted-foreground mt-1 mb-4">
                Use our API to build custom integrations
              </Body>
              <Link href="/settings/api" className="text-primary hover:underline">
                <Text size="sm">View API Documentation</Text>
              </Link>
            </Box>
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
