import type { HTMLAttributes, ReactNode } from "react";

export type NavItem = {
  label: string;
  href: string;
};

export type AppNavigationProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  /** Application name displayed as logo */
  logo: string;
  /** Navigation items */
  navItems: NavItem[];
  /** Primary CTA button */
  primaryCta?: { label: string; href: string };
  /** Secondary CTA button */
  secondaryCta?: { label: string; href: string };
  /** Current pathname for active state detection */
  pathname?: string;
  /** Color scheme */
  colorScheme?: "ink" | "black";
  /** Custom logo component */
  logoComponent?: ReactNode;
  /** Callback when mobile menu state changes */
  onMobileMenuChange?: (isOpen: boolean) => void;
};
