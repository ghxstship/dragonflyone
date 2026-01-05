// Core whitelabeling system
export { TenantResolver, tenantResolver, getServerTenant } from "./tenant-resolver.js";
export type { TenantInfo, TenantResolverConfig } from "./tenant-resolver.js";

export { useTenant } from "./use-tenant.js";

// Brand customization
export { BrandCustomizer, brandCustomizer } from "./brand-customizer.js";
export type { BrandCustomizationOptions } from "./brand-customizer.js";

export { useBrandCustomizer } from "./use-brand-customizer.js";

// Whitelabel provider
export { 
  WhitelabelProvider, 
  useWhitelabel, 
  useTenant as useTenantFromProvider,
  useBrand,
  useBrandCustomization,
  getServerWhitelabel 
} from "./whitelabel-provider.js";
export type { WhitelabelContextValue, WhitelabelProviderProps } from "./whitelabel-provider.js";

// Brand components
export { 
  BrandLogo,
  BrandName,
  BrandTagline,
  PoweredBy,
  BrandColors,
  BrandThemePreview 
} from "./brand-components.js";
export type { 
  BrandLogoProps,
  BrandNameProps,
  BrandTaglineProps,
  PoweredByProps,
  BrandColorsProps,
  BrandThemePreviewProps 
} from "./brand-components.js";
