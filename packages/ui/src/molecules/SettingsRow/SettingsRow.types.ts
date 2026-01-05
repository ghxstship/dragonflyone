import type { ReactNode } from "react";

/**
 * SettingsRow component props
 */
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
