"use client";

import { forwardRef, useState, useCallback, useEffect, ReactNode } from "react";
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

export type SidebarNavItem = {
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  primary?: boolean;
};

export type SidebarNavSubsection = {
  label: string;
  items: SidebarNavItem[];
};

export type SidebarNavSection = {
  section: string;
  icon?: string;
  items: SidebarNavItem[];
  subsections?: SidebarNavSubsection[];
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
  /** Dark mode (inverted colors) */
  inverted?: boolean;
  /** Navigation callback */
  onNavigate?: (href: string) => void;
  /** Collapsed state (controlled) */
  collapsed?: boolean;
  /** Collapse callback */
  onCollapse?: (collapsed: boolean) => void;
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
      inverted = true,
      onNavigate,
      collapsed: controlledCollapsed,
      onCollapse,
      className,
      ...props
    },
    ref
  ) {
    const [internalCollapsed, setInternalCollapsed] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
    const [hoveredSection, setHoveredSection] = useState<string | null>(null);

    // Support both controlled and uncontrolled collapse
    const collapsed = controlledCollapsed ?? internalCollapsed;
    const setCollapsed = onCollapse ?? setInternalCollapsed;

    // Auto-expand section containing current path
    useEffect(() => {
      sections.forEach((section) => {
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
    }, [currentPath, sections]);

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

    // Render a single nav item
    const renderNavItem = (item: SidebarNavItem, indent = false) => {
      const active = isItemActive(item.href);
      return (
        <a
          key={item.href}
          href={item.href}
          onClick={(e) => handleNavigate(item.href, e)}
          className={clsx(
            "group flex items-center gap-3 py-1.5 text-sm rounded transition-all duration-100",
            indent ? "pl-9 pr-3" : "px-3",
            collapsed && "justify-center px-2",
            active
              ? inverted
                ? "bg-primary-500 text-white font-medium"
                : "bg-primary-500 text-white font-medium"
              : inverted
                ? "text-ink-300 hover:bg-ink-800 hover:text-white"
                : "text-ink-600 hover:bg-ink-100 hover:text-ink-900",
            item.primary && !active && "font-medium"
          )}
          title={collapsed ? item.label : undefined}
        >
          {item.icon && (
            <SidebarIcon 
              name={item.icon} 
              className={clsx(
                "flex-shrink-0",
                active ? "text-white" : inverted ? "text-ink-400" : "text-ink-500"
              )} 
            />
          )}
          {!collapsed && (
            <>
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span
                  className={clsx(
                    "px-1.5 py-0.5 text-[10px] font-mono rounded flex-shrink-0",
                    inverted ? "bg-ink-700 text-ink-300" : "bg-ink-200 text-ink-600"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </>
          )}
        </a>
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
              inverted
                ? "text-ink-500 hover:text-ink-300 hover:bg-ink-800/50"
                : "text-ink-400 hover:text-ink-600 hover:bg-ink-100/50"
            )}
          >
            {section.icon && (
              <SidebarIcon 
                name={section.icon} 
                size={14}
                className={inverted ? "text-ink-500" : "text-ink-400"} 
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
                    inverted ? "text-ink-600" : "text-ink-400"
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
                      inverted ? "text-ink-600" : "text-ink-400"
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

    return (
      <aside
        ref={ref}
        className={clsx(
          "flex flex-col h-screen border-r-2 transition-all duration-200",
          collapsed ? "w-16" : "w-64",
          inverted
            ? "bg-ink-950 border-ink-800 text-white"
            : "bg-white border-ink-200 text-ink-900",
          className
        )}
        {...props}
      >
        {/* Header: Logo + Workspace Selector */}
        <div
          className={clsx(
            "flex items-center gap-2 h-14 px-3 border-b-2 flex-shrink-0",
            inverted ? "border-ink-800" : "border-ink-200"
          )}
        >
          {workspaceSelector || logo}
        </div>

        {/* Search */}
        {search && !collapsed && (
          <div className={clsx("px-3 py-2 border-b-2 flex-shrink-0", inverted ? "border-ink-800" : "border-ink-200")}>
            {search}
          </div>
        )}

        {/* Quick Actions */}
        {quickActions && quickActions.length > 0 && !collapsed && (
          <div className={clsx("px-3 py-2 border-b-2 flex-shrink-0", inverted ? "border-ink-800" : "border-ink-200")}>
            <div className="flex flex-wrap gap-1">
              {quickActions.map((action) => (
                <a
                  key={action.href}
                  href={action.href}
                  onClick={(e) => handleNavigate(action.href, e)}
                  className={clsx(
                    "flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded transition-colors",
                    inverted
                      ? "bg-ink-800 text-ink-300 hover:bg-ink-700 hover:text-white"
                      : "bg-ink-100 text-ink-600 hover:bg-ink-200 hover:text-ink-900"
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
          <div className={clsx("px-2 py-2 border-b-2 flex-shrink-0", inverted ? "border-ink-800" : "border-ink-200")}>
            <div className={clsx("px-1 py-1 text-[11px] uppercase tracking-wider font-semibold", inverted ? "text-ink-500" : "text-ink-400")}>
              Favorites
            </div>
            <div className="space-y-0.5">
              {favorites.map((item) => renderNavItem(item))}
            </div>
          </div>
        )}

        {/* Spaces Section (ClickUp-style) */}
        {spaces && spaces.length > 0 && !collapsed && (
          <div className={clsx("px-2 py-2 border-b-2 flex-shrink-0", inverted ? "border-ink-800" : "border-ink-200")}>
            <div className="flex items-center justify-between px-1 py-1">
              <span className={clsx("text-[11px] uppercase tracking-wider font-semibold", inverted ? "text-ink-500" : "text-ink-400")}>
                Spaces
              </span>
              <button
                type="button"
                className={clsx(
                  "p-0.5 rounded transition-colors",
                  inverted ? "text-ink-500 hover:text-ink-300 hover:bg-ink-800" : "text-ink-400 hover:text-ink-600 hover:bg-ink-100"
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
                        ? "text-ink-300 hover:bg-ink-800 hover:text-white"
                        : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
                  )}
                >
                  <span
                    className="w-2 h-2 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: space.color || "#6366f1" }}
                  />
                  <span className="truncate">{space.name}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 scrollbar-thin">
          {sections.map(renderSection)}
        </nav>

        {/* Collapse Toggle */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className={clsx(
            "flex items-center justify-center h-10 border-t-2 transition-colors flex-shrink-0",
            inverted
              ? "border-ink-800 text-ink-500 hover:text-white hover:bg-ink-800"
              : "border-ink-200 text-ink-400 hover:text-ink-900 hover:bg-ink-100"
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
              inverted ? "border-ink-800" : "border-ink-200"
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
          className="fixed inset-0 z-40 bg-black/60 animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 animate-slide-in-left">
          <div className="relative h-full">
            {/* Close button */}
            <button
              type="button"
              onClick={onClose}
              className={clsx(
                "absolute top-3 right-3 z-10 p-1.5 rounded transition-colors",
                inverted
                  ? "text-ink-400 hover:text-white hover:bg-ink-800"
                  : "text-ink-500 hover:text-ink-900 hover:bg-ink-100"
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
