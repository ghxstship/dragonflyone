'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Grid, ExternalLink, Settings, Trash2, AlertCircle, Check, Star, MessageSquare, PieChart, Mail, Calendar, CreditCard, Zap, Hexagon, TrendingUp, type LucideIcon } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const APP_ICON_MAP: Record<string, LucideIcon> = {
  MessageSquare,
  PieChart,
  Mail,
  Calendar,
  CreditCard,
  Zap,
  Hexagon,
  TrendingUp,
};

interface ThirdPartyApp {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof APP_ICON_MAP;
  category: 'productivity' | 'communication' | 'finance' | 'marketing' | 'analytics';
  developer: string;
  rating: number;
  installs: number;
  is_installed: boolean;
  installed_at?: string;
  settings_url?: string;
  permissions: string[];
}

const DEMO_APPS: ThirdPartyApp[] = [
  {
    id: 'APP-001',
    name: 'Slack Notifications',
    description: 'Get real-time booking and payment notifications in Slack',
    icon: 'MessageSquare',
    category: 'communication',
    developer: 'Slack Technologies',
    rating: 4.8,
    installs: 15420,
    is_installed: true,
    installed_at: '2024-09-15T10:00:00Z',
    settings_url: '/settings/apps/slack',
    permissions: ['read:bookings', 'read:payments', 'webhooks'],
  },
  {
    id: 'APP-002',
    name: 'QuickBooks Sync',
    description: 'Automatically sync invoices and payments with QuickBooks',
    icon: 'PieChart',
    category: 'finance',
    developer: 'Intuit',
    rating: 4.5,
    installs: 8930,
    is_installed: true,
    installed_at: '2024-10-01T14:00:00Z',
    settings_url: '/settings/apps/quickbooks',
    permissions: ['read:invoices', 'write:invoices', 'read:payments'],
  },
  {
    id: 'APP-003',
    name: 'Mailchimp Marketing',
    description: 'Sync contacts and automate email marketing campaigns',
    icon: 'Mail',
    category: 'marketing',
    developer: 'Mailchimp',
    rating: 4.6,
    installs: 12100,
    is_installed: false,
    permissions: ['read:contacts', 'read:bookings'],
  },
  {
    id: 'APP-004',
    name: 'Google Calendar',
    description: 'Two-way sync between bookings and Google Calendar',
    icon: 'Calendar',
    category: 'productivity',
    developer: 'Google',
    rating: 4.9,
    installs: 25000,
    is_installed: true,
    installed_at: '2024-08-20T09:00:00Z',
    settings_url: '/settings/apps/google-calendar',
    permissions: ['read:bookings', 'write:bookings'],
  },
  {
    id: 'APP-005',
    name: 'Stripe Payments',
    description: 'Accept payments and manage subscriptions',
    icon: 'CreditCard',
    category: 'finance',
    developer: 'Stripe',
    rating: 4.9,
    installs: 32000,
    is_installed: false,
    permissions: ['read:invoices', 'write:payments'],
  },
  {
    id: 'APP-006',
    name: 'Zapier Automation',
    description: 'Connect ATLVS with 3000+ other apps',
    icon: 'Zap',
    category: 'productivity',
    developer: 'Zapier',
    rating: 4.7,
    installs: 18500,
    is_installed: false,
    permissions: ['read:all', 'webhooks'],
  },
  {
    id: 'APP-007',
    name: 'HubSpot CRM',
    description: 'Sync contacts and deals with HubSpot',
    icon: 'Hexagon',
    category: 'marketing',
    developer: 'HubSpot',
    rating: 4.4,
    installs: 9200,
    is_installed: false,
    permissions: ['read:contacts', 'write:contacts', 'read:bookings'],
  },
  {
    id: 'APP-008',
    name: 'Google Analytics',
    description: 'Track website traffic and conversions',
    icon: 'TrendingUp',
    category: 'analytics',
    developer: 'Google',
    rating: 4.8,
    installs: 21000,
    is_installed: false,
    permissions: ['analytics:write'],
  },
];

const CATEGORIES = [
  { id: 'all', name: 'All Apps' },
  { id: 'productivity', name: 'Productivity' },
  { id: 'communication', name: 'Communication' },
  { id: 'finance', name: 'Finance' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'analytics', name: 'Analytics' },
];

