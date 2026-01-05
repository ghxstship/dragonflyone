"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { BrandConfig, DesignTokens } from "../design-system/tokens/types.js";
import { createDesignTokens } from "../design-system/tokens/index.js";
import { generateCSSVariables } from "../design-system/tokens/css-generator.js";
import { loadBrandConfig, defaultBrandConfig } from "./brand-config.js";

export type ColorMode = "light" | "dark" | "system";

interface ThemeContextValue {
  brand: BrandConfig;
  tokens: DesignTokens;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  resolvedColorMode: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const resolveSystemMode = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const ThemeProvider: React.FC<{
  tenantId?: string;
  children: React.ReactNode;
  defaultColorMode?: ColorMode;
}> = ({ tenantId, children, defaultColorMode = "system" }) => {
  const [brand, setBrand] = useState<BrandConfig>(defaultBrandConfig);
  const [colorMode, setColorMode] = useState<ColorMode>(defaultColorMode);
  const [resolvedColorMode, setResolvedColorMode] = useState<"light" | "dark">(
    defaultColorMode === "system" ? "light" : defaultColorMode
  );
  const [mounted, setMounted] = useState(false);

  // Handle mounting
  useEffect(() => {
    setMounted(true);
    
    // Set initial resolved color mode after mount
    if (defaultColorMode === "system") {
      setResolvedColorMode(resolveSystemMode());
    } else {
      setResolvedColorMode(defaultColorMode as "light" | "dark");
    }
    
    return () => setMounted(false);
  }, [defaultColorMode]);

  // Load brand configuration
  useEffect(() => {
    if (!mounted) return;
    
    loadBrandConfig(tenantId).then(setBrand).catch(() => setBrand(defaultBrandConfig));
  }, [tenantId, mounted]);

  // Sync system color mode
  useEffect(() => {
    if (!mounted) return;
    
    if (colorMode === "system" && typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      setResolvedColorMode(mediaQuery.matches ? "dark" : "light");
      const handler = (event: MediaQueryListEvent) => {
        setResolvedColorMode(event.matches ? "dark" : "light");
      };
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
    if (colorMode !== "system") {
      setResolvedColorMode(colorMode as "light" | "dark");
    }
    return undefined;
  }, [colorMode, mounted]);

  const tokens = useMemo(() => createDesignTokens(brand), [brand]);

  // Inject CSS variables
  useEffect(() => {
    if (!mounted || typeof document === "undefined") return undefined;
    
    const css = generateCSSVariables(tokens, resolvedColorMode);
    let styleEl = document.getElementById("theme-variables");
    if (!styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "theme-variables";
      document.head.appendChild(styleEl);
    }
    styleEl.textContent = css;
    return undefined;
  }, [tokens, resolvedColorMode, mounted]);

  // Set HTML class for mode
  useEffect(() => {
    if (!mounted || typeof document === "undefined") return undefined;
    
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(resolvedColorMode);
    return undefined;
  }, [resolvedColorMode, mounted]);

  const value = useMemo<ThemeContextValue>(
    () => ({ brand, tokens, colorMode, setColorMode, resolvedColorMode }),
    [brand, tokens, colorMode, resolvedColorMode]
  );

  // Prevent flash of wrong theme
  if (!mounted) {
    return <div style={{ visibility: 'hidden' }}>{children}</div>;
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const useBrand = () => useTheme().brand;
export const useTokens = () => useTheme().tokens;
export const useColorMode = () => {
  const { colorMode, setColorMode, resolvedColorMode } = useTheme();
  return { colorMode, setColorMode, resolvedColorMode };
};
