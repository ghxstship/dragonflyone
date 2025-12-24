'use client';

import {
  Body,
  H1,
  H2,
} from '@ghxstship/ui';

import Link from 'next/link';
import { 
  Settings, 
  Building2, 
  Users, 
  CreditCard, 
  Bell, 
  Shield, 
  Palette,
  Mail,
  Globe,
  ChevronRight
} from 'lucide-react';

const SETTINGS_SECTIONS = [
  {
    id: 'organization',
    name: 'Organization',
    icon: Building2,
    description: 'Manage your organization details and branding',
    path: '/settings/organization',
  },
  {
    id: 'team',
    name: 'Team Members',
    icon: Users,
    description: 'Invite and manage team members and roles',
    path: '/settings/team',
  },
  {
    id: 'billing',
    name: 'Billing & Plans',
    icon: CreditCard,
    description: 'Manage subscription, invoices, and payment methods',
    path: '/settings/billing',
  },
  {
    id: 'notifications',
    name: 'Notifications',
    icon: Bell,
    description: 'Configure email and in-app notification preferences',
    path: '/settings/notifications',
  },
  {
    id: 'security',
    name: 'Security',
    icon: Shield,
    description: 'Two-factor authentication and security settings',
    path: '/settings/security',
  },
  {
    id: 'appearance',
    name: 'Appearance',
    icon: Palette,
    description: 'Customize theme and display preferences',
    path: '/settings/appearance',
  },
  {
    id: 'email',
    name: 'Email Templates',
    icon: Mail,
    description: 'Customize automated email templates',
    path: '/settings/email-templates',
  },
  {
    id: 'integrations',
    name: 'Integrations',
    icon: Globe,
    description: 'Connect third-party services and APIs',
    path: '/settings/integrations',
  },
];

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <H1 className="text-h2-md font-weight-bold text-foreground flex items-center gap-3">
          <Settings className="h-7 w-7" />
          Settings
        </H1>
        <Body className="text-body-sm text-muted-foreground mt-1">
          Manage your account and organization settings
        </Body>
      </div>

      <div className="grid gap-4">
        {SETTINGS_SECTIONS.map((section) => (
          <Link
            key={section.id}
            href={section.path}
            className="flex items-center gap-4 p-4 bg-background border-2 border-border rounded-card hover:border-primary/30 transition-colors"
          >
            <div className="p-3 bg-primary/10 rounded-card">
              <section.icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <H2 className="text-body-md font-weight-semibold text-foreground">{section.name}</H2>
              <Body className="text-body-sm text-muted-foreground">{section.description}</Body>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <div className="pt-6 border-t border-border">
        <div className="flex items-center justify-between">
          <div>
            <Body className="text-body-sm text-muted-foreground">App Version</Body>
            <Body className="text-body-xs text-muted-foreground">v2.1.0</Body>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/help" className="text-body-sm text-primary hover:underline">
              Help Center
            </Link>
            <Link href="/changelog" className="text-body-sm text-primary hover:underline">
              Changelog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
