import { z } from 'zod';
import { BrandId } from '../../design-system/tokens/colors';

/**
 * WHITELABEL BRAND CONFIGURATION
 * 
 * Centralized brand configuration for all GHXSTSHIP platform apps.
 * All hardcoded brand references should use this configuration.
 */

export const BrandConfigSchema = z.object({
  /** Brand identifier */
  id: z.enum(['atlvs', 'compvss', 'gvteway']),
  
  /** Short brand name (e.g., "ATLVS") */
  name: z.string(),
  
  /** Full brand name (e.g., "Advanced Ticketing & Logistics Visualization System") */
  fullName: z.string(),
  
  /** Brand tagline */
  tagline: z.string(),
  
  /** Brand description */
  description: z.string(),
  
  /** Parent company/platform name */
  poweredBy: z.string(),
  
  /** Copyright holder */
  copyrightHolder: z.string(),
  
  /** Support email */
  supportEmail: z.string().email(),
  
  /** Privacy/DPO email */
  privacyEmail: z.string().email(),
  
  /** Primary accent color (hex) */
  accentColor: z.string(),
  
  /** Accent color name */
  accentColorName: z.string(),
  
  /** Logo path (relative to public folder) */
  logoPath: z.string(),
  
  /** Logo alt text */
  logoAlt: z.string(),
  
  /** Favicon path */
  faviconPath: z.string(),
  
  /** Social media links */
  social: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    youtube: z.string().optional(),
  }),
  
  /** Legal links */
  legal: z.object({
    termsUrl: z.string(),
    privacyUrl: z.string(),
    cookiesUrl: z.string(),
    accessibilityUrl: z.string().optional(),
  }),
  
  /** App-specific metadata */
  meta: z.object({
    title: z.string(),
    description: z.string(),
    keywords: z.array(z.string()),
  }),
});

export type BrandConfig = z.infer<typeof BrandConfigSchema>;

/**
 * Brand configurations for all GHXSTSHIP platform apps
 */
export const brandConfigs: Record<BrandId, BrandConfig> = {
  atlvs: {
    id: 'atlvs',
    name: 'ATLVS',
    fullName: 'Advanced Ticketing & Logistics Visualization System',
    tagline: 'Streamline Your Event Operations',
    description: 'Internal Business Operations Platform',
    poweredBy: 'GHXSTSHIP',
    copyrightHolder: 'GHXSTSHIP Inc.',
    supportEmail: 'support@atlvs.io',
    privacyEmail: 'privacy@atlvs.io',
    accentColor: '#FF10F0',
    accentColorName: 'Electric Pink',
    logoPath: '/logo.svg',
    logoAlt: 'ATLVS Logo',
    faviconPath: '/favicon.ico',
    social: {
      twitter: 'https://twitter.com/atlvs',
      linkedin: 'https://linkedin.com/company/atlvs',
      instagram: 'https://instagram.com/atlvs',
    },
    legal: {
      termsUrl: '/legal/terms',
      privacyUrl: '/legal/privacy',
      cookiesUrl: '/legal/cookies',
      accessibilityUrl: '/legal/accessibility',
    },
    meta: {
      title: 'ATLVS - Event Operations Platform',
      description: 'Streamline your event operations with ATLVS - the comprehensive platform for ticketing, logistics, and venue management.',
      keywords: ['event management', 'ticketing', 'logistics', 'venue management', 'event operations'],
    },
  },
  compvss: {
    id: 'compvss',
    name: 'COMPVSS',
    fullName: 'Comprehensive Production Management System',
    tagline: 'Production Excellence, Delivered',
    description: 'Production Management Platform',
    poweredBy: 'GHXSTSHIP',
    copyrightHolder: 'GHXSTSHIP Inc.',
    supportEmail: 'support@compvss.io',
    privacyEmail: 'privacy@compvss.io',
    accentColor: '#FFD100',
    accentColorName: 'Electric Yellow',
    logoPath: '/logo.svg',
    logoAlt: 'COMPVSS Logo',
    faviconPath: '/favicon.ico',
    social: {
      twitter: 'https://twitter.com/compvss',
      linkedin: 'https://linkedin.com/company/compvss',
    },
    legal: {
      termsUrl: '/legal/terms',
      privacyUrl: '/legal/privacy',
      cookiesUrl: '/legal/cookies',
      accessibilityUrl: '/legal/accessibility',
    },
    meta: {
      title: 'COMPVSS - Production Management Platform',
      description: 'Manage your productions with COMPVSS - the comprehensive platform for crew, equipment, and event production.',
      keywords: ['production management', 'crew management', 'equipment tracking', 'event production'],
    },
  },
  gvteway: {
    id: 'gvteway',
    name: 'GVTEWAY',
    fullName: 'Gateway Venue Technology',
    tagline: 'Your Gateway to Amazing Experiences',
    description: 'Consumer Experiences Platform',
    poweredBy: 'GHXSTSHIP',
    copyrightHolder: 'GHXSTSHIP Inc.',
    supportEmail: 'support@gvteway.io',
    privacyEmail: 'privacy@gvteway.io',
    accentColor: '#00F0FF',
    accentColorName: 'Electric Cyan',
    logoPath: '/logo.svg',
    logoAlt: 'GVTEWAY Logo',
    faviconPath: '/favicon.ico',
    social: {
      twitter: 'https://twitter.com/gvteway',
      linkedin: 'https://linkedin.com/company/gvteway',
      instagram: 'https://instagram.com/gvteway',
      facebook: 'https://facebook.com/gvteway',
    },
    legal: {
      termsUrl: '/legal/terms',
      privacyUrl: '/legal/privacy',
      cookiesUrl: '/legal/cookies',
      accessibilityUrl: '/legal/accessibility',
    },
    meta: {
      title: 'GVTEWAY - Discover Amazing Experiences',
      description: 'Discover and book amazing experiences with GVTEWAY - your gateway to events, venues, and entertainment.',
      keywords: ['events', 'experiences', 'tickets', 'venues', 'entertainment', 'discovery'],
    },
  },
};

/**
 * Get brand configuration by ID
 */
export const getBrandConfig = (brandId: BrandId): BrandConfig => {
  return brandConfigs[brandId];
};

/**
 * Get brand configuration from environment or hostname
 */
export const getBrandFromEnv = (): BrandId => {
  // Check environment variable first
  const envBrand = process.env.NEXT_PUBLIC_BRAND_ID as BrandId | undefined;
  if (envBrand && brandConfigs[envBrand]) {
    return envBrand;
  }
  
  // Check hostname in browser
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('compvss')) return 'compvss';
    if (hostname.includes('gvteway')) return 'gvteway';
    if (hostname.includes('atlvs')) return 'atlvs';
  }
  
  // Default to ATLVS
  return 'atlvs';
};

/**
 * Validate custom brand configuration
 */
export const validateBrandConfig = (config: unknown): BrandConfig => {
  return BrandConfigSchema.parse(config);
};

/**
 * Get copyright text for current year
 */
export const getCopyrightText = (brandId: BrandId): string => {
  const brand = getBrandConfig(brandId);
  const year = new Date().getFullYear();
  return `© ${year} ${brand.copyrightHolder}. All rights reserved.`;
};

/**
 * Get powered by text
 */
export const getPoweredByText = (brandId: BrandId): string => {
  const brand = getBrandConfig(brandId);
  return `Powered by ${brand.poweredBy}`;
};
