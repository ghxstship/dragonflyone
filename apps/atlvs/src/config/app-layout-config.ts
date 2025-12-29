import type { BaseAppLayoutConfig } from "@ghxstship/config/layouts";
import { 
  atlvsSidebarNavigation, 
  atlvsProductionNavigation,
  atlvsQuickActions,
  atlvsDemoProductions,
  atlvsDemoTeams,
  atlvsDemoWorkspaces,
  atlvsDemoOrganizations,
  atlvsBottomNavigation,
} from "../data/atlvs";
import { CreatorNavigationPublic } from "../components/navigation";

/**
 * ATLVS App Layout Configuration
 * Defines all app-specific data for the BaseAppLayout hook
 */
export const atlvsLayoutConfig: BaseAppLayoutConfig = {
  appId: "atlvs",
  appName: "ATLVS",
  defaultBackground: "black",
  sidebarNavigation: atlvsSidebarNavigation,
  productionNavigation: atlvsProductionNavigation,
  quickActions: atlvsQuickActions,
  bottomNavigation: atlvsBottomNavigation,
  demoOrganizations: atlvsDemoOrganizations,
  demoProductions: atlvsDemoProductions,
  demoTeams: atlvsDemoTeams,
  demoWorkspaces: atlvsDemoWorkspaces,
  actionCommands: [
    { label: "New Deal", href: "/deals/new", shortcut: "D" },
    { label: "New Project", href: "/projects/new", shortcut: "P" },
    { label: "New Contact", href: "/contacts/new", shortcut: "C" },
    { label: "New Invoice", href: "/invoices/new", shortcut: "I" },
    { label: "Search", href: "/search", shortcut: "/" },
  ],
  contextualCommands: [
    { id: 'ctx-new-deal', label: 'Create New Deal', href: '/deals/new', contextPaths: ['/deals*', '/pipeline*'] },
    { id: 'ctx-export-deals', label: 'Export Deals', href: '/deals/export', contextPaths: ['/deals*'] },
    { id: 'ctx-new-contact', label: 'Add New Contact', href: '/contacts/new', contextPaths: ['/contacts*'] },
    { id: 'ctx-import-contacts', label: 'Import Contacts', href: '/contacts/import', contextPaths: ['/contacts*'] },
    { id: 'ctx-new-invoice', label: 'Create Invoice', href: '/invoices/new', contextPaths: ['/invoices*', '/finance*'] },
    { id: 'ctx-new-project', label: 'Create Project', href: '/projects/new', contextPaths: ['/projects*'] },
    { id: 'ctx-production-overview', label: 'Production Overview', href: '/p/${productionId}/overview', contextPaths: ['/p/*'] },
  ],
  footerColumns: [
    {
      title: "Product",
      links: [
        { label: "Features", href: "/features" },
        { label: "Pricing", href: "/pricing" },
        { label: "Integrations", href: "/integrations" },
        { label: "Security", href: "/security" },
        { label: "What's New", href: "/changelog" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Help Center", href: "/help" },
        { label: "API Docs", href: "/docs/api" },
        { label: "Blog", href: "/blog" },
        { label: "Guides", href: "/guides" },
        { label: "Case Studies", href: "/case-studies" },
        { label: "Templates", href: "/templates" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Careers", href: "/careers" },
        { label: "Press", href: "/press" },
        { label: "Partners", href: "/partners" },
        { label: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "/legal/privacy" },
        { label: "Terms", href: "/legal/terms" },
        { label: "Cookies", href: "/legal/cookies" },
        { label: "Accessibility", href: "/legal/accessibility" },
        { label: "Status", href: "/status" },
      ],
    },
  ],
  PublicNavigation: CreatorNavigationPublic,
  notifications: [
    { id: "1", title: "New project created", message: "Project 'Summer Campaign' was created", time: "2 min ago", read: false },
    { id: "2", title: "Budget approved", message: "Q4 budget has been approved by finance", time: "1 hour ago", read: false },
    { id: "3", title: "Team member added", message: "Sarah joined the Marketing team", time: "3 hours ago", read: true },
  ],
};
