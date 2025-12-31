"use client";

import { forwardRef, useState, useEffect, useRef, ReactNode, useId } from "react";
import clsx from "clsx";
import {
  Search,
  Bell,
  Settings,
  ChevronDown,
  User,
  LogOut,
  Building2,
  Plus,
  Check,
  FolderKanban,
  Users,
  Briefcase,
  ArrowLeft,
  Menu,
  X,
  Moon,
  Sun,
  Monitor,
  Keyboard,
  LifeBuoy,
  Circle,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  CheckCheck,
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
} from "lucide-react";
import { Dropdown, DropdownItem } from "../molecules/dropdown.js";
import { Tooltip } from "../atoms/tooltip.js";

// =============================================================================
// APP NAVBAR - Authenticated Application Shell Navigation
// =============================================================================

/**
 * AppNavbar - Bold Contemporary Pop Art Adventure
 * 
 * Top navigation bar for authenticated application shell pages.
 * 
 * Features:
 * - Global search trigger with keyboard shortcut
 * - Contextual quick actions based on current path
 * - Enhanced notifications with categories and inline actions
 * - User menu with status, theme toggle, and shortcuts
 * - Help icon and settings access
 * - Breadcrumb context navigation
 * 
 * Use cases:
 * - Authenticated dashboard pages
 * - App shell layouts (ATLVS, COMPVSS, GVTEWAY)
 * - Any page using AuthenticatedShell template
 * 
 * For public/marketing pages, use PublicNavbar instead.
 */

// =============================================================================
// TYPES
// =============================================================================

export type UserStatus = "online" | "away" | "dnd" | "invisible";

export interface HeaderUser {
  name: string;
  email?: string;
  avatar?: string;
  status?: UserStatus;
  role?: string;
}

export interface BreadcrumbContextItem {
  id: string;
  name: string;
  type: "organization" | "project" | "team" | "workspace" | "production" | "event";
  href?: string;
}

export interface ContextOptions {
  organizations?: Array<{ id: string; name: string; current?: boolean }>;
  projects?: Array<{ id: string; name: string; status?: string; current?: boolean }>;
  productions?: Array<{ id: string; name: string; status?: string; current?: boolean }>;
  events?: Array<{ id: string; name: string; status?: string; current?: boolean }>;
  teams?: Array<{ id: string; name: string; current?: boolean }>;
  workspaces?: Array<{ id: string; name: string; current?: boolean }>;
}

export type NotificationType = "info" | "success" | "warning" | "error";
export type NotificationPriority = "low" | "normal" | "high" | "urgent";
export type NotificationCategory = "mentions" | "updates" | "alerts" | "all";

export interface HeaderNotification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  category: NotificationCategory;
  title: string;
  message?: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  timestamp: string;
  source?: string;
  groupId?: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  shortcut?: string;
  contextPaths?: string[];
}

export type ThemeMode = "light" | "dark" | "system";

export interface AppNavbarProps {
  /** User info */
  user?: HeaderUser;
  /** Breadcrumb context hierarchy */
  breadcrumbContext?: BreadcrumbContextItem[];
  /** Context options for dropdowns */
  contextOptions?: ContextOptions;
  /** Notifications */
  notifications?: HeaderNotification[];
  /** Quick actions based on current context */
  quickActions?: QuickAction[];
  /** Current path for contextual actions */
  currentPath?: string;
  /** Dashboard href for back button */
  dashboardHref?: string;
  /** Settings path */
  settingsPath?: string;
  /** Help path */
  helpPath?: string;
  /** Dark mode */
  inverted?: boolean;
  /** Current theme */
  theme?: ThemeMode;
  /** Callbacks */
  onNavigate?: (href: string) => void;
  onSearch?: () => void;
  onContextSwitch?: (type: BreadcrumbContextItem["type"], id: string) => void;
  onSignOut?: () => void;
  onStatusChange?: (status: UserStatus) => void;
  onThemeChange?: (theme: ThemeMode) => void;
  onNotificationClick?: (notification: HeaderNotification) => void;
  onNotificationMarkRead?: (id: string) => void;
  onNotificationMarkAllRead?: () => void;
  onNotificationDelete?: (id: string) => void;
  onNotificationSettings?: () => void;
  onMobileMenuOpen?: () => void;
  onKeyboardShortcuts?: () => void;
  /** Additional className */
  className?: string;
}

