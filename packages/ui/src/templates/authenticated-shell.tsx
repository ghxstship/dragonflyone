"use client";

import { forwardRef, useState, useEffect, useCallback, ReactNode } from "react";
import clsx from "clsx";
import { AppSidebar, MobileAppSidebar } from "../organisms/app-sidebar.js";
import type { SidebarNavSection, SidebarNavItem } from "../organisms/app-sidebar.js";
import { Dropdown, DropdownItem } from "../molecules/dropdown.js";
import { Menu, Search, Bell, Settings, ChevronDown, User, LogOut, Building2, Plus, Check, FolderKanban, Users, Briefcase, ArrowLeft, LifeBuoy } from "lucide-react";
import { AppNavbar } from "../organisms/app-navbar.js";
import type { 
  HeaderNotification, 
  UserStatus, 
  ThemeMode, 
  QuickAction as HeaderQuickAction,
  BreadcrumbContextItem,
  ContextOptions,
} from "../organisms/app-navbar.js";

// Re-export types for external use
export type { BreadcrumbContextItem, ContextOptions };

export type AuthenticatedShellProps = {
  children: ReactNode;
  /** Navigation sections for sidebar */
  navigation: SidebarNavSection[];
  /** Current active path */
  currentPath: string;
  /** Logo element */
  logo?: ReactNode;
  /** Workspace/org name for header - DEPRECATED: use breadcrumbContext instead */
  workspaceName?: string;
  /** Current breadcrumb context hierarchy: Organization > Project > Team > Workspace */
  breadcrumbContext?: BreadcrumbContextItem[];
  /** Available options for each context level */
  contextOptions?: ContextOptions;
  /** Callback when switching context at any level */
  onContextSwitch?: (type: BreadcrumbContextItem["type"], id: string) => void;
  /** User info for avatar/menu */
  user?: {
    name: string;
    email?: string;
    avatar?: string;
    status?: UserStatus;
    role?: string;
  };
  /** Quick action buttons for sidebar */
  quickActions?: Array<{ label: string; href: string; icon?: string; shortcut?: string }>;
  /** Header quick actions (contextual) */
  headerQuickActions?: HeaderQuickAction[];
  /** Favorites items */
  favorites?: SidebarNavItem[];
  /** Spaces/projects */
  spaces?: Array<{ id: string; name: string; color?: string; href: string }>;
  /** Recent pages section (last 5 visited) */
  recentPages?: SidebarNavItem[];
  /** Search component override */
  searchComponent?: ReactNode;
  /** Header actions (context switcher, etc.) - DEPRECATED: use breadcrumbContext instead */
  headerActions?: ReactNode;
  /** Dark mode */
  inverted?: boolean;
  /** Navigation callback */
  onNavigate?: (href: string) => void;
  /** Search callback - triggers command palette */
  onSearch?: (query: string) => void;
  /** Open global search/command palette */
  onSearchOpen?: () => void;
  /** Settings path */
  settingsPath?: string;
  /** Help path */
  helpPath?: string;
  /** Notifications - enhanced format */
  notifications?: HeaderNotification[];
  /** Legacy notifications format - DEPRECATED */
  legacyNotifications?: Array<{ id: string; title: string; message: string; time: string; read?: boolean }>;
  /** Available workspaces for switching - DEPRECATED: use contextOptions.organizations instead */
  workspaces?: Array<{ id: string; name: string; current?: boolean }>;
  /** Workspace switch callback - DEPRECATED: use onContextSwitch instead */
  onWorkspaceSwitch?: (workspaceId: string) => void;
  /** Sign out callback */
  onSignOut?: () => void;
  /** User roles for filtering navigation items */
  userRoles?: string[];
  /** Storage key prefix for persisting sidebar state */
  storageKey?: string;
  /** Current theme */
  theme?: ThemeMode;
  /** Theme change callback */
  onThemeChange?: (theme: ThemeMode) => void;
  /** User status change callback */
  onStatusChange?: (status: UserStatus) => void;
  /** Notification callbacks */
  onNotificationClick?: (notification: HeaderNotification) => void;
  onNotificationMarkRead?: (id: string) => void;
  onNotificationMarkAllRead?: () => void;
  onNotificationDelete?: (id: string) => void;
  onNotificationSettings?: () => void;
  /** Keyboard shortcuts modal callback */
  onKeyboardShortcuts?: () => void;
  /** Use enhanced header (default: true) */
  useEnhancedHeader?: boolean;
  /** Additional className */
  className?: string;
};

