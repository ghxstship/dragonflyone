"use client";

import { forwardRef, useCallback, useRef, useState, createContext, useContext } from "react";
import { 
  tabsVariants,
  tabsListVariants,
  tabsTriggerVariants,
  tabsContentVariants,
  tabsPanelVariants 
} from "./Tabs.variants.js";
import type { 
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
  TabsPanelProps,
  TabsVariant 
} from "./Tabs.types.js";

// Swipe gesture constants
const SWIPE_THRESHOLD = 50; // Minimum distance for a swipe
const SWIPE_VELOCITY_THRESHOLD = 0.3; // Minimum velocity for a swipe

/**
 * Tabs context
 */
const TabsContext = createContext<{
  activeTab: string;
  setActiveTab: (value: string) => void;
  variant: TabsVariant;
}>({
  activeTab: "",
  setActiveTab: () => {},
  variant: "line",
});

/**
 * Hook to use tabs context
 */
export const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("useTabsContext must be used within a Tabs component");
  }
  return context;
};

/**
 * Tabs component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Bold borders and shadows
 * - Clear visual hierarchy
 * - Tabs with various styling variants
 * - CVA-based variants for consistent theming
 * 
 * @example
 * ```tsx
 * <Tabs variant="enclosed" inverted={false}>
 *   <TabsList>
 *     <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *     <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 *   </TabsList>
 *   <TabsContent>
 *     <TabsPanel value="tab1">Content 1</TabsPanel>
 *     <TabsPanel value="tab2">Content 2</TabsPanel>
 *   </TabsContent>
 * </Tabs>
 * ```
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  function Tabs({ 
    variant = "line" as TabsVariant, 
    className, 
    children, 
    ...props 
  }, ref) {
    const [activeTab, setActiveTab] = useState<string>("");
    
    return (
      <TabsContext.Provider value={{ activeTab, setActiveTab, variant }}>
        <div 
          ref={ref} 
          className={tabsVariants({ className })} 
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);

Tabs.displayName = "Tabs";

/**
 * TabsList component
 */
export const TabsList = forwardRef<HTMLDivElement, TabsListProps>(
  function TabsList({ 
    variant, 
    onTabChange, 
    enableSwipe = false,
    className, 
    children, 
    ...restProps 
  }, _ref) {
    const { activeTab, setActiveTab, variant: contextVariant } = useTabsContext();
    const currentVariant = variant || contextVariant;
    
    const swipeRef = useRef<HTMLDivElement>(null);
    const touchStartRef = useRef<{ x: number; y: number; time: number }>({ x: 0, y: 0, time: 0 });
    
    // Handle tab change
    const handleTabChange = useCallback((value: string) => {
      setActiveTab(value);
      onTabChange?.(0); // TODO: Pass actual index
    }, [setActiveTab, onTabChange]);
    
    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      const triggers = Array.from(
        swipeRef.current?.querySelectorAll('[role="tab"]') || []
      );
      const currentIndex = triggers.findIndex(
        trigger => trigger.getAttribute('data-value') === activeTab
      );
      
      let newIndex = currentIndex;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : triggers.length - 1;
          break;
        case 'ArrowRight':
          e.preventDefault();
          newIndex = currentIndex < triggers.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          newIndex = triggers.length - 1;
          break;
        default:
          return;
      }
      
      const newTrigger = triggers[newIndex];
      if (newTrigger) {
        const value = newTrigger.getAttribute('data-value');
        if (value) {
          handleTabChange(value);
        }
      }
    }, [activeTab, handleTabChange]);
    
    // Handle touch swipe gestures
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      if (!enableSwipe) return;
      
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    }, [enableSwipe]);
    
    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
      if (!enableSwipe) return;
      
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaTime = Date.now() - touchStartRef.current.time;
      const velocity = Math.abs(deltaX) / deltaTime;
      
      if (
        Math.abs(deltaX) > SWIPE_THRESHOLD &&
        velocity > SWIPE_VELOCITY_THRESHOLD
      ) {
        const triggers = Array.from(
          swipeRef.current?.querySelectorAll('[role="tab"]') || []
        );
        const currentIndex = triggers.findIndex(
          trigger => trigger.getAttribute('data-value') === activeTab
        );
        
        let newIndex = currentIndex;
        if (deltaX > 0) {
          // Swipe right - previous tab
          newIndex = currentIndex > 0 ? currentIndex - 1 : triggers.length - 1;
        } else {
          // Swipe left - next tab
          newIndex = currentIndex < triggers.length - 1 ? currentIndex + 1 : 0;
        }
        
        const newTrigger = triggers[newIndex];
        if (newTrigger) {
          const value = newTrigger.getAttribute('data-value');
          if (value) {
            handleTabChange(value);
          }
        }
      }
    }, [enableSwipe, activeTab, handleTabChange, touchStartRef]);
    
    return (
      <div
        ref={swipeRef}
        className={tabsListVariants({ variant: currentVariant, className })}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="tablist"
        {...restProps}
      >
        {children}
      </div>
    );
  }
);

TabsList.displayName = "TabsList";

/**
 * TabsTrigger component
 */
export const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  function TabsTrigger({ 
    value, 
    disabled = false, 
    className, 
    children, 
    ...props 
  }, ref) {
    const { activeTab, setActiveTab, variant } = useTabsContext();
    const isActive = activeTab === value;
    
    const handleClick = () => {
      if (!disabled) {
        setActiveTab(value);
      }
    };
    
    return (
      <button
        ref={ref}
        className={tabsTriggerVariants({ 
          variant, 
          active: isActive, 
          disabled, 
          className 
        })}
        onClick={handleClick}
        disabled={disabled}
        role="tab"
        data-value={value}
        aria-selected={isActive}
        aria-controls={`panel-${value}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TabsTrigger.displayName = "TabsTrigger";

/**
 * TabsContent component
 */
export const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  function TabsContent({ 
    className, 
    children, 
    ...props 
  }, ref) {
    return (
      <div 
        ref={ref}
        className={tabsContentVariants({ className })}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabsContent.displayName = "TabsContent";

/**
 * TabsPanel component
 */
export const TabsPanel = forwardRef<HTMLDivElement, TabsPanelProps>(
  function TabsPanel({ 
    value, 
    className, 
    children, 
    ...props 
  }, ref) {
    const { activeTab } = useTabsContext();
    const isActive = activeTab === value;
    
    if (!isActive) return null;
    
    return (
      <div
        ref={ref}
        className={tabsPanelVariants({ className })}
        role="tabpanel"
        id={`panel-${value}`}
        aria-labelledby={`tab-${value}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabsPanel.displayName = "TabsPanel";
