"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextValue {
  /** Current theme setting (may be "system") */
  theme: Theme;
  /** Resolved theme after system preference is applied */
  resolvedTheme: "dark" | "light";
  /** Set the theme preference */
  setTheme: (theme: Theme) => void;
  /** Toggle between dark and light */
  toggleTheme: () => void;
  /** Whether a theme is forced by the layout */
  forcedTheme?: "dark" | "light";
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "ghxstship-theme";

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

interface ThemeProviderProps {
  children: ReactNode;
  /** Default theme when no preference is stored */
  defaultTheme?: Theme;
  /** localStorage key for theme preference */
  storageKey?: string;
  /** Force a specific theme (user cannot change) */
  forcedTheme?: "dark" | "light";
  /** Enable smooth transitions when theme changes */
  enableTransitions?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = STORAGE_KEY,
  forcedTheme,
  enableTransitions = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // If forced, use that
    if (forcedTheme) return forcedTheme;
    return defaultTheme;
  });
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">(() => {
    if (forcedTheme) return forcedTheme;
    return defaultTheme === "system" ? "dark" : defaultTheme;
  });
  const [mounted, setMounted] = useState(false);

  // Load theme from storage on mount (only if not forced)
  useEffect(() => {
    if (forcedTheme) {
      setMounted(true);
      return;
    }
    
    const stored = localStorage.getItem(storageKey) as Theme | null;
    if (stored) {
      setThemeState(stored);
    }
    setMounted(true);
  }, [storageKey, forcedTheme]);

  // Update resolved theme and apply class to document
  useEffect(() => {
    if (!mounted) return;

    // If forced, always use that
    const effectiveTheme = forcedTheme || theme;
    const resolved = effectiveTheme === "system" ? getSystemTheme() : effectiveTheme;
    setResolvedTheme(resolved);

    // Apply theme class to document (CSS handles all variable changes)
    const root = document.documentElement;
    
    // Add transition class for smooth theme switching
    if (enableTransitions && !root.classList.contains("theme-loading")) {
      root.classList.add("theme-transitioning");
    }
    
    root.classList.remove("light", "dark");
    root.classList.add(resolved);
    root.dataset.theme = resolved;
    
    // Remove transition class after animation completes
    if (enableTransitions) {
      const timeout = setTimeout(() => {
        root.classList.remove("theme-transitioning");
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [theme, mounted, forcedTheme, enableTransitions]);

  // Listen for system theme changes
  useEffect(() => {
    const effectiveTheme = forcedTheme || theme;
    if (effectiveTheme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const newResolved = getSystemTheme();
      setResolvedTheme(newResolved);
      
      // Update document class
      const root = document.documentElement;
      if (enableTransitions) {
        root.classList.add("theme-transitioning");
      }
      root.classList.remove("light", "dark");
      root.classList.add(newResolved);
      root.dataset.theme = newResolved;
      
      if (enableTransitions) {
        setTimeout(() => root.classList.remove("theme-transitioning"), 200);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, forcedTheme, enableTransitions]);

  const setTheme = useCallback((newTheme: Theme) => {
    // Don't allow changing if forced
    if (forcedTheme) return;
    
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);
  }, [storageKey, forcedTheme]);

  const toggleTheme = useCallback(() => {
    // Don't allow toggling if forced
    if (forcedTheme) return;
    
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);
  }, [resolvedTheme, storageKey, forcedTheme]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme: forcedTheme || theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    forcedTheme,
  }), [theme, resolvedTheme, setTheme, toggleTheme, forcedTheme]);

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// Export a hook that's safe to use without provider (returns defaults)
export function useThemeSafe() {
  const context = useContext(ThemeContext);
  return context ?? {
    theme: "dark" as Theme,
    resolvedTheme: "dark" as const,
    setTheme: () => {},
    toggleTheme: () => {},
  };
}
