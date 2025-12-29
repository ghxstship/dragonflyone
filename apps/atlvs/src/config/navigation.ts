import {
  LayoutDashboard,
  FolderKanban,
  Building2,
  Users,
  DollarSign,
  FileText,
  BarChart3,
  Settings,
  Plug,
  Calendar,
  MapPin,
  Target,
  Key,
  FileSearch,
  Database,
  PieChart,
  Handshake,
  Package,
  Truck,
  Layers,
  Sparkles,
  FileCheck,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

// Navigation types - matching the UI package's navigation types
type NavigationContextLevel = 'platform' | 'event';
type PlatformRole = 
  | 'super_admin'
  | 'org_admin'
  | 'finance_director'
  | 'production_manager'
  | 'sales_director'
  | 'operations_director'
  | 'marketing_director'
  | 'hr_director'
  | 'member';

type EventRole =
  | 'executive_producer'
  | 'production_manager'
  | 'finance_manager'
  | 'operations_manager'
  | 'marketing_manager'
  | 'department_head'
  | 'crew_lead'
  | 'crew_member'
  | 'vendor'
  | 'stakeholder'
  | 'viewer';

interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: LucideIcon;
  children?: NavItem[];
  platformRoles?: PlatformRole[];
  eventRoles?: EventRole[];
  contextLevel: NavigationContextLevel | 'both';
  description?: string;
  shortcut?: string;
}

