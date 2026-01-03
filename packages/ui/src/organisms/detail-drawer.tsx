"use client";

import React from "react";
import clsx from "clsx";
import { Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { OverlayLayout } from "../templates/overlay-layout.js";

/**
 * DetailDrawer component - Bold Contemporary Pop Art Adventure
 * 
 * Built on OverlayLayout for consistent accessibility and behavior:
 * - Focus trap
 * - Escape key handling
 * - Body scroll prevention
 * - ARIA attributes
 * 
 * Features:
 * - Bold 2px side border
 * - Slide-in animation
 * - Bold header with high contrast
 * - Action buttons with hover lift
 * - Split-pane mode
 * - Activity timeline slot
 */

export interface DetailSection {
  /** Section identifier */
  id: string;
  /** Section title */
  title: string;
  /** Section content */
  content: React.ReactNode;
  /** Whether section is collapsible */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
}

export interface DetailAction {
  /** Action identifier */
  id: string;
  /** Action label */
  label: string;
  /** Action icon */
  icon?: React.ReactNode;
  /** Action variant */
  variant?: "primary" | "secondary" | "danger";
  /** Whether action is disabled */
  disabled?: boolean;
}

export interface DetailDrawerProps<T = unknown> {
  /** Whether drawer is open */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Record data */
  record: T | null;
  /** Drawer title */
  title?: string | ((record: T) => string);
  /** Subtitle */
  subtitle?: string | ((record: T) => string);
  /** Content sections */
  sections?: DetailSection[];
  /** Header actions */
  actions?: DetailAction[];
  /** Action click handler */
  onAction?: (actionId: string, record: T) => void;
  /** Edit handler */
  onEdit?: (record: T) => void;
  /** Delete handler */
  onDelete?: (record: T) => void;
  /** Drawer width */
  width?: "sm" | "md" | "lg" | "xl";
  /** Position */
  position?: "left" | "right";
  /** Show overlay */
  showOverlay?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Custom className */
  className?: string;
  /** Children for custom content */
  children?: React.ReactNode;
  /** Split-pane mode: show list on left, detail on right */
  splitPane?: boolean;
  /** List content for split-pane mode */
  listContent?: React.ReactNode;
  /** Activity/audit timeline slot */
  activityTimeline?: React.ReactNode;
  /** Undo banner content */
  undoBanner?: React.ReactNode;
}

// Map width prop to OverlayLayout size
const widthToSize: Record<string, "sm" | "md" | "lg" | "xl"> = {
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
};

export function DetailDrawer<T = unknown>({
  open,
  onClose,
  record,
  title,
  subtitle,
  sections = [],
  actions = [],
  onAction,
  onEdit,
  onDelete,
  width = "md",
  position = "right",
  showOverlay = true,
  loading = false,
  className = "",
  children,
  splitPane = false,
  listContent,
  activityTimeline,
  undoBanner,
}: DetailDrawerProps<T>) {
  const getTitle = (): string => {
    if (!record) return "";
    if (typeof title === "function") return title(record);
    return title || "Details";
  };

  const getSubtitle = (): string | undefined => {
    if (!record || !subtitle) return undefined;
    if (typeof subtitle === "function") return subtitle(record);
    return subtitle;
  };

  const drawerTitle = getTitle();
  const drawerSubtitle = getSubtitle();

  // Actions bar content
  const actionsBarContent = (actions.length > 0 || onEdit || onDelete) && record ? (
    <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-muted flex-wrap">
      {onEdit && (
        <button
          type="button"
          onClick={() => onEdit(record)}
          className="flex items-center gap-2 px-3 py-2 font-mono text-sm tracking-wide uppercase bg-surface-inverse text-text-primary border-2 border-border cursor-pointer transition-colors duration-100 hover:bg-surface-elevated"
        >
          <Pencil className="size-4" /> Edit
        </button>
      )}

      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={() => onAction?.(action.id, record)}
          disabled={action.disabled}
          className={clsx(
            "flex items-center gap-2 px-3 py-2 font-mono text-sm tracking-wide uppercase border-2 border-border transition-colors duration-100",
            action.variant === "primary"
              ? "bg-surface-inverse text-text-primary hover:bg-surface-elevated"
              : action.variant === "danger"
              ? "bg-surface-primary text-error hover:bg-muted"
              : "bg-surface-primary text-text-primary hover:bg-muted",
            action.disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
          )}
        >
          {action.icon && <span>{action.icon}</span>}
          {action.label}
        </button>
      ))}

      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(record)}
          className="flex items-center gap-2 px-3 py-2 font-mono text-sm tracking-wide uppercase bg-surface-primary text-error border-2 border-border cursor-pointer transition-colors duration-100 ml-auto hover:bg-muted"
        >
          <Trash2 className="size-4" /> Delete
        </button>
      )}
    </div>
  ) : null;

  // Render content based on split-pane mode
  const renderContent = () => {
    if (splitPane) {
      return (
        <div className="flex-1 flex overflow-hidden -mx-6 -mb-6">
          {/* List pane */}
          <div className="w-1/3 min-w-[200px] border-r-2 border-border overflow-auto bg-muted">
            {listContent}
          </div>
          {/* Detail pane */}
          <div className="flex-1 overflow-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-8 h-8 border-2 border-border border-t-on-light-primary rounded-full animate-spin" />
              </div>
            ) : record ? (
              <>
                {sections.map((section) => (
                  <DetailSectionComponent key={section.id} section={section} />
                ))}
                {children}
                {activityTimeline && (
                  <div className="mt-6 pt-6 border-t-2 border-border">
                    <h3 className="font-mono text-base tracking-widest uppercase text-text-muted mb-4">
                      Activity
                    </h3>
                    {activityTimeline}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-12 text-text-muted font-mono text-base">
                Select an item from the list
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-border border-t-on-light-primary rounded-full animate-spin" />
          </div>
        ) : record ? (
          <>
            {sections.map((section) => (
              <DetailSectionComponent key={section.id} section={section} />
            ))}
            {children}
            {activityTimeline && (
              <div className="mt-6 pt-6 border-t-2 border-border">
                <h3 className="font-mono text-base tracking-widest uppercase text-text-muted mb-4">
                  Activity
                </h3>
                {activityTimeline}
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-12 text-text-muted font-mono text-base">
            No record selected
          </div>
        )}
      </>
    );
  };

  return (
    <OverlayLayout
      type="drawer"
      size={widthToSize[width]}
      position={position}
      open={open}
      onClose={onClose}
      title={drawerTitle}
      subtitle={drawerSubtitle}
      closeOnEscape
      closeOnBackdrop={showOverlay}
      preventScroll
      animation="slide"
      inverted={false}
      showClose
      className={className}
      ariaLabel={drawerTitle || "Details"}
      mobileType="sheet"
    >
      {/* Actions bar */}
      {actionsBarContent}

      {/* Undo Banner */}
      {undoBanner && (
        <div className="px-6 py-3 bg-warning/10 border-b-2 border-warning -mx-6 mb-4">
          {undoBanner}
        </div>
      )}

      {/* Content */}
      {renderContent()}
    </OverlayLayout>
  );
}

// Section component
function DetailSectionComponent({ section }: { section: DetailSection }) {
  const [collapsed, setCollapsed] = React.useState(section.defaultCollapsed ?? false);

  return (
    <div className="mb-spacing-6 border-b border-border pb-spacing-6">
      <div
        className={clsx(
          "flex items-center justify-between",
          collapsed ? "mb-spacing-0" : "mb-spacing-4"
        )}
      >
        <h3 className="font-code text-mono-md tracking-widest uppercase text-text-disabled">
          {section.title}
        </h3>

        {section.collapsible && (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-spacing-1 bg-transparent border-none cursor-pointer text-mono-xs text-text-disabled hover:text-text-disabled"
            aria-expanded={!collapsed}
          >
            {collapsed ? <ChevronDown className="size-3" /> : <ChevronUp className="size-3" />}
          </button>
        )}
      </div>

      {!collapsed && <div>{section.content}</div>}
    </div>
  );
}

export default DetailDrawer;
