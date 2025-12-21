'use client';

/**
 * Gap 10 Remediation: Cross-App Navigation Component
 * Provides unified navigation for multi-app users
 */

import { useState, useRef, useEffect } from 'react';

export interface AppConfig {
  id: string;
  name: string;
  description: string;
  url: string;
  icon: React.ReactNode;
  color: string;
  requiredRoles?: string[];
}

export const PLATFORM_APPS: AppConfig[] = [
  {
    id: 'atlvs',
    name: 'ATLVS',
    description: 'Business Operations & Finance',
    url: process.env.NEXT_PUBLIC_ATLVS_URL || 'https://atlvs.ghxstship.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
      </svg>
    ),
    color: 'bg-primary',
    requiredRoles: ['ATLVS_SUPER_ADMIN', 'ATLVS_ADMIN', 'ATLVS_TEAM_MEMBER', 'ATLVS_VIEWER'],
  },
  {
    id: 'compvss',
    name: 'COMPVSS',
    description: 'Production & Event Operations',
    url: process.env.NEXT_PUBLIC_COMPVSS_URL || 'https://compvss.ghxstship.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
      </svg>
    ),
    color: 'bg-secondary',
    requiredRoles: ['COMPVSS_ADMIN', 'COMPVSS_TEAM_MEMBER', 'COMPVSS_COLLABORATOR', 'COMPVSS_VIEWER'],
  },
  {
    id: 'gvteway',
    name: 'GVTEWAY',
    description: 'Ticketing & Fan Experience',
    url: process.env.NEXT_PUBLIC_GVTEWAY_URL || 'https://gvteway.ghxstship.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M22 10V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-9 7.5h-2v-2h2v2zm0-4.5h-2v-2h2v2zm0-4.5h-2v-2h2v2z" />
      </svg>
    ),
    color: 'bg-accent',
    requiredRoles: ['GVTEWAY_ADMIN', 'GVTEWAY_EXPERIENCE_CREATOR', 'GVTEWAY_VENUE_MANAGER'],
  },
];

export interface AppSwitcherProps {
  currentAppId: string;
  userRoles: string[];
  onAppSelect?: (app: AppConfig) => void;
  className?: string;
}

export function AppSwitcher({
  currentAppId,
  userRoles,
  onAppSelect,
  className = '',
}: AppSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if user has Legend role (access to all apps)
  const isLegend = userRoles.some(role => role.startsWith('LEGEND_'));

  // Filter apps based on user roles
  const accessibleApps = PLATFORM_APPS.filter(app => {
    if (isLegend) return true;
    if (!app.requiredRoles) return true;
    return app.requiredRoles.some(role => userRoles.includes(role));
  });

  // Get current app
  const currentApp = PLATFORM_APPS.find(app => app.id === currentAppId);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle app selection
  const handleAppSelect = (app: AppConfig) => {
    if (app.id === currentAppId) {
      setIsOpen(false);
      return;
    }

    if (onAppSelect) {
      onAppSelect(app);
    } else {
      // Default behavior: navigate to app URL
      window.location.href = app.url;
    }

    setIsOpen(false);
  };

  // Don't render if user only has access to one app
  if (accessibleApps.length <= 1) {
    return null;
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-button border-2 border-ink-muted hover:border-primary transition-colors bg-surface-primary"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {currentApp && (
          <>
            <div className={`w-8 h-8 rounded-button ${currentApp.color} text-on-dark-primary flex items-center justify-center`}>
              {currentApp.icon}
            </div>
            <span className="font-weight-medium text-ink-primary hidden sm:inline">
              {currentApp.name}
            </span>
          </>
        )}
        <svg
          className={`w-4 h-4 text-ink-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-surface-primary border-2 border-ink-muted rounded-card shadow-lg z-dropdown overflow-hidden animate-pop-in">
          <div className="p-2">
            <div className="text-body-sm text-ink-secondary px-3 py-2 font-weight-medium">
              Switch Application
            </div>
            
            {accessibleApps.map(app => (
              <button
                key={app.id}
                onClick={() => handleAppSelect(app)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-button transition-colors ${
                  app.id === currentAppId
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'hover:bg-surface-secondary border-2 border-transparent'
                }`}
              >
                <div className={`w-10 h-10 rounded-button ${app.color} text-on-dark-primary flex items-center justify-center flex-shrink-0`}>
                  {app.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-weight-medium text-ink-primary flex items-center gap-2">
                    {app.name}
                    {app.id === currentAppId && (
                      <span className="text-body-sm text-primary">(Current)</span>
                    )}
                  </div>
                  <div className="text-body-sm text-ink-secondary">
                    {app.description}
                  </div>
                </div>
                {app.id !== currentAppId && (
                  <svg className="w-5 h-5 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {isLegend && (
            <div className="border-t-2 border-ink-muted p-2">
              <div className="px-3 py-2 text-body-sm text-ink-secondary">
                Legend Access: All applications available
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AppSwitcher;
