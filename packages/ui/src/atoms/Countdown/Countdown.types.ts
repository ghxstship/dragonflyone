export interface CountdownProps {
  /** Target date/time to count down to */
  targetDate: Date;
  /** Callback when countdown reaches zero */
  onComplete?: () => void;
  /** Visual variant */
  variant?: "default" | "compact" | "large";
  /** Show labels (days, hours, etc.) */
  showLabels?: boolean;
  /** Custom className */
  className?: string;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface CountdownVariants {
  /** Visual variant */
  variant?: "default" | "compact" | "large";
  /** Show labels */
  showLabels?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export interface TimeUnitProps {
  value: number;
  label: string;
  variant: "default" | "compact" | "large";
  showLabels: boolean;
}
