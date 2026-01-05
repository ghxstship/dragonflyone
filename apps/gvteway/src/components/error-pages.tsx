"use client";

import { ErrorPage, ErrorContent, NotFoundPage } from "@ghxstship/ui";
import { errorConfig } from "@/config/error-config";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * AppErrorPage - Full page error with navigation
 * Use for root and layout-level error boundaries
 */
export function AppErrorPage({ error, reset }: ErrorProps) {
  return (
    <ErrorPage
      error={error}
      reset={reset}
      errorNavProps={{
        appName: errorConfig.appName,
        homePath: errorConfig.homePath,
        showDashboard: errorConfig.showDashboard,
        dashboardPath: errorConfig.dashboardPath,
        showSearch: errorConfig.showSearch,
        searchPath: errorConfig.searchPath,
      }}
      background={errorConfig.background}
      showDashboard={errorConfig.showDashboard}
      dashboardPath={errorConfig.dashboardPath}
      homePath={errorConfig.homePath}
      supportEmail={errorConfig.supportEmail}
    />
  );
}

/**
 * AppErrorContent - Error content without navigation wrapper
 * Use for global-error.tsx which needs to render its own html/body
 */
export function AppErrorContent({ error, reset }: ErrorProps) {
  return (
    <ErrorContent
      error={error}
      reset={reset}
      showDashboard={errorConfig.showDashboard}
      dashboardPath={errorConfig.dashboardPath}
      homePath={errorConfig.homePath}
      supportEmail={errorConfig.supportEmail}
    />
  );
}

/**
 * AppNotFoundPage - Full page 404 with navigation
 * Use for not-found.tsx
 */
export function AppNotFoundPage() {
  return (
    <NotFoundPage
      errorNavProps={{
        appName: errorConfig.appName,
        homePath: errorConfig.homePath,
        showDashboard: errorConfig.showDashboard,
        dashboardPath: errorConfig.dashboardPath,
        showSearch: errorConfig.showSearch,
        searchPath: errorConfig.searchPath,
      }}
      background={errorConfig.background}
      showDashboard={errorConfig.showDashboard}
      dashboardPath={errorConfig.dashboardPath}
      homePath={errorConfig.homePath}
      showSearch={errorConfig.showSearch}
      searchPath={errorConfig.searchPath}
      message={errorConfig.message}
    />
  );
}
