"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { tenantResolver, type TenantInfo } from "./tenant-resolver.js";
import { brandCustomizer, type BrandCustomizationOptions } from "./brand-customizer.js";
import type { BrandConfig } from "../../design-system/tokens/types.js";
import { loadBrandConfig } from "../../whitelabel/brand-config.js";

export interface WhitelabelContextValue {
  /** Current tenant information */
  tenant: TenantInfo | null;
  
  /** Brand configuration */
  brand: BrandConfig;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error state */
  error: string | null;
  
  /** Refresh tenant and brand */
  refresh: () => Promise<void>;
  
  /** Apply brand customizations */
  customizeBrand: (customizations: BrandCustomizationOptions) => void;
  
  /** Reset to default brand */
  resetBrand: () => void;
}

const WhitelabelContext = createContext<WhitelabelContextValue | null>(null);

export interface WhitelabelProviderProps {
  /** Tenant ID (optional - will be resolved from context) */
  tenantId?: string;
  
  /** Children components */
  children: React.ReactNode;
  
  /** Enable brand customization */
  enableCustomization?: boolean;
  
  /** Custom brand overrides */
  brandOverrides?: Partial<BrandConfig>;
}

/**
 * Whitelabel Provider Component
 * 
 * Provides tenant resolution and brand configuration to the application.
 * Handles loading, caching, and updates of tenant-specific branding.
 */
export const WhitelabelProvider: React.FC<WhitelabelProviderProps> = ({
  tenantId,
  children,
  enableCustomization = false,
  brandOverrides,
}) => {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [brand, setBrand] = useState<BrandConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customizations, setCustomizations] = useState<BrandCustomizationOptions>({});

  // Load tenant and brand configuration
  const loadConfiguration = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Resolve tenant
      const resolvedTenant = await tenantResolver.resolveTenant();
      setTenant(resolvedTenant);

      // Load brand configuration
      let brandConfig: BrandConfig;
      
      if (tenantId) {
        brandConfig = await loadBrandConfig(tenantId);
      } else {
        brandConfig = await loadBrandConfig(resolvedTenant.id);
      }

      // Apply brand overrides
      if (brandOverrides) {
        brandConfig = brandCustomizer.customize(brandOverrides);
      }

      // Apply customizations
      if (enableCustomization && Object.keys(customizations).length > 0) {
        brandConfig = brandCustomizer.customize(customizations);
      }

      // Apply tenant-specific overrides
      if (resolvedTenant.brandOverrides) {
        brandConfig = brandCustomizer.customize(resolvedTenant.brandOverrides);
      }

      setBrand(brandConfig);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load whitelabel configuration';
      setError(errorMessage);
      
      // Fallback to default brand
      try {
        const fallbackBrand = await loadBrandConfig();
        setBrand(fallbackBrand);
      } catch (fallbackError) {
        console.error('Failed to load fallback brand:', fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadConfiguration();
  }, [tenantId]);

  // Apply customizations when they change
  useEffect(() => {
    if (brand && enableCustomization && Object.keys(customizations).length > 0) {
      const customizedBrand = brandCustomizer.customize(customizations);
      setBrand(customizedBrand);
    }
  }, [customizations, enableCustomization]);

  // Refresh function
  const refresh = async () => {
    await loadConfiguration();
  };

  // Customize brand function
  const customizeBrand = (newCustomizations: BrandCustomizationOptions) => {
    setCustomizations(newCustomizations);
  };

  // Reset brand function
  const resetBrand = () => {
    setCustomizations({});
    loadConfiguration();
  };

  // Context value
  const value = useMemo<WhitelabelContextValue>(() => ({
    tenant,
    brand: brand || {} as BrandConfig,
    isLoading,
    error,
    refresh,
    customizeBrand,
    resetBrand,
  }), [tenant, brand, isLoading, error]);

  return (
    <WhitelabelContext.Provider value={value}>
      {children}
    </WhitelabelContext.Provider>
  );
};

/**
 * Hook for accessing whitelabel context
 */
export const useWhitelabel = () => {
  const context = useContext(WhitelabelContext);
  if (!context) {
    throw new Error("useWhitelabel must be used within a WhitelabelProvider");
  }
  return context;
};

/**
 * Hook for accessing tenant information
 */
export const useTenant = () => {
  const { tenant, isLoading, error, refresh } = useWhitelabel();
  return { tenant, isLoading, error, refresh };
};

/**
 * Hook for accessing brand configuration
 */
export const useBrand = () => {
  const { brand, isLoading, error, customizeBrand, resetBrand } = useWhitelabel();
  return { brand, isLoading, error, customizeBrand, resetBrand };
};

/**
 * Hook for brand customization
 */
export const useBrandCustomization = () => {
  const { brand, customizeBrand, resetBrand } = useWhitelabel();
  
  const validateCustomizations = (customizations: BrandCustomizationOptions) => {
    return brandCustomizer.validateCustomizations(customizations);
  };

  const generateCSSVariables = (config: BrandConfig) => {
    return brandCustomizer.generateCSSVariables(config);
  };

  const exportBrand = () => {
    if (!brand) return '';
    return brandCustomizer.exportConfig(brand);
  };

  return {
    brand,
    customizeBrand,
    resetBrand,
    validateCustomizations,
    generateCSSVariables,
    exportBrand,
  };
};

/**
 * Server-side whitelabel helper
 */
export const getServerWhitelabel = async (request: Request) => {
  const tenant = await tenantResolver.resolveTenant(request);
  const brand = await loadBrandConfig(tenant.id);
  
  // Apply tenant-specific overrides
  if (tenant.brandOverrides) {
    return brandCustomizer.customize(tenant.brandOverrides);
  }
  
  return brand;
};