// =============================================================================
// STATUS ICONS & COLORS
// =============================================================================

const statusConfig: Record<UserStatus, { label: string; color: string; icon: ReactNode }> = {
  online: { label: "Online", color: "bg-success-500", icon: <Circle className="size-2 fill-current" /> },
  away: { label: "Away", color: "bg-warning-500", icon: <Clock className="size-3" /> },
  dnd: { label: "Do Not Disturb", color: "bg-error-500", icon: <EyeOff className="size-3" /> },
  invisible: { label: "Invisible", color: "bg-ink-500", icon: <Eye className="size-3" /> },
};

const notificationIcons: Record<NotificationType, ReactNode> = {
  info: <Info className="size-4" />,
  success: <CheckCircle className="size-4" />,
  warning: <AlertTriangle className="size-4" />,
  error: <AlertCircle className="size-4" />,
};

const notificationColors: Record<NotificationType, string> = {
  info: "bg-info-500",
  success: "bg-success-500",
  warning: "bg-warning-500",
  error: "bg-error-500",
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function groupNotifications(notifications: HeaderNotification[]): Map<string, HeaderNotification[]> {
  const groups = new Map<string, HeaderNotification[]>();
  
  for (const notification of notifications) {
    const key = notification.groupId || notification.id;
    const existing = groups.get(key) || [];
    existing.push(notification);
    groups.set(key, existing);
  }
  
  return groups;
}

// =============================================================================
// GLOBAL SEARCH TRIGGER
// =============================================================================

interface GlobalSearchTriggerProps {
  inverted?: boolean;
  onClick?: () => void;
}

function GlobalSearchTrigger({ inverted = true, onClick }: GlobalSearchTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "flex items-center gap-2 px-4 py-2 rounded-button border-2 transition-all duration-100",
        "min-w-[200px] md:min-w-[280px] lg:min-w-[360px]",
        inverted
          ? "bg-ink-900 border-ink-700 text-ink-400 hover:border-ink-600 hover:bg-ink-800"
          : "bg-white border-ink-200 text-ink-500 hover:border-ink-300 hover:bg-ink-50"
      )}
      aria-label="Open search (Cmd+K)"
    >
      <Search size={16} />
      <span className="flex-1 text-left text-sm">Search or jump to...</span>
      <kbd className={clsx(
        "hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono rounded border",
        inverted 
          ? "bg-ink-800 border-ink-700 text-ink-500" 
          : "bg-ink-100 border-ink-200 text-ink-400"
      )}>
        ⌘K
      </kbd>
    </button>
  );
}

// =============================================================================
// CONTEXTUAL QUICK ACTIONS
// =============================================================================

interface ContextualQuickActionsProps {
  actions: QuickAction[];
  currentPath: string;
  inverted?: boolean;
  onNavigate?: (href: string) => void;
}

function ContextualQuickActions({ actions, currentPath, inverted = true, onNavigate }: ContextualQuickActionsProps) {
  // Filter actions based on current path
  const contextualActions = actions.filter(action => {
    if (!action.contextPaths || action.contextPaths.length === 0) return true;
    return action.contextPaths.some(pattern => {
      if (pattern.endsWith("*")) {
        return currentPath.startsWith(pattern.slice(0, -1));
      }
      return currentPath === pattern;
    });
  }).slice(0, 3);

  if (contextualActions.length === 0) return null;

  return (
    <div className="hidden lg:flex items-center gap-1">
      {contextualActions.map((action) => (
        <Tooltip key={action.id} content={action.shortcut ? `${action.label} (${action.shortcut})` : action.label}>
          <button
            type="button"
            onClick={() => {
              if (action.onClick) {
                action.onClick();
              } else if (action.href && onNavigate) {
                onNavigate(action.href);
              }
            }}
            className={clsx(
              "flex items-center gap-1.5 px-2.5 py-1.5 rounded-button border-2 text-xs font-medium transition-all duration-100",
              inverted
                ? "border-ink-700 bg-ink-800 text-ink-300 hover:border-primary-500 hover:text-white hover:bg-ink-700"
                : "border-ink-200 bg-white text-ink-600 hover:border-primary-500 hover:text-primary-600"
            )}
          >
            {action.icon}
            <span className="hidden xl:inline">{action.label}</span>
          </button>
        </Tooltip>
      ))}
    </div>
  );
}

// =============================================================================
// ENHANCED NOTIFICATIONS PANEL
// =============================================================================

