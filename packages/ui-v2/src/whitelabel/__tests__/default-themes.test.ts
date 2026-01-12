/**
 * Default Themes Validation Tests
 * Tests for platform default theme configurations
 */

import { describe, it, expect } from '@jest/globals';
import {
  GVTEWAY_DEFAULT_THEME,
  ATLVS_DEFAULT_THEME,
  COMPVSS_DEFAULT_THEME,
  getDefaultTheme,
  validateThemeConfig,
} from '../default-themes';
import { generateExperienceTheme } from '../experience-theme';

describe('Default Platform Themes', () => {
  describe('GVTEWAY Theme', () => {
    it('should have valid configuration', () => {
      const validation = validateThemeConfig(GVTEWAY_DEFAULT_THEME);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should have correct branding', () => {
      expect(GVTEWAY_DEFAULT_THEME.branding.colors.primary).toBe('#7B68EE');
      expect(GVTEWAY_DEFAULT_THEME.branding.colors.secondary).toBe('#49CCF9');
      expect(GVTEWAY_DEFAULT_THEME.branding.logo).toBeTruthy();
    });

    it('should have booking enabled', () => {
      expect(GVTEWAY_DEFAULT_THEME.features.bookingEnabled).toBe(true);
    });

    it('should have navigation links', () => {
      expect(GVTEWAY_DEFAULT_THEME.content.customNavLinks).toHaveLength(3);
      expect(GVTEWAY_DEFAULT_THEME.content.customNavLinks?.[0].label).toBe('Experiences');
    });

    it('should have legal links', () => {
      expect(GVTEWAY_DEFAULT_THEME.content.legalLinks).toHaveLength(3);
      expect(
        GVTEWAY_DEFAULT_THEME.content.legalLinks?.find((l) => l.type === 'terms')
      ).toBeTruthy();
      expect(
        GVTEWAY_DEFAULT_THEME.content.legalLinks?.find((l) => l.type === 'privacy')
      ).toBeTruthy();
      expect(
        GVTEWAY_DEFAULT_THEME.content.legalLinks?.find((l) => l.type === 'refund')
      ).toBeTruthy();
    });

    it('should generate valid theme', () => {
      const theme = generateExperienceTheme(GVTEWAY_DEFAULT_THEME);

      expect(theme.colors.primary).toBe('#7B68EE');
      expect(theme.colors.primaryHover).toBeTruthy();
      expect(theme.colors.primaryActive).toBeTruthy();
      expect(theme.colors.success).toBe('#10B981');
      expect(theme.typography.displayFont).toBe('Outfit, sans-serif');
      expect(theme.typography.bodyFont).toBe('Inter, system-ui');
    });
  });

  describe('ATLVS Theme', () => {
    it('should have valid configuration', () => {
      const validation = validateThemeConfig(ATLVS_DEFAULT_THEME);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should have correct branding', () => {
      expect(ATLVS_DEFAULT_THEME.branding.colors.primary).toBe('#7B68EE');
      expect(ATLVS_DEFAULT_THEME.branding.colors.secondary).toBe('#49CCF9');
      expect(ATLVS_DEFAULT_THEME.branding.colors.accent).toBe('#F59E0B');
    });

    it('should have unique typography', () => {
      expect(ATLVS_DEFAULT_THEME.branding.typography.displayFont).toBe('Anton, sans-serif');
      expect(ATLVS_DEFAULT_THEME.branding.typography.displayFont).not.toBe(
        GVTEWAY_DEFAULT_THEME.branding.typography.displayFont
      );
    });

    it('should have chat enabled', () => {
      expect(ATLVS_DEFAULT_THEME.features.chatEnabled).toBe(true);
    });

    it('should have navigation links', () => {
      expect(ATLVS_DEFAULT_THEME.content.customNavLinks).toHaveLength(3);
      expect(ATLVS_DEFAULT_THEME.content.customNavLinks?.[0].label).toBe('Packages');
    });

    it('should generate valid theme', () => {
      const theme = generateExperienceTheme(ATLVS_DEFAULT_THEME);

      expect(theme.colors.primary).toBe('#7B68EE');
      expect(theme.typography.displayFont).toBe('Anton, sans-serif');
    });
  });

  describe('COMPVSS Theme', () => {
    it('should have valid configuration', () => {
      const validation = validateThemeConfig(COMPVSS_DEFAULT_THEME);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should have correct branding', () => {
      expect(COMPVSS_DEFAULT_THEME.branding.colors.primary).toBe('#EF4444');
      expect(COMPVSS_DEFAULT_THEME.branding.colors.secondary).toBe('#3B82F6');
      expect(COMPVSS_DEFAULT_THEME.branding.colors.accent).toBe('#F59E0B');
    });

    it('should have unique primary color', () => {
      expect(COMPVSS_DEFAULT_THEME.branding.colors.primary).not.toBe(
        GVTEWAY_DEFAULT_THEME.branding.colors.primary
      );
      expect(COMPVSS_DEFAULT_THEME.branding.colors.primary).not.toBe(
        ATLVS_DEFAULT_THEME.branding.colors.primary
      );
    });

    it('should have unique typography', () => {
      expect(COMPVSS_DEFAULT_THEME.branding.typography.displayFont).toBe('Bebas Neue, sans-serif');
    });

    it('should have navigation links', () => {
      expect(COMPVSS_DEFAULT_THEME.content.customNavLinks).toHaveLength(3);
      expect(COMPVSS_DEFAULT_THEME.content.customNavLinks?.[0].label).toBe('Competitions');
    });

    it('should generate valid theme', () => {
      const theme = generateExperienceTheme(COMPVSS_DEFAULT_THEME);

      expect(theme.colors.primary).toBe('#EF4444');
      expect(theme.typography.displayFont).toBe('Bebas Neue, sans-serif');
    });
  });

  describe('Theme Factory', () => {
    it('should return correct theme for each platform', () => {
      expect(getDefaultTheme('gvteway')).toEqual(GVTEWAY_DEFAULT_THEME);
      expect(getDefaultTheme('atlvs')).toEqual(ATLVS_DEFAULT_THEME);
      expect(getDefaultTheme('compvss')).toEqual(COMPVSS_DEFAULT_THEME);
    });

    it('should have unique themes for each platform', () => {
      const gvtewayTheme = getDefaultTheme('gvteway');
      const atlvsTheme = getDefaultTheme('atlvs');
      const compvssTheme = getDefaultTheme('compvss');

      expect(gvtewayTheme.organizerId).not.toBe(atlvsTheme.organizerId);
      expect(atlvsTheme.organizerId).not.toBe(compvssTheme.organizerId);
    });
  });

  describe('Theme Validation', () => {
    it('should validate correct theme', () => {
      const validation = validateThemeConfig(GVTEWAY_DEFAULT_THEME);
      expect(validation.valid).toBe(true);
    });

    it('should reject theme without organizerId', () => {
      const invalid = {
        ...GVTEWAY_DEFAULT_THEME,
        organizerId: '',
      };

      const validation = validateThemeConfig(invalid);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('organizerId is required');
    });

    it('should reject theme without primary color', () => {
      const invalid = {
        ...GVTEWAY_DEFAULT_THEME,
        branding: {
          ...GVTEWAY_DEFAULT_THEME.branding,
          colors: {
            ...GVTEWAY_DEFAULT_THEME.branding.colors,
            primary: '',
          },
        },
      };

      const validation = validateThemeConfig(invalid);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Primary color is required');
    });

    it('should reject invalid hex color', () => {
      const invalid = {
        ...GVTEWAY_DEFAULT_THEME,
        branding: {
          ...GVTEWAY_DEFAULT_THEME.branding,
          colors: {
            ...GVTEWAY_DEFAULT_THEME.branding.colors,
            primary: 'not-a-color',
          },
        },
      };

      const validation = validateThemeConfig(invalid);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Primary color must be a valid hex color');
    });

    it('should reject theme without logo', () => {
      const invalid = {
        ...GVTEWAY_DEFAULT_THEME,
        branding: {
          ...GVTEWAY_DEFAULT_THEME.branding,
          logo: '',
        },
      };

      const validation = validateThemeConfig(invalid);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Logo URL is required');
    });
  });

  describe('Cross-Platform Consistency', () => {
    it('all themes should have booking enabled', () => {
      expect(GVTEWAY_DEFAULT_THEME.features.bookingEnabled).toBe(true);
      expect(ATLVS_DEFAULT_THEME.features.bookingEnabled).toBe(true);
      expect(COMPVSS_DEFAULT_THEME.features.bookingEnabled).toBe(true);
    });

    it('all themes should have reviews enabled', () => {
      expect(GVTEWAY_DEFAULT_THEME.features.reviewsEnabled).toBe(true);
      expect(ATLVS_DEFAULT_THEME.features.reviewsEnabled).toBe(true);
      expect(COMPVSS_DEFAULT_THEME.features.reviewsEnabled).toBe(true);
    });

    it('all themes should have social sharing enabled', () => {
      expect(GVTEWAY_DEFAULT_THEME.features.socialSharingEnabled).toBe(true);
      expect(ATLVS_DEFAULT_THEME.features.socialSharingEnabled).toBe(true);
      expect(COMPVSS_DEFAULT_THEME.features.socialSharingEnabled).toBe(true);
    });

    it('all themes should have navigation links', () => {
      expect(GVTEWAY_DEFAULT_THEME.content.customNavLinks).toHaveLength(3);
      expect(ATLVS_DEFAULT_THEME.content.customNavLinks).toHaveLength(3);
      expect(COMPVSS_DEFAULT_THEME.content.customNavLinks).toHaveLength(3);
    });

    it('all themes should have legal links', () => {
      expect(GVTEWAY_DEFAULT_THEME.content.legalLinks).toBeDefined();
      expect(ATLVS_DEFAULT_THEME.content.legalLinks).toBeDefined();
      expect(COMPVSS_DEFAULT_THEME.content.legalLinks).toBeDefined();

      expect(GVTEWAY_DEFAULT_THEME.content.legalLinks?.length).toBeGreaterThan(0);
      expect(ATLVS_DEFAULT_THEME.content.legalLinks?.length).toBeGreaterThan(0);
      expect(COMPVSS_DEFAULT_THEME.content.legalLinks?.length).toBeGreaterThan(0);
    });
  });

  describe('Theme Generation', () => {
    it('should generate consistent themes', () => {
      const theme1 = generateExperienceTheme(GVTEWAY_DEFAULT_THEME);
      const theme2 = generateExperienceTheme(GVTEWAY_DEFAULT_THEME);

      expect(theme1.colors.primary).toBe(theme2.colors.primary);
      expect(theme1.typography.displayFont).toBe(theme2.typography.displayFont);
    });

    it('should generate different hover states', () => {
      const gvtewayTheme = generateExperienceTheme(GVTEWAY_DEFAULT_THEME);
      const compvssTheme = generateExperienceTheme(COMPVSS_DEFAULT_THEME);

      expect(gvtewayTheme.colors.primaryHover).not.toBe(compvssTheme.colors.primaryHover);
    });

    it('should have all required color tokens', () => {
      const theme = generateExperienceTheme(GVTEWAY_DEFAULT_THEME);

      expect(theme.colors.primary).toBeTruthy();
      expect(theme.colors.primaryHover).toBeTruthy();
      expect(theme.colors.primaryActive).toBeTruthy();
      expect(theme.colors.primaryLight).toBeTruthy();
      expect(theme.colors.secondary).toBeTruthy();
      expect(theme.colors.accent).toBeTruthy();
      expect(theme.colors.success).toBeTruthy();
      expect(theme.colors.warning).toBeTruthy();
      expect(theme.colors.error).toBeTruthy();
      expect(theme.colors.info).toBeTruthy();
      expect(theme.colors.background).toBeTruthy();
      expect(theme.colors.surface).toBeTruthy();
      expect(theme.colors.border).toBeTruthy();
      expect(theme.colors.text).toBeTruthy();
    });
  });
});
