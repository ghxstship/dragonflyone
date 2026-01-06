'use client';

import { useMemo } from 'react';
import { useTheme } from './theme-provider';
import { getBrandConfig, getCopyrightText, getPoweredByText, type BrandConfig } from './brand-config';

/**
 * WHITELABEL BRAND HOOK
 * 
 * Provides access to all brand configuration values for whitelabel support.
 * Use this hook instead of hardcoding brand names, taglines, or other brand-specific values.
 * 
 * @example
 * ```tsx
 * import { useBrand } from '@ghxstship/config';
 * 
 * function Footer() {
 *   const { name, copyright, poweredBy, legal } = useBrand();
 *   return (
 *     <footer>
 *       <p>{copyright}</p>
 *       <p>{poweredBy}</p>
 *       <a href={legal.termsUrl}>Terms</a>
 *     </footer>
 *   );
 * }
 * ```
 */
export interface UseBrandResult extends BrandConfig {
  /** Copyright text with current year (e.g., "© 2026 GHXSTSHIP Inc. All rights reserved.") */
  copyright: string;
  
  /** Powered by text (e.g., "Powered by GHXSTSHIP") */
  poweredByText: string;
  
  /** Check if current brand matches */
  isBrand: (brandId: 'atlvs' | 'compvss' | 'gvteway') => boolean;
  
  /** Get brand-specific class name */
  brandClass: string;
}

/**
 * Hook to access brand configuration for whitelabel support.
 * 
 * This hook provides all brand-specific values that should be used
 * instead of hardcoding brand names, taglines, emails, etc.
 * 
 * @returns Brand configuration with computed values
 */
export const useBrand = (): UseBrandResult => {
  const { brandId } = useTheme();
  
  return useMemo(() => {
    const config = getBrandConfig(brandId);
    
    return {
      ...config,
      copyright: getCopyrightText(brandId),
      poweredByText: getPoweredByText(brandId),
      isBrand: (id: 'atlvs' | 'compvss' | 'gvteway') => brandId === id,
      brandClass: `brand-${brandId}`,
    };
  }, [brandId]);
};

/**
 * Hook to get just the brand name
 */
export const useBrandName = (): string => {
  const { name } = useBrand();
  return name;
};

/**
 * Hook to get brand tagline
 */
export const useBrandTagline = (): string => {
  const { tagline } = useBrand();
  return tagline;
};

/**
 * Hook to get brand meta information for SEO
 */
export const useBrandMeta = () => {
  const { meta, name, description } = useBrand();
  return {
    ...meta,
    siteName: name,
    siteDescription: description,
  };
};

/**
 * Hook to get brand legal links
 */
export const useBrandLegal = () => {
  const { legal } = useBrand();
  return legal;
};

/**
 * Hook to get brand social links
 */
export const useBrandSocial = () => {
  const { social } = useBrand();
  return social;
};

/**
 * Hook to get brand support information
 */
export const useBrandSupport = () => {
  const { supportEmail, privacyEmail, name } = useBrand();
  return {
    supportEmail,
    privacyEmail,
    brandName: name,
  };
};
