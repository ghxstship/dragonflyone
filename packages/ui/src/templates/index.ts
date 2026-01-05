/**
 * Page Layout Templates
 * Bold Contemporary Pop Art Adventure Design System
 * 
 * This module exports all page layout templates organized by category.
 * Each template follows the consolidated layout system specification.
 */

// =============================================================================
// SHELL LAYOUTS
// Application wrapper layouts with navigation, sidebars, and content areas
// =============================================================================

export { AuthenticatedShell } from "./AuthenticatedShell/index.js";
export type { AuthenticatedShellProps } from "./AuthenticatedShell/AuthenticatedShell.types.js";

export { ClientPortalShell } from "./ClientPortalShell/index.js";
export type { ClientPortalShellProps, ClientPortalNavItem } from "./ClientPortalShell/ClientPortalShell.types.js";

export { DashboardPage } from "./DashboardPage/index.js";
export type { DashboardPageProps } from "./DashboardPage/DashboardPage.types.js";

// =============================================================================
// CENTERED LAYOUTS
// Single focal point, horizontally and vertically centered
// =============================================================================

export { CenteredLayout } from "./CenteredLayout/index.js";
export type { CenteredLayoutProps } from "./CenteredLayout/CenteredLayout.types.js";

export { AuthSplitLayout } from "./AuthSplitLayout/index.js";
export type { AuthSplitLayoutProps } from "./AuthSplitLayout/AuthSplitLayout.types.js";

export { AuthPage } from "./AuthPage/index.js";
export type { AuthPageProps } from "./AuthPage/AuthPage.types.js";

// =============================================================================
// CONTENT LAYOUTS
// Two-panel layouts and content organization
// =============================================================================

export {
  MainContent,
  SplitLayout as ContentSplitLayout,
  PanelLayout,
  Toolbar,
  ContentSection,
  KanbanLayout,
  KanbanCard,
} from "./ContentLayout/index.js";
export type {
  ContentLayoutProps,
  MainContentProps,
  SplitLayoutProps as ContentSplitLayoutProps,
  PanelLayoutProps,
  ToolbarProps,
  ContentSectionProps,
  KanbanLayoutProps,
  KanbanCardProps,
} from "./ContentLayout/ContentLayout.types.js";

// =============================================================================
// LIST/TABLE LAYOUTS
// Data display layouts with sorting, filtering, pagination
// =============================================================================

export { ListPage } from "./ListPage/index.js";
export type { ListPageProps, ListPageColumn, ListPageAction, ViewConfig, ViewIconType } from "./ListPage/ListPage.types.js";

// =============================================================================
// DETAIL LAYOUTS
// Single record/entity display
// =============================================================================

export { DetailPage } from "./DetailPage/index.js";
export type { DetailPageProps, DetailPageTab } from "./DetailPage/DetailPage.types.js";

// =============================================================================
// FORM LAYOUTS
// Data entry and editing layouts
// =============================================================================

export { CreatePage } from "./CreatePage/index.js";
export { EditPage } from "./EditPage/index.js";
export type { CreatePageProps, FormSection } from "./CreatePage/CreatePage.types.js";
export type { EditPageProps } from "./EditPage/EditPage.types.js";

export { HubPage } from "./HubPage/index.js";
export type { HubPageProps, HubItem } from "./HubPage/HubPage.types.js";

export { WizardPage } from "./WizardPage/index.js";
export type { WizardPageProps, WizardStep } from "./WizardPage/WizardPage.types.js";

export { SettingsPageLayout } from "./SettingsPageLayout/index.js";
export type { SettingsPageLayoutProps, SettingsSection } from "./SettingsPageLayout/SettingsPageLayout.types.js";

export { SettingsHubPage } from "./SettingsHubPage/index.js";
export type { SettingsHubPageProps } from "./SettingsHubPage/SettingsHubPage.types.js";

export { MarketingPage } from "./MarketingPage/index.js";
export type { MarketingPageProps } from "./MarketingPage/MarketingPage.types.js";

export { PageLayout } from "./PageLayout/index.js";
export type { PageLayoutProps } from "./PageLayout/PageLayout.types.js";

// =============================================================================
// CANVAS LAYOUTS
// Free-form workspace/builder layouts
// =============================================================================

export { CanvasLayout } from "./CanvasLayout/index.js";
export type { CanvasLayoutProps } from "./CanvasLayout/CanvasLayout.types.js";

// =============================================================================
// AI CHAT LAYOUTS
// Chat interface layouts
// =============================================================================

export { 
  AIChatLayout, 
  AIChatHeader, 
  AIChatSidebar, 
  AIChatMain, 
  AIChatArtifact,
  AIChatLayoutProvider,
  useAIChatLayout 
} from "./AIChatLayout/index.js";
export type { 
  AIChatLayoutProps, 
  AIChatHeaderProps, 
  AIChatSidebarProps, 
  AIChatMainProps, 
  AIChatArtifactProps 
} from "./AIChatLayout/AIChatLayout.types.js";