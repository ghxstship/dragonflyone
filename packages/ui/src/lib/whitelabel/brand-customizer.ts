/**
 * Brand Customization System
 * 
 * Provides utilities for customizing brand appearance, themes, and visual identity
 * for whitelabeling scenarios.
 */

import type { BrandConfig } from "../../design-system/tokens/types.js";

export interface BrandCustomizationOptions {
  /** Color palette overrides */
  colors?: {
    primary?: string;
    primaryHover?: string;
    primaryActive?: string;
    primarySubtle?: string;
    secondary?: string;
    accent?: string;
    success?: string;
    warning?: string;
    error?: string;
    info?: string;
  };
  
  /** Typography overrides */
  fonts?: {
    primary?: string;
    secondary?: string;
    mono?: string;
  };
  
  /** Border radius overrides */
  radius?: {
    none?: string;
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
    '3xl'?: string;
    full?: string;
  };
  
  /** Shadow overrides */
  shadows?: {
    none?: string;
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  };
  
  /** Logo overrides */
  logo?: {
    primary?: string;
    mark?: string;
    wordmark?: string;
    favicon?: string;
    dark?: {
      primary?: string;
      mark?: string;
    };
  };
  
  /** Content overrides */
  content?: {
    appName?: string;
    tagline?: string;
    supportEmail?: string;
    supportUrl?: string;
    docsUrl?: string;
    termsUrl?: string;
    privacyUrl?: string;
    copyrightHolder?: string;
  };
  
  /** Feature flags */
  features?: {
    showPoweredBy?: boolean;
    customDomain?: boolean;
    customEmailTemplates?: boolean;
    sharpCorners?: boolean;
    hardShadows?: boolean;
  };
}

/**
 * Brand Customizer Class
 * 
 * Handles brand customization, validation, and application.
 */
export class BrandCustomizer {
  private baseConfig: BrandConfig;
  
  constructor(baseConfig: BrandConfig) {
    this.baseConfig = baseConfig;
  }

  /**
   * Apply customizations to base brand config
   */
  customize(customizations: BrandCustomizationOptions): BrandConfig {
    return this.mergeConfigs(this.baseConfig, customizations);
  }

  /**
   * Generate CSS custom properties for brand customization
   */
  generateCSSVariables(config: BrandConfig): string {
    const variables: string[] = [];

    // Color variables
    if (config.colors) {
      Object.entries(config.colors).forEach(([key, value]) => {
        variables.push(`  --brand-color-${key}: ${value};`);
      });
    }

    // Font variables
    if (config.fonts) {
      Object.entries(config.fonts).forEach(([key, value]) => {
        variables.push(`  --brand-font-${key}: ${value};`);
      });
    }

    // Radius variables
    if (config.radius) {
      Object.entries(config.radius).forEach(([key, value]) => {
        variables.push(`  --brand-radius-${key}: ${value};`);
      });
    }

    // Shadow variables
    if (config.shadows) {
      Object.entries(config.shadows).forEach(([key, value]) => {
        variables.push(`  --brand-shadow-${key}: ${value};`);
      });
    }

    return `:root {\n${variables.join('\n')}\n}`;
  }

  /**
   * Validate brand customization options
   */
  validateCustomizations(customizations: BrandCustomizationOptions): {
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate colors
    if (customizations.colors) {
      Object.entries(customizations.colors).forEach(([key, value]) => {
        if (!this.isValidColor(value)) {
          errors.push(`Invalid color for ${key}: ${value}`);
        }
      });
    }

    // Validate fonts
    if (customizations.fonts) {
      Object.entries(customizations.fonts).forEach(([key, value]) => {
        if (!this.isValidFont(value)) {
          errors.push(`Invalid font for ${key}: ${value}`);
        }
      });
    }

    // Validate URLs
    if (customizations.logo) {
      const logoUrls = [
        customizations.logo.primary,
        customizations.logo.mark,
        customizations.logo.wordmark,
        customizations.logo.favicon,
        customizations.logo.dark?.primary,
        customizations.logo.dark?.mark,
      ].filter((url): url is string => Boolean(url));

      logoUrls.forEach((url, index) => {
        if (!this.isValidURL(url)) {
          errors.push(`Invalid logo URL at index ${index}: ${url}`);
        }
      });
    }

    // Validate content URLs
    if (customizations.content) {
      const contentUrls = [
        customizations.content.supportUrl,
        customizations.content.docsUrl,
        customizations.content.termsUrl,
        customizations.content.privacyUrl,
      ].filter((url): url is string => Boolean(url));

      contentUrls.forEach((url, index) => {
        if (!this.isValidURL(url)) {
          errors.push(`Invalid content URL at index ${index}: ${url}`);
        }
      });
    }

    // Check for accessibility issues
    if (customizations.colors) {
      const { primary, secondary, accent } = customizations.colors;
      
      if (primary && secondary && !this.hasGoodContrast(primary, secondary)) {
        warnings.push('Primary and secondary colors may have poor contrast');
      }
      
      if (primary && accent && !this.hasGoodContrast(primary, accent)) {
        warnings.push('Primary and accent colors may have poor contrast');
      }
    }

    return { errors, warnings };
  }

