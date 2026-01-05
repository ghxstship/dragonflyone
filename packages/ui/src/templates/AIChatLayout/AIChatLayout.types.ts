import type { ReactNode, HTMLAttributes } from "react";

export interface AIChatLayoutProps {
  /** Conversation sidebar content (history, saved chats) */
  sidebar?: ReactNode;
  /** Main chat area content */
  main: ReactNode;
  /** Artifact/preview panel content */
  artifact?: ReactNode;
  /** Header content (branding, actions) */
  header?: ReactNode;
  /** Whether sidebar is collapsed */
  sidebarCollapsed?: boolean;
  /** Whether artifact panel is collapsed */
  artifactCollapsed?: boolean;
  /** Whether artifact panel should be shown */
  showArtifact?: boolean;
  /** Dark mode */
  inverted?: boolean;
  /** Additional className */
  className?: string;
}

export interface AIChatHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Left section content (toggle, branding) */
  left?: ReactNode;
  /** Center section content (title, status) */
  center?: ReactNode;
  /** Right section content (actions, settings) */
  right?: ReactNode;
  /** Dark mode */
  inverted?: boolean;
}

export interface AIChatSidebarProps extends HTMLAttributes<HTMLElement> {
  /** Sidebar header content */
  header?: ReactNode;
  /** Sidebar content (conversation list) */
  children: ReactNode;
  /** Sidebar footer content */
  footer?: ReactNode;
  /** Dark mode */
  inverted?: boolean;
}

export interface AIChatMainProps extends HTMLAttributes<HTMLDivElement> {
  /** Messages area content */
  messages: ReactNode;
  /** Input area content */
  input: ReactNode;
  /** Empty state content (shown when no messages) */
  emptyState?: ReactNode;
  /** Whether to show empty state */
  showEmptyState?: boolean;
  /** Dark mode */
  inverted?: boolean;
}

export interface AIChatArtifactProps extends HTMLAttributes<HTMLElement> {
  /** Artifact header content */
  header?: ReactNode;
  /** Artifact content */
  children: ReactNode;
  /** Artifact footer content */
  footer?: ReactNode;
  /** Dark mode */
  inverted?: boolean;
}

export interface AIChatLayoutContextValue {
  sidebarCollapsed: boolean;
  artifactCollapsed: boolean;
  showArtifact: boolean;
  toggleSidebar: () => void;
  toggleArtifact: () => void;
}

export interface AIChatLayoutProviderProps {
  children: ReactNode;
  defaultSidebarCollapsed?: boolean;
  defaultArtifactCollapsed?: boolean;
  showArtifact?: boolean;
}
