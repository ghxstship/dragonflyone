import type { InputHTMLAttributes, ChangeEvent } from "react";

export type MaskType = "card" | "phone" | "ssn" | "date" | "currency" | "custom";

export interface MaskedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  /** Preset mask type */
  maskType?: MaskType;
  /** Custom mask pattern (9 = digit, a = letter, * = any) */
  customMask?: string;
  /** Whether to show the raw unmasked value */
  showRaw?: boolean;
  /** Callback with both masked and raw values */
  onChange?: (e: ChangeEvent<HTMLInputElement>, rawValue: string) => void;
  /** Inverted colors for dark backgrounds */
  inverted?: boolean;
  /** Error state */
  error?: boolean;
}

export interface MaskedInputVariants {
  /** Preset mask type */
  maskType?: MaskType;
  /** Inverted colors for dark backgrounds */
  inverted?: boolean;
  /** Error state */
  error?: boolean;
  /** Additional CSS classes */
  className?: string;
}