interface EnhancedNotificationsPanelProps {
  notifications: HeaderNotification[];
  inverted?: boolean;
  onNotificationClick?: (notification: HeaderNotification) => void;
  onMarkRead?: (id: string) => void;
  onMarkAllRead?: () => void;
  onDelete?: (id: string) => void;
  onSettings?: () => void;
  onNavigate?: (href: string) => void;
}

function EnhancedNotificationsPanel({
  notifications,
  inverted = true,
  onNotificationClick,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onSettings,
  onNavigate,
}: EnhancedNotificationsPanelProps) {
  const [activeCategory, setActiveCategory] = useState<NotificationCategory>("all");
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const unreadCount = notifications.filter(n => !n.read).length;

  // Filter by category
  const filteredNotifications = activeCategory === "all"
    ? notifications
    : notifications.filter(n => n.category === activeCategory);

  // Group notifications
  const groupedNotifications = groupNotifications(filteredNotifications);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const categories: { id: NotificationCategory; label: string; count: number }[] = [
    { id: "all", label: "All", count: notifications.length },
    { id: "mentions", label: "Mentions", count: notifications.filter(n => n.category === "mentions").length },
    { id: "updates", label: "Updates", count: notifications.filter(n => n.category === "updates").length },
    { id: "alerts", label: "Alerts", count: notifications.filter(n => n.category === "alerts").length },
  ];

  const trigger = (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={clsx(
        "relative p-2 rounded-button border-2 transition-all duration-100",
        inverted
          ? "border-transparent text-ink-400 hover:text-white hover:bg-ink-800 hover:border-ink-700"
          : "border-transparent text-ink-500 hover:text-ink-900 hover:bg-ink-100 hover:border-ink-200"
      )}
      aria-label="Notifications"
      aria-expanded={isOpen}
      aria-controls={isOpen ? panelId : undefined}
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-error-500 text-white text-[10px] font-bold rounded-full border-2 border-ink-950">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );

  return (
    <div ref={panelRef} className="relative">
      {trigger}
      
      {isOpen && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Notifications"
          className={clsx(
            "absolute right-0 top-full mt-2 w-[380px] max-h-[80vh] border-2 rounded-card overflow-hidden animate-pop-in z-dropdown",
            inverted
              ? "bg-ink-900 border-ink-700 shadow-[4px_4px_0_rgba(255,255,255,0.1)]"
              : "bg-white border-ink-200 shadow-[4px_4px_0_rgba(0,0,0,0.1)]"
          )}
        >
          {/* Header */}
          <div className={clsx(
            "flex items-center justify-between px-4 py-3 border-b-2",
            inverted ? "bg-ink-950 border-ink-700" : "bg-ink-50 border-ink-200"
          )}>
            <div className="flex items-center gap-2">
              <Bell size={18} className={inverted ? "text-white" : "text-ink-900"} />
              <span className={clsx("font-display text-sm font-bold", inverted ? "text-white" : "text-ink-900")}>
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 bg-error-500 text-white text-[10px] font-bold rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {onSettings && (
                <Tooltip content="Notification settings">
                  <button
                    type="button"
                    onClick={onSettings}
                    className={clsx(
                      "p-1.5 rounded transition-colors",
                      inverted ? "text-ink-400 hover:text-white" : "text-ink-500 hover:text-ink-900"
                    )}
                  >
                    <Settings size={14} />
                  </button>
                </Tooltip>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={clsx(
                  "p-1.5 rounded transition-colors",
                  inverted ? "text-ink-400 hover:text-white" : "text-ink-500 hover:text-ink-900"
                )}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className={clsx(
            "flex items-center gap-1 px-2 py-2 border-b-2 overflow-x-auto",
            inverted ? "border-ink-700" : "border-ink-200"
          )}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={clsx(
                  "flex items-center gap-1 px-2.5 py-1 rounded-button text-xs font-medium transition-all whitespace-nowrap",
                  activeCategory === cat.id
                    ? "bg-primary-500 text-white"
                    : inverted
                      ? "text-ink-400 hover:text-white hover:bg-ink-800"
                      : "text-ink-500 hover:text-ink-900 hover:bg-ink-100"
                )}
              >
                {cat.label}
                {cat.count > 0 && (
                  <span className={clsx(
                    "px-1 py-0.5 text-[9px] rounded",
                    activeCategory === cat.id
                      ? "bg-white/20"
                      : inverted ? "bg-ink-700" : "bg-ink-200"
                  )}>
                    {cat.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Actions Bar */}
          {filteredNotifications.length > 0 && (
            <div className={clsx(
              "flex items-center justify-between px-3 py-1.5 border-b",
              inverted ? "border-ink-800" : "border-ink-100"
            )}>
              {onMarkAllRead && unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllRead}
                  className="flex items-center gap-1 text-[11px] text-primary-500 hover:text-primary-400"
                >
                  <CheckCheck size={12} />
                  Mark all read
                </button>
              )}
              <span className={clsx("text-[10px]", inverted ? "text-ink-500" : "text-ink-400")}>
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[400px]">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell size={40} className={inverted ? "text-ink-600" : "text-ink-300"} />
                <p className={clsx("mt-3 text-sm font-medium", inverted ? "text-ink-400" : "text-ink-500")}>
                  No notifications
                </p>
                <p className={clsx("mt-1 text-xs", inverted ? "text-ink-500" : "text-ink-400")}>
                  You&apos;re all caught up!
                </p>
              </div>
            ) : (
              Array.from(groupedNotifications.entries()).map(([groupId, groupNotifs]) => {
                const isGrouped = groupNotifs.length > 1;
                const firstNotif = groupNotifs[0];

                return (
                  <div
                    key={groupId}
                    className={clsx(
                      "border-b last:border-b-0 transition-colors",
                      inverted ? "border-ink-800" : "border-ink-100",
                      !firstNotif.read && (inverted ? "bg-primary-500/5" : "bg-primary-50")
                    )}
                  >
                    <div
                      className={clsx(
                        "flex items-start gap-3 p-3 cursor-pointer transition-colors",
                        inverted ? "hover:bg-ink-800" : "hover:bg-ink-50"
                      )}
                      onClick={() => onNotificationClick?.(firstNotif)}
                    >
                      {/* Icon */}
                      <div className={clsx(
                        "flex-shrink-0 flex items-center justify-center size-8 rounded-full text-white",
                        notificationColors[firstNotif.type]
                      )}>
                        {notificationIcons[firstNotif.type]}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={clsx(
                            "text-sm line-clamp-2",
                            firstNotif.read
                              ? inverted ? "text-ink-400" : "text-ink-500"
                              : inverted ? "text-white font-medium" : "text-ink-900 font-medium"
                          )}>
                            {firstNotif.title}
                            {isGrouped && (
                              <span className={clsx(
                                "ml-1 text-xs",
                                inverted ? "text-ink-500" : "text-ink-400"
                              )}>
                                (+{groupNotifs.length - 1} more)
                              </span>
                            )}
                          </p>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                            {!firstNotif.read && onMarkRead && (
                              <Tooltip content="Mark as read">
                                <button
                                  type="button"
                                  onClick={() => onMarkRead(firstNotif.id)}
                                  className={clsx(
                                    "p-1 rounded transition-colors",
                                    inverted ? "text-ink-500 hover:text-white" : "text-ink-400 hover:text-ink-700"
                                  )}
                                >
                                  <Check size={12} />
                                </button>
                              </Tooltip>
                            )}
                            {onDelete && (
                              <Tooltip content="Delete">
                                <button
                                  type="button"
                                  onClick={() => onDelete(firstNotif.id)}
                                  className={clsx(
                                    "p-1 rounded transition-colors",
                                    inverted ? "text-ink-500 hover:text-error-400" : "text-ink-400 hover:text-error-500"
                                  )}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </Tooltip>
                            )}
                          </div>
                        </div>

                        {firstNotif.message && (
                          <p className={clsx(
                            "mt-0.5 text-xs line-clamp-2",
                            inverted ? "text-ink-500" : "text-ink-400"
                          )}>
                            {firstNotif.message}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={clsx("text-[10px]", inverted ? "text-ink-600" : "text-ink-400")}>
                            {formatRelativeTime(firstNotif.timestamp)}
                          </span>
                          {firstNotif.source && (
                            <span className={clsx(
                              "text-[10px] px-1 py-0.5 rounded",
                              inverted ? "bg-ink-800 text-ink-400" : "bg-ink-100 text-ink-500"
                            )}>
                              {firstNotif.source}
                            </span>
                          )}
                          {firstNotif.priority === "urgent" && (
                            <span className="px-1 py-0.5 bg-error-500 text-white text-[9px] font-bold rounded">
                              URGENT
                            </span>
                          )}
                          {firstNotif.priority === "high" && (
                            <span className="px-1 py-0.5 bg-warning-500 text-white text-[9px] font-bold rounded">
                              HIGH
                            </span>
                          )}
                          {firstNotif.actionLabel && (
                            <span className="flex items-center gap-0.5 text-[10px] text-primary-500">
                              {firstNotif.actionLabel}
                              <ChevronRight size={10} />
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Unread dot */}
                      {!firstNotif.read && (
                        <div className="flex-shrink-0 size-2 rounded-full bg-primary-500 mt-2" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className={clsx(
              "px-3 py-2 border-t-2 text-center",
              inverted ? "border-ink-700" : "border-ink-200"
            )}>
              <button
                type="button"
                onClick={() => {
                  onNavigate?.("/notifications");
                  setIsOpen(false);
                }}
                className="text-xs text-primary-500 hover:text-primary-400 font-medium"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// ENHANCED USER MENU
// =============================================================================

interface EnhancedUserMenuProps {
  user: HeaderUser;
  inverted?: boolean;
  theme?: ThemeMode;
  onNavigate?: (href: string) => void;
  onSignOut?: () => void;
  onStatusChange?: (status: UserStatus) => void;
  onThemeChange?: (theme: ThemeMode) => void;
  onKeyboardShortcuts?: () => void;
  settingsPath?: string;
}

function EnhancedUserMenu({
  user,
  inverted = true,
  theme = "system",
  onNavigate,
  onSignOut,
  onStatusChange,
  onThemeChange,
  onKeyboardShortcuts,
  settingsPath = "/settings",
}: EnhancedUserMenuProps) {
  const currentStatus = user.status || "online";

  const trigger = (
    <div
      className={clsx(
        "flex items-center gap-2 px-2 py-1.5 rounded-button border-2 transition-all cursor-pointer",
        inverted
          ? "border-transparent hover:border-ink-700 hover:bg-ink-800 text-ink-300 hover:text-white"
          : "border-transparent hover:border-ink-200 hover:bg-ink-50 text-ink-600 hover:text-ink-900"
      )}
    >
      <div className="relative">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="size-7 rounded-full border-2 border-ink-600 object-cover"
          />
        ) : (
          <div className={clsx(
            "size-7 rounded-full flex items-center justify-center text-xs font-bold border-2",
            inverted
              ? "bg-ink-700 border-ink-600 text-white"
              : "bg-ink-200 border-ink-300 text-ink-700"
          )}>
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        {/* Status indicator */}
        <div className={clsx(
          "absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2",
          inverted ? "border-ink-950" : "border-white",
          statusConfig[currentStatus].color
        )} />
      </div>
      <span className="hidden md:block text-sm font-medium truncate max-w-[100px]">
        {user.name}
      </span>
      <ChevronDown size={14} className={inverted ? "text-ink-500" : "text-ink-400"} />
    </div>
  );

  return (
    <Dropdown trigger={trigger} align="right" inverted={inverted} label="User menu">
      {/* User Info */}
      <div className={clsx(
        "px-4 py-3 border-b-2",
        inverted ? "border-ink-700" : "border-ink-200"
      )}>
        <div className={clsx("text-sm font-medium", inverted ? "text-white" : "text-ink-900")}>
          {user.name}
        </div>
        {user.email && (
          <div className={clsx("text-xs mt-0.5", inverted ? "text-ink-400" : "text-ink-500")}>
            {user.email}
          </div>
        )}
        {user.role && (
          <div className={clsx(
            "inline-block mt-2 px-2 py-0.5 text-[10px] font-medium rounded",
            inverted ? "bg-ink-800 text-ink-300" : "bg-ink-100 text-ink-600"
          )}>
            {user.role}
          </div>
        )}
      </div>

      {/* Status Selector */}
      {onStatusChange && (
        <div className={clsx("px-2 py-2 border-b-2", inverted ? "border-ink-700" : "border-ink-200")}>
          <div className={clsx("px-2 py-1 text-[10px] uppercase tracking-wider font-semibold", inverted ? "text-ink-500" : "text-ink-400")}>
            Status
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {(Object.keys(statusConfig) as UserStatus[]).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => onStatusChange(status)}
                className={clsx(
                  "flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-colors",
                  currentStatus === status
                    ? "bg-primary-500 text-white"
                    : inverted
                      ? "text-ink-300 hover:bg-ink-800"
                      : "text-ink-600 hover:bg-ink-100"
                )}
              >
                <span className={clsx("size-2 rounded-full", statusConfig[status].color)} />
                {statusConfig[status].label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Theme Selector */}
      {onThemeChange && (
        <div className={clsx("px-2 py-2 border-b-2", inverted ? "border-ink-700" : "border-ink-200")}>
          <div className={clsx("px-2 py-1 text-[10px] uppercase tracking-wider font-semibold", inverted ? "text-ink-500" : "text-ink-400")}>
            Theme
          </div>
          <div className="flex gap-1 mt-1">
            {[
              { id: "light" as ThemeMode, icon: <Sun size={14} />, label: "Light" },
              { id: "dark" as ThemeMode, icon: <Moon size={14} />, label: "Dark" },
              { id: "system" as ThemeMode, icon: <Monitor size={14} />, label: "System" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onThemeChange(t.id)}
                className={clsx(
                  "flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors flex-1 justify-center",
                  theme === t.id
                    ? "bg-primary-500 text-white"
                    : inverted
                      ? "text-ink-300 hover:bg-ink-800"
                      : "text-ink-600 hover:bg-ink-100"
                )}
              >
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu Items */}
      <DropdownItem inverted={inverted} onClick={() => onNavigate?.("/profile")}>
        <span className="flex items-center gap-2">
          <User size={16} />
          Profile
        </span>
      </DropdownItem>
      <DropdownItem inverted={inverted} onClick={() => onNavigate?.(settingsPath)}>
        <span className="flex items-center gap-2">
          <Settings size={16} />
          Settings
        </span>
      </DropdownItem>
      {onKeyboardShortcuts && (
        <DropdownItem inverted={inverted} onClick={onKeyboardShortcuts}>
          <span className="flex items-center justify-between w-full">
            <span className="flex items-center gap-2">
              <Keyboard size={16} />
              Keyboard Shortcuts
            </span>
            <kbd className={clsx(
              "text-[10px] px-1 py-0.5 rounded",
              inverted ? "bg-ink-800 text-ink-500" : "bg-ink-100 text-ink-400"
            )}>
              ?
            </kbd>
          </span>
        </DropdownItem>
      )}
      <DropdownItem inverted={inverted} onClick={() => onSignOut?.()}>
        <span className="flex items-center gap-2 text-error-500">
          <LogOut size={16} />
          Sign Out
        </span>
      </DropdownItem>
    </Dropdown>
  );
}

// =============================================================================
// BREADCRUMB COMPONENTS
// =============================================================================

function BreadcrumbSeparator({ inverted = true }: { inverted?: boolean }) {
  return (
    <span className={clsx("text-lg mx-0.5", inverted ? "text-ink-600" : "text-ink-300")}>
      /
    </span>
  );
}

interface BreadcrumbDropdownProps {
  item: BreadcrumbContextItem;
  options?: Array<{ id: string; name: string; status?: string; current?: boolean }>;
  inverted?: boolean;
  onSelect?: (id: string) => void;
  onNavigate?: (href: string) => void;
}

function BreadcrumbDropdown({ item, options = [], inverted = true, onSelect, onNavigate }: BreadcrumbDropdownProps) {
  const getIcon = () => {
    switch (item.type) {
      case "organization": return <Building2 size={14} />;
      case "project": return <FolderKanban size={14} />;
      case "production": return <FolderKanban size={14} />;
      case "event": return <FolderKanban size={14} />;
      case "team": return <Users size={14} />;
      case "workspace": return <Briefcase size={14} />;
      default: return <FolderKanban size={14} />;
    }
  };

  const getCreatePath = () => {
    switch (item.type) {
      case "organization": return "/organizations/new";
      case "project": return "/projects/new";
      case "production": return "/productions/new";
      case "event": return "/events/new";
      case "team": return "/teams/new";
      case "workspace": return "/workspaces/new";
      default: return "/";
    }
  };

  const trigger = (
    <div className={clsx(
      "flex items-center gap-1.5 px-2 py-1 rounded-button border-2 cursor-pointer transition-all text-sm",
      inverted
        ? "border-ink-700 hover:border-ink-600 text-white hover:bg-ink-800"
        : "border-ink-200 hover:border-ink-300 text-ink-900 hover:bg-ink-50"
    )}>
      <span className={inverted ? "text-ink-400" : "text-ink-500"}>{getIcon()}</span>
      <span className="font-medium max-w-[120px] truncate">{item.name}</span>
      <ChevronDown size={12} className={inverted ? "text-ink-500" : "text-ink-400"} />
    </div>
  );

  return (
    <Dropdown trigger={trigger} align="left" inverted={inverted}>
      {options.length > 0 && (
        <>
          <div className={clsx(
            "px-4 py-2 text-xs font-semibold uppercase tracking-wide",
            inverted ? "text-ink-400" : "text-ink-500"
          )}>
            {item.type === "organization" ? "Organizations" :
             item.type === "project" ? "Projects" :
             item.type === "production" ? "Productions" :
             item.type === "event" ? "Events" :
             item.type === "team" ? "Teams" : "Workspaces"}
          </div>
          {options.map((opt) => (
            <DropdownItem
              key={opt.id}
              inverted={inverted}
              onClick={() => onSelect?.(opt.id)}
            >
              <span className="flex items-center justify-between gap-2 w-full">
                <span className="flex items-center gap-2 truncate">
                  {getIcon()}
                  <span className="truncate">{opt.name}</span>
                </span>
                {opt.current && <Check size={14} className="text-success-500 shrink-0" />}
              </span>
            </DropdownItem>
          ))}
          <div className={clsx("border-t my-1", inverted ? "border-ink-700" : "border-ink-200")} />
        </>
      )}
      <DropdownItem inverted={inverted} onClick={() => onNavigate?.(getCreatePath())}>
        <span className="flex items-center gap-2 text-primary-400">
          <Plus size={14} />
          New {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
        </span>
      </DropdownItem>
    </Dropdown>
  );
}

interface HeaderBreadcrumbProps {
  breadcrumbContext?: BreadcrumbContextItem[];
  contextOptions?: ContextOptions;
  inverted?: boolean;
  onContextSwitch?: (type: BreadcrumbContextItem["type"], id: string) => void;
  onNavigate?: (href: string) => void;
}

function HeaderBreadcrumb({ breadcrumbContext = [], contextOptions, inverted = true, onContextSwitch, onNavigate }: HeaderBreadcrumbProps) {
  if (breadcrumbContext.length === 0) return null;

  const getOptionsForType = (type: BreadcrumbContextItem["type"]) => {
    switch (type) {
      case "organization": return contextOptions?.organizations || [];
      case "project": return contextOptions?.projects || [];
      case "production": return contextOptions?.productions || [];
      case "event": return contextOptions?.events || [];
      case "team": return contextOptions?.teams || [];
      case "workspace": return contextOptions?.workspaces || [];
      default: return [];
    }
  };

  return (
    <div className="flex items-center">
      {breadcrumbContext.map((item, index) => (
        <div key={item.id} className="flex items-center">
          {index > 0 && <BreadcrumbSeparator inverted={inverted} />}
          <BreadcrumbDropdown
            item={item}
            options={getOptionsForType(item.type)}
            inverted={inverted}
            onSelect={(id) => onContextSwitch?.(item.type, id)}
            onNavigate={onNavigate}
          />
        </div>
      ))}
    </div>
  );
}

// =============================================================================
// APP NAVBAR COMPONENT
// =============================================================================

export const AppNavbar = forwardRef<HTMLElement, AppNavbarProps>(
  function AppNavbar(
    {
      user,
      breadcrumbContext,
      contextOptions,
      notifications = [],
      quickActions = [],
      currentPath = "/",
      dashboardHref = "/dashboard",
      settingsPath = "/settings",
      helpPath = "/help",
      inverted = true,
      theme = "system",
      onNavigate,
      onSearch,
      onContextSwitch,
      onSignOut,
      onStatusChange,
      onThemeChange,
      onNotificationClick,
      onNotificationMarkRead,
      onNotificationMarkAllRead,
      onNotificationDelete,
      onNotificationSettings,
      onMobileMenuOpen,
      onKeyboardShortcuts,
      className,
    },
    ref
  ) {
    const isInNestedContext = breadcrumbContext && breadcrumbContext.length > 1;

    return (
      <header
        ref={ref}
        className={clsx(
          "flex items-center justify-between h-14 px-4 border-b-2 shrink-0",
          inverted ? "bg-ink-950 border-ink-800" : "bg-white border-ink-200",
          className
        )}
      >
        {/* Left Zone: Mobile menu + Back + Breadcrumbs */}
        <div className="flex items-center gap-2">
          {/* Mobile menu button */}
          {onMobileMenuOpen && (
            <button
              type="button"
              onClick={onMobileMenuOpen}
              className={clsx(
                "md:hidden p-2 rounded-button border-2 transition-colors",
                inverted
                  ? "border-ink-700 text-ink-300 hover:bg-ink-800 hover:text-white"
                  : "border-ink-200 text-ink-600 hover:bg-ink-100"
              )}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          )}

          {/* Back to Dashboard */}
          {isInNestedContext && (
            <Tooltip content="Back to Dashboard (Cmd+Shift+D)">
              <button
                type="button"
                onClick={() => onNavigate?.(dashboardHref)}
                className={clsx(
                  "hidden md:flex items-center gap-1 px-2 py-1 rounded-button text-xs font-medium transition-colors",
                  inverted
                    ? "text-ink-400 hover:text-white hover:bg-ink-800"
                    : "text-ink-500 hover:text-ink-900 hover:bg-ink-100"
                )}
              >
                <ArrowLeft size={14} />
                <span className="hidden lg:inline">Dashboard</span>
              </button>
            </Tooltip>
          )}

          {/* Breadcrumb Context */}
          <div className="hidden sm:block">
            <HeaderBreadcrumb
              breadcrumbContext={breadcrumbContext}
              contextOptions={contextOptions}
              inverted={inverted}
              onContextSwitch={onContextSwitch}
              onNavigate={onNavigate}
            />
          </div>
        </div>

        {/* Center Zone: Global Search */}
        <div className="flex-1 flex justify-center px-4">
          <GlobalSearchTrigger inverted={inverted} onClick={onSearch} />
        </div>

        {/* Right Zone: Quick Actions + Notifications + Help + Settings + User */}
        <div className="flex items-center gap-1">
          {/* Contextual Quick Actions */}
          <ContextualQuickActions
            actions={quickActions}
            currentPath={currentPath}
            inverted={inverted}
            onNavigate={onNavigate}
          />

          {/* Divider */}
          {quickActions.length > 0 && (
            <div className={clsx("hidden lg:block w-px h-6 mx-2", inverted ? "bg-ink-700" : "bg-ink-200")} />
          )}

          {/* Notifications */}
          <EnhancedNotificationsPanel
            notifications={notifications}
            inverted={inverted}
            onNotificationClick={onNotificationClick}
            onMarkRead={onNotificationMarkRead}
            onMarkAllRead={onNotificationMarkAllRead}
            onDelete={onNotificationDelete}
            onSettings={onNotificationSettings}
            onNavigate={onNavigate}
          />

          {/* Help */}
          <Tooltip content="Help & Support">
            <button
              type="button"
              onClick={() => onNavigate?.(helpPath)}
              className={clsx(
                "p-2 rounded-button border-2 transition-all duration-100",
                inverted
                  ? "border-transparent text-ink-400 hover:text-white hover:bg-ink-800 hover:border-ink-700"
                  : "border-transparent text-ink-500 hover:text-ink-900 hover:bg-ink-100 hover:border-ink-200"
              )}
              aria-label="Help"
            >
              <LifeBuoy size={20} />
            </button>
          </Tooltip>

          {/* Settings */}
          <Tooltip content="Settings">
            <button
              type="button"
              onClick={() => onNavigate?.(settingsPath)}
              className={clsx(
                "hidden sm:block p-2 rounded-button border-2 transition-all duration-100",
                inverted
                  ? "border-transparent text-ink-400 hover:text-white hover:bg-ink-800 hover:border-ink-700"
                  : "border-transparent text-ink-500 hover:text-ink-900 hover:bg-ink-100 hover:border-ink-200"
              )}
              aria-label="Settings"
            >
              <Settings size={20} />
            </button>
          </Tooltip>

          {/* User Menu */}
          {user && (
            <EnhancedUserMenu
              user={user}
              inverted={inverted}
              theme={theme}
              onNavigate={onNavigate}
              onSignOut={onSignOut}
              onStatusChange={onStatusChange}
              onThemeChange={onThemeChange}
              onKeyboardShortcuts={onKeyboardShortcuts}
              settingsPath={settingsPath}
            />
          )}
        </div>
      </header>
    );
  }
);

export default AppNavbar;
