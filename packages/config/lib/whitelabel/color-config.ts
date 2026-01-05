import { z } from 'zod';
import { generateAccentScale, AccentColorScale, BrandId } from '../../design-system/tokens/colors';

/**
 * WHITELABEL COLOR CONFIGURATION
 * 
 * Tenants can ONLY customize the accent color.
 * All other colors (grayscale, semantic) remain fixed
 * to ensure consistency and accessibility.
 */

export const ColorConfigSchema = z.object({
  /**
   * Primary accent color (hex format)
   * This is the ONLY color customization allowed.
   * Must meet WCAG AA contrast requirements.
   */
  accentColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid 6-digit hex color')
    .refine(
      (color) => meetsContrastRequirements(color),
      'Accent color must meet WCAG AA contrast requirements'
    ),
});

export type ColorConfig = z.infer<typeof ColorConfigSchema>;

// GHXSTSHIP Brand Color Configurations
export const brandColorConfigs: Record<BrandId, ColorConfig> = {
  atlvs: { accentColor: '#FF10F0' },    // Electric Pink
  compvss: { accentColor: '#FFD100' },  // Electric Yellow
  gvteway: { accentColor: '#00F0FF' },  // Electric Cyan
};

/**
 * Resolve color configuration for a tenant
 */
export const resolveColorConfig = (
  brandId?: BrandId,
  customConfig?: Partial<ColorConfig>
): AccentColorScale => {
  // Priority: Custom config > Brand preset > Default (ATLVS)
  const baseConfig = brandId && brandColorConfigs[brandId]
    ? brandColorConfigs[brandId]
    : brandColorConfigs.atlvs;
  
  const finalConfig = { ...baseConfig, ...customConfig };
  
  // Validate
  ColorConfigSchema.parse(finalConfig);
  
  // Generate full accent scale
  return generateAccentScale(finalConfig.accentColor);
};

/**
 * Check if a color meets WCAG AA contrast requirements
 * when used on both light and dark backgrounds
 */
function meetsContrastRequirements(hex: string): boolean {
  const luminance = getRelativeLuminance(hex);
  
  // Must have 4.5:1 contrast with white OR black for text
  const contrastWithWhite = (1.05) / (luminance + 0.05);
  const contrastWithBlack = (luminance + 0.05) / (0.05);
  
  // Color is usable if it contrasts well with at least one
  return contrastWithWhite >= 4.5 || contrastWithBlack >= 4.5;
}

function getRelativeLuminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const adjust = (c: number) => 
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  
  return 0.2126 * adjust(r) + 0.7152 * adjust(g) + 0.0722 * adjust(b);
}

/**
 * Get brand ID from hostname or configuration
 */
export const getBrandFromHostname = (hostname?: string): BrandId => {
  if (!hostname) return 'atlvs';
  
  if (hostname.includes('compvss')) return 'compvss';
  if (hostname.includes('gvteway')) return 'gvteway';
  if (hostname.includes('atlvs')) return 'atlvs';
  
  return 'atlvs'; // Default
};

/**
 * Validate custom accent color
 */
export const validateCustomAccentColor = (color: string): {
  valid: boolean;
  error?: string;
} => {
  try {
    ColorConfigSchema.parse({ accentColor: color });
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: error.errors[0]?.message || 'Invalid color format'
      };
    }
    return { valid: false, error: 'Unknown validation error' };
  }
};

/**
 * Get brand display information
 */
export const getBrandInfo = (brandId: BrandId) => {
  const configs: Record<BrandId, {
    name: string;
    fullName: string;
    description: string;
    accent: string;
    accentName: string;
  }> = {
    atlvs: {
      name: 'ATLVS',
      fullName: 'Advanced Ticketing & Logistics Visualization System',
      description: 'Internal Business Operations',
      accent: '#FF10F0',
      accentName: 'Electric Pink'
    },
    compvss: {
      name: 'COMPVSS', 
      fullName: 'Comprehensive Production Management System',
      description: 'Production Management',
      accent: '#FFD100',
      accentName: 'Electric Yellow'
    },
    gvteway: {
      name: 'GVTEWAY',
      fullName: 'Gateway Venue Technology',
      description: 'Consumer Experiences',
      accent: '#00F0FF',
      accentName: 'Electric Cyan'
    }
  };
  
  return configs[brandId];
};
