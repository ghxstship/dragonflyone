"use client";

import type { ReactNode } from "react";
import { Button } from "../../atoms/Button/index.js";
import { Container } from "../../foundations/layout.js";

export type { NotFoundPageProps, ErrorPageProps, ErrorContentProps };

interface NotFoundPageProps {
  navigation?: ReactNode;
  background?: string;
  showDashboard?: boolean;
  dashboardPath?: string;
  homePath?: string;
  showSearch?: boolean;
  searchPath?: string;
  message?: string;
}

export function NotFoundPage({
  navigation,
  background = "gradient",
  showDashboard = true,
  dashboardPath = "/dashboard",
  homePath = "/",
  showSearch = true,
  searchPath = "/search",
  message = "Page not found"
}: NotFoundPageProps) {
  return (
    <div className={`min-h-screen flex flex-col ${background === "gradient" ? "bg-gradient-to-br from-surface-primary to-surface-secondary" : "bg-surface-primary"}`}>
      {navigation}
      
      <Container className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-text-primary mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-text-primary mb-2">{message}</h2>
            <p className="text-text-muted">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" onClick={() => window.location.href = homePath}>
              Go Home
            </Button>
            
            {showDashboard && (
              <Button variant="outline" onClick={() => window.location.href = dashboardPath}>
                Dashboard
              </Button>
            )}
            
            {showSearch && (
              <Button variant="ghost" onClick={() => window.location.href = searchPath}>
                Search
              </Button>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

interface ErrorPageProps {
  error?: Error & { digest?: string };
  reset?: () => void;
  navigation?: ReactNode;
  appName?: string;
  background?: string;
  showDashboard?: boolean;
  dashboardPath?: string;
  homePath?: string;
  supportEmail?: string;
}

export function ErrorPage({
  error,
  reset,
  navigation,
  background = "gradient",
  showDashboard = true,
  dashboardPath = "/dashboard",
  homePath = "/",
  supportEmail = "support@example.com"
}: ErrorPageProps) {
  return (
    <div className={`min-h-screen flex flex-col ${background === "gradient" ? "bg-gradient-to-br from-surface-primary to-surface-secondary" : "bg-surface-primary"}`}>
      {navigation}
      
      <Container className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-text-primary mb-4">Error</h1>
            <h2 className="text-2xl font-semibold text-text-primary mb-2">Something went wrong</h2>
            <p className="text-text-muted mb-4">
              {error?.message || "An unexpected error occurred."}
            </p>
            {error?.digest && (
              <p className="text-text-disabled text-sm">
                Error ID: {error.digest}
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {reset && (
              <Button variant="primary" onClick={reset}>
                Try Again
              </Button>
            )}
            
            <Button variant="outline" onClick={() => window.location.href = homePath}>
              Go Home
            </Button>
            
            {showDashboard && (
              <Button variant="ghost" onClick={() => window.location.href = dashboardPath}>
                Dashboard
              </Button>
            )}
          </div>
          
          {supportEmail && (
            <p className="text-text-muted text-sm mt-6">
              If this problem persists, contact us at{" "}
              <a href={`mailto:${supportEmail}`} className="text-primary hover:underline">
                {supportEmail}
              </a>
            </p>
          )}
        </div>
      </Container>
    </div>
  );
}

interface ErrorContentProps {
  error?: Error & { digest?: string };
  reset?: () => void;
  appName?: string;
  showDashboard?: boolean;
  dashboardPath?: string;
  homePath?: string;
  supportEmail?: string;
}

export function ErrorContent({
  error,
  reset,
  showDashboard = true,
  dashboardPath = "/dashboard",
  homePath = "/",
  supportEmail = "support@example.com"
}: ErrorContentProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-primary">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-text-primary mb-4">Error</h1>
          <h2 className="text-2xl font-semibold text-text-primary mb-2">Something went wrong</h2>
          <p className="text-text-muted mb-4">
            {error?.message || "An unexpected error occurred."}
          </p>
          {error?.digest && (
            <p className="text-text-disabled text-sm">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {reset && (
            <Button variant="primary" onClick={reset}>
              Try Again
            </Button>
          )}
          
          <Button variant="outline" onClick={() => window.location.href = homePath}>
            Go Home
          </Button>
          
          {showDashboard && (
            <Button variant="ghost" onClick={() => window.location.href = dashboardPath}>
              Dashboard
            </Button>
          )}
        </div>
        
        {supportEmail && (
          <p className="text-text-muted text-sm mt-6">
            If this problem persists, contact us at{" "}
            <a href={`mailto:${supportEmail}`} className="text-primary hover:underline">
              {supportEmail}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
