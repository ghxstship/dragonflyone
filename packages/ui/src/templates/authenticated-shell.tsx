"use client";

import { forwardRef, useState, ReactNode } from "react";
import clsx from "clsx";
import { AppSidebar, MobileAppSidebar } from "../organisms/app-sidebar.js";
import type { SidebarNavSection, SidebarNavItem } from "../organisms/app-sidebar.js";
import { Dropdown, DropdownItem } from "../molecules/dropdown.js";
import { Menu, Search, Bell, Settings, ChevronDown, User, LogOut, Building2, Plus, Check } from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

export type AuthenticatedShellProps = {
  children: ReactNode;
  /** Navigation sections for sidebar */
  navigation: SidebarNavSection[];
  /** Current active path */
  currentPath: string;
  /** Logo element */
  logo?: ReactNode;
  /** Workspace/org name for header */
  workspaceName?: string;
  /** User info for avatar/menu */
  user?: {
    name: string;
    email?: string;
    avatar?: string;
  };
  /** Quick action buttons */
  quickActions?: Array<{ label: string; href: string; icon?: string; shortcut?: string }>;
  /** Favorites items */
  favorites?: SidebarNavItem[];
  /** Spaces/projects */
  spaces?: Array<{ id: string; name: string; color?: string; href: string }>;
  /** Search component override */
  searchComponent?: ReactNode;
  /** Header actions (notifications, settings, etc.) */
  headerActions?: ReactNode;
  /** Dark mode */
  inverted?: boolean;
  /** Navigation callback */
  onNavigate?: (href: string) => void;
  /** Search callback */
  onSearch?: (query: string) => void;
  /** Settings path */
  settingsPath?: string;
  /** Notifications */
  notifications?: Array<{ id: string; title: string; message: string; time: string; read?: boolean }>;
  /** Available workspaces for switching */
  workspaces?: Array<{ id: string; name: string; current?: boolean }>;
  /** Workspace switch callback */
  onWorkspaceSwitch?: (workspaceId: string) => void;
  /** Sign out callback */
  onSignOut?: () => void;
  /** Additional className */
  className?: string;
};

// =============================================================================
// SEARCH INPUT COMPONENT
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

// =============================================================================
// USER MENU COMPONENT
// =============================================================================

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

// =============================================================================
// WORKSPACE SELECTOR COMPONENT
// =============================================================================

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

// =============================================================================
// NOTIFICATIONS PANEL COMPONENT
// =============================================================================

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
      user,
      quickActions,
      favorites,
      spaces,
      searchComponent,
      headerActions,
      inverted = true,
      onNavigate,
      onSearch,
      settingsPath = "/settings",
      notifications = [],
      workspaces = [],
      onWorkspaceSwitch,
      onSignOut,
      className,
    },
    ref
  ) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            footer={sidebarFooter}
            inverted={inverted}
            onNavigate={onNavigate}
            collapsed={sidebarCollapsed}
            onCollapse={setSidebarCollapsed}
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
          footer={sidebarFooter}
          inverted={inverted}
          onNavigate={(href) => {
            onNavigate?.(href);
            setMobileMenuOpen(false);
          }}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Header Bar */}
          <header className={clsx(
            "flex items-center justify-between h-14 px-4 border-b-2 shrink-0",
            inverted ? "bg-ink-950 border-ink-800" : "bg-white border-ink-200"
          )}>
            {/* Left: Mobile menu + Workspace */}
            <div className="flex items-center gap-3">
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
              
              {/* Workspace selector dropdown */}
              <div className="hidden sm:block">
                <WorkspaceSelector
                  workspaceName={workspaceName}
                  workspaces={workspaces}
                  inverted={inverted}
                  onWorkspaceSwitch={onWorkspaceSwitch}
                  onNavigate={onNavigate}
                />
              </div>
            </div>

            {/* Right: Actions + User */}
            <div className="flex items-center gap-2">
              {/* Custom header actions */}
              {headerActions}
              
              {/* Notifications dropdown */}
              <NotificationsPanel
                notifications={notifications}
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

          {/* Page Content */}
          <main className={clsx(
            "flex-1 overflow-auto",
            inverted ? "bg-ink-950" : "bg-ink-50"
          )}>
            {children}
          </main>
        </div>
      </div>
    );
  }
);

export default AuthenticatedShell;
