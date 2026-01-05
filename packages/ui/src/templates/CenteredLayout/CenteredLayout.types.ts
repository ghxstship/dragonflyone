import type { ReactNode } from "react";

export interface CenteredLayoutProps {
  children: ReactNode;
  /** Vertical alignment */
  align?: "vertical-center" | "top-aligned";
  /** Container style */
  container?: "card" | "none";
  /** Background style */
  background?: "none" | "full-bleed" | "split" | "pattern";
  /** Content width */
  width?: "narrow" | "medium" | "wide";
  /** Background pattern type (when background="pattern") */
  pattern?: "grid" | "halftone" | "none";
  /** Pattern opacity */
  patternOpacity?: number;
  /** Dark/light theme */
  inverted?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** Error state */
  error?: Error | null;
  /** Error retry handler */
  onRetry?: () => void;
  /** Empty state */
  empty?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state action */
  emptyAction?: { label: string; onClick: () => void };
  /** Custom className */
  className?: string;
  /** Header content (logo, etc.) */
  header?: ReactNode;
  /** Footer content (links, copyright) */
  footer?: ReactNode;
}
