/**
 * UI v2 Default Brand Configuration
 * Baseline ATLVS brand configuration
 */

import type { BrandConfig } from '../tokens/types';

export const defaultBrandConfig: BrandConfig = {
  id: '00000000-0000-0000-0000-000000000000',

  identity: {
    name: 'ATLVS',
    slug: 'atlvs',
    domain: 'atlvs.io',
    tagline: 'Your Business Operations Hub',
    logo: {
      light: '/assets/brand/logo.svg',
      dark: '/assets/brand/logo-dark.svg',
      mark: '/assets/brand/mark.svg',
      favicon: '/assets/brand/favicon.ico',
    },
  },

  colors: {
    brand: '#7B68EE', // Medium Purple
    accent: '#49CCF9', // Sky Blue
  },

  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    scale: 'comfortable',
    weights: [400, 500, 600, 700],
  },

  design: {
    radius: 'md',
    shadows: 'soft',
    borders: 'subtle',
    animations: true,
  },

  features: {
    darkMode: true,
    customDomain: true,
    removeBranding: false,
    customAuth: false,
  },

  content: {
    copyrightHolder: 'GHXSTSHIP Industries LLC',
    supportEmail: 'support@atlvs.io',
    supportUrl: 'https://support.atlvs.io',
    docsUrl: 'https://docs.atlvs.io',
    legalLinks: {
      terms: '/legal/terms',
      privacy: '/legal/privacy',
    },
  },
};
