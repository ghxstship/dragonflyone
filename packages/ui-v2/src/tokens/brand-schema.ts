/**
 * UI v2 Brand Configuration Schema
 * Zod validation schema for tenant brand configurations
 */

import { z } from 'zod';

// ============================================================================
// Brand Identity Schema
// ============================================================================

const BrandLogoSchema = z.object({
  light: z.string().url('Logo light variant must be a valid URL'),
  dark: z.string().url('Logo dark variant must be a valid URL'),
  mark: z.string().url('Logo mark must be a valid URL'),
  favicon: z.string().url('Favicon must be a valid URL'),
});

const BrandIdentitySchema = z.object({
  name: z.string().min(1, 'Brand name is required').max(100),
  slug: z
    .string()
    .min(1, 'Brand slug is required')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  domain: z.string().url().optional(),
  tagline: z.string().max(200).optional(),
  logo: BrandLogoSchema,
});

// ============================================================================
// Brand Colors Schema
// ============================================================================

const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

const BrandColorsSchema = z.object({
  brand: z.string().regex(hexColorRegex, 'Brand color must be a valid hex color'),
  brandLight: z.string().regex(hexColorRegex, 'Brand light color must be a valid hex color').optional(),
  brandDark: z.string().regex(hexColorRegex, 'Brand dark color must be a valid hex color').optional(),
  accent: z.string().regex(hexColorRegex, 'Accent color must be a valid hex color').optional(),
});

// ============================================================================
// Brand Typography Schema
// ============================================================================

const BrandTypographySchema = z.object({
  fontFamily: z.string().min(1, 'Font family is required'),
  fontUrl: z.string().url('Font URL must be valid').optional(),
  scale: z.enum(['compact', 'comfortable', 'spacious']).default('comfortable'),
  weights: z.array(z.number().min(100).max(900)).default([400, 500, 600, 700]),
});

// ============================================================================
// Brand Design Schema
// ============================================================================

const BrandDesignSchema = z.object({
  radius: z.enum(['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', 'full']).default('md'),
  shadows: z.enum(['none', 'subtle', 'soft', 'hard']).default('soft'),
  borders: z.enum(['none', 'subtle', 'strong']).default('subtle'),
  animations: z.boolean().default(true),
});

// ============================================================================
// Brand Features Schema
// ============================================================================

const BrandFeaturesSchema = z.object({
  darkMode: z.boolean().default(true),
  customDomain: z.boolean().default(false),
  removeBranding: z.boolean().default(false),
  customAuth: z.boolean().default(false),
});

// ============================================================================
// Brand Content Schema
// ============================================================================

const BrandContentSchema = z.object({
  copyrightHolder: z.string().min(1, 'Copyright holder is required'),
  supportEmail: z.string().email('Support email must be valid'),
  supportUrl: z.string().url().optional(),
  docsUrl: z.string().url().optional(),
  legalLinks: z.object({
    terms: z.string().url('Terms URL must be valid'),
    privacy: z.string().url('Privacy URL must be valid'),
    security: z.string().url().optional(),
  }),
});

// ============================================================================
// Complete Brand Configuration Schema
// ============================================================================

export const BrandConfigSchema = z.object({
  id: z.string().uuid('Brand ID must be a valid UUID'),
  identity: BrandIdentitySchema,
  colors: BrandColorsSchema,
  typography: BrandTypographySchema,
  design: BrandDesignSchema,
  features: BrandFeaturesSchema,
  content: BrandContentSchema,
});

// Partial schema for updates
export const PartialBrandConfigSchema = BrandConfigSchema.partial();

// ============================================================================
// Validation Helpers
// ============================================================================

export function validateBrandConfig(config: unknown): z.infer<typeof BrandConfigSchema> {
  return BrandConfigSchema.parse(config);
}

export function validatePartialBrandConfig(
  config: unknown
): z.infer<typeof PartialBrandConfigSchema> {
  return PartialBrandConfigSchema.parse(config);
}

export function safeParseBrandConfig(config: unknown) {
  return BrandConfigSchema.safeParse(config);
}

// ============================================================================
// Type Exports
// ============================================================================

export type BrandConfigInput = z.infer<typeof BrandConfigSchema>;
export type PartialBrandConfigInput = z.infer<typeof PartialBrandConfigSchema>;
