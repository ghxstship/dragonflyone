/**
 * UI v2 Patterns - Opinionated Complete Components
 *
 * Phase 4 Complete - 15 Pattern Components:
 * - App Shell: AppShell, PageHeader, PageContent, PageFooter (4)
 * - Auth: SignInForm, SignUpForm, ResetPasswordForm, MFAForm (4)
 * - Dashboard: DashboardGrid, WidgetContainer, StatCard (3)
 * - Pages: ListPage, GridPage, BoardPage, DetailPage, EditPage, CreatePage (6)
 */

// =============================================================================
// App Shell Patterns
// =============================================================================

export { AppShell } from './app-shell';
export type { AppShellProps } from './app-shell';

export { PageHeader } from './page-header';
export type { PageHeaderProps } from './page-header';

export { PageContent } from './page-content';
export type { PageContentProps } from './page-content';

export { PageFooter } from './page-footer';
export type { PageFooterProps, FooterLink } from './page-footer';

// =============================================================================
// Auth Patterns
// =============================================================================

export { SignInForm } from './sign-in-form';
export type { SignInFormProps } from './sign-in-form';

export { SignUpForm } from './sign-up-form';
export type { SignUpFormProps, SignUpFormData } from './sign-up-form';

export { ResetPasswordForm } from './reset-password-form';
export type { ResetPasswordFormProps } from './reset-password-form';

export { MFAForm } from './mfa-form';
export type { MFAFormProps } from './mfa-form';

// =============================================================================
// Dashboard Patterns
// =============================================================================

export { DashboardGrid } from './dashboard-grid';
export type { DashboardGridProps } from './dashboard-grid';

export { WidgetContainer } from './widget-container';
export type { WidgetContainerProps } from './widget-container';

export { StatCard } from './stat-card';
export type { StatCardProps } from './stat-card';

// =============================================================================
// Page Patterns
// =============================================================================

export { ListPage } from './list-page';
export type { ListPageProps } from './list-page';

export { GridPage } from './grid-page';
export type { GridPageProps } from './grid-page';

export { BoardPage } from './board-page';
export type { BoardPageProps } from './board-page';

export { DetailPage } from './detail-page';
export type { DetailPageProps } from './detail-page';

export { EditPage } from './edit-page';
export type { EditPageProps } from './edit-page';

export { CreatePage } from './create-page';
export type { CreatePageProps } from './create-page';
