import type { HTMLAttributes } from "react";

export interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  advertising: boolean;
}

export interface CookieConsentBannerProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the banner is visible */
  open: boolean;
  /** Callback when consent is given */
  onAccept: (preferences: CookiePreferences) => void;
  /** Callback when all cookies are rejected (except necessary) */
  onReject: () => void;
  /** Callback to close the banner */
  onClose?: () => void;
  /** Link to the full cookie policy */
  cookiePolicyUrl?: string;
  /** Link to the privacy policy */
  privacyPolicyUrl?: string;
  /** Position of the banner */
  position?: "bottom" | "bottom-left" | "bottom-right" | "top";
  /** Whether to show granular controls by default */
  showPreferences?: boolean;
  /** Custom text for the banner */
  title?: string;
  description?: string;
  /** Region-specific compliance mode */
  complianceMode?: "gdpr" | "ccpa" | "default";
}
