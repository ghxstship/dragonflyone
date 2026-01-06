"use client";

import { forwardRef, useState, useCallback, createContext, useContext } from "react";
import clsx from "clsx";
import { 
  aiChatLayoutVariants,
  aiChatHeaderVariants,
  aiChatSidebarVariants,
  aiChatMainVariants,
  aiChatArtifactVariants
} from "./AIChatLayout.variants.js";
import type { 
  AIChatLayoutProps,
  AIChatHeaderProps,
  AIChatSidebarProps,
  AIChatMainProps,
  AIChatArtifactProps,
  AIChatLayoutContextValue,
  AIChatLayoutProviderProps
} from "./AIChatLayout.types.js";

// =============================================================================
// AI CHAT HEADER
// =============================================================================

export const AIChatHeader = forwardRef<HTMLDivElement, AIChatHeaderProps>(
  function AIChatHeader({ left, center, right = false, className, ...props }, ref) {
    return (
      <header
        ref={ref}
        className={clsx(aiChatHeaderVariants({}), className)}
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
  function AIChatSidebar({ header, children, footer = false, className, ...props }, ref) {
    return (
      <aside
        ref={ref}
        className={clsx(aiChatSidebarVariants({}), className)}
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
    { messages, input, emptyState, showEmptyState = false = false, className, ...props },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={clsx(aiChatMainVariants({}), className)}
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
  function AIChatArtifact({ header, children, footer = false, className, ...props }, ref) {
    return (
      <aside
        ref={ref}
        className={clsx(aiChatArtifactVariants({}), className)}
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
        className={clsx(aiChatLayoutVariants({}), className)}
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

const AIChatLayoutContext = createContext<AIChatLayoutContextValue | null>(null);

export function useAIChatLayout() {
  const context = useContext(AIChatLayoutContext);
  if (!context) {
    throw new Error("useAIChatLayout must be used within an AIChatLayoutProvider");
  }
  return context;
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
// DISPLAY NAMES
// =============================================================================

AIChatHeader.displayName = "AIChatHeader";
AIChatSidebar.displayName = "AIChatSidebar";
AIChatMain.displayName = "AIChatMain";
AIChatArtifact.displayName = "AIChatArtifact";
AIChatLayout.displayName = "AIChatLayout";

// =============================================================================
// EXPORTS
// =============================================================================

export default AIChatLayout;
