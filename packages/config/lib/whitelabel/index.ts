// Whitelabel module exports

// Theme Provider and hooks
export {
  ThemeProvider,
  useTheme,
  useAccentColor,
  useColorMode,
  useBrandId,
  useBrandClasses,
  getServerSideThemeConfig,
} from './theme-provider';

// Brand Configuration
export {
  BrandConfigSchema,
  brandConfigs,
  getBrandConfig,
  getBrandFromEnv,
  validateBrandConfig,
  getCopyrightText,
  getPoweredByText,
  type BrandConfig,
} from './brand-config';

// Brand Hooks
export {
  useBrand,
  useBrandName,
  useBrandTagline,
  useBrandMeta,
  useBrandLegal,
  useBrandSocial,
  useBrandSupport,
  type UseBrandResult,
} from './use-brand';

// Color Configuration
export {
  ColorConfigSchema,
  brandColorConfigs,
  resolveColorConfig,
  getBrandFromHostname,
  validateCustomAccentColor,
  getBrandInfo,
  type ColorConfig,
} from './color-config';
