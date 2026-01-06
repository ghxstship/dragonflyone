"use client";

/**
 * Local copy of layout/navigation types to avoid importing from @ghxstship/ui.
 * Importing from @ghxstship/ui created a cyclic dependency between the packages
 * because @ghxstship/ui already depends on @ghxstship/config for hooks and
 * providers. These mirrored types keep the config package standalone.
 */

export interface SidebarNavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  primary?: boolean;
  disabled?: boolean;
  shortcut?: string;
  description?: string;
}

export interface SidebarNavSubsection {
  id: string;
  title: string;
  items: SidebarNavItem[];
}

export interface SidebarNavSection {
  id: string;
  title: string;
  icon?: string;
  items: SidebarNavItem[];
  subsections?: SidebarNavSubsection[];
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export interface ContextItem {
  id: string;
  name: string;
  slug?: string;
  href?: string;
}

export interface ContextLevel {
  label: string;
  current: ContextItem | null;
  items: ContextItem[];
  onSelect?: (item: ContextItem) => void;
}

export interface BreadcrumbContextItem {
  id: string;
  name: string;
  type: "organization" | "project" | "team" | "workspace";
  href?: string;
}

export interface ContextOptions {
  organizations?: Array<{ id: string; name: string; current?: boolean }>;
  projects?: Array<{ id: string; name: string; status?: string; current?: boolean }>;
  teams?: Array<{ id: string; name: string; current?: boolean }>;
  workspaces?: Array<{ id: string; name: string; current?: boolean }>;
}
