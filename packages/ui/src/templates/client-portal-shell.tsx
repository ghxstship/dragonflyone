"use client";

import React from "react";
import {
  Home,
  Calendar,
  FileText,
  CreditCard,
  MessageSquare,
  LogOut,
  ChevronRight,
  User,
} from "lucide-react";
import clsx from "clsx";

export interface ClientPortalShellProps {
  organizationName: string;
  organizationLogo?: string;
  clientName: string;
  clientEmail?: string;
  activeRoute?: string;
  onNavigate?: (route: string) => void;
  onLogout?: () => void;
  children: React.ReactNode;
  className?: string;
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Home, href: "/client-portal" },
  { id: "events", label: "My Events", icon: Calendar, href: "/client-portal/events" },
  { id: "documents", label: "Documents", icon: FileText, href: "/client-portal/documents" },
  { id: "invoices", label: "Invoices", icon: CreditCard, href: "/client-portal/invoices" },
  { id: "messages", label: "Messages", icon: MessageSquare, href: "/client-portal/messages" },
];

export function ClientPortalShell({
  organizationName,
  organizationLogo,
  clientName,
  clientEmail,
  activeRoute = "dashboard",
  onNavigate,
  onLogout,
  children,
  className,
}: ClientPortalShellProps) {
  return (
    <div className={clsx("min-h-screen bg-muted/30", className)}>
      {/* Header */}
      <header className="bg-background border-b-2 border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Organization */}
            <div className="flex items-center gap-3">
              {organizationLogo ? (
                <img
                  src={organizationLogo}
                  alt={organizationName}
                  className="h-8 w-auto"
                />
              ) : (
                <div className="h-8 w-8 bg-primary rounded-badge flex items-center justify-center">
                  <span className="text-primary-foreground font-weight-bold text-body-sm">
                    {organizationName.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <p className="text-body-sm font-weight-semibold">{organizationName}</p>
                <p className="text-body-xs text-muted-foreground">Client Portal</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-body-sm font-weight-medium">{clientName}</p>
                {clientEmail && (
                  <p className="text-body-xs text-muted-foreground">{clientEmail}</p>
                )}
              </div>
              <div className="h-9 w-9 bg-muted rounded-avatar flex items-center justify-center">
                <User className="h-5 w-5 text-muted-foreground" />
              </div>
              <button
                onClick={onLogout}
                className="p-2 hover:bg-muted rounded-button transition-colors text-muted-foreground hover:text-foreground"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <aside className="w-56 flex-shrink-0 hidden lg:block">
            <nav className="bg-background border-2 border-border rounded-card p-2 sticky top-24">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => onNavigate?.(item.href)}
                      className={clsx(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-button transition-colors text-left",
                        activeRoute === item.id
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-body-sm">{item.label}</span>
                      {activeRoute === item.id && (
                        <ChevronRight className="h-4 w-4 ml-auto" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Mobile Navigation */}
          <nav className="lg:hidden mb-4 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate?.(item.href)}
                  className={clsx(
                    "flex items-center gap-2 px-3 py-2 rounded-button transition-colors whitespace-nowrap",
                    activeRoute === item.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border-2 border-border hover:bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-body-sm">{item.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t-2 border-border bg-background py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-body-xs text-muted-foreground">
              © {new Date().getFullYear()} {organizationName}. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <button className="text-body-xs text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </button>
              <button className="text-body-xs text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </button>
              <button className="text-body-xs text-muted-foreground hover:text-foreground transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default ClientPortalShell;
