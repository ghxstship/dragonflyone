"use client";

import React, { useEffect, useRef } from "react";
import { colors, typography, fontSizes, letterSpacing, transitions, borderWidths } from "../tokens.js";

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

const widthStyles = {
  sm: "320px",
  md: "480px",
  lg: "640px",
  xl: "800px",
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
      className={className}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1300,
        display: "flex",
        justifyContent: position === "right" ? "flex-end" : "flex-start",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      {/* Overlay */}
      {showOverlay && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            transition: transitions.base,
          }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        tabIndex={-1}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: widthStyles[width],
          height: "100%",
          backgroundColor: colors.white,
          borderLeft: position === "right" ? `${borderWidths.medium} solid ${colors.black}` : "none",
          borderRight: position === "left" ? `${borderWidths.medium} solid ${colors.black}` : "none",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.25rem 1.5rem",
            borderBottom: `${borderWidths.medium} solid ${colors.black}`,
            backgroundColor: colors.black,
            color: colors.white,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2
              id="drawer-title"
              style={{
                fontFamily: typography.heading,
                fontSize: fontSizes.h4MD,
                letterSpacing: letterSpacing.wider,
                textTransform: "uppercase",
                margin: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {getTitle()}
            </h2>
            {getSubtitle() && (
              <p
                style={{
                  fontFamily: typography.mono,
                  fontSize: fontSizes.monoSM,
                  color: colors.grey400,
                  margin: "0.25rem 0 0 0",
                }}
              >
                {getSubtitle()}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "0.5rem",
              backgroundColor: "transparent",
              border: "none",
              color: colors.white,
              cursor: "pointer",
              fontSize: "20px",
              lineHeight: 1,
            }}
            aria-label="Close drawer"
          >
            ✕
          </button>
        </div>

        {/* Actions bar */}
        {(actions.length > 0 || onEdit || onDelete) && record && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              borderBottom: `1px solid ${colors.grey200}`,
              backgroundColor: colors.grey100,
              flexWrap: "wrap",
            }}
          >
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(record)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.5rem 0.75rem",
                  fontFamily: typography.mono,
                  fontSize: fontSizes.monoSM,
                  letterSpacing: letterSpacing.wide,
                  textTransform: "uppercase",
                  backgroundColor: colors.black,
                  color: colors.white,
                  border: `${borderWidths.medium} solid ${colors.black}`,
                  cursor: "pointer",
                  transition: transitions.fast,
                }}
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.5rem 0.75rem",
                  fontFamily: typography.mono,
                  fontSize: fontSizes.monoSM,
                  letterSpacing: letterSpacing.wide,
                  textTransform: "uppercase",
                  backgroundColor:
                    action.variant === "primary"
                      ? colors.black
                      : action.variant === "danger"
                      ? colors.white
                      : colors.white,
                  color:
                    action.variant === "primary"
                      ? colors.white
                      : action.variant === "danger"
                      ? colors.grey700
                      : colors.black,
                  border: `${borderWidths.medium} solid ${colors.black}`,
                  cursor: action.disabled ? "not-allowed" : "pointer",
                  opacity: action.disabled ? 0.5 : 1,
                  transition: transitions.fast,
                }}
              >
                {action.icon && <span>{action.icon}</span>}
                {action.label}
              </button>
            ))}

            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(record)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.5rem 0.75rem",
                  fontFamily: typography.mono,
                  fontSize: fontSizes.monoSM,
                  letterSpacing: letterSpacing.wide,
                  textTransform: "uppercase",
                  backgroundColor: colors.white,
                  color: colors.grey700,
                  border: `${borderWidths.medium} solid ${colors.grey400}`,
                  cursor: "pointer",
                  transition: transitions.fast,
                  marginLeft: "auto",
                }}
              >
                🗑️ Delete
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: "auto",
            padding: "1.5rem",
          }}
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "200px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  border: `3px solid ${colors.grey300}`,
                  borderTopColor: colors.black,
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
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
            <div
              style={{
                textAlign: "center",
                padding: "3rem",
                color: colors.grey500,
                fontFamily: typography.mono,
                fontSize: fontSizes.monoMD,
              }}
            >
              No record selected
            </div>
          )}
        </div>
      </div>

      <style>
        {`@keyframes spin { to { transform: rotate(360deg); } }`}
      </style>
    </div>
  );
}

// Section component
function DetailSectionComponent({ section }: { section: DetailSection }) {
  const [collapsed, setCollapsed] = React.useState(section.defaultCollapsed ?? false);

  return (
    <div
      style={{
        marginBottom: "1.5rem",
        borderBottom: `1px solid ${colors.grey200}`,
        paddingBottom: "1.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: collapsed ? 0 : "1rem",
        }}
      >
        <h3
          style={{
            fontFamily: typography.mono,
            fontSize: fontSizes.monoMD,
            letterSpacing: letterSpacing.widest,
            textTransform: "uppercase",
            color: colors.grey600,
            margin: 0,
          }}
        >
          {section.title}
        </h3>

        {section.collapsible && (
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            style={{
              padding: "0.25rem",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "12px",
              color: colors.grey500,
            }}
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
