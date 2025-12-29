// Shared layout utilities for all GHXSTSHIP apps
export { createAuthenticatedLayout } from './createAuthenticatedLayout';
export type { AuthenticatedLayoutConfig } from './createAuthenticatedLayout';

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
