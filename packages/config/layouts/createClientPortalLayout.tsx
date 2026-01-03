/* eslint-disable react/forbid-elements -- Config package cannot import from UI to avoid circular dependency */
"use client";

import { ReactNode, useEffect, useState, Suspense } from "react";
import type { ComponentType, SVGProps } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

/** Icon component type (compatible with Lucide icons) */
type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

/**
 * Navigation item for client portal
 */
export interface ClientPortalNavItem {
  id: string;
  label: string;
  icon: IconComponent;
  href: string;
  badge?: string | number;
  disabled?: boolean;
}

/**
 * Authentication type for client portal access
 */
export type ClientPortalAuthType = "token" | "magic-link" | "session";

/**
 * Configuration for creating a client portal layout.
 * Client portal layouts are for external stakeholders (clients, vendors, artists, etc.)
 * who have dashboard-style access with navigation.
 */
export interface ClientPortalLayoutConfig {
  /** Platform identifier */
  platform: "atlvs" | "compvss" | "gvteway";
  /** Authentication type for portal access */
  authType: ClientPortalAuthType;
  /** Path to redirect when token is invalid/expired */
  invalidTokenPath: string;
  /** Organization name to display */
  organizationName: string;
  /** Organization logo URL (optional) */
  organizationLogo?: string;
  /** Navigation items for the portal sidebar */
  navigationItems: ClientPortalNavItem[];
  /** Base path for the portal (e.g., "/portal/artists") */
  basePath: string;
  /** Dark/light theme */
  inverted?: boolean;
  /** The ClientPortalShell component from @ghxstship/ui */
  ClientPortalShellComponent: ComponentType<{
    organizationName: string;
    organizationLogo?: string;
    clientName: string;
    clientEmail?: string;
    activeRoute?: string;
    onNavigate?: (route: string) => void;
    onLogout?: () => void;
    children: ReactNode;
    navigationItems?: ClientPortalNavItem[];
    inverted?: boolean;
    loading?: boolean;
    loadingMessage?: string;
    error?: Error | null;
    onRetry?: () => void;
    offline?: boolean;
    restricted?: boolean;
    restrictedMessage?: string;
  }>;
  /** Optional token validation function */
  validateToken?: (token: string) => Promise<{ valid: boolean; clientName?: string; clientEmail?: string }>;
  /** Optional loading component for initial validation */
  LoadingComponent?: ComponentType<{ text: string }>;
  /** Logout handler */
  onLogout?: () => void;
}

/**
 * Props for the generated client portal layout component
 */
interface ClientPortalLayoutProps {
  children: ReactNode;
}

/**
 * Default loading component
 */
function DefaultLoadingState({ text }: { text: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-inverse">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-avatar h-8 w-8 border-b-2 border-border" />
        <span className="text-text-disabled">{text}</span>
      </div>
    </div>
  );
}

/**
 * Inner component that uses useSearchParams (requires Suspense boundary)
 */