export default function ThirdPartyAppsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showInstalled, setShowInstalled] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['third-party-apps'],
    queryFn: async () => {
      const response = await fetch('/api/settings/apps');
      if (!response.ok) {
        return { apps: DEMO_APPS };
      }
      const result = await response.json();
      return result.apps?.length ? result : { apps: DEMO_APPS };
    },
  });

  const apps: ThirdPartyApp[] = data?.apps || DEMO_APPS;

  const filteredApps = apps.filter((app) => {
    const matchesSearch = !searchQuery ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    const matchesInstalled = !showInstalled || app.is_installed;
    return matchesSearch && matchesCategory && matchesInstalled;
  });

  const installApp = useMutation({
    mutationFn: async (appId: string) => {
      const response = await fetch(`/api/settings/apps/${appId}/install`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to install app');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['third-party-apps'] });
    },
  });

  const uninstallApp = useMutation({
    mutationFn: async (appId: string) => {
      const response = await fetch(`/api/settings/apps/${appId}/uninstall`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to uninstall app');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['third-party-apps'] });
    },
  });

  const installedCount = apps.filter((a) => a.is_installed).length;

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-muted-foreground">Loading apps...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12 bg-destructive/10 border-2 border-destructive rounded-card">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive">Failed to load apps</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['third-party-apps'] })}
            className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/settings"
          className="p-2 hover:bg-muted rounded-button transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-h2-md font-weight-bold text-foreground flex items-center gap-2">
            <Grid className="h-6 w-6" />
            App Marketplace
          </h1>
          <p className="text-body-sm text-muted-foreground mt-1">
            {installedCount} apps installed • Browse and manage third-party integrations
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search apps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-border rounded-button bg-background text-body-sm focus:outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-button text-body-sm whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80 text-foreground'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowInstalled(!showInstalled)}
          className={`px-4 py-2 rounded-button text-body-sm whitespace-nowrap transition-colors ${
            showInstalled
              ? 'bg-success/20 text-success border-2 border-success'
              : 'bg-muted hover:bg-muted/80 text-foreground'
          }`}
        >
          {showInstalled ? 'Installed Only' : 'Show All'}
        </button>
      </div>

      {filteredApps.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 border-2 border-dashed border-border rounded-card">
          <Grid className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-h4-md font-weight-medium text-foreground mb-2">
            No apps found
          </h3>
          <p className="text-body-sm text-muted-foreground">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className={`bg-background border-2 rounded-card p-4 transition-colors ${
                app.is_installed ? 'border-primary' : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {(() => {
                    const IconComponent = APP_ICON_MAP[app.icon];
                    return IconComponent ? <IconComponent className="h-8 w-8 text-muted-foreground" /> : null;
                  })()}
                  <div>
                    <h3 className="text-body-md font-weight-semibold text-foreground flex items-center gap-2">
                      {app.name}
                      {app.is_installed && (
                        <Check className="h-4 w-4 text-success" />
                      )}
                    </h3>
                    <p className="text-body-xs text-muted-foreground">{app.developer}</p>
                  </div>
                </div>
                {app.is_installed && app.settings_url && (
                  <Link
                    href={app.settings_url}
                    className="p-1.5 hover:bg-muted rounded-button transition-colors"
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </Link>
                )}
              </div>

              <p className="text-body-sm text-muted-foreground mb-3 line-clamp-2">
                {app.description}
              </p>

              <div className="flex items-center gap-3 text-body-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-warning text-warning" />
                  {app.rating}
                </span>
                <span>{app.installs.toLocaleString()} installs</span>
                <span className="px-2 py-0.5 bg-muted rounded-badge capitalize">
                  {app.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {app.is_installed ? (
                  <>
                    <button
                      onClick={() => {
                        if (confirm(`Uninstall ${app.name}? This will remove all app data.`)) {
                          uninstallApp.mutate(app.id);
                        }
                      }}
                      disabled={uninstallApp.isPending}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-body-sm text-destructive border-2 border-destructive rounded-button hover:bg-destructive/10 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Uninstall
                    </button>
                    {app.settings_url && (
                      <Link
                        href={app.settings_url}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-body-sm bg-muted rounded-button hover:bg-muted/80 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Configure
                      </Link>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => installApp.mutate(app.id)}
                    disabled={installApp.isPending}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {installApp.isPending ? 'Installing...' : 'Install'}
                  </button>
                )}
              </div>

              {app.permissions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-body-xs text-muted-foreground mb-1">Permissions:</p>
                  <div className="flex flex-wrap gap-1">
                    {app.permissions.slice(0, 3).map((perm) => (
                      <span
                        key={perm}
                        className="px-1.5 py-0.5 bg-muted text-muted-foreground text-body-xs rounded"
                      >
                        {perm}
                      </span>
                    ))}
                    {app.permissions.length > 3 && (
                      <span className="px-1.5 py-0.5 bg-muted text-muted-foreground text-body-xs rounded">
                        +{app.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
