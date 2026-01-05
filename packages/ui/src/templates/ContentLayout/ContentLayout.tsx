"use client";

import { forwardRef } from "react";
import clsx from "clsx";
import type {
  MainContentProps,
  SplitLayoutProps,
  PanelLayoutProps,
  ToolbarProps,
  ContentSectionProps,
  KanbanLayoutProps,
  KanbanCardProps,
} from "./ContentLayout.types.js";

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

const priorityColors = {
  low: "bg-muted-foreground",
  medium: "bg-accent-500",
  high: "bg-warning-500",
  urgent: "bg-error-500",
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
          inverted ? "bg-surface-inverse" : "bg-surface-secondary",
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
      collapsible = false,
      collapsed = false,
      onCollapseToggle,
      showDivider = true,
      inverted = true,
      className,
    },
    ref
  ) {
    const sidePanel = (
      <aside
        className={clsx(
          "shrink-0 overflow-auto transition-all duration-200 relative",
          collapsed ? "w-0 opacity-0 overflow-hidden" : sideWidthClasses[sideWidth],
          showDivider && !collapsed && (sidePosition === "left" ? "border-r-2" : "border-l-2"),
          inverted ? "border-border bg-surface-elevated" : "border-border bg-surface-primary"
        )}
        aria-hidden={collapsed}
      >
        {!collapsed && side}
        {collapsible && onCollapseToggle && (
          <button
            onClick={onCollapseToggle}
            className={clsx(
              "absolute top-2 p-1 rounded transition-colors",
              sidePosition === "left" ? "right-2" : "left-2",
              inverted ? "hover:bg-surface-elevated text-text-muted" : "hover:bg-muted text-text-muted"
            )}
            aria-label={collapsed ? "Expand panel" : "Collapse panel"}
          >
            <svg
              className={clsx("size-4 transition-transform", collapsed && "rotate-180")}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={sidePosition === "left" ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"}
              />
            </svg>
          </button>
        )}
      </aside>
    );

    // Collapsed toggle button when panel is collapsed
    const collapsedToggle = collapsible && collapsed && onCollapseToggle && (
      <button
        onClick={onCollapseToggle}
        className={clsx(
          "shrink-0 flex items-center justify-center w-6 transition-colors",
          showDivider && (sidePosition === "left" ? "border-r-2" : "border-l-2"),
          inverted ? "border-border bg-surface-elevated hover:bg-surface-inverse" : "border-border bg-surface-primary hover:bg-muted"
        )}
        aria-label="Expand panel"
      >
        <svg
          className="size-4 text-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={sidePosition === "left" ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"}
          />
        </svg>
      </button>
    );

    return (
      <div
        ref={ref}
        className={clsx("flex h-full overflow-hidden", className)}
      >
        {sidePosition === "left" && (collapsed ? collapsedToggle : sidePanel)}
        <div className={clsx("flex-1 overflow-auto", inverted ? "bg-surface-inverse" : "bg-surface-secondary")}>
          {main}
        </div>
        {sidePosition === "right" && (collapsed ? collapsedToggle : sidePanel)}
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
              inverted ? "border-border bg-surface-elevated" : "border-border bg-surface-primary"
            )}
          >
            {section.title && (
              <div
                className={clsx(
                  "px-4 py-3 border-b-2 font-semibold text-sm uppercase tracking-wide",
                  inverted ? "border-border text-text-secondary" : "border-border text-text-secondary"
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
          sticky && (position === "top" ? "sticky top-0 z-sticky-header" : "sticky bottom-0 z-sticky-header"),
          inverted ? "bg-surface-elevated border-border" : "bg-surface-primary border-border",
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
          inverted ? "border-border bg-surface-elevated/50" : "border-border bg-surface-primary",
          className
        )}
      >
        {(title || actions) && (
          <div
            className={clsx(
              "flex items-center justify-between px-5 py-4 border-b-2",
              inverted ? "border-border" : "border-border"
            )}
          >
            <div>
              {title && (
                <h3
                  className={clsx(
                    "font-semibold text-base",
                    inverted ? "text-text-primary" : "text-text-primary"
                  )}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  className={clsx(
                    "text-sm mt-0.5",
                    inverted ? "text-text-muted" : "text-text-muted"
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
              inverted ? "border-border bg-surface-elevated" : "border-border bg-surface-primary"
            )}
          >
            {/* Column Header */}
            <div
              className={clsx(
                "flex items-center justify-between px-3 py-2 border-b-2",
                inverted ? "border-border" : "border-border"
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
                    inverted ? "text-text-primary" : "text-text-primary"
                  )}
                >
                  {column.title}
                </span>
                {column.count !== undefined && (
                  <span
                    className={clsx(
                      "px-1.5 py-0.5 text-xs rounded",
                      inverted ? "bg-surface-elevated text-text-muted" : "bg-muted text-text-muted"
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
            ? "border-border bg-surface-elevated hover:border-border-primary shadow-primary-500/30"
            : "border-border bg-surface-primary hover:border-border-primary shadow-primary-500/20",
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
              inverted ? "text-text-primary" : "text-text-primary"
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
              inverted ? "text-text-muted" : "text-text-muted"
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
                  inverted ? "bg-surface-elevated text-text-secondary" : "bg-muted text-text-secondary"
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
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
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
                      inverted ? "bg-surface-elevated text-text-primary" : "bg-muted text-text-secondary"
                    )}
                  >
                    {assignee.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span
                  className={clsx(
                    "text-xs",
                    inverted ? "text-text-muted" : "text-text-muted"
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
                  inverted ? "text-text-disabled" : "text-text-disabled"
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
// DISPLAY NAMES
// =============================================================================

MainContent.displayName = "MainContent";
SplitLayout.displayName = "SplitLayout";
PanelLayout.displayName = "PanelLayout";
Toolbar.displayName = "Toolbar";
ContentSection.displayName = "ContentSection";
KanbanLayout.displayName = "KanbanLayout";
KanbanCard.displayName = "KanbanCard";