// =============================================================================
// LEGACY COMPONENTS - Used only when useEnhancedHeader=false
// These components are superseded by AppNavbar
// =============================================================================
function SearchInput({ 
  inverted = true,
  onSearch,
}: { 
  inverted?: boolean;
  onSearch?: (query: string) => void;
}) {
  return (
    <div className={clsx(
      "flex items-center gap-2 px-3 py-2 rounded border-2 transition-colors",
      inverted 
        ? "bg-ink-900 border-ink-700 text-ink-300 focus-within:border-ink-500" 
        : "bg-white border-ink-200 text-ink-600 focus-within:border-ink-400"
    )}>
      <Search size={16} className={inverted ? "text-ink-500" : "text-ink-400"} />
      <input
        type="text"
        placeholder="Search..."
        className={clsx(
          "flex-1 bg-transparent text-sm outline-none placeholder:text-ink-500",
          inverted ? "text-white" : "text-ink-900"
        )}
        onChange={(e) => onSearch?.(e.target.value)}
      />
      <kbd className={clsx(
        "hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono rounded",
        inverted ? "bg-ink-800 text-ink-400" : "bg-ink-100 text-ink-500"
      )}>
        ⌘K
      </kbd>
    </div>
  );
}

function UserMenu({ 
  user, 
  inverted = true,
  onNavigate,
  onSignOut,
  settingsPath = "/settings",
}: { 
  user?: AuthenticatedShellProps["user"];
  inverted?: boolean;
  onNavigate?: (href: string) => void;
  onSignOut?: () => void;
  settingsPath?: string;
}) {
  if (!user) return null;

  const trigger = (
    <div
      className={clsx(
        "flex items-center gap-2 px-2 py-1.5 rounded transition-colors cursor-pointer",
        inverted 
          ? "hover:bg-ink-800 text-ink-300 hover:text-white" 
          : "hover:bg-ink-100 text-ink-600 hover:text-ink-900"
      )}
    >
      {user.avatar ? (
        <img 
          src={user.avatar} 
          alt={user.name} 
          className="w-7 h-7 rounded-full border-2 border-ink-600"
        />
      ) : (
        <div className={clsx(
          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2",
          inverted 
            ? "bg-ink-700 border-ink-600 text-white" 
            : "bg-ink-200 border-ink-300 text-ink-700"
        )}>
          {user.name.charAt(0).toUpperCase()}
        </div>
      )}
      <span className="hidden md:block text-sm font-medium truncate max-w-[120px]">
        {user.name}
      </span>
      <ChevronDown size={14} className={inverted ? "text-ink-500" : "text-ink-400"} />
    </div>
  );
  
  return (
    <Dropdown trigger={trigger} align="right" inverted={inverted}>
      <div className={clsx(
        "px-4 py-3 border-b",
        inverted ? "border-ink-700" : "border-ink-200"
      )}>
        <div className={clsx("text-sm font-medium", inverted ? "text-white" : "text-ink-900")}>
          {user.name}
        </div>
        {user.email && (
          <div className={clsx("text-xs", inverted ? "text-ink-400" : "text-ink-500")}>
            {user.email}
          </div>
        )}
      </div>
      <DropdownItem 
        inverted={inverted}
        onClick={() => onNavigate?.("/profile")}
      >
        <span className="flex items-center gap-2">
          <User size={16} />
          Profile
        </span>
      </DropdownItem>
      <DropdownItem 
        inverted={inverted}
        onClick={() => onNavigate?.(settingsPath)}
      >
        <span className="flex items-center gap-2">
          <Settings size={16} />
          Settings
        </span>
      </DropdownItem>
      <DropdownItem 
        inverted={inverted}
        onClick={() => onSignOut?.()}
      >
        <span className="flex items-center gap-2 text-error-500">
          <LogOut size={16} />
          Sign Out
        </span>
      </DropdownItem>
    </Dropdown>
  );
}

