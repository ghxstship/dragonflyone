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

export { AppShell } from "./app-shell.js";
export type { AppShellProps } from "./app-shell.js";

export { AuthenticatedShell } from "./authenticated-shell.js";
export type { AuthenticatedShellProps } from "./authenticated-shell.js";

export { ClientPortalShell } from "./client-portal-shell.js";
export type { ClientPortalShellProps, ClientPortalNavItem } from "./client-portal-shell.js";

export { DashboardPage } from "./dashboard-page.js";
export type { DashboardPageProps } from "./dashboard-page.js";

// =============================================================================
// CENTERED LAYOUTS
// Single focal point, horizontally and vertically centered
// =============================================================================

export { CenteredLayout } from "./centered-layout.js";
export type { CenteredLayoutProps } from "./centered-layout.js";

export { AuthPage } from "./auth-page.js";
export type { AuthPageProps } from "./auth-page.js";

export { ErrorContent, ErrorPage } from "./error-page.js";
export type { ErrorContentProps, ErrorPageProps } from "./error-page.js";

export { NotFoundContent, NotFoundPage } from "./not-found-page.js";
export type { NotFoundContentProps, NotFoundPageProps } from "./not-found-page.js";

// =============================================================================
// SINGLE COLUMN LAYOUTS
// Linear scrolling content, single column
// =============================================================================

export { SingleColumnLayout } from "./single-column-layout.js";
export type { SingleColumnLayoutProps, TableOfContentsItem } from "./single-column-layout.js";

export { PageLayout } from "./page-layout.js";
export type { PageLayoutProps } from "./page-layout.js";

// =============================================================================
// SPLIT/CONTENT LAYOUTS
// Two-panel layouts and content organization
// =============================================================================

export {
  MainContent,
  SplitLayout,
  PanelLayout,
  Toolbar,
  ContentSection,
  KanbanLayout,
  KanbanCard,
} from "./content-layout.js";
export type {
  MainContentProps,
  SplitLayoutProps,
  PanelLayoutProps,
  ToolbarProps,
  ContentSectionProps,
  KanbanLayoutProps,
  KanbanCardProps,
} from "./content-layout.js";

// =============================================================================
// GRID LAYOUTS
// Multi-item layouts in rows and columns
// =============================================================================

export { GridLayout } from "./grid-layout.js";
export type { GridLayoutProps, GridLayoutFilter } from "./grid-layout.js";

export { SettingsHubPage, SettingsPageLayout } from "./settings-hub-page.js";
export type {
  SettingsHubPageProps,
  SettingsPageLayoutProps,
  SettingsCategory,
  SettingsSection,
} from "./settings-hub-page.js";

// =============================================================================
// LIST/TABLE LAYOUTS
// Data display layouts with sorting, filtering, pagination
// =============================================================================

export { ListPage } from "./list-page.js";
export type { ListPageProps } from "./list-page.js";

export { TableLayout } from "./table-layout.js";
export type { TableLayoutProps, TableColumn, TableFilter } from "./table-layout.js";

// =============================================================================
// DETAIL LAYOUTS
// Single record/entity display
// =============================================================================

export { DetailPage } from "./detail-page.js";
export type { DetailPageProps, DetailPageTab } from "./detail-page.js";

// =============================================================================
// FORM LAYOUTS
// Data entry and editing layouts
// =============================================================================

export { CreatePage } from "./create-page.js";
export type { CreatePageProps, FormSection } from "./create-page.js";

export { EditPage } from "./edit-page.js";
export type { EditPageProps } from "./edit-page.js";

export { WizardPage } from "./wizard-page.js";
export type { WizardPageProps, WizardStep, WizardBanner, BreadcrumbItem } from "./wizard-page.js";

export { SignInForm } from "./sign-in-form.js";
export type { SignInFormProps } from "./sign-in-form.js";

// =============================================================================
// CANVAS LAYOUTS
// Free-form workspace/builder layouts
// =============================================================================

export { CanvasLayout } from "./canvas-layout.js";
export type { CanvasLayoutProps } from "./canvas-layout.js";

// =============================================================================
// OVERLAY LAYOUTS
// Modal, drawer, sheet, and dialog layouts
// =============================================================================

export { OverlayLayout } from "./overlay-layout.js";
export type { OverlayLayoutProps } from "./overlay-layout.js";

// =============================================================================
// MARKETING LAYOUTS
// Full-width marketing and landing page layouts
// =============================================================================

export { MarketingPage } from "./marketing-page.js";
export type { MarketingPageProps, MarketingSection } from "./marketing-page.js";
