import { describe, it, expect } from 'vitest';
import type {
  ThemeMode,
  Density,
  BorderRadius,
  AccentColor,
  AppearanceSettings,
} from '../useAppearance';

describe('useAppearance', () => {
  describe('ThemeMode type', () => {
    it('should include all theme modes', () => {
      const modes: ThemeMode[] = ['light', 'dark', 'system'];
      expect(modes.length).toBe(3);
    });
  });

  describe('Density type', () => {
    it('should include all density options', () => {
      const densities: Density[] = ['compact', 'default', 'comfortable'];
      expect(densities.length).toBe(3);
    });
  });

  describe('BorderRadius type', () => {
    it('should include all border radius options', () => {
      const radii: BorderRadius[] = ['sharp', 'default', 'rounded'];
      expect(radii.length).toBe(3);
    });
  });

  describe('AccentColor type', () => {
    it('should include all accent colors', () => {
      const colors: AccentColor[] = ['indigo', 'violet', 'amber', 'emerald', 'rose', 'cyan'];
      expect(colors.length).toBe(6);
    });
  });

  describe('AppearanceSettings interface', () => {
    it('should have all required fields', () => {
      const settings: AppearanceSettings = {
        theme: 'dark',
        density: 'default',
        accentColor: 'indigo',
        borderRadius: 'default',
        fontScale: 1.0,
        animationsEnabled: true,
        reducedMotion: false,
        sidebarCollapsed: false,
        highContrast: false,
      };

      expect(settings.theme).toBe('dark');
      expect(settings.density).toBe('default');
      expect(settings.accentColor).toBe('indigo');
      expect(settings.fontScale).toBe(1.0);
    });

    it('should support light theme', () => {
      const settings: AppearanceSettings = {
        theme: 'light',
        density: 'default',
        accentColor: 'indigo',
        borderRadius: 'default',
        fontScale: 1.0,
        animationsEnabled: true,
        reducedMotion: false,
        sidebarCollapsed: false,
        highContrast: false,
      };
      expect(settings.theme).toBe('light');
    });

    it('should support system theme', () => {
      const settings: AppearanceSettings = {
        theme: 'system',
        density: 'default',
        accentColor: 'indigo',
        borderRadius: 'default',
        fontScale: 1.0,
        animationsEnabled: true,
        reducedMotion: false,
        sidebarCollapsed: false,
        highContrast: false,
      };
      expect(settings.theme).toBe('system');
    });

    it('should support compact density', () => {
      const settings: AppearanceSettings = {
        theme: 'dark',
        density: 'compact',
        accentColor: 'indigo',
        borderRadius: 'default',
        fontScale: 1.0,
        animationsEnabled: true,
        reducedMotion: false,
        sidebarCollapsed: false,
        highContrast: false,
      };
      expect(settings.density).toBe('compact');
    });

    it('should support reduced motion', () => {
      const settings: AppearanceSettings = {
        theme: 'dark',
        density: 'default',
        accentColor: 'indigo',
        borderRadius: 'default',
        fontScale: 1.0,
        animationsEnabled: false,
        reducedMotion: true,
        sidebarCollapsed: false,
        highContrast: false,
      };
      expect(settings.reducedMotion).toBe(true);
      expect(settings.animationsEnabled).toBe(false);
    });

    it('should support high contrast mode', () => {
      const settings: AppearanceSettings = {
        theme: 'dark',
        density: 'default',
        accentColor: 'indigo',
        borderRadius: 'default',
        fontScale: 1.0,
        animationsEnabled: true,
        reducedMotion: false,
        sidebarCollapsed: false,
        highContrast: true,
      };
      expect(settings.highContrast).toBe(true);
    });

    it('should support custom font scale', () => {
      const settings: AppearanceSettings = {
        theme: 'dark',
        density: 'default',
        accentColor: 'indigo',
        borderRadius: 'default',
        fontScale: 1.25,
        animationsEnabled: true,
        reducedMotion: false,
        sidebarCollapsed: false,
        highContrast: false,
      };
      expect(settings.fontScale).toBe(1.25);
    });
  });

  describe('Default settings', () => {
    const DEFAULT_SETTINGS: AppearanceSettings = {
      theme: 'dark',
      density: 'default',
      accentColor: 'indigo',
      borderRadius: 'default',
      fontScale: 1.0,
      animationsEnabled: true,
      reducedMotion: false,
      sidebarCollapsed: false,
      highContrast: false,
    };

    it('should have sensible defaults', () => {
      expect(DEFAULT_SETTINGS.theme).toBe('dark');
      expect(DEFAULT_SETTINGS.density).toBe('default');
      expect(DEFAULT_SETTINGS.fontScale).toBe(1.0);
      expect(DEFAULT_SETTINGS.animationsEnabled).toBe(true);
    });
  });

  describe('Accent color mappings', () => {
    const ACCENT_COLORS: Record<AccentColor, { primary: string; primaryHover: string }> = {
      indigo: { primary: '#6366f1', primaryHover: '#4f46e5' },
      violet: { primary: '#8b5cf6', primaryHover: '#7c3aed' },
      amber: { primary: '#f59e0b', primaryHover: '#d97706' },
      emerald: { primary: '#10b981', primaryHover: '#059669' },
      rose: { primary: '#f43f5e', primaryHover: '#e11d48' },
      cyan: { primary: '#06b6d4', primaryHover: '#0891b2' },
    };

    it('should have mappings for all accent colors', () => {
      const colors: AccentColor[] = ['indigo', 'violet', 'amber', 'emerald', 'rose', 'cyan'];
      colors.forEach((color) => {
        expect(ACCENT_COLORS[color]).toBeDefined();
        expect(ACCENT_COLORS[color].primary).toBeDefined();
        expect(ACCENT_COLORS[color].primaryHover).toBeDefined();
      });
    });

    it('should have valid hex colors', () => {
      const hexPattern = /^#[0-9a-f]{6}$/i;
      Object.values(ACCENT_COLORS).forEach((colors) => {
        expect(colors.primary).toMatch(hexPattern);
        expect(colors.primaryHover).toMatch(hexPattern);
      });
    });
  });

  describe('Density scale mappings', () => {
    const DENSITY_SCALES: Record<Density, { spacing: number; padding: number }> = {
      compact: { spacing: 0.75, padding: 0.75 },
      default: { spacing: 1.0, padding: 1.0 },
      comfortable: { spacing: 1.25, padding: 1.25 },
    };

    it('should have mappings for all densities', () => {
      expect(DENSITY_SCALES.compact.spacing).toBe(0.75);
      expect(DENSITY_SCALES.default.spacing).toBe(1.0);
      expect(DENSITY_SCALES.comfortable.spacing).toBe(1.25);
    });

    it('should have increasing scale from compact to comfortable', () => {
      expect(DENSITY_SCALES.compact.spacing).toBeLessThan(DENSITY_SCALES.default.spacing);
      expect(DENSITY_SCALES.default.spacing).toBeLessThan(DENSITY_SCALES.comfortable.spacing);
    });
  });

  describe('Border radius mappings', () => {
    const BORDER_RADIUS: Record<BorderRadius, { button: string; card: string; modal: string }> = {
      sharp: { button: '2px', card: '4px', modal: '8px' },
      default: { button: '4px', card: '8px', modal: '16px' },
      rounded: { button: '8px', card: '16px', modal: '24px' },
    };

    it('should have mappings for all border radius options', () => {
      expect(BORDER_RADIUS.sharp.button).toBe('2px');
      expect(BORDER_RADIUS.default.button).toBe('4px');
      expect(BORDER_RADIUS.rounded.button).toBe('8px');
    });

    it('should have increasing radius from button to modal', () => {
      const parsePixels = (s: string) => parseInt(s.replace('px', ''), 10);
      Object.values(BORDER_RADIUS).forEach((radius) => {
        expect(parsePixels(radius.button)).toBeLessThan(parsePixels(radius.card));
        expect(parsePixels(radius.card)).toBeLessThan(parsePixels(radius.modal));
      });
    });
  });
});
