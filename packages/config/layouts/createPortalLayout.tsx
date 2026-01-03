/* eslint-disable react/forbid-elements -- Config package cannot import from UI to avoid circular dependency */
"use client";

import { ReactNode, useEffect, useState, ComponentType, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Authentication type for portal access
 */
export type PortalAuthType = "token" | "magic-link" | "public" | "session";

/**
 * Configuration for creating a portal layout.
 * Portal layouts are for external stakeholders (clients, vendors, etc.)
 * who access specific resources via tokens or magic links.
 */
export interface PortalLayoutConfig<V extends string = string> {
  /** Platform identifier */
  platform: "atlvs" | "compvss" | "gvteway";
  /** Authentication type for portal access */
  authType: PortalAuthType;
  /** Path to redirect when token is invalid/expired */
  invalidTokenPath: string;
  /** Background color class for loading states */
  backgroundClass: string;
  /** The app-specific layout component */
  LayoutComponent: ComponentType<{ children: ReactNode; variant?: V }>;
  /** The variant to pass to the layout component */
  layoutVariant: V;
  /** Optional token validation function */
  validateToken?: (token: string) => Promise<boolean>;
  /** Optional loading component */
  LoadingComponent?: ComponentType<{ text: string; backgroundClass: string }>;
}

/**
 * Props for the generated portal layout component
 */
interface PortalLayoutProps {
  children: ReactNode;
}

/**
 * Default loading component when no custom one is provided.
 */
function DefaultLoadingState({ text, backgroundClass }: { text: string; backgroundClass: string }) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${backgroundClass}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-avatar h-8 w-8 border-b-2 border-border" />
        <span className="text-text-disabled">{text}</span>
      </div>
    </div>
  );
}

/**
 * Factory function to create portal layout components for each app.
 * Portal layouts handle external stakeholder access with token-based or magic-link auth.
 * 
 * @param config - Configuration for the portal layout
 * @returns A React component that wraps children with portal authentication
 * 
 * @example
 * ```tsx
 * // In apps/atlvs/src/app/(portal)/layout.tsx
 * import { createPortalLayout } from "@ghxstship/config/layouts";
 * import { AtlvsAppLayout } from "../../components/app-layout";
 * 
 * export default createPortalLayout({
 *   platform: "atlvs",
 *   authType: "token",
 *   invalidTokenPath: "/portal/invalid",
 *   backgroundClass: "bg-surface-inverse",
 *   LayoutComponent: AtlvsAppLayout,
 *   layoutVariant: "portal",
 * });
 * ```
 */
/**
 * Inner component that uses useSearchParams (requires Suspense boundary)
 */
function PortalLayoutInner<V extends string>({
  children,
  authType,
  invalidTokenPath,
  backgroundClass,
  LayoutComponent,
  layoutVariant,
  validateToken,
  LoadingComponent,
}: PortalLayoutProps & {
  authType: PortalAuthType;
  invalidTokenPath: string;
  backgroundClass: string;
  LayoutComponent: ComponentType<{ children: ReactNode; variant?: V }>;
  layoutVariant: V;
  validateToken?: (token: string) => Promise<boolean>;
  LoadingComponent: ComponentType<{ text: string; backgroundClass: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isValidating, setIsValidating] = useState(authType !== "public");
  const [isValid, setIsValid] = useState(authType === "public");

  useEffect(() => {
    async function validateAccess() {
      // Public portals don't need validation
      if (authType === "public") {
        setIsValid(true);
        setIsValidating(false);
        return;
      }

      // Token-based validation
      if (authType === "token" || authType === "magic-link") {
        const token = searchParams.get("token");
        
        if (!token) {
          // Check if token is in the URL path (e.g., /invoices/[token])
          // This is handled by the page itself, so we allow access
          setIsValid(true);
          setIsValidating(false);
          return;
        }

        // If custom validation function provided, use it
        if (validateToken) {
          try {
            const valid = await validateToken(token);
            setIsValid(valid);
            if (!valid) {
              router.replace(invalidTokenPath);
            }
          } catch {
            setIsValid(false);
            router.replace(invalidTokenPath);
          }
        } else {
          // Default: assume token is valid if present
          setIsValid(true);
        }
      }

      // Session-based validation (uses existing auth)
      if (authType === "session") {
        // Session validation is handled by the page/middleware
        setIsValid(true);
      }

      setIsValidating(false);
    }

    validateAccess();
  }, [searchParams, router, authType, invalidTokenPath, validateToken]);

  // Loading state while validating
  if (isValidating) {
    return <LoadingComponent text="Verifying access..." backgroundClass={backgroundClass} />;
  }

  // Invalid access
  if (!isValid) {
    return <LoadingComponent text="Redirecting..." backgroundClass={backgroundClass} />;
  }

  // Render the portal layout with children
  return (
    <LayoutComponent variant={layoutVariant}>
      {children}
    </LayoutComponent>
  );
}

export function createPortalLayout<V extends string>(
  config: PortalLayoutConfig<V>
) {
  const {
    authType,
    invalidTokenPath,
    backgroundClass,
    LayoutComponent,
    layoutVariant,
    validateToken,
    LoadingComponent = DefaultLoadingState,
  } = config;

  return function PortalLayout({ children }: PortalLayoutProps) {
    return (
      <Suspense fallback={<LoadingComponent text="Loading..." backgroundClass={backgroundClass} />}>
        <PortalLayoutInner
          authType={authType}
          invalidTokenPath={invalidTokenPath}
          backgroundClass={backgroundClass}
          LayoutComponent={LayoutComponent}
          layoutVariant={layoutVariant}
          validateToken={validateToken}
          LoadingComponent={LoadingComponent}
        >
          {children}
        </PortalLayoutInner>
      </Suspense>
    );
  };
}
