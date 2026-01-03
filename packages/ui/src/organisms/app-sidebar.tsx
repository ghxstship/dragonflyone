"use client";

import { forwardRef, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import clsx from "clsx";
import type { HTMLAttributes } from "react";
import {
  LayoutDashboard,
  Briefcase,
  Target,
  Crosshair,
  Users,
  GitBranch,
  Handshake,
  Contact,
  Star,
  FileQuestion,
  FileSearch,
  Link,
  CheckSquare,
  Calendar,
  Mail,
  Link2,
  Network,
  FolderKanban,
  FileText,
  GitCompare,
  ArrowUpRight,
  FastForward,
  DollarSign,
  Receipt,
  PieChart,
  Wallet,
  Calculator,
  TrendingUp,
  RefreshCw,
  ArrowDownRight,
  CreditCard,
  Percent,
  Package,
  Building,
  FileArchive,
  GraduationCap,
  MapPin,
  Wrench,
  BarChart,
  Key,
  Settings,
  Archive,
  QrCode,
  Hash,
  Zap,
  Activity,
  Clock,
  AlertTriangle,
  ShoppingCart,
  Grid,
  UserCheck,
  ClipboardCheck,
  AlertCircle,
  Truck,
  UserPlus,
  ShieldCheck,
  Scale,
  Shield,
  Book,
  BarChart3,
  FileBarChart,
  LayoutGrid,
  Database,
  CheckCircle,
  Landmark,
  Building2,
  Plug,
  Palette,
  Plus,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Search,
  Menu,
  Home,
  Inbox,
  // COMPVSS icons
  CalendarCheck,
  Award,
  Plane,
  Heart,
  Clapperboard,
  ListOrdered,
  Monitor,
  Hammer,
  Phone,
  Copy,
  PenTool,
  Play,
  Volume2,
  ClipboardList,
  Camera,
  Music,
  PackageCheck,
  UtensilsCrossed,
  FileCheck,
  Cloud,
  FileWarning,
  Siren,
  CloudRain,
  LifeBuoy,
  MessageSquare,
  Radio,
  Crown,
  BookOpen,
  Library,
  Lightbulb,
  HelpCircle,
  FileSpreadsheet,
  Smartphone,
  Gavel,
  WifiOff,
  Share2,
  type LucideIcon,
} from "lucide-react";

// =============================================================================
// TYPES - ClickUp-style navigation structure
// =============================================================================

export type NavBadgeVariant = 'count' | 'dot' | 'new' | 'alert';

export interface NavBadge {
  value?: string | number;
  variant: NavBadgeVariant;
  tooltip?: string;
}

export type SidebarNavItem = {
  /** Unique identifier */
  id?: string;
  label: string;
  href: string;
  icon?: string;
  /** Badge can be a simple string/number or structured NavBadge */
  badge?: string | number | NavBadge;
  primary?: boolean;
  /** Roles allowed to see this item (empty = all roles) */
  allowedRoles?: string[];
  /** Can this item be pinned to favorites */
  pinnable?: boolean;
  /** Is this item currently pinned */
  pinned?: boolean;
  /** Keyboard shortcut hint */
  shortcut?: string;
  /** Is this item disabled */
  disabled?: boolean;
  /** Tooltip when disabled */
  disabledReason?: string;
};

export type SidebarNavSubsection = {
  id?: string;
  label: string;
  items: SidebarNavItem[];
  /** Roles allowed to see this subsection */
  allowedRoles?: string[];
  /** Default collapsed state */
  defaultCollapsed?: boolean;
};

export type SidebarNavSection = {
  id?: string;
  section: string;
  icon?: string;
  items: SidebarNavItem[];
  subsections?: SidebarNavSubsection[];
  /** Roles allowed to see this section (empty = all roles) */
  allowedRoles?: string[];
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Section-level badge */
  badge?: string | number | NavBadge;
};

export type AppSidebarProps = HTMLAttributes<HTMLElement> & {
  /** Navigation sections with items and optional subsections */
  sections: SidebarNavSection[];
  /** Current active path for highlighting */
  currentPath?: string;
  /** Logo element for the header */
  logo?: ReactNode;
  /** Workspace/org selector element */
  workspaceSelector?: ReactNode;
  /** Footer content (user menu, settings, etc.) */
  footer?: ReactNode;
  /** Search component */
  search?: ReactNode;
  /** Quick action buttons */
  quickActions?: Array<{ label: string; href: string; icon?: string; shortcut?: string }>;
  /** Favorites section items */
  favorites?: SidebarNavItem[];
  /** Spaces/projects section (ClickUp-style) */
  spaces?: Array<{ id: string; name: string; color?: string; href: string }>;
  /** Recent pages section (last 5 visited) */
  recentPages?: SidebarNavItem[];
  /** Dark mode (inverted colors) */
  inverted?: boolean;
  /** Navigation callback */
  onNavigate?: (href: string) => void;
  /** Collapsed state (controlled) */
  collapsed?: boolean;
  /** Collapse callback */
  onCollapse?: (collapsed: boolean) => void;
  /** User roles for filtering navigation items */
  userRoles?: string[];
  /** Storage key prefix for persisting state */
  storageKey?: string;
  /** Context indicator for collapsed state (shows current project/workspace) */
  contextIndicator?: { name: string; color?: string };
  /** Enable inline navigation search */
  enableSearch?: boolean;
  /** Callback when pinning/unpinning an item */
  onPinItem?: (itemId: string, pinned: boolean) => void;
  /** Enable keyboard navigation (arrow keys) */
  enableKeyboardNav?: boolean;
  /** Show expand/collapse all button */
  showExpandCollapseAll?: boolean;
};

// =============================================================================
// ICON MAP - Lucide icon integration
// =============================================================================

const iconMap: Record<string, LucideIcon> = {
  // ATLVS icons
  LayoutDashboard,
  Briefcase,
  Target,
  Crosshair,
  Users,
  GitBranch,
  Handshake,
  Contact,
  Star,
  FileQuestion,
  FileSearch,
  Link,
  CheckSquare,
  Calendar,
  Mail,
  Link2,
  Network,
  FolderKanban,
  FileText,
  GitCompare,
  ArrowUpRight,
  FastForward,
  DollarSign,
  Receipt,
  PieChart,
  Wallet,
  Calculator,
  TrendingUp,
  RefreshCw,
  ArrowDownRight,
  CreditCard,
  Percent,
  Package,
  Building,
  FileArchive,
  GraduationCap,
  MapPin,
  Wrench,
  BarChart,
  Key,
  Settings,
  Archive,
  QrCode,
  Hash,
  Zap,
  Activity,
  Clock,
  AlertTriangle,
  ShoppingCart,
  Grid,
  UserCheck,
  ClipboardCheck,
  AlertCircle,
  Truck,
  UserPlus,
  ShieldCheck,
  Scale,
  Shield,
  Book,
  BarChart3,
  FileBarChart,
  LayoutGrid,
  Database,
  CheckCircle,
  Landmark,
  Building2,
  Plug,
  Palette,
  Plus,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Search,
  Menu,
  Home,
  Inbox,
  // COMPVSS icons
  CalendarCheck,
  Award,
  Plane,
  Heart,
  Clapperboard,
  ListOrdered,
  Monitor,
  Hammer,
  Phone,
  Copy,
  PenTool,
  Play,
  Volume2,
  ClipboardList,
  Camera,
  Music,
  PackageCheck,
  UtensilsCrossed,
  FileCheck,
  Cloud,
  FileWarning,
  Siren,
  CloudRain,
  LifeBuoy,
  MessageSquare,
  Radio,
  Crown,
  BookOpen,
  Library,
  Lightbulb,
  HelpCircle,
  FileSpreadsheet,
  Smartphone,
  Gavel,
  WifiOff,
  Share2,
};

function SidebarIcon({ 
  name, 
  className,
  size = 18
}: { 
  name: string; 
  className?: string;
  size?: number;
}) {
  const IconComponent = iconMap[name];
  
  if (IconComponent) {
    return <IconComponent size={size} className={className} />;
  }
  
  // Fallback for unknown icons
  return (
    <span 
      className={clsx("flex items-center justify-center text-[10px] font-bold uppercase", className)}
      style={{ width: size, height: size }}
    >
      {name.substring(0, 2)}
    </span>
  );
}

// Badge rendering helper
function SidebarBadge({
  badge,
  inverted = true,
}: {
  badge: string | number | NavBadge;
  inverted?: boolean;
}) {
  // Handle structured NavBadge
  if (typeof badge === 'object' && badge !== null) {
    const { value, variant, tooltip } = badge;
    
    // Dot variant - just a colored dot
    if (variant === 'dot') {
      return (
        <span
          className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0"
          title={tooltip}
        />
      );
    }
    
    // Alert variant - red background
    if (variant === 'alert') {
      return (
        <span
          className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-error-500 text-white flex-shrink-0"
          title={tooltip}
        >
          {value}
        </span>
      );
    }
    
    // New variant - accent color
    if (variant === 'new') {
      return (
        <span
          className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-accent-500 text-text-primary flex-shrink-0"
          title={tooltip}
        >
          NEW
        </span>
      );
    }
    
    // Count variant (default)
    return (
      <span
        className={clsx(
          "px-1.5 py-0.5 text-[10px] font-mono rounded flex-shrink-0",
          inverted ? "bg-surface-elevated text-text-secondary" : "bg-muted text-text-secondary"
        )}
        title={tooltip}
      >
        {value}
      </span>
    );
  }
  
  // Simple string/number badge
  return (
    <span
      className={clsx(
        "px-1.5 py-0.5 text-[10px] font-mono rounded flex-shrink-0",
        inverted ? "bg-surface-elevated text-text-secondary" : "bg-muted text-text-secondary"
      )}
    >
      {badge}
    </span>
  );
}

// =============================================================================
// APP SIDEBAR COMPONENT - ClickUp-style
// =============================================================================

export const AppSidebar = forwardRef<HTMLElement, AppSidebarProps>(
  function AppSidebar(
    {
      sections,
      currentPath = "",
      logo,
      workspaceSelector,
      footer,
      search,
      quickActions,
      favorites,
      spaces,
      recentPages,
      inverted = true,
      onNavigate,
      collapsed: controlledCollapsed,
      onCollapse,
      userRoles = [],
      storageKey = "ghxstship-sidebar",
      contextIndicator,
      enableSearch = false,
      onPinItem,
      enableKeyboardNav = true,
      showExpandCollapseAll = false,
      className,
      ...props
    },
    ref
  ) {
    const [internalCollapsed, setInternalCollapsed] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [hoveredSection, setHoveredSection] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const sidebarRef = useRef<HTMLElement>(null);

    // Support both controlled and uncontrolled collapse
    const collapsed = controlledCollapsed ?? internalCollapsed;
    const setCollapsed = onCollapse ?? setInternalCollapsed;

    // Load collapsed state from localStorage on mount
    useEffect(() => {
      if (typeof window !== "undefined" && controlledCollapsed === undefined) {
        const stored = localStorage.getItem(`${storageKey}-collapsed`);
        if (stored !== null) {
          setInternalCollapsed(stored === "true");
        }
      }
    }, [storageKey, controlledCollapsed]);

    // Load expanded sections from localStorage on mount
    useEffect(() => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem(`${storageKey}-expanded`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              setExpandedSections(new Set(parsed));
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    }, [storageKey]);

    // Persist collapsed state to localStorage
    useEffect(() => {
      if (typeof window !== "undefined" && controlledCollapsed === undefined) {
        localStorage.setItem(`${storageKey}-collapsed`, String(internalCollapsed));
      }
    }, [internalCollapsed, storageKey, controlledCollapsed]);

    // Persist expanded sections to localStorage
    useEffect(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem(`${storageKey}-expanded`, JSON.stringify([...expandedSections]));
      }
    }, [expandedSections, storageKey]);

    // Filter sections and items based on user roles
    const filterByRoles = useCallback((items: SidebarNavItem[]): SidebarNavItem[] => {
      if (userRoles.length === 0) return items;
      return items.filter(item => {
        if (!item.allowedRoles || item.allowedRoles.length === 0) return true;
        return item.allowedRoles.some(role => userRoles.includes(role));
      });
    }, [userRoles]);

    const filteredSections = sections
      .filter(section => {
        if (!section.allowedRoles || section.allowedRoles.length === 0) return true;
        if (userRoles.length === 0) return true;
        return section.allowedRoles.some(role => userRoles.includes(role));
      })
      .map(section => ({
        ...section,
        items: filterByRoles(section.items),
        subsections: section.subsections?.map(sub => ({
          ...sub,
          items: filterByRoles(sub.items),
        })).filter(sub => sub.items.length > 0),
      }))
      .filter(section => section.items.length > 0 || (section.subsections && section.subsections.length > 0));

    // Auto-expand section containing current path
    useEffect(() => {
      filteredSections.forEach((section) => {
        const hasActiveItem = section.items.some(
          (item) => currentPath === item.href || currentPath.startsWith(item.href + "/")
        );
        const hasActiveSubsection = section.subsections?.some((sub) =>
          sub.items.some(
            (item) => currentPath === item.href || currentPath.startsWith(item.href + "/")
          )
        );
        if (hasActiveItem || hasActiveSubsection) {
          setExpandedSections((prev) => new Set([...prev, section.section]));
        }
      });
    }, [currentPath, filteredSections]);

    const toggleSection = useCallback((sectionName: string) => {
      setExpandedSections((prev) => {
        const next = new Set(prev);
        if (next.has(sectionName)) {
          next.delete(sectionName);
        } else {
          next.add(sectionName);
        }
        return next;
      });
    }, []);

    // Expand all sections
    const expandAll = useCallback(() => {
      const allSectionNames = filteredSections.map(s => s.section);
      setExpandedSections(new Set(allSectionNames));
    }, [filteredSections]);

    // Collapse all sections
    const collapseAll = useCallback(() => {
      setExpandedSections(new Set());
    }, []);

    // Get all navigable items flattened for keyboard navigation
    const allNavigableItems = useCallback(() => {
      const items: SidebarNavItem[] = [];
      for (const section of filteredSections) {
        if (expandedSections.has(section.section)) {
          items.push(...section.items);
          if (section.subsections) {
            for (const sub of section.subsections) {
              items.push(...sub.items);
            }
          }
        }
      }
      return items.filter(item => !item.disabled);
    }, [filteredSections, expandedSections]);

    // Filter items by search query
    const searchFilteredSections = useCallback(() => {
      if (!searchQuery.trim()) return filteredSections;
      
      const query = searchQuery.toLowerCase();
      return filteredSections
        .map(section => ({
          ...section,
          items: section.items.filter(item => 
            item.label.toLowerCase().includes(query)
          ),
          subsections: section.subsections?.map(sub => ({
            ...sub,
            items: sub.items.filter(item =>
              item.label.toLowerCase().includes(query)
            ),
          })).filter(sub => sub.items.length > 0),
        }))
        .filter(section => section.items.length > 0 || (section.subsections && section.subsections.length > 0));
    }, [filteredSections, searchQuery]);

    // Keyboard navigation handler
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (!enableKeyboardNav) return;
      
      const items = allNavigableItems();
      if (items.length === 0) return;
      
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => (prev >= items.length - 1 ? 0 : prev + 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => (prev <= 0 ? items.length - 1 : prev - 1));
          break;
        case 'Enter':
          if (focusedIndex >= 0 && focusedIndex < items.length) {
            e.preventDefault();
            const item = items[focusedIndex];
            if (item && onNavigate) {
              onNavigate(item.href);
            }
          }
          break;
        case 'Escape':
          e.preventDefault();
          setSearchQuery("");
          setFocusedIndex(-1);
          break;
      }
    }, [enableKeyboardNav, allNavigableItems, focusedIndex, onNavigate]);

    // Handle pin/unpin
    const handlePinItem = useCallback((itemId: string, currentlyPinned: boolean) => {
      if (onPinItem) {
        onPinItem(itemId, !currentlyPinned);
      }
    }, [onPinItem]);

    const handleNavigate = useCallback(
      (href: string, e: React.MouseEvent) => {
        if (onNavigate) {
          e.preventDefault();
          onNavigate(href);
        }
      },
      [onNavigate]
    );

    const isItemActive = (href: string) =>
      currentPath === href || currentPath.startsWith(href + "/");
    
    // Get sections to render (search filtered or all)
    const sectionsToRender = enableSearch ? searchFilteredSections() : filteredSections;

    // Render a single nav item
    const renderNavItem = (item: SidebarNavItem, indent = false) => {
      const active = isItemActive(item.href);
      const itemId = item.id || item.href;
      
      return (
        <div
          key={item.href}
          className="group relative"
        >
          <a
            href={item.href}
            onClick={(e) => handleNavigate(item.href, e)}
            className={clsx(
              "flex items-center gap-3 py-1.5 text-sm rounded transition-all duration-100",
              indent ? "pl-9 pr-3" : "px-3",
              collapsed && "justify-center px-2",
              active
                ? inverted
                  ? "bg-primary-500 text-white font-medium"
                  : "bg-primary-500 text-white font-medium"
                : inverted
                  ? "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
                  : "text-text-secondary hover:bg-muted hover:text-text-primary",
              item.primary && !active && "font-medium",
              item.disabled && "opacity-50 pointer-events-none"
            )}
            title={collapsed ? item.label : (item.disabled ? item.disabledReason : undefined)}
            aria-disabled={item.disabled}
          >
            {item.icon && (
              <SidebarIcon 
                name={item.icon} 
                className={clsx(
                  "flex-shrink-0",
                  active ? "text-white" : inverted ? "text-text-muted" : "text-text-muted"
                )} 
              />
            )}
            {!collapsed && (
              <>
                <span className="flex-1 truncate">{item.label}</span>
                {item.shortcut && (
                  <kbd className={clsx(
                    "hidden lg:inline-flex text-[10px] font-mono px-1 rounded",
                    inverted ? "bg-surface-elevated text-text-disabled" : "bg-muted text-text-disabled"
                  )}>
                    {item.shortcut}
                  </kbd>
                )}
                {item.badge && (
                  <SidebarBadge badge={item.badge} inverted={inverted} />
                )}
              </>
            )}
          </a>
          {/* Pin button - shows on hover when item is pinnable */}
          {item.pinnable && !collapsed && onPinItem && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePinItem(itemId, !!item.pinned);
              }}
              className={clsx(
                "absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity",
                item.pinned
                  ? inverted
                    ? "text-accent-500 hover:bg-surface-elevated"
                    : "text-accent-500 hover:bg-muted"
                  : inverted
                    ? "text-text-disabled hover:text-accent-500 hover:bg-surface-elevated"
                    : "text-text-disabled hover:text-accent-500 hover:bg-muted"
              )}
              title={item.pinned ? "Unpin from favorites" : "Pin to favorites"}
              aria-label={item.pinned ? "Unpin from favorites" : "Pin to favorites"}
            >
              <SidebarIcon name="Star" size={14} />
            </button>
          )}
        </div>
      );
    };

    // Render a section with collapsible subsections
    const renderSection = (section: SidebarNavSection) => {
      const isExpanded = expandedSections.has(section.section);
      const hasSubsections = section.subsections && section.subsections.length > 0;
      const isHovered = hoveredSection === section.section;

      return (
        <div 
          key={section.section} 
          className="mb-1"
          onMouseEnter={() => setHoveredSection(section.section)}
          onMouseLeave={() => setHoveredSection(null)}
        >
          {/* Section Header */}
          <button
            type="button"
            onClick={() => toggleSection(section.section)}
            className={clsx(
              "w-full flex items-center gap-2 px-3 py-1.5 text-[11px] uppercase tracking-wider font-semibold transition-colors rounded",
              collapsed && "justify-center px-2",
              isHovered && (inverted ? "bg-surface-elevated/30" : "bg-muted/30"),
              inverted
                ? "text-text-disabled hover:text-text-secondary hover:bg-surface-elevated/50"
                : "text-text-disabled hover:text-text-secondary hover:bg-muted/50"
            )}
          >
            {section.icon && (
              <SidebarIcon 
                name={section.icon} 
                size={14}
                className={inverted ? "text-text-disabled" : "text-text-disabled"} 
              />
            )}
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{section.section}</span>
                <SidebarIcon
                  name={isExpanded ? "ChevronDown" : "ChevronRight"}
                  size={12}
                  className={clsx(
                    "transition-transform",
                    inverted ? "text-text-disabled" : "text-text-disabled"
                  )}
                />
              </>
            )}
          </button>

          {/* Section Items */}
          {(isExpanded || collapsed) && (
            <div className={clsx("mt-0.5 space-y-0.5", collapsed && "mt-1")}>
              {section.items.map((item) => renderNavItem(item))}
            </div>
          )}

          {/* Subsections */}
          {hasSubsections && isExpanded && !collapsed && (
            <div className="mt-2 space-y-2">
              {section.subsections!.map((subsection) => (
                <div key={subsection.label}>
                  <div
                    className={clsx(
                      "px-3 py-1 text-[10px] uppercase tracking-wider font-medium",
                      inverted ? "text-text-disabled" : "text-text-disabled"
                    )}
                  >
                    {subsection.label}
                  </div>
                  <div className="space-y-0.5">
                    {subsection.items.map((item) => renderNavItem(item, true))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };

    // Combine refs for sidebar
    const combinedRef = useCallback(
      (node: HTMLElement | null) => {
        // Update internal ref
        (sidebarRef as React.MutableRefObject<HTMLElement | null>).current = node;
        // Forward ref
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLElement | null>).current = node;
        }
      },
      [ref]
    );

    return (
      <aside
        ref={combinedRef}
        className={clsx(
          "flex flex-col h-screen border-r-2 transition-all duration-200",
          collapsed ? "w-16" : "w-64",
          inverted
            ? "bg-surface-inverse border-border text-text-primary"
            : "bg-surface-primary border-border text-text-primary",
          className
        )}
        onKeyDown={handleKeyDown}
        tabIndex={enableKeyboardNav ? 0 : undefined}
        {...props}
      >
        {/* Header: Logo + Workspace Selector */}
        <div
          className={clsx(
            "flex items-center gap-2 h-14 px-3 border-b-2 flex-shrink-0",
            inverted ? "border-border" : "border-border"
          )}
        >
          {workspaceSelector || logo}
        </div>

        {/* Context Indicator (collapsed state) - shows current project/workspace */}
        {collapsed && contextIndicator && (
          <div
            className={clsx(
              "flex items-center justify-center py-2 border-b-2 flex-shrink-0",
              inverted ? "border-border" : "border-border"
            )}
            title={contextIndicator.name}
          >
            <div
              className={clsx(
                "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border-2",
                inverted ? "border-border" : "border-border"
              )}
              style={{ backgroundColor: contextIndicator.color || (inverted ? "#4f46e5" : "#6366f1") }}
            >
              <span className="text-white">
                {contextIndicator.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Search - custom or inline */}
        {search && !collapsed && (
          <div className={clsx("px-3 py-2 border-b-2 flex-shrink-0", inverted ? "border-border" : "border-border")}>
            {search}
          </div>
        )}
        
        {/* Inline Navigation Search */}
        {enableSearch && !search && !collapsed && (
          <div className={clsx("px-3 py-2 border-b-2 flex-shrink-0", inverted ? "border-border" : "border-border")}>
            <div className={clsx(
              "flex items-center gap-2 px-2 py-1.5 rounded border-2 transition-colors",
              inverted 
                ? "bg-surface-inverse border-border focus-within:border-border-primary" 
                : "bg-surface-primary border-border focus-within:border-border-primary"
            )}>
              <SidebarIcon name="Search" size={14} className={inverted ? "text-text-disabled" : "text-text-disabled"} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter navigation..."
                className={clsx(
                  "flex-1 bg-transparent text-sm outline-none placeholder:text-text-disabled",
                  inverted ? "text-text-primary" : "text-text-primary"
                )}
                aria-label="Filter navigation"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className={clsx(
                    "p-0.5 rounded transition-colors",
                    inverted ? "text-text-disabled hover:text-white" : "text-text-disabled hover:text-text-secondary"
                  )}
                  aria-label="Clear search"
                >
                  <SidebarIcon name="X" size={12} />
                </button>
              )}
            </div>
            {searchQuery && sectionsToRender.length === 0 && (
              <div className={clsx(
                "mt-2 text-xs text-center py-2",
                inverted ? "text-text-disabled" : "text-text-disabled"
              )}>
                No results for &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {quickActions && quickActions.length > 0 && !collapsed && (
          <div className={clsx("px-3 py-2 border-b-2 flex-shrink-0", inverted ? "border-border" : "border-border")}>
            <div className="flex flex-wrap gap-1">
              {quickActions.map((action) => (
                <a
                  key={action.href}
                  href={action.href}
                  onClick={(e) => handleNavigate(action.href, e)}
                  className={clsx(
                    "flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded transition-colors",
                    inverted
                      ? "bg-surface-elevated text-text-secondary hover:bg-surface-inverse hover:text-text-primary"
                      : "bg-muted text-text-secondary hover:bg-muted hover:text-text-primary"
                  )}
                  title={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}
                >
                  {action.icon && <SidebarIcon name={action.icon} size={14} />}
                  <span>{action.label}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Favorites Section */}
        {favorites && favorites.length > 0 && !collapsed && (
          <div className={clsx("px-2 py-2 border-b-2 flex-shrink-0", inverted ? "border-border" : "border-border")}>
            <div className={clsx("px-1 py-1 text-[11px] uppercase tracking-wider font-semibold", inverted ? "text-text-disabled" : "text-text-disabled")}>
              Favorites
            </div>
            <div className="space-y-0.5">
              {favorites.map((item) => renderNavItem(item))}
            </div>
          </div>
        )}

        {/* Spaces Section (ClickUp-style) */}
        {spaces && spaces.length > 0 && !collapsed && (
          <div className={clsx("px-2 py-2 border-b-2 flex-shrink-0", inverted ? "border-border" : "border-border")}>
            <div className="flex items-center justify-between px-1 py-1">
              <span className={clsx("text-[11px] uppercase tracking-wider font-semibold", inverted ? "text-text-disabled" : "text-text-disabled")}>
                Spaces
              </span>
              <button
                type="button"
                className={clsx(
                  "p-0.5 rounded transition-colors",
                  inverted ? "text-text-disabled hover:text-text-secondary hover:bg-surface-elevated" : "text-text-disabled hover:text-text-secondary hover:bg-muted"
                )}
              >
                <SidebarIcon name="Plus" size={14} />
              </button>
            </div>
            <div className="space-y-0.5">
              {spaces.map((space) => (
                <a
                  key={space.id}
                  href={space.href}
                  onClick={(e) => handleNavigate(space.href, e)}
                  className={clsx(
                    "flex items-center gap-2 px-2 py-1.5 text-sm rounded transition-colors",
                    isItemActive(space.href)
                      ? inverted
                        ? "bg-primary-500 text-white"
                        : "bg-primary-500 text-white"
                      : inverted
                        ? "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
                        : "text-text-secondary hover:bg-muted hover:text-text-primary"
                  )}
                >
                  <span
                    className="w-2 h-2 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: space.color || "var(--color-primary-500, #6366f1)" }}
                  />
                  <span className="truncate">{space.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Recent Pages Section */}
        {recentPages && recentPages.length > 0 && !collapsed && (
          <div className={clsx("px-2 py-2 border-b-2 flex-shrink-0", inverted ? "border-border" : "border-border")}>
            <div className={clsx("px-1 py-1 text-[11px] uppercase tracking-wider font-semibold", inverted ? "text-text-disabled" : "text-text-disabled")}>
              Recent
            </div>
            <div className="space-y-0.5">
              {recentPages.slice(0, 5).map((item) => renderNavItem(item))}
            </div>
          </div>
        )}

        {/* Expand/Collapse All */}
        {showExpandCollapseAll && !collapsed && (
          <div className={clsx("px-3 py-1 flex justify-end gap-1 border-b-2 flex-shrink-0", inverted ? "border-border" : "border-border")}>
            <button
              type="button"
              onClick={expandAll}
              className={clsx(
                "px-2 py-0.5 text-[10px] font-medium rounded transition-colors",
                inverted
                  ? "text-text-muted hover:text-text-primary hover:bg-surface-elevated"
                  : "text-text-muted hover:text-text-primary hover:bg-muted"
              )}
              title="Expand all sections"
            >
              Expand
            </button>
            <button
              type="button"
              onClick={collapseAll}
              className={clsx(
                "px-2 py-0.5 text-[10px] font-medium rounded transition-colors",
                inverted
                  ? "text-text-muted hover:text-text-primary hover:bg-surface-elevated"
                  : "text-text-muted hover:text-text-primary hover:bg-muted"
              )}
              title="Collapse all sections"
            >
              Collapse
            </button>
          </div>
        )}

        {/* Main Navigation */}
        <nav 
          className="flex-1 overflow-y-auto py-2 px-2 scrollbar-thin"
          role="navigation"
          aria-label="Main navigation"
        >
          {sectionsToRender.map(renderSection)}
        </nav>

        {/* Collapse Toggle */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className={clsx(
            "flex items-center justify-center h-10 border-t-2 transition-colors flex-shrink-0",
            inverted
              ? "border-border text-text-disabled hover:text-text-primary hover:bg-surface-elevated"
              : "border-border text-text-disabled hover:text-text-primary hover:bg-muted"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <SidebarIcon
            name={collapsed ? "ChevronsRight" : "ChevronsLeft"}
            size={18}
          />
        </button>

        {/* Footer */}
        {footer && (
          <div
            className={clsx(
              "px-3 py-3 border-t-2 flex-shrink-0",
              inverted ? "border-border" : "border-border"
            )}
          >
            {footer}
          </div>
        )}
      </aside>
    );
  }
);

// =============================================================================
// MOBILE SIDEBAR
// =============================================================================

export type MobileAppSidebarProps = AppSidebarProps & {
  open: boolean;
  onClose: () => void;
};

export const MobileAppSidebar = forwardRef<HTMLElement, MobileAppSidebarProps>(
  function MobileAppSidebar({ open, onClose, inverted = true, ...props }, ref) {
    // Prevent body scroll when open
    useEffect(() => {
      if (open) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return () => {
        document.body.style.overflow = "";
      };
    }, [open]);

    if (!open) return null;

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-sidebar-backdrop bg-black/60 animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 z-sidebar animate-slide-in-left">
          <div className="relative h-full">
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className={clsx(
                "absolute top-3 right-3 z-content-controls p-1.5 rounded transition-colors",
                inverted
                  ? "text-text-muted hover:text-text-primary hover:bg-surface-elevated"
                  : "text-text-muted hover:text-text-primary hover:bg-muted"
              )}
              aria-label="Close menu"
            >
              <SidebarIcon name="X" size={20} />
            </button>
            <AppSidebar ref={ref} inverted={inverted} {...props} />
          </div>
        </div>
      </>
    );
  }
);

export default AppSidebar;
