"use client";

import { forwardRef, ReactNode } from "react";
import clsx from "clsx";
import { Stack } from "../foundations/layout.js";
import { Body } from "../atoms/typography.js";

// =============================================================================
// SETTINGS ROW
// Reusable row component for settings pages with label, description, and control
// Bold Contemporary Pop Art Adventure Design System
// =============================================================================

export interface SettingsRowProps {
  /** Row label */
  label: string;
  /** Optional description text */
  description?: string;
  /** Control element (Switch, Select, Button, etc.) */
  control: ReactNode;
  /** Optional icon to display before label */
  icon?: ReactNode;
  /** Whether the row is disabled */
  disabled?: boolean;
  /** Whether to show a border at the bottom */
  bordered?: boolean;
  /** Dark/light theme */
  inverted?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * SettingsRow - A row component for settings pages
 * 
 * Features:
 * - Consistent layout for label + description + control
 * - Optional icon support
 * - Border option for visual separation
 * - Dark-first design
 * 
 * Use cases:
 * - Toggle settings with Switch
 * - Dropdown settings with Select
 * - Any setting with a control on the right
 */
export const SettingsRow = forwardRef<HTMLDivElement, SettingsRowProps>(
  function SettingsRow(
    {
      label,
      description,
      control,
      icon,
      disabled = false,
      bordered = false,
      inverted = true,
      className,
    },
    ref
  ) {
    return (
      <Stack
        ref={ref}
        direction="horizontal"
        className={clsx(
          "items-center justify-between py-3",
          bordered && "border-b border-grey-700",
          disabled && "opacity-50",
          className
        )}
      >
        <Stack direction="horizontal" gap={3} className="items-center">
          {icon && (
            <span className={inverted ? "text-on-dark-muted" : "text-on-light-muted"}>
              {icon}
            </span>
          )}
          <Stack gap={0}>
            <Body className={clsx("font-weight-medium", inverted ? "text-white" : "text-ink-900")}>
              {label}
            </Body>
            {description && (
              <Body size="sm" className={inverted ? "text-on-dark-muted" : "text-on-light-muted"}>
                {description}
              </Body>
            )}
          </Stack>
        </Stack>
        <div className="shrink-0">{control}</div>
      </Stack>
    );
  }
);

// =============================================================================
// SETTINGS GROUP
// Container for grouping multiple SettingsRow components
// =============================================================================

export interface SettingsGroupProps {
  /** Group title */
  title?: string;
  /** Group description */
  description?: string;
  /** Children (SettingsRow components) */
  children: ReactNode;
  /** Dark/light theme */
  inverted?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * SettingsGroup - Container for grouping settings rows
 * 
 * Features:
 * - Optional title and description
 * - Consistent spacing between rows
 * - Dark-first design
 */
export const SettingsGroup = forwardRef<HTMLDivElement, SettingsGroupProps>(
  function SettingsGroup(
    {
      title,
      description,
      children,
      inverted = true,
      className,
    },
    ref
  ) {
    return (
      <Stack ref={ref} gap={4} className={className}>
        {(title || description) && (
          <Stack gap={1}>
            {title && (
              <Body className={clsx("font-weight-medium", inverted ? "text-white" : "text-ink-900")}>
                {title}
              </Body>
            )}
            {description && (
              <Body size="sm" className={inverted ? "text-on-dark-muted" : "text-on-light-muted"}>
                {description}
              </Body>
            )}
          </Stack>
        )}
        <Stack gap={0}>{children}</Stack>
      </Stack>
    );
  }
);

// =============================================================================
// INFO ROW
// Simple row for displaying label + value pairs
// =============================================================================

export interface InfoRowProps {
  /** Row label */
  label: string;
  /** Value to display */
  value: ReactNode;
  /** Optional icon */
  icon?: ReactNode;
  /** Dark/light theme */
  inverted?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * InfoRow - A row for displaying label + value pairs
 * 
 * Use cases:
 * - Detail pages showing entity properties
 * - Summary sections
 * - Read-only data display
 */
export const InfoRow = forwardRef<HTMLDivElement, InfoRowProps>(
  function InfoRow(
    {
      label,
      value,
      icon,
      inverted = true,
      className,
    },
    ref
  ) {
    return (
      <Stack ref={ref} gap={1} className={className}>
        <Stack direction="horizontal" gap={2} className="items-center">
          {icon && (
            <span className={inverted ? "text-on-dark-disabled" : "text-on-light-disabled"}>
              {icon}
            </span>
          )}
          <Body size="sm" className={inverted ? "text-on-dark-muted" : "text-on-light-muted"}>
            {label}
          </Body>
        </Stack>
        <Body className={inverted ? "text-white" : "text-ink-900"}>{value}</Body>
      </Stack>
    );
  }
);

// =============================================================================
// NUMBERED STEP
// A numbered step item for instructions or tips
// =============================================================================

export interface NumberedStepProps {
  /** Step number */
  number: number;
  /** Step title */
  title: string;
  /** Step description */
  description?: string;
  /** Dark/light theme */
  inverted?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * NumberedStep - A numbered step for instructions
 * 
 * Use cases:
 * - Security tips
 * - Setup instructions
 * - Onboarding steps
 */
export const NumberedStep = forwardRef<HTMLDivElement, NumberedStepProps>(
  function NumberedStep(
    {
      number,
      title,
      description,
      inverted = true,
      className,
    },
    ref
  ) {
    return (
      <Stack ref={ref} direction="horizontal" gap={3} className={clsx("items-start", className)}>
        <div className="w-6 h-6 rounded-avatar bg-primary flex items-center justify-center shrink-0">
          <Body size="sm" className="text-white font-weight-medium">{number}</Body>
        </div>
        <Stack gap={0}>
          <Body className={clsx("font-weight-medium", inverted ? "text-white" : "text-ink-900")}>
            {title}
          </Body>
          {description && (
            <Body size="sm" className={inverted ? "text-on-dark-muted" : "text-on-light-muted"}>
              {description}
            </Body>
          )}
        </Stack>
      </Stack>
    );
  }
);

export default SettingsRow;
