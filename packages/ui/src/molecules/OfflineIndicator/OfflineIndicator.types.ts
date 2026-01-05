/**
 * OfflineIndicator component props
 */
export interface OfflineIndicatorProps {
  onRetry?: () => void;
  pendingSyncCount?: number;
  lastSyncTime?: Date | null;
  variant?: OfflineIndicatorVariant;
  inverted?: boolean;
  className?: string;
}

/**
 * OfflineIndicator variant types
 */
export type OfflineIndicatorVariant = 
  | "banner"
  | "badge"
  | "toast";
