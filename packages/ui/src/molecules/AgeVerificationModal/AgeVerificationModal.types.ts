import type { HTMLAttributes } from "react";

/**
 * AgeVerificationModal component props
 */
export interface AgeVerificationModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'open'> {
  /** Whether the modal is open */
  open: boolean;
  
  /** Callback when verification is successful */
  onVerified: () => void;
  
  /** Callback when verification fails or is cancelled */
  onDenied: () => void;
  
  /** Minimum age required */
  minimumAge?: number;
  
  /** Event name for context */
  eventName?: string;
  
  /** Custom title */
  title?: string;
  
  /** Custom description */
  description?: string;
  
  /** Whether to show date of birth input (more strict verification) */
  requireDateOfBirth?: boolean;
  
  /** Inverted theme */
  inverted?: boolean;
}
