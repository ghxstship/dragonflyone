"use client";

import { forwardRef, useState, useCallback } from "react";
import clsx from "clsx";
import {
  Search,
  Bell,
  Settings,
  ChevronDown,
  User,
  LogOut,
  Moon,
  Sun,
  Monitor,
  Menu,
  X,
} from "lucide-react";
import { appNavbarVariants, navItemVariants, notificationVariants } from "./AppNavbar.variants.js";
import type { AppNavbarProps } from "./AppNavbar.types.js";

/**
 * AppNavbar component - Main navigation bar for authenticated applications
 * 
 * @example
 * ```tsx
 * <AppNavbar
 *   user={userProfile}
 *   notifications={notifications}
 *   showSearch={true}
 *   sticky={true}
 *   onSearchSubmit={(query) => console.log(query)}
 * />
 * ```
 */
export const AppNavbar = forwardRef<HTMLElement, AppNavbarProps>(
  function AppNavbar({
    items = [],
    user,
    notifications = [],
    showSearch = true,
    searchPlaceholder = "Search...",
    searchValue = "",
    onSearchChange,
    onSearchSubmit,
    showThemeToggle = true,
    theme = "system",
    onThemeChange,
    showMobileMenu = true,
    mobileMenuOpen = false,
    onMobileMenuToggle,
    logo,
    actions,
    sticky = true,
    inverted = false,
    compact = false,
    className,
    ...props
  }, ref) {
    const [searchInput, setSearchInput] = useState(searchValue);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleSearchSubmit = useCallback((e: React.FormEvent) => {
      e.preventDefault();
      onSearchSubmit?.(searchInput);
    }, [searchInput, onSearchSubmit]);

    const handleThemeToggle = useCallback(() => {
      const themes: Array<"light" | "dark" | "system"> = ["light", "dark", "system"];
      const currentIndex = themes.indexOf(theme);
      const nextTheme = themes[(currentIndex + 1) % themes.length];
      onThemeChange?.(nextTheme);
    }, [theme, onThemeChange]);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
      <header
        ref={ref}
        className={clsx(appNavbarVariants({ sticky, inverted, compact, className }))}
        {...props}
      >
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          {showMobileMenu && (
            <button
              onClick={() => onMobileMenuToggle?.(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-surface-secondary transition-colors md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          {/* Logo */}
          {logo && (
            <div className="flex-shrink-0">
              {logo}
            </div>
          )}

          {/* Navigation Items */}
          {items.length > 0 && (
            <nav className="hidden md:flex items-center gap-1">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={item.onClick}
                  disabled={item.disabled}
                  className={clsx(navItemVariants({
                    active: item.active,
                    disabled: item.disabled,
                    inverted,
                  }))}
                >
                  {item.icon}
                  {item.label}
                  {item.badge && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          )}
        </div>

        {/* Center Section - Search */}
        {showSearch && (
          <div className="flex-1 max-w-md mx-4">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  onSearchChange?.(e.target.value);
                }}
                placeholder={searchPlaceholder}
                className={clsx(
                  "w-full pl-10 pr-4 py-2 rounded-lg border transition-colors",
                  "bg-surface-secondary border-border text-text-primary",
                  "placeholder:text-text-muted",
                  "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                )}
              />
            </form>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Actions */}
          {actions}

          {/* Theme Toggle */}
          {showThemeToggle && (
            <button
              onClick={handleThemeToggle}
              className="p-2 rounded-lg hover:bg-surface-secondary transition-colors"
              title={`Current theme: ${theme}`}
            >
              {theme === "light" && <Sun className="w-4 h-4" />}
              {theme === "dark" && <Moon className="w-4 h-4" />}
              {theme === "system" && <Monitor className="w-4 h-4" />}
            </button>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 rounded-lg hover:bg-surface-secondary transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <>
                <div className="fixed inset-0 z-50" onClick={() => setNotificationsOpen(false)} />
                <div className="absolute top-full right-0 mt-2 w-80 bg-surface-elevated border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
                  <div className="p-4 border-b border-border">
                    <h3 className="font-semibold">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-text-muted">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={clsx(notificationVariants({
                            type: notification.type,
                            read: notification.read,
                          }))}
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{notification.title}</p>
                            {notification.description && (
                              <p className="text-xs text-text-muted mt-1">{notification.description}</p>
                            )}
                            <p className="text-xs text-text-disabled mt-1">
                              {notification.timestamp.toLocaleDateString()}
                            </p>
                          </div>
                          {notification.action && (
                            <button
                              onClick={notification.action.onClick}
                              className="text-xs px-2 py-1 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
                            >
                              {notification.action.label}
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-secondary transition-colors"
              >
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white">
                  {user.avatar ? (
                    <div className="w-full h-full rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${user.avatar})` }} />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-50" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute top-full right-0 mt-2 w-56 bg-surface-elevated border border-border rounded-lg shadow-lg z-50">
                    <div className="p-4 border-b border-border">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-text-muted">{user.email}</p>
                      {user.role && (
                        <p className="text-xs text-text-disabled mt-1">{user.role}</p>
                      )}
                    </div>
                    <div className="py-2">
                      <button className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-surface-secondary transition-colors">
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      <button className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-surface-secondary transition-colors text-error-600">
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>
    );
  }
);

export default AppNavbar;
