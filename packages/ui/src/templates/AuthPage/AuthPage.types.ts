import type { ReactNode, HTMLAttributes } from "react";

export interface AuthPageProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  /** App name displayed in header (used for default header) */
  appName?: string;
  /** Link destination for app logo */
  appHref?: string;
  /** Header action (e.g., Sign Up button) - used with default header */
  headerAction?: ReactNode;
  /** Custom header component - replaces default header when provided */
  header?: ReactNode;
  /** Page title */
  title?: string;
  /** Page subtitle */
  subtitle?: string;
  /** Footer link (e.g., "Already have an account? Sign in") */
  footer?: { text: string; linkText: string; linkHref: string };
  /** Main content */
  children: ReactNode;
  /** Footer links */
  footerLinks?: Array<{ label: string; href: string }>;
  /** Background theme */
  background?: "white" | "black" | "ink";
  /** Dark/light theme (alias for background) */
  inverted?: boolean;
  /** Copyright text */
  copyright?: string;
  /** Loading state */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** Error state */
  error?: Error | null;
  /** Error retry handler */
  onRetry?: () => void;
  /** Offline state */
  offline?: boolean;
  /** Skip to main content label */
  skipToMainLabel?: string;
  /** Main content id for skip link */
  mainContentId?: string;
  /** Content max width */
  contentMaxWidth?: "sm" | "md" | "lg";
  /** Show pattern background */
  showPattern?: boolean;
  /** Pattern type */
  patternType?: "grid" | "halftone" | "none";
}
