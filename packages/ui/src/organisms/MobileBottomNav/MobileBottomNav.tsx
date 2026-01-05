"use client";

import { forwardRef, useState, useCallback } from "react";
import clsx from "clsx";
import { Modal } from "../Modal/index.js";
import * as LucideIcons from "lucide-react";
import { mobileBottomNavVariants } from "./MobileBottomNav.variants.js";
import type { 
  MobileBottomNavProps, 
  MobileNavItem, 
  QuickActionItem 
} from "./MobileBottomNav.types.js";

// =============================================================================
// ICON RESOLVER
// =============================================================================

function getIcon(iconName: string, size: number = 20): React.ReactNode {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const icons = LucideIcons as any;
  const Icon = icons[iconName];
  if (Icon && typeof Icon === 'function') {
    return <Icon size={size} />;
  }
  return null;
}

// =============================================================================
// QUICK ACTIONS SHEET
// =============================================================================

interface QuickActionsSheetProps {
  open: boolean;
  onClose: () => void;
  actions: QuickActionItem[];
  onSelect: (action: QuickActionItem) => void;
  inverted: boolean;
}

function QuickActionsSheet({ open, onClose, actions, onSelect, inverted }: QuickActionsSheetProps) {
  const colorClasses: Record<string, string> = {
    primary: inverted ? "bg-primary-500/20 text-primary-400 border-primary-500/30" : "bg-primary-50 text-primary-600 border-primary-200",
    secondary: inverted ? "bg-secondary-500/20 text-secondary-400 border-secondary-500/30" : "bg-secondary-50 text-secondary-600 border-secondary-200",
    accent: inverted ? "bg-accent-500/20 text-accent-400 border-accent-500/30" : "bg-accent-50 text-accent-600 border-accent-200",
    success: inverted ? "bg-success-500/20 text-success-400 border-success-500/30" : "bg-success-50 text-success-600 border-success-200",
    warning: inverted ? "bg-warning-500/20 text-warning-400 border-warning-500/30" : "bg-warning-50 text-warning-600 border-warning-200",
    error: inverted ? "bg-error-500/20 text-error-400 border-error-500/30" : "bg-error-50 text-error-600 border-error-200",
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      showClose={false}
    >
      <div className="grid grid-cols-4 gap-3 -mt-2">
        {actions.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => {
              onSelect(action);
              onClose();
            }}
            className={clsx(
              "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
              "active:scale-95",
              colorClasses[action.color || "primary"]
            )}
          >
            <span className="w-10 h-10 flex items-center justify-center rounded-lg">
              {getIcon(action.icon, 24)}
            </span>
            <span className="text-[11px] font-medium text-center leading-tight">
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </Modal>
  );
}

// =============================================================================
// NAV ITEM BUTTON
// =============================================================================

interface NavItemButtonProps {
  item: MobileNavItem;
  isActive: boolean;
  inverted: boolean;
  onNavigate?: (href: string) => void;
  compact?: boolean;
}

function NavItemButton({ item, isActive, inverted, onNavigate, compact }: NavItemButtonProps) {
  return (
    <button
      type="button"
      onClick={() => onNavigate?.(item.href)}
      className={clsx(
        "flex flex-col items-center justify-center gap-0.5 transition-colors relative",
        compact ? "flex-1 px-1 py-1" : "flex-1 px-2 py-1",
        isActive
          ? inverted
            ? "text-primary-400"
            : "text-primary-600"
          : inverted
          ? "text-text-muted hover:text-text-secondary active:text-text-primary"
          : "text-text-muted hover:text-text-secondary active:text-text-primary"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {isActive && (
        <span
          className={clsx(
            "absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full",
            inverted ? "bg-primary-400" : "bg-primary-600"
          )}
        />
      )}

      <span className="relative">
        {getIcon(item.icon, compact ? 20 : 22)}
        {item.badge !== undefined && (
          <span
            className={clsx(
              "absolute -top-1 -right-1.5 min-w-[14px] h-3.5 px-1 flex items-center justify-center",
              "text-[9px] font-bold rounded-full",
              "bg-error-500 text-white"
            )}
          >
            {typeof item.badge === "number" && item.badge > 99
              ? "99+"
              : item.badge}
          </span>
        )}
      </span>

      <span
        className={clsx(
          "font-medium truncate max-w-full",
          compact ? "text-[9px]" : "text-[10px]",
          isActive && "font-semibold"
        )}
      >
        {item.label}
      </span>
    </button>
  );
}

// =============================================================================
// CENTER FAB BUTTON
// =============================================================================

interface CenterFabProps {
  isOpen: boolean;
  onClick: () => void;
  inverted: boolean;
}

function CenterFab({ isOpen, onClick, inverted }: CenterFabProps) {
  return (
    <div className="relative flex items-center justify-center w-16">
      <button
        type="button"
        onClick={onClick}
        className={clsx(
          "absolute -top-4 w-14 h-14 rounded-full flex items-center justify-center",
          "border-2 shadow-lg transition-all duration-200",
          "active:scale-95",
          isOpen
            ? "rotate-45 bg-error-500 border-error-400 text-white"
            : inverted
            ? "bg-primary-500 border-primary-400 text-white hover:bg-primary-400"
            : "bg-primary-600 border-primary-500 text-white hover:bg-primary-500"
        )}
        aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
        aria-expanded={isOpen}
      >
        {getIcon("Plus", 28)}
      </button>
    </div>
  );
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
      quickActions = [],
      onQuickAction,
      inverted = true,
      className,
    },
    ref
  ) {
    const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);

    const handleQuickActionSelect = useCallback((action: QuickActionItem) => {
      if (action.onClick) {
        action.onClick();
      } else if (action.href && onNavigate) {
        onNavigate(action.href);
      }
      onQuickAction?.(action);
    }, [onNavigate, onQuickAction]);

    const hasQuickActions = quickActions.length > 0;
    const leftItems = items.slice(0, 3);
    const rightItems = items.slice(3, 6);
    const isCompact = items.length > 4;

    return (
      <>
        <nav
          ref={ref}
          className={clsx(
            mobileBottomNavVariants({ inverted }),
            "border-t-2 safe-area-inset-bottom",
            className
          )}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="flex items-stretch justify-around h-16">
            {leftItems.map((item) => {
              const isActive = item.active ?? currentPath.startsWith(item.href);
              return (
                <NavItemButton
                  key={item.id}
                  item={item}
                  isActive={isActive}
                  inverted={inverted}
                  onNavigate={onNavigate}
                  compact={isCompact}
                />
              );
            })}

            {hasQuickActions && (
              <CenterFab
                isOpen={isQuickActionsOpen}
                onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
                inverted={inverted}
              />
            )}

            {rightItems.map((item) => {
              const isActive = item.active ?? currentPath.startsWith(item.href);
              return (
                <NavItemButton
                  key={item.id}
                  item={item}
                  isActive={isActive}
                  inverted={inverted}
                  onNavigate={onNavigate}
                  compact={isCompact}
                />
              );
            })}
          </div>
        </nav>

        {hasQuickActions && (
          <QuickActionsSheet
            open={isQuickActionsOpen}
            onClose={() => setIsQuickActionsOpen(false)}
            actions={quickActions}
            onSelect={handleQuickActionSelect}
            inverted={inverted}
          />
        )}
      </>
    );
  }
);

export default MobileBottomNav;
