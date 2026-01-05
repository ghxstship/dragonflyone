"use client";

import { useState, useCallback } from "react";
import { brandCustomizer, type BrandCustomizationOptions } from "./brand-customizer.js";
import type { BrandConfig } from "../../design-system/tokens/types.js";

/**
 * Hook for brand customization
 */
export const useBrandCustomizer = () => {
  const [customizations, setCustomizations] = useState<BrandCustomizationOptions>({});
  const [preview, setPreview] = useState<BrandConfig | null>(null);
  const [validation, setValidation] = useState<{ errors: string[]; warnings: string[] }>({ errors: [], warnings: [] });

  const customize = useCallback((options: BrandCustomizationOptions) => {
    setCustomizations(options);
    
    try {
      const result = brandCustomizer.generatePreview(options);
      setPreview(result.preview);
      setValidation(result.validation);
    } catch (error) {
      setValidation({ errors: [error instanceof Error ? error.message : 'Unknown error'], warnings: [] });
      setPreview(null);
    }
  }, []);

  const reset = useCallback(() => {
    setCustomizations({});
    setPreview(null);
    setValidation({ errors: [], warnings: [] });
  }, []);

  const exportConfig = useCallback(() => {
    if (preview) {
      return brandCustomizer.exportConfig(preview);
    }
    return '';
  }, [preview]);

  return {
    customizations,
    preview,
    validation,
    customize,
    reset,
    exportConfig,
  };
};
