"use client";

import { forwardRef, useState, useCallback, type ReactNode, type HTMLAttributes } from "react";
import clsx from "clsx";

// =============================================================================
// AI CHAT LAYOUT - Reusable AI Agent Interface
// Industry best practices layout inspired by Claude, ChatGPT, Gemini
// Features:
// - Collapsible conversation history sidebar
// - Main chat area with bottom-fixed input
// - Collapsible artifact/preview panel
// - Responsive design with mobile support
// - Full keyboard accessibility
// =============================================================================

// =============================================================================
// TYPES
// =============================================================================

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

// =============================================================================
// AI CHAT HEADER
// =============================================================================

export const AIChatHeader = forwardRef<HTMLDivElement, AIChatHeaderProps>(
  function AIChatHeader({ left, center, right, inverted = false, className, ...props }, ref) {
    return (
      <header
        ref={ref}
        className={clsx(
          "flex h-14 shrink-0 items-center justify-between border-b-2 px-4",
          inverted
            ? "border-border bg-surface-elevated"
            : "border-border bg-surface-primary",
          className
        )}
        {...props}
      >
        {/* Left Section */}
        <div className="flex items-center gap-sm">{left}</div>

        {/* Center Section */}
        {center && <div className="flex items-center">{center}</div>}

        {/* Right Section */}
        <div className="flex items-center gap-sm">{right}</div>
      </header>
    );
  }
);

// =============================================================================
// AI CHAT SIDEBAR
// =============================================================================

export const AIChatSidebar = forwardRef<HTMLElement, AIChatSidebarProps>(
  function AIChatSidebar({ header, children, footer, inverted = false, className, ...props }, ref) {
    return (
      <aside
        ref={ref}
        className={clsx(
          "flex h-full flex-col",
          inverted ? "bg-surface-elevated" : "bg-muted",
          className
        )}
        {...props}
      >
        {/* Sidebar Header */}
        {header && (
          <div
            className={clsx(
              "shrink-0 border-b-2 p-4",
              inverted ? "border-border" : "border-border"
            )}
          >
            {header}
          </div>
        )}

        {/* Sidebar Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-2">{children}</div>

        {/* Sidebar Footer */}
        {footer && (
          <div
            className={clsx(
              "shrink-0 border-t-2 p-4",
              inverted ? "border-border" : "border-border"
            )}
          >
            {footer}
          </div>
        )}
      </aside>
    );
  }
);

// =============================================================================
// AI CHAT MAIN AREA
// =============================================================================

export const AIChatMain = forwardRef<HTMLDivElement, AIChatMainProps>(
  function AIChatMain(
    { messages, input, emptyState, showEmptyState = false, inverted = false, className, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={clsx(
          "flex h-full flex-col",
          inverted ? "bg-surface-inverse" : "bg-surface-primary",
          className
        )}
        {...props}
      >
        {/* Messages Area - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          {showEmptyState && emptyState ? emptyState : messages}
        </div>

        {/* Input Area - Fixed at bottom */}
        <div
          className={clsx(
            "shrink-0 border-t-2 p-4",
            inverted ? "border-border bg-surface-elevated" : "border-border bg-muted"
          )}
        >
          {input}
        </div>
      </div>
    );
  }
);

// =============================================================================
// AI CHAT ARTIFACT PANEL
// =============================================================================

export const AIChatArtifact = forwardRef<HTMLElement, AIChatArtifactProps>(
  function AIChatArtifact({ header, children, footer, inverted = false, className, ...props }, ref) {
    return (
      <aside
        ref={ref}
        className={clsx(
          "flex h-full flex-col",
          inverted ? "bg-surface-elevated" : "bg-surface-primary",
          className
        )}
        {...props}
      >
        {/* Artifact Header */}
        {header && (
          <div
            className={clsx(
              "shrink-0 border-b-2 p-4",
              inverted ? "border-border" : "border-border"
            )}
          >
            {header}
          </div>
        )}

        {/* Artifact Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">{children}</div>

        {/* Artifact Footer */}
        {footer && (
          <div
            className={clsx(
              "shrink-0 border-t-2 p-4",
              inverted ? "border-border" : "border-border"
            )}
          >
            {footer}
          </div>
        )}
      </aside>
    );
  }
);

// =============================================================================
// AI CHAT LAYOUT - MAIN COMPONENT
// =============================================================================

export const AIChatLayout = forwardRef<HTMLDivElement, AIChatLayoutProps>(
  function AIChatLayout(
    {
      sidebar,
      main,
      artifact,
      header,
      sidebarCollapsed = true,
      artifactCollapsed = false,
      showArtifact = false,
      inverted = false,
      className,
    },
    ref
  ) {

    return (
      <div
        ref={ref}
        className={clsx(
          "flex h-screen flex-col",
          inverted ? "bg-surface-inverse" : "bg-surface-primary",
          className
        )}
      >
        {/* Header */}
        {header}

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Conversation History */}
          {sidebar && (
            <div
              className={clsx(
                "shrink-0 overflow-hidden border-r-2 transition-all duration-200",
                inverted ? "border-border" : "border-border",
                sidebarCollapsed ? "w-0" : "w-64 lg:w-72"
              )}
              aria-hidden={sidebarCollapsed}
            >
              {!sidebarCollapsed && sidebar}
            </div>
          )}

          {/* Main Chat Area */}
          <div className="flex flex-1 flex-col overflow-hidden">{main}</div>

          {/* Artifact Panel */}
          {showArtifact && artifact && (
            <div
              className={clsx(
                "shrink-0 overflow-hidden border-l-2 transition-all duration-200",
                inverted ? "border-border" : "border-border",
                artifactCollapsed ? "w-0" : "w-80 lg:w-96 xl:w-96"
              )}
              aria-hidden={artifactCollapsed}
            >
              {!artifactCollapsed && artifact}
            </div>
          )}
        </div>
      </div>
    );
  }
);

// =============================================================================
// CONTEXT FOR LAYOUT CONTROLS
// =============================================================================

import { createContext, useContext } from "react";

interface AIChatLayoutContextValue {
  sidebarCollapsed: boolean;
  artifactCollapsed: boolean;
  showArtifact: boolean;
  toggleSidebar: () => void;
  toggleArtifact: () => void;
}

const AIChatLayoutContext = createContext<AIChatLayoutContextValue | null>(null);

export function useAIChatLayout() {
  const context = useContext(AIChatLayoutContext);
  if (!context) {
    throw new Error("useAIChatLayout must be used within an AIChatLayoutProvider");
  }
  return context;
}

export interface AIChatLayoutProviderProps {
  children: ReactNode;
  defaultSidebarCollapsed?: boolean;
  defaultArtifactCollapsed?: boolean;
  showArtifact?: boolean;
}

export function AIChatLayoutProvider({
  children,
  defaultSidebarCollapsed = true,
  defaultArtifactCollapsed = false,
  showArtifact = false,
}: AIChatLayoutProviderProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultSidebarCollapsed);
  const [artifactCollapsed, setArtifactCollapsed] = useState(defaultArtifactCollapsed);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const toggleArtifact = useCallback(() => {
    setArtifactCollapsed((prev) => !prev);
  }, []);

  return (
    <AIChatLayoutContext.Provider
      value={{
        sidebarCollapsed,
        artifactCollapsed,
        showArtifact,
        toggleSidebar,
        toggleArtifact,
      }}
    >
      {children}
    </AIChatLayoutContext.Provider>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export default AIChatLayout;
