export interface TooltipProps {
  /** Tooltip content */
  content: React.ReactNode;
  /** Position relative to trigger */
  position?: "top" | "bottom" | "left" | "right";
  /** Delay before showing (ms) */
  delay?: number;
  /** Trigger element */
  children: React.ReactNode;
  /** Disable the tooltip */
  disabled?: boolean;
  /** Custom className for tooltip */
  className?: string;
}
