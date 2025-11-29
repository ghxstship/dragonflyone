"use client";

import { forwardRef, ReactNode } from "react";
import clsx from "clsx";

// =============================================================================
// TYPES
// =============================================================================

export interface ContentLayoutProps {
  children: ReactNode;
  /** Dark mode */
  inverted?: boolean;
  /** Additional className */
  className?: string;
}

export interface MainContentProps extends ContentLayoutProps {
  /** Padding size */
  padding?: "none" | "sm" | "md" | "lg";
}

export interface SplitLayoutProps extends ContentLayoutProps {
  /** Main content area */
  main: ReactNode;
  /** Side panel content */
  side: ReactNode;
  /** Side panel position */
  sidePosition?: "left" | "right";
  /** Side panel width */
  sideWidth?: "sm" | "md" | "lg" | "xl";
  /** Collapsible side panel */
  collapsible?: boolean;
  /** Side panel collapsed state */
  collapsed?: boolean;
  /** Collapse toggle handler */
  onCollapseToggle?: () => void;
  /** Show divider between panels */
  showDivider?: boolean;
}

export interface PanelLayoutProps extends ContentLayoutProps {
  /** Panel sections */
  sections: Array<{
    id: string;
    title?: string;
    content: ReactNode;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
  }>;
  /** Panel direction */
  direction?: "horizontal" | "vertical";
  /** Gap between panels */
  gap?: "none" | "sm" | "md" | "lg";
}

export interface ToolbarProps {
  children: ReactNode;
  /** Position */
  position?: "top" | "bottom";
  /** Sticky */
  sticky?: boolean;
  /** Dark mode */
  inverted?: boolean;
  /** Additional className */
  className?: string;
}

// =============================================================================
// PADDING CLASSES
// =============================================================================

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const sideWidthClasses = {
  sm: "w-64",
  md: "w-80",
  lg: "w-96",
  xl: "w-[420px]",
};

const gapClasses = {
  none: "gap-0",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
};

// =============================================================================
// MAIN CONTENT COMPONENT
// =============================================================================

export const MainContent = forwardRef<HTMLDivElement, MainContentProps>(
  function MainContent({ children, padding = "md", inverted = true, className }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(
          "flex-1 overflow-auto",
          paddingClasses[padding],
          inverted ? "bg-ink-950" : "bg-ink-50",
          className
        )}
      >
        {children}
      </div>
    );
  }
);

// =============================================================================
// SPLIT LAYOUT COMPONENT
// =============================================================================

export const SplitLayout = forwardRef<HTMLDivElement, SplitLayoutProps>(
  function SplitLayout(
    {
      main,
      side,
      sidePosition = "right",
      sideWidth = "md",
      collapsible: _collapsible = false,
      collapsed = false,
      showDivider = true,
      inverted = true,
      className,
    },
    ref
  ) {
    const sidePanel = (
      <aside
        className={clsx(
          "shrink-0 overflow-auto transition-all duration-200",
          collapsed ? "w-0 opacity-0" : sideWidthClasses[sideWidth],
          showDivider && (sidePosition === "left" ? "border-r-2" : "border-l-2"),
          inverted ? "border-ink-800 bg-ink-900" : "border-ink-200 bg-white"
        )}
      >
        {!collapsed && side}
      </aside>
    );

    return (
      <div
        ref={ref}
        className={clsx("flex h-full overflow-hidden", className)}
      >
        {sidePosition === "left" && sidePanel}
        <div className={clsx("flex-1 overflow-auto", inverted ? "bg-ink-950" : "bg-ink-50")}>
          {main}
        </div>
        {sidePosition === "right" && sidePanel}
      </div>
    );
  }
);

// =============================================================================
// PANEL LAYOUT COMPONENT
// =============================================================================

