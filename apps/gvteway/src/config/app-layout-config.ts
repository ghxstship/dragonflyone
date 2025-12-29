import type { BaseAppLayoutConfig } from "@ghxstship/config/layouts";
import { 
  gvtewaySidebarNavigation, 
  gvtewayEventNavigation,
  gvtewayQuickActions,
  gvtewayBottomNavigation,
  gvtewayDemoOrganizations,
} from "../data/gvteway";
import { ConsumerNavigationPublic } from "../components/navigation";

/**
 * GVTEWAY App Layout Configuration
 * Defines all app-specific data for the BaseAppLayout hook
 */
export const gvtewayLayoutConfig: BaseAppLayoutConfig = {
  appId: "gvteway",
  appName: "GVTEWAY",
  defaultBackground: "black",
  sidebarNavigation: gvtewaySidebarNavigation,
  productionNavigation: gvtewayEventNavigation,
  quickActions: gvtewayQuickActions,
  bottomNavigation: gvtewayBottomNavigation,
  demoOrganizations: gvtewayDemoOrganizations,
  demoProductions: [],
  demoTeams: [],
  demoWorkspaces: [],
  actionCommands: [
    { label: "Browse Events", href: "/events", shortcut: "E" },
    { label: "My Tickets", href: "/tickets", shortcut: "T" },
    { label: "Search", href: "/search", shortcut: "/" },
  ],
  contextualCommands: [
    { id: 'ctx-browse-events', label: 'Browse Events', href: '/events', contextPaths: ['/events*'] },
    { id: 'ctx-my-tickets', label: 'My Tickets', href: '/tickets', contextPaths: ['/tickets*', '/orders*'] },
    { id: 'ctx-event-details', label: 'Event Details', href: '/events/${productionId}', contextPaths: ['/events/*'] },
  ],
  footerColumns: [
    {
      title: "Discover",
      links: [
        { label: "Events", href: "/events" },
        { label: "Artists", href: "/artists" },
        { label: "Venues", href: "/venues" },
      ],
    },
    {
      title: "Account",
      links: [
        { label: "My Tickets", href: "/tickets" },
        { label: "Orders", href: "/orders" },
        { label: "Profile", href: "/profile" },
      ],
    },
    {
      title: "Support",
      links: [
        { label: "Help Center", href: "/help" },
        { label: "Contact", href: "/contact" },
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
  PublicNavigation: ConsumerNavigationPublic,
  notifications: [
    { id: "1", title: "Ticket confirmed", message: "Your tickets for Summer Fest are ready", time: "1 hour ago", read: false },
    { id: "2", title: "Event reminder", message: "Jazz Night starts tomorrow at 8 PM", time: "3 hours ago", read: true },
  ],
};