interface NavSection {
  id: string;
  title: string;
  items: NavItem[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

interface NavigationConfig {
  app: 'atlvs' | 'compvss' | 'gvteway';
  platformNav: NavSection[];
  eventNav: NavSection[];
  quickActions?: NavItem[];
  footerNav?: NavItem[];
}

/**
 * ATLVS Navigation Configuration
 * Production Management Platform
 */

// =============================================================================
// PLATFORM-LEVEL NAVIGATION
// =============================================================================

const platformNav: NavSection[] = [
  {
    id: 'main',
    title: '',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        contextLevel: 'platform',
        description: 'Platform overview and key metrics',
        shortcut: 'cmd+d',
      },
      {
        id: 'productions',
        label: 'Productions',
        href: '/productions',
        icon: FolderKanban,
        contextLevel: 'platform',
        description: 'Manage all productions',
        children: [
          {
            id: 'productions-active',
            label: 'Active',
            href: '/productions?status=active',
            contextLevel: 'platform',
          },
          {
            id: 'productions-upcoming',
            label: 'Upcoming',
            href: '/productions?status=upcoming',
            contextLevel: 'platform',
          },
          {
            id: 'productions-archived',
            label: 'Archived',
            href: '/productions?status=archived',
            contextLevel: 'platform',
          },
          {
            id: 'productions-templates',
            label: 'Templates',
            href: '/productions/templates',
            contextLevel: 'platform',
          },
        ],
      },
    ],
  },
  {
    id: 'organization',
    title: 'Organization',
    collapsible: true,
    items: [
      {
        id: 'org-settings',
        label: 'Settings',
        href: '/organization/settings',
        icon: Building2,
        contextLevel: 'platform',
        platformRoles: ['super_admin', 'org_admin'],
      },
      {
        id: 'org-team',
        label: 'Team Members',
        href: '/people?type=employee',
        icon: Users,
        contextLevel: 'platform',
        platformRoles: ['super_admin', 'org_admin', 'hr_director'],
      },
      {
        id: 'org-departments',
        label: 'Departments',
        href: '/organization/departments',
        icon: Layers,
        contextLevel: 'platform',
        platformRoles: ['super_admin', 'org_admin'],
      },
      {
        id: 'org-subsidiaries',
        label: 'Subsidiaries',
        href: '/subsidiaries',
        icon: Building2,
        contextLevel: 'platform',
        platformRoles: ['super_admin', 'org_admin'],
      },
    ],
  },
  {
    id: 'finance-platform',
    title: 'Finance',
    collapsible: true,
    items: [
      {
        id: 'finance-dashboard',
        label: 'Finance Dashboard',
        href: '/finance',
        icon: DollarSign,
        contextLevel: 'platform',
        platformRoles: ['super_admin', 'org_admin', 'finance_director'],
        description: 'Unified finance management',
      },
    ],
  },
  {
    id: 'crm',
    title: 'CRM',
    collapsible: true,
    items: [
      {
        id: 'people',
        label: 'People',
        href: '/people',
        icon: Users,
        contextLevel: 'platform',
        description: 'Unified people management (contacts, employees, crew, artists)',
      },
      {
        id: 'organizations',
        label: 'Organizations',
        href: '/organizations',
        icon: Building2,
        contextLevel: 'platform',
        description: 'Unified organization management (vendors, clients, sponsors, partners)',
      },
      {
        id: 'places',
        label: 'Places',
        href: '/places',
        icon: MapPin,
        contextLevel: 'platform',
        description: 'Unified location management (venues, spaces, warehouses)',
      },
      {
        id: 'deals',
        label: 'Deals',
        href: '/deals',
        icon: Handshake,
        contextLevel: 'platform',
        platformRoles: ['super_admin', 'org_admin', 'sales_director'],
      },
    ],
  },
  {
    id: 'assets-platform',
    title: 'Assets',
    collapsible: true,
    items: [
      {
        id: 'assets-inventory',
        label: 'Inventory',
        href: '/assets',
        icon: Package,
        contextLevel: 'platform',
      },
      {
        id: 'assets-maintenance',
        label: 'Maintenance',
        href: '/assets/maintenance',
        icon: Settings,
        contextLevel: 'platform',
      },
      {
        id: 'assets-rentals',
        label: 'Rentals',
        href: '/assets/rentals',
        icon: Truck,
        contextLevel: 'platform',
      },
      {
        id: 'assets-tracking',
        label: 'Tracking',
        href: '/assets/tracking',
        icon: MapPin,
        contextLevel: 'platform',
      },
    ],
  },
  {
    id: 'analytics-platform',
    title: 'Analytics',
    collapsible: true,
    items: [
      {
        id: 'analytics-overview',
        label: 'Overview',
        href: '/analytics',
        icon: BarChart3,
        contextLevel: 'platform',
      },
      {
        id: 'analytics-kpis',
        label: 'KPIs',
        href: '/analytics/kpi',
        icon: Target,
        contextLevel: 'platform',
      },
      {
        id: 'analytics-dashboard-builder',
        label: 'Dashboard Builder',
        href: '/analytics/dashboard-builder',
        icon: PieChart,
        contextLevel: 'platform',
        platformRoles: ['super_admin', 'org_admin'],
      },
      {
        id: 'analytics-data-warehouse',
        label: 'Data Warehouse',
        href: '/analytics/data-warehouse',
        icon: Database,
        contextLevel: 'platform',
        platformRoles: ['super_admin'],
      },
    ],
  },
  {
    id: 'integrations',
    title: 'Integrations',
    collapsible: true,
    items: [
      {
        id: 'integrations-apps',
        label: 'Connected Apps',
        href: '/integrations',
        icon: Plug,
        contextLevel: 'platform',
      },
      {
        id: 'api-management',
        label: 'API Management',
        href: '/api-management',
        icon: Key,
        contextLevel: 'platform',
        platformRoles: ['super_admin', 'org_admin'],
        children: [
          {
            id: 'api-keys',
            label: 'API Keys',
            href: '/api-management/keys',
            contextLevel: 'platform',
          },
          {
            id: 'webhooks',
            label: 'Webhooks',
            href: '/api-management/webhooks',
            contextLevel: 'platform',
          },
          {
            id: 'api-logs',
            label: 'Logs',
            href: '/api-management/logs',
            contextLevel: 'platform',
          },
        ],
      },
    ],
  },
  {
    id: 'settings-platform',
    title: 'Settings',
    collapsible: true,
    items: [
      {
        id: 'settings-preferences',
        label: 'Preferences',
        href: '/settings',
        icon: Settings,
        contextLevel: 'platform',
      },
    ],
  },
];

