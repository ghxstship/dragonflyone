// Shared layout utilities for all GHXSTSHIP apps

// Authenticated layout - requires login + platform access
export { createAuthenticatedLayout } from './createAuthenticatedLayout';
export type { AuthenticatedLayoutConfig } from './createAuthenticatedLayout';

// Marketing layout - public pages, no auth required
export { createMarketingLayout } from './createMarketingLayout';
export type { MarketingLayoutConfig } from './createMarketingLayout';

// Portal layout - external stakeholders with token/magic-link auth (minimal)
export { createPortalLayout } from './createPortalLayout';
export type { PortalLayoutConfig, PortalAuthType } from './createPortalLayout';

// Client Portal layout - external stakeholders with full dashboard experience
export { createClientPortalLayout } from './createClientPortalLayout';
export type { ClientPortalLayoutConfig, ClientPortalAuthType, ClientPortalNavItem } from './createClientPortalLayout';

// Consumer layout - public browsing with optional auth (GVTEWAY)
export { createConsumerLayout } from './createConsumerLayout';
export type { ConsumerLayoutConfig } from './createConsumerLayout';

// Base app layout hook and types
export { useBaseAppLayout } from './BaseAppLayout';
export type {
  BaseAppLayoutConfig,
  BaseAppLayoutProps,
  BaseAppLayoutHookResult,
  DemoOrganization,
  DemoProduction,
  DemoTeam,
  DemoWorkspace,
  QuickAction,
  ActionCommand,
  ContextualCommand,
  BottomNavItem,
  FooterColumnConfig,
  Notification,
} from './BaseAppLayout';
