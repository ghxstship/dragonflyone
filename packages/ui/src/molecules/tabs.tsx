"use client";

import { forwardRef, useCallback, useRef, useState } from "react";
import clsx from "clsx";
import type { HTMLAttributes, ButtonHTMLAttributes, KeyboardEvent, TouchEvent } from "react";

// Swipe gesture constants
const SWIPE_THRESHOLD = 50; // Minimum distance for a swipe
const SWIPE_VELOCITY_THRESHOLD = 0.3; // Minimum velocity for a swipe

export type TabsVariant = "line" | "enclosed" | "pop";

export type TabsProps = HTMLAttributes<HTMLDivElement> & {
  variant?: TabsVariant;
  inverted?: boolean;
  /** Default tab index to show (0-indexed) */
  defaultTab?: number;
};

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  function Tabs({ variant: _variant = "line", inverted: _inverted = false, className, children, ...props }, ref) {
    return (
      <div ref={ref} className={clsx("w-full", className)} {...props}>
        {children}
      </div>
    );
  }
);

export type TabsListProps = HTMLAttributes<HTMLDivElement> & {
  variant?: TabsVariant;
  inverted?: boolean;
  /** Callback when tab changes via keyboard or swipe navigation */
  onTabChange?: (index: number) => void;
  /** Enable touch swipe gestures for mobile tab switching */
  enableSwipe?: boolean;
};

/**
 * TabsList - Bold Contemporary Pop Art Adventure
 * Features bold underlines, enclosed panel style, keyboard navigation, and touch swipe gestures
 * 
 * Keyboard Navigation:
 * - Arrow Left/Right: Navigate between tabs
 * - Home: Go to first tab
 * - End: Go to last tab
 * 
 * Touch Gestures:
 * - Swipe left: Next tab
 * - Swipe right: Previous tab
 */
