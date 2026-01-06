"use client";

import { ErrorPage, ErrorContent, NotFoundPage } from "@ghxstship/ui";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

interface ErrorConfig {
  appName: string;
  homePath: string;
  showDashboard: boolean;
  dashboardPath: string;
  showSearch: boolean;
  searchPath: string;
  background: string;
  supportEmail: string;
  message: string;
}

/**
 * createAppErrorComponents - Factory function using existing ErrorTemplate components
 * Eliminates duplication by providing configurable error components with existing templates
 */
export function createAppErrorComponents(config: ErrorConfig) {
  /**
   * AppErrorPage - Full page error with navigation using existing ErrorPage
   * Use for root and layout-level error boundaries
   */
  function AppErrorPage({ error, reset }: ErrorProps) {
    return (
      <ErrorPage
        error={error}
        reset={reset}
        errorNavProps={{
          appName: config.appName,
          homePath: config.homePath,
          showDashboard: config.showDashboard,
          dashboardPath: config.dashboardPath,
          showSearch: config.showSearch,
          searchPath: config.searchPath,
        }}
        background={config.background}
        showDashboard={config.showDashboard}
        dashboardPath={config.dashboardPath}
        homePath={config.homePath}
        supportEmail={config.supportEmail}
      />
    );
  }

  /**
   * AppErrorContent - Error content without navigation using existing ErrorContent
   * Use for global-error.tsx which needs to render its own html/body
   */
  function AppErrorContent({ error, reset }: ErrorProps) {
    return (
      <ErrorContent
        error={error}
        reset={reset}
        showDashboard={config.showDashboard}
        dashboardPath={config.dashboardPath}
        homePath={config.homePath}
        supportEmail={config.supportEmail}
      />
    );
  }

  /**
   * AppNotFoundPage - Full page 404 with navigation using existing NotFoundPage
   * Use for not-found.tsx
   */
  function AppNotFoundPage() {
    return (
      <NotFoundPage
        errorNavProps={{
          appName: config.appName,
          homePath: config.homePath,
          showDashboard: config.showDashboard,
          dashboardPath: config.dashboardPath,
          showSearch: config.showSearch,
          searchPath: config.searchPath,
        }}
        background={config.background}
        showDashboard={config.showDashboard}
        dashboardPath={config.dashboardPath}
        homePath={config.homePath}
        showSearch={config.showSearch}
        searchPath={config.searchPath}
        message={config.message}
      />
    );
  }

  return {
    AppErrorPage,
    AppErrorContent,
    AppNotFoundPage,
  };
}
