"use client";

import { forwardRef, ReactNode } from "react";
import clsx from "clsx";
import * as LucideIcons from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

export interface MobileNavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  badge?: string | number;
  active?: boolean;
}

export interface MobileBottomNavProps {
  /** Navigation items (max 5 recommended) */
  items: MobileNavItem[];
  /** Current active path */
  currentPath?: string;
  /** Navigation callback */
  onNavigate?: (href: string) => void;
  /** Dark mode */
  inverted?: boolean;
  /** Additional className */
  className?: string;
}

// =============================================================================
// ICON RESOLVER
// =============================================================================

function getIcon(iconName: string, size: number = 20): ReactNode {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const icons = LucideIcons as any;
  const Icon = icons[iconName];
  if (Icon && typeof Icon === 'function') {
    return <Icon size={size} />;
  }
  return null;
}

// =============================================================================
// MOBILE BOTTOM NAV COMPONENT
// =============================================================================

export const MobileBottomNav = forwardRef<HTMLElement, MobileBottomNavProps>(
  function MobileBottomNav(
    {
      items,
      currentPath = "",
      onNavigate,
      inverted = true,
      className,
    },
    ref
  ) {
    // Limit to 5 items for mobile UX
    const displayItems = items.slice(0, 5);

    return (
      <nav
        ref={ref}
        className={clsx(
          "fixed bottom-0 left-0 right-0 z-40 md:hidden",
          "border-t-2 safe-area-inset-bottom",
          inverted
            ? "bg-ink-950 border-ink-800"
            : "bg-white border-ink-200",
          className
        )}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex items-stretch justify-around h-16">
          {displayItems.map((item) => {
            const isActive = item.active ?? currentPath.startsWith(item.href);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate?.(item.href)}
                className={clsx(
                  "flex flex-1 flex-col items-center justify-center gap-0.5 px-2 py-1 transition-colors relative",
                  isActive
                    ? inverted
                      ? "text-primary-400"
                      : "text-primary-600"
                    : inverted
                    ? "text-ink-400 hover:text-ink-200"
                    : "text-ink-500 hover:text-ink-700"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {/* Active indicator */}
                {isActive && (
                  <span
                    className={clsx(
                      "absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full",
                      inverted ? "bg-primary-400" : "bg-primary-600"
                    )}
                  />
                )}

                {/* Icon with badge */}
                <span className="relative">
                  {getIcon(item.icon, 22)}
                  {item.badge !== undefined && (
                    <span
                      className={clsx(
                        "absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center",
                        "text-[10px] font-bold rounded-full",
                        "bg-error-500 text-white"
                      )}
                    >
                      {typeof item.badge === "number" && item.badge > 99
                        ? "99+"
                        : item.badge}
                    </span>
                  )}
                </span>

                {/* Label */}
                <span
                  className={clsx(
                    "text-[10px] font-medium truncate max-w-full",
                    isActive && "font-semibold"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  }
);

export default MobileBottomNav;
