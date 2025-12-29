"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo, ReactNode } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "ghxstship-theme";

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  storageKey = STORAGE_KEY,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  // Load theme from storage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null;
    if (stored) {
      setThemeState(stored);
    }
    setMounted(true);
  }, [storageKey]);

  // Update resolved theme and apply to document
  useEffect(() => {
    if (!mounted) return;

    const resolved = theme === "system" ? getSystemTheme() : theme;
    setResolvedTheme(resolved);

    // Apply theme class to document
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolved);

    // Update CSS variables for semantic colors
    if (resolved === "dark") {
      root.style.setProperty("--surface-primary", "#000000");
      root.style.setProperty("--surface-secondary", "#171717");
      root.style.setProperty("--surface-tertiary", "#262626");
      root.style.setProperty("--surface-elevated", "#262626");
      root.style.setProperty("--surface-overlay", "rgba(0, 0, 0, 0.8)");
      root.style.setProperty("--surface-inverse", "#FFFFFF");
      root.style.setProperty("--surface-muted", "#404040");
      root.style.setProperty("--text-primary", "#FFFFFF");
      root.style.setProperty("--text-secondary", "#D4D4D4");
      root.style.setProperty("--text-muted", "#A3A3A3");
      root.style.setProperty("--text-disabled", "#737373");
      root.style.setProperty("--border-default", "#404040");
      root.style.setProperty("--border-muted", "#262626");
    } else {
      root.style.setProperty("--surface-primary", "#FFFFFF");
      root.style.setProperty("--surface-secondary", "#F5F5F5");
      root.style.setProperty("--surface-tertiary", "#E5E5E5");
      root.style.setProperty("--surface-elevated", "#FFFFFF");
      root.style.setProperty("--surface-overlay", "rgba(255, 255, 255, 0.8)");
      root.style.setProperty("--surface-inverse", "#000000");
      root.style.setProperty("--surface-muted", "#D4D4D4");
      root.style.setProperty("--text-primary", "#000000");
      root.style.setProperty("--text-secondary", "#404040");
      root.style.setProperty("--text-muted", "#737373");
      root.style.setProperty("--text-disabled", "#A3A3A3");
      root.style.setProperty("--border-default", "#D4D4D4");
      root.style.setProperty("--border-muted", "#E5E5E5");
    }
  }, [theme, mounted]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setResolvedTheme(getSystemTheme());
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);
  }, [storageKey]);

  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);
  }, [resolvedTheme, storageKey]);

  const value = useMemo<ThemeContextValue>(() => ({
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  }), [theme, resolvedTheme, setTheme, toggleTheme]);

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