function WorkspaceSelector({
  workspaceName,
  workspaces = [],
  inverted = true,
  onWorkspaceSwitch,
  onNavigate,
}: {
  workspaceName?: string;
  workspaces?: Array<{ id: string; name: string; current?: boolean }>;
  inverted?: boolean;
  onWorkspaceSwitch?: (workspaceId: string) => void;
  onNavigate?: (href: string) => void;
}) {
  if (!workspaceName) return null;

  const trigger = (
    <div className={clsx(
      "flex items-center gap-2 px-3 py-1.5 rounded border-2 cursor-pointer transition-colors",
      inverted 
        ? "border-ink-700 hover:border-ink-600 text-white hover:bg-ink-800" 
        : "border-ink-200 hover:border-ink-300 text-ink-900 hover:bg-ink-50"
    )}>
      <span className="text-sm font-semibold uppercase tracking-wide">{workspaceName}</span>
      <ChevronDown size={14} className={inverted ? "text-ink-500" : "text-ink-400"} />
    </div>
  );

  return (
    <Dropdown trigger={trigger} align="left" inverted={inverted}>
      {workspaces.length > 0 ? (
        <>
          <div className={clsx(
            "px-4 py-2 text-xs font-semibold uppercase tracking-wide",
            inverted ? "text-ink-400" : "text-ink-500"
          )}>
            Workspaces
          </div>
          {workspaces.map((ws) => (
            <DropdownItem
              key={ws.id}
              inverted={inverted}
              onClick={() => onWorkspaceSwitch?.(ws.id)}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <Building2 size={16} />
                  {ws.name}
                </span>
                {ws.current && <Check size={16} className="text-primary-500" />}
              </span>
            </DropdownItem>
          ))}
          <div className={clsx("border-t", inverted ? "border-ink-700" : "border-ink-200")} />
        </>
      ) : null}
      <DropdownItem
        inverted={inverted}
        onClick={() => onNavigate?.("/workspaces/new")}
      >
        <span className="flex items-center gap-2">
          <Plus size={16} />
          Create Workspace
        </span>
      </DropdownItem>
      <DropdownItem
        inverted={inverted}
        onClick={() => onNavigate?.("/workspaces")}
      >
        <span className="flex items-center gap-2">
          <Building2 size={16} />
          Manage Workspaces
        </span>
      </DropdownItem>
    </Dropdown>
  );
}

function BreadcrumbSeparator({ inverted = true }: { inverted?: boolean }) {
  return (
    <span className={clsx("text-lg mx-0.5", inverted ? "text-ink-600" : "text-ink-300")}>
      /
    </span>
  );
}

