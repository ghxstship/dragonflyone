import type { BaseAppLayoutConfig } from "@ghxstship/config/layouts";
import { 
  compvssSidebarNavigation, 
  compvssProductionNavigation,
  compvssQuickActions,
  compvssDemoProductions,
  compvssDemoOrganizations,
  compvssDemoTeams,
  compvssDemoWorkspaces,
  compvssBottomNavigation,
} from "../data/compvss";
import { CreatorNavigationPublic } from "../components/navigation";

/**
 * COMPVSS App Layout Configuration
 * Defines all app-specific data for the BaseAppLayout hook
 */
export const compvssLayoutConfig: BaseAppLayoutConfig = {
  appId: "compvss",
  appName: "COMPVSS",
  defaultBackground: "white",
  sidebarNavigation: compvssSidebarNavigation,
  productionNavigation: compvssProductionNavigation,
  quickActions: compvssQuickActions,
  bottomNavigation: compvssBottomNavigation,
  demoOrganizations: compvssDemoOrganizations,
  demoProductions: compvssDemoProductions,
  demoTeams: compvssDemoTeams,
  demoWorkspaces: compvssDemoWorkspaces,
  actionCommands: [
    { label: "New Crew Member", href: "/crew/new", shortcut: "C" },
    { label: "New Schedule", href: "/schedule/new", shortcut: "S" },
    { label: "New Equipment", href: "/equipment/new", shortcut: "E" },
    { label: "Search", href: "/search", shortcut: "/" },
  ],
  contextualCommands: [
    { id: 'ctx-assign-crew', label: 'Assign Crew', href: '/crew/assign', contextPaths: ['/crew*', '/p/*/crew*'] },
    { id: 'ctx-new-crew', label: 'Add Crew Member', href: '/crew/new', contextPaths: ['/crew*'] },
    { id: 'ctx-new-schedule', label: 'Create Schedule', href: '/schedule/new', contextPaths: ['/schedule*', '/run-of-show*'] },
    { id: 'ctx-new-advance', label: 'New Advance Request', href: '/advancing/new', contextPaths: ['/advancing*'] },
    { id: 'ctx-report-incident', label: 'Report Incident', href: '/incidents/new', contextPaths: ['/safety*', '/incidents*'] },
    { id: 'ctx-production-overview', label: 'Production Overview', href: '/p/${productionId}/overview', contextPaths: ['/p/*'] },
  ],
  footerColumns: [
    {
      title: "Operations",
      links: [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Projects", href: "/projects" },
        { label: "Crew", href: "/crew" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Equipment", href: "/equipment" },
        { label: "Schedule", href: "/schedule" },
        { label: "Directory", href: "/directory" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "/help" },
        { label: "Contact", href: "/help#contact" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy", href: "/legal/privacy" },
        { label: "Terms", href: "/legal/terms" },
      ],
    },
  ],
  PublicNavigation: CreatorNavigationPublic,
  notifications: [
    { id: "1", title: "Crew assignment", message: "John was assigned to Stage A", time: "5 min ago", read: false },
    { id: "2", title: "Equipment check", message: "Sound system maintenance complete", time: "2 hours ago", read: true },
  ],
};
