"use client";

import React, { useEffect, useRef } from "react";
import clsx from "clsx";

/**
 * DetailDrawer component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold 2px side border
 * - Slide-in animation
 * - Bold header with high contrast
 * - Action buttons with hover lift
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
}

const widthClasses = {
  sm: "max-w-xs",
  md: "max-w-md",
  lg: "max-w-xl",
  xl: "max-w-3xl",
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
}: DetailDrawerProps<T>) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // Focus trap
  useEffect(() => {
    if (open && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [open]);

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

  if (!open) return null;

  return (
    <div
      className={clsx(
        "fixed inset-0 z-modal flex",
        position === "right" ? "justify-end" : "justify-start",
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      {/* Overlay */}
      {showOverlay && (
        <div
          className="absolute inset-0 bg-black/50 transition-opacity duration-base"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        className={clsx(
          "relative w-full h-full bg-surface-primary text-text-primary flex flex-col overflow-hidden",
          widthClasses[width],
          position === "right" ? "border-l-2 border-black" : "border-r-2 border-black"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-spacing-6 py-spacing-5 border-b-2 border-black bg-black text-white">
          <div className="flex-1 min-w-0">
            <h2
              id="drawer-title"
              className="font-heading text-h4-md tracking-wider uppercase overflow-hidden text-ellipsis whitespace-nowrap"
            >
              {getTitle()}
            </h2>
            {getSubtitle() && (
              <p className="font-code text-mono-sm text-grey-400 mt-spacing-1">
                {getSubtitle()}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-spacing-2 bg-transparent border-none text-white cursor-pointer text-body-lg leading-none hover:text-grey-300"
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>

        {/* Actions bar */}
        {(actions.length > 0 || onEdit || onDelete) && record && (
          <div className="flex items-center gap-gap-xs px-spacing-6 py-spacing-3 border-b border-border-secondary bg-surface-secondary flex-wrap">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(record)}
                className="flex items-center gap-gap-xs px-spacing-3 py-spacing-2 font-code text-mono-sm tracking-wide uppercase bg-black text-white border-2 border-black cursor-pointer transition-colors duration-fast hover:bg-grey-900"
              >
                ✏️ Edit
              </button>
            )}

            {actions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => onAction?.(action.id, record)}
                disabled={action.disabled}
                className={clsx(
                  "flex items-center gap-gap-xs px-spacing-3 py-spacing-2 font-code text-mono-sm tracking-wide uppercase border-2 border-black transition-colors duration-fast",
                  action.variant === "primary"
                    ? "bg-black text-white hover:bg-grey-900"
                    : action.variant === "danger"
                    ? "bg-surface-primary text-text-secondary hover:bg-surface-secondary"
                    : "bg-surface-primary text-text-primary hover:bg-surface-secondary",
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
                className="flex items-center gap-gap-xs px-spacing-3 py-spacing-2 font-code text-mono-sm tracking-wide uppercase bg-surface-primary text-text-secondary border-2 border-border-secondary cursor-pointer transition-colors duration-fast ml-auto hover:bg-surface-secondary"
              >
                🗑️ Delete
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-spacing-6">
          {loading ? (
            <div className="flex items-center justify-center h-spacing-48">
              <div className="w-spacing-8 h-spacing-8 border-2 border-grey-300 border-t-black rounded-full animate-spin" />
            </div>
          ) : record ? (
            <>
              {/* Sections */}
              {sections.map((section) => (
                <DetailSectionComponent key={section.id} section={section} />
              ))}

              {/* Custom children */}
              {children}
            </>
          ) : (
            <div className="text-center p-spacing-12 text-grey-500 font-code text-mono-md">
              No record selected
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Section component
function DetailSectionComponent({ section }: { section: DetailSection }) {
  const [collapsed, setCollapsed] = React.useState(section.defaultCollapsed ?? false);

  return (
    <div className="mb-spacing-6 border-b border-grey-200 pb-spacing-6">
      <div
        className={clsx(
          "flex items-center justify-between",
          collapsed ? "mb-spacing-0" : "mb-spacing-4"
        )}
      >
        <h3 className="font-code text-mono-md tracking-widest uppercase text-grey-600">
          {section.title}
        </h3>

        {section.collapsible && (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-spacing-1 bg-transparent border-none cursor-pointer text-mono-xs text-grey-500 hover:text-grey-700"
            aria-expanded={!collapsed}
          >
            {collapsed ? "▼" : "▲"}
          </button>
        )}
      </div>

      {!collapsed && <div>{section.content}</div>}
    </div>
  );
}

export default DetailDrawer;
