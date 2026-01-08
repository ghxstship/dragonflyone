/**
 * UI v2 Patterns - Opinionated Complete Components
 *
 * Phase 4 In Progress - Pattern Components:
 * - App Shell: AppShell, PageHeader, PageContent, PageFooter
 * - Auth: SignInForm, SignUpForm, ResetPasswordForm, MFAForm
 * - Pages: (coming soon)
 * - Dashboard: (coming soon)
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
