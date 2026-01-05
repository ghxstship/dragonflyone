import type { InputHTMLAttributes } from "react";

// Structured address data returned from Google Places
export interface AddressData {
  formattedAddress: string;
  streetNumber?: string;
  street?: string;
  city?: string;
  state?: string;
  stateCode?: string;
  country?: string;
  countryCode?: string;
  postalCode?: string;
  lat?: number;
  lng?: number;
  placeId?: string;
}

export interface AddressInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "size"> {
  /** Current address string value */
  value?: string;
  /** Called with the address string */
  onChange?: (value: string) => void;
  /** Called with structured address data when a place is selected */
  onAddressSelect?: (address: AddressData) => void;
  /** Error state */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Full width */
  fullWidth?: boolean;
  /** Inverted (dark) theme */
  inverted?: boolean;
  /** Restrict to specific country codes (e.g., ["us", "ca"]) */
  restrictCountries?: string[];
  /** Types of places to return (default: address) */
  types?: string[];
  /** Google Maps API key - falls back to env var */
  apiKey?: string;
  /** Input size */
  size?: "sm" | "md" | "lg";
}

export interface AddressInputVariants {
  /** Input size variant */
  size?: "sm" | "md" | "lg";
  /** Error state */
  error?: boolean;
  /** Full width */
  fullWidth?: boolean;
  /** Inverted theme */
  inverted?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export interface AddressInputValidation {
  /**
   * Check if address has required components
   */
  isComplete: (address: AddressData) => boolean;
  
  /**
   * Check if address has coordinates
   */
  hasCoordinates: (address: AddressData) => boolean;
  
  /**
   * Format address for display
   */
  format: (address: AddressData, style?: "short" | "full") => string;
  
  /**
   * Get validation error
   */
  getError: (address: AddressData | null) => string | null;
}
