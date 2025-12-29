'use client';

/**
 * Settings Hub Page
 * Uses normalized SettingsHubPage template from @ghxstship/ui
 */

import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Users, 
  CreditCard, 
  Bell, 
  Shield, 
  Palette,
  Mail,
  Globe,
} from 'lucide-react';
import { SettingsHubPage, type SettingsSection } from '@ghxstship/ui';
import { useAuthContext, ATLVS_ADMIN_ROLES } from '@ghxstship/config';

export default function SettingsPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  
  // RBAC: Check if user has admin access for organization settings
  const canManageSettings = ATLVS_ADMIN_ROLES.some(role => hasRole(role));

  // Build settings sections with RBAC filtering
  const sections: SettingsSection[] = [
    {
      id: 'account',
      title: 'Account Settings',
      description: 'Manage your personal account and preferences',
      categories: [
        {
          id: 'notifications',
          title: 'Notifications',
          description: 'Configure email and in-app notification preferences',
          icon: <Bell className="h-6 w-6" />,
          href: '/settings/notifications',
        },
        {
          id: 'appearance',
          title: 'Appearance',
          description: 'Customize theme and display preferences',
          icon: <Palette className="h-6 w-6" />,
          href: '/settings/appearance',
        },
        {
          id: 'security',
          title: 'Security',
          description: 'Two-factor authentication and security settings',
          icon: <Shield className="h-6 w-6" />,
          href: '/settings/security',
          disabled: !canManageSettings,
        },
      ],
    },
    {
      id: 'organization',
      title: 'Organization Settings',
      description: 'Manage your organization configuration',
      categories: [
        {
          id: 'organization',
          title: 'Organization',
          description: 'Manage your organization details and branding',
          icon: <Building2 className="h-6 w-6" />,
          href: '/settings/organization',
          disabled: !canManageSettings,
        },
        {
          id: 'team',
          title: 'Team Members',
          description: 'Invite and manage team members and roles',
          icon: <Users className="h-6 w-6" />,
          href: '/settings/team',
        },
        {
          id: 'billing',
          title: 'Billing & Plans',
          description: 'Manage subscription, invoices, and payment methods',
          icon: <CreditCard className="h-6 w-6" />,
          href: '/settings/billing',
          disabled: !canManageSettings,
        },
      ],
    },
    {
      id: 'advanced',
      title: 'Advanced Settings',
      description: 'Configure integrations and templates',
      categories: [
        {
          id: 'email',
          title: 'Email Templates',
          description: 'Customize automated email templates',
          icon: <Mail className="h-6 w-6" />,
          href: '/settings/email-templates',
        },
        {
          id: 'integrations',
          title: 'Integrations',
          description: 'Connect third-party services and APIs',
          icon: <Globe className="h-6 w-6" />,
          href: '/settings/integrations',
          disabled: !canManageSettings,
        },
      ],
    },
  ];

  return (
    <SettingsHubPage
      title="Settings"
      subtitle="Manage your account and organization settings"
      sections={sections}
      onNavigate={(href) => router.push(href)}
    />
  );
}
