/**
 * Default Platform Theme Configurations
 * Default themes for GVTEWAY, ATLVS, and COMPVSS
 */

import type { ExperienceThemeConfig } from './experience-theme';

// ============================================================================
// GVTEWAY Default Theme
// ============================================================================

export const GVTEWAY_DEFAULT_THEME: ExperienceThemeConfig = {
  organizerId: '00000000-0000-0000-0000-000000000001',

  branding: {
    logo: '/assets/gvteway/logo.svg',
    colors: {
      primary: '#7B68EE', // Medium Purple (matches ATLVS brand)
      secondary: '#49CCF9', // Sky Blue
      accent: '#10B981', // Emerald Green
    },
    typography: {
      displayFont: 'Outfit, sans-serif',
      bodyFont: 'Inter, system-ui',
    },
    customDomain: 'gvteway.com',
  },

  features: {
    bookingEnabled: true,
    reviewsEnabled: true,
    socialSharingEnabled: true,
    chatEnabled: false,
  },

  content: {
    customNavLinks: [
      {
        id: 'nav-1',
        label: 'Experiences',
        href: '/experiences',
        order: 1,
      },
      {
        id: 'nav-2',
        label: 'Organizers',
        href: '/organizers',
        order: 2,
      },
      {
        id: 'nav-3',
        label: 'How It Works',
        href: '/how-it-works',
        order: 3,
      },
    ],
    footerContent: 'GVTEWAY - Your Experience Marketplace',
    legalLinks: [
      {
        id: 'legal-1',
        type: 'terms',
        label: 'Terms of Service',
        href: '/legal/terms',
      },
      {
        id: 'legal-2',
        type: 'privacy',
        label: 'Privacy Policy',
        href: '/legal/privacy',
      },
      {
        id: 'legal-3',
        type: 'refund',
        label: 'Refund Policy',
        href: '/legal/refund',
      },
    ],
  },
};

// ============================================================================
// ATLVS Default Theme
// ============================================================================

export const ATLVS_DEFAULT_THEME: ExperienceThemeConfig = {
  organizerId: '00000000-0000-0000-0000-000000000002',

  branding: {
    logo: '/assets/atlvs/logo.svg',
    colors: {
      primary: '#7B68EE', // Medium Purple
      secondary: '#49CCF9', // Sky Blue
      accent: '#F59E0B', // Amber
    },
    typography: {
      displayFont: 'Anton, sans-serif',
      bodyFont: 'Inter, system-ui',
    },
    customDomain: 'atlvs.io',
  },

  features: {
    bookingEnabled: true,
    reviewsEnabled: true,
    socialSharingEnabled: true,
    chatEnabled: true,
  },

  content: {
    customNavLinks: [
      {
        id: 'nav-1',
        label: 'Packages',
        href: '/packages',
        order: 1,
      },
      {
        id: 'nav-2',
        label: 'Solutions',
        href: '/solutions',
        order: 2,
      },
      {
        id: 'nav-3',
        label: 'Pricing',
        href: '/pricing',
        order: 3,
      },
    ],
    footerContent: 'ATLVS - Your Business Operations Hub',
    legalLinks: [
      {
        id: 'legal-1',
        type: 'terms',
        label: 'Terms of Service',
        href: '/legal/terms',
      },
      {
        id: 'legal-2',
        type: 'privacy',
        label: 'Privacy Policy',
        href: '/legal/privacy',
      },
    ],
  },
};

// ============================================================================
// COMPVSS Default Theme
// ============================================================================

export const COMPVSS_DEFAULT_THEME: ExperienceThemeConfig = {
  organizerId: '00000000-0000-0000-0000-000000000003',

  branding: {
    logo: '/assets/compvss/logo.svg',
    colors: {
      primary: '#EF4444', // Red
      secondary: '#3B82F6', // Blue
      accent: '#F59E0B', // Amber
    },
    typography: {
      displayFont: 'Bebas Neue, sans-serif',
      bodyFont: 'Inter, system-ui',
    },
    customDomain: 'compvss.com',
  },

  features: {
    bookingEnabled: true,
    reviewsEnabled: true,
    socialSharingEnabled: true,
    chatEnabled: true,
  },

  content: {
    customNavLinks: [
      {
        id: 'nav-1',
        label: 'Competitions',
        href: '/competitions',
        order: 1,
      },
      {
        id: 'nav-2',
        label: 'Events',
        href: '/events',
        order: 2,
      },
      {
        id: 'nav-3',
        label: 'Leaderboard',
        href: '/leaderboard',
        order: 3,
      },
    ],
    footerContent: 'COMPVSS - Competition Management Platform',
    legalLinks: [
      {
        id: 'legal-1',
        type: 'terms',
        label: 'Terms of Service',
        href: '/legal/terms',
      },
      {
        id: 'legal-2',
        type: 'privacy',
        label: 'Privacy Policy',
        href: '/legal/privacy',
      },
    ],
  },
};

// ============================================================================
// Theme Registry
// ============================================================================

export const DEFAULT_THEMES = {
  gvteway: GVTEWAY_DEFAULT_THEME,
  atlvs: ATLVS_DEFAULT_THEME,
  compvss: COMPVSS_DEFAULT_THEME,
} as const;

/**
 * Get default theme for a platform
 */
export function getDefaultTheme(
  platform: 'gvteway' | 'atlvs' | 'compvss'
): ExperienceThemeConfig {
  return DEFAULT_THEMES[platform];
}

/**
 * Get theme by organizer ID
 * Falls back to default theme if organizer theme not found
 */
export async function getOrganizerTheme(
  organizerId: string,
  platform: 'gvteway' | 'atlvs' | 'compvss'
): Promise<ExperienceThemeConfig> {
  // TODO: Fetch from database
  // For now, return default theme
  return getDefaultTheme(platform);
}

/**
 * Validate theme configuration
 */
export function validateThemeConfig(
  config: ExperienceThemeConfig
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate organizerId
  if (!config.organizerId || config.organizerId.length === 0) {
    errors.push('organizerId is required');
  }

  // Validate primary color
  if (!config.branding?.colors?.primary) {
    errors.push('Primary color is required');
  } else if (!/^#[0-9A-F]{6}$/i.test(config.branding.colors.primary)) {
    errors.push('Primary color must be a valid hex color');
  }

  // Validate logo
  if (!config.branding?.logo) {
    errors.push('Logo URL is required');
  }

  // Validate features
  if (config.features?.bookingEnabled === undefined) {
    errors.push('bookingEnabled feature flag is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
