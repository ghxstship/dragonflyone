import {
  LayoutDashboard,
  FolderKanban,
  Building2,
  Users,
  DollarSign,
  FileText,
  Shield,
  BarChart3,
  Settings,
  Plug,
  Calendar,
  MapPin,
  Briefcase,
  Target,
  TrendingUp,
  Receipt,
  Wallet,
  Scale,
  FileCheck,
  Megaphone,
  Lightbulb,
  Key,
  FileSearch,
  Database,
  PieChart,
  UserPlus,
  Handshake,
  Package,
  Truck,
  AlertTriangle,
  Flag,
  Layers,
  Sparkles,
} from 'lucide-react';

import type { NavigationConfig, NavSection } from '@ghxstship/ui/navigation';

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
        href: '/employees',
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
        id: 'billing',
        label: 'Billing',
        href: '/billing',
        icon: Receipt,
        contextLevel: 'platform',
        platformRoles: ['super_admin', 'org_admin', 'finance_director'],
      },
      {
        id: 'revenue-recognition',
        label: 'Revenue Recognition',
        href: '/revenue-recognition',
        icon: TrendingUp,
        contextLevel: 'platform',
        platformRoles: ['super_admin', 'finance_director'],
      },
      {
        id: 'taxes',
        label: 'Taxes',
        href: '/taxes',
        icon: FileCheck,
        contextLevel: 'platform',
        platformRoles: ['super_admin', 'finance_director'],
      },
      {
        id: 'payroll',
        label: 'Payroll',
        href: '/payroll',
        icon: Wallet,
        contextLevel: 'platform',
        platformRoles: ['super_admin', 'finance_director', 'hr_director'],
      },
    ],
  },
  {
    id: 'crm',
    title: 'CRM',
    collapsible: true,
    items: [
      {
        id: 'contacts',
        label: 'Contacts',
        href: '/contacts',
        icon: Users,
        contextLevel: 'platform',
      },
      {
        id: 'leads',
        label: 'Leads',
        href: '/leads',
        icon: UserPlus,
        contextLevel: 'platform',
        platformRoles: ['super_admin', 'org_admin', 'sales_director'],
      },
      {
        id: 'deals',
        label: 'Deals',
        href: '/deals',
        icon: Handshake,
        contextLevel: 'platform',
        platformRoles: ['super_admin', 'org_admin', 'sales_director'],
      },
      {
        id: 'pipeline',
        label: 'Pipeline',
        href: '/pipeline',
        icon: Target,
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
      {
        id: 'settings-audit',
        label: 'Audit Log',
        href: '/audit',
        icon: FileSearch,
        contextLevel: 'platform',
        platformRoles: ['super_admin', 'org_admin'],
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
        href: '/p/:productionId',
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
        children: [
          {
            id: 'schedule-timeline',
            label: 'Timeline',
            href: '/p/:productionId/schedule',
            contextLevel: 'event',
          },
          {
            id: 'schedule-tasks',
            label: 'Tasks',
            href: '/p/:productionId/schedule/tasks',
            contextLevel: 'event',
          },
          {
            id: 'schedule-contingencies',
            label: 'Contingencies',
            href: '/p/:productionId/schedule/contingencies',
            contextLevel: 'event',
          },
          {
            id: 'schedule-templates',
            label: 'Templates',
            href: '/p/:productionId/schedule/templates',
            contextLevel: 'event',
          },
        ],
      },
      {
        id: 'shows',
        label: 'Shows',
        href: '/p/:productionId/shows',
        icon: Sparkles,
        contextLevel: 'event',
        children: [
          {
            id: 'shows-run-of-show',
            label: 'Run of Show',
            href: '/p/:productionId/shows/run-of-show',
            contextLevel: 'event',
          },
          {
            id: 'shows-cues',
            label: 'Cues',
            href: '/p/:productionId/shows/cues',
            contextLevel: 'event',
          },
        ],
      },
      {
        id: 'venues',
        label: 'Venues',
        href: '/p/:productionId/venues',
        icon: MapPin,
        contextLevel: 'event',
        children: [
          {
            id: 'venues-locations',
            label: 'Locations',
            href: '/p/:productionId/venues',
            contextLevel: 'event',
          },
          {
            id: 'venues-zones',
            label: 'Zones',
            href: '/p/:productionId/venues/zones',
            contextLevel: 'event',
          },
          {
            id: 'venues-maps',
            label: 'Maps',
            href: '/p/:productionId/venues/maps',
            contextLevel: 'event',
          },
        ],
      },
      {
        id: 'alignment',
        label: 'Alignment',
        href: '/p/:productionId/alignment',
        icon: Target,
        contextLevel: 'event',
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
        children: [
          {
            id: 'team-assignments',
            label: 'Assignments',
            href: '/p/:productionId/team/assignments',
            contextLevel: 'event',
          },
          {
            id: 'team-training',
            label: 'Training',
            href: '/p/:productionId/team/training',
            contextLevel: 'event',
          },
        ],
      },
      {
        id: 'stakeholders',
        label: 'Stakeholders',
        href: '/p/:productionId/stakeholders',
        icon: Briefcase,
        contextLevel: 'event',
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
    id: 'finance',
    title: 'Finance',
    collapsible: true,
    items: [
      {
        id: 'budget',
        label: 'Budget',
        href: '/p/:productionId/budgets',
        icon: DollarSign,
        contextLevel: 'event',
        eventRoles: ['executive_producer', 'production_manager', 'finance_manager'],
        children: [
          {
            id: 'budget-overview',
            label: 'Overview',
            href: '/p/:productionId/budgets',
            contextLevel: 'event',
          },
          {
            id: 'budget-scenarios',
            label: 'Scenarios',
            href: '/p/:productionId/scenarios',
            contextLevel: 'event',
          },
        ],
      },
      {
        id: 'expenses',
        label: 'Expenses',
        href: '/p/:productionId/expenses',
        icon: Receipt,
        contextLevel: 'event',
        children: [
          {
            id: 'expenses-submissions',
            label: 'Submissions',
            href: '/p/:productionId/expenses',
            contextLevel: 'event',
          },
          {
            id: 'expenses-categories',
            label: 'Categories',
            href: '/p/:productionId/expenses/categories',
            contextLevel: 'event',
          },
          {
            id: 'expenses-reports',
            label: 'Reports',
            href: '/p/:productionId/expenses/reports',
            contextLevel: 'event',
          },
        ],
      },
      {
        id: 'sponsors',
        label: 'Sponsors',
        href: '/p/:productionId/sponsors',
        icon: Handshake,
        contextLevel: 'event',
        eventRoles: ['executive_producer', 'production_manager', 'finance_manager', 'marketing_manager'],
        children: [
          {
            id: 'sponsors-list',
            label: 'All Sponsors',
            href: '/p/:productionId/sponsors',
            contextLevel: 'event',
          },
          {
            id: 'sponsors-tiers',
            label: 'Tiers',
            href: '/p/:productionId/sponsors/tiers',
            contextLevel: 'event',
          },
          {
            id: 'sponsors-deliverables',
            label: 'Deliverables',
            href: '/p/:productionId/sponsors/deliverables',
            contextLevel: 'event',
          },
        ],
      },
      {
        id: 'investors',
        label: 'Investors',
        href: '/p/:productionId/investors',
        icon: TrendingUp,
        contextLevel: 'event',
        eventRoles: ['executive_producer', 'finance_manager'],
        children: [
          {
            id: 'investors-list',
            label: 'All Investors',
            href: '/p/:productionId/investors',
            contextLevel: 'event',
          },
          {
            id: 'investors-rounds',
            label: 'Rounds',
            href: '/p/:productionId/investors/rounds',
            contextLevel: 'event',
          },
        ],
      },
      {
        id: 'invoices',
        label: 'Invoices',
        href: '/p/:productionId/invoices',
        icon: FileText,
        contextLevel: 'event',
        eventRoles: ['executive_producer', 'production_manager', 'finance_manager'],
      },
      {
        id: 'contracts',
        label: 'Contracts',
        href: '/p/:productionId/contracts',
        icon: FileCheck,
        contextLevel: 'event',
      },
      {
        id: 'procurement',
        label: 'Procurement',
        href: '/p/:productionId/procurement',
        icon: Package,
        contextLevel: 'event',
        children: [
          {
            id: 'procurement-rfps',
            label: 'RFPs',
            href: '/p/:productionId/rfp',
            contextLevel: 'event',
          },
          {
            id: 'procurement-quotes',
            label: 'Quotes',
            href: '/p/:productionId/quotes',
            contextLevel: 'event',
          },
        ],
      },
    ],
  },
  {
    id: 'compliance',
    title: 'Compliance',
    collapsible: true,
    items: [
      {
        id: 'permits',
        label: 'Permits',
        href: '/p/:productionId/permits',
        icon: FileCheck,
        contextLevel: 'event',
      },
      {
        id: 'insurance',
        label: 'Insurance',
        href: '/p/:productionId/insurance',
        icon: Shield,
        contextLevel: 'event',
      },
      {
        id: 'legal',
        label: 'Legal',
        href: '/p/:productionId/legal',
        icon: Scale,
        contextLevel: 'event',
        eventRoles: ['executive_producer', 'production_manager'],
      },
      {
        id: 'governance',
        label: 'Governance',
        href: '/p/:productionId/governance',
        icon: Flag,
        contextLevel: 'event',
        eventRoles: ['executive_producer'],
      },
      {
        id: 'risks',
        label: 'Risks',
        href: '/p/:productionId/risks',
        icon: AlertTriangle,
        contextLevel: 'event',
      },
    ],
  },
  {
    id: 'marketing',
    title: 'Marketing',
    collapsible: true,
    items: [
      {
        id: 'marketing-campaigns',
        label: 'Campaigns',
        href: '/p/:productionId/marketing',
        icon: Megaphone,
        contextLevel: 'event',
        eventRoles: ['executive_producer', 'marketing_manager'],
      },
      {
        id: 'marketing-partnerships',
        label: 'Partnerships',
        href: '/p/:productionId/partnerships',
        icon: Handshake,
        contextLevel: 'event',
      },
      {
        id: 'marketing-ip',
        label: 'IP Tracking',
        href: '/p/:productionId/ip-tracking',
        icon: Lightbulb,
        contextLevel: 'event',
        eventRoles: ['executive_producer', 'marketing_manager'],
      },
    ],
  },
  {
    id: 'metrics',
    title: 'Metrics',
    collapsible: true,
    items: [
      {
        id: 'metrics-dashboard',
        label: 'Dashboard',
        href: '/p/:productionId/metrics',
        icon: BarChart3,
        contextLevel: 'event',
      },
      {
        id: 'metrics-kpis',
        label: 'KPIs',
        href: '/p/:productionId/metrics/kpis',
        icon: Target,
        contextLevel: 'event',
      },
      {
        id: 'metrics-reports',
        label: 'Reports',
        href: '/p/:productionId/metrics/reports',
        icon: FileText,
        contextLevel: 'event',
      },
      {
        id: 'metrics-okrs',
        label: 'OKRs',
        href: '/p/:productionId/okrs',
        icon: Flag,
        contextLevel: 'event',
        eventRoles: ['executive_producer', 'production_manager'],
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
        label: 'Files',
        href: '/p/:productionId/documents',
        icon: FileText,
        contextLevel: 'event',
      },
      {
        id: 'documents-generator',
        label: 'Generator',
        href: '/p/:productionId/generator',
        icon: Sparkles,
        contextLevel: 'event',
        description: 'AI Experience Generator',
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
