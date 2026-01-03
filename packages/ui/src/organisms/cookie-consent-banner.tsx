"use client";

import { forwardRef, useState, useEffect, useCallback } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";
import { Button } from "../atoms/button.js";
import { Body, Label } from "../atoms/typography.js";
import { Stack } from "../foundations/layout.js";
import { Switch } from "../atoms/switch.js";

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

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true, // Always required
  functional: false,
  analytics: false,
  advertising: false,
};

/**
 * CookieConsentBanner - GDPR/ePrivacy compliant cookie consent component
 * 
 * Features:
 * - Granular consent options (Necessary, Functional, Analytics, Advertising)
 * - Accept All / Reject All / Customize options
 * - Accessible with keyboard navigation and screen reader support
 * - Bold Contemporary Pop Art Adventure design
 * - Region-aware compliance modes
 */
export const CookieConsentBanner = forwardRef<HTMLDivElement, CookieConsentBannerProps>(
  function CookieConsentBanner({
    open,
    onAccept,
    onReject,
    onClose,
    cookiePolicyUrl = "/legal/cookies",
    privacyPolicyUrl = "/legal/privacy",
    position = "bottom",
    showPreferences: initialShowPreferences = false,
    title = "We use cookies",
    description,
    complianceMode = "gdpr",
    className,
    ...props
  }, ref) {
    const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);
    const [showPreferences, setShowPreferences] = useState(initialShowPreferences);

    // Reset preferences when banner opens
    useEffect(() => {
      if (open) {
        setPreferences(DEFAULT_PREFERENCES);
        setShowPreferences(initialShowPreferences);
      }
    }, [open, initialShowPreferences]);

    const handleAcceptAll = useCallback(() => {
      const allAccepted: CookiePreferences = {
        necessary: true,
        functional: true,
        analytics: true,
        advertising: true,
      };
      onAccept(allAccepted);
      onClose?.();
    }, [onAccept, onClose]);

    const handleRejectAll = useCallback(() => {
      onReject();
      onClose?.();
    }, [onReject, onClose]);

    const handleSavePreferences = useCallback(() => {
      onAccept(preferences);
      onClose?.();
    }, [onAccept, preferences, onClose]);

    const handlePreferenceChange = useCallback((key: keyof CookiePreferences, value: boolean) => {
      if (key === "necessary") return; // Cannot disable necessary cookies
      setPreferences(prev => ({ ...prev, [key]: value }));
    }, []);

    // Handle keyboard escape
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && open && onClose) {
          onClose();
        }
      };
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    const defaultDescription = complianceMode === "gdpr"
      ? "We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking \"Accept All\", you consent to our use of cookies. You can customize your preferences or reject non-essential cookies."
      : complianceMode === "ccpa"
      ? "We use cookies and similar technologies. Some are essential for the site to function. Others help us improve your experience and provide personalized content. You can opt out of the sale of your personal information."
      : "We use cookies to improve your experience. You can accept all cookies or customize your preferences.";

    const positionClasses = {
      bottom: "bottom-0 left-0 right-0",
      "bottom-left": "bottom-4 left-4 max-w-lg",
      "bottom-right": "bottom-4 right-4 max-w-lg",
      top: "top-0 left-0 right-0",
    };

    const cookieCategories = [
      {
        key: "necessary" as const,
        label: "Necessary",
        description: "Essential cookies required for the website to function. These cannot be disabled.",
        required: true,
      },
      {
        key: "functional" as const,
        label: "Functional",
        description: "Enable enhanced functionality and personalization, such as remembering your preferences.",
        required: false,
      },
      {
        key: "analytics" as const,
        label: "Analytics",
        description: "Help us understand how visitors interact with our website to improve our services.",
        required: false,
      },
      {
        key: "advertising" as const,
        label: "Advertising",
        description: "Used to deliver relevant advertisements and track ad campaign performance.",
        required: false,
      },
    ];

    return (
      <>
        {/* Backdrop for modal-style banners */}
        {(position === "bottom-left" || position === "bottom-right") && (
          <div 
            className="fixed inset-0 bg-black/30 z-modal-backdrop animate-fade-in"
            aria-hidden="true"
          />
        )}
        
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-description"
          className={clsx(
            "fixed z-modal animate-slide-up-bounce",
            positionClasses[position],
            position === "bottom" || position === "top"
              ? "border-y-4 border-black bg-white shadow-[0_-8px_0_rgba(0,0,0,0.1)]"
              : "border-4 border-black bg-white rounded-[var(--radius-modal)] shadow-[8px_8px_0_rgba(0,0,0,0.2)]",
            className
          )}
          {...props}
        >
          <div className="p-6 max-w-container-4xl mx-auto">
            <Stack gap={4}>
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center border-2 border-black bg-brand-amber">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-black">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="8" cy="9" r="1.5" fill="currentColor" />
                      <circle cx="15" cy="8" r="1" fill="currentColor" />
                      <circle cx="10" cy="14" r="1" fill="currentColor" />
                      <circle cx="16" cy="13" r="1.5" fill="currentColor" />
                      <circle cx="13" cy="17" r="1" fill="currentColor" />
                    </svg>
                  </div>
                  <h2 id="cookie-consent-title" className="font-heading text-lg uppercase tracking-wider font-bold text-black">
                    {title}
                  </h2>
                </div>
                {onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-1 border-2 border-border rounded text-on-dark-disabled hover:border-black hover:text-black transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[2px_2px_0_rgba(0,0,0,0.15)]"
                    aria-label="Close cookie consent banner"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Description */}
              <p id="cookie-consent-description" className="text-on-dark-disabled text-sm leading-relaxed">
                {description || defaultDescription}
              </p>

              {/* Links */}
              <div className="flex gap-4 text-sm">
                <a 
                  href={cookiePolicyUrl}
                  className="text-primary-600 hover:text-primary-800 underline underline-offset-2 font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Cookie Policy
                </a>
                <a 
                  href={privacyPolicyUrl}
                  className="text-primary-600 hover:text-primary-800 underline underline-offset-2 font-medium"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
              </div>

              {/* Preferences Panel */}
              {showPreferences && (
                <div className="border-2 border-border rounded-[var(--radius-card)] p-4 mt-2 bg-muted">
                  <Label size="sm" className="text-on-dark-disabled mb-3 block">COOKIE PREFERENCES</Label>
                  <Stack gap={3}>
                    {cookieCategories.map((category) => (
                      <div 
                        key={category.key}
                        className="flex items-start justify-between gap-4 pb-3 border-b border-border last:border-0 last:pb-0"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Body size="sm" className="font-semibold text-on-light-primary">
                              {category.label}
                            </Body>
                            {category.required && (
                              <span className="text-xs px-1.5 py-0.5 bg-muted text-on-dark-disabled rounded font-medium">
                                Required
                              </span>
                            )}
                          </div>
                          <Body size="xs" className="text-on-dark-disabled mt-0.5">
                            {category.description}
                          </Body>
                        </div>
                        <Switch
                          checked={preferences[category.key]}
                          onChange={(e) => handlePreferenceChange(category.key, e.target.checked)}
                          disabled={category.required}
                          aria-label={`${category.label} cookies`}
                        />
                      </div>
                    ))}
                  </Stack>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {!showPreferences ? (
                  <>
                    <Button
                      variant="solid"
                      size="md"
                      onClick={handleAcceptAll}
                    >
                      Accept All
                    </Button>
                    <Button
                      variant="solid"
                      size="md"
                      onClick={handleRejectAll}
                    >
                      Reject All
                    </Button>
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => setShowPreferences(true)}
                    >
                      Customize
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="solid"
                      size="md"
                      onClick={handleSavePreferences}
                    >
                      Save Preferences
                    </Button>
                    <Button
                      variant="solid"
                      size="md"
                      onClick={handleAcceptAll}
                    >
                      Accept All
                    </Button>
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => setShowPreferences(false)}
                    >
                      Back
                    </Button>
                  </>
                )}
              </div>

              {/* CCPA-specific notice */}
              {complianceMode === "ccpa" && (
                <p className="text-xs text-on-dark-disabled mt-2">
                  California residents: You have the right to opt out of the sale of your personal information. 
                  <a href={privacyPolicyUrl} className="underline ml-1">Learn more about your rights</a>.
                </p>
              )}
            </Stack>
          </div>
        </div>
      </>
    );
  }
);

export default CookieConsentBanner;
