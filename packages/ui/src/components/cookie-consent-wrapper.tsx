"use client";

import { CookieConsentBanner } from '@ghxstship/ui';
import { useCookieConsentContext } from '@ghxstship/config';

interface CookieConsentWrapperProps {
  cookiePolicyUrl?: string;
  privacyPolicyUrl?: string;
}

/**
 * CookieConsentWrapper - Shared component using existing CookieConsentBanner
 * Eliminates duplication by providing a standardized cookie consent wrapper
 */
export function CookieConsentWrapper({
  cookiePolicyUrl = "/legal/cookies",
  privacyPolicyUrl = "/legal/privacy"
}: CookieConsentWrapperProps = {}) {
  const {
    shouldShowBanner,
    rejectAll,
    savePreferences,
    complianceMode,
    isLoading,
  } = useCookieConsentContext();

  // Don't render anything while loading or if banner shouldn't be shown
  if (isLoading || !shouldShowBanner) {
    return null;
  }

  return (
    <CookieConsentBanner
      open={shouldShowBanner}
      onAccept={savePreferences}
      onReject={rejectAll}
      position="bottom"
      cookiePolicyUrl={cookiePolicyUrl}
      privacyPolicyUrl={privacyPolicyUrl}
      complianceMode={complianceMode}
    />
  );
}