export const PanelLayout = forwardRef<HTMLDivElement, PanelLayoutProps>(
  function PanelLayout(
    { sections, direction = "vertical", gap = "md", inverted = true, className },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={clsx(
          "flex",
          direction === "horizontal" ? "flex-row" : "flex-col",
          gapClasses[gap],
          className
        )}
      >
        {sections.map((section) => (
          <div
            key={section.id}
            className={clsx(
              "rounded border-2",
              inverted ? "border-ink-800 bg-ink-900" : "border-ink-200 bg-white"
            )}
          >
            {section.title && (
              <div
                className={clsx(
                  "px-4 py-3 border-b-2 font-semibold text-sm uppercase tracking-wide",
                  inverted ? "border-ink-800 text-ink-300" : "border-ink-200 text-ink-600"
                )}
              >
                {section.title}
              </div>
            )}
            <div className="p-4">{section.content}</div>
          </div>
        ))}
      </div>
    );
  }
);

// =============================================================================
// TOOLBAR COMPONENT
// =============================================================================

export const Toolbar = forwardRef<HTMLDivElement, ToolbarProps>(
  function Toolbar(
    { children, position = "top", sticky = true, inverted = true, className },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={clsx(
          "flex items-center gap-2 px-4 py-2 border-2",
          position === "top" ? "border-b-2 border-t-0 border-x-0" : "border-t-2 border-b-0 border-x-0",
          sticky && (position === "top" ? "sticky top-0 z-10" : "sticky bottom-0 z-10"),
          inverted ? "bg-ink-900 border-ink-800" : "bg-white border-ink-200",
          className
        )}
      >
        {children}
      </div>
    );
  }
);

// =============================================================================
// CONTENT SECTION COMPONENT
// =============================================================================

export interface ContentSectionProps {
  children: ReactNode;
  /** Section title */
  title?: string;
  /** Section subtitle */
  subtitle?: string;
  /** Section actions */
  actions?: ReactNode;
  /** Collapsible */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Dark mode */
  inverted?: boolean;
  /** Additional className */
  className?: string;
}