function ClientPortalLayoutInner({
  children,
  config,
}: ClientPortalLayoutProps & { config: ClientPortalLayoutConfig }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [clientInfo, setClientInfo] = useState<{ name: string; email?: string }>({
    name: "Client",
  });
  const [error, setError] = useState<Error | null>(null);

  const {
    authType,
    invalidTokenPath,
    organizationName,
    organizationLogo,
    navigationItems,
    basePath,
    inverted = true,
    ClientPortalShellComponent,
    validateToken,
    onLogout,
  } = config;

  // Determine active route from pathname
  const activeRoute = navigationItems.find(item => pathname === item.href)?.id || navigationItems[0]?.id;

  useEffect(() => {
    async function validateAccess() {
      try {
        // Token-based validation
        if (authType === "token" || authType === "magic-link") {
          const token = searchParams.get("token");
          
          if (!token) {
            // Check localStorage for stored token
            const storedToken = typeof window !== "undefined" 
              ? localStorage.getItem(`portal_token_${basePath}`) 
              : null;
            
            if (!storedToken) {
              setIsValid(false);
              setIsValidating(false);
              router.replace(invalidTokenPath);
              return;
            }
          } else {
            // Store token for future visits
            if (typeof window !== "undefined") {
              localStorage.setItem(`portal_token_${basePath}`, token);
            }
          }

          // If custom validation function provided, use it
          if (validateToken) {
            const tokenToValidate = token || localStorage.getItem(`portal_token_${basePath}`) || "";
            const result = await validateToken(tokenToValidate);
            setIsValid(result.valid);
            if (result.valid) {
              setClientInfo({
                name: result.clientName || "Client",
                email: result.clientEmail,
              });
            } else {
              router.replace(invalidTokenPath);
            }
          } else {
            // Default: assume token is valid if present
            setIsValid(true);
          }
        }

        // Session-based validation
        if (authType === "session") {
          // Session validation is handled by middleware/auth context
          setIsValid(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Validation failed"));
        setIsValid(false);
      }

      setIsValidating(false);
    }

    validateAccess();
  }, [searchParams, router, authType, invalidTokenPath, basePath, validateToken]);

  // Handle navigation
  const handleNavigate = (href: string) => {
    router.push(href);
  };

  // Handle logout
  const handleLogout = () => {
    // Clear stored token
    if (typeof window !== "undefined") {
      localStorage.removeItem(`portal_token_${basePath}`);
    }
    onLogout?.();
    router.replace(invalidTokenPath);
  };

  // Loading state while validating
  if (isValidating) {
    return (
      <ClientPortalShellComponent
        organizationName={organizationName}
        organizationLogo={organizationLogo}
        clientName="Loading..."
        navigationItems={navigationItems}
        inverted={inverted}
        loading={true}
        loadingMessage="Verifying access..."
      >
        <div />
      </ClientPortalShellComponent>
    );
  }

  // Error state
  if (error) {
    return (
      <ClientPortalShellComponent
        organizationName={organizationName}
        organizationLogo={organizationLogo}
        clientName="Error"
        navigationItems={navigationItems}
        inverted={inverted}
        error={error}
        onRetry={() => window.location.reload()}
      >
        <div />
      </ClientPortalShellComponent>
    );
  }

  // Invalid/restricted access
  if (!isValid) {
    return (
      <ClientPortalShellComponent
        organizationName={organizationName}
        organizationLogo={organizationLogo}
        clientName="Access Denied"
        navigationItems={navigationItems}
        inverted={inverted}
        restricted={true}
        restrictedMessage="Your access link has expired or is invalid. Please request a new link."
      >
        <div />
      </ClientPortalShellComponent>
    );
  }

  // Render the client portal shell with children
  return (
    <ClientPortalShellComponent
      organizationName={organizationName}
      organizationLogo={organizationLogo}
      clientName={clientInfo.name}
      clientEmail={clientInfo.email}
      activeRoute={activeRoute}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      navigationItems={navigationItems}
      inverted={inverted}
    >
      {children}
    </ClientPortalShellComponent>
  );
}

/**
 * Factory function to create client portal layout components.
 * Client portal layouts provide a full dashboard experience for external stakeholders
 * with navigation, branding, and authentication handling.
 * 
 * @param config - Configuration for the client portal layout
 * @returns A React component that wraps children with client portal shell
 * 
 * @example
 * ```tsx
 * // In apps/atlvs/src/app/(portal)/artists/layout.tsx
 * import { createClientPortalLayout } from "@ghxstship/config/layouts";
 * import { ClientPortalShell } from "@ghxstship/ui";
 * import { Home, Calendar, FileText, CreditCard } from "lucide-react";
 * 
 * export default createClientPortalLayout({
 *   platform: "atlvs",
 *   authType: "token",
 *   invalidTokenPath: "/portal/invalid",
 *   organizationName: "ATLVS",
 *   basePath: "/portal/artists",
 *   navigationItems: [
 *     { id: "dashboard", label: "Dashboard", icon: Home, href: "/portal/artists" },
 *     { id: "events", label: "My Events", icon: Calendar, href: "/portal/artists/events" },
 *     { id: "contracts", label: "Contracts", icon: FileText, href: "/portal/artists/contracts" },
 *     { id: "payments", label: "Payments", icon: CreditCard, href: "/portal/artists/payments" },
 *   ],
 *   ClientPortalShellComponent: ClientPortalShell,
 * });
 * ```
 */
export function createClientPortalLayout(config: ClientPortalLayoutConfig) {
  const { LoadingComponent = DefaultLoadingState } = config;

  return function ClientPortalLayout({ children }: ClientPortalLayoutProps) {
    return (
      <Suspense fallback={<LoadingComponent text="Loading portal..." />}>
        <ClientPortalLayoutInner config={config}>
          {children}
        </ClientPortalLayoutInner>
      </Suspense>
    );
  };
}
