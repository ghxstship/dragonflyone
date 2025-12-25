'use client';

import {
  Body,
  Box,
  Card,
  Container,
  EnterprisePageHeader,
  H2,
  MainContent,
  Stack,
  Text,
} from '@ghxstship/ui';

import Link from 'next/link';
import { 
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
    <>
      <EnterprisePageHeader
        title="Settings"
        subtitle="Manage your account and organization settings"
      />
      <MainContent padding="lg">
        <Container size="md">
          <Stack gap={4}>
            {SETTINGS_SECTIONS.map((section) => (
              <Link key={section.id} href={section.path}>
                <Card className="p-4 hover:border-primary/30 transition-colors">
                  <Stack direction="horizontal" gap={4} className="items-center">
                    <Box className="p-3 bg-primary/10 rounded-card">
                      <section.icon className="h-6 w-6 text-primary" />
                    </Box>
                    <Box className="flex-1">
                      <H2>{section.name}</H2>
                      <Body size="sm" className="text-muted-foreground">{section.description}</Body>
                    </Box>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Stack>
                </Card>
              </Link>
            ))}

            <Box className="pt-6 border-t border-border">
              <Stack direction="horizontal" className="justify-between">
                <Stack gap={0}>
                  <Body size="sm" className="text-muted-foreground">App Version</Body>
                  <Body size="xs" className="text-muted-foreground">v2.1.0</Body>
                </Stack>
                <Stack direction="horizontal" gap={4}>
                  <Link href="/help" className="text-primary hover:underline">
                    <Text size="sm">Help Center</Text>
                  </Link>
                  <Link href="/changelog" className="text-primary hover:underline">
                    <Text size="sm">Changelog</Text>
                  </Link>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Container>
      </MainContent>
    </>
  );
}
