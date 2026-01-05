"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useThemeSafe } from "../providers/theme-provider.js";
import { Button } from "../atoms/Button/index.js";
const cn = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(" ");

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  variant?: "icon" | "dropdown";
}

export function ThemeToggle({
  className,
  showLabel = false,
  variant = "icon",
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeSafe();

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className={cn("relative", className)}
        aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
      >
        <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        {showLabel && (
          <span className="ml-2">
            {resolvedTheme === "dark" ? "Light" : "Dark"} Mode
          </span>
        )}
      </Button>
    );
  }

  // Dropdown variant with all three options
  return (
    <div className={cn("flex gap-1 rounded-lg bg-surface-secondary p-1", className)}>
      <button
        onClick={() => setTheme("light")}
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
          theme === "light"
            ? "bg-surface-primary text-text-primary shadow-sm"
            : "text-text-muted hover:text-text-secondary"
        )}
        aria-label="Light mode"
      >
        <Sun className="size-4" />
        {showLabel && <span>Light</span>}
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
          theme === "dark"
            ? "bg-surface-primary text-text-primary shadow-sm"
            : "text-text-muted hover:text-text-secondary"
        )}
        aria-label="Dark mode"
      >
        <Moon className="size-4" />
        {showLabel && <span>Dark</span>}
      </button>
      <button
        onClick={() => setTheme("system")}
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
          theme === "system"
            ? "bg-surface-primary text-text-primary shadow-sm"
            : "text-text-muted hover:text-text-secondary"
        )}
        aria-label="System preference"
      >
        <Monitor className="size-4" />
        {showLabel && <span>System</span>}
      </button>
    </div>
  );
}
