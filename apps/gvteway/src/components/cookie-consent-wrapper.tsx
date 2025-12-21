"use client";

import { CookieConsentBanner } from '@ghxstship/ui';
import { useCookieConsentContext } from '@ghxstship/config';

/**
 * CookieConsentWrapper for GVTEWAY
 * 
 * Renders the cookie consent banner using context from CookieConsentProvider.
 * Place this component in your app's root layout.
 */
export function CookieConsentWrapper() {
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
      cookiePolicyUrl="/legal/cookies"
      privacyPolicyUrl="/legal/privacy"
      complianceMode={complianceMode}
    />
  );
}

export default CookieConsentWrapper;
