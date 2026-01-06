'use client';

import { CookieConsentBanner } from '@ghxstship/ui';
import { useCookieConsentContext } from '@ghxstship/config';

/**
 * CookieConsentWrapper - Shared cookie consent wrapper for all apps
 *
 * Renders the cookie consent banner using context from CookieConsentProvider.
 * Place this component in your app's root layout.
 */
export function CookieConsentWrapper({ cookiePolicyUrl, privacyPolicyUrl }: {
  cookiePolicyUrl?: string;
  privacyPolicyUrl?: string;
}) {
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
      cookiePolicyUrl={cookiePolicyUrl || "/legal/cookies"}
      privacyPolicyUrl={privacyPolicyUrl || "/legal/privacy"}
      complianceMode={complianceMode}
    />
  );
}

export default CookieConsentWrapper;