export const ContentSection = forwardRef<HTMLDivElement, ContentSectionProps>(
  function ContentSection(
    { children, title, subtitle, actions, collapsible: _collapsible = false, inverted = true, className },
    ref
  ) {
    return (
      <section
        ref={ref}
        className={clsx(
          "rounded border-2",
          inverted ? "border-ink-800 bg-ink-900/50" : "border-ink-200 bg-white",
          className
        )}
      >
        {(title || actions) && (
          <div
            className={clsx(
              "flex items-center justify-between px-5 py-4 border-b-2",
              inverted ? "border-ink-800" : "border-ink-200"
            )}
          >
            <div>
              {title && (
                <h3
                  className={clsx(
                    "font-semibold text-base",
                    inverted ? "text-white" : "text-ink-900"
                  )}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  className={clsx(
                    "text-sm mt-0.5",
                    inverted ? "text-ink-400" : "text-ink-500"
                  )}
                >
                  {subtitle}
                </p>
              )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}
        <div className="p-5">{children}</div>
      </section>
    );
  }
);

// =============================================================================
// KANBAN LAYOUT COMPONENT
// =============================================================================

export interface KanbanColumn {
  id: string;
  title: string;
  count?: number;
  color?: string;
  items: ReactNode;
}

export interface KanbanLayoutProps {
  columns: KanbanColumn[];
  /** Dark mode */
  inverted?: boolean;
  /** Additional className */
  className?: string;
}

export const KanbanLayout = forwardRef<HTMLDivElement, KanbanLayoutProps>(
  function KanbanLayout({ columns, inverted = true, className }, ref) {
    return (
      <div
        ref={ref}
        className={clsx("flex gap-4 overflow-x-auto pb-4", className)}
      >
        {columns.map((column) => (
          <div
            key={column.id}
            className={clsx(
              "flex-shrink-0 w-72 rounded border-2",
              inverted ? "border-ink-800 bg-ink-900" : "border-ink-200 bg-white"
            )}
          >
            {/* Column Header */}
            <div
              className={clsx(
                "flex items-center justify-between px-3 py-2 border-b-2",
                inverted ? "border-ink-800" : "border-ink-200"
              )}
            >
              <div className="flex items-center gap-2">
                {column.color && (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                )}
                <span
                  className={clsx(
                    "font-semibold text-sm",
                    inverted ? "text-white" : "text-ink-900"
                  )}
                >
                  {column.title}
                </span>
                {column.count !== undefined && (
                  <span
                    className={clsx(
                      "px-1.5 py-0.5 text-xs rounded",
                      inverted ? "bg-ink-800 text-ink-400" : "bg-ink-100 text-ink-500"
                    )}
                  >
                    {column.count}
                  </span>
                )}
              </div>
            </div>
            {/* Column Content */}
            <div className="p-2 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
              {column.items}
            </div>
          </div>
        ))}
      </div>
    );
  }
);

// =============================================================================
// KANBAN CARD COMPONENT
// =============================================================================

export interface KanbanCardProps {
  children: ReactNode;
  /** Card title */
  title?: string;
  /** Card subtitle */
  subtitle?: string;
  /** Priority indicator */
  priority?: "low" | "medium" | "high" | "urgent";
  /** Tags */
  tags?: Array<{ label: string; color?: string }>;
  /** Assignee avatar */
  assignee?: { name: string; avatar?: string };
  /** Due date */
  dueDate?: string;
  /** Click handler */
  onClick?: () => void;
  /** Dark mode */
  inverted?: boolean;
  /** Additional className */
  className?: string;
}

const priorityColors = {
  low: "bg-ink-500",
  medium: "bg-accent-500",
  high: "bg-warning-500",
  urgent: "bg-error-500",
};

export const KanbanCard = forwardRef<HTMLDivElement, KanbanCardProps>(
  function KanbanCard(
    {
      children,
      title,
      subtitle,
      priority,
      tags,
      assignee,
      dueDate,
      onClick,
      inverted = true,
      className,
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        onClick={onClick}
        className={clsx(
          "rounded border-2 p-3 transition-all cursor-pointer",
          "hover:shadow-[3px_3px_0] hover:-translate-x-0.5 hover:-translate-y-0.5",
          inverted
            ? "border-ink-700 bg-ink-800 hover:border-ink-600 shadow-primary-500/30"
            : "border-ink-200 bg-white hover:border-ink-300 shadow-primary-500/20",
          className
        )}
      >
        {/* Priority Indicator */}
        {priority && (
          <div className={clsx("w-full h-1 rounded-full mb-2", priorityColors[priority])} />
        )}

        {/* Title */}
        {title && (
          <h4
            className={clsx(
              "font-medium text-sm mb-1",
              inverted ? "text-white" : "text-ink-900"
            )}
          >
            {title}
          </h4>
        )}

        {/* Subtitle */}
        {subtitle && (
          <p
            className={clsx(
              "text-xs mb-2",
              inverted ? "text-ink-400" : "text-ink-500"
            )}
          >
            {subtitle}
          </p>
        )}

        {/* Custom Content */}
        {children}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className={clsx(
                  "px-1.5 py-0.5 text-[10px] rounded font-medium",
                  inverted ? "bg-ink-700 text-ink-300" : "bg-ink-100 text-ink-600"
                )}
                style={tag.color ? { backgroundColor: tag.color, color: "white" } : undefined}
              >
                {tag.label}
              </span>
            ))}
          </div>
        )}

        {/* Footer: Assignee + Due Date */}
        {(assignee || dueDate) && (
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-ink-700">
            {assignee && (
              <div className="flex items-center gap-1.5">
                {assignee.avatar ? (
                  <img
                    src={assignee.avatar}
                    alt={assignee.name}
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  <div
                    className={clsx(
                      "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                      inverted ? "bg-ink-600 text-white" : "bg-ink-200 text-ink-700"
                    )}
                  >
                    {assignee.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span
                  className={clsx(
                    "text-xs",
                    inverted ? "text-ink-400" : "text-ink-500"
                  )}
                >
                  {assignee.name}
                </span>
              </div>
            )}
            {dueDate && (
              <span
                className={clsx(
                  "text-xs",
                  inverted ? "text-ink-500" : "text-ink-400"
                )}
              >
                {dueDate}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  MainContent,
  SplitLayout,
  PanelLayout,
  Toolbar,
  ContentSection,
  KanbanLayout,
  KanbanCard,
};
