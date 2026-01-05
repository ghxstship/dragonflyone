import type { BrandConfig } from "../design-system/tokens/types.js";

/**
 * Default brand configuration - ClickUp 4.0 style
 * 
 * Uses subtle shadows and rounded corners by default.
 * All apps should use this as the baseline for whitelabel overrides.
 */
export const defaultBrandConfig: BrandConfig = {
  name: "ATLVS",
  logo: {
    primary: "/assets/brand/logo.svg",
    mark: "/assets/brand/mark.svg",
    wordmark: "/assets/brand/wordmark.svg",
    favicon: "/assets/brand/favicon.ico",
    dark: {
      primary: "/assets/brand/logo-dark.svg",
      mark: "/assets/brand/mark-dark.svg",
    },
  },
  colors: {
    primary: "#7B68EE",
    primaryHover: "#6B5BD4",
    primaryActive: "#5B4EC4",
    primarySubtle: "rgba(123, 104, 238, 0.08)",
    secondary: "#49CCF9",
    accent: "#FF6B6B",
  },
  fonts: {
    primary: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    secondary: '"Inter", sans-serif',
    mono: '"JetBrains Mono", "Fira Code", monospace',
  },
  content: {
    appName: "ATLVS",
    tagline: "Your Business Operations Hub",
    supportEmail: "support@atlvs.io",
    supportUrl: "https://support.atlvs.io",
    docsUrl: "https://docs.atlvs.io",
    termsUrl: "/legal/terms",
    privacyUrl: "/legal/privacy",
    copyrightHolder: "GHXSTSHIP Industries LLC",
  },
  features: {
    showPoweredBy: false,
    customDomain: true,
    customEmailTemplates: true,
    sharpCorners: false,
    hardShadows: false,
  },
};

/**
 * Deterministic merge for BrandConfig
 * Merges override values into base config, preserving type safety
 */
const deepMerge = (base: BrandConfig, override: Partial<BrandConfig>): BrandConfig => ({
  name: override.name ?? base.name,
  logo: {
    primary: override.logo?.primary ?? base.logo.primary,
    mark: override.logo?.mark ?? base.logo.mark,
    wordmark: override.logo?.wordmark ?? base.logo.wordmark,
    favicon: override.logo?.favicon ?? base.logo.favicon,
    dark: override.logo?.dark
      ? {
          primary: override.logo.dark.primary ?? base.logo.dark?.primary ?? base.logo.primary,
          mark: override.logo.dark.mark ?? base.logo.dark?.mark ?? base.logo.mark,
        }
      : base.logo.dark,
  },
  colors: {
    primary: override.colors?.primary ?? base.colors?.primary,
    primaryHover: override.colors?.primaryHover ?? base.colors?.primaryHover,
    primaryActive: override.colors?.primaryActive ?? base.colors?.primaryActive,
    primarySubtle: override.colors?.primarySubtle ?? base.colors?.primarySubtle,
    secondary: override.colors?.secondary ?? base.colors?.secondary,
    accent: override.colors?.accent ?? base.colors?.accent,
  },
  fonts: {
    primary: override.fonts?.primary ?? base.fonts?.primary,
    secondary: override.fonts?.secondary ?? base.fonts?.secondary,
    mono: override.fonts?.mono ?? base.fonts?.mono,
  },
  radius: override.radius ? { ...base.radius, ...override.radius } : base.radius,
  shadows: override.shadows ? { ...base.shadows, ...override.shadows } : base.shadows,
  content: {
    appName: override.content?.appName ?? base.content?.appName,
    tagline: override.content?.tagline ?? base.content?.tagline,
    supportEmail: override.content?.supportEmail ?? base.content?.supportEmail,
    supportUrl: override.content?.supportUrl ?? base.content?.supportUrl,
    docsUrl: override.content?.docsUrl ?? base.content?.docsUrl,
    termsUrl: override.content?.termsUrl ?? base.content?.termsUrl,
    privacyUrl: override.content?.privacyUrl ?? base.content?.privacyUrl,
    copyrightHolder: override.content?.copyrightHolder ?? base.content?.copyrightHolder,
  },
  features: {
    showPoweredBy: override.features?.showPoweredBy ?? base.features?.showPoweredBy,
    customDomain: override.features?.customDomain ?? base.features?.customDomain,
    customEmailTemplates: override.features?.customEmailTemplates ?? base.features?.customEmailTemplates,
    sharpCorners: override.features?.sharpCorners ?? base.features?.sharpCorners,
    hardShadows: override.features?.hardShadows ?? base.features?.hardShadows,
  },
});

export const loadBrandConfig = async (tenantId?: string): Promise<BrandConfig> => {
  if (!tenantId) {
    return defaultBrandConfig;
  }

  try {
    const response = await fetch(`/api/tenants/${tenantId}/brand-config`);
    if (!response.ok) throw new Error(`Failed to load brand config: ${response.status}`);
    const tenantConfig = (await response.json()) as Partial<BrandConfig>;
    return deepMerge(defaultBrandConfig, tenantConfig);
  } catch (error) {
    console.error("Failed to load tenant brand config", error);
    return defaultBrandConfig;
  }
};