  /**
   * Generate brand preview
   */
  generatePreview(customizations: BrandCustomizationOptions): {
    preview: BrandConfig;
    css: string;
    validation: { errors: string[]; warnings: string[] };
  } {
    const validation = this.validateCustomizations(customizations);
    
    if (validation.errors.length > 0) {
      throw new Error(`Invalid customizations: ${validation.errors.join(', ')}`);
    }

    const preview = this.customize(customizations);
    const css = this.generateCSSVariables(preview);

    return { preview, css, validation };
  }

  /**
   * Export brand configuration to JSON
   */
  exportConfig(config: BrandConfig): string {
    return JSON.stringify(config, null, 2);
  }

  /**
   * Import brand configuration from JSON
   */
  importConfig(json: string): BrandConfig {
    try {
      return JSON.parse(json) as BrandConfig;
    } catch (error) {
      throw new Error(`Invalid brand configuration JSON: ${error}`);
    }
  }

  /**
   * Generate brand theme variants
   */
  generateThemeVariants(config: BrandConfig): {
    light: BrandConfig;
    dark: BrandConfig;
    inverted: BrandConfig;
  } {
    const light = { ...config };
    const dark = { ...config };
    const inverted = { ...config };

    // Apply dark mode adjustments
    if (config.colors) {
      // Dark mode typically uses lighter text on darker backgrounds
      dark.colors = {
        ...config.colors,
        // Adjust colors for dark mode if needed
      };
    }

    // Inverted theme swaps primary and secondary
    if (config.colors?.primary && config.colors?.secondary) {
      inverted.colors = {
        ...config.colors,
        primary: config.colors.secondary,
        secondary: config.colors.primary,
      };
    }

    return { light, dark, inverted };
  }

  /**
   * Check if color value is valid
   */
  private isValidColor(color: string): boolean {
    // Check hex colors
    if (/^#([A-Fa-f0-9]{3}){1}$|^#([A-Fa-f0-9]{6}){1}$/.test(color)) {
      return true;
    }
    
    // Check RGB/RGBA colors
    if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/.test(color)) {
      return true;
    }
    
    // Check HSL/HSLA colors
    if (/^hsla?\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*(,\s*[\d.]+\s*)?\)$/.test(color)) {
      return true;
    }
    
    // Check named colors
    const namedColors = [
      'transparent', 'inherit', 'initial', 'unset',
      'black', 'white', 'gray', 'red', 'green', 'blue',
      'yellow', 'orange', 'purple', 'pink', 'brown'
    ];
    
    return namedColors.includes(color.toLowerCase());
  }

  /**
   * Check if font value is valid
   */
  private isValidFont(font: string): boolean {
    // Check for valid font stack format
    return /^[\w\s\-'".,/]+$/.test(font);
  }

  /**
   * Check if URL is valid
   */
  private isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if two colors have good contrast
   */
  private hasGoodContrast(color1: string, color2: string): boolean {
    // Simplified contrast check - in production, use a proper contrast calculation library
    return color1 !== color2;
  }

  /**
   * Deep merge brand configurations
   */
  private mergeConfigs(base: BrandConfig, customizations: BrandCustomizationOptions): BrandConfig {
    const merged = { ...base };

    // Merge color overrides
    if (customizations.colors) {
      merged.colors = { ...base.colors, ...customizations.colors };
    }

    // Merge font overrides
    if (customizations.fonts) {
      merged.fonts = { ...base.fonts, ...customizations.fonts };
    }

    // Merge radius overrides
    if (customizations.radius) {
      merged.radius = { ...base.radius, ...customizations.radius };
    }

    // Merge shadow overrides
    if (customizations.shadows) {
      merged.shadows = { ...base.shadows, ...customizations.shadows };
    }

    // Merge logo overrides
    if (customizations.logo) {
      merged.logo = {
        ...base.logo,
        ...customizations.logo,
        dark: customizations.logo.dark ? {
          primary: customizations.logo.dark.primary || base.logo?.dark?.primary || base.logo?.primary,
          mark: customizations.logo.dark.mark || base.logo?.dark?.mark || base.logo?.mark,
        } : base.logo?.dark,
      };
    }

    // Merge content overrides
    if (customizations.content) {
      merged.content = { ...base.content, ...customizations.content };
    }

    // Merge feature flags
    if (customizations.features) {
      merged.features = { ...base.features, ...customizations.features };
    }

    return merged;
  }
}

/**
 * Global brand customizer instance
 */
export const brandCustomizer = new BrandCustomizer({
  name: "Default",
  logo: {
    primary: "/assets/brand/logo.svg",
    mark: "/assets/brand/mark.svg",
    favicon: "/assets/brand/favicon.ico",
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
});