function BreadcrumbDropdown({
  item,
  options = [],
  inverted = true,
  onSelect,
  onNavigate,
}: {
  item: BreadcrumbContextItem;
  options?: Array<{ id: string; name: string; status?: string; current?: boolean }>;
  inverted?: boolean;
  onSelect?: (id: string) => void;
  onNavigate?: (href: string) => void;
}) {
  const getIcon = () => {
    switch (item.type) {
      case "organization":
        return <Building2 size={14} />;
      case "project":
        return <FolderKanban size={14} />;
      case "team":
        return <Users size={14} />;
      case "workspace":
        return <Briefcase size={14} />;
    }
  };

  const getCreatePath = (): string => {
    switch (item.type) {
      case "organization":
        return "/organizations/new";
      case "project":
      case "production":
        return "/projects/new";
      case "event":
        return "/events/new";
      case "team":
        return "/teams/new";
      case "workspace":
        return "/workspaces/new";
      default:
        return "/";
    }
  };

  const getManagePath = (): string => {
    switch (item.type) {
      case "organization":
        return "/organizations";
      case "project":
      case "production":
        return "/projects";
      case "event":
        return "/events";
      case "team":
        return "/teams";
      case "workspace":
        return "/workspaces";
      default:
        return "/";
    }
  };

  const trigger = (
    <div className={clsx(
      "flex items-center gap-1.5 px-2 py-1 rounded border-2 cursor-pointer transition-colors text-sm",
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
      <DropdownItem inverted={inverted} onClick={() => onNavigate?.(getManagePath())}>
        <span className="flex items-center gap-2">
          {getIcon()}
          Manage {item.type === "organization" ? "Organizations" : 
                  item.type === "project" ? "Projects" :
                  item.type === "team" ? "Teams" : "Workspaces"}
        </span>
      </DropdownItem>
    </Dropdown>
  );
}

function HeaderBreadcrumb({
  breadcrumbContext = [],
  contextOptions,
  inverted = true,
  onContextSwitch,
  onNavigate,
}: {
  breadcrumbContext?: BreadcrumbContextItem[];
  contextOptions?: ContextOptions;
  inverted?: boolean;
  onContextSwitch?: (type: BreadcrumbContextItem["type"], id: string) => void;
  onNavigate?: (href: string) => void;
}) {
  if (breadcrumbContext.length === 0) return null;

  const getOptionsForType = (type: BreadcrumbContextItem["type"]) => {
    switch (type) {
      case "organization":
        return contextOptions?.organizations || [];
      case "project":
        return contextOptions?.projects || [];
      case "team":
        return contextOptions?.teams || [];
      case "workspace":
        return contextOptions?.workspaces || [];
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

function NotificationsPanel({
  notifications = [],
  inverted = true,
  onNavigate,
}: {
  notifications?: Array<{ id: string; title: string; message: string; time: string; read?: boolean }>;
  inverted?: boolean;
  onNavigate?: (href: string) => void;
}) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const trigger = (
    <div
      className={clsx(
        "p-2 rounded transition-colors relative cursor-pointer",
        inverted 
          ? "text-ink-400 hover:text-white hover:bg-ink-800" 
          : "text-ink-500 hover:text-ink-900 hover:bg-ink-100"
      )}
      aria-label="Notifications"
    >
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error-500 rounded-full" />
      )}
    </div>
  );

  return (
    <Dropdown trigger={trigger} align="right" inverted={inverted}>
      <div className={clsx(
        "px-4 py-3 border-b flex items-center justify-between",
        inverted ? "border-ink-700" : "border-ink-200"
      )}>
        <span className={clsx("text-sm font-semibold", inverted ? "text-white" : "text-ink-900")}>
          Notifications
        </span>
        {unreadCount > 0 && (
          <span className="px-2 py-0.5 text-xs font-bold bg-error-500 text-white rounded-full">
            {unreadCount}
          </span>
        )}
      </div>
      {notifications.length > 0 ? (
        <div className="max-h-80 overflow-y-auto">
          {notifications.slice(0, 5).map((notification) => (
            <DropdownItem
              key={notification.id}
              inverted={inverted}
              onClick={() => onNavigate?.(`/notifications/${notification.id}`)}
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  {!notification.read && (
                    <span className="w-2 h-2 bg-primary-500 rounded-full shrink-0" />
                  )}
                  <span className={clsx(
                    "text-sm font-medium truncate",
                    inverted ? "text-white" : "text-ink-900"
                  )}>
                    {notification.title}
                  </span>
                </div>
                <span className={clsx(
                  "text-xs truncate",
                  inverted ? "text-ink-400" : "text-ink-500"
                )}>
                  {notification.message}
                </span>
                <span className={clsx(
                  "text-xs",
                  inverted ? "text-ink-500" : "text-ink-400"
                )}>
                  {notification.time}
                </span>
              </div>
            </DropdownItem>
          ))}
        </div>
      ) : (
        <div className={clsx(
          "px-4 py-8 text-center text-sm",
          inverted ? "text-ink-400" : "text-ink-500"
        )}>
          No notifications
        </div>
      )}
      <div className={clsx("border-t", inverted ? "border-ink-700" : "border-ink-200")} />
      <DropdownItem
        inverted={inverted}
        onClick={() => onNavigate?.("/notifications")}
      >
        <span className="text-center w-full text-primary-500 font-medium">
          View All Notifications
        </span>
      </DropdownItem>
    </Dropdown>
  );
}

// =============================================================================
// AUTHENTICATED SHELL COMPONENT
// =============================================================================

export const AuthenticatedShell = forwardRef<HTMLDivElement, AuthenticatedShellProps>(
  function AuthenticatedShell(
    {
      children,
      navigation,
      currentPath,
      logo,
      workspaceName,
      breadcrumbContext,
      contextOptions,
      onContextSwitch,
      user,
      quickActions,
      headerQuickActions = [],
      favorites,
      spaces,
      recentPages,
      searchComponent,
      headerActions,
      inverted = true,
      onNavigate,
      onSearch,
      onSearchOpen,
      settingsPath = "/settings",
      helpPath = "/help",
      notifications = [],
      legacyNotifications = [],
      workspaces = [],
      onWorkspaceSwitch,
      onSignOut,
      userRoles,
      storageKey,
      theme = "system",
      onThemeChange,
      onStatusChange,
      onNotificationClick,
      onNotificationMarkRead,
      onNotificationMarkAllRead,
      onNotificationDelete,
      onNotificationSettings,
      onKeyboardShortcuts,
      useEnhancedHeader = true,
      className,
    },
    ref
  ) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Determine if we're in a nested context (project/event level)
    const isInNestedContext = breadcrumbContext && breadcrumbContext.length > 1;
    const dashboardHref = breadcrumbContext?.[0]?.href || "/dashboard";

    // Keyboard shortcuts for context switching (Cmd+Shift+1-4)
    const handleKeyboardShortcuts = useCallback((event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Cmd+Shift+1-4 for context switching
      if ((event.metaKey || event.ctrlKey) && event.shiftKey) {
        const contextTypes: BreadcrumbContextItem["type"][] = ["organization", "project", "team", "workspace"];
        const keyNum = parseInt(event.key, 10);
        
        if (keyNum >= 1 && keyNum <= 4 && contextOptions && onContextSwitch) {
          event.preventDefault();
          const contextType = contextTypes[keyNum - 1];
          const options = contextOptions[`${contextType}s` as keyof ContextOptions] || contextOptions[contextType === "organization" ? "organizations" : `${contextType}s` as keyof ContextOptions];
          
          if (options && options.length > 0) {
            // Find the current item and switch to the next one
            const currentIndex = options.findIndex(o => o.current);
            const nextIndex = (currentIndex + 1) % options.length;
            onContextSwitch(contextType, options[nextIndex].id);
          }
        }
      }

      // Cmd+Shift+D for back to dashboard
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        onNavigate?.(dashboardHref);
      }
    }, [contextOptions, onContextSwitch, onNavigate, dashboardHref]);

    // Register keyboard shortcuts
    useEffect(() => {
      window.addEventListener('keydown', handleKeyboardShortcuts);
      return () => window.removeEventListener('keydown', handleKeyboardShortcuts);
    }, [handleKeyboardShortcuts]);

    // Sidebar footer with user info
    const sidebarFooter = user ? (
      <div className="flex items-center gap-2">
        {user.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.name} 
            className="w-8 h-8 rounded-full border-2 border-ink-600"
          />
        ) : (
          <div className={clsx(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2",
            inverted 
              ? "bg-ink-700 border-ink-600 text-white" 
              : "bg-ink-200 border-ink-300 text-ink-700"
          )}>
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        {!sidebarCollapsed && (
          <div className="flex-1 min-w-0">
            <div className={clsx("text-sm font-medium truncate", inverted ? "text-white" : "text-ink-900")}>
              {user.name}
            </div>
            {user.email && (
              <div className={clsx("text-xs truncate", inverted ? "text-ink-400" : "text-ink-500")}>
                {user.email}
              </div>
            )}
          </div>
        )}
      </div>
    ) : undefined;

    return (
      <div
        ref={ref}
        className={clsx(
          "flex h-screen overflow-hidden",
          inverted ? "bg-ink-950 text-white" : "bg-ink-50 text-ink-900",
          className
        )}
      >
        {/* Skip to main content link - visible on focus for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-skip-link focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-badge focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Skip to main content
        </a>
        {/* Desktop Sidebar */}
        <div className="hidden md:block shrink-0">
          <AppSidebar
            sections={navigation}
            currentPath={currentPath}
            logo={logo}
            search={searchComponent || <SearchInput inverted={inverted} onSearch={onSearch} />}
            quickActions={quickActions}
            favorites={favorites}
            spaces={spaces}
            recentPages={recentPages}
            footer={sidebarFooter}
            inverted={inverted}
            onNavigate={onNavigate}
            collapsed={sidebarCollapsed}
            onCollapse={setSidebarCollapsed}
            userRoles={userRoles}
            storageKey={storageKey}
            contextIndicator={
              isInNestedContext && breadcrumbContext?.[1]
                ? { name: breadcrumbContext[1].name }
                : undefined
            }
          />
        </div>

        {/* Mobile Sidebar */}
        <MobileAppSidebar
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          sections={navigation}
          currentPath={currentPath}
          logo={logo}
          search={searchComponent || <SearchInput inverted={inverted} onSearch={onSearch} />}
          quickActions={quickActions}
          favorites={favorites}
          spaces={spaces}
          recentPages={recentPages}
          footer={sidebarFooter}
          inverted={inverted}
          onNavigate={(href) => {
            onNavigate?.(href);
            setMobileMenuOpen(false);
          }}
          userRoles={userRoles}
          storageKey={storageKey}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Header Bar - Enhanced or Legacy */}
          {useEnhancedHeader ? (
            <AppNavbar
              user={user}
              breadcrumbContext={breadcrumbContext}
              contextOptions={contextOptions}
              notifications={notifications}
              quickActions={headerQuickActions}
              currentPath={currentPath}
              dashboardHref={dashboardHref}
              settingsPath={settingsPath}
              helpPath={helpPath}
              inverted={inverted}
              theme={theme}
              onNavigate={onNavigate}
              onSearch={onSearchOpen}
              onContextSwitch={onContextSwitch}
              onSignOut={onSignOut}
              onStatusChange={onStatusChange}
              onThemeChange={onThemeChange}
              onNotificationClick={onNotificationClick}
              onNotificationMarkRead={onNotificationMarkRead}
              onNotificationMarkAllRead={onNotificationMarkAllRead}
              onNotificationDelete={onNotificationDelete}
              onNotificationSettings={onNotificationSettings}
              onMobileMenuOpen={() => setMobileMenuOpen(true)}
              onKeyboardShortcuts={onKeyboardShortcuts}
            />
          ) : (
            <header className={clsx(
              "flex items-center justify-between h-14 px-4 border-b-2 shrink-0",
              inverted ? "bg-ink-950 border-ink-800" : "bg-white border-ink-200"
            )}>
              {/* Left: Mobile menu + Back to Dashboard + Breadcrumb context */}
              <div className="flex items-center gap-1">
                {/* Mobile menu button */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(true)}
                  className={clsx(
                    "md:hidden p-2 rounded border-2 transition-colors",
                    inverted 
                      ? "border-ink-700 text-ink-300 hover:bg-ink-800 hover:text-white" 
                      : "border-ink-200 text-ink-600 hover:bg-ink-100"
                  )}
                  aria-label="Open menu"
                >
                  <Menu size={20} />
                </button>
                
                {/* Back to Dashboard link when in nested context */}
                {isInNestedContext && (
                  <button
                    type="button"
                    onClick={() => onNavigate?.(dashboardHref)}
                    className={clsx(
                      "hidden md:flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors",
                      inverted 
                        ? "text-ink-400 hover:text-white hover:bg-ink-800" 
                        : "text-ink-500 hover:text-ink-900 hover:bg-ink-100"
                    )}
                    title="Back to Dashboard (Cmd+Shift+D)"
                  >
                    <ArrowLeft size={14} />
                    <span className="hidden lg:inline">Dashboard</span>
                  </button>
                )}
                
                {/* Breadcrumb context (Organization > Project > Team > Workspace) */}
                {breadcrumbContext && breadcrumbContext.length > 0 ? (
                  <div className="hidden sm:block">
                    <HeaderBreadcrumb
                      breadcrumbContext={breadcrumbContext}
                      contextOptions={contextOptions}
                      inverted={inverted}
                      onContextSwitch={onContextSwitch}
                      onNavigate={onNavigate}
                    />
                  </div>
                ) : (
                  <>
                    {/* Legacy: Workspace selector dropdown */}
                    <div className="hidden sm:block">
                      <WorkspaceSelector
                        workspaceName={workspaceName}
                        workspaces={workspaces}
                        inverted={inverted}
                        onWorkspaceSwitch={onWorkspaceSwitch}
                        onNavigate={onNavigate}
                      />
                    </div>
                    
                    {/* Legacy: Context switcher (production/project) */}
                    {headerActions && (
                      <>
                        <span className={clsx(
                          "hidden sm:block text-lg mx-1",
                          inverted ? "text-ink-600" : "text-ink-300"
                        )}>/</span>
                        <div className="hidden sm:block">
                          {headerActions}
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>

              {/* Right: Help + Notifications + Settings + User */}
              <div className="flex items-center gap-2">
                
                {/* Help */}
                <button
                  type="button"
                  onClick={() => onNavigate?.(helpPath)}
                  className={clsx(
                    "p-2 rounded transition-colors",
                    inverted 
                      ? "text-ink-400 hover:text-white hover:bg-ink-800" 
                      : "text-ink-500 hover:text-ink-900 hover:bg-ink-100"
                  )}
                  aria-label="Help"
                >
                  <LifeBuoy size={20} />
                </button>
                
                {/* Notifications dropdown */}
                <NotificationsPanel
                  notifications={legacyNotifications}
                  inverted={inverted}
                  onNavigate={onNavigate}
                />
                
                {/* Settings */}
                <button
                  type="button"
                  onClick={() => onNavigate?.(settingsPath)}
                  className={clsx(
                    "hidden sm:block p-2 rounded transition-colors",
                    inverted 
                      ? "text-ink-400 hover:text-white hover:bg-ink-800" 
                      : "text-ink-500 hover:text-ink-900 hover:bg-ink-100"
                  )}
                  aria-label="Settings"
                >
                  <Settings size={20} />
                </button>
                
                {/* User menu dropdown */}
                <UserMenu 
                  user={user} 
                  inverted={inverted}
                  onNavigate={onNavigate}
                  onSignOut={onSignOut}
                  settingsPath={settingsPath}
                />
              </div>
            </header>
          )}

          {/* Page Content */}
          <main 
            id="main-content"
            tabIndex={-1}
            className={clsx(
              "flex-1 overflow-auto",
              inverted ? "bg-ink-950" : "bg-ink-50"
            )}
          >
            {children}
          </main>
        </div>
      </div>
    );
  }
);

export default AuthenticatedShell;