export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  function TabsList({ variant = "line", inverted = false, className, children, onTabChange, enableSwipe = true, ...props }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Touch gesture state
    const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
    
    // Handle touch start
    const handleTouchStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
      const touch = event.touches[0];
      setTouchStart({
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      });
    }, []);
    
    // Handle touch end - detect swipe
    const handleTouchEnd = useCallback((event: TouchEvent<HTMLDivElement>) => {
      if (!touchStart || !enableSwipe || !onTabChange) {
        setTouchStart(null);
        return;
      }
      
      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const deltaTime = Date.now() - touchStart.time;
      
      // Calculate velocity
      const velocity = Math.abs(deltaX) / deltaTime;
      
      // Check if horizontal swipe (more horizontal than vertical)
      const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
      
      // Check if swipe meets threshold
      const isValidSwipe = isHorizontalSwipe && 
        (Math.abs(deltaX) > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD);
      
      if (isValidSwipe) {
        const container = containerRef.current;
        if (!container) {
          setTouchStart(null);
          return;
        }
        
        const tabs = Array.from(container.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
        const activeTab = tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true');
        
        if (activeTab !== -1) {
          let newIndex = activeTab;
          
          if (deltaX < 0) {
            // Swipe left - next tab
            newIndex = activeTab < tabs.length - 1 ? activeTab + 1 : 0;
          } else {
            // Swipe right - previous tab
            newIndex = activeTab > 0 ? activeTab - 1 : tabs.length - 1;
          }
          
          onTabChange(newIndex);
        }
      }
      
      setTouchStart(null);
    }, [touchStart, enableSwipe, onTabChange]);
    
    // Handle keyboard navigation
    const handleKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      if (!container) return;
      
      const tabs = Array.from(container.querySelectorAll('[role="tab"]')) as HTMLButtonElement[];
      const currentIndex = tabs.findIndex(tab => tab === document.activeElement);
      
      if (currentIndex === -1) return;
      
      let newIndex = currentIndex;
      
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
          break;
        case 'ArrowRight':
          event.preventDefault();
          newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'Home':
          event.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          newIndex = tabs.length - 1;
          break;
        default:
          return;
      }
      
      // Focus the new tab
      tabs[newIndex]?.focus();
      
      // Optionally activate the tab
      if (onTabChange) {
        onTabChange(newIndex);
      }
    }, [onTabChange]);
    
    return (
      <div
        ref={(node) => {
          // Handle both refs
          (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        role="tablist"
        onKeyDown={handleKeyDown}
        onTouchStart={enableSwipe ? handleTouchStart : undefined}
        onTouchEnd={enableSwipe ? handleTouchEnd : undefined}
        className={clsx(
          "flex gap-1 touch-pan-y",
          variant === "line" && (inverted ? "border-b-2 border-grey-700" : "border-b-2 border-grey-200"),
          variant === "enclosed" && (inverted ? "border-2 border-grey-600 rounded-[var(--radius-card)]" : "border-2 border-black rounded-[var(--radius-card)]"),
          variant === "pop" && (inverted ? "border-2 border-white rounded-[var(--radius-card)] shadow-[4px_4px_0_hsl(var(--primary))]" : "border-2 border-black rounded-[var(--radius-card)] shadow-[4px_4px_0_hsl(var(--primary))]"),
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

export type TabProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  variant?: TabsVariant;
  inverted?: boolean;
};

/**
 * Tab - Bold Contemporary Pop Art Adventure
 * Features bold indicators and bounce transitions
 */
export const Tab = forwardRef<HTMLButtonElement, TabProps>(
  function Tab({ active, variant = "line", inverted = false, className, children, ...props }, ref) {
    const getLineClasses = () => {
      if (inverted) {
        return active
          ? "border-b-2 border-white text-white -mb-0.5"
          : "text-grey-400 hover:text-white border-b-2 border-transparent -mb-0.5";
      }
      return active
        ? "border-b-2 border-black text-black -mb-0.5"
        : "text-grey-500 hover:text-black border-b-2 border-transparent -mb-0.5";
    };

    const getEnclosedClasses = () => {
      if (inverted) {
        return clsx(
          active
            ? "bg-white text-black"
            : "bg-transparent text-grey-300 hover:bg-grey-800 hover:text-white",
          "border-r-2 border-grey-600 last:border-r-0"
        );
      }
      return clsx(
        active
          ? "bg-black text-white"
          : "bg-white text-black hover:bg-grey-100",
        "border-r-2 border-black last:border-r-0"
      );
    };

    const getPopClasses = () => {
      if (inverted) {
        return clsx(
          active
            ? "bg-white text-black"
            : "bg-transparent text-grey-300 hover:bg-grey-800 hover:text-white",
          "first:rounded-l-[calc(var(--radius-card)-2px)] last:rounded-r-[calc(var(--radius-card)-2px)]"
        );
      }
      return clsx(
        active
          ? "bg-black text-white"
          : "bg-white text-black hover:bg-grey-100",
        "first:rounded-l-[calc(var(--radius-card)-2px)] last:rounded-r-[calc(var(--radius-card)-2px)]"
      );
    };

    return (
      <button
        ref={ref}
        role="tab"
        aria-selected={active}
        className={clsx(
          "px-4 py-2 font-heading uppercase text-xs tracking-wider font-bold leading-none",
          "transition-all duration-100 ease-[var(--ease-bounce)]",
          "focus:outline-none focus:ring-2 focus:ring-offset-2",
          inverted ? "focus:ring-white focus:ring-offset-ink-950" : "focus:ring-black focus:ring-offset-white",
          variant === "line" && getLineClasses(),
          variant === "enclosed" && getEnclosedClasses(),
          variant === "pop" && getPopClasses(),
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

export type TabPanelProps = HTMLAttributes<HTMLDivElement> & {
  active?: boolean;
  inverted?: boolean;
};

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(
  function TabPanel({ active, inverted = false, className, children, ...props }, ref) {
    if (!active) return null;

    return (
      <div
        ref={ref}
        role="tabpanel"
        className={clsx(
          "py-4 animate-fade-in",
          inverted ? "text-grey-200" : "text-grey-800",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
