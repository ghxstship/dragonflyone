import type { HTMLAttributes } from "react";

export interface PriceDisplayProps extends HTMLAttributes<HTMLDivElement> {
  /** Current price */
  price: number;
  /** Original price (for showing discount) */
  originalPrice?: number;
  /** Currency code */
  currency?: string;
  /** Currency symbol */
  currencySymbol?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg" | "xl";
  /** Show "From" prefix */
  showFrom?: boolean;
  /** Show per-unit text (e.g., "/month") */
  perUnit?: string;
  /** Discount percentage to display */
  discountPercent?: number;
  /** Inverted colors (white on black) */
  inverted?: boolean;
}

export interface PriceRangeProps extends HTMLAttributes<HTMLDivElement> {
  /** Minimum price */
  minPrice: number;
  /** Maximum price */
  maxPrice: number;
  /** Currency symbol */
  currencySymbol?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Inverted colors */
  inverted?: boolean;
}