// =============================================================================
// EVENT-LEVEL NAVIGATION (Production Context)
// =============================================================================

const eventNav: NavSection[] = [
  {
    id: 'main',
    title: '',
    items: [
      {
        id: 'production-overview',
        label: 'Overview',
        href: '/p/:productionId/overview',
        icon: LayoutDashboard,
        contextLevel: 'event',
        description: 'Production dashboard',
        shortcut: 'cmd+o',
      },
    ],
  },
  {
    id: 'planning',
    title: 'Planning',
    collapsible: true,
    items: [
      {
        id: 'schedule',
        label: 'Schedule',
        href: '/p/:productionId/schedule',
        icon: Calendar,
        contextLevel: 'event',
        description: 'Timeline, tasks, contingencies (tab-based)',
      },
      {
        id: 'shows',
        label: 'Shows',
        href: '/p/:productionId/shows',
        icon: Sparkles,
        contextLevel: 'event',
        description: 'Run of show, cues, set times (tab-based)',
      },
      {
        id: 'advancing',
        label: 'Advancing',
        href: '/p/:productionId/advancing',
        icon: Target,
        contextLevel: 'event',
        description: 'Allocations, fulfillment, history (tab-based)',
      },
    ],
  },
  {
    id: 'people',
    title: 'People',
    collapsible: true,
    items: [
      {
        id: 'team',
        label: 'Team',
        href: '/p/:productionId/team',
        icon: Users,
        contextLevel: 'event',
        description: 'Assignments, training (tab-based)',
      },
      {
        id: 'vendors',
        label: 'Vendors',
        href: '/p/:productionId/vendors',
        icon: Truck,
        contextLevel: 'event',
      },
    ],
  },
  {
    id: 'documents',
    title: 'Documents',
    collapsible: true,
    items: [
      {
        id: 'documents-files',
        label: 'Documents',
        href: '/p/:productionId/documents',
        icon: FileText,
        contextLevel: 'event',
        description: 'Contracts, permits, insurance (tab-based)',
      },
    ],
  },
  {
    id: 'wrap',
    title: 'Wrap',
    collapsible: true,
    items: [
      {
        id: 'wrap',
        label: 'Wrap',
        href: '/p/:productionId/wrap',
        icon: FileCheck,
        contextLevel: 'event',
        description: 'Post-production wrap-up',
      },
    ],
  },
  {
    id: 'settings-event',
    title: 'Settings',
    collapsible: true,
    items: [
      {
        id: 'production-settings',
        label: 'Production Settings',
        href: '/p/:productionId/settings',
        icon: Settings,
        contextLevel: 'event',
        eventRoles: ['executive_producer', 'production_manager'],
      },
    ],
  },
];

// =============================================================================
// EXPORT CONFIGURATION
// =============================================================================

export const atlvsNavigationConfig: NavigationConfig = {
  app: 'atlvs',
  platformNav,
  eventNav,
  quickActions: [
    {
      id: 'new-production',
      label: 'New Production',
      href: '/productions/new',
      icon: FolderKanban,
      contextLevel: 'platform',
      shortcut: 'cmd+n',
    },
    {
      id: 'search',
      label: 'Search',
      href: '/search',
      icon: FileSearch,
      contextLevel: 'both',
      shortcut: 'cmd+k',
    },
  ],
  footerNav: [
    {
      id: 'help',
      label: 'Help',
      href: '/help',
      contextLevel: 'both',
    },
    {
      id: 'about',
      label: 'About',
      href: '/about',
      contextLevel: 'both',
    },
  ],
};

export default atlvsNavigationConfig;
